// app/server/src/routes/concepts.ts
import express from "express";
import { z } from "zod";
import { ConceptsArraySchema } from "../schemas/concept";
import { conceptService } from "../services";

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
    const concepts = await conceptService.listByDashboardId(dashboardId);
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
    const insertedConcepts = await conceptService.createMultiple(dashboard_id, concepts);
    const validated = ConceptsArraySchema.parse(insertedConcepts);
    return res.status(201).json({ concepts: validated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to save concepts:", message);
    
    if (message === "Dashboard not found") {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Dashboard not found" },
      });
    }
    
    return res.status(500).json({
      error: {
        code: "DATABASE_ERROR",
        message: "Failed to save concepts",
      },
    });
  }
});

export default router;
