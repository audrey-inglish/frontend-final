import { TextInput, TextArea, FormButtons } from "./form";

interface DashboardFormProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel?: string;
}

export default function DashboardForm({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
  isPending,
  submitLabel = "Create",
}: DashboardFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <TextInput
        label="Title"
        value={title}
        onChange={onTitleChange}
        placeholder="e.g., CS 101 Final Exam"
        required
        autoFocus
      />
      <TextArea
        label="Description"
        value={description}
        onChange={onDescriptionChange}
        placeholder="Optional description..."
        rows={3}
      />
      <FormButtons
        onCancel={onCancel}
        isPending={isPending}
        submitLabel={submitLabel}
      />
    </form>
  );
}
