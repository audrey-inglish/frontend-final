import { db } from "../db";

export interface AiActionLogData {
  dashboard_id: number;
  session_id: string;
  action_type: string;
  request_messages?: unknown;
  response_data?: unknown;
  tool_call_data?: unknown;
  reasoning?: string | null;
  question_id?: string | null;
  topic?: string | null;
  mastery_level?: number | null;
  duration_ms?: number | null;
}

export interface AiActionLog {
  id: number;
  user_id: number;
  dashboard_id: number;
  session_id: string;
  action_type: string;
  request_messages: unknown | null;
  response_data: unknown | null;
  tool_call_data: unknown | null;
  reasoning: string | null;
  question_id: string | null;
  topic: string | null;
  mastery_level: number | null;
  created_at: Date;
  duration_ms: number | null;
}

export interface AiActionLogWithUser extends AiActionLog {
  email: string;
  username: string;
  dashboard_title: string;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export class AiActionLogService {
  async create(userId: number, data: AiActionLogData): Promise<AiActionLog | null> {
    const dashboardCheck = await db.oneOrNone(
      `SELECT id FROM dashboard WHERE id = $1 AND user_id = $2`,
      [data.dashboard_id, userId]
    );

    if (!dashboardCheck) {
      return null;
    }

    return db.one(
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
  }

  async listByUserId(
    userId: number, 
    dashboardId?: number, 
    sessionId?: string, 
    limit: number = 100
  ): Promise<AiActionLog[]> {
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

    return db.any(query, params);
  }

  async listBySessionId(sessionId: string, userId: number): Promise<AiActionLog[]> {
    return db.any(
      `SELECT aal.id, aal.user_id, aal.dashboard_id, aal.session_id, aal.action_type,
              aal.request_messages, aal.response_data, aal.tool_call_data, aal.reasoning,
              aal.question_id, aal.topic, aal.mastery_level, aal.created_at, aal.duration_ms
       FROM ai_action_log aal
       JOIN dashboard d ON d.id = aal.dashboard_id
       WHERE aal.session_id = $1 AND d.user_id = $2
       ORDER BY aal.created_at ASC`,
      [sessionId, userId]
    );
  }

  async listAllWithPagination(
    userIdFilter?: number,
    dashboardIdFilter?: number,
    limit: number = 100,
    offset: number = 0
  ): Promise<{ logs: AiActionLogWithUser[]; pagination: PaginationInfo }> {
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

    return {
      logs,
      pagination: {
        total: Number(total),
        limit,
        offset,
        hasMore: offset + logs.length < Number(total),
      },
    };
  }
}

export const aiActionLogService = new AiActionLogService();
