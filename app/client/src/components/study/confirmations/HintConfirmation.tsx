import type { ProvideHintArgs } from '../../../lib/studySession.types';
import { SpinnerIcon, InfoIcon } from '../../icons';

interface HintConfirmationProps {
  hint: ProvideHintArgs;
  onAccept: () => void;
  onReject: () => void;
  isLoading: boolean;
}

export function HintConfirmation({
  hint,
  onAccept,
  onReject,
  isLoading,
}: HintConfirmationProps) {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-accent-50 border border-accent-100">
        <div className="flex items-start space-x-3">
          <div className="shrink-0">
            <InfoIcon className="h-6 w-6 text-accent-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-accent-800 mb-1">
              Want a hint?
            </h3>
            <p className="text-sm text-accent-600 mb-3">{hint.reasoning}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-4">
        <div className="text-sm text-primary-600 mb-4">
          Would you like to see this hint? You can try answering without it first
          if you prefer.
        </div>
        <div className="flex">
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 btn-secondary"
          >
            No Thanks, I'll Try First
          </button>
          <button
            onClick={onAccept}
            disabled={isLoading}
            className="flex-1 btn flex items-center justify-center gap-2"
          >
            {isLoading && <SpinnerIcon />}
            {isLoading ? 'Loading...' : 'Show Me The Hint'}
          </button>
        </div>
      </div>
    </div>
  );
}
