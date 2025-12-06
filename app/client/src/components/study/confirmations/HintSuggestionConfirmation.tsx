import { InfoIcon } from '../../icons';

interface HintSuggestionConfirmationProps {
  hint: string;
  reasoning: string;
  onAccept: () => void;
  onReject: () => void;
  isLoading: boolean;
}

export function HintSuggestionConfirmation({
  hint,
  reasoning,
  onAccept,
  onReject,
  isLoading,
}: HintSuggestionConfirmationProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-accent-50 border border-accent-200">
        <div className="flex items-start space-x-3">
          <div className="shrink-0">
            <InfoIcon className="h-6 w-6 text-accent-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-accent-600 mb-1">
              Want a hint?
            </h3>
            <p className="text-sm text-accent-300/80 mb-3">{reasoning}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-4 flex flex-col mb-0">
        <div className="text-sm text-primary-600 mb-4">
          Based on your previous performance, the AI thinks a hint might help with
          the next question. Would you like to see it before the question appears?
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 btn-secondary mx-auto"
          >
            No thanks, show question
          </button>
          <button
            onClick={onAccept}
            disabled={isLoading}
            className="flex-1 btn mx-auto"
          >
            Yes, Show Me the Hint
          </button>
        </div>
      </div>
      
      {/* Preview of hint (hidden until accepted) */}
      <div className="hidden" data-hint={hint} />
    </div>
  );
}
