import { BrowserRouter, Routes, Route } from "react-router";
import { useAuth } from "react-oidc-context";
import { setTokenProvider } from "./lib/apiFetch";
import ErrorBoundary from "./components/validation/ErrorBoundary";
import Home from "./Pages/dashboard/Home";
import Preview from "./Pages/Preview";
import DashboardDetail from "./Pages/dashboard/DashboardDetail";
import FlashcardsPage from "./Pages/study/FlashcardsPage";
import QuizPage from "./Pages/study/QuizPage";
import StatsPage from "./Pages/dashboard/StatsPage";
import StudySessionPage from "./Pages/study/StudySessionPage";
import AuthCallback from "./Pages/AuthCallback";
import AdminAiMonitorPage from "./Pages/AdminAiMonitorPage";

function App() {
  const auth = useAuth();

  setTokenProvider(
    () => (auth.user?.access_token as string | undefined) ?? null
  );

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/dashboard/:id" element={<DashboardDetail />} />
          <Route path="/dashboard/:id/flashcards" element={<FlashcardsPage />} />
          <Route path="/dashboard/:id/quiz" element={<QuizPage />} />
          <Route path="/dashboard/:id/stats" element={<StatsPage />} />
          <Route path="/dashboard/:id/study" element={<StudySessionPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/admin/ai-monitor" element={<AdminAiMonitorPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
