import express from "express";
import { z } from "zod";
import { getOpenAIClient } from "../openAiClient";
import { QuizQuestionsArraySchema } from "../schemas/quiz";
import { db } from "../db";

const router = express.Router();

const BodySchema = z.object({
  text: z.string().min(1),
  dashboard_id: z.number(),
  num_questions: z.number().min(1).max(20).default(5),
  question_types: z.array(z.enum(["multiple-choice", "short-answer"])),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

router.post("/", async (req, res) => {
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "Invalid request body" },
    });
  }

  const { text, dashboard_id, num_questions, question_types, difficulty } =
    parsed.data;
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL ?? "gpt-oss-120b";

  // Map difficulty to description for AI prompt
  const difficultyDescriptions = {
    easy: "basic recall and simple understanding",
    medium: "application of concepts and moderate analysis",
    hard: "complex synthesis, critical thinking, and deep analysis",
  };

  const systemPrompt = `You are a strict JSON generator. Create ${num_questions} quiz questions from the provided notes.
Question types: ${question_types.join(", ")}.
Difficulty level: ${difficulty} - focus on ${
    difficultyDescriptions[difficulty]
  }.

Return ONLY a JSON array. Each item must have:
- "question_text": the question
- "question_type": either "multiple-choice" or "short-answer"
- "correct_answer": the correct answer text
- "answers": (for multiple-choice only) array of 4 objects with "answer_text" and "is_correct" (boolean)

Example multiple-choice:
{
  "question_text": "What is the capital of France?",
  "question_type": "multiple-choice",
  "correct_answer": "Paris",
  "answers": [
    {"answer_text": "Paris", "is_correct": true},
    {"answer_text": "London", "is_correct": false},
    {"answer_text": "Berlin", "is_correct": false},
    {"answer_text": "Madrid", "is_correct": false}
  ]
}

Example short-answer:
{
  "question_text": "Explain photosynthesis.",
  "question_type": "short-answer",
  "correct_answer": "Process where plants convert light energy to chemical energy"
}`;

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const rawText = completion.choices[0]?.message?.content || "";

    // Parse JSON
    let questions: unknown;
    try {
      questions = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/(\[.*\])/s);
      if (match) {
        questions = JSON.parse(match[1]);
      } else {
        throw new Error("PARSE_FAILED");
      }
    }

    // Validate
    const validated = QuizQuestionsArraySchema.safeParse(questions);
    if (!validated.success) {
      console.error("Validation failed:", validated.error);
      return res.status(502).json({
        error: {
          code: "PARSE_VALIDATION_FAILED",
          message: "AI returned invalid quiz structure",
        },
      });
    }

    // Save to database
    const dashboard = await db.oneOrNone(
      `SELECT id FROM dashboard WHERE id = $1`,
      [dashboard_id]
    );

    if (!dashboard) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Dashboard not found" },
      });
    }

    const quizTitle = `Quiz - ${new Date().toISOString()}`;
    const quiz = await db.one(
      `INSERT INTO quiz (dashboard_id, title) VALUES ($1, $2) RETURNING id, dashboard_id, title, created_at, score`,
      [dashboard_id, quizTitle]
    );

    const savedQuestions = [];
    for (const q of validated.data) {
      const question = await db.one(
        `INSERT INTO quiz_question (quiz_id, question_text, correct_answer) 
         VALUES ($1, $2, $3) 
         RETURNING id, quiz_id, question_text, correct_answer, user_answer, ai_explanation, created_at`,
        [quiz.id, q.question_text, q.correct_answer]
      );

      // Save multiple-choice answers if present
      const savedAnswers = [];
      if (q.answers && q.answers.length > 0) {
        for (const answer of q.answers) {
          const savedAnswer = await db.one(
            `INSERT INTO quiz_answer (quiz_question_id, answer_text, is_correct)
             VALUES ($1, $2, $3)
             RETURNING id, quiz_question_id, answer_text, is_correct`,
            [question.id, answer.answer_text, answer.is_correct]
          );
          savedAnswers.push(savedAnswer);
        }
      }

      savedQuestions.push({
        ...question,
        question_type: q.question_type,
        answers: savedAnswers,
        created_at: question.created_at?.toISOString(),
      });
    }

    return res.json({
      quiz: {
        ...quiz,
        created_at: quiz.created_at?.toISOString(),
        questions: savedQuestions,
      },
    });
  } catch (err) {
    console.error("Quiz generation error:", err);
    return res.status(502).json({
      error: {
        code: "AI_SERVICE_ERROR",
        message: "Failed to generate quiz",
      },
    });
  }
});

export default router;
