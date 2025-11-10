import { z } from "zod";

export const FlashcardSchema = z.object({
	front: z.string().min(1),
	back: z.string().min(1),
});

export const FlashcardsArraySchema = z.array(FlashcardSchema);

export const FlashcardSetSchema = z.object({
	id: z.number().optional(),
	dashboard_id: z.number().optional(),
	title: z.string().min(1),
});

export type Flashcard = z.infer<typeof FlashcardSchema>;
export type FlashcardSet = z.infer<typeof FlashcardSetSchema>;

