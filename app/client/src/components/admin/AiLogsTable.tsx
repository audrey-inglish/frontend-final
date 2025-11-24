import AiLogRow from "./AiLogRow";

interface AdminAiLog {
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
}

interface AiLogsTableProps {
  logs: AdminAiLog[];
  expandedRowId: number | null;
  onToggleRow: (logId: number) => void;
}

export default function AiLogsTable({
  logs,
  expandedRowId,
  onToggleRow,
}: AiLogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">No AI actions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th className="table-header">Time</th>
            <th className="table-header">User</th>
            <th className="table-header">Dashboard</th>
            <th className="table-header">Action</th>
            <th className="table-header">Topic</th>
            <th className="table-header">Duration</th>
          </tr>
        </thead>
        <tbody className="bg-custom-white divide-y divide-neutral-200">
          {logs.map((log) => (
            <AiLogRow
              key={log.id}
              log={log}
              isExpanded={expandedRowId === log.id}
              onToggle={() => onToggleRow(log.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
