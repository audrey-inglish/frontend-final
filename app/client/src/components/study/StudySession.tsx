import { useState } from "react";
import { useStudySession } from "../../hooks/study/useStudySession";
import { StudyQuestionDisplay } from "./StudyQuestionDisplay";
import { EvaluationConfirmation } from "./EvaluationConfirmation";
import { HintConfirmation } from "./HintConfirmation";
import { SessionStart } from "./SessionStart";
import { SessionComplete } from "./SessionComplete";
import { SessionProgress } from "./SessionProgress";
import { AiActionLogModal } from "./AiActionLogModal";

interface StudySessionProps {
  topics: string[];
  apiKey: string;
  dashboardId?: number;
  onComplete?: () => void;
}

export function StudySession({
  topics,
  apiKey,
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
    rejectEvaluation,
    endSession,
    requestHintForQuestion,
    acceptHint,
    rejectHint,
  } = useStudySession({
    topics,
    apiKey,
    dashboardId,
    onSessionEnd: onComplete,
  });

  if (
    sessionState.questionHistory.length > 0 &&
    !sessionState.currentQuestion &&
    !sessionState.pendingEvaluation
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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary-700">
              Study Session
            </h2>
            <div className="flex">
              <button
                onClick={() => setShowAiLog(true)}
                className="btn-secondary"
                disabled={!sessionState.sessionId}
              >
                <span className="sm:hidden pl-2">Reasoning</span>
                <span className="hidden sm:inline">View AI Reasoning</span>
              </button>
              <button onClick={endSession} className="btn-secondary">
                <span className="sm:hidden">End</span>
                <span className="hidden sm:inline">End Session</span>
              </button>
            </div>
          </div>

          {/* Main Card */}
          <div className="card">
            {sessionState.pendingHint ? (
              <HintConfirmation
                hint={sessionState.pendingHint}
                onAccept={acceptHint}
                onReject={rejectHint}
                isLoading={isLoading}
              />
            ) : sessionState.pendingEvaluation ? (
              <EvaluationConfirmation
                question={sessionState.pendingEvaluation.question}
                userAnswer={sessionState.pendingEvaluation.answer}
                evaluation={sessionState.pendingEvaluation.evaluation}
                onConfirm={confirmEvaluation}
                onReject={rejectEvaluation}
                isLoading={isLoading}
              />
            ) : sessionState.currentQuestion ? (
              <StudyQuestionDisplay
                question={sessionState.currentQuestion}
                onSubmit={submitAnswer}
                onRequestHint={requestHintForQuestion}
                isLoading={isLoading}
              />
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mx-auto"></div>
                <p className="text-primary-600 mt-4">
                  Generating next question...
                </p>
              </div>
            )}
          </div>

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

      {/* AI Action Log Modal */}
      {showAiLog && (
        <AiActionLogModal
          sessionId={sessionState.sessionId}
          onClose={() => setShowAiLog(false)}
        />
      )}
    </div>
  );
}
