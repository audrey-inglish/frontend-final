interface AiLogRowProps {
  log: {
    id: number;
    user_id: number;
    dashboard_id: number;
    session_id: string;
    action_type: string;
    reasoning: string | null;
    question_id: string | null;
    topic: string | null;
    mastery_level: number | null;
    created_at: string;
    duration_ms: number | null;
    email: string;
    username: string;
    dashboard_title: string;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

export default function AiLogRow({ log, isExpanded, onToggle }: AiLogRowProps) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="hover:bg-neutral-50 cursor-pointer transition-colors"
      >
        <td className="admin-table-td">
          {new Date(log.created_at).toLocaleString()}
        </td>
        <td className="admin-table-td">{log.username || log.email}</td>
        <td className="admin-table-td">{log.dashboard_title}</td>
        <td className="admin-table-td">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              log.action_type === "get_next_step"
                ? "bg-accent-50 text-accent-600"
                : log.action_type === "provide_hint"
                  ? "bg-orange-100 text-yellow-600"
                  : "bg-custom-green-100 text-custom-green-600"
            }`}
          >
            {log.action_type === "get_next_step"
              ? "Question"
              : log.action_type === "provide_hint"
                ? "Hint"
                : "Evaluation"}
          </span>
        </td>
        <td className="admin-table-td">{log.topic || "-"}</td>
        <td className="admin-table-td">
          {log.duration_ms ? `${log.duration_ms}ms` : "-"}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="px-4 py-4 bg-neutral-50">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-1">
                  AI Reasoning:
                </h4>
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                  {log.reasoning || "No reasoning provided"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-neutral-900">
                    Session ID:
                  </span>{" "}
                  <span className="text-neutral-700 font-mono text-xs">
                    {log.session_id}
                  </span>
                </div>
                {log.question_id && (
                  <div>
                    <span className="font-semibold text-neutral-900">
                      Question ID:
                    </span>{" "}
                    <span className="text-neutral-700 font-mono text-xs">
                      {log.question_id}
                    </span>
                  </div>
                )}
                {log.mastery_level !== null && (
                  <div>
                    <span className="font-semibold text-neutral-900">
                      Mastery Level:
                    </span>{" "}
                    <span className="text-neutral-700">
                      {log.mastery_level}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-neutral-900">
                    User ID:
                  </span>{" "}
                  <span className="text-neutral-700">{log.user_id}</span>
                </div>
                <div>
                  <span className="font-semibold text-neutral-900">
                    Dashboard ID:
                  </span>{" "}
                  <span className="text-neutral-700">{log.dashboard_id}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
