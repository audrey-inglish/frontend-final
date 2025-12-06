import { TrophyIcon } from '../../icons';

interface SessionEndConfirmationProps {
  sessionSummary: string;
  reasoning: string;
  onAccept: () => void;
  onReject: () => void;
  isLoading: boolean;
}

export function SessionEndConfirmation({
  sessionSummary,
  reasoning,
  onAccept,
  onReject,
  isLoading,
}: SessionEndConfirmationProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-custom-green-100/50 border border-custom-green-100">
        <div className="flex items-start space-x-3">
          <div className="shrink-0">
            <TrophyIcon className="h-6 w-6 text-custom-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-custom-green-700 mb-1">
              Nice work!
            </h3>
            <p className="text-sm text-custom-green-700 mb-3">{reasoning}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-4">
        <h4 className="text-sm font-semibold text-neutral-700 mb-2">
          Session Summary:
        </h4>
        <p className="text-sm text-neutral-700 mb-4 whitespace-pre-wrap">
          {sessionSummary}
        </p>
        
        <div className="text-sm text-primary-600 mb-4">
          The AI believes you've achieved mastery. Would you like to end the
          session, or continue practicing?
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onReject}
            disabled={isLoading}
            className="btn-secondary mx-auto flex-1"
          >
            Continue Practicing
          </button>
          <button
            onClick={onAccept}
            disabled={isLoading}
            className="btn mx-auto flex-2"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}
