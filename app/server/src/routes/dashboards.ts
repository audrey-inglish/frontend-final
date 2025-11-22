import express from "express";
import { db } from "../db";
import { ensureUserId } from "../utils/user";
import {
  DashboardCreateSchema,
  DashboardUpdateSchema,
  DashboardSchema,
  DashboardsListResponseSchema,
  DashboardSingleResponseSchema,
} from "../schemas/dashboard";

const router = express.Router();

// List dashboards for current user
router.get("/", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const dashboards = await db.any(
      `SELECT id, title, description, created_at, updated_at FROM dashboard WHERE user_id = $1 ORDER BY id DESC`,
      [userId]
    );
    const parsed = DashboardsListResponseSchema.safeParse({ dashboards });
    if (!parsed.success) {
      console.error("Validation error for dashboards list:", parsed.error.format());
      return res.status(500).json({ error: "Invalid data from database" });
    }
    res.json(parsed.data);
  } catch (err) {
    console.error("GET /api/dashboards error:", err);
    res.status(500).json({ error: "Failed to list dashboards" });
  }
});

// Get single dashboard
router.get("/:id", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const id = Number(req.params.id);
    const dash = await db.oneOrNone(
      `SELECT id, title, description, created_at, updated_at FROM dashboard WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (!dash) return res.status(404).json({ error: "Not found" });
    const parsed = DashboardSingleResponseSchema.safeParse({ dashboard: dash });
    if (!parsed.success) {
      console.error("Validation error for dashboard:", parsed.error.format());
      return res.status(500).json({ error: "Invalid data from database" });
    }
    res.json(parsed.data);
  } catch (err) {
    console.error("GET /api/dashboards/:id error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

// Get dashboard statistics
router.get("/:id/stats", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const dashboardId = Number(req.params.id);

    // Verify dashboard belongs to user
    const dashboard = await db.oneOrNone(
      `SELECT id FROM dashboard WHERE id = $1 AND user_id = $2`,
      [dashboardId, userId]
    );
    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard not found" });
    }

    // Get quiz statistics
    const quizStats = await db.oneOrNone(
      `SELECT 
        COUNT(*)::int as total_quizzes,
        COALESCE(AVG(score), 0)::float as average_score,
        COALESCE(MAX(score), 0)::float as highest_score,
        COALESCE(MIN(score), 0)::float as lowest_score
       FROM quiz 
       WHERE dashboard_id = $1 AND score IS NOT NULL`,
      [dashboardId]
    );

    // Get recent quiz scores with timestamps
    const recentQuizzes = await db.any(
      `SELECT id, title, score, created_at
       FROM quiz
       WHERE dashboard_id = $1 AND score IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 10`,
      [dashboardId]
    );

    // Get score distribution over time (all quizzes with scores)
    const scoreHistory = await db.any(
      `SELECT score, created_at
       FROM quiz
       WHERE dashboard_id = $1 AND score IS NOT NULL
       ORDER BY created_at ASC`,
      [dashboardId]
    );

    // Calculate improvement (compare first half vs second half of quizzes)
    let improvement = null;
    if (scoreHistory.length >= 4) {
      const midpoint = Math.floor(scoreHistory.length / 2);
      const firstHalf = scoreHistory.slice(0, midpoint);
      const secondHalf = scoreHistory.slice(midpoint);
      
      const firstAvg = firstHalf.reduce((sum, q) => sum + q.score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, q) => sum + q.score, 0) / secondHalf.length;
      
      improvement = secondAvg - firstAvg;
    }

    res.json({
      stats: {
        total_quizzes: quizStats?.total_quizzes || 0,
        average_score: quizStats?.average_score || 0,
        highest_score: quizStats?.highest_score || 0,
        lowest_score: quizStats?.lowest_score || 0,
        improvement,
        recent_quizzes: recentQuizzes.map(q => ({
          id: q.id,
          title: q.title,
          score: q.score,
          created_at: q.created_at?.toISOString(),
        })),
        score_history: scoreHistory.map(q => ({
          score: q.score,
          created_at: q.created_at?.toISOString(),
        })),
      },
    });
  } catch (err) {
    console.error("GET /api/dashboards/:id/stats error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

// Create dashboard
router.post("/", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const parsed = DashboardCreateSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid request", details: parsed.error.format() });
    const { title, description } = parsed.data;

    const created = await db.one(
      `INSERT INTO dashboard (user_id, title, description) VALUES ($1, $2, $3) RETURNING id, title, description, created_at, updated_at`,
      [userId, title, description || null]
    );
    const validated = DashboardSchema.safeParse(created);
    if (!validated.success) {
      console.error("Validation error for created dashboard:", validated.error.format());
      return res.status(500).json({ error: "Invalid data created" });
    }
    res.status(201).json({ dashboard: validated.data });
  } catch (err) {
    console.error("POST /api/dashboards error:", err);
    res.status(500).json({ error: "Failed to create dashboard" });
  }
});

// Update dashboard
router.put("/:id", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const id = Number(req.params.id);
    const parsed = DashboardUpdateSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid request", details: parsed.error.format() });
    const { title, description } = parsed.data;

    const existing = await db.oneOrNone(
      `SELECT id FROM dashboard WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (!existing) return res.status(404).json({ error: "Not found" });

    const updated = await db.one(
      `UPDATE dashboard SET title = $1, description = $2, updated_at = now() WHERE id = $3 RETURNING id, title, description, created_at, updated_at`,
      [title || null, description || null, id]
    );
    const validated = DashboardSchema.safeParse(updated);
    if (!validated.success) {
      console.error("Validation error for updated dashboard:", validated.error.format());
      return res.status(500).json({ error: "Invalid data updated" });
    }
    res.json({ dashboard: validated.data });
  } catch (err) {
    console.error("PUT /api/dashboards/:id error:", err);
    res.status(500).json({ error: "Failed to update dashboard" });
  }
});

// Delete dashboard
router.delete("/:id", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const id = Number(req.params.id);

    const result = await db.result(
      `DELETE FROM dashboard WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /api/dashboards/:id error:", err);
    res.status(500).json({ error: "Failed to delete dashboard" });
  }
});

export default router;
