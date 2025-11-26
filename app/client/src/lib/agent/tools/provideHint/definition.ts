import type { AgentTool } from "../../../studySession.types";

export const PROVIDE_HINT_TOOL: AgentTool = {
  type: "function",
  function: {
    name: "provide_hint",
    description:
      "Provide a helpful hint when the user genuinely needs guidance. ONLY call this for difficult questions or when user's mastery is low (<60%). DO NOT call for easy questions or high mastery topics. The hint should guide thinking without revealing the answer.",
    parameters: {
      type: "object",
      properties: {
        hint: {
          type: "string",
          description:
            "A helpful hint that guides the user without directly revealing the answer. Should encourage thinking and learning.",
        },
        reasoning: {
          type: "string",
          description:
            "Explain why you decided to provide a hint at this moment (e.g., difficult topic, low mastery level, complex question).",
        },
      },
      required: ["hint", "reasoning"],
    },
  },
};
