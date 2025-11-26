import type { AgentTool } from "../../../studySession.types";

export const DECIDE_NEXT_ACTION_TOOL: AgentTool = {
  type: "function",
  function: {
    name: "decide_next_action",
    description:
      "Autonomously decide what action to take next in the study session. Analyze the user's performance patterns, mastery levels, and session context to choose the best next step. You have full control over the session flow - decide whether to continue with more questions, suggest a hint proactively, adjust difficulty based on patterns, or end the session when true mastery is achieved. This is your primary tool for autonomous session management.",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "The autonomous action to take next",
          enum: ["continue_session", "suggest_hint", "end_session"],
        },
        reasoning: {
          type: "string",
          description:
            "Your detailed analysis of why this action is the best choice right now. Explain the patterns you observed, performance trends, or mastery indicators that led to this decision.",
        },
        hintText: {
          type: "string",
          description:
            "Required if action=suggest_hint. The hint to proactively offer the user. Should guide without revealing the answer.",
        },
        sessionSummary: {
          type: "string",
          description:
            "Required if action=end_session. A comprehensive summary of what the user has mastered, their progress, and achievements during this session.",
        },
      },
      required: ["action", "reasoning"],
    },
  },
};
