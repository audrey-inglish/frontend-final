import type { AgentTool } from "../../../studySession.types";

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
