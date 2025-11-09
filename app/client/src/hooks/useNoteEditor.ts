import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "../lib/toasts";
import { useCreateNote, useUpdateNote, useDeleteNote } from "./useNotes";
import type { NoteCreate, NoteUpdate } from "../schemas/note";

interface UseNoteEditorOptions {
  dashboardId: number;
}


export function useNoteEditor({ dashboardId }: UseNoteEditorOptions) {
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  // Form visibility and edit state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  // Form field state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  // Draft key for localStorage - different key for create vs edit
  const draftKey = editingNoteId
    ? `mindset.draft.note.${editingNoteId}`
    : `mindset.draft.dashboard.${dashboardId}`;

  // Load draft from localStorage when opening create form (not edit)
  useEffect(() => {
    if (showNoteForm && !editingNoteId) {
      try {
        const draft = localStorage.getItem(draftKey);
        if (draft) {
          const { title, content } = JSON.parse(draft);
          if (title) setNoteTitle(title);
          if (content) setNoteContent(content);
        }
      } catch {
        // Ignore parse errors - corrupted draft data
      }
    }
  }, [showNoteForm, editingNoteId, draftKey]);

  // Clear draft from localStorage
  const clearDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // Ignore errors
    }
  };

  // Handler: Create a new note
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!noteTitle.trim() || !noteContent.trim()) {
      showErrorToast("Title and content are required");
      return;
    }

    try {
      const data: NoteCreate = {
        dashboard_id: dashboardId,
        title: noteTitle.trim(),
        content: noteContent.trim(),
      };
      await createNote.mutateAsync(data);
      showSuccessToast("Note created!");
      clearDraft();
      setNoteTitle("");
      setNoteContent("");
      setShowNoteForm(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create note";
      showErrorToast(message);
      console.error(error);
    }
  };

  // Handler: Open edit form with existing note data
  const handleEditNote = (noteId: number, title: string, content: string) => {
    setEditingNoteId(noteId);
    setNoteTitle(title);
    setNoteContent(content);
    setShowNoteForm(true);
  };

  // Handler: Update an existing note
  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingNoteId || !noteTitle.trim() || !noteContent.trim()) {
      showErrorToast("Title and content are required");
      return;
    }

    try {
      const data: NoteUpdate = {
        title: noteTitle.trim(),
        content: noteContent.trim(),
      };
      await updateNote.mutateAsync({ id: editingNoteId, data });
      showSuccessToast("Note updated!");
      clearDraft();
      setNoteTitle("");
      setNoteContent("");
      setEditingNoteId(null);
      setShowNoteForm(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update note";
      showErrorToast(message);
      console.error(error);
    }
  };

  // Handler: Delete a note (with confirmation)
  const handleDeleteNote = async (noteId: number, title: string) => {
    if (!confirm(`Delete note "${title}"?`)) return;

    try {
      await deleteNote.mutateAsync(noteId);
      showSuccessToast("Note deleted");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete note";
      showErrorToast(message);
      console.error(error);
    }
  };

  // Handler: Cancel form and clear state
  const handleCancelNoteForm = () => {
    clearDraft();
    setShowNoteForm(false);
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
  };

  // Handler: Toggle form visibility
  const handleToggleNoteForm = () => {
    setShowNoteForm(!showNoteForm);
  };

  return {
    showNoteForm,
    editingNoteId,
    noteTitle,
    noteContent,
    draftKey,
    setNoteTitle,
    setNoteContent,
    handleCreateNote,
    handleEditNote,
    handleUpdateNote,
    handleDeleteNote,
    handleCancelNoteForm,
    handleToggleNoteForm,
    isCreating: createNote.isPending,
    isUpdating: updateNote.isPending,
    isDeleting: deleteNote.isPending,
    isPending: createNote.isPending || updateNote.isPending,
  };
}
