import { z } from "zod";
// Dashboard (dashboard table)
export const DashboardSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  created_at: z.union([z.string(), z.date()]).transform(val => 
    val instanceof Date ? val.toISOString() : val
  ),
  updated_at: z.union([z.string(), z.date()]).transform(val => 
    val instanceof Date ? val.toISOString() : val
  ),
});

export const DashboardCreateSchema = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().nullable().optional(),
});

export const DashboardUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
});

export const DashboardsListResponseSchema = z.object({
  dashboards: z.array(DashboardSchema),
});

export const DashboardSingleResponseSchema = z.object({
  dashboard: DashboardSchema,
});

export type Dashboard = z.infer<typeof DashboardSchema>;
export type DashboardCreate = z.infer<typeof DashboardCreateSchema>;
export type DashboardUpdate = z.infer<typeof DashboardUpdateSchema>;
