import { useState } from "react";
import { useStudySession } from "../../hooks/study/useStudySession";
import { SessionStart } from "./SessionStart";
import { SessionComplete } from "./SessionComplete";
import { SessionProgress } from "./SessionProgress";
import { AiActionLogModal } from "./AiActionLogModal";
import { StudySessionHeader } from "./StudySessionHeader";
import { StudySessionMainCard } from "./StudySessionMainCard";

interface StudySessionProps {
  topics: string[];
  dashboardId?: number;
  onComplete?: () => void;
}

export function StudySession({
  topics,
  dashboardId,
  onComplete,
}: StudySessionProps) {
  const [showAiLog, setShowAiLog] = useState(false);

  const {
    sessionState,
    isLoading,
    error,
    startSession,
    submitAnswer,
    confirmEvaluation,
    endSession,
    requestHintForQuestion,
    acceptHint,
    rejectHint,
    acceptHintSuggestion,
    rejectHintSuggestion,
    acceptSessionEnd,
    rejectSessionEnd,
  } = useStudySession({
    topics,
    dashboardId,
  });

  if (
    !sessionState.active &&
    sessionState.questionHistory.length > 0
  ) {
    return (
      <SessionComplete
        masteryLevels={sessionState.masteryLevels}
        questionCount={sessionState.questionHistory.length}
        correctCount={
          sessionState.evaluationHistory.filter((e) => e.isCorrect).length
        }
        onComplete={onComplete}
      />
    );
  }

  // Show session start if session hasn't started yet
  if (!sessionState.active) {
    return (
      <SessionStart
        topics={topics}
        isLoading={isLoading}
        error={error}
        onStart={startSession}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StudySessionHeader
            onShowAiLog={() => setShowAiLog(true)}
            onEndSession={endSession}
            hasSession={!!sessionState.sessionId}
          />

          <StudySessionMainCard
            sessionState={sessionState}
            isLoading={isLoading}
            onSubmitAnswer={submitAnswer}
            onRequestHint={requestHintForQuestion}
            onConfirmEvaluation={confirmEvaluation}
            onAcceptHint={acceptHint}
            onRejectHint={rejectHint}
            onAcceptHintSuggestion={acceptHintSuggestion}
            onRejectHintSuggestion={rejectHintSuggestion}
            onAcceptSessionEnd={acceptSessionEnd}
            onRejectSessionEnd={rejectSessionEnd}
          />

          {error && (
            <div className="p-4 bg-custom-red-100 border border-custom-red-500 rounded-lg text-custom-red-500">
              {error}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <SessionProgress
            masteryLevels={sessionState.masteryLevels}
            answersCount={sessionState.answerHistory.length}
            correctCount={
              sessionState.evaluationHistory.filter((e) => e.isCorrect).length
            }
          />
        </div>
      </div>

      {showAiLog && (
        <AiActionLogModal
          sessionId={sessionState.sessionId}
          onClose={() => setShowAiLog(false)}
        />
      )}
    </div>
  );
}
