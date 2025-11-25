import { z } from "zod";

export const AiActionLogSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  dashboard_id: z.number(),
  session_id: z.string(),
  action_type: z.enum(["get_next_step", "evaluate_response", "provide_hint"]),
  
  request_messages: z.any().nullable(), // JSONB
  response_data: z.any().nullable(), // JSONB
  tool_call_data: z.any().nullable(), // JSONB
  reasoning: z.string().nullable(),
  
  question_id: z.string().nullable(),
  topic: z.string().nullable(),
  mastery_level: z.number().nullable(),
  
  created_at: z.union([z.string(), z.date()]).transform((val) => 
    val instanceof Date ? val.toISOString() : val
  ),
  duration_ms: z.number().nullable(),
});

export const AiActionLogCreateSchema = z.object({
  dashboard_id: z.number(),
  session_id: z.string(),
  action_type: z.enum(["get_next_step", "evaluate_response", "provide_hint"]),
  
  request_messages: z.any().optional(),
  response_data: z.any().optional(),
  tool_call_data: z.any().optional(),
  reasoning: z.string().optional(),
  
  question_id: z.string().optional(),
  topic: z.string().optional(),
  mastery_level: z.number().optional(),
  
  duration_ms: z.number().optional(),
});

export const AiActionLogsArraySchema = z.object({
  logs: z.array(AiActionLogSchema),
});

export type AiActionLog = z.infer<typeof AiActionLogSchema>;
export type AiActionLogCreate = z.infer<typeof AiActionLogCreateSchema>;
