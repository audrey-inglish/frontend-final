import { useState, useCallback } from "react";
import type {
  StudySessionState,
  UserAnswer,
  EvaluationResult,
  TopicMastery,
} from "../../lib/studySession.types";
import { requestNextStep, requestEvaluation } from "../../lib/agentService";
import {
  initializeMastery,
  argsToQuestion,
  calculateMasteryLevel,
  applyMasteryUpdates,
} from "../../lib/studySession.utils";
import { isTopicMastered } from "../../lib/studySession.config";

interface UseStudySessionOptions {
  topics: string[];
  apiKey: string;
  onSessionEnd?: () => void;
}

interface UseStudySessionReturn {
  sessionState: StudySessionState;
  isLoading: boolean;
  error: string | null;
  startSession: () => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  confirmEvaluation: () => void;
  rejectEvaluation: () => void;
  endSession: () => void;
}

export function useStudySession({
  topics,
  apiKey,
  onSessionEnd,
}: UseStudySessionOptions): UseStudySessionReturn {
  const [sessionState, setSessionState] = useState<StudySessionState>({
    sessionId: `session-${Date.now()}`,
    active: false,
    topics,
    masteryLevels: initializeMastery(topics),
    questionHistory: [],
    answerHistory: [],
    evaluationHistory: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextStepArgs = await requestNextStep(sessionState, apiKey);
      const question = argsToQuestion(nextStepArgs, `q-${Date.now()}`);

      setSessionState((prev: StudySessionState) => ({
        ...prev,
        active: true,
        currentQuestion: question,
        questionHistory: [...prev.questionHistory, question],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session");
    } finally {
      setIsLoading(false);
    }
  }, [sessionState, apiKey]);

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!sessionState.currentQuestion) {
        setError("No current question");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const userAnswer: UserAnswer = {
          questionId: sessionState.currentQuestion.id,
          answer,
          timestamp: new Date().toISOString(),
        };

        const evaluationArgs = await requestEvaluation(
          sessionState,
          answer,
          apiKey
        );

        const updatedMastery = applyMasteryUpdates(
          sessionState.masteryLevels,
          evaluationArgs.masteryUpdates
        );

        const evaluation: EvaluationResult = {
          questionId: sessionState.currentQuestion.id,
          isCorrect: evaluationArgs.isCorrect,
          explanation: evaluationArgs.explanation,
          correctAnswer: evaluationArgs.correctAnswer,
          masteryUpdates: updatedMastery,
        };

        const masteryWithCounters = updatedMastery.map((m) => {
          if (m.topic === sessionState.currentQuestion!.topic) {
            const newQuestionsAnswered = m.questionsAnswered + 1;
            const newQuestionsCorrect =
              m.questionsCorrect + (evaluation.isCorrect ? 1 : 0);
            const calculatedLevel = calculateMasteryLevel(
              newQuestionsCorrect,
              newQuestionsAnswered
            );

            return {
              ...m,
              questionsAnswered: newQuestionsAnswered,
              questionsCorrect: newQuestionsCorrect,
              level: calculatedLevel,
              lastAsked: userAnswer.timestamp,
            };
          }
          return m;
        });

        setSessionState((prev: StudySessionState) => ({
          ...prev,
          answerHistory: [...prev.answerHistory, userAnswer],
          evaluationHistory: [...prev.evaluationHistory, evaluation],
          masteryLevels: masteryWithCounters,
          pendingEvaluation: {
            question: sessionState.currentQuestion!,
            answer: userAnswer,
            evaluation,
          },
        }));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to evaluate answer"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [sessionState, apiKey]
  );

  const confirmEvaluation = useCallback(async () => {
    if (!sessionState.pendingEvaluation) return;

    setIsLoading(true);
    setError(null);

    try {
      const newState: StudySessionState = {
        ...sessionState,
        pendingEvaluation: undefined,
        currentQuestion: undefined,
      };

      const allMastered = sessionState.masteryLevels.every((m: TopicMastery) =>
        isTopicMastered(m.level)
      );
      if (allMastered) {
        setSessionState({
          ...newState,
          active: false,
        });
        onSessionEnd?.();
        return;
      }

      const nextStepArgs = await requestNextStep(newState, apiKey);
      const nextQuestion = argsToQuestion(nextStepArgs, `q-${Date.now()}`);

      setSessionState({
        ...newState,
        currentQuestion: nextQuestion,
        questionHistory: [...newState.questionHistory, nextQuestion],
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get next question"
      );
    } finally {
      setIsLoading(false);
    }
  }, [sessionState, apiKey, onSessionEnd]);

  const rejectEvaluation = useCallback(() => {
    if (!sessionState.pendingEvaluation) return;

    const newAnswerHistory = sessionState.answerHistory.slice(0, -1);
    const newEvaluationHistory = sessionState.evaluationHistory.slice(0, -1);

    const revertedMastery = sessionState.masteryLevels.map((m) => {
      if (m.topic === sessionState.currentQuestion?.topic) {
        return {
          ...m,
          questionsAnswered: Math.max(0, m.questionsAnswered - 1),
          questionsCorrect: Math.max(
            0,
            m.questionsCorrect -
              (sessionState.pendingEvaluation!.evaluation.isCorrect ? 1 : 0)
          ),
          lastAsked:
            newAnswerHistory.length > 0
              ? newAnswerHistory[newAnswerHistory.length - 1].timestamp
              : undefined,
        };
      }
      return m;
    });

    setSessionState((prev: StudySessionState) => ({
      ...prev,
      answerHistory: newAnswerHistory,
      evaluationHistory: newEvaluationHistory,
      masteryLevels: revertedMastery,
      pendingEvaluation: undefined,
    }));
  }, [sessionState]);

  const endSession = useCallback(() => {
    setSessionState((prev: StudySessionState) => ({
      ...prev,
      active: false,
      currentQuestion: undefined,
      pendingEvaluation: undefined,
    }));
    onSessionEnd?.();
  }, [onSessionEnd]);

  return {
    sessionState,
    isLoading,
    error,
    startSession,
    submitAnswer,
    confirmEvaluation,
    rejectEvaluation,
    endSession,
  };
}
