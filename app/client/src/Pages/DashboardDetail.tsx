import { useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "react-oidc-context";
import {
  useGetDashboard,
  useUpdateDashboard,
  useGetNotes,
  useGenerateConcepts,
  useGetConcepts,
  useNoteEditor,
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
import { EditIcon, SpinnerIcon, LightbulbIcon } from "../components/icons";
import type { DashboardUpdate } from "../schemas/dashboard";
import type { Note } from "../schemas/note";

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
  const generateConcepts = useGenerateConcepts();

  // Note editing logic extracted to custom hook
  const noteEditor = useNoteEditor({ dashboardId });

  // Dashboard edit state
  const [isEditingDashboard, setIsEditingDashboard] = useState(false);
  const [dashboardTitle, setDashboardTitle] = useState("");
  const [dashboardDescription, setDashboardDescription] = useState("");

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
      const message =
        error instanceof Error ? error.message : "Failed to update dashboard";
      showErrorToast(message);
      console.error(error);
    }
  };

  const handleGenerateConcepts = async () => {
    if (!notes || notes.length === 0) {
      showErrorToast("Please add notes before generating concepts");
      return;
    }

    try {
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
    <div className="min-h-screen bg-neutral-100">
      <Navbar showBackButton />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && <LoadingSpinner />}

        {!isLoading && dashboard && (
          <>
            <div className="card p-6 mb-6">
              {!isEditingDashboard ? (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-800 mb-2">
                        {dashboard.title}
                      </h2>
                      {dashboard.description && (
                        <p className="text-neutral-600">
                          {dashboard.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleEditDashboard}
                      className="text-neutral-600 hover:text-accent-600 transition-colors"
                      title="Edit dashboard"
                    >
                      <EditIcon className="w-5 h-5" />
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

            {/* Two-column layout: Notes on left, Concepts on right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Notes Section */}
              <div className="lg:col-span-2 pr-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-neutral-800">Notes</h3>
                  <button
                    onClick={noteEditor.handleToggleNoteForm}
                    className="btn text-sm"
                  >
                    {noteEditor.showNoteForm ? "Cancel" : "+ New Note"}
                  </button>
                </div>

                {noteEditor.showNoteForm && (
                  <NoteForm
                    title={noteEditor.noteTitle}
                    content={noteEditor.noteContent}
                    onTitleChange={noteEditor.setNoteTitle}
                    onContentChange={noteEditor.setNoteContent}
                    onSubmit={
                      noteEditor.editingNoteId
                        ? noteEditor.handleUpdateNote
                        : noteEditor.handleCreateNote
                    }
                    onCancel={noteEditor.handleCancelNoteForm}
                    isPending={noteEditor.isPending}
                    isEditing={!!noteEditor.editingNoteId}
                    draftKey={noteEditor.draftKey}
                  />
                )}

                {notes && notes.length === 0 && (
                  <EmptyState
                    title="No notes yet"
                    description="Create your first note to get started"
                  />
                )}

                {notes && notes.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {notes.map((note: Note) => (
                      <NoteCard
                        key={note.id}
                        id={note.id}
                        title={note.title}
                        content={note.content}
                        uploadedAt={note.uploaded_at}
                        onEdit={noteEditor.handleEditNote}
                        onDelete={noteEditor.handleDeleteNote}
                        isDeleting={noteEditor.isDeleting}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Concepts Section */}
              {notes && notes.length > 0 && (
                <div className="lg:col-span-1">
                  {/* Sticky wrapper so concepts stay visible while scrolling */}
                  <div className="lg:sticky lg:top-8">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold text-neutral-900">
                        Study Concepts
                      </h3>
                      <button
                        onClick={handleGenerateConcepts}
                        disabled={generateConcepts.isPending}
                        className="btn flex items-center gap-2 text-sm"
                        title="Generate study concepts from notes"
                      >
                        {generateConcepts.isPending ? (
                          <>
                            <SpinnerIcon className="animate-spin h-4 w-4" />
                            <span className="hidden sm:inline">Generating...</span>
                          </>
                        ) : (
                          <>
                            <LightbulbIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Generate</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Max height with scroll for concepts */}
                    <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                      {conceptsLoading ? (
                        <LoadingSpinner />
                      ) : conceptsData?.concepts &&
                        conceptsData.concepts.length > 0 ? (
                        <ConceptList concepts={conceptsData.concepts} />
                      ) : (
                        <EmptyState
                          title="No concepts yet"
                          description="Generate AI-powered study concepts from your notes"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
