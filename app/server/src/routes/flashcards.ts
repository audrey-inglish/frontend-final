// app/server/src/routes/flashcards.ts
import express from "express";
// import { z } from "zod";
import { db } from "../db";
import { FlashcardsArraySchema } from "../schemas/flashcard";

const router = express.Router();

// GET /api/flashcards?dashboard_id=123
// Fetch all flashcards for a specific dashboard
router.get("/", async (req, res) => {
  const dashboardId = Number(req.query.dashboard_id);

  if (!dashboardId || isNaN(dashboardId)) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "dashboard_id is required" },
    });
  }

  try {
    const rows = await db.any(
      `SELECT f.id, f.flashcard_set_id, f.front, f.back, f.created_at, f.mastery_score
       FROM flashcard f
       JOIN flashcard_set s ON s.id = f.flashcard_set_id
       WHERE s.dashboard_id = $1
       ORDER BY f.created_at DESC`,
      [dashboardId]
    );

    const flashcards = rows.map((row) => ({
      ...row,
      created_at: row.created_at instanceof Date 
        ? row.created_at.toISOString() 
        : row.created_at,
    }));

    const validated = FlashcardsArraySchema.parse(flashcards);
    return res.json({ flashcards: validated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to fetch flashcards:", message);
    return res.status(500).json({
      error: {
        code: "DATABASE_ERROR",
        message: "Failed to fetch flashcards",
      },
    });
  }
});

export default router;