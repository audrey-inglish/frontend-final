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
  rejectEvaluation: () => void;
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
  }, [sessionState, apiKey, setSessionState, setIsLoading, setError]);

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
  }, [sessionState, setSessionState]);

  return {
    confirmEvaluation,
    rejectEvaluation,
  };
}
