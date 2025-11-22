import { showErrorToast, showSuccessToast } from "../../lib/toasts";
import { useGenerateConcepts } from "./useConcepts";
import { useImageToText } from "./useImageToText";
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
  const { extractTextFromImage, isProcessing: isExtractingText } = useImageToText();

  const handleGenerate = async () => {
    if (!notes || notes.length === 0) {
      showErrorToast("Please add notes before generating concepts");
      return;
    }

    try {
      const combinedText = notes
        .map((note) => `${note.title}\n\n${note.content}`)
        .join("\n\n---\n\n");

      const result = await generateConcepts.mutateAsync({
        text: combinedText,
        dashboard_id: dashboardId,
      });

      showSuccessToast(`Generated ${result.concepts.length} concepts!`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to generate concepts";
      showErrorToast(message);
      console.error(error);
    }
  };

  const handleGenerateFromImage = async (imageFile: File) => {
    try {
      // Step 1: Extract text from image
      const extractedText = await extractTextFromImage(imageFile);
      
      if (!extractedText || extractedText.trim().length === 0) {
        showErrorToast("No text could be extracted from the image");
        return;
      }

      // Step 2: Generate concepts from extracted text
      const result = await generateConcepts.mutateAsync({
        text: extractedText,
        dashboard_id: dashboardId,
      });

      showSuccessToast(`Generated ${result.concepts.length} concepts from image!`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to process image";
      showErrorToast(message);
      console.error(error);
    }
  };

  return {
    handleGenerate,
    handleGenerateFromImage,
    isGenerating: generateConcepts.isPending || isExtractingText,
  };
}
