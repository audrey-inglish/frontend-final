import { useGetSessionAiActions } from "../../hooks/aiActionLogs/useAiActionLogs";
import type { AiActionLog } from "../../schemas/aiActionLog";
import CloseIcon from "../icons/CloseIcon";

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
        {/* Header */}
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

        {/* Content */}
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

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50">
          <button onClick={onClose} className="btn w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface AiActionLogEntryProps {
  log: AiActionLog;
}

function AiActionLogEntry({ log }: AiActionLogEntryProps) {
  const isNextStep = log.action_type === "get_next_step";
  const timestamp = new Date(log.created_at).toLocaleTimeString();

  return (
    <div className="card border-l-4 border-l-accent-500">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                isNextStep
                  ? "bg-accent-100 text-accent-700"
                  : "bg-secondary-100 text-secondary-700"
              }`}
            >
              {isNextStep ? "Generated Question" : "Evaluated Answer"}
            </span>
            <span className="text-sm text-neutral-500">{timestamp}</span>
          </div>
          {log.topic && (
            <p className="text-sm text-neutral-600 mt-1">
              Topic: <span className="font-medium">{log.topic}</span>
              {log.mastery_level !== null && (
                <span className="ml-2 text-neutral-500">
                  (Mastery: {log.mastery_level}%)
                </span>
              )}
            </p>
          )}
        </div>
        {log.duration_ms && (
          <span className="text-xs text-neutral-500">
            {log.duration_ms}ms
          </span>
        )}
      </div>

      {log.reasoning && (
        <div className="bg-neutral-50 rounded-lg p-4 mb-3">
          <h4 className="text-sm font-semibold text-neutral-700 mb-2">
            AI Reasoning:
          </h4>
          <p className="text-sm text-neutral-700 leading-relaxed">
            {log.reasoning}
          </p>
        </div>
      )}

      {log.tool_call_data && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-accent-600 hover:text-accent-700 font-medium">
            View Technical Details
          </summary>
          <div className="mt-3 p-4 bg-neutral-900 rounded-lg overflow-x-auto">
            <pre className="text-xs text-neutral-100 font-mono">
              {JSON.stringify(log.tool_call_data, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}
