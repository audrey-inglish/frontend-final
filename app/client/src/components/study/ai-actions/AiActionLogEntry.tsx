import type { AiActionLog } from "../../schemas/aiActionLog";

interface AiActionLogEntryProps {
  log: AiActionLog;
}

export function AiActionLogEntry({ log }: AiActionLogEntryProps) {
  const isNextStep = log.action_type === "get_next_step";
  const isEvaluate = log.action_type === "evaluate_response";
  const isHint = log.action_type === "provide_hint";
  const timestamp = new Date(log.created_at).toLocaleTimeString();

  const getActionLabel = () => {
    if (isNextStep) return "Generated Question";
    if (isEvaluate) return "Evaluated Answer";
    if (isHint) return "Hint Requested";
    return "AI Action";
  };

  const getActionColors = () => {
    if (isNextStep) return "bg-accent-50 text-accent-600";
    if (isEvaluate) return "bg-custom-green-100 text-custom-green-500";
    if (isHint) return "bg-orange-100 text-yellow-600";
    return "bg-neutral-100 text-neutral-600";
  };

  return (
    <div className="card border-l-4 border-l-accent-500">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-medium ${getActionColors()}`}
            >
              {getActionLabel()}
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
          <span className="text-xs text-neutral-500">{log.duration_ms}ms</span>
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
