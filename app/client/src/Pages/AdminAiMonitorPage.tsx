import { useState } from "react";
import { useGetAdminAiActionLogs } from "../hooks/aiActionLogs/useAiActionLogs";
import { Navbar, AdminRoute } from "../components";

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

export default function AdminAiMonitorPage() {
  const [filters, setFilters] = useState({
    limit: 50,
    offset: 0,
  });

  const { data, isLoading } = useGetAdminAiActionLogs(filters, true);

  const handlePreviousPage = () => {
    setFilters((prev) => ({
      ...prev,
      offset: Math.max(0, prev.offset - prev.limit),
    }));
  };

  const handleNextPage = () => {
    if (data?.pagination?.hasMore) {
      setFilters((prev) => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">
              AI Action Monitor
            </h1>
            <p className="text-neutral-600 mt-2">
              View all AI decision-making across study sessions (Admin Only)
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
            </div>
          )}

          {!isLoading && data && (
            <>
              <div className="card mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Recent AI Actions
                  </h2>
                  <div className="text-sm text-neutral-600">
                    Total: {data.pagination.total} actions
                  </div>
                </div>

                {data.logs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-neutral-600">
                      No AI actions recorded yet.
                    </p>
                  </div>
                ) : (
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
                        {data.logs.map((log: AdminAiLog) => (
                          <tr key={log.id} className="hover:bg-neutral-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                              {log.username || log.email}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-900">
                              {log.dashboard_title}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  log.action_type === "get_next_step"
                                    ? "bg-accent-100 text-accent-800"
                                    : "bg-secondary-100 text-secondary-800"
                                }`}
                              >
                                {log.action_type === "get_next_step"
                                  ? "Question"
                                  : "Evaluation"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-neutral-900">
                              {log.topic || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500">
                              {log.duration_ms ? `${log.duration_ms}ms` : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePreviousPage}
                  disabled={filters.offset === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="text-sm text-neutral-600">
                  Showing {filters.offset + 1} -{" "}
                  {Math.min(
                    filters.offset + filters.limit,
                    data.pagination.total
                  )}{" "}
                  of {data.pagination.total}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={!data.pagination.hasMore}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </AdminRoute>
  );
}
