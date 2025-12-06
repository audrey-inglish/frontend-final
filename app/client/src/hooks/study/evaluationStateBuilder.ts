import type {
  StudySessionState,
  UserAnswer,
  EvaluationResult,
  EvaluateResponseArgs,
} from "../../lib/studySession.types";
import { applyMasteryUpdates } from "../../lib/studySession.utils";
import { updateMasteryCounters } from "./masteryUpdateHelpers";

export function buildEvaluationState(
  prevState: StudySessionState,
  userAnswer: UserAnswer,
  evaluationArgs: EvaluateResponseArgs
): Partial<StudySessionState> {
  const currentQuestion = prevState.currentQuestion;
  
  if (!currentQuestion) {
    console.error('buildEvaluationState called but no current question in state');
    return {};
  }

  const updatedMastery = applyMasteryUpdates(
    prevState.masteryLevels,
    evaluationArgs.masteryUpdates
  );

  const evaluation: EvaluationResult = {
    questionId: currentQuestion.id,
    isCorrect: evaluationArgs.isCorrect,
    explanation: evaluationArgs.explanation,
    correctAnswer: evaluationArgs.correctAnswer,
    masteryUpdates: updatedMastery,
  };

  const masteryWithCounters = updateMasteryCounters(
    updatedMastery,
    currentQuestion.topic,
    evaluation.isCorrect,
    userAnswer.timestamp
  );

  return {
    answerHistory: [...prevState.answerHistory, userAnswer],
    evaluationHistory: [...prevState.evaluationHistory, evaluation],
    masteryLevels: masteryWithCounters,
    pendingEvaluation: {
      question: currentQuestion,
      answer: userAnswer,
      evaluation,
    },
  };
}
