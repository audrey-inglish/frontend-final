import { db } from "../db";

export interface QuizAnswer {
  id: number;
  quiz_question_id: number;
  answer_text: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: "multiple-choice" | "short-answer";
  correct_answer: string | null;
  user_answer: string | null;
  ai_explanation: string | null;
  created_at: string;
  answers: QuizAnswer[];
}

export interface Quiz {
  id: number;
  dashboard_id: number;
  title: string;
  score: number | null;
  created_at: string;
  questions?: QuizQuestion[];
}

export class QuizService {
  async listByDashboardId(dashboardId: number): Promise<Quiz[]> {
    const quizzes = await db.any(
      `SELECT id, dashboard_id, title, score, created_at
       FROM quiz
       WHERE dashboard_id = $1
       ORDER BY created_at DESC`,
      [dashboardId]
    );

    return quizzes.map((q) => ({
      ...q,
      created_at: q.created_at?.toISOString(),
    }));
  }

  async getById(id: number): Promise<Quiz | null> {
    const quiz = await db.oneOrNone(
      `SELECT id, dashboard_id, title, score, created_at 
       FROM quiz 
       WHERE id = $1`,
      [id]
    );

    if (!quiz) return null;

    const questions = await db.any(
      `SELECT id, quiz_id, question_text, correct_answer, user_answer, ai_explanation, created_at
       FROM quiz_question 
       WHERE quiz_id = $1`,
      [id]
    );

    const questionsWithAnswers = await Promise.all(
      questions.map(async (q) => {
        const answers = await db.any(
          `SELECT id, quiz_question_id, answer_text, is_correct
           FROM quiz_answer 
           WHERE quiz_question_id = $1`,
          [q.id]
        );

        return {
          ...q,
          question_type: (answers.length > 0 ? "multiple-choice" : "short-answer") as "multiple-choice" | "short-answer",
          answers,
          created_at: q.created_at?.toISOString(),
        };
      })
    );

    return {
      ...quiz,
      created_at: quiz.created_at?.toISOString(),
      questions: questionsWithAnswers,
    };
  }

  async updateScore(id: number, score: number): Promise<Quiz | null> {
    const quiz = await db.oneOrNone(
      `UPDATE quiz 
       SET score = $1 
       WHERE id = $2 
       RETURNING id, dashboard_id, title, score, created_at`,
      [score, id]
    );

    if (!quiz) return null;

    return {
      ...quiz,
      created_at: quiz.created_at?.toISOString(),
    };
  }
}

export const quizService = new QuizService();
