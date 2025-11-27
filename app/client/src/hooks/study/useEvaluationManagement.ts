import { useCallback } from "react";
import type { StudySessionState, TopicMastery } from "../../lib/studySession.types";
import { requestNextStep } from "../../lib/agent/nextStepService";
import { argsToQuestion } from "../../lib/studySession.utils";
import { isTopicMastered } from "../../lib/studySession.config";

interface UseEvaluationManagementOptions {
  sessionState: StudySessionState;
  setSessionState: React.Dispatch<React.SetStateAction<StudySessionState>>;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface UseEvaluationManagementReturn {
  confirmEvaluation: () => Promise<void>;
}


export function useEvaluationManagement({
  sessionState,
  setSessionState,
  setIsLoading,
  setError,
}: UseEvaluationManagementOptions): UseEvaluationManagementReturn {
  const confirmEvaluation = useCallback(async () => {
    if (!sessionState.pendingEvaluation) return;

    const hasPreloadedQuestion = !!sessionState.pendingEvaluation.nextQuestion;

    setIsLoading(true);
    setError(null);

    try {
      // Use functional setState to get the latest state
      let shouldLoadQuestion = false;
      
      setSessionState(prev => {
        const allMastered = prev.masteryLevels.every((m: TopicMastery) =>
          isTopicMastered(m.level)
        );
        
        if (allMastered) {
          return {
            ...prev,
            pendingEvaluation: undefined,
            currentQuestion: undefined,
            active: false,
          };
        }

        const nextQuestion = prev.pendingEvaluation?.nextQuestion;
        
        if (nextQuestion) {
          return {
            ...prev,
            pendingEvaluation: undefined,
            currentQuestion: nextQuestion,
            questionHistory: [...prev.questionHistory, nextQuestion],
          };
        }
        
        shouldLoadQuestion = true;
        return {
          ...prev,
          pendingEvaluation: undefined,
          currentQuestion: undefined,
        };
      });

      if (!hasPreloadedQuestion && shouldLoadQuestion) {
        const nextStepArgs = await requestNextStep(sessionState);
        const nextQuestion = argsToQuestion(nextStepArgs, `q-${Date.now()}`);

        setSessionState(prev => ({
          ...prev,
          currentQuestion: nextQuestion,
          questionHistory: [...prev.questionHistory, nextQuestion],
        }));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get next question"
      );
    } finally {
      setIsLoading(false);
    }
  }, [sessionState, setSessionState, setIsLoading, setError]);

  return {
    confirmEvaluation,
  };
}
