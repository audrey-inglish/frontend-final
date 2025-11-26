/**
 * Agent Service - Main Export
 * Re-exports all agent services for backwards compatibility
 */

export { requestNextStep } from "./nextStepService";
export { requestEvaluation } from "./evaluationService";
export { requestHint } from "./hintService";
export { requestNextAction } from "./decideNextActionService";
export { GET_NEXT_STEP_TOOL, EVALUATE_RESPONSE_TOOL, PROVIDE_HINT_TOOL, DECIDE_NEXT_ACTION_TOOL } from "./toolDefinitions";
export { callAgentWithTools } from "./apiClient";
export { buildSystemPrompt, buildNextStepMessages, buildEvaluationMessages, buildHintRequestMessages, buildDecideNextActionMessages } from "./prompts";
