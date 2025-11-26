import { Link } from "react-router";

interface DashboardHeaderProps {
  lastDashboard: number | null;
  dashboards?: { id: number }[];
  onNewDashboard: () => void;
  showCreateForm: boolean;
}

export function DashboardHeader({
  lastDashboard,
  dashboards,
  onNewDashboard,
  showCreateForm,
}: DashboardHeaderProps) {
  const hasLastDashboard = lastDashboard && dashboards?.some((d) => d.id === lastDashboard);

  return (
    <div className="flex justify-between items-start mb-6">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-neutral-800">My Dashboards</h2>
        {hasLastDashboard && (
          <Link
            to={`/dashboard/${lastDashboard}`}
            className="text-xs text-neutral-400 mt-1 hover:underline hover:text-neutral-500"
          >
            Continue where you left off
          </Link>
        )}
      </div>
      <button
        onClick={onNewDashboard}
        className="btn py-1 px-4 text-xl sm:text-sm sm:py-2 sm:px-4 flex justify-center"
        aria-label={showCreateForm ? "Cancel create dashboard" : "Create new dashboard"}
      >
        {showCreateForm ? (
          <>
            <span className="sm:hidden">✕</span>
            <span className="hidden sm:inline">Cancel</span>
          </>
        ) : (
          <>
            <span className="sm:hidden">+</span>
            <span className="hidden sm:inline">+ New Dashboard</span>
          </>
        )}
      </button>
    </div>
  );
}
