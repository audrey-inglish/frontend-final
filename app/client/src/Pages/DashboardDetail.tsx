import { useParams } from "react-router";
import { useAuth } from "react-oidc-context";
import {
  useGetDashboard,
  useGetNotes,
  useNoteEditor,
  useDashboardEditor,
} from "../hooks";
import {
  Navbar,
  DashboardForm,
  LoadingSpinner,
  NotesSection,
  ConceptsSection,
  ProtectedRoute,
  StudyTools,
} from "../components";
import { EditIcon } from "../components/icons";
import { ConceptGenerationProvider, useConceptGeneration } from "../contexts";
import type { Dashboard } from "../schemas/dashboard";
import type { Note } from "../schemas/note";

function DashboardContent({ 
  dashboard, 
  notes, 
  noteEditor, 
  dashboardEditor 
}: { 
  dashboard: Dashboard; 
  notes: Note[] | undefined; 
  noteEditor: ReturnType<typeof useNoteEditor>; 
  dashboardEditor: ReturnType<typeof useDashboardEditor>; 
}) {
  const { concepts, isGenerating, regenerateConcepts, status, isReady } = useConceptGeneration();

  return (
    <>
      <div className="card p-6 mb-6">
        {!dashboardEditor.isEditing ? (
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
                onClick={dashboardEditor.handleEdit}
                className="text-neutral-600 hover:text-accent-600 transition-colors"
                title="Edit dashboard"
              >
                <EditIcon className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <DashboardForm
            title={dashboardEditor.title}
            description={dashboardEditor.description}
            onTitleChange={dashboardEditor.setTitle}
            onDescriptionChange={dashboardEditor.setDescription}
            onSubmit={dashboardEditor.handleUpdate}
            onCancel={dashboardEditor.handleCancel}
            isPending={dashboardEditor.isUpdating}
            submitLabel="Save"
          />
        )}
      </div>

      {/* Study tools section */}
      {notes && notes.length > 0 && (
        <StudyTools dashboardId={dashboard.id} conceptsReady={isReady} />
      )}

      {/* Two-column layout: Notes on left, Concepts on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Notes Section */}
        <NotesSection notes={notes} noteEditor={noteEditor} />

        {/* Right Column - Concepts Section */}
        {notes && notes.length > 0 && (
          <ConceptsSection
            concepts={concepts}
            isLoading={status === 'idle' && !concepts}
            isGenerating={isGenerating}
            onGenerate={regenerateConcepts}
            status={status}
          />
        )}
      </div>
    </>
  );
}

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

  // Custom hooks for managing different sections
  const noteEditor = useNoteEditor({ dashboardId });
  const dashboardEditor = useDashboardEditor({ dashboard });

  const isLoading = dashboardLoading || notesLoading;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar showBackButton />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading && <LoadingSpinner />}

          {!isLoading && dashboard && (
            <ConceptGenerationProvider dashboardId={dashboardId} notes={notes}>
              <DashboardContent
                dashboard={dashboard}
                notes={notes}
                noteEditor={noteEditor}
                dashboardEditor={dashboardEditor}
              />
            </ConceptGenerationProvider>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
