import { z } from "zod";

export const FlashcardSchema = z.object({
	id: z.number().optional(),
	flashcard_set_id: z.number().optional(),
	front: z.string().min(1),
	back: z.string().min(1),
	created_at: z.string().optional(),
	mastery_score: z.number().optional(),
	needs_review: z.boolean().optional(),
	last_reviewed: z.string().nullable().optional(),
});

export const FlashcardsArraySchema = z.array(FlashcardSchema);

export const FlashcardSetSchema = z.object({
	id: z.number().optional(),
	dashboard_id: z.number().optional(),
	title: z.string().min(1),
});

export type Flashcard = z.infer<typeof FlashcardSchema>;
export type FlashcardSet = z.infer<typeof FlashcardSetSchema>;

