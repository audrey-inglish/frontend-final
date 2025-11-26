import { showErrorToast, showSuccessToast } from "../../lib/toasts";
import { useGenerateConcepts } from "./useConcepts";
import type { Note } from "../../schemas/note";

interface UseConceptGeneratorOptions {
  dashboardId: number;
  notes: Note[] | undefined;
}

export function useConceptGenerator({
  dashboardId,
  notes,
}: UseConceptGeneratorOptions) {
  const generateConcepts = useGenerateConcepts();

  const handleGenerate = async () => {
    if (!notes || notes.length === 0) {
      showErrorToast("Please add notes before generating concepts");
      return;
    }

    const combinedText = notes
      .map((note) => `${note.title}\n\n${note.content}`)
      .join("\n\n---\n\n");

    const result = await generateConcepts.mutateAsync({
      text: combinedText,
      dashboard_id: dashboardId,
    });

    showSuccessToast(`Generated ${result.concepts.length} concepts!`);
  };

  return {
    handleGenerate,
    isGenerating: generateConcepts.isPending,
  };
}
