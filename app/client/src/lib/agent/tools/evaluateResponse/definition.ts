import type { AgentTool } from "../../../studySession.types";

export const EVALUATE_RESPONSE_TOOL: AgentTool = {
  type: "function",
  function: {
    name: "evaluate_study_response",
    description:
      "Evaluate the user's answer and update mastery levels. Provide clear feedback and determine whether to continue, change difficulty, or end the session.",
    parameters: {
      type: "object",
      properties: {
        isCorrect: {
          type: "string",
          description: "Whether the answer is correct",
          enum: ["true", "false"],
        },
        explanation: {
          type: "string",
          description:
            "Detailed explanation of why the answer is correct/incorrect, including teaching points",
        },
        correctAnswer: {
          type: "string",
          description: "The correct answer (if not already shown)",
        },
        masteryUpdates: {
          type: "array",
          description: "Updates to topic mastery levels. Must include an entry for the current topic being tested.",
          items: {
            type: "object",
            properties: {
              topic: {
                type: "string",
                description: "The topic name (must match one of the session topics)",
              },
              newLevel: {
                type: "number",
                description: "The updated mastery level (0-100). Correct answer: increase by 10-15. Incorrect: decrease by 5-10.",
              },
              reasoning: {
                type: "string",
                description: "Why this mastery level was chosen",
              },
            },
            required: ["topic", "newLevel", "reasoning"],
          },
        },
        recommendation: {
          type: "string",
          description: "What to do next in the session",
          enum: ["continue", "change-difficulty", "end-session"],
        },
      },
      required: [
        "isCorrect",
        "explanation",
        "masteryUpdates",
        "recommendation",
      ],
    },
  },
};
