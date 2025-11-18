import type { StudyQuestion } from '../../lib/studySession.types';
import { useQuestionInput } from '../../hooks/useQuestionInput';

interface StudyQuestionDisplayProps {
  question: StudyQuestion;
  onSubmit: (answer: string) => void;
  isLoading: boolean;
}

export function StudyQuestionDisplay({
  question,
  onSubmit,
  isLoading,
}: StudyQuestionDisplayProps) {
  const options = question.options?.map(opt => ({ text: opt })) || [];

  const { answer, renderInput, resetAnswer } = useQuestionInput({
    type: question.type,
    options,
    questionId: question.topic,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer);
      resetAnswer();
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          {question.topic}
        </span>
        <span className={`text-xs px-2 py-1 rounded ${
          question.difficulty === 'easy' 
            ? 'bg-green-100 text-green-800'
            : question.difficulty === 'medium'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {question.difficulty}
        </span>
      </div>

      {/* Question Text */}
      <div className="text-lg font-medium text-gray-900">
        {question.question}
      </div>

      {/* Answer Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderInput()}

        {/* Hint */}
        {question.hint && (
          <div className="p-3 bg-accent-50 border border-accent-100 rounded-lg">
            <div className="text-sm font-medium text-accent-200">Hint:</div>
            <div className="text-sm text-accent-200 mt-1">{question.hint}</div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!answer.trim() || isLoading}
          className="btn w-full mx-auto"
        >
          {isLoading ? 'Evaluating...' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
}
