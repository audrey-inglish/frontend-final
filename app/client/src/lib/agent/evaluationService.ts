import type { StudySessionState, EvaluateResponseArgs } from "../studySession.types";
import { EVALUATE_RESPONSE_TOOL } from "./toolDefinitions";
import { buildEvaluationMessages } from "./prompts";
import { callAgentWithTools } from "./apiClient";
import { logAiAction } from "../aiActionLogger";

export async function requestEvaluation(
  sessionState: StudySessionState,
  userAnswer: string,
  apiKey: string
): Promise<EvaluateResponseArgs> {
  const startTime = performance.now();
  const messages = buildEvaluationMessages(sessionState, userAnswer);
  const response = await callAgentWithTools(
    messages,
    [EVALUATE_RESPONSE_TOOL],
    apiKey
  );
  const duration = Math.round(performance.now() - startTime);

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.function.name !== "evaluate_study_response") {
    throw new Error("Agent did not call evaluate_study_response tool");
  }

  const args = JSON.parse(toolCall.function.arguments);

  const result = {
    ...args,
    isCorrect: args.isCorrect === "true" || args.isCorrect === true,
  } as EvaluateResponseArgs;

  // Log this AI action
  if (sessionState.dashboardId && sessionState.currentQuestion) {
    const currentTopic = sessionState.masteryLevels.find(
      (m) => m.topic === sessionState.currentQuestion?.topic
    );

    logAiAction({
      dashboard_id: sessionState.dashboardId,
      session_id: sessionState.sessionId,
      action_type: "evaluate_response",
      request_messages: messages,
      response_data: response,
      tool_call_data: result,
      reasoning: result.explanation,
      question_id: sessionState.currentQuestion.id,
      topic: sessionState.currentQuestion.topic,
      mastery_level: currentTopic?.level ?? 0,
      duration_ms: duration,
    }).catch((err) => console.error("Failed to log AI action:", err));
  }

  return result;
}
