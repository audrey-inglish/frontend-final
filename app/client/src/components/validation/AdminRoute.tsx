import { type ReactNode, useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import apiFetch, { HttpError } from "../../lib/apiFetch";
import LoadingSpinner from "../LoadingSpinner";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const auth = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      if (!auth.isAuthenticated) return;

      setIsAdmin(null);
      setError(null);

      try {
        const res = await apiFetch("/api/admin");
        const text = await res.text();

        if (!mounted) return;

        setIsAdmin(text.toLowerCase().includes("user is an admin"));
      } catch (err) {
        if (!mounted) return;

        if (err instanceof HttpError && err.status === 403) {
          setIsAdmin(false);
        } else {
          setError(err instanceof Error ? err.message : String(err));
          setIsAdmin(false);
        }
      }
    }

    void checkAdmin();

    return () => {
      mounted = false;
    };
  }, [auth.isAuthenticated]);

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-neutral-700 mb-4">
            Please sign in to view this page.
          </p>
          <button onClick={() => auth.signinRedirect()} className="btn">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center card p-8 max-w-md">
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">
            Access Denied
          </h2>
          <p className="text-neutral-600 mb-6">
            You do not have administrator permissions to view this page.
          </p>
          {error && (
            <p className="text-sm text-custom-red-600 mb-4">Error: {error}</p>
          )}
          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
