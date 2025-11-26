import type { AgentMessage, StudySessionState } from "../../../studySession.types";
import { STUDY_SESSION_CONFIG, getQuestionTypeGuidance } from "../../../studySession.config";

function buildSystemPrompt(sessionState: StudySessionState): string {
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
   - Choose topics with lower mastery levels, but vary them; **DO NOT give the same topic in a row,** even if it has the lowest mastery.
   - ${questionTypeGuidance}
   - Don't give the exact same question with the same answers twice in one session
   - Match difficulty to current mastery (0-40% = easy, 41-70% = medium, 71-100% = hard)
   - Create clear, educational questions
   - For multiple-choice and true-false questions, provide a helpful explanation for EACH option
   - Explanations should be encouraging and educational, explaining why an answer is correct or what misconception it represents
   - CRITICAL: Do NOT add labels like A), B), C), D) to your questions or answer options. Just provide the plain question text and plain answer options.
   - CRITICAL: The correctAnswer field must EXACTLY match the 'text' field of the correct option - not a letter like "A" or "B"

2. When calling evaluate_study_response:
   - Be encouraging but honest in your assessment
   - Provide educational explanations that teach the concept
   - You can include masteryUpdates but they will be recalculated automatically based on performance
   - Recommend ending when all topics reach ${masteryThreshold}%+ mastery

Be supportive and adaptive. Focus on helping the student truly understand the material.`;
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
- The user recently answered a question on this topic correctly (within the last 3 questions)
- The user has perfect accuracy on this topic
- The question is easy and user has good mastery
- The user has high mastery (>60%) in this topic
- A hint would essentially reveal the answer

If you 
If you choose not to provide a hint, simply respond without calling any tool. Your response should be in this format, and formatted as plain text:

REASONING: [Explain your decision-making process. Why did you decide not to provide a hint? Reference specific criteria like mastery level, question difficulty, or past performance data.]

MESSAGE: [Clearly state that a hint will not be provided. Brief, encouraging message to the user.]`,
    },
  ];
}
