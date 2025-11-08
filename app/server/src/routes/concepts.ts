// app/server/src/routes/concepts.ts
import express from "express";
import { z } from "zod";
import { db } from "../db";
import { ConceptsArraySchema } from "../schemas/concept";

const router = express.Router();

// GET /api/concepts?dashboard_id=123
// Fetch all concepts for a specific dashboard
router.get("/", async (req, res) => {
  const dashboardId = Number(req.query.dashboard_id);

  if (!dashboardId || isNaN(dashboardId)) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "dashboard_id is required" },
    });
  }

  try {
    const rows = await db.any(
      `SELECT id, dashboard_id, concept_title, concept_summary, examples, 
              mastery_score, updated_at 
       FROM concept 
       WHERE dashboard_id = $1 
       ORDER BY updated_at DESC`,
      [dashboardId]
    );

    // Transform Date objects to ISO strings
    const concepts = rows.map((row) => ({
      ...row,
      updated_at: row.updated_at instanceof Date 
        ? row.updated_at.toISOString() 
        : row.updated_at,
    }));

    const validated = ConceptsArraySchema.parse(concepts);
    return res.json({ concepts: validated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to fetch concepts:", message);
    return res.status(500).json({
      error: {
        code: "DATABASE_ERROR",
        message: "Failed to fetch concepts",
      },
    });
  }
});

// POST /api/concepts
// Save multiple concepts for a dashboard
const PostBodySchema = z.object({
  dashboard_id: z.number(),
  concepts: ConceptsArraySchema,
});

router.post("/", async (req, res) => {
  const parsed = PostBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: "INVALID_INPUT",
        message: "dashboard_id and concepts array are required",
      },
    });
  }

  const { dashboard_id, concepts } = parsed.data;

  try {
    // Verify dashboard exists
    const dashboard = await db.oneOrNone(
      `SELECT id FROM dashboard WHERE id = $1`,
      [dashboard_id]
    );

    if (!dashboard) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Dashboard not found" },
      });
    }

    // Insert concepts into the database
    const insertedConcepts = [];
    for (const concept of concepts) {
      const result = await db.one(
        `INSERT INTO concept (dashboard_id, concept_title, concept_summary, examples) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, dashboard_id, concept_title, concept_summary, examples, mastery_score, updated_at`,
        [
          dashboard_id,
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

    const validated = ConceptsArraySchema.parse(insertedConcepts);
    return res.status(201).json({ concepts: validated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to save concepts:", message);
    return res.status(500).json({
      error: {
        code: "DATABASE_ERROR",
        message: "Failed to save concepts",
      },
    });
  }
});

export default router;
