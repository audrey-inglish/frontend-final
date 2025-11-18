interface SessionStartProps {
  topics: string[];
  isLoading: boolean;
  error: string | null;
  onStart: () => void;
}

export function SessionStart({
  topics,
  isLoading,
  error,
  onStart,
}: SessionStartProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center space-y-6">
        <div>
          <h2>Ready to Study?</h2>
          <p className="text-primary-600 mt-2">
            Your AI tutor will guide you through {topics.length} topic
            {topics.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="card">
          <h3 className="font-semibold text-neutral-900 mb-3">Topics:</h3>
          <ul className="space-y-2">
            {topics.map((topic, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-accent-50 text-accent-200 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-primary-500">{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        <button onClick={onStart} disabled={isLoading} className="btn">
          {isLoading ? "Starting Session..." : "Start Study Session"}
        </button>

        {error && (
          <div className="p-4 bg-custom-red-100 border border-custom-red-500 rounded-lg text-custom-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
