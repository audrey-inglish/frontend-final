interface FlashcardEmptyStateProps {
  onGenerate: () => void;
  isGenerating: boolean;
  hasNotes: boolean;
}

export function FlashcardEmptyState({
  onGenerate,
  isGenerating,
  hasNotes,
}: FlashcardEmptyStateProps) {
  return (
    <div className="card p-8 text-center">
      <h3 className="text-xl font-semibold text-primary-700 mb-4">
        Ready to study?
      </h3>
      <p className="text-primary-400 mb-6">
        Generate flashcards from your notes to begin studying
      </p>
      <button
        onClick={onGenerate}
        disabled={isGenerating || !hasNotes}
        className="btn"
      >
        {isGenerating ? "Generating..." : "Generate Flashcards"}
      </button>
      {!hasNotes && (
        <p className="text-custom-red-500 mt-4 text-sm">
          Add some notes to your dashboard first
        </p>
      )}
    </div>
  );
}
