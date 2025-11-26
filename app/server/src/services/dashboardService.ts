import { db } from "../db";

export interface Dashboard {
  id: number;
  title: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DashboardStats {
  total_quizzes: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  improvement: number | null;
  recent_quizzes: Array<{
    id: number;
    title: string;
    score: number;
    created_at: string;
  }>;
  score_history: Array<{
    score: number;
    created_at: string;
  }>;
}

export class DashboardService {
  async listByUserId(userId: number): Promise<Dashboard[]> {
    return db.any(
      `SELECT id, title, description, created_at, updated_at 
       FROM dashboard 
       WHERE user_id = $1 
       ORDER BY id DESC`,
      [userId]
    );
  }

  async getById(id: number, userId: number): Promise<Dashboard | null> {
    return db.oneOrNone(
      `SELECT id, title, description, created_at, updated_at 
       FROM dashboard 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  }

  async getStats(dashboardId: number, userId: number): Promise<DashboardStats | null> {
    const dashboard = await this.getById(dashboardId, userId);
    if (!dashboard) return null;

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

    const recentQuizzes = await db.any(
      `SELECT id, title, score, created_at
       FROM quiz
       WHERE dashboard_id = $1 AND score IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 10`,
      [dashboardId]
    );

    const scoreHistory = await db.any(
      `SELECT score, created_at
       FROM quiz
       WHERE dashboard_id = $1 AND score IS NOT NULL
       ORDER BY created_at ASC`,
      [dashboardId]
    );

    let improvement = null;
    if (scoreHistory.length >= 4) {
      const midpoint = Math.floor(scoreHistory.length / 2);
      const firstHalf = scoreHistory.slice(0, midpoint);
      const secondHalf = scoreHistory.slice(midpoint);
      
      const firstAvg = firstHalf.reduce((sum, q) => sum + q.score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, q) => sum + q.score, 0) / secondHalf.length;
      
      improvement = secondAvg - firstAvg;
    }

    return {
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
    };
  }

  async create(userId: number, title: string, description?: string | null): Promise<Dashboard> {
    return db.one(
      `INSERT INTO dashboard (user_id, title, description) 
       VALUES ($1, $2, $3) 
       RETURNING id, title, description, created_at, updated_at`,
      [userId, title, description || null]
    );
  }

  async update(id: number, userId: number, title?: string | null, description?: string | null): Promise<Dashboard | null> {
    const existing = await db.oneOrNone(
      `SELECT id FROM dashboard WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (!existing) return null;

    return db.one(
      `UPDATE dashboard 
       SET title = $1, description = $2, updated_at = now() 
       WHERE id = $3 
       RETURNING id, title, description, created_at, updated_at`,
      [title || null, description || null, id]
    );
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await db.result(
      `DELETE FROM dashboard WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return result.rowCount > 0;
  }
}

export const dashboardService = new DashboardService();
