import { useState } from 'react';

interface QuestionInputOption {
  text: string;
  id?: string | number;
}

interface UseQuestionInputProps {
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'flashcard';
  options?: QuestionInputOption[];
  questionId?: string | number;
  onAnswerChange?: (answer: string) => void;
  initialValue?: string;
}

interface UseQuestionInputReturn {
  answer: string;
  setAnswer: (answer: string) => void;
  renderInput: () => React.ReactNode;
  resetAnswer: () => void;
}

export function useQuestionInput({
  type,
  options = [],
  questionId,
  onAnswerChange,
  initialValue = '',
}: UseQuestionInputProps): UseQuestionInputReturn {
  const [answer, setAnswer] = useState(initialValue);

  const handleAnswerChange = (newAnswer: string) => {
    setAnswer(newAnswer);
    onAnswerChange?.(newAnswer);
  };

  const resetAnswer = () => {
    setAnswer('');
    onAnswerChange?.('');
  };

  const renderInput = () => {
    switch (type) {
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {options.map((option, index) => {
              const optionId = option.id || index;
              const inputId = `question-${questionId}-option-${optionId}`;
              
              return (
                <label
                  key={optionId}
                  htmlFor={inputId}
                  className="flex items-center p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                  <input
                    type="radio"
                    id={inputId}
                    name={`question-${questionId}`}
                    value={option.text}
                    checked={answer === option.text}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="mr-3 w-4 h-4 text-accent-600"
                  />
                  <span className="text-neutral-700 flex-1">{option.text}</span>
                </label>
              );
            })}
          </div>
        );

      case 'true-false':
        return (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleAnswerChange('True')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                answer === 'True'
                  ? 'bg-accent-600 text-blue-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              True
            </button>
            <button
              type="button"
              onClick={() => handleAnswerChange('False')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                answer === 'False'
                  ? 'bg-accent-600 text-blue-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              False
            </button>
          </div>
        );

      case 'short-answer':
      case 'flashcard':
      default:
        return (
          <textarea
            value={answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="text-input"
            rows={4}
          />
        );
    }
  };

  return {
    answer,
    setAnswer: handleAnswerChange,
    renderInput,
    resetAnswer,
  };
}
