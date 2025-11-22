// app/client/src/hooks/concept/useImageToText.ts
import { useState } from "react";
import apiFetch from "../../lib/apiFetch";
import { showErrorToast } from "../../lib/toasts";

export function useImageToText() {
  const [isProcessing, setIsProcessing] = useState(false);

  const extractTextFromImage = async (imageFile: File): Promise<string> => {
    setIsProcessing(true);
    
    try {
      // Convert image file to base64 data URL
      const reader = new FileReader();
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read image file"));
        reader.readAsDataURL(imageFile);
      });

      // Send to backend for text extraction
      const res = await apiFetch("/api/extractTextFromImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl }),
      });

      const json = await res.json();
      
      if (!json.success || !json.text) {
        throw new Error("Failed to extract text from image");
      }

      return json.text;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to process image";
      showErrorToast(message);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    extractTextFromImage,
    isProcessing,
  };
}
