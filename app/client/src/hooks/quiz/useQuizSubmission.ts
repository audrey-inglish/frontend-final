import { useState } from "react";
import { useEvaluateResponse, useUpdateQuizScore } from "./useQuizzes";
import { showErrorToast, showSuccessToast } from "../../lib/toasts";
import type { QuizQuestion } from "../../schemas/quiz";

interface QuizAnswer {
  questionId: number;
  userAnswer: string;
}

interface EvaluationResult {
  questionId: number;
  isCorrect: boolean;
  explanation: string;
}

interface UseQuizSubmissionOptions {
  quizId?: number;
  questions: QuizQuestion[];
  onComplete?: (score: number, results: EvaluationResult[]) => void;
}

export function useQuizSubmission({ quizId, questions, onComplete }: UseQuizSubmissionOptions) {
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const evaluateResponse = useEvaluateResponse();
  const updateQuizScore = useUpdateQuizScore();

  const submitQuiz = async (answers: QuizAnswer[]) => {
    setIsSubmitting(true);
    setResults([]);
    
    try {
      const evaluationResults: EvaluationResult[] = [];
      
      // Evaluate each answer
      for (const answer of answers) {
        const question = questions.find(q => q.id === answer.questionId);
        
        if (!question) continue;
        
        const result = await evaluateResponse.mutateAsync({
          question_id: answer.questionId,
          user_answer: answer.userAnswer,
          correct_answer: question.correct_answer,
          question_text: question.question_text,
          question_type: question.question_type,
        });
        
        evaluationResults.push({
          questionId: result.question_id,
          isCorrect: result.is_correct,
          explanation: result.explanation,
        });
      }
      
      setResults(evaluationResults);
      
      // Calculate score
      const correctCount = evaluationResults.filter(r => r.isCorrect).length;
      const score = (correctCount / evaluationResults.length) * 100;
      
      if (quizId) {
          await updateQuizScore.mutateAsync({ quizId, score });
      }
      
      showSuccessToast(`Quiz submitted! Score: ${score.toFixed(0)}%`);
      
      if (onComplete) {
        onComplete(score, evaluationResults);
      }
      
      return { score, results: evaluationResults };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit quiz";
      showErrorToast(message);
      console.error(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitQuiz,
    isSubmitting,
    results,
  };
}
