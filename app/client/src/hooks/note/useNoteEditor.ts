import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "../../lib/toasts";
import { useCreateNote, useUpdateNote, useDeleteNote } from "./useNotes";
import { useImageToText } from "../concept/useImageToText";
import type { NoteCreate, NoteUpdate } from "../../schemas/note";

interface UseNoteEditorOptions {
  dashboardId: number;
}


export function useNoteEditor({ dashboardId }: UseNoteEditorOptions) {
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const { extractTextFromImage, isProcessing: isProcessingImage } = useImageToText();

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
        const draft = localStorage.getItem(draftKey);
        if (draft) {
          const { title, content } = JSON.parse(draft);
          if (title) setNoteTitle(title);
          if (content) setNoteContent(content);
        }
    }
  }, [showNoteForm, editingNoteId, draftKey]);

  // Clear draft from localStorage
  const clearDraft = () => {
      localStorage.removeItem(draftKey);
  };

  // Handler: Create a new note
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!noteTitle.trim() || !noteContent.trim()) {
      showErrorToast("Title and content are required");
      return;
    }

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
  };

  // Handler: Delete a note (with confirmation)
  const handleDeleteNote = async (noteId: number, title: string) => {
    if (!confirm(`Delete note "${title}"?`)) return;

    await deleteNote.mutateAsync(noteId);
    showSuccessToast("Note deleted");
  };

  // Handler: Cancel form and clear state
  const handleCancelNoteForm = () => {
    setShowNoteForm(false);
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
  };

  // Handler: Toggle form visibility
  const handleToggleNoteForm = () => {
    setShowNoteForm(!showNoteForm);
  };

  // Handler: Upload image and extract text
  const handleImageUpload = async (file: File) => {
    const extractedText = await extractTextFromImage(file);
    
    if (!extractedText || extractedText.trim().length === 0) {
      showErrorToast("No text could be extracted from the image");
      return;
    }

    setNoteContent(extractedText);
    
    // Optionally suggest a title if one isn't set
    if (!noteTitle.trim()) {
      setNoteTitle("Notes from Image");
    }
    
    showSuccessToast("Text extracted from image! You can now edit and save.");
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
    handleImageUpload,
    isProcessingImage,
    isCreating: createNote.isPending,
    isUpdating: updateNote.isPending,
    isDeleting: deleteNote.isPending,
    isPending: createNote.isPending || updateNote.isPending,
  };
}
