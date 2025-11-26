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
import { useAutonomousActionManagement } from "./useAutonomousActionManagement";

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
  endSession: () => void;
  requestHintForQuestion: () => Promise<void>;
  acceptHint: () => void;
  rejectHint: () => void;
  acceptHintSuggestion: () => void;
  rejectHintSuggestion: () => Promise<void>;
  acceptSessionEnd: () => void;
  rejectSessionEnd: () => Promise<void>;
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
  } = useEvaluationManagement({
    sessionState,
    apiKey,
    setSessionState,
    setIsLoading,
    setError,
  });

  const {
    executeAutonomousDecision,
    acceptHintSuggestion,
    rejectHintSuggestion,
    acceptSessionEnd,
    rejectSessionEnd,
  } = useAutonomousActionManagement({
    sessionState,
    apiKey,
    setSessionState,
    setIsLoading,
    setError,
    onSessionEnd,
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

        setSessionState((prev: StudySessionState) => {
          const currentQuestion = prev.currentQuestion;
          if (!currentQuestion) {
            console.error('submitAnswer called but no current question in state');
            return prev;
          }
          
          const updatedMastery = applyMasteryUpdates(
            prev.masteryLevels,
            evaluationArgs.masteryUpdates
          );

          const evaluation: EvaluationResult = {
            questionId: currentQuestion.id,
            isCorrect: evaluationArgs.isCorrect,
            explanation: evaluationArgs.explanation,
            correctAnswer: evaluationArgs.correctAnswer,
            masteryUpdates: updatedMastery,
          };

          const masteryWithCounters = updatedMastery.map((m) => {
            if (m.topic === currentQuestion.topic) {
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


          setTimeout(async () => {
            await executeAutonomousDecision(masteryWithCounters);
          }, 0);

          return {
            ...prev,
            answerHistory: [...prev.answerHistory, userAnswer],
            evaluationHistory: [...prev.evaluationHistory, evaluation],
            masteryLevels: masteryWithCounters,
            pendingEvaluation: {
              question: currentQuestion,
              answer: userAnswer,
              evaluation,
            },
          };
        });

        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to evaluate answer"
        );
        setIsLoading(false);
      }
    },
    [sessionState, apiKey, executeAutonomousDecision]
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
    endSession,
    requestHintForQuestion,
    acceptHint,
    rejectHint,
    acceptHintSuggestion,
    rejectHintSuggestion,
    acceptSessionEnd,
    rejectSessionEnd,
  };
}
