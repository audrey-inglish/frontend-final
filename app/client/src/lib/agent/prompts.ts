import type { AgentMessage, StudySessionState } from "../studySession.types";
import { STUDY_SESSION_CONFIG, getQuestionTypeGuidance } from "../studySession.config";

export function buildSystemPrompt(sessionState: StudySessionState): string {
  const masteryThreshold = STUDY_SESSION_CONFIG.mastery.masteryThreshold;
  const questionTypeGuidance = getQuestionTypeGuidance();

  return `You are an adaptive AI tutor conducting a study session. Your goal is to help the student master these topics: ${sessionState.topics.join(
    ", "
  )}.

Current Mastery Levels:
${sessionState.masteryLevels
  .map(
    (m) =>
      `- ${m.topic}: ${m.level}% (${m.questionsCorrect}/${m.questionsAnswered} correct)`
  )
  .join("\n")}

Your responsibilities:
1. When calling get_next_study_step:
   - Choose topics with lower mastery levels
   - ${questionTypeGuidance}
   - Vary question types to keep engagement high -- don't repeat the same question type consecutively
   - Match difficulty to current mastery (0-40% = easy, 41-70% = medium, 71-100% = hard)
   - Create clear, educational questions
   - For multiple-choice and true-false questions, provide a helpful explanation for EACH option
   - Explanations should be encouraging and educational, explaining why an answer is correct or what misconception it represents

2. When calling evaluate_study_response:
   - Be encouraging but honest in your assessment
   - Provide educational explanations that teach the concept
   - You can include masteryUpdates but they will be recalculated automatically based on performance
   - Recommend ending when all topics reach ${masteryThreshold}%+ mastery

Be supportive and adaptive. Focus on helping the student truly understand the material.`;
}

export function buildNextStepMessages(
  sessionState: StudySessionState
): AgentMessage[] {
  return [
    {
      role: "system",
      content: buildSystemPrompt(sessionState),
    },
    {
      role: "user",
      content:
        sessionState.questionHistory.length === 0
          ? "Start the study session by generating the first question."
          : "Generate the next question based on the current mastery levels and progress.",
    },
  ];
}

export function buildEvaluationMessages(
  sessionState: StudySessionState,
  userAnswer: string
): AgentMessage[] {
  const currentQ = sessionState.currentQuestion!;

  return [
    {
      role: "system",
      content: buildSystemPrompt(sessionState),
    },
    {
      role: "user",
      content: `Question: ${currentQ.question}

User's Answer: ${userAnswer}

Correct Answer: ${currentQ.correctAnswer}

Evaluate this answer and update the mastery levels accordingly. Be forgiving of minor typos in the user's answer.`,
    },
  ];
}

export function buildHintRequestMessages(
  sessionState: StudySessionState
): AgentMessage[] {
  if (!sessionState.currentQuestion) {
    throw new Error("No current question for hint");
  }

  const topicMastery = sessionState.masteryLevels.find(
    (m) => m.topic === sessionState.currentQuestion?.topic
  );

  const questionsAnswered = topicMastery?.questionsAnswered ?? 0;
  const questionsCorrect = topicMastery?.questionsCorrect ?? 0;
  const masteryLevel = topicMastery?.level ?? 0;
  const hasStruggled =
    questionsAnswered > 0 && questionsCorrect < questionsAnswered;

  return [
    {
      role: "system",
      content: buildSystemPrompt(sessionState),
    },
    {
      role: "user",
      content: `The user has been assigned the following question, and they'd like to request a hint:

Question: "${sessionState.currentQuestion.question}"
Topic: ${sessionState.currentQuestion.topic}
Difficulty: ${sessionState.currentQuestion.difficulty}

Performance on this topic:
- Questions Answered: ${questionsAnswered}
- Questions Correct: ${questionsCorrect}
- Current Mastery: ${masteryLevel}%
- Has struggled with this topic: ${hasStruggled ? "YES" : "NO"}

Decide whether to provide a hint. Call provide_hint ONLY if:
- The user has answered questions on this topic incorrectly before (questionsCorrect < questionsAnswered)
- A hint would be educational **without giving away the answer**

DO NOT call provide_hint if:
- This is the user's first question on this topic (questionsAnswered = 0)
- The user has perfect accuracy on this topic
- The question is easy and user has good mastery
- The user has high mastery (>60%) in this topic
- A hint would essentially reveal the answer

If you choose not to provide a hint, simply respond without calling any tool. Your response should be in this format, and formatted as plain text:

REASONING: [Explain your decision-making process. Why did you decide not to provide a hint? Reference specific criteria like mastery level, question difficulty, or past performance data.]

MESSAGE: [Clearly state that a hint will not be provided. Brief, encouraging message to the user.]`,
    },
  ];
}
