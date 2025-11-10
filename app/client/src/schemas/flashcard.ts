import { z } from "zod";

export const FlashcardSchema = z.object({
  front: z.string(),
  back: z.string(),
  
  // Database fields (only present when retrieved from DB)
  id: z.number().optional(),
  flashcard_set_id: z.number().optional(),
  created_at: z.string().optional(),
  mastery_score: z.number().optional().nullable(),
});

export const FlashcardsArraySchema = z.array(FlashcardSchema);
export const FlashcardSetSchema = z.object({
  id: z.number().optional(),
  dashboard_id: z.number().optional(),
  title: z.string(),
});

export type Flashcard = z.infer<typeof FlashcardSchema>;
export type FlashcardSet = z.infer<typeof FlashcardSetSchema>;
