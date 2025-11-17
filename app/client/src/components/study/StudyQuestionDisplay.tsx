import { useState } from 'react';
import type { StudyQuestion } from '../../lib/studySession.types';

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
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer('');
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
        {question.type === 'multiple-choice' && question.options ? (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={answer === option}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        ) : question.type === 'true-false' ? (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setAnswer('True')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                answer === 'True'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              True
            </button>
            <button
              type="button"
              onClick={() => setAnswer('False')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                answer === 'False'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              False
            </button>
          </div>
        ) : (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        )}

        {/* Hint */}
        {question.hint && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-900">Hint:</div>
            <div className="text-sm text-blue-700 mt-1">{question.hint}</div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!answer.trim() || isLoading}
          className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Evaluating...' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
}
