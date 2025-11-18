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

function calculateMasteryLevel(
  questionsCorrect: number,
  questionsAnswered: number
): number {
  if (questionsAnswered === 0) return 0;
  const accuracy = questionsCorrect / questionsAnswered;

  // Scale mastery based on how many questions they've answered
  // Fewer questions = lower max mastery (need to prove it)
  let maxPossibleMastery = 100;
  if (questionsAnswered < 5) {
    // Cap mastery until they've answered at least 5 questions
    maxPossibleMastery = 40 + questionsAnswered * 12; // 52%, 64%, 76%, 88%, 100%
  }

  const calculatedLevel = accuracy * maxPossibleMastery;

  return Math.round(Math.min(100, calculatedLevel));
}

function applyMasteryUpdates(
  currentMastery: TopicMastery[],
  updates: EvaluateResponseArgs["masteryUpdates"]
): TopicMastery[] {
  const masteryMap = new Map(currentMastery.map((m) => [m.topic, { ...m }]));

  for (const update of updates) {
    const existing = masteryMap.get(update.topic);
    if (existing) {
      const newLevel =
        typeof update.newLevel === "number" && !isNaN(update.newLevel)
          ? update.newLevel
          : existing.level;
      existing.level = Math.max(0, Math.min(100, newLevel));
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

        console.log("Evaluation from agent:", evaluationArgs);
        console.log(
          "Current mastery before update:",
          sessionState.masteryLevels
        );

        const updatedMastery = applyMasteryUpdates(
          sessionState.masteryLevels,
          evaluationArgs.masteryUpdates
        );

        console.log(
          "Updated mastery after applying agent updates:",
          updatedMastery
        );
        console.log(
          "Current question topic:",
          sessionState.currentQuestion.topic
        );

        const evaluation: EvaluationResult = {
          questionId: sessionState.currentQuestion.id,
          isCorrect: evaluationArgs.isCorrect,
          explanation: evaluationArgs.explanation,
          correctAnswer: evaluationArgs.correctAnswer,
          masteryUpdates: updatedMastery,
        };

        // Update the counters for the topic
        const masteryWithCounters = updatedMastery.map((m) => {
          if (m.topic === sessionState.currentQuestion!.topic) {
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

        console.log(
          "Final mastery with updated counters:",
          masteryWithCounters
        );

        setSessionState((prev: StudySessionState) => ({
          ...prev,
          answerHistory: [...prev.answerHistory, userAnswer],
          evaluationHistory: [...prev.evaluationHistory, evaluation],
          masteryLevels: masteryWithCounters,
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
      const newState: StudySessionState = {
        ...sessionState,
        pendingEvaluation: undefined,
        currentQuestion: undefined,
      };

      const allMastered = sessionState.masteryLevels.every(
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
    if (!sessionState.pendingEvaluation) return;

    // Remove the last answer and evaluation from history
    const newAnswerHistory = sessionState.answerHistory.slice(0, -1);
    const newEvaluationHistory = sessionState.evaluationHistory.slice(0, -1);

    // Revert the mastery counters for the rejected evaluation
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
      // Keep current question so user can re-answer
    }));
  }, [sessionState]);

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
