import { useCallback } from "react";
import type {
  StudySessionState,
  UserAnswer,
} from "../../lib/studySession.types";
import { requestEvaluation } from "../../lib/agent/evaluationService";
import { buildEvaluationState } from "./evaluationStateBuilder";

interface UseAnswerSubmissionOptions {
  sessionState: StudySessionState;
  setSessionState: React.Dispatch<React.SetStateAction<StudySessionState>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  executeAutonomousDecision: (mastery: StudySessionState['masteryLevels']) => Promise<void>;
}

export function useAnswerSubmission({
  sessionState,
  setSessionState,
  setIsLoading,
  setError,
  executeAutonomousDecision,
}: UseAnswerSubmissionOptions) {
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

        const evaluationArgs = await requestEvaluation(sessionState, answer);

        setSessionState((prev: StudySessionState) => {
          const stateUpdate = buildEvaluationState(prev, userAnswer, evaluationArgs);
          
          if (!stateUpdate.masteryLevels || !stateUpdate.pendingEvaluation) {
            console.error('Failed to build evaluation state');
            return prev;
          }

          setTimeout(async () => {
            await executeAutonomousDecision(stateUpdate.masteryLevels!);
          }, 0);

          return {
            ...prev,
            ...stateUpdate,
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
    [sessionState, setSessionState, setIsLoading, setError, executeAutonomousDecision]
  );

  return { submitAnswer };
}
