import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router";
import {
  useGetDashboards,
  useCreateDashboard,
  useDeleteDashboard,
  useIsAdmin,
} from "../hooks";
import { showErrorToast, showSuccessToast } from "../lib/toasts";
import {
  Navbar,
  DashboardCard,
  LoadingSpinner,
  EmptyState,
  CardsLayout,
} from "../components";
import { SettingsIcon } from "../components/icons";
import {
  LandingPage,
  DashboardHeader,
  CreateDashboardForm,
} from "../components/home";
import { useLocalStorage } from "../lib/useLocalStorage";
import type { DashboardCreate, Dashboard } from "../schemas/dashboard";

export default function Home() {
  const auth = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { isAdmin } = useIsAdmin();

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
    return <LandingPage onSignIn={() => auth.signinRedirect()} />;
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdmin && (
          <div className="flex justify-end">
            <Link
              to="/admin/ai-monitor"
              className="btn-secondary flex items-center gap-2"
            >
              <SettingsIcon />
              <span>Admin Panel</span>
            </Link>
          </div>
        )}

        <DashboardHeader
          lastDashboard={lastDashboard}
          dashboards={dashboards}
          onNewDashboard={() => setShowCreateForm(!showCreateForm)}
          showCreateForm={showCreateForm}
        />

        {showCreateForm && (
          <CreateDashboardForm
            title={title}
            description={description}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            isPending={createDashboard.isPending}
          />
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
