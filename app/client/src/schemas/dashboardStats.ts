import { z } from "zod";

export const RecentQuizSchema = z.object({
  id: z.number(),
  title: z.string(),
  score: z.number(),
  created_at: z.string(),
});

export const ScoreHistoryPointSchema = z.object({
  score: z.number(),
  created_at: z.string(),
});

export const DashboardStatsSchema = z.object({
  total_quizzes: z.number(),
  average_score: z.number(),
  highest_score: z.number(),
  lowest_score: z.number(),
  improvement: z.number().nullable(),
  recent_quizzes: z.array(RecentQuizSchema),
  score_history: z.array(ScoreHistoryPointSchema),
});

export type RecentQuiz = z.infer<typeof RecentQuizSchema>;
export type ScoreHistoryPoint = z.infer<typeof ScoreHistoryPointSchema>;
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
