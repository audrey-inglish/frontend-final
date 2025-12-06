import { useCallback } from "react";
import type { StudySessionState } from "../../lib/studySession.types";
import { requestNextStep } from "../../lib/agent/nextStepService";
import { argsToQuestion } from "../../lib/studySession.utils";

interface UseSessionStartOptions {
  sessionState: StudySessionState;
  setSessionState: React.Dispatch<React.SetStateAction<StudySessionState>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useSessionStart({
  sessionState,
  setSessionState,
  setIsLoading,
  setError,
}: UseSessionStartOptions) {
  const startSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextStepArgs = await requestNextStep(sessionState);
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
  }, [sessionState, setSessionState, setIsLoading, setError]);

  return { startSession };
}
