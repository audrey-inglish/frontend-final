import { db } from "../db";

export interface Concept {
  id: number;
  dashboard_id: number;
  concept_title: string;
  concept_summary: string;
  examples: string[] | null;
  mastery_score: number | null;
  updated_at: string;
}

export class ConceptService {
  async listByDashboardId(dashboardId: number): Promise<Concept[]> {
    const rows = await db.any(
      `SELECT id, dashboard_id, concept_title, concept_summary, examples, 
              mastery_score, updated_at 
       FROM concept 
       WHERE dashboard_id = $1 
       ORDER BY updated_at DESC`,
      [dashboardId]
    );

    return rows.map((row) => ({
      ...row,
      updated_at: row.updated_at instanceof Date 
        ? row.updated_at.toISOString() 
        : row.updated_at,
    }));
  }

  async createMultiple(dashboardId: number, concepts: Array<{
    concept_title: string;
    concept_summary: string;
    examples?: string[] | null;
  }>): Promise<Concept[]> {
    const dashboard = await db.oneOrNone(
      `SELECT id FROM dashboard WHERE id = $1`,
      [dashboardId]
    );

    if (!dashboard) {
      throw new Error("Dashboard not found");
    }

    const insertedConcepts = [];
    for (const concept of concepts) {
      const result = await db.one(
        `INSERT INTO concept (dashboard_id, concept_title, concept_summary, examples) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, dashboard_id, concept_title, concept_summary, examples, mastery_score, updated_at`,
        [
          dashboardId,
          concept.concept_title,
          concept.concept_summary,
          concept.examples ?? null,
        ]
      );
      insertedConcepts.push({
        ...result,
        updated_at: result.updated_at instanceof Date
          ? result.updated_at.toISOString()
          : result.updated_at,
      });
    }

    return insertedConcepts;
  }
}

export const conceptService = new ConceptService();
