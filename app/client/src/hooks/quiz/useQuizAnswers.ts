import { useState } from "react";

export function useQuizAnswers() {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const resetAnswers = () => {
    setUserAnswers({});
    setShowResults(false);
  };

  return {
    userAnswers,
    showResults,
    handleAnswerChange,
    resetAnswers,
    setShowResults,
  };
}
