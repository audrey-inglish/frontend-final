import { BrowserRouter, Routes, Route } from "react-router";
import { useAuth } from "react-oidc-context";
import { setTokenProvider } from "./lib/apiFetch";
import ErrorBoundary from "./components/validation/ErrorBoundary";
import Home from "./Pages/Home";
import DashboardDetail from "./Pages/DashboardDetail";
import FlashcardsPage from "./Pages/FlashcardsPage";
import AuthCallback from "./Pages/AuthCallback";
import "./App.css";

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
          <Route path="/dashboard/:id" element={<DashboardDetail />} />
          <Route path="/dashboard/:id/flashcards" element={<FlashcardsPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
