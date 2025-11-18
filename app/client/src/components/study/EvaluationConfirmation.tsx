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
          ? 'bg-custom-green-100'
          : 'bg-custom-red-100'
      }`}>
        <div className="flex items-center space-x-2">
          <span className={`font-semibold text-lg ${
            evaluation.isCorrect ? 'text-custom-green-500' : 'text-custom-red-500'
          }`}>
            {evaluation.isCorrect ? 'Correct!' : 'Not quite right'}
          </span>
        </div>
      </div>

      {/* Question Review */}
      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium text-primary-500">Question</div>
          <div className="text-primary-800 mt-1">{question.question}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-primary-500">Your Answer</div>
          <div className="text-primary-800 mt-1">{userAnswer.answer}</div>
        </div>

        {!evaluation.isCorrect && evaluation.correctAnswer && (
          <div>
            <div className="text-sm font-medium text-primary-500">Correct Answer</div>
            <div className="text-custom-green-700 font-medium mt-1">{evaluation.correctAnswer}</div>
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="p-4 bg-primary-50 rounded-lg">
        <div className="text-sm font-medium text-primary-700 mb-2">Explanation</div>
        <div className="text-primary-900 whitespace-pre-line">{evaluation.explanation}</div>
      </div>

      {/* Confirmation Actions */}
      <div className="border-t pt-4">
        <div className="text-sm text-primary-600 mb-4">
          Review the AI's evaluation. Click <strong>Confirm</strong> to accept and continue, or <strong>Reject</strong> to re-answer the question.
        </div>
        <div className="flex gap-3">
          <button
            onClick={onReject}
            disabled={isLoading}
            className="flex-1 btn-secondary"
          >
            Reject
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 btn"
          >
            {isLoading ? 'Loading...' : 'Confirm & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
