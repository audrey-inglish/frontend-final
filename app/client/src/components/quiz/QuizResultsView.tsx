import type { QuizQuestion } from "../../schemas/quiz";

interface EvaluationResult {
  questionId: number;
  isCorrect: boolean;
  explanation: string;
}

interface QuizResultsViewProps {
  questions: QuizQuestion[];
  results: EvaluationResult[];
  userAnswers: Record<number, string>;
  onRetake: () => void;
  onGenerateNew: () => void;
}

export function QuizResultsView({
  questions,
  results,
  userAnswers,
  onRetake,
  onGenerateNew,
}: QuizResultsViewProps) {
  const correctCount = results.filter(r => r.isCorrect).length;
  const totalCount = results.length;
  const percentage = ((correctCount / totalCount) * 100).toFixed(0);

  return (
    <>
      <div className="mb-6 p-4 bg-primary-50 rounded-lg">
        <p className="text-lg font-semibold text-primary-800">
          Score: {correctCount} / {totalCount} ({percentage}%)
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => {
          const result = results.find(r => r.questionId === question.id);
          const userAnswer = userAnswers[question.id!];

          return (
            <div 
              key={question.id || index} 
              className={`border-l-4 bg-custom-white shadow-sm pt-2 pr-2 pl-4 pb-6 rounded-md ${
                result?.isCorrect ? 'border-custom-green-500' : 'border-custom-red-500'
              }`}
            >
                <div className="flex justify-end pt-1 pb-2 mb-2">
                    <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                            result?.isCorrect
                                ? 'bg-custom-green-100 text-custom-green-600'
                                : 'bg-custom-red-100 text-custom-red-500'
                        }`}
                    >
                        {result?.isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                </div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-neutral-800">
                  {index + 1}. {question.question_text}
                </h3>
              </div>

              <div className="mt-3 space-y-2 text-sm">
                <p className="text-neutral-600">
                  <span className="font-medium">Your answer:</span> {userAnswer || "(no answer)"}
                </p>
                {!result?.isCorrect && (
                  <p className="text-neutral-600">
                    <span className="font-medium">Correct answer:</span> {question.correct_answer}
                  </p>
                )}
                {result?.explanation && (
                  <p className="text-neutral-700 bg-neutral-100 p-3 rounded mt-2">
                    <span className="font-medium">Explanation:</span> {result.explanation}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={onRetake}
          className="btn-secondary flex-1"
        >
          Retake Quiz
        </button>
        <button
          onClick={onGenerateNew}
          className="btn flex-1"
        >
          Generate New Quiz
        </button>
      </div>
    </>
  );
}
