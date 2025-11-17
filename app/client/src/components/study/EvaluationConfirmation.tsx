import type { StudyQuestion, UserAnswer, EvaluationResult } from '../../lib/studySession.types';

interface EvaluationConfirmationProps {
  question: StudyQuestion;
  userAnswer: UserAnswer;
  evaluation: EvaluationResult;
  onConfirm: () => void;
  onReject: () => void;
  isLoading: boolean;
}

export function EvaluationConfirmation({
  question,
  userAnswer,
  evaluation,
  onConfirm,
  onReject,
  isLoading,
}: EvaluationConfirmationProps) {
  return (
    <div className="space-y-6">
      {/* Result Banner */}
      <div className={`p-4 rounded-lg ${
        evaluation.isCorrect
          ? 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">
            {evaluation.isCorrect ? '✓' : '✗'}
          </span>
          <span className={`font-semibold text-lg ${
            evaluation.isCorrect ? 'text-green-900' : 'text-red-900'
          }`}>
            {evaluation.isCorrect ? 'Correct!' : 'Not quite right'}
          </span>
        </div>
      </div>

      {/* Question Review */}
      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium text-gray-500">Question</div>
          <div className="text-gray-900 mt-1">{question.question}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500">Your Answer</div>
          <div className="text-gray-900 mt-1">{userAnswer.answer}</div>
        </div>

        {!evaluation.isCorrect && evaluation.correctAnswer && (
          <div>
            <div className="text-sm font-medium text-gray-500">Correct Answer</div>
            <div className="text-green-700 font-medium mt-1">{evaluation.correctAnswer}</div>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-2">Explanation</div>
        <div className="text-gray-900 whitespace-pre-line">{evaluation.explanation}</div>
      </div>

      {/* Mastery Updates */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Updated Mastery Levels</div>
        <div className="space-y-2">
          {evaluation.masteryUpdates.map((mastery) => (
            <div key={mastery.topic} className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <span className="text-sm text-gray-700">{mastery.topic}</span>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${mastery.level}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-12 text-right">
                  {mastery.level}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Actions */}
      <div className="border-t pt-4">
        <div className="text-sm text-gray-600 mb-4">
          Review the AI's evaluation. Click <strong>Confirm</strong> to accept and continue, or <strong>Reject</strong> to re-answer the question.
        </div>
        <div className="flex gap-3">
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Loading...' : 'Confirm & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
