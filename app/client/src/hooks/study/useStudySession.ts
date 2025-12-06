import { useState, useCallback } from "react";
import type {
  StudySessionState,
} from "../../lib/studySession.types";
import { initializeMastery } from "../../lib/studySession.utils";
import { useHintManagement } from "./useHintManagement";
import { useEvaluationManagement } from "./useEvaluationManagement";
import { useAutonomousActionManagement } from "./useAutonomousActionManagement";
import { useSessionStart } from "./useSessionStart";
import { useAnswerSubmission } from "./useAnswerSubmission";

interface UseStudySessionOptions {
  topics: string[];
  dashboardId?: number; // Added for AI action logging
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

export type { StudySessionState };

export function useStudySession({
  topics,
  dashboardId,
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
    setSessionState,
    setIsLoading,
    setError,
  });

  const {
    confirmEvaluation,
  } = useEvaluationManagement({
    sessionState,
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
    setSessionState,
    setIsLoading,
    setError,
  });

  const { startSession } = useSessionStart({
    sessionState,
    setSessionState,
    setIsLoading,
    setError,
  });

  const { submitAnswer } = useAnswerSubmission({
    sessionState,
    setSessionState,
    setIsLoading,
    setError,
    executeAutonomousDecision,
  });

  const endSession = useCallback(() => {
    setSessionState((prev: StudySessionState) => ({
      ...prev,
      active: false,
      currentQuestion: undefined,
      pendingEvaluation: undefined,
    }));
  }, []);

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
