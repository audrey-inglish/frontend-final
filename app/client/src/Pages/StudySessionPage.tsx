import { useParams, useNavigate } from 'react-router';
import { useAuth } from 'react-oidc-context';
import { useGetDashboard, useGetNotes } from '../hooks';
import { Navbar, LoadingSpinner, ProtectedRoute } from '../components';
import { StudySession } from '../components/study';
import { extractStudyTopics, getStudySessionTitle } from '../lib/studyTopicExtractor';
import { useLocalStorage } from '../lib/useLocalStorage';
import { ConceptGenerationProvider, useConceptGeneration } from '../contexts';
import { SpinnerIcon } from '../components/icons';
import type { Dashboard } from '../schemas/dashboard';
import type { Note } from '../schemas/note';

function StudySessionContent({ 
  dashboard,
  notes,
  apiKey, 
  dashboardId, 
  onComplete,
  onGoBack 
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

  if (isGenerating || status === 'generating') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <div className="flex justify-center mb-4">
            <SpinnerIcon className="w-12 h-12 text-primary-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            Generating Study Concepts
          </h2>
          <p className="text-primary-600 mb-2">
            Please wait while we analyze your notes and extract key concepts for your study session.
          </p>
          <p className="text-sm text-neutral-500">
            This usually takes just a few moments...
          </p>
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">No Topics Found</h2>
          <p className="text-primary-600 mb-6">
            Please add some notes or generate concepts before starting a study session.
          </p>
          <button onClick={onGoBack} className="btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">
          {getStudySessionTitle(dashboard.title)}
        </h1>
        <p className="text-primary-600 mt-2">
          AI-guided study session covering {topics.length} topic{topics.length !== 1 ? 's' : ''}
        </p>
      </div>

      <StudySession
        topics={topics}
        apiKey={apiKey}
        dashboardId={dashboardId}
        onComplete={onComplete}
      />
    </>
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

          {!isLoading && !apiKey && (
            <div className="max-w-2xl mx-auto">
              <div className="card p-8 text-center">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">API Key Required</h2>
                <p className="text-primary-600 mb-6">
                  You need to configure an API key to use the AI study session feature.
                </p>
                <button
                  onClick={() => navigate('/settings')}
                  className="btn"
                >
                  Go to Settings
                </button>
                <button
                  onClick={handleGoBack}
                  className="btn-secondary ml-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

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
