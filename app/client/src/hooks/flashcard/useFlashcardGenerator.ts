import { showErrorToast, showSuccessToast } from "../../lib/toasts";
import { useGenerateFlashcards } from "./useFlashcards";
import type { Note } from "../../schemas/note";

interface UseFlashcardGeneratorOptions {
  dashboardId: number;
  notes: Note[] | undefined;
}

export function useFlashcardGenerator({
  dashboardId,
  notes,
}: UseFlashcardGeneratorOptions) {
  const generateFlashcards = useGenerateFlashcards();

  const handleGenerate = async () => {
    if (!notes || notes.length === 0) {
      showErrorToast("Please add notes before generating flashcards");
      return;
    }

    const combinedText = notes
      .map((note) => `${note.title}\n\n${note.content}`)
      .join("\n\n---\n\n");

    const result = await generateFlashcards.mutateAsync({
      text: combinedText,
      dashboard_id: dashboardId,
    });

    showSuccessToast(`Generated ${result.flashcards.length} flashcards!`);
    return result;
  };

  return {
    handleGenerate,
    isGenerating: generateFlashcards.isPending,
    flashcards: generateFlashcards.data?.flashcards,
  };
}
