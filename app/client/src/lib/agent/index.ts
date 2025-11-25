/**
 * Agent Service - Main Export
 * Re-exports all agent services for backwards compatibility
 */

export { requestNextStep } from "./nextStepService";
export { requestEvaluation } from "./evaluationService";
export { requestHint } from "./hintService";
export { GET_NEXT_STEP_TOOL, EVALUATE_RESPONSE_TOOL, PROVIDE_HINT_TOOL } from "./toolDefinitions";
export { callAgentWithTools } from "./apiClient";
export { buildSystemPrompt, buildNextStepMessages, buildEvaluationMessages, buildHintRequestMessages } from "./prompts";
