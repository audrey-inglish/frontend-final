import { db } from "../db";

export interface Flashcard {
  id: number;
  flashcard_set_id: number;
  front: string;
  back: string;
  created_at: string;
  mastery_score: number | null;
  needs_review: boolean;
  last_reviewed: string | null;
}

export class FlashcardService {
  async listByDashboardId(dashboardId: number, needsReview?: boolean): Promise<Flashcard[]> {
    let query = `
      SELECT f.id, f.flashcard_set_id, f.front, f.back, f.created_at, 
             f.mastery_score, f.needs_review, f.last_reviewed
      FROM flashcard f
      JOIN flashcard_set s ON s.id = f.flashcard_set_id
      WHERE s.dashboard_id = $1
    `;
    
    const params: unknown[] = [dashboardId];
    
    if (needsReview !== undefined) {
      query += ` AND f.needs_review = $2`;
      params.push(needsReview);
    }
    
    query += ` ORDER BY f.created_at DESC`;

    const rows = await db.any(query, params);

    return rows.map((row) => ({
      ...row,
      created_at: row.created_at instanceof Date 
        ? row.created_at.toISOString() 
        : row.created_at,
      last_reviewed: row.last_reviewed instanceof Date
        ? row.last_reviewed.toISOString()
        : row.last_reviewed,
    }));
  }

  async updateNeedsReview(id: number, userId: number, needsReview: boolean): Promise<Flashcard | null> {
    const ownershipCheck = await db.oneOrNone(
      `SELECT d.user_id
       FROM flashcard f
       JOIN flashcard_set fs ON f.flashcard_set_id = fs.id
       JOIN dashboard d ON fs.dashboard_id = d.id
       WHERE f.id = $1`,
      [id]
    );

    if (!ownershipCheck || ownershipCheck.user_id !== userId) {
      return null;
    }

    const updated = await db.one(
      `UPDATE flashcard 
       SET needs_review = $1, last_reviewed = CASE WHEN $1 = false THEN now() ELSE last_reviewed END
       WHERE id = $2
       RETURNING id, flashcard_set_id, front, back, created_at, mastery_score, needs_review, last_reviewed`,
      [needsReview, id]
    );

    return {
      ...updated,
      created_at: updated.created_at instanceof Date
        ? updated.created_at.toISOString()
        : updated.created_at,
      last_reviewed: updated.last_reviewed instanceof Date
        ? updated.last_reviewed.toISOString()
        : updated.last_reviewed,
    };
  }
}

export const flashcardService = new FlashcardService();
