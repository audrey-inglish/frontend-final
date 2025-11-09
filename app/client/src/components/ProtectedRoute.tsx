import type { ReactNode } from "react";
import { useAuth } from "react-oidc-context";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Wrapper component that protects routes requiring authentication.
 */
export default function ProtectedRoute({
  children,
  fallback,
  loadingFallback,
}: ProtectedRouteProps) {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      loadingFallback ?? (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )
    );
  }

  if (!auth.isAuthenticated) {
    return (
      fallback ?? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-neutral-700 mb-4">
              Please sign in to view this page.
            </p>
            <button
              onClick={() => auth.signinRedirect()}
              className="btn"
            >
              Sign In
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
