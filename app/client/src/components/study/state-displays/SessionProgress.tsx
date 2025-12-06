import type { TopicMastery } from "../../../lib/studySession.types";
import { MasteryOverview } from "./MasteryOverview";

interface SessionProgressProps {
  masteryLevels: TopicMastery[];
  answersCount: number;
  correctCount: number;
}

export function SessionProgress({
  masteryLevels,
  answersCount,
  correctCount,
}: SessionProgressProps) {
  const accuracy =
    answersCount > 0 ? Math.round((correctCount / answersCount) * 100) : 0;

  return (
    <div className="card sticky top-6">
      <MasteryOverview masteryLevels={masteryLevels} />

      <div className="mt-6 pt-6 border-t space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-primary-600">Questions Answered</span>
          <span className="font-medium text-neutral-900">{answersCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-primary-600">Correct Answers</span>
          <span className="font-medium text-custom-green-600">
            {correctCount}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-primary-600">Accuracy</span>
          <span className="font-medium text-neutral-900">{accuracy}%</span>
        </div>
      </div>
    </div>
  );
}
