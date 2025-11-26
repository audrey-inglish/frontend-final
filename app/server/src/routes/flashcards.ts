// app/server/src/routes/flashcards.ts
import express from "express";
import { FlashcardsArraySchema } from "../schemas/flashcard";
import { ensureUserId } from "../utils/user";
import { flashcardService } from "../services";

const router = express.Router();

// GET /api/flashcards?dashboard_id=123&needs_review=true
// Fetch all flashcards for a specific dashboard, optionally filtered by needs_review
router.get("/", async (req, res) => {
  const dashboardId = Number(req.query.dashboard_id);
  const needsReview = req.query.needs_review === "true" ? true : req.query.needs_review === "false" ? false : undefined;

  if (!dashboardId || isNaN(dashboardId)) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "dashboard_id is required" },
    });
  }

  try {
    const flashcards = await flashcardService.listByDashboardId(dashboardId, needsReview);
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
    const userId = await ensureUserId(req as express.Request);
    const flashcard = await flashcardService.updateNeedsReview(flashcardId, userId, needs_review);

    if (!flashcard) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Flashcard not found or access denied" },
      });
    }

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