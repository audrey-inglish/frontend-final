import type { TopicMastery } from '../../lib/studySession.types';

interface MasteryOverviewProps {
  masteryLevels: TopicMastery[];
  className?: string;
}

export function MasteryOverview({ masteryLevels, className = '' }: MasteryOverviewProps) {
  const averageMastery = masteryLevels.length > 0
    ? Math.round(masteryLevels.reduce((sum, m) => sum + m.level, 0) / masteryLevels.length)
    : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Mastery Progress</h3>
        <div className="text-sm text-gray-500">
          Average: <span className="font-semibold text-gray-900">{averageMastery}%</span>
        </div>
      </div>

      <div className="space-y-3">
        {masteryLevels.map((mastery) => (
          <div key={mastery.topic} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{mastery.topic}</span>
              <span className="text-sm text-gray-500">
                {mastery.questionsCorrect}/{mastery.questionsAnswered} correct
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    mastery.level >= 80
                      ? 'bg-green-500'
                      : mastery.level >= 50
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${mastery.level}%` }}
                />
              </div>
              <span className="absolute right-0 -top-6 text-xs font-semibold text-gray-900">
                {mastery.level}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
