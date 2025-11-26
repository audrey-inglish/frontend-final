/**
 * Next Step Service - handles question generation
 */

import type { StudySessionState, GetNextStepArgs } from "../studySession.types";
import { GET_NEXT_STEP_TOOL } from "./tools/getNextStep/definition";
import { buildNextStepMessages } from "./tools/getNextStep/prompt";
import { callAgentWithTools } from "./apiClient";
import { logAiAction } from "../aiActionLogger";

export async function requestNextStep(
  sessionState: StudySessionState,
  apiKey: string
): Promise<GetNextStepArgs> {
  const startTime = performance.now();
  const messages = buildNextStepMessages(sessionState);
  const response = await callAgentWithTools(
    messages,
    [GET_NEXT_STEP_TOOL],
    apiKey
  );
  const duration = Math.round(performance.now() - startTime);

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.function.name !== "get_next_study_step") {
    throw new Error("Agent did not call get_next_study_step tool");
  }

  const args: GetNextStepArgs = JSON.parse(toolCall.function.arguments);

  // Log this AI action
  if (sessionState.dashboardId) {
    const currentTopic = sessionState.masteryLevels.find(
      (m) => m.topic === args.topic
    );

    logAiAction({
      dashboard_id: sessionState.dashboardId,
      session_id: sessionState.sessionId,
      action_type: "get_next_step",
      request_messages: messages,
      response_data: response,
      tool_call_data: args,
      reasoning: args.reasoning,
      topic: args.topic,
      mastery_level: currentTopic?.level ?? 0,
      duration_ms: duration,
    }).catch((err) => console.error("Failed to log AI action:", err));
  }

  return args;
}
