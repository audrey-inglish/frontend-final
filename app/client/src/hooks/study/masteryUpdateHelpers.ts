import type { TopicMastery } from "../../lib/studySession.types";
import { calculateMasteryLevel } from "../../lib/studySession.utils";

export function updateMasteryCounters(
  masteryLevels: TopicMastery[],
  currentTopic: string,
  isCorrect: boolean,
  timestamp: string
): TopicMastery[] {
  return masteryLevels.map((m) => {
    if (m.topic === currentTopic) {
      const newQuestionsAnswered = m.questionsAnswered + 1;
      const newQuestionsCorrect = m.questionsCorrect + (isCorrect ? 1 : 0);
      const calculatedLevel = calculateMasteryLevel(
        newQuestionsCorrect,
        newQuestionsAnswered
      );

      return {
        ...m,
        questionsAnswered: newQuestionsAnswered,
        questionsCorrect: newQuestionsCorrect,
        level: calculatedLevel,
        lastAsked: timestamp,
      };
    }
    return m;
  });
}
