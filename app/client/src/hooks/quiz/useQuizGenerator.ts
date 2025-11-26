import { showErrorToast, showSuccessToast } from "../../lib/toasts";
import { useGenerateQuiz } from "./useQuizzes";
import type { Note } from "../../schemas/note";

interface UseQuizGeneratorOptions {
  dashboardId: number;
  notes: Note[] | undefined;
}

export function useQuizGenerator({
  dashboardId,
  notes,
}: UseQuizGeneratorOptions) {
  const generateQuiz = useGenerateQuiz();

  const handleGenerate = async (
    numQuestions: number,
    questionTypes: Array<'multiple-choice' | 'short-answer'>,
    difficulty: 'easy' | 'medium' | 'hard'
  ) => {
    if (!notes || notes.length === 0) {
      showErrorToast("Please add notes before generating a quiz");
      return;
    }

    const combinedText = notes
      .map((note) => `${note.title}\n\n${note.content}`)
      .join("\n\n---\n\n");

    const result = await generateQuiz.mutateAsync({
      text: combinedText,
      dashboard_id: dashboardId,
      num_questions: numQuestions,
      question_types: questionTypes,
      difficulty,
    });

    showSuccessToast(
      `Generated ${result.questions.length} ${difficulty} questions!`
    );
    return result;
  };

  return {
    handleGenerate,
    isGenerating: generateQuiz.isPending,
    quiz: generateQuiz.data?.quiz,
    questions: generateQuiz.data?.questions,
  };
}