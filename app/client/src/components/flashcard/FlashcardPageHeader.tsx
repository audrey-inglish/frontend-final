import { Link } from 'react-router';

interface FlashcardPageHeaderProps {
  dashboardTitle: string;
  dashboardId: number;
  onRegenerate?: () => Promise<void>;
  isGenerating?: boolean;
}

export function FlashcardPageHeader({ 
  dashboardTitle, 
  dashboardId,
  onRegenerate,
  isGenerating = false
}: FlashcardPageHeaderProps) {
  return (
    <div className="mb-8">
      <Link 
        to={`/dashboard/${dashboardId}`}
        className="inline-flex items-center text-primary-400 hover:text-primary-600 mb-8"
      >
        Back to Dashboard
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-800 mb-2">
            Flashcards: {dashboardTitle}
          </h1>
          <p className="text-primary-600">
            Study with AI-generated flashcards from your notes
          </p>
        </div>
        {onRegenerate && (
          <button
            onClick={() => onRegenerate()}
            disabled={isGenerating}
            className="btn-secondary bg-accent-200 text-blue-white hover:bg-accent-300 px-6"
          >
            {isGenerating ? "Regenerating..." : "Regenerate Flashcards"}
          </button>
        )}
      </div>
    </div>
  );
}
