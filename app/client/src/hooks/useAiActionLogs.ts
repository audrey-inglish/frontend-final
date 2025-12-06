import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiFetch from "../lib/apiFetch";
import {
  AiActionLogsArraySchema,
  type AiActionLogCreate,
} from "../schemas/aiActionLog";

export const aiActionLogKeys = {
  all: ["ai-action-logs"] as const,
  lists: () => [...aiActionLogKeys.all, "list"] as const,
  list: (dashboardId?: number, sessionId?: string) =>
    [...aiActionLogKeys.lists(), { dashboardId, sessionId }] as const,
  session: (sessionId: string) =>
    [...aiActionLogKeys.all, "session", sessionId] as const,
  adminAll: (filters?: {
    userId?: number;
    dashboardId?: number;
    limit?: number;
    offset?: number;
  }) => [...aiActionLogKeys.all, "admin", filters] as const,
};


export function useLogAiAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AiActionLogCreate) => {
      const response = await apiFetch("/api/ai-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate AI action log queries
      queryClient.invalidateQueries({ queryKey: aiActionLogKeys.lists() });
    },
  });
}


export function useGetAiActionLogs(
  dashboardId?: number,
  sessionId?: string,
  enabled = true
) {
  return useQuery({
    queryKey: aiActionLogKeys.list(dashboardId, sessionId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dashboardId) params.append("dashboard_id", String(dashboardId));
      if (sessionId) params.append("session_id", sessionId);

      const response = await apiFetch(`/api/ai-actions?${params.toString()}`);
      const data = await response.json();
      const parsed = AiActionLogsArraySchema.safeParse(data);

      if (!parsed.success) {
        throw new Error("Invalid AI action logs data from server");
      }

      return parsed.data.logs;
    },
    enabled,
  });
}


export function useGetSessionAiActions(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: aiActionLogKeys.session(sessionId),
    queryFn: async () => {
      const response = await apiFetch(`/api/ai-actions/session/${sessionId}`);
      const data = await response.json();
      const parsed = AiActionLogsArraySchema.safeParse(data);

      if (!parsed.success) {
        throw new Error("Invalid AI action logs data from server");
      }

      return parsed.data.logs;
    },
    enabled: enabled && !!sessionId,
  });
}


export function useGetAdminAiActionLogs(
  filters?: {
    userId?: number;
    dashboardId?: number;
    limit?: number;
    offset?: number;
  },
  enabled = true
) {
  return useQuery({
    queryKey: aiActionLogKeys.adminAll(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.userId) params.append("user_id", String(filters.userId));
      if (filters?.dashboardId)
        params.append("dashboard_id", String(filters.dashboardId));
      if (filters?.limit) params.append("limit", String(filters.limit));
      if (filters?.offset) params.append("offset", String(filters.offset));

      const response = await apiFetch(
        `/api/ai-actions/admin/all?${params.toString()}`
      );
      return response.json();
    },
    enabled,
  });
}
