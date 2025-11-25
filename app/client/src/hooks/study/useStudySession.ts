import { useState, useCallback } from "react";
import type {
  StudySessionState,
  UserAnswer,
  EvaluationResult,
} from "../../lib/studySession.types";
import { requestNextStep } from "../../lib/agent/nextStepService";
import { requestEvaluation } from "../../lib/agent/evaluationService";
import {
  initializeMastery,
  argsToQuestion,
  calculateMasteryLevel,
  applyMasteryUpdates,
} from "../../lib/studySession.utils";
import { useHintManagement } from "./useHintManagement";
import { useEvaluationManagement } from "./useEvaluationManagement";

interface UseStudySessionOptions {
  topics: string[];
  apiKey: string;
  dashboardId?: number; // Added for AI action logging
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
  requestHintForQuestion: () => Promise<void>;
  acceptHint: () => void;
  rejectHint: () => void;
}

export function useStudySession({
  topics,
  apiKey,
  dashboardId,
  onSessionEnd,
}: UseStudySessionOptions): UseStudySessionReturn {
  const [sessionState, setSessionState] = useState<StudySessionState>({
    sessionId: `session-${Date.now()}`,
    dashboardId,
    active: false,
    topics,
    masteryLevels: initializeMastery(topics),
    questionHistory: [],
    answerHistory: [],
    evaluationHistory: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    requestHintForQuestion,
    acceptHint,
    rejectHint,
  } = useHintManagement({
    sessionState,
    apiKey,
    setSessionState,
    setIsLoading,
    setError,
  });

  const {
    confirmEvaluation,
    rejectEvaluation,
  } = useEvaluationManagement({
    sessionState,
    apiKey,
    setSessionState,
    setIsLoading,
    setError,
  });

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
    requestHintForQuestion,
    acceptHint,
    rejectHint,
  };
}
