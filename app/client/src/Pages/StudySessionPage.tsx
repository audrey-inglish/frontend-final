import { useParams, useNavigate } from 'react-router';
import { useAuth } from 'react-oidc-context';
import { useGetDashboard, useGetNotes, useGetConcepts } from '../hooks';
import { Navbar, LoadingSpinner, ProtectedRoute } from '../components';
import { StudySession } from '../components/study';
import { extractStudyTopics, getStudySessionTitle } from '../lib/studyTopicExtractor';
import { useLocalStorage } from '../lib/useLocalStorage';

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
  const { data: conceptsData, isLoading: conceptsLoading } = useGetConcepts(
    dashboardId,
    isAuthReady
  );

  const isLoading = dashboardLoading || notesLoading || conceptsLoading;
  const topics = extractStudyTopics(notes || [], conceptsData?.concepts);

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

          {!isLoading && apiKey && topics.length === 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="card p-8 text-center">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">No Topics Found</h2>
                <p className="text-primary-600 mb-6">
                  Please add some notes or generate concepts before starting a study session.
                </p>
                <button
                  onClick={handleGoBack}
                  className="btn"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}

          {!isLoading && apiKey && topics.length > 0 && dashboard && (
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
                onComplete={handleComplete}
              />
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
