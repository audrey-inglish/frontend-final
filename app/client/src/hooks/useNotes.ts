import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiFetch from "../lib/apiFetch";
import { NotesListResponseSchema } from "../schemas/note";
import type { Note, NoteCreate, NoteUpdate } from "../schemas/note";

export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  list: (dashboardId?: number | null) =>
    [...noteKeys.lists(), { dashboardId }] as const,
  details: () => [...noteKeys.all, "detail"] as const,
  detail: (id: number) => [...noteKeys.details(), id] as const,
};

export function useGetNotes(dashboardId?: number | null) {
  return useQuery({
    queryKey: noteKeys.list(dashboardId),
    queryFn: async (): Promise<Note[]> => {
      const url = dashboardId
        ? `/api/notes?dashboard_id=${dashboardId}`
        : "/api/notes";
      const res = await apiFetch(url);
      const json = await res.json();
      const parsed = NotesListResponseSchema.parse(json);
      return parsed.notes;
    },
  });
}

export function useGetNote(id: number | null | undefined) {
  return useQuery({
    queryKey: noteKeys.detail(id ?? 0),
    queryFn: async (): Promise<Note> => {
      if (!id) throw new Error("Note ID is required");
      const res = await apiFetch(`/api/notes/${id}`);
      const json = await res.json();
      // Server returns { note: Note }
      if (json.note) {
        return json.note as Note;
      }
      throw new Error("Invalid note response");
    },
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NoteCreate): Promise<Note> => {
      const res = await apiFetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.note) {
        return json.note as Note;
      }
      throw new Error("Invalid note response");
    },
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      if (newNote.dashboard_id) {
        queryClient.invalidateQueries({
          queryKey: noteKeys.list(newNote.dashboard_id),
        });
      }
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: NoteUpdate;
    }): Promise<Note> => {
      const res = await apiFetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      // Server returns { note: Note }
      if (json.note) {
        return json.note as Note;
      }
      throw new Error("Invalid note response");
    },
    onSuccess: (updatedNote) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: noteKeys.detail(updatedNote.id),
      });
      if (updatedNote.dashboard_id) {
        queryClient.invalidateQueries({
          queryKey: noteKeys.list(updatedNote.dashboard_id),
        });
      }
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiFetch(`/api/notes/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.removeQueries({ queryKey: noteKeys.detail(deletedId) });
    },
  });
}
