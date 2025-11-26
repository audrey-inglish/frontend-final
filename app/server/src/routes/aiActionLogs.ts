import express from "express";
import { ensureUserId } from "../utils/user";
import { requireAdmin } from "../auth";
import {
  AiActionLogCreateSchema,
  AiActionLogsArraySchema,
} from "../schemas/aiActionLog";
import { aiActionLogService } from "../services";

const router = express.Router();

/**
 * POST /api/ai-actions
 * Create a new AI action log entry
 */
router.post("/", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const parsed = AiActionLogCreateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: { code: "INVALID_INPUT", message: "Invalid request body" },
        details: parsed.error.format(),
      });
    }

    const log = await aiActionLogService.create(userId, parsed.data);
    if (!log) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Dashboard not found or access denied",
        },
      });
    }

    res.status(201).json({ log });
  } catch (err) {
    console.error("POST /api/ai-actions error:", err);
    res.status(500).json({ error: "Failed to create AI action log" });
  }
});

/**
 * GET /api/ai-actions
 * Get AI action logs for the current user
 * Query params: ?dashboard_id=X&session_id=Y&limit=50
 */
router.get("/", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const dashboardId = req.query.dashboard_id
      ? Number(req.query.dashboard_id)
      : undefined;
    const sessionId = req.query.session_id as string | undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 100;

    const logs = await aiActionLogService.listByUserId(userId, dashboardId, sessionId, limit);

    const parsed = AiActionLogsArraySchema.safeParse({ logs });
    if (!parsed.success) {
      console.error("Validation error for AI action logs:", parsed.error.format());
      return res.status(500).json({ error: "Invalid data from database" });
    }

    res.json(parsed.data);
  } catch (err) {
    console.error("GET /api/ai-actions error:", err);
    res.status(500).json({ error: "Failed to fetch AI action logs" });
  }
});

/**
 * GET /api/ai-actions/session/:sessionId
 * Get all AI actions for a specific study session
 */
router.get("/session/:sessionId", async (req, res) => {
  try {
    const userId = await ensureUserId(req as express.Request);
    const { sessionId } = req.params;

    const logs = await aiActionLogService.listBySessionId(sessionId, userId);

    const parsed = AiActionLogsArraySchema.safeParse({ logs });
    if (!parsed.success) {
      console.error("Validation error for AI action logs:", parsed.error.format());
      return res.status(500).json({ error: "Invalid data from database" });
    }

    res.json(parsed.data);
  } catch (err) {
    console.error(`GET /api/ai-actions/session/${req.params.sessionId} error:`, err);
    res.status(500).json({ error: "Failed to fetch session AI actions" });
  }
});

/**
 * GET /api/ai-actions/admin/all
 * Admin-only: Get all AI action logs across all users
 * Query params: ?user_id=X&dashboard_id=Y&limit=100&offset=0
 */
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const userIdFilter = req.query.user_id ? Number(req.query.user_id) : undefined;
    const dashboardIdFilter = req.query.dashboard_id
      ? Number(req.query.dashboard_id)
      : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const offset = req.query.offset ? Number(req.query.offset) : 0;

    const { logs, pagination } = await aiActionLogService.listAllWithPagination(
      userIdFilter,
      dashboardIdFilter,
      limit,
      offset
    );

    res.json({ logs, pagination });
  } catch (err) {
    console.error("GET /api/ai-actions/admin/all error:", err);
    res.status(500).json({ error: "Failed to fetch AI action logs" });
  }
});

export default router;
