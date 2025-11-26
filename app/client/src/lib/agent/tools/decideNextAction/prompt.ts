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
   - **CRITICAL: For multiple-choice questions, ensure that ONLY ONE answer option is correct. All other options must be clearly wrong or incorrect. Do NOT create questions where multiple answers could be considered valid or partially correct.**
   - If a question naturally has multiple valid answers, either: (1) rephrase it to have only one correct answer, or (2) use a different question type like short-answer
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

export function buildDecideNextActionMessages(
  sessionState: StudySessionState
): AgentMessage[] {
  const recentQuestions = sessionState.questionHistory.slice(-5);
  const recentEvaluations = sessionState.evaluationHistory.slice(-5);
  const recentCorrect = recentEvaluations.filter(e => e.isCorrect).length;
  const recentTotal = recentEvaluations.length;
  
  const performanceSummary = sessionState.masteryLevels
    .map(m => `- ${m.topic}: ${m.level}% (${m.questionsCorrect}/${m.questionsAnswered} correct)`)
    .join('\n');

  const recentPerformance = recentEvaluations
    .map((e, i) => {
      const q = recentQuestions[i];
      return `  ${i + 1}. ${q?.topic} (${q?.difficulty}) - ${e.isCorrect ? '✓ Correct' : '✗ Incorrect'}`;
    })
    .join('\n');

  return [
    {
      role: "system",
      content: buildSystemPrompt(sessionState),
    },
    {
      role: "user",
      content: `The user just completed a question and you've evaluated their answer. Now you must autonomously decide what to do next.

## Current Session State

Performance Summary:
${performanceSummary}

Recent Performance (last ${recentTotal} questions):
${recentPerformance}
Recent Success Rate: ${recentTotal > 0 ? Math.round((recentCorrect / recentTotal) * 100) : 0}%

Total Questions Answered: ${sessionState.questionHistory.length}

## Your Autonomous Decision

You have full control over the session flow. Analyze the patterns and decide:

**continue_session** - Continue with another question
  Use when: User is progressing well, topics need more practice, normal flow. DO NOT use if all topics have reached 80%+ mastery.
  Result: Next question loads immediately (no user confirmation needed)

**suggest_hint** - Proactively suggest a hint for the upcoming question
  Use when: You predict the next topic will be challenging for them based on past performance. Don't use for their first question on a topic.
  Result: User sees modal asking if they want the hint before seeing the next question

**end_session** - Recommend ending the study session
  Use when: Strong mastery across all topics (typically 80%+ on all topics), consistent performance, good answer quality. Consider ending after 8-10 questions if mastery is high.
  Result: User sees modal with session summary and option to end or continue

Make your decision based on patterns, not single data points. Be intelligent and autonomous.`,
    },
  ];
}
