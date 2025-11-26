/**
 * Hint Service - handles hint requests and AI hint decisions
 */

import type { StudySessionState, ProvideHintArgs, HintResponse } from "../studySession.types";
import { PROVIDE_HINT_TOOL } from "./tools/provideHint/definition";
import { buildHintRequestMessages } from "./tools/provideHint/prompt";
import { callAgentWithTools } from "./apiClient";
import { logAiAction } from "../aiActionLogger";

export async function requestHint(
  sessionState: StudySessionState,
  apiKey: string
): Promise<HintResponse> {
  const startTime = performance.now();
  
  if (!sessionState.currentQuestion) {
    throw new Error("No current question for hint");
  }

  const messages = buildHintRequestMessages(sessionState);

  const response = await callAgentWithTools(
    messages,
    [PROVIDE_HINT_TOOL],
    apiKey
  );
  const duration = Math.round(performance.now() - startTime);

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  const assistantMessage = response.choices[0]?.message;

  // LLM chose not to provide a hint
  if (!toolCall) {
    // Parse the response to extract reasoning and message
    const content = assistantMessage?.content || "";
    const reasoningMatch = content.match(/REASONING:\s*(.+?)(?=MESSAGE:|$)/s);
    const messageMatch = content.match(/MESSAGE:\s*(.+)/s);
    
    const reasoning = reasoningMatch?.[1]?.trim() || content || "AI decided not to provide a hint at this time";
    const userMessage = messageMatch?.[1]?.trim() || "I believe you can solve this without a hint. Give it a try!";

    console.log("📝 Logging NO HINT decision:", { reasoning, userMessage });

    // Log the decision NOT to provide a hint
    if (sessionState.dashboardId && sessionState.currentQuestion) {
      const currentTopic = sessionState.masteryLevels.find(
        (m) => m.topic === sessionState.currentQuestion?.topic
      );

      logAiAction({
        dashboard_id: sessionState.dashboardId,
        session_id: sessionState.sessionId,
        action_type: "provide_hint",
        request_messages: messages,
        response_data: response,
        tool_call_data: { hint: null, decision: "no_hint_needed", userMessage },
        reasoning: reasoning,
        question_id: sessionState.currentQuestion.id,
        topic: sessionState.currentQuestion.topic,
        mastery_level: currentTopic?.level ?? 0,
        duration_ms: duration,
      }).catch((err) => console.error("Failed to log AI action:", err));
    }

    return {
      hint: null,
      aiMessage: userMessage,
    };
  }
  
  if (toolCall.function.name !== "provide_hint") {
    throw new Error("Agent called unexpected tool");
  }

  const args: ProvideHintArgs = JSON.parse(toolCall.function.arguments);

  console.log("💡 Hint Provided:", {
    hint: args.hint,
    reasoning: args.reasoning,
  });

  // Log this AI action
  if (sessionState.dashboardId && sessionState.currentQuestion) {
    const currentTopic = sessionState.masteryLevels.find(
      (m) => m.topic === sessionState.currentQuestion?.topic
    );

    logAiAction({
      dashboard_id: sessionState.dashboardId,
      session_id: sessionState.sessionId,
      action_type: "provide_hint",
      request_messages: messages,
      response_data: response,
      tool_call_data: args,
      reasoning: args.reasoning,
      question_id: sessionState.currentQuestion.id,
      topic: sessionState.currentQuestion.topic,
      mastery_level: currentTopic?.level ?? 0,
      duration_ms: duration,
    }).catch((err) => console.error("Failed to log AI action:", err));
  }

  return { hint: args };
}
