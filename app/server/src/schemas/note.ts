import { z } from "zod";

// Note (note_upload table)
export const NoteSchema = z.object({
  id: z.number().int().positive(),
  dashboard_id: z.number().int().positive().nullable(),
  title: z.string().min(1),
  content: z.string().min(1),
  source: z.string().nullable().optional(),
  uploaded_at: z.string(),
});

export const NoteCreateSchema = z.object({
  dashboard_id: z.union([z.number().int().positive(), z.null()]).optional(),
  title: z.string().min(1, "title is required"),
  content: z.string().min(1, "content is required"),
  source: z.string().nullable().optional(),
});

export const NoteUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  source: z.string().nullable().optional(),
});

export const NotesListResponseSchema = z.object({
  notes: z.array(NoteSchema),
});

export type Note = z.infer<typeof NoteSchema>;
export type NoteCreate = z.infer<typeof NoteCreateSchema>;
export type NoteUpdate = z.infer<typeof NoteUpdateSchema>;