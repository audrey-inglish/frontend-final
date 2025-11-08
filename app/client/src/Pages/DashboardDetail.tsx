import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useAuth } from "react-oidc-context";
import {
  useGetDashboard,
  useUpdateDashboard,
  useGetNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useGenerateConcepts,
  useGetConcepts,
} from "../hooks";
import { showErrorToast, showSuccessToast } from "../lib/toasts";
import {
  Navbar,
  DashboardForm,
  NoteForm,
  NoteCard,
  LoadingSpinner,
  EmptyState,
  ConceptList,
} from "../components";
import type { DashboardUpdate } from "../schemas/dashboard";
import type { NoteCreate, NoteUpdate } from "../schemas/note";

export default function DashboardDetail() {
  const { id } = useParams();
  const dashboardId = Number(id);
  const auth = useAuth();

  const isAuthReady = auth.isAuthenticated && !auth.isLoading;
  const { data: dashboard, isLoading: dashboardLoading } = useGetDashboard(
    dashboardId,
    isAuthReady
  );
  const { data: notes, isLoading: notesLoading } = useGetNotes(
    dashboardId,
    isAuthReady
  );
  const { data: conceptsData, isLoading: conceptsLoading } = useGetConcepts(
    dashboardId,
    isAuthReady
  );
  const updateDashboard = useUpdateDashboard();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const generateConcepts = useGenerateConcepts();

  // Dashboard edit state
  const [isEditingDashboard, setIsEditingDashboard] = useState(false);
  const [dashboardTitle, setDashboardTitle] = useState("");
  const [dashboardDescription, setDashboardDescription] = useState("");

  // Note create/edit state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  // Draft key for localStorage
  const draftKey = editingNoteId
    ? `mindset.draft.note.${editingNoteId}`
    : `mindset.draft.dashboard.${dashboardId}`;

  // Initialize note form from draft when opening create form
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
        // Ignore parse errors
      }
    }
  }, [showNoteForm, editingNoteId, draftKey]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // Ignore
    }
  };

  const handleEditDashboard = () => {
    if (dashboard) {
      setDashboardTitle(dashboard.title);
      setDashboardDescription(dashboard.description ?? "");
      setIsEditingDashboard(true);
    }
  };

  const handleUpdateDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboardTitle.trim()) {
      showErrorToast("Title is required");
      return;
    }

    try {
      const data: DashboardUpdate = {
        title: dashboardTitle.trim(),
        description: dashboardDescription.trim() || null,
      };
      await updateDashboard.mutateAsync({ id: dashboardId, data });
      showSuccessToast("Dashboard updated!");
      setIsEditingDashboard(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update dashboard";
      showErrorToast(message);
      console.error(error);
    }
  };

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
      clearDraft(); // Clear draft after successful creation
      setNoteTitle("");
      setNoteContent("");
      setShowNoteForm(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create note";
      showErrorToast(message);
      console.error(error);
    }
  };

  const handleEditNote = (noteId: number, title: string, content: string) => {
    setEditingNoteId(noteId);
    setNoteTitle(title);
    setNoteContent(content);
    setShowNoteForm(true);
  };

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
      clearDraft(); // Clear draft after successful update
      setNoteTitle("");
      setNoteContent("");
      setEditingNoteId(null);
      setShowNoteForm(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update note";
      showErrorToast(message);
      console.error(error);
    }
  };

  const handleDeleteNote = async (noteId: number, title: string) => {
    if (!confirm(`Delete note "${title}"?`)) return;

    try {
      await deleteNote.mutateAsync(noteId);
      showSuccessToast("Note deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete note";
      showErrorToast(message);
      console.error(error);
    }
  };

  const handleCancelNoteForm = () => {
    clearDraft(); // Clear draft on cancel
    setShowNoteForm(false);
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
  };

  const handleGenerateConcepts = async () => {
    if (!notes || notes.length === 0) {
      showErrorToast("Please add notes before generating concepts");
      return;
    }

    try {
      // Combine all note content into one text block
      const combinedText = notes
        .map((note) => `${note.title}\n\n${note.content}`)
        .join("\n\n---\n\n");

      const result = await generateConcepts.mutateAsync({
        text: combinedText,
        dashboard_id: dashboardId, // Pass dashboard_id to save concepts to DB
      });

      showSuccessToast(`Generated ${result.concepts.length} concepts!`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate concepts";
      showErrorToast(message);
      console.error(error);
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to view this dashboard.</p>
      </div>
    );
  }

  const isLoading = dashboardLoading || notesLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showBackButton />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && <LoadingSpinner />}

        {!isLoading && dashboard && (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              {!isEditingDashboard ? (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {dashboard.title}
                      </h2>
                      {dashboard.description && (
                        <p className="text-gray-600">{dashboard.description}</p>
                      )}
                    </div>
                    <button
                      onClick={handleEditDashboard}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                      title="Edit dashboard"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <DashboardForm
                  title={dashboardTitle}
                  description={dashboardDescription}
                  onTitleChange={setDashboardTitle}
                  onDescriptionChange={setDashboardDescription}
                  onSubmit={handleUpdateDashboard}
                  onCancel={() => setIsEditingDashboard(false)}
                  isPending={updateDashboard.isPending}
                  submitLabel="Save"
                />
              )}
            </div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Notes</h3>
              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="btn text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {showNoteForm ? "Cancel" : "+ New Note"}
              </button>
            </div>

            {showNoteForm && (
              <NoteForm
                title={noteTitle}
                content={noteContent}
                onTitleChange={setNoteTitle}
                onContentChange={setNoteContent}
                onSubmit={editingNoteId ? handleUpdateNote : handleCreateNote}
                onCancel={handleCancelNoteForm}
                isPending={createNote.isPending || updateNote.isPending}
                isEditing={!!editingNoteId}
                draftKey={draftKey}
              />
            )}

            {notes && notes.length === 0 && (
              <EmptyState
                title="No notes yet"
                description="Create your first note to get started"
              />
            )}

            {notes && notes.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    id={note.id}
                    title={note.title}
                    content={note.content}
                    uploadedAt={note.uploaded_at}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    isDeleting={deleteNote.isPending}
                  />
                ))}
              </div>
            )}

            {/* Concept Generation Section */}
            {notes && notes.length > 0 && (
              <>
                <div className="flex justify-between items-center mt-8 mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Study Concepts
                  </h3>
                  <button
                    onClick={handleGenerateConcepts}
                    disabled={generateConcepts.isPending}
                    className="btn text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {generateConcepts.isPending ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      "Generate Concepts"
                    )}
                  </button>
                </div>

                {conceptsLoading ? (
                  <LoadingSpinner />
                ) : conceptsData?.concepts && conceptsData.concepts.length > 0 ? (
                  <ConceptList concepts={conceptsData.concepts} />
                ) : (
                  <EmptyState
                    title="No concepts generated yet"
                    description="Click 'Generate Concepts' to extract key concepts from your notes using AI"
                  />
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
