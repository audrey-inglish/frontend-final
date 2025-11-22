interface ScoreDataPoint {
  score: number;
  created_at: string;
}

interface ScoreHistoryChartProps {
  data: ScoreDataPoint[];
}

export function ScoreHistoryChart({ data }: ScoreHistoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-primary-800 mb-4">Score History</h3>
        <div className="text-center py-12 text-neutral-500">
          <p>No quiz scores available yet.</p>
          <p className="text-sm mt-2">Complete some quizzes to see your progress!</p>
        </div>
      </div>
    );
  }

  // Calculate chart dimensions
  const chartHeight = 200;

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-primary-800 mb-6">Score History</h3>
      
      {/* Chart container */}
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-neutral-500 pr-2">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* Chart area */}
        <div className="ml-10 h-full relative border-l border-b border-neutral-200">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[0, 25, 50, 75].map((percent) => (
              <div
                key={percent}
                className="absolute w-full border-t border-neutral-100"
                style={{ bottom: `${percent}%` }}
              />
            ))}
          </div>

          {/* Score line */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <polyline
              fill="none"
              stroke="#787eb3"
              strokeWidth="2"
              points={data
                .map((point, index) => {
                  const x = (index / (data.length - 1 || 1)) * 100;
                  const y = 100 - point.score;
                  return `${x},${y}`;
                })
                .join(' ')}
            />
            {/* Data points */}
            {data.map((point, index) => {
              const x = (index / (data.length - 1 || 1)) * 100;
              const y = 100 - point.score;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1"
                  fill="#3b82f6"
                  className="cursor-pointer"
                  style={{ transition: 'r 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.setAttribute('r', '1.5')}
                  onMouseLeave={(e) => e.currentTarget.setAttribute('r', '1')}
                >
                  <title>{`Score: ${point.score.toFixed(1)}%`}</title>
                </circle>
              );
            })}
          </svg>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="ml-10 mt-2 flex justify-between text-xs text-neutral-500">
        <span>Quiz 1</span>
        {data.length > 1 && <span>Quiz {data.length}</span>}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center text-sm text-neutral-600">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-accent-200 mr-2"></div>
          <span>Quiz Scores</span>
        </div>
      </div>
    </div>
  );
}
