import { useState } from "react";
import { showErrorToast, showSuccessToast } from "../lib/toasts";
import { useUpdateDashboard } from "./useDashboards";
import type { Dashboard, DashboardUpdate } from "../schemas/dashboard";

interface UseDashboardEditorOptions {
  dashboard: Dashboard | undefined;
}

export function useDashboardEditor({ dashboard }: UseDashboardEditorOptions) {
  const updateDashboard = useUpdateDashboard();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleEdit = () => {
    if (dashboard) {
      setTitle(dashboard.title);
      setDescription(dashboard.description ?? "");
      setIsEditing(true);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showErrorToast("Title is required");
      return;
    }

    if (!dashboard?.id) {
      showErrorToast("Dashboard ID is missing");
      return;
    }

    try {
      const data: DashboardUpdate = {
        title: title.trim(),
        description: description.trim() || null,
      };
      await updateDashboard.mutateAsync({ id: dashboard.id, data });
      showSuccessToast("Dashboard updated!");
      setIsEditing(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update dashboard";
      showErrorToast(message);
      console.error(error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTitle("");
    setDescription("");
  };

  return {
    isEditing,
    title,
    description,
    setTitle,
    setDescription,
    handleEdit,
    handleUpdate,
    handleCancel,
    isUpdating: updateDashboard.isPending,
  };
}
