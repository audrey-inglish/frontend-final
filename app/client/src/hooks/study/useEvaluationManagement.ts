import { useCallback } from "react";
import type { StudySessionState, TopicMastery } from "../../lib/studySession.types";
import { requestNextStep } from "../../lib/agent/nextStepService";
import { argsToQuestion } from "../../lib/studySession.utils";
import { isTopicMastered } from "../../lib/studySession.config";

interface UseEvaluationManagementOptions {
  sessionState: StudySessionState;
  apiKey: string;
  setSessionState: React.Dispatch<React.SetStateAction<StudySessionState>>;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface UseEvaluationManagementReturn {
  confirmEvaluation: () => Promise<void>;
}


export function useEvaluationManagement({
  sessionState,
  apiKey,
  setSessionState,
  setIsLoading,
  setError,
}: UseEvaluationManagementOptions): UseEvaluationManagementReturn {
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
        return;
      }

      // use preloaded question if available, otherwise load now
      let nextQuestion = sessionState.pendingEvaluation.nextQuestion;
      
      if (!nextQuestion) {
        const nextStepArgs = await requestNextStep(newState, apiKey);
        nextQuestion = argsToQuestion(nextStepArgs, `q-${Date.now()}`);
      }

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
  }, [sessionState, apiKey, setSessionState, setIsLoading, setError]);

  return {
    confirmEvaluation,
  };
}
