import { useGetSessionAiActions } from "../../../hooks/useAiActionLogs";
import { AiActionLogEntry } from "./AiActionLogEntry";
import CloseIcon from "../../icons/actions/CloseIcon";

interface AiActionLogModalProps {
  sessionId: string;
  onClose: () => void;
}

export function AiActionLogModal({ sessionId, onClose }: AiActionLogModalProps) {
  const { data: logs, isLoading } = useGetSessionAiActions(sessionId);

  const sortedLogs = logs ? [...logs].reverse() : [];

  return (
    <div className="fixed inset-0 bg-neutral-400/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">
            AI Decision Log
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
            </div>
          )}

          {!isLoading && (!logs || logs.length === 0) && (
            <div className="text-center py-12">
              <p className="text-neutral-600">No AI actions recorded yet.</p>
              <p className="text-sm text-neutral-500 mt-2">
                AI decisions will appear here as you progress through the study session.
              </p>
            </div>
          )}

          {!isLoading && sortedLogs.length > 0 && (
            <div className="space-y-6">
              {sortedLogs.map((log) => (
                <AiActionLogEntry key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-neutral-200 bg-neutral-50">
          <button onClick={onClose} className="btn w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
