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
