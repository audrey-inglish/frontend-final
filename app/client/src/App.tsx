import { BrowserRouter, Routes, Route } from "react-router";
import { useAuth } from "react-oidc-context";
import { setTokenProvider } from "./lib/apiFetch";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./Pages/Home";
import DashboardDetail from "./Pages/DashboardDetail";
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
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
