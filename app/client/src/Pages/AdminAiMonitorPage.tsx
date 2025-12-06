import { useState } from "react";
import { useGetAdminAiActionLogs } from "../hooks/useAiActionLogs";
import {
  Navbar,
  AdminRoute,
  AiLogsTable,
  PaginationControls,
} from "../components";

export default function AdminAiMonitorPage() {
  const [filters, setFilters] = useState({
    limit: 50,
    offset: 0,
  });
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

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

  const toggleRow = (logId: number) => {
    setExpandedRowId((prev) => (prev === logId ? null : logId));
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
                  <h2 className="text-lg font-semibold text-neutral-800">
                    Recent AI Actions
                  </h2>
                  <div className="text-sm text-neutral-600">
                    Total: {data.pagination.total} actions
                  </div>
                </div>

                <AiLogsTable
                  logs={data.logs}
                  expandedRowId={expandedRowId}
                  onToggleRow={toggleRow}
                />
              </div>

              <PaginationControls
                currentOffset={filters.offset}
                pageSize={filters.limit}
                total={data.pagination.total}
                hasMore={data.pagination.hasMore}
                onPrevious={handlePreviousPage}
                onNext={handleNextPage}
              />
            </>
          )}
        </main>
      </div>
    </AdminRoute>
  );
}
