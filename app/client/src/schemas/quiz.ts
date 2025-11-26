import { z } from "zod";

export const QuizAnswerSchema = z.object({
  id: z.number().optional(),
  quiz_question_id: z.number().optional(),
  answer_text: z.string(),
  is_correct: z.boolean(),
  explanation: z.string().optional(),
});

export const QuizQuestionSchema = z.object({
  id: z.number().optional(),
  quiz_id: z.number().optional(),
  question_text: z.string(),
  question_type: z.enum(['multiple-choice', 'short-answer']),
  correct_answer: z.string(),
  user_answer: z.string().nullable().optional(),
  ai_explanation: z.string().nullable().optional(),
  answers: z.array(QuizAnswerSchema).optional(),
  created_at: z.string().optional(),
});

export const QuizSchema = z.object({
  id: z.number(),
  dashboard_id: z.number(),
  title: z.string(),
  score: z.number().nullable().optional(),
  created_at: z.string(),
  questions: z.array(QuizQuestionSchema).optional(),
});

export const QuizzesArraySchema = z.array(QuizSchema);
export const QuizQuestionsArraySchema = z.array(QuizQuestionSchema);

// Export difficulty type for use in forms
export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);

export type QuizAnswer = z.infer<typeof QuizAnswerSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type Difficulty = z.infer<typeof DifficultySchema>;