import { useState, useCallback } from "react";
import type {
  StudySessionState,
  StudyQuestion,
  UserAnswer,
  EvaluationResult,
  TopicMastery,
  GetNextStepArgs,
  EvaluateResponseArgs,
} from "../../lib/studySession.types";
import { requestNextStep, requestEvaluation } from "../../lib/agentService";

interface UseStudySessionOptions {
  topics: string[];
  apiKey: string;
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
}

function initializeMastery(topics: string[]): TopicMastery[] {
  return topics.map((topic) => ({
    topic,
    level: 0,
    questionsAnswered: 0,
    questionsCorrect: 0,
  }));
}

// Convert LLM's GetNextStepArgs into a StudyQuestion
function argsToQuestion(
  args: GetNextStepArgs,
  questionId: string
): StudyQuestion {
  return {
    id: questionId,
    type: args.questionType,
    topic: args.topic,
    difficulty: args.difficulty,
    question: args.question,
    options: args.options,
    correctAnswer: args.correctAnswer,
    hint: args.hint,
  };
}

function applyMasteryUpdates(
  currentMastery: TopicMastery[],
  updates: EvaluateResponseArgs["masteryUpdates"]
): TopicMastery[] {
  const masteryMap = new Map(currentMastery.map((m) => [m.topic, { ...m }]));

  for (const update of updates) {
    const existing = masteryMap.get(update.topic);
    if (existing) {
      existing.level = Math.max(0, Math.min(100, update.newLevel));
    }
  }

  return Array.from(masteryMap.values());
}

export function useStudySession({
  topics,
  apiKey,
  onSessionEnd,
}: UseStudySessionOptions): UseStudySessionReturn {
  const [sessionState, setSessionState] = useState<StudySessionState>({
    sessionId: `session-${Date.now()}`,
    active: false,
    topics,
    masteryLevels: initializeMastery(topics),
    questionHistory: [],
    answerHistory: [],
    evaluationHistory: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start the session and get the first question
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

  // Submit an answer and request evaluation from LLM
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

        const evaluation: EvaluationResult = {
          questionId: sessionState.currentQuestion.id,
          isCorrect: evaluationArgs.isCorrect,
          explanation: evaluationArgs.explanation,
          correctAnswer: evaluationArgs.correctAnswer,
          masteryUpdates: applyMasteryUpdates(
            sessionState.masteryLevels,
            evaluationArgs.masteryUpdates
          ),
        };

        const updatedMastery = [...sessionState.masteryLevels];
        const topicMastery = updatedMastery.find(
          (m) => m.topic === sessionState.currentQuestion!.topic
        );
        if (topicMastery) {
          topicMastery.questionsAnswered += 1;
          if (evaluation.isCorrect) {
            topicMastery.questionsCorrect += 1;
          }
          topicMastery.lastAsked = userAnswer.timestamp;
        }

        setSessionState((prev: StudySessionState) => ({
          ...prev,
          answerHistory: [...prev.answerHistory, userAnswer],
          masteryLevels: updatedMastery,
          pendingEvaluation: {
            question: sessionState.currentQuestion!,
            answer: userAnswer,
            evaluation,
          },
        }));

        if (evaluationArgs.recommendation === "end-session") {
          // Will be handled when user confirms
        }
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

  const confirmEvaluation = useCallback(async () => {
    if (!sessionState.pendingEvaluation) return;

    setIsLoading(true);
    setError(null);

    try {
      const { evaluation } = sessionState.pendingEvaluation;
      
      // Use the masteryLevels from sessionState which already has updated counters
      // Just apply the level changes from evaluation.masteryUpdates
      const finalMastery = sessionState.masteryLevels.map(current => {
        const update = evaluation.masteryUpdates.find(u => u.topic === current.topic);
        if (update) {
          return {
            ...current,
            level: update.level, // Apply the new level from agent
          };
        }
        return current;
      });

      const newState: StudySessionState = {
        ...sessionState,
        masteryLevels: finalMastery,
        evaluationHistory: [...sessionState.evaluationHistory, evaluation],
        pendingEvaluation: undefined,
        currentQuestion: undefined,
      };

      const allMastered = finalMastery.every(
        (m: TopicMastery) => m.level >= 80
      );
      if (allMastered) {
        setSessionState({
          ...newState,
          active: false,
        });
        onSessionEnd?.();
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
  }, [sessionState, apiKey, onSessionEnd]);


  const rejectEvaluation = useCallback(() => {
    setSessionState((prev: StudySessionState) => ({
      ...prev,
      pendingEvaluation: undefined,
      // Keep current question so user can re-answer
    }));
  }, []);

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
  };
}
