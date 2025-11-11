import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import apiFetch from "../../lib/apiFetch";
import {
  FlashcardsArraySchema,
  FlashcardSetSchema,
  type Flashcard,
  type FlashcardSet,
} from "../../schemas/flashcard";

interface GenerateFlashcardsRequest {
  text: string;
  dashboard_id?: number;
}

interface FlashcardsResponse {
  flashcards: Flashcard[];
  flashcard_set?: FlashcardSet;
}

export const flashcardKeys = {
  all: ["flashcards"] as const,
  lists: () => [...flashcardKeys.all, "list"] as const,
  list: (dashboardId?: number, needsReview?: boolean) =>
    [...flashcardKeys.lists(), { dashboardId, needsReview }] as const,
};

export function useGetFlashcards(
  dashboardId?: number,
  needsReview?: boolean,
  enabled = true
) {
  return useQuery({
    queryKey: flashcardKeys.list(dashboardId, needsReview),
    queryFn: async (): Promise<Flashcard[]> => {
      if (!dashboardId) throw new Error("Dashboard ID is required");
      
      const params = new URLSearchParams({ 
        dashboard_id: dashboardId.toString() 
      });
      
      if (needsReview !== undefined) {
        params.append("needs_review", needsReview.toString());
      }
      
      const res = await apiFetch(`/api/flashcards?${params.toString()}`, {
        method: "GET",
      });
      const json = await res.json();
      const validated = FlashcardsArraySchema.parse(json.flashcards);
      return validated;
    },
    enabled: !!dashboardId && enabled,
  });
}

export function useGenerateFlashcards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: GenerateFlashcardsRequest
    ): Promise<FlashcardsResponse> => {
      const res = await apiFetch("/api/generateFlashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      const validated = FlashcardsArraySchema.parse(json.flashcards);

      // Parse flashcard_set if present
      let flashcardSet: FlashcardSet | undefined;
      if (json.flashcard_set) {
        flashcardSet = FlashcardSetSchema.parse(json.flashcard_set);
      }

      return {
        flashcards: validated,
        flashcard_set: flashcardSet,
      };
    },
    onSuccess: (_, variables) => {
      if (variables.dashboard_id) {
        queryClient.invalidateQueries({
          queryKey: flashcardKeys.list(variables.dashboard_id),
        });
      }
    },
  });
}

interface MarkFlashcardRequest {
  flashcardId: number;
  needsReview: boolean;
  dashboardId: number;
}

export function useMarkFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      flashcardId,
      needsReview,
    }: MarkFlashcardRequest): Promise<Flashcard> => {
      const res = await apiFetch(`/api/flashcards/${flashcardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ needs_review: needsReview }),
      });

      if (!res.ok) {
        throw new Error("Failed to update flashcard");
      }

      const json = await res.json();
      return json.flashcard;
    },
    onSuccess: () => {
      // Invalidate all flashcard queries for this dashboard
      queryClient.invalidateQueries({
        queryKey: flashcardKeys.lists(),
      });
    },
  });
}
