interface FlashcardActionButtonsProps {
  onBack: () => void;
  onRegenerate: () => Promise<void>;
  isGenerating: boolean;
  disableRegenerate?: boolean;
  className?: string;
}

export function FlashcardActionButtons({
  onBack,
  onRegenerate,
  isGenerating,
  disableRegenerate = false,
  className = "",
}: FlashcardActionButtonsProps) {
  const regenDisabled = isGenerating || disableRegenerate;

  return (
    <div className={`flex justify-center gap-4 ${className}`}>
      <button onClick={() => onBack()} className="btn-secondary">
        Back to Dashboard
      </button>
      <button
        onClick={() => onRegenerate()}
        disabled={regenDisabled}
        className="btn-secondary"
      >
        {isGenerating ? "Regenerating..." : "Regenerate Flashcards"}
      </button>
    </div>
  );
}
