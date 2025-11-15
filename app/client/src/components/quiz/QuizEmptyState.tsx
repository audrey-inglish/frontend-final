import { ClipboardIcon } from "../icons";

interface QuizEmptyStateProps {
  hasNotes: boolean;
  onGoToDashboard: () => void;
}

export function QuizEmptyState({ hasNotes, onGoToDashboard }: QuizEmptyStateProps) {
  if (!hasNotes) {
    return (
      <div className="card p-8 text-center">
        <h3 className="text-xl font-semibold text-primary-700 mb-4">
          No notes yet
        </h3>
        <p className="text-primary-600 mb-6">
          Add some notes to your dashboard before generating a quiz
        </p>
        <button onClick={onGoToDashboard} className="btn">
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="card p-8 text-center">
      <h3 className="text-xl font-semibold text-primary-700 mb-4">
        Ready to test your knowledge?
      </h3>
      <p className="text-primary-600 mb-6">
        Configure your quiz settings and click "Generate Quiz" to begin
      </p>
      <div className="text-primary-500">
        <ClipboardIcon className="w-24 h-24 mx-auto opacity-50" />
      </div>
    </div>
  );
}
