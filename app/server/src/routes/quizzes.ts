import express from "express";
import { db } from "../db";
import { QuizzesArraySchema, QuizSchema } from "../schemas/quiz";

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
    const quizzes = await db.any(
      `SELECT id, dashboard_id, title, score, created_at
       FROM quiz
       WHERE dashboard_id = $1
       ORDER BY created_at DESC`,
      [dashboardId]
    );

    const formatted = quizzes.map((q) => ({
      ...q,
      created_at: q.created_at?.toISOString(),
    }));

    const validated = QuizzesArraySchema.parse(formatted);
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
    const quiz = await db.oneOrNone(
      `SELECT id, dashboard_id, title, score, created_at FROM quiz WHERE id = $1`,
      [quizId]
    );

    if (!quiz) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Quiz not found" },
      });
    }

    const questions = await db.any(
      `SELECT id, quiz_id, question_text, correct_answer, user_answer, ai_explanation, created_at
       FROM quiz_question WHERE quiz_id = $1`,
      [quizId]
    );

    const questionsWithAnswers = await Promise.all(
      questions.map(async (q) => {
        const answers = await db.any(
          `SELECT id, quiz_question_id, answer_text, is_correct
           FROM quiz_answer WHERE quiz_question_id = $1`,
          [q.id]
        );

        return {
          ...q,
          question_type: answers.length > 0 ? 'multiple-choice' : 'short-answer',
          answers,
          created_at: q.created_at?.toISOString(),
        };
      })
    );

    const validated = QuizSchema.parse({
      ...quiz,
      created_at: quiz.created_at?.toISOString(),
      questions: questionsWithAnswers,
    });

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
    const quiz = await db.oneOrNone(
      `UPDATE quiz SET score = $1 WHERE id = $2 RETURNING id, dashboard_id, title, score, created_at`,
      [score, quizId]
    );

    if (!quiz) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Quiz not found" },
      });
    }

    return res.json({
      quiz: {
        ...quiz,
        created_at: quiz.created_at?.toISOString(),
      },
    });
  } catch (err) {
    console.error("Failed to update quiz score:", err);
    return res.status(500).json({
      error: { code: "DATABASE_ERROR", message: "Failed to update quiz score" },
    });
  }
});

export default router;