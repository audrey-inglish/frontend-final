// app/server/src/routes/flashcards.ts
import express from "express";
// import { z } from "zod";
import { db } from "../db";
import { FlashcardsArraySchema } from "../schemas/flashcard";
import { ensureUserId } from "../utils/user";

const router = express.Router();

// GET /api/flashcards?dashboard_id=123&needs_review=true
// Fetch all flashcards for a specific dashboard, optionally filtered by needs_review
router.get("/", async (req, res) => {
  const dashboardId = Number(req.query.dashboard_id);
  const needsReview = req.query.needs_review === "true";

  if (!dashboardId || isNaN(dashboardId)) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "dashboard_id is required" },
    });
  }

  try {
    // Build the query with optional needs_review filter
    let query = `
      SELECT f.id, f.flashcard_set_id, f.front, f.back, f.created_at, 
             f.mastery_score, f.needs_review, f.last_reviewed
      FROM flashcard f
      JOIN flashcard_set s ON s.id = f.flashcard_set_id
      WHERE s.dashboard_id = $1
    `;
    
    const params: unknown[] = [dashboardId];
    
    if (req.query.needs_review !== undefined) {
      query += ` AND f.needs_review = $2`;
      params.push(needsReview);
    }
    
    query += ` ORDER BY f.created_at DESC`;

    const rows = await db.any(query, params);

    const flashcards = rows.map((row) => ({
      ...row,
      created_at: row.created_at instanceof Date 
        ? row.created_at.toISOString() 
        : row.created_at,
      last_reviewed: row.last_reviewed instanceof Date
        ? row.last_reviewed.toISOString()
        : row.last_reviewed,
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

// PATCH /api/flashcards/:id
// Toggle needs_review flag for a single flashcard
router.patch("/:id", async (req, res) => {
  const flashcardId = Number(req.params.id);
  const { needs_review } = req.body;

  if (!flashcardId || isNaN(flashcardId)) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "Valid flashcard ID is required" },
    });
  }

  if (typeof needs_review !== "boolean") {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "needs_review must be a boolean" },
    });
  }

  try {
    // Get authenticated user ID
    const userId = await ensureUserId(req as express.Request);

    // Verify ownership: check that this flashcard belongs to a dashboard owned by the user
    const ownershipCheck = await db.oneOrNone(
      `SELECT d.user_id
       FROM flashcard f
       JOIN flashcard_set fs ON f.flashcard_set_id = fs.id
       JOIN dashboard d ON fs.dashboard_id = d.id
       WHERE f.id = $1`,
      [flashcardId]
    );

    if (!ownershipCheck) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Flashcard not found" },
      });
    }

    if (ownershipCheck.user_id !== userId) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "You don't have permission to modify this flashcard" },
      });
    }

    // Update the flashcard
    const updated = await db.one(
      `UPDATE flashcard 
       SET needs_review = $1, last_reviewed = CASE WHEN $1 = false THEN now() ELSE last_reviewed END
       WHERE id = $2
       RETURNING id, flashcard_set_id, front, back, created_at, mastery_score, needs_review, last_reviewed`,
      [needs_review, flashcardId]
    );

    const flashcard = {
      ...updated,
      created_at: updated.created_at instanceof Date
        ? updated.created_at.toISOString()
        : updated.created_at,
      last_reviewed: updated.last_reviewed instanceof Date
        ? updated.last_reviewed.toISOString()
        : updated.last_reviewed,
    };

    return res.json({ flashcard });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Failed to update flashcard:", message);
    
    if (message === "Unauthorized") {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
    }
    
    return res.status(500).json({
      error: {
        code: "DATABASE_ERROR",
        message: "Failed to update flashcard",
      },
    });
  }
});

export default router;