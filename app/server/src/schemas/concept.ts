import { z } from "zod";

export const ConceptSchema = z.object({
  concept_title: z.string(),
  concept_summary: z.string(),
  examples: z.array(z.string()).optional(),
});

export const ConceptsArraySchema = z.array(ConceptSchema);

export type Concept = z.infer<typeof ConceptSchema>;
