import { z } from "zod";

// Unified schema that handles both AI-generated and database-persisted concepts
export const ConceptSchema = z.object({
  concept_title: z.string(),
  concept_summary: z.string(),
  examples: z.array(z.string()).optional().nullable(),
  
  // Database fields (only present when retrieved from DB)
  id: z.number().optional(),
  dashboard_id: z.number().optional(),
  mastery_score: z.number().optional(),
  updated_at: z.string().optional(),
});

export const ConceptsArraySchema = z.array(ConceptSchema);

export type Concept = z.infer<typeof ConceptSchema>;
