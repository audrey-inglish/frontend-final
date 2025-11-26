import { DashboardForm } from "../dashboard/DashboardForm";

interface CreateDashboardFormProps {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function CreateDashboardForm({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
  isPending,
}: CreateDashboardFormProps) {
  return (
    <div className="bg-custom-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Create Dashboard</h3>
      <DashboardForm
        title={title}
        description={description}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isPending={isPending}
        submitLabel="Create"
      />
    </div>
  );
}
