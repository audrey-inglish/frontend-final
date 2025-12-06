interface StudySessionHeaderProps {
  onShowAiLog: () => void;
  onEndSession: () => void;
  hasSession: boolean;
}

export function StudySessionHeader({
  onShowAiLog,
  onEndSession,
  hasSession,
}: StudySessionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xl font-bold text-primary-700">Study Session</h2>
      <div className="flex">
        <button
          onClick={onShowAiLog}
          className="btn-secondary"
          disabled={!hasSession}
        >
          <span className="sm:hidden">Reasoning</span>
          <span className="hidden sm:inline">View AI Reasoning</span>
        </button>
        <button onClick={onEndSession} className="btn-secondary">
          <span className="sm:hidden">End</span>
          <span className="hidden sm:inline">End Session</span>
        </button>
      </div>
    </div>
  );
}
