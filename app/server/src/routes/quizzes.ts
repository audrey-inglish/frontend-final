import express from "express";
import { QuizzesArraySchema, QuizSchema } from "../schemas/quiz";
import { quizService } from "../services";

const router = express.Router();

// GET /api/quizzes?dashboard_id=123
router.get("/", async (req, res) => {
  const dashboardId = Number(req.query.dashboard_id);

  if (!dashboardId || isNaN(dashboardId)) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "dashboard_id is required" },
    });
  }

  try {
    const quizzes = await quizService.listByDashboardId(dashboardId);
    const validated = QuizzesArraySchema.parse(quizzes);
    return res.json({ quizzes: validated });
  } catch (err) {
    console.error("Failed to fetch quizzes:", err);
    return res.status(500).json({
      error: { code: "DATABASE_ERROR", message: "Failed to fetch quizzes" },
    });
  }
});

// GET /api/quizzes/:id (with questions and answers)
router.get("/:id", async (req, res) => {
  const quizId = Number(req.params.id);

  if (!quizId || isNaN(quizId)) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "Valid quiz ID required" },
    });
  }

  try {
    const quiz = await quizService.getById(quizId);

    if (!quiz) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Quiz not found" },
      });
    }

    const validated = QuizSchema.parse(quiz);
    return res.json({ quiz: validated });
  } catch (err) {
    console.error("Failed to fetch quiz:", err);
    return res.status(500).json({
      error: { code: "DATABASE_ERROR", message: "Failed to fetch quiz" },
    });
  }
});

// PATCH /api/quizzes/:id - Update quiz score
router.patch("/:id", async (req, res) => {
  const quizId = Number(req.params.id);
  const { score } = req.body;

  if (!quizId || isNaN(quizId)) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "Valid quiz ID required" },
    });
  }

  if (typeof score !== "number" || score < 0 || score > 100) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "Score must be a number between 0 and 100" },
    });
  }

  try {
    const quiz = await quizService.updateScore(quizId, score);

    if (!quiz) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Quiz not found" },
      });
    }

    return res.json({ quiz });
  } catch (err) {
    console.error("Failed to update quiz score:", err);
    return res.status(500).json({
      error: { code: "DATABASE_ERROR", message: "Failed to update quiz score" },
    });
  }
});

export default router;