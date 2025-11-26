import type { StudyQuestion, UserAnswer, EvaluationResult } from '../../lib/studySession.types';
import { SpinnerIcon } from '../icons';

interface EvaluationConfirmationProps {
  question: StudyQuestion;
  userAnswer: UserAnswer;
  evaluation: EvaluationResult;
  onConfirm: () => void;
  isLoading: boolean;
}

export function EvaluationConfirmation({
  question,
  userAnswer,
  evaluation,
  onConfirm,
  isLoading,
}: EvaluationConfirmationProps) {
  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-lg ${
        evaluation.isCorrect
          ? 'bg-custom-green-100/50'
          : 'bg-custom-red-100'
      }`}>
        <div className="flex items-center space-x-2">
          <span className={`font-semibold text-lg ${
            evaluation.isCorrect ? 'text-custom-green-700' : 'text-custom-red-700'
          }`}>
            {evaluation.isCorrect ? 'Correct!' : 'Not quite right'}
          </span>
        </div>
      </div>

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

      <div className="p-4 bg-primary-50 rounded-lg">
        <div className="text-sm font-medium text-primary-700 mb-2">Explanation</div>
        <div className="text-primary-900 whitespace-pre-line">{evaluation.explanation}</div>
      </div>

      <div className="border-t text-primary-100 pt-4">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full btn mx-auto flex items-center justify-center gap-2"
        >
          {isLoading && <SpinnerIcon />}
          {isLoading ? 'Loading next question...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
