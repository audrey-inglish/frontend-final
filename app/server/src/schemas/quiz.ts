import { z } from "zod";

// multiple-choice questions
export const QuizAnswerSchema = z.object({
  id: z.number().optional(),
  quiz_question_id: z.number().optional(),
  answer_text: z.string(),
  is_correct: z.boolean(),
});

export const QuizQuestionSchema = z.object({
  id: z.number().optional(),
  quiz_id: z.number().optional(),
  question_text: z.string(),
  question_type: z.enum(['multiple-choice', 'short-answer']),
  correct_answer: z.string(),
  user_answer: z.string().nullable().optional(),
  ai_explanation: z.string().nullable().optional(),
  answers: z.array(QuizAnswerSchema).optional(), // For multiple-choice
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

export type QuizAnswer = z.infer<typeof QuizAnswerSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;