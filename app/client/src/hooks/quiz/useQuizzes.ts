import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiFetch from "../../lib/apiFetch";
import {
  QuizzesArraySchema,
  QuizQuestionsArraySchema,
  type Quiz,
  type QuizQuestion,
} from "../../schemas/quiz";

export const quizKeys = {
  all: ["quizzes"] as const,
  lists: () => [...quizKeys.all, "list"] as const,
  list: (dashboardId?: number) =>
    [...quizKeys.lists(), { dashboardId }] as const,
  detail: (quizId: number) => [...quizKeys.all, "detail", quizId] as const,
};

interface GenerateQuizRequest {
  text: string;
  dashboard_id: number;
  num_questions: number;
  question_types: Array<'multiple-choice' | 'short-answer'>;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GenerateQuizResponse {
  quiz: Quiz;
  questions: QuizQuestion[];
}

export function useGenerateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: GenerateQuizRequest
    ): Promise<GenerateQuizResponse> => {
      const res = await apiFetch("/api/generateQuiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      
      return {
        quiz: json.quiz,
        questions: QuizQuestionsArraySchema.parse(json.questions),
      };
    },
    onSuccess: (_, variables) => {
      if (variables.dashboard_id) {
        queryClient.invalidateQueries({
          queryKey: quizKeys.list(variables.dashboard_id),
        });
      }
    },
  });
}

export function useGetQuizzes(dashboardId: number, enabled = true) {
  return useQuery({
    queryKey: quizKeys.list(dashboardId),
    queryFn: async (): Promise<Quiz[]> => {
      const res = await apiFetch(
        `/api/quizzes?dashboard_id=${dashboardId}`,
        { method: "GET" }
      );
      const json = await res.json();
      return QuizzesArraySchema.parse(json.quizzes);
    },
    enabled: !!dashboardId && enabled,
  });
}

// Hook to fetch a single quiz with its questions
export function useGetQuiz(quizId: number, enabled = true) {
  return useQuery({
    queryKey: quizKeys.detail(quizId),
    queryFn: async (): Promise<Quiz> => {
      const res = await apiFetch(`/api/quizzes/${quizId}`, {
        method: "GET",
      });
      const json = await res.json();
      return json.quiz;
    },
    enabled: !!quizId && enabled,
  });
}