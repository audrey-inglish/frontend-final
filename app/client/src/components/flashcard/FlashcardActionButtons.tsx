interface FlashcardActionButtonsProps {
  onRegenerate: () => Promise<void>;
  isGenerating: boolean;
  disableRegenerate?: boolean;
  className?: string;
}

export function FlashcardActionButtons({
  onRegenerate,
  isGenerating,
  disableRegenerate = false,
  className = "",
}: FlashcardActionButtonsProps) {
  const regenDisabled = isGenerating || disableRegenerate;

  return (
    <div className={`flex justify-center gap-4 ${className}`}>
      <button
        onClick={() => onRegenerate()}
        disabled={regenDisabled}
        className="btn-secondary bg-accent-200 text-blue-white hover:bg-accent-300 w-full"
      >
        {isGenerating ? "Regenerating..." : "Regenerate Flashcards"}
      </button>
    </div>
  );
}
