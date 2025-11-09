interface FormButtonsProps {
  onCancel: () => void;
  isPending: boolean;
  submitLabel?: string;
  pendingLabel?: string;
  cancelLabel?: string;
  className?: string;
}

export default function FormButtons({
  onCancel,
  isPending,
  submitLabel = "Submit",
  pendingLabel = "Saving...",
  cancelLabel = "Cancel",
  className = "",
}: FormButtonsProps) {
  return (
    <div className={`flex ${className}`}>
      <button
        type="submit"
        disabled={isPending}
        className="btn disabled:opacity-50"
      >
        {isPending ? pendingLabel : submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="btn-secondary"
      >
        {cancelLabel}
      </button>
    </div>
  );
}
