import type { ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { CloseIcon } from "../icons";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-custom-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-custom-red-500 rounded-full mb-4">
          <CloseIcon className="w-6 h-6 text-custom-red-100" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 text-center mb-2">
          Something went wrong
        </h2>
        <p className="text-neutral-600 text-center mb-4">
          An unexpected error occurred. Please try again.
        </p>
        <details className="mb-4">
          <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-700">
            Error details
          </summary>
          <pre className="mt-2 p-3 bg-neutral-50 rounded text-xs overflow-auto text-custom-red-600">
            {error.message}
          </pre>
        </details>
        <button
          onClick={resetErrorBoundary}
          className="btn w-full block"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.href = "/";
      }}
      onError={(error, errorInfo) => {
        console.error("Error caught by boundary:", error, errorInfo);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
