import type { QuizQuestion } from "../../schemas/quiz";
import { QuizQuestionView } from "./QuizQuestionView";
import { QuizResultsView } from "./QuizResultsView";

interface EvaluationResult {
  questionId: number;
  isCorrect: boolean;
  explanation: string;
}

interface QuizDisplayProps {
  questions: QuizQuestion[];
  userAnswers: Record<number, string>;
  showResults: boolean;
  results: EvaluationResult[];
  isSubmitting: boolean;
  onAnswerChange: (questionId: number, answer: string) => void;
  onSubmit: () => void;
  onRetake: () => void;
  onGenerateNew: () => void;
}

export function QuizDisplay({
  questions,
  userAnswers,
  showResults,
  results,
  isSubmitting,
  onAnswerChange,
  onSubmit,
  onRetake,
  onGenerateNew,
}: QuizDisplayProps) {
  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold text-primary-800 mb-6">
        {showResults ? "Quiz Results" : "Generated Quiz"}
      </h2>
      
      {!showResults ? (
        // Quiz taking view
        <>
          <div className="space-y-6">
            {questions.map((question, index) => (
              <QuizQuestionView
                key={question.id || index}
                question={question}
                index={index}
                userAnswer={userAnswers[question.id!] || ""}
                onAnswerChange={(answer) => onAnswerChange(question.id!, answer)}
              />
            ))}
          </div>

          <div className="mt-6 flex">
            <button
              onClick={onGenerateNew}
              disabled={isSubmitting}
              className="btn-secondary text-sm"
            >
              Generate New Quiz
            </button>
            <button 
              onClick={onSubmit}
              disabled={isSubmitting}
              className="btn flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </>
      ) : (
        // Results view
        <QuizResultsView
          questions={questions}
          results={results}
          userAnswers={userAnswers}
          onRetake={onRetake}
          onGenerateNew={onGenerateNew}
        />
      )}
    </div>
  );
}
