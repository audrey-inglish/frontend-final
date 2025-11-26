import { db } from "../db";

export interface Note {
  id: number;
  dashboard_id: number | null;
  title: string | null;
  content: string | null;
  source: string | null;
  uploaded_at: Date;
}

export class NoteService {
  async listByUserId(userId: number, dashboardId?: number): Promise<Note[]> {
    return db.any(
      `SELECT n.id, n.dashboard_id, n.title, n.content, n.source, n.uploaded_at
       FROM note_upload n
       JOIN dashboard d ON d.id = n.dashboard_id
       WHERE d.user_id = $1 ${dashboardId ? "AND d.id = $2" : ""}
       ORDER BY n.uploaded_at DESC`,
      dashboardId ? [userId, dashboardId] : [userId]
    );
  }

  async getById(id: number, userId: number): Promise<Note | null> {
    return db.oneOrNone(
      `SELECT n.id, n.dashboard_id, n.title, n.content, n.source, n.uploaded_at
       FROM note_upload n
       JOIN dashboard d ON d.id = n.dashboard_id
       WHERE n.id = $1 AND d.user_id = $2`,
      [id, userId]
    );
  }

  async create(
    userId: number,
    dashboardId: number | null | undefined,
    title: string | null | undefined,
    content: string | null | undefined,
    source: string | null | undefined
  ): Promise<Note | null> {
    if (dashboardId) {
      const dashboard = await db.oneOrNone(
        `SELECT id FROM dashboard WHERE id = $1 AND user_id = $2`,
        [dashboardId, userId]
      );
      if (!dashboard) return null;
    }

    return db.one(
      `INSERT INTO note_upload (dashboard_id, title, content, source) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, dashboard_id, title, content, source, uploaded_at`,
      [dashboardId || null, title, content, source || null]
    );
  }

  async update(
    id: number,
    userId: number,
    title: string | null | undefined,
    content: string | null | undefined,
    source: string | null | undefined
  ): Promise<Note | null> {
    const existing = await db.oneOrNone(
      `SELECT n.id 
       FROM note_upload n 
       JOIN dashboard d ON d.id = n.dashboard_id 
       WHERE n.id = $1 AND d.user_id = $2`,
      [id, userId]
    );

    if (!existing) return null;

    return db.one(
      `UPDATE note_upload 
       SET title = $1, content = $2, source = $3 
       WHERE id = $4 
       RETURNING id, dashboard_id, title, content, source, uploaded_at`,
      [title || null, content || null, source || null, id]
    );
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await db.result(
      `DELETE FROM note_upload n 
       USING dashboard d 
       WHERE n.id = $1 AND n.dashboard_id = d.id AND d.user_id = $2`,
      [id, userId]
    );
    return result.rowCount > 0;
  }
}

export const noteService = new NoteService();
