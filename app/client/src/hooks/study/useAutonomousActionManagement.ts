import { useCallback } from "react";
import type { StudySessionState, TopicMastery } from "../../lib/studySession.types";
import { requestNextAction } from "../../lib/agent/decideNextActionService";
import { requestNextStep } from "../../lib/agent/nextStepService";
import { argsToQuestion } from "../../lib/studySession.utils";
import { isTopicMastered } from "../../lib/studySession.config";

interface UseAutonomousActionManagementOptions {
  sessionState: StudySessionState;
  setSessionState: React.Dispatch<React.SetStateAction<StudySessionState>>;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  onSessionEnd?: () => void;
}

interface UseAutonomousActionManagementReturn {
  executeAutonomousDecision: (updatedMastery?: TopicMastery[]) => Promise<void>;
  acceptHintSuggestion: () => void;
  rejectHintSuggestion: () => Promise<void>;
  acceptSessionEnd: () => void;
  rejectSessionEnd: () => Promise<void>;
}

export function useAutonomousActionManagement({
  sessionState,
  setSessionState,
  setIsLoading,
  setError,
  onSessionEnd,
}: UseAutonomousActionManagementOptions): UseAutonomousActionManagementReturn {

  const executeAutonomousDecision = useCallback(async (updatedMastery?: TopicMastery[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use updated mastery if provided, otherwise use current state
      const stateToUse = updatedMastery 
        ? { ...sessionState, masteryLevels: updatedMastery }
        : sessionState;
      
      const decision = await requestNextAction(stateToUse);

      switch (decision.action) {
        case "continue_session": {
          // Check if all topics are mastered first
          const masteryToCheck = updatedMastery || sessionState.masteryLevels;
          const allMastered = masteryToCheck.every((m: TopicMastery) =>
            isTopicMastered(m.level)
          );
          
          // Only suggest ending if all mastered AND user hasn't already declined
          if (allMastered && !sessionState.userDeclinedSessionEnd) {
            const summary = masteryToCheck
              .map(m => `${m.topic}: ${m.level}% mastery`)
              .join('\n');
            
            setSessionState(prev => ({
              ...prev,
              pendingSessionEnd: {
                sessionSummary: `Congratulations! You've achieved mastery in all topics:\n\n${summary}`,
                reasoning: "All topics have reached the mastery threshold. Great work!",
              },
            }));
            return;
          }

          // Preload next question
          const nextStepArgs = await requestNextStep(stateToUse);
          const nextQuestion = argsToQuestion(nextStepArgs, `q-${Date.now()}`);

          setSessionState(prev => ({
            ...prev,
            pendingEvaluation: prev.pendingEvaluation ? {
              ...prev.pendingEvaluation,
              nextQuestion, // Store preloaded question
            } : undefined,
          }));
          break;
        }

        case "suggest_hint": {
          // Preload the next question when suggesting a hint
          const nextStepArgs = await requestNextStep(stateToUse);
          const nextQuestion = argsToQuestion(nextStepArgs, `q-${Date.now()}`);
          
          setSessionState(prev => ({
            ...prev,
            pendingHintSuggestion: {
              hint: decision.hintText || "",
              reasoning: decision.reasoning,
              nextQuestion, // Include the preloaded question
            },
          }));
          break;
        }

        case "end_session": {
          setSessionState(prev => ({
            ...prev,
            pendingSessionEnd: {
              sessionSummary: decision.sessionSummary || "Session complete!",
              reasoning: decision.reasoning,
            },
          }));
          break;
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get AI decision"
      );
    } finally {
      setIsLoading(false);
    }
  }, [sessionState, setSessionState, setIsLoading, setError]);

  const acceptHintSuggestion = useCallback(() => {
    if (!sessionState.pendingHintSuggestion) return;

    const { hint, nextQuestion } = sessionState.pendingHintSuggestion;
    
    if (!nextQuestion) {
      console.error("No preloaded question in hint suggestion");
      return;
    }

    const questionWithHint = {
      ...nextQuestion,
      hint,
    };

    setSessionState(prev => ({
      ...prev,
      pendingHintSuggestion: undefined,
      pendingEvaluation: undefined,
      currentQuestion: questionWithHint,
      questionHistory: [...prev.questionHistory, questionWithHint],
    }));
  }, [sessionState, setSessionState]);

  const rejectHintSuggestion = useCallback(async () => {
    if (!sessionState.pendingHintSuggestion) return;

    const { nextQuestion } = sessionState.pendingHintSuggestion;

    if (!nextQuestion) {
      console.error("No preloaded question in hint suggestion");
      return;
    }

    // Show the same preloaded question but without the hint
    setSessionState(prev => ({
      ...prev,
      pendingHintSuggestion: undefined,
      pendingEvaluation: undefined,
      currentQuestion: nextQuestion,
      questionHistory: [...prev.questionHistory, nextQuestion],
    }));
  }, [sessionState, setSessionState]);

  const acceptSessionEnd = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      active: false,
      pendingSessionEnd: undefined,
    }));
    onSessionEnd?.();
  }, [setSessionState, onSessionEnd]);

  const rejectSessionEnd = useCallback(async () => {
    setSessionState(prev => ({
      ...prev,
      pendingSessionEnd: undefined,
      userDeclinedSessionEnd: true,
    }));

    // User wants to continue - load next question
    setIsLoading(true);
    try {
      const nextStepArgs = await requestNextStep(sessionState);
      const nextQuestion = argsToQuestion(nextStepArgs, `q-${Date.now()}`);

      setSessionState(prev => ({
        ...prev,
        currentQuestion: nextQuestion,
        questionHistory: [...prev.questionHistory, nextQuestion],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load question");
    } finally {
      setIsLoading(false);
    }
  }, [sessionState, setSessionState, setIsLoading, setError]);

  return {
    executeAutonomousDecision,
    acceptHintSuggestion,
    rejectHintSuggestion,
    acceptSessionEnd,
    rejectSessionEnd,
  };
}
