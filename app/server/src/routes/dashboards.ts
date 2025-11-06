import express from "express";
import { db } from "../db";
import { ensureUserId } from "../utils/user";

const router = express.Router();

// List dashboards for current user
router.get("/", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const dashboards = await db.any(
      `SELECT id, title, description, created_at, updated_at FROM dashboard WHERE user_id = $1 ORDER BY id DESC`,
      [userId]
    );
    res.json({ dashboards });
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
    res.json({ dashboard: dash });
  } catch (err) {
    console.error("GET /api/dashboards/:id error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

// Create dashboard
router.post("/", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });

    const created = await db.one(
      `INSERT INTO dashboard (user_id, title, description) VALUES ($1, $2, $3) RETURNING id, title, description, created_at, updated_at`,
      [userId, title, description || null]
    );
    res.status(201).json({ dashboard: created });
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
    const { title, description } = req.body;

    const existing = await db.oneOrNone(
      `SELECT id FROM dashboard WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (!existing) return res.status(404).json({ error: "Not found" });

    const updated = await db.one(
      `UPDATE dashboard SET title = $1, description = $2, updated_at = now() WHERE id = $3 RETURNING id, title, description, created_at, updated_at`,
      [title || null, description || null, id]
    );
    res.json({ dashboard: updated });
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
