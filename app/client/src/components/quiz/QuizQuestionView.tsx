import type { QuizQuestion } from "../../schemas/quiz";

interface QuizQuestionViewProps {
  question: QuizQuestion;
  index: number;
  userAnswer: string;
  onAnswerChange: (answer: string) => void;
}

export function QuizQuestionView({
  question,
  index,
  userAnswer,
  onAnswerChange,
}: QuizQuestionViewProps) {
  return (
    <div className="border-b border-neutral-200 pb-6 last:border-b-0">
      <h3 className="font-medium text-lg text-neutral-800 mb-3">
        {index + 1}. {question.question_text}
      </h3>
      
      {question.question_type === 'multiple-choice' && question.answers ? (
        <div className="space-y-2">
          {question.answers.map((answer, answerIndex) => (
            <div
              key={answer.id || answerIndex}
              className="flex items-center p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                id={`question-${question.id}-answer-${answerIndex}`}
                value={answer.answer_text}
                checked={userAnswer === answer.answer_text}
                onChange={(e) => onAnswerChange(e.target.value)}
                className="mr-3"
              />
              <label
                htmlFor={`question-${question.id}-answer-${answerIndex}`}
                className="text-neutral-700 cursor-pointer flex-1"
              >
                {answer.answer_text}
              </label>
            </div>
          ))}
        </div>
      ) : (
        <textarea
          className="text-input w-full min-h-[100px]"
          placeholder="Type your answer here..."
          value={userAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
        />
      )}
    </div>
  );
}
