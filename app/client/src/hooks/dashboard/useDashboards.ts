import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiFetch from "../../lib/apiFetch";
import {
  DashboardsListResponseSchema,
  DashboardSingleResponseSchema,
} from "../../schemas/dashboard";
import type {
  Dashboard,
  DashboardCreate,
  DashboardUpdate,
} from "../../schemas/dashboard";
import { DashboardStatsSchema, type DashboardStats } from "../../schemas/dashboardStats";

export const dashboardKeys = {
  all: ["dashboards"] as const,
  lists: () => [...dashboardKeys.all, "list"] as const,
  list: () => [...dashboardKeys.lists()] as const,
  details: () => [...dashboardKeys.all, "detail"] as const,
  detail: (id: number) => [...dashboardKeys.details(), id] as const,
  stats: (id: number) => [...dashboardKeys.all, "stats", id] as const,
};

export function useGetDashboards(enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.list(),
    queryFn: async (): Promise<Dashboard[]> => {
      const res = await apiFetch("/api/dashboards");
      const json = await res.json();
      const parsed = DashboardsListResponseSchema.parse(json);
      return parsed.dashboards;
    },
    enabled,
  });
}

export function useGetDashboard(id: number | null | undefined, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.detail(id ?? 0),
    queryFn: async (): Promise<Dashboard> => {
      if (!id) throw new Error("Dashboard ID is required");
      const res = await apiFetch(`/api/dashboards/${id}`);
      const json = await res.json();
      const parsed = DashboardSingleResponseSchema.parse(json);
      return parsed.dashboard;
    },
    enabled: !!id && enabled, // Only run query if ID exists and enabled
  });
}

export function useCreateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DashboardCreate): Promise<Dashboard> => {
      const res = await apiFetch("/api/dashboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      const parsed = DashboardSingleResponseSchema.parse(json);
      return parsed.dashboard;
    },
    onSuccess: () => {
      // invalidate and refetch dashboards list
      queryClient.invalidateQueries({ queryKey: dashboardKeys.lists() });
    },
  });
}

export function useUpdateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: DashboardUpdate;
    }): Promise<Dashboard> => {
      const res = await apiFetch(`/api/dashboards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      const parsed = DashboardSingleResponseSchema.parse(json);
      return parsed.dashboard;
    },
    onSuccess: (updatedDashboard) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: dashboardKeys.detail(updatedDashboard.id),
      });
    },
  });
}

export function useDeleteDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiFetch(`/api/dashboards/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.lists() });
      queryClient.removeQueries({ queryKey: dashboardKeys.detail(deletedId) });
    },
  });
}

export function useGetDashboardStats(id: number | null | undefined, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.stats(id ?? 0),
    queryFn: async (): Promise<DashboardStats> => {
      if (!id) throw new Error("Dashboard ID is required");
      const res = await apiFetch(`/api/dashboards/${id}/stats`);
      const json = await res.json();
      const validated = DashboardStatsSchema.parse(json.stats);
      return validated;
    },
    enabled: !!id && enabled,
  });
}
