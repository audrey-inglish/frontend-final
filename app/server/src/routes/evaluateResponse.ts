import express from "express";
import { z } from "zod";
import { getOpenAIClient } from "../openAiClient";
import { db } from "../db";

const router = express.Router();

const BodySchema = z.object({
  question_id: z.number(),
  user_answer: z.string(),
  correct_answer: z.string(),
  question_text: z.string(),
  question_type: z.enum(['multiple-choice', 'short-answer']),
});

router.post("/", async (req, res) => {
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: "INVALID_INPUT", message: "Invalid request body" },
    });
  }

  const { question_id, user_answer, correct_answer, question_text, question_type } = parsed.data;

  try {
    let isCorrect: boolean;
    let explanation: string;

    if (question_type === 'multiple-choice') {
      const selectedAnswer = await db.oneOrNone(
        `SELECT is_correct 
         FROM quiz_answer 
         WHERE quiz_question_id = $1 AND answer_text = $2`,
        [question_id, user_answer]
      );

      if (selectedAnswer) {
        isCorrect = selectedAnswer.is_correct;
        explanation = isCorrect 
          ? "Correct!" 
          : `Incorrect. The correct answer is: ${correct_answer}`;
      } else {
        // Fallback if answer not found
        isCorrect = user_answer.trim().toLowerCase() === correct_answer.trim().toLowerCase();
        explanation = isCorrect 
          ? "Correct!" 
          : `Incorrect. The correct answer is: ${correct_answer}`;
      }
    } else {
      const client = getOpenAIClient();
      const model = process.env.OPENAI_MODEL ?? "gpt-oss-120b";

      const prompt = `Question: ${question_text}
Correct Answer: ${correct_answer}
Student Answer: ${user_answer}

Evaluate if the student's answer is correct. Consider it correct if it captures the key concepts, even if wording differs.

Respond with JSON:
{
  "is_correct": boolean,
  "explanation": "Brief explanation of why it's correct/incorrect and what was missing or good"
}`;

      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 300,
      });

      const rawText = completion.choices[0]?.message?.content || "";
      
      let jsonText = rawText.trim();
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }
      
      const result = JSON.parse(jsonText);
      
      isCorrect = result.is_correct;
      explanation = result.explanation;
    }

    await db.none(
      `UPDATE quiz_question 
       SET user_answer = $1, ai_explanation = $2 
       WHERE id = $3`,
      [user_answer, explanation, question_id]
    );

    return res.json({
      question_id,
      is_correct: isCorrect,
      explanation,
    });
  } catch (err) {
    console.error("Evaluation error:", err);
    return res.status(500).json({
      error: { code: "AI_SERVICE_ERROR", message: "Failed to evaluate answer" },
    });
  }
});

export default router;