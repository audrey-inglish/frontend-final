import type { TopicMastery } from '../../../lib/studySession.types';
import { isTopicMastered } from '../../../lib/studySession.config';

interface MasteryOverviewProps {
  masteryLevels: TopicMastery[];
  className?: string;
}

export function MasteryOverview({ masteryLevels, className = '' }: MasteryOverviewProps) {
  const averageMastery = masteryLevels.length > 0
    ? Math.round(masteryLevels.reduce((sum, m) => sum + m.level, 0) / masteryLevels.length)
    : 0;

  const getMasteryColor = (level: number) => {
    if (isTopicMastered(level)) return 'bg-custom-green-500';
    if (level >= 50) return 'bg-accent-300';
    return 'bg-accent-200';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary-800">Mastery Progress</h3>
        <div className="text-xs text-primary-400">
          Average: <span className="font-semibold text-primary-500">{averageMastery}%</span>
        </div>
      </div>

      <div className="space-y-3">
        {masteryLevels.map((mastery) => (
          <div key={mastery.topic} className="space-y-2">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-primary-600">{mastery.topic}</span>
              <span className="text-xs text-primary-500">
                {mastery.questionsCorrect}/{mastery.questionsAnswered} correct
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-primary-50 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${getMasteryColor(mastery.level)}`}
                  style={{ width: `${mastery.level}%` }}
                />
              </div>
              <span className="absolute right-0 -top-6 text-xs font-semibold text-primary-800">
                {mastery.level}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
