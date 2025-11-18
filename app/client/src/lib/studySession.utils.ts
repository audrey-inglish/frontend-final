import type {
  StudyQuestion,
  TopicMastery,
  GetNextStepArgs,
  EvaluateResponseArgs,
} from "./studySession.types";

export function initializeMastery(topics: string[]): TopicMastery[] {
  return topics.map((topic) => ({
    topic,
    level: 0,
    questionsAnswered: 0,
    questionsCorrect: 0,
  }));
}

export function argsToQuestion(
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

export function calculateMasteryLevel(
  questionsCorrect: number,
  questionsAnswered: number
): number {
  if (questionsAnswered === 0) return 0;
  const accuracy = questionsCorrect / questionsAnswered;

  let maxPossibleMastery = 100;
  if (questionsAnswered < 5) {
    maxPossibleMastery = 40 + questionsAnswered * 12;
  }

  const calculatedLevel = accuracy * maxPossibleMastery;
  return Math.round(Math.min(100, calculatedLevel));
}

export function applyMasteryUpdates(
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
