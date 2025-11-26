import express from "express";
import { ensureUserId } from "../utils/user";
import {
  DashboardCreateSchema,
  DashboardUpdateSchema,
  DashboardSchema,
  DashboardsListResponseSchema,
  DashboardSingleResponseSchema,
} from "../schemas/dashboard";
import { dashboardService } from "../services";

const router = express.Router();

// List dashboards for current user
router.get("/", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const dashboards = await dashboardService.listByUserId(userId);
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
    const dash = await dashboardService.getById(id, userId);
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

    const stats = await dashboardService.getStats(dashboardId, userId);
    if (!stats) {
      return res.status(404).json({ error: "Dashboard not found" });
    }

    res.json({ stats });
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

    const created = await dashboardService.create(userId, title, description);
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

    const updated = await dashboardService.update(id, userId, title, description);
    if (!updated) return res.status(404).json({ error: "Not found" });

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

    const deleted = await dashboardService.delete(id, userId);
    if (!deleted)
      return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err) {
    console.error("DELETE /api/dashboards/:id error:", err);
    res.status(500).json({ error: "Failed to delete dashboard" });
  }
});

export default router;
