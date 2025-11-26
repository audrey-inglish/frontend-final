import type { AgentTool } from "../studySession.types";

export const GET_NEXT_STEP_TOOL: AgentTool = {
  type: "function",
  function: {
    name: "get_next_study_step",
    description:
      "Generate the next study question based on the current mastery levels and session context. Choose a topic that needs more practice, select appropriate difficulty, and create an engaging question.",
    parameters: {
      type: "object",
      properties: {
        questionType: {
          type: "string",
          description: "The type of question to generate",
          enum: ["multiple-choice", "true-false", "short-answer", "flashcard"],
        },
        topic: {
          type: "string",
          description:
            "The topic this question covers (should match one of the session topics)",
        },
        difficulty: {
          type: "string",
          description: "Difficulty level appropriate for current mastery",
          enum: ["easy", "medium", "hard"],
        },
        question: {
          type: "string",
          description: "The question text to show the user",
        },
        options: {
          type: "array",
          description:
            "Answer options for multiple-choice and true-false questions. Each option must include the answer text and an explanation of why it's correct/incorrect for instant feedback. IMPORTANT: Do NOT add labels like A), B), C), D) to the option text - just provide the plain answer text.",
          items: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "The answer option text WITHOUT any labels like A), B), C), D)",
              },
              explanation: {
                type: "string",
                description:
                  "Explanation of why this option is correct or incorrect. Be educational and encouraging.",
              },
            },
            required: ["text", "explanation"],
          },
        },
        correctAnswer: {
          type: "string",
          description: "The correct answer text that EXACTLY matches the 'text' field of the correct option. Do NOT use labels like A, B, C, D - use the actual answer text.",
        },
        reasoning: {
          type: "string",
          description:
            "Internal reasoning for why this question was chosen (based on mastery gaps, variety, etc.)",
        },
      },
      required: [
        "questionType",
        "topic",
        "difficulty",
        "question",
        "correctAnswer",
        "reasoning",
      ],
    },
  },
};

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

