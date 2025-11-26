import DashboardForm from "../dashboard/DashboardForm";
import { EditIcon } from "../icons";
import type { Dashboard } from "../../schemas/dashboard";

interface DashboardHeaderProps {
  dashboard: Dashboard;
  isEditing: boolean;
  title: string;
  description: string;
  onEdit: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function DashboardHeader({
  dashboard,
  isEditing,
  title,
  description,
  onEdit,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
  isPending,
}: DashboardHeaderProps) {
  return (
    <div className="card p-6 mb-6">
      {!isEditing ? (
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">
              {dashboard.title}
            </h2>
            {dashboard.description && (
              <p className="text-neutral-600">{dashboard.description}</p>
            )}
          </div>
          <button
            onClick={onEdit}
            className="text-neutral-600 hover:text-accent-600 transition-colors"
            title="Edit dashboard"
          >
            <EditIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <DashboardForm
          title={title}
          description={description}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
          isPending={isPending}
          submitLabel="Save"
        />
      )}
    </div>
  );
}
