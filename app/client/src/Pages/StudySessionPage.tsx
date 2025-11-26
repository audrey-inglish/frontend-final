import { useParams, useNavigate } from "react-router";
import { useAuth } from "react-oidc-context";
import { useGetDashboard, useGetNotes } from "../hooks";
import { Navbar, LoadingSpinner, ProtectedRoute } from "../components";
import {
  ApiKeyRequired,
  GeneratingConcepts,
  NoTopicsFound,
  StudySessionWrapper,
} from "../components/study";
import { extractStudyTopics } from "../lib/studyTopicExtractor";
import { useLocalStorage } from "../lib/useLocalStorage";
import { ConceptGenerationProvider, useConceptGeneration } from "../contexts";
import type { Dashboard } from "../schemas/dashboard";
import type { Note } from "../schemas/note";

function StudySessionContent({
  dashboard,
  notes,
  apiKey,
  dashboardId,
  onComplete,
  onGoBack,
}: {
  dashboard: Dashboard;
  notes: Note[];
  apiKey: string;
  dashboardId: number;
  onComplete: () => void;
  onGoBack: () => void;
}) {
  const { concepts, isGenerating, status } = useConceptGeneration();
  const topics = extractStudyTopics(notes || [], concepts);

  if (isGenerating || status === "generating") {
    return <GeneratingConcepts />;
  }

  if (topics.length === 0) {
    return <NoTopicsFound onGoBack={onGoBack} />;
  }

  return (
    <StudySessionWrapper
      dashboard={dashboard}
      topics={topics}
      apiKey={apiKey}
      dashboardId={dashboardId}
      onComplete={onComplete}
    />
  );
}

export default function StudySessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dashboardId = Number(id);
  const auth = useAuth();

  // Get API key from env variable first, fallback to localStorage
  const [storedApiKey] = useLocalStorage<string>('agent-api-key', '');
  const apiKey = import.meta.env.VITE_AGENT_API_KEY || storedApiKey;

  const isAuthReady = auth.isAuthenticated && !auth.isLoading;
  const { data: dashboard, isLoading: dashboardLoading } = useGetDashboard(
    dashboardId,
    isAuthReady
  );
  const { data: notes, isLoading: notesLoading } = useGetNotes(
    dashboardId,
    isAuthReady
  );

  const isLoading = dashboardLoading || notesLoading;

  const handleComplete = () => {
    navigate(`/dashboard/${dashboardId}`);
  };

  const handleGoBack = () => {
    navigate(`/dashboard/${dashboardId}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar showBackButton />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading && <LoadingSpinner />}

          {!isLoading && !apiKey && <ApiKeyRequired dashboardId={dashboardId} />}

          {!isLoading && apiKey && dashboard && notes && (
            <ConceptGenerationProvider dashboardId={dashboardId} notes={notes}>
              <StudySessionContent
                dashboard={dashboard}
                notes={notes}
                apiKey={apiKey}
                dashboardId={dashboardId}
                onComplete={handleComplete}
                onGoBack={handleGoBack}
              />
            </ConceptGenerationProvider>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
