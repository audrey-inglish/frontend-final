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

  const getDifficultyStyles = () => {
    switch (question.difficulty) {
      case 'easy':
        return 'bg-custom-green-100 text-custom-green-700';
      case 'medium':
        return 'bg-accent-50 text-accent-600';
      case 'hard':
        return 'bg-custom-red-100 text-custom-red-600';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-primary-500">
          {question.topic}
        </span>
        <span className={`text-xs px-2 py-1 rounded ${getDifficultyStyles()}`}>
          {question.difficulty}
        </span>
      </div>

      <div className="text-lg font-medium text-neutral-900">
        {question.question}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {renderInput()}

        {question.hint && (
          <div className="p-3 bg-accent-50 border border-accent-100 rounded-lg">
            <div className="text-sm font-medium text-accent-600">Hint:</div>
            <div className="text-sm text-accent-300 mt-1">{question.hint}</div>
          </div>
        )}

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
