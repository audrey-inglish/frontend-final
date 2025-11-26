import { useNavigate } from "react-router";

interface ApiKeyRequiredProps {
  dashboardId: number;
}

export function ApiKeyRequired({ dashboardId }: ApiKeyRequiredProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
          API Key Required
        </h2>
        <p className="text-primary-600 mb-6">
          You need to configure an API key to use the AI study session feature.
        </p>
        <button onClick={() => navigate("/settings")} className="btn">
          Go to Settings
        </button>
        <button
          onClick={() => navigate(`/dashboard/${dashboardId}`)}
          className="btn-secondary ml-3"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
