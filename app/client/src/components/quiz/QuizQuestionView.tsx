import { useEffect } from 'react';
import type { QuizQuestion } from "../../schemas/quiz";
import { useQuestionInput } from '../../hooks/useQuestionInput';

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
  const questionType = question.question_type === 'multiple-choice' 
    ? 'multiple-choice' 
    : 'short-answer';

  const options = question.answers?.map(answer => ({
    text: answer.answer_text,
    id: answer.id,
  })) || [];

  const { renderInput, setAnswer } = useQuestionInput({
    type: questionType,
    options,
    questionId: question.id,
    onAnswerChange,
    initialValue: userAnswer,
  });

  // Sync external answer changes (e.g., when switching questions)
  useEffect(() => {
    setAnswer(userAnswer);
  }, [userAnswer, setAnswer]);

  return (
    <div className="border-b border-neutral-200 pb-6 last:border-b-0">
      <h3 className="font-medium text-lg text-neutral-800 mb-3">
        {index + 1}. {question.question_text}
      </h3>
      
      {renderInput()}
    </div>
  );
}
