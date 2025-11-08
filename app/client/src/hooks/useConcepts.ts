import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiFetch from "../lib/apiFetch";
import { ConceptsArraySchema, type Concept } from "../schemas/concept";

interface GenerateConceptsRequest {
  text: string;
}

interface GenerateConceptsResponse {
  concepts: Concept[];
}

export const conceptKeys = {
  all: ["concepts"] as const,
  lists: () => [...conceptKeys.all, "list"] as const,
  list: (dashboardId?: number) =>
    [...conceptKeys.lists(), { dashboardId }] as const,
};

export function useGenerateConcepts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: GenerateConceptsRequest
    ): Promise<GenerateConceptsResponse> => {
      const res = await apiFetch("/api/parseNotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      
      // Validate the response shape
      const validated = ConceptsArraySchema.parse(json.concepts);
      return { concepts: validated };
    },
    onSuccess: () => {
      // Invalidate concept lists when new concepts are generated
      queryClient.invalidateQueries({ queryKey: conceptKeys.lists() });
    },
  });
}
