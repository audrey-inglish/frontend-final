import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "react-oidc-context";
import {
  useGetDashboards,
  useCreateDashboard,
  useDeleteDashboard,
} from "../hooks";
import { showErrorToast, showSuccessToast } from "../lib/toasts";
import {
  Navbar,
  DashboardForm,
  DashboardCard,
  LoadingSpinner,
  EmptyState,
  CardsLayout,
} from "../components";
import { useLocalStorage } from "../lib/useLocalStorage";
import type { DashboardCreate, Dashboard } from "../schemas/dashboard";

export default function Home() {
  const auth = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Only fetch dashboards when fully authenticated with token
  const shouldFetch = auth.isAuthenticated && !auth.isLoading && !!auth.user?.access_token;

  const { data: dashboards, isLoading, error } = useGetDashboards(shouldFetch);
  const createDashboard = useCreateDashboard();
  const deleteDashboard = useDeleteDashboard();
  const [lastDashboard] = useLocalStorage<number | null>(
    "mindset.lastDashboard",
    null
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showErrorToast("Title is required");
      return;
    }

    try {
      const data: DashboardCreate = {
        title: title.trim(),
        description: description.trim() || null,
      };
      await createDashboard.mutateAsync(data);
      showSuccessToast("Dashboard created!");
      setTitle("");
      setDescription("");
      setShowCreateForm(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create dashboard";
      showErrorToast(message);
      console.error(error);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    try {
      await deleteDashboard.mutateAsync(id);
      showSuccessToast("Dashboard deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete dashboard";
      showErrorToast(message);
      console.error(error);
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mindset</h1>
          <p className="text-gray-600 mb-8">
            Turn your notes into productive study sessions
          </p>
          <div className="">
            <Link to="/preview" className="btn-secondary py-3">
              Try It Free
            </Link>
            <button
              onClick={() => auth.signinRedirect()}
              className="btn"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-neutral-800">My Dashboards</h2>
            {lastDashboard && dashboards?.some((d) => d.id === lastDashboard) && (
              <Link
                to={`/dashboard/${lastDashboard}`}
                className="text-xs text-neutral-400 mt-1 hover:underline hover:text-neutral-500"
              >
                Continue where you left off
              </Link>
            )}
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn py-1 px-4 text-xl sm:text-sm sm:py-2 sm:px-4 flex justify-center"
            aria-label={showCreateForm ? "Cancel create dashboard" : "Create new dashboard"}
          >
            {showCreateForm ? (
              <>
                <span className="sm:hidden">✕</span>
                <span className="hidden sm:inline">Cancel</span>
              </>
            ) : (
              <>
                <span className="sm:hidden">+</span>
                <span className="hidden sm:inline">+ New Dashboard</span>
              </>
            )}
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-custom-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Create Dashboard</h3>
            <DashboardForm
              title={title}
              description={description}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onSubmit={handleCreate}
              onCancel={() => setShowCreateForm(false)}
              isPending={createDashboard.isPending}
              submitLabel="Create"
            />
          </div>
        )}

        {isLoading && <LoadingSpinner message="Loading dashboards..." />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            Error loading dashboards: {(error as Error).message}
          </div>
        )}

        {!isLoading && !error && dashboards && dashboards.length === 0 && (
          <EmptyState
            title="No dashboards yet"
            description="Create your first dashboard to get started"
          />
        )}

        {!isLoading && !error && dashboards && dashboards.length > 0 && (
          <CardsLayout
            items={dashboards}
            renderItem={(dashboard: Dashboard) => (
              <DashboardCard
                id={dashboard.id}
                title={dashboard.title}
                description={dashboard.description}
                updatedAt={dashboard.updated_at}
                onDelete={handleDelete}
                isDeleting={deleteDashboard.isPending}
              />
            )}
            overflow="wrap"
            getKey={(dashboard: Dashboard) => dashboard.id}
          />
        )}
      </main>
    </div>
  );
}
