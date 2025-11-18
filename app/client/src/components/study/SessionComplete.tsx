import type { TopicMastery } from "../../lib/studySession.types";
import { MasteryOverview } from "./MasteryOverview";
import { isTopicMastered } from "../../lib/studySession.config";

interface SessionCompleteProps {
  masteryLevels: TopicMastery[];
  questionCount: number;
  correctCount: number;
  onComplete?: () => void;
}

export function SessionComplete({
  masteryLevels,
  questionCount,
  correctCount,
  onComplete,
}: SessionCompleteProps) {
  const allMastered = masteryLevels.every((m) => isTopicMastered(m.level));
  const avgMastery = Math.round(
    masteryLevels.reduce((sum, m) => sum + m.level, 0) / masteryLevels.length
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <div>
          <h2>{allMastered ? "Session Complete!" : "Session Ended"}</h2>
          <p className="text-primary-600 mt-2">
            {allMastered
              ? "Congratulations! You've mastered all topics."
              : "You can review your progress below."}
          </p>
        </div>

        <div className="card">
          <MasteryOverview masteryLevels={masteryLevels} />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-primary-50 rounded-lg">
            <div className="text-2xl font-bold text-neutral-900">
              {questionCount}
            </div>
            <div className="text-sm text-primary-600">Questions</div>
          </div>
          <div className="p-4 bg-primary-50 rounded-lg">
            <div className="text-2xl font-bold text-custom-green-600">
              {correctCount}
            </div>
            <div className="text-sm text-primary-600">Correct</div>
          </div>
          <div className="p-4 bg-primary-50 rounded-lg">
            <div className="text-2xl font-bold text-accent-600">{avgMastery}%</div>
            <div className="text-sm text-primary-600">Avg Mastery</div>
          </div>
        </div>

        {onComplete && (
          <button onClick={onComplete} className="btn">
            Done
          </button>
        )}
      </div>
    </div>
  );
}
