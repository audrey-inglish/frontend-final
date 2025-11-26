/**
 * Decide Next Action Service - Autonomous session management
 * 
 * This is the core of the autonomous agentic loop. After each evaluation,
 * the LLM decides what to do next without waiting for user input.
 */

import type { StudySessionState, DecideNextActionArgs } from "../studySession.types";
import { DECIDE_NEXT_ACTION_TOOL } from "./tools/decideNextAction/definition";
import { buildDecideNextActionMessages } from "./tools/decideNextAction/prompt";
import { callAgentWithTools } from "./apiClient";
import { logAiAction } from "../aiActionLogger";

export async function requestNextAction(
  sessionState: StudySessionState,
  apiKey: string
): Promise<DecideNextActionArgs> {
  const startTime = performance.now();
  
  const messages = buildDecideNextActionMessages(sessionState);

  const response = await callAgentWithTools(
    messages,
    [DECIDE_NEXT_ACTION_TOOL],
    apiKey,
    "required" // Force the LLM to call the tool
  );
  const duration = Math.round(performance.now() - startTime);

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.function.name !== "decide_next_action") {
    throw new Error("Agent did not call decide_next_action tool");
  }

  const args: DecideNextActionArgs = JSON.parse(toolCall.function.arguments);

  if (sessionState.dashboardId) {
    const lastQuestion = sessionState.questionHistory[sessionState.questionHistory.length - 1];

    logAiAction({
      dashboard_id: sessionState.dashboardId,
      session_id: sessionState.sessionId,
      action_type: "decide_next_action",
      request_messages: messages,
      response_data: response,
      tool_call_data: args,
      reasoning: args.reasoning,
      question_id: lastQuestion?.id,
      topic: lastQuestion?.topic,
      mastery_level: sessionState.masteryLevels.find(m => m.topic === lastQuestion?.topic)?.level ?? 0,
      duration_ms: duration,
    }).catch((err) => console.error("Failed to log AI action:", err));
  }

  return args;
}
