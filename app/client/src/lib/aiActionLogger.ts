import type { AiActionLogCreate } from "../schemas/aiActionLog";
import apiFetch from "./apiFetch";


export async function logAiAction(data: AiActionLogCreate): Promise<void> {
  try {
    await apiFetch("/api/ai-actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (error) {
    // Log errors but don't throw - logging shouldn't break the study session
    console.error("Failed to log AI action:", error);
  }
}
