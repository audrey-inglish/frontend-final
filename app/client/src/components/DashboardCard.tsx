import { Link } from "react-router";

interface DashboardCardProps {
  id: number;
  title: string;
  description?: string | null;
  updatedAt: string;
  onDelete: (id: number, title: string) => void;
  isDeleting: boolean;
}

export default function DashboardCard({
  id,
  title,
  description,
  updatedAt,
  onDelete,
  isDeleting,
}: DashboardCardProps) {
  return (
    <div className="card h-full">
      <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <h3>{title}</h3>
        <button
          onClick={() => onDelete(id, title)}
          disabled={isDeleting}
          className="text-neutral-400 hover:text-custom-red-500 transition-colors"
          title="Delete dashboard"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
      {description && (
        <p className="text-neutral-600 text-sm mb-4">{description}</p>
      )}
      <div className="text-xs text-neutral-500 mb-4">
        Updated: {new Date(updatedAt).toLocaleDateString()}
      </div>
        <div className="mt-auto">
          <Link
            to={`/dashboard/${id}`}
            onClick={() => {
              try {
                localStorage.setItem("mindset.lastDashboard", String(id));
              } catch {
                console.log(
                  "Could not retrieve last dashboard from localStorage"
                );
              }
            }}
            className="btn w-full block text-center rounded-lg"
          >
            Open
          </Link>
        </div>
      </div>
      </div>
  );
}
