/**
 * Agent Service for Study Session Tool Calling
 * Manages AI agent interactions for adaptive study sessions
 */

import type {
  AgentTool,
  AgentMessage,
  AgentResponse,
  GetNextStepArgs,
  EvaluateResponseArgs,
  StudySessionState,
} from "./studySession.types";
import { getAgentEndpoint, getAgentModel, STUDY_SESSION_CONFIG } from "./studySession.config";

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
            "Answer options (required for multiple-choice, should include 3-4 options). There should only be one correct answer.",
          items: { type: "string" },
        },
        correctAnswer: {
          type: "string",
          description: "The correct answer (not shown to user)",
        },
        hint: {
          type: "string",
          description: "Optional hint to help the user",
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

function buildSystemPrompt(sessionState: StudySessionState): string {
  const masteryThreshold = STUDY_SESSION_CONFIG.mastery.masteryThreshold;
  
  return `You are an adaptive AI tutor conducting a study session. Your goal is to help the student master these topics: ${sessionState.topics.join(", ")}.

Current Mastery Levels:
${sessionState.masteryLevels.map((m) => `- ${m.topic}: ${m.level}% (${m.questionsCorrect}/${m.questionsAnswered} correct)`).join("\n")}

Your responsibilities:
1. When calling get_next_study_step:
   - Choose topics with lower mastery levels
   - Vary question types to keep engagement high
   - Match difficulty to current mastery (0-40% = easy, 41-70% = medium, 71-100% = hard)
   - Create clear, educational questions

2. When calling evaluate_study_response:
   - Be encouraging but honest in your assessment
   - Provide educational explanations that teach the concept
   - You can include masteryUpdates but they will be recalculated automatically based on performance
   - Recommend ending when all topics reach ${masteryThreshold}%+ mastery

Be supportive and adaptive. Focus on helping the student truly understand the material.`;
}

function buildContextMessages(
  sessionState: StudySessionState,
  currentAnswer?: string
): AgentMessage[] {
  const messages: AgentMessage[] = [
    {
      role: "system",
      content: buildSystemPrompt(sessionState),
    },
  ];

  if (!currentAnswer) {
    messages.push({
      role: "user",
      content:
        sessionState.questionHistory.length === 0
          ? "Start the study session by generating the first question."
          : "Generate the next question based on the current mastery levels and progress.",
    });
  } else {
    const currentQ = sessionState.currentQuestion!;
    messages.push({
      role: "user",
      content: `Question: ${currentQ.question}

User's Answer: ${currentAnswer}

Correct Answer: ${currentQ.correctAnswer}

Evaluate this answer and update the mastery levels accordingly.`,
    });
  }

  return messages;
}

async function callAgentWithTools(
  messages: AgentMessage[],
  tools: AgentTool[],
  apiKey: string
): Promise<AgentResponse> {
  const response = await fetch(getAgentEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getAgentModel(),
      messages,
      tools,
      tool_choice: "auto",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Agent API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function requestNextStep(
  sessionState: StudySessionState,
  apiKey: string
): Promise<GetNextStepArgs> {
  const messages = buildContextMessages(sessionState);
  const response = await callAgentWithTools(
    messages,
    [GET_NEXT_STEP_TOOL],
    apiKey
  );

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.function.name !== "get_next_study_step") {
    throw new Error("Agent did not call get_next_study_step tool");
  }

  const args: GetNextStepArgs = JSON.parse(toolCall.function.arguments);
  return args;
}

export async function requestEvaluation(
  sessionState: StudySessionState,
  userAnswer: string,
  apiKey: string
): Promise<EvaluateResponseArgs> {
  const messages = buildContextMessages(sessionState, userAnswer);
  const response = await callAgentWithTools(
    messages,
    [EVALUATE_RESPONSE_TOOL],
    apiKey
  );

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.function.name !== "evaluate_study_response") {
    throw new Error("Agent did not call evaluate_study_response tool");
  }

  const args = JSON.parse(toolCall.function.arguments);

  return {
    ...args,
    isCorrect: args.isCorrect === "true" || args.isCorrect === true,
  } as EvaluateResponseArgs;
}
