import { useStudySession } from '../../hooks/study/useStudySession';
import { StudyQuestionDisplay } from './StudyQuestionDisplay';
import { EvaluationConfirmation } from './EvaluationConfirmation';
import { MasteryOverview } from './MasteryOverview';

interface StudySessionProps {
  topics: string[];
  apiKey: string;
  onComplete?: () => void;
}

export function StudySession({ topics, apiKey, onComplete }: StudySessionProps) {
  const {
    sessionState,
    isLoading,
    error,
    startSession,
    submitAnswer,
    confirmEvaluation,
    rejectEvaluation,
    endSession,
  } = useStudySession({
    topics,
    apiKey,
    onSessionEnd: onComplete,
  });

  // Session not started
  if (!sessionState.active) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ready to Study?</h2>
            <p className="text-gray-600 mt-2">
              Your AI tutor will guide you through {topics.length} topic{topics.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-white rounded-lg border p-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Topics:</h3>
            <ul className="space-y-2">
              {topics.map((topic, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{topic}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={startSession}
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Starting Session...' : 'Start Study Session'}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Session completed
  if (sessionState.questionHistory.length > 0 && !sessionState.currentQuestion && !sessionState.pendingEvaluation) {
    const allMastered = sessionState.masteryLevels.every(m => m.level >= 80);
    
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {allMastered ? 'Session Complete!' : 'Session Ended'}
            </h2>
            <p className="text-gray-600 mt-2">
              {allMastered 
                ? 'Congratulations! You\'ve mastered all topics.'
                : 'You can review your progress below.'}
            </p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <MasteryOverview masteryLevels={sessionState.masteryLevels} />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {sessionState.questionHistory.length}
              </div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {sessionState.evaluationHistory.filter(e => e.isCorrect).length}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  sessionState.masteryLevels.reduce((sum, m) => sum + m.level, 0) / 
                  sessionState.masteryLevels.length
                )}%
              </div>
              <div className="text-sm text-gray-600">Avg Mastery</div>
            </div>
          </div>

          {onComplete && (
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active session
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Study Session</h2>
            <button
              onClick={endSession}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              End Session
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Main Card */}
          <div className="bg-white rounded-lg border p-6">
            {sessionState.pendingEvaluation ? (
              // Show evaluation confirmation
              <EvaluationConfirmation
                question={sessionState.pendingEvaluation.question}
                userAnswer={sessionState.pendingEvaluation.answer}
                evaluation={sessionState.pendingEvaluation.evaluation}
                onConfirm={confirmEvaluation}
                onReject={rejectEvaluation}
                isLoading={isLoading}
              />
            ) : sessionState.currentQuestion ? (
              // Show current question
              <StudyQuestionDisplay
                question={sessionState.currentQuestion}
                onSubmit={submitAnswer}
                isLoading={isLoading}
              />
            ) : (
              // Loading state
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Generating next question...</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6 sticky top-6">
            <MasteryOverview masteryLevels={sessionState.masteryLevels} />

            {/* Progress Stats */}
            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Questions Answered</span>
                <span className="font-medium text-gray-900">
                  {sessionState.answerHistory.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Correct Answers</span>
                <span className="font-medium text-green-600">
                  {sessionState.evaluationHistory.filter(e => e.isCorrect).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-medium text-gray-900">
                  {sessionState.answerHistory.length > 0
                    ? Math.round(
                        (sessionState.evaluationHistory.filter(e => e.isCorrect).length /
                          sessionState.answerHistory.length) *
                          100
                      )
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
