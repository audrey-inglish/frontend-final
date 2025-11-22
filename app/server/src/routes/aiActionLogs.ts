import express from "express";
import { db } from "../db";
import { ensureUserId } from "../utils/user";
import { requireAdmin } from "../auth";
import {
  AiActionLogCreateSchema,
  AiActionLogsArraySchema,
} from "../schemas/aiActionLog";

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

    const data = parsed.data;

    // Verify that the dashboard belongs to the user
    const dashboardCheck = await db.oneOrNone(
      `SELECT id FROM dashboard WHERE id = $1 AND user_id = $2`,
      [data.dashboard_id, userId]
    );

    if (!dashboardCheck) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Dashboard not found or access denied",
        },
      });
    }

    // Insert the AI action log
    const log = await db.one(
      `INSERT INTO ai_action_log (
        user_id, dashboard_id, session_id, action_type,
        request_messages, response_data, tool_call_data, reasoning,
        question_id, topic, mastery_level, duration_ms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, user_id, dashboard_id, session_id, action_type,
                request_messages, response_data, tool_call_data, reasoning,
                question_id, topic, mastery_level, created_at, duration_ms`,
      [
        userId,
        data.dashboard_id,
        data.session_id,
        data.action_type,
        data.request_messages ? JSON.stringify(data.request_messages) : null,
        data.response_data ? JSON.stringify(data.response_data) : null,
        data.tool_call_data ? JSON.stringify(data.tool_call_data) : null,
        data.reasoning || null,
        data.question_id || null,
        data.topic || null,
        data.mastery_level || null,
        data.duration_ms || null,
      ]
    );

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
      : null;
    const sessionId = req.query.session_id as string | undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 100;

    let query = `
      SELECT aal.id, aal.user_id, aal.dashboard_id, aal.session_id, aal.action_type,
             aal.request_messages, aal.response_data, aal.tool_call_data, aal.reasoning,
             aal.question_id, aal.topic, aal.mastery_level, aal.created_at, aal.duration_ms
      FROM ai_action_log aal
      JOIN dashboard d ON d.id = aal.dashboard_id
      WHERE d.user_id = $1
    `;

    const params: (number | string)[] = [userId];
    let paramCount = 1;

    if (dashboardId) {
      paramCount++;
      query += ` AND aal.dashboard_id = $${paramCount}`;
      params.push(dashboardId);
    }

    if (sessionId) {
      paramCount++;
      query += ` AND aal.session_id = $${paramCount}`;
      params.push(sessionId);
    }

    query += ` ORDER BY aal.created_at DESC LIMIT $${paramCount + 1}`;
    params.push(limit);

    const logs = await db.any(query, params);

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

    const logs = await db.any(
      `SELECT aal.id, aal.user_id, aal.dashboard_id, aal.session_id, aal.action_type,
              aal.request_messages, aal.response_data, aal.tool_call_data, aal.reasoning,
              aal.question_id, aal.topic, aal.mastery_level, aal.created_at, aal.duration_ms
       FROM ai_action_log aal
       JOIN dashboard d ON d.id = aal.dashboard_id
       WHERE aal.session_id = $1 AND d.user_id = $2
       ORDER BY aal.created_at ASC`,
      [sessionId, userId]
    );

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
    const userIdFilter = req.query.user_id ? Number(req.query.user_id) : null;
    const dashboardIdFilter = req.query.dashboard_id
      ? Number(req.query.dashboard_id)
      : null;
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const offset = req.query.offset ? Number(req.query.offset) : 0;

    let query = `
      SELECT aal.id, aal.user_id, aal.dashboard_id, aal.session_id, aal.action_type,
             aal.request_messages, aal.response_data, aal.tool_call_data, aal.reasoning,
             aal.question_id, aal.topic, aal.mastery_level, aal.created_at, aal.duration_ms,
             u.email, u.username, d.title as dashboard_title
      FROM ai_action_log aal
      JOIN app_user u ON u.id = aal.user_id
      JOIN dashboard d ON d.id = aal.dashboard_id
      WHERE 1=1
    `;

    const params: number[] = [];
    let paramCount = 0;

    if (userIdFilter) {
      paramCount++;
      query += ` AND aal.user_id = $${paramCount}`;
      params.push(userIdFilter);
    }

    if (dashboardIdFilter) {
      paramCount++;
      query += ` AND aal.dashboard_id = $${paramCount}`;
      params.push(dashboardIdFilter);
    }

    query += ` ORDER BY aal.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const logs = await db.any(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM ai_action_log WHERE 1=1`;
    const countParams: number[] = [];
    let countParamCount = 0;

    if (userIdFilter) {
      countParamCount++;
      countQuery += ` AND user_id = $${countParamCount}`;
      countParams.push(userIdFilter);
    }

    if (dashboardIdFilter) {
      countParamCount++;
      countQuery += ` AND dashboard_id = $${countParamCount}`;
      countParams.push(dashboardIdFilter);
    }

    const { total } = await db.one(countQuery, countParams);

    res.json({
      logs,
      pagination: {
        total: Number(total),
        limit,
        offset,
        hasMore: offset + logs.length < Number(total),
      },
    });
  } catch (err) {
    console.error("GET /api/ai-actions/admin/all error:", err);
    res.status(500).json({ error: "Failed to fetch AI action logs" });
  }
});

export default router;
