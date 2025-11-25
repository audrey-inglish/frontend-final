import { useCallback } from "react";
import type { StudySessionState } from "../../lib/studySession.types";
import { requestHint } from "../../lib/agent/hintService";

interface UseHintManagementOptions {
  sessionState: StudySessionState;
  apiKey: string;
  setSessionState: React.Dispatch<React.SetStateAction<StudySessionState>>;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface UseHintManagementReturn {
  requestHintForQuestion: () => Promise<void>;
  acceptHint: () => void;
  rejectHint: () => void;
}

export function useHintManagement({
  sessionState,
  apiKey,
  setSessionState,
  setIsLoading,
  setError,
}: UseHintManagementOptions): UseHintManagementReturn {
  const requestHintForQuestion = useCallback(async () => {
    if (!sessionState.currentQuestion) {
      setError("No current question");
      return;
    }

    setIsLoading(true);
    setError(null);

    const hintResponse = await requestHint(sessionState, apiKey);

    if (hintResponse.hint) {
      // LLM decided to provide a hint - show confirmation
      setSessionState((prev: StudySessionState) => ({
        ...prev,
        pendingHint: hintResponse.hint!,
      }));
    } else {
      setError(
        hintResponse.aiMessage || "The AI suggests trying without a hint first."
      );
    }

    setIsLoading(false);
  }, [sessionState, apiKey, setSessionState, setIsLoading, setError]);

  const acceptHint = useCallback(() => {
    if (!sessionState.pendingHint || !sessionState.currentQuestion) return;

    // Add hint to current question
    const updatedQuestion = {
      ...sessionState.currentQuestion,
      hint: sessionState.pendingHint.hint,
    };

    setSessionState((prev: StudySessionState) => ({
      ...prev,
      currentQuestion: updatedQuestion,
      pendingHint: undefined,
    }));
  }, [sessionState, setSessionState]);

  const rejectHint = useCallback(() => {
    setSessionState((prev: StudySessionState) => ({
      ...prev,
      pendingHint: undefined,
    }));
  }, [setSessionState]);

  return {
    requestHintForQuestion,
    acceptHint,
    rejectHint,
  };
}
