import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  list: (dashboardId?: number) =>
    [...flashcardKeys.lists(), { dashboardId }] as const,
};

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
