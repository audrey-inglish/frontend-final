/**
 * Agent Service - Main Export
 * Re-exports all agent services for backwards compatibility
 */

export { requestNextStep } from "./nextStepService";
export { requestEvaluation } from "./evaluationService";
export { requestHint } from "./hintService";
export { requestNextAction } from "./decideNextActionService";
export { GET_NEXT_STEP_TOOL } from "./tools/getNextStep/definition";
export { EVALUATE_RESPONSE_TOOL } from "./tools/evaluateResponse/definition";
export { PROVIDE_HINT_TOOL } from "./tools/provideHint/definition";
export { DECIDE_NEXT_ACTION_TOOL } from "./tools/decideNextAction/definition";
export { callAgentWithTools } from "./apiClient";
export { buildNextStepMessages } from "./tools/getNextStep/prompt";
export { buildEvaluationMessages } from "./tools/evaluateResponse/prompt";
export { buildHintRequestMessages } from "./tools/provideHint/prompt";
export { buildDecideNextActionMessages } from "./tools/decideNextAction/prompt";
