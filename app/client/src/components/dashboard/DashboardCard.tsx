import { Link } from "react-router";
import { DeleteIcon } from "../icons";

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
          <DeleteIcon className="w-5 h-5" />
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
            className="btn bg-accent-200 block text-center rounded-lg"
          >
            Open
          </Link>
        </div>
      </div>
      </div>
  );
}
