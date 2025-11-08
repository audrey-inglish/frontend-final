import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiFetch from "../lib/apiFetch";
import { ConceptsArraySchema, type Concept } from "../schemas/concept";

interface GenerateConceptsRequest {
  text: string;
  dashboard_id?: number;
}

interface ConceptsResponse {
  concepts: Concept[];
}

export const conceptKeys = {
  all: ["concepts"] as const,
  lists: () => [...conceptKeys.all, "list"] as const,
  list: (dashboardId?: number) =>
    [...conceptKeys.lists(), { dashboardId }] as const,
};

// Fetch concepts for a specific dashboard
export function useGetConcepts(dashboardId: number, enabled = true) {
  return useQuery({
    queryKey: conceptKeys.list(dashboardId),
    queryFn: async (): Promise<ConceptsResponse> => {
      const res = await apiFetch(
        `/api/concepts?dashboard_id=${dashboardId}`,
        {
          method: "GET",
        }
      );
      const json = await res.json();

      // Validate the response shape
      const validated = ConceptsArraySchema.parse(json.concepts);
      return { concepts: validated };
    },
    enabled,
  });
}

export function useGenerateConcepts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: GenerateConceptsRequest
    ): Promise<ConceptsResponse> => {
      const res = await apiFetch("/api/parseNotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      // Validate using unified schema (works for both AI-generated and DB concepts)
      const validated = ConceptsArraySchema.parse(json.concepts);
      return { concepts: validated };
    },
    onSuccess: (_, variables) => {
      // Invalidate concept lists when new concepts are generated
      if (variables.dashboard_id) {
        queryClient.invalidateQueries({
          queryKey: conceptKeys.list(variables.dashboard_id),
        });
      }
    },
  });
}
