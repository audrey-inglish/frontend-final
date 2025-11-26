import { useRef } from "react";
import { ImageUploadIcon, SpinnerIcon } from "../icons";

interface ImageUploadButtonProps {
  onImageUpload: (file: File) => Promise<void>;
  isProcessing: boolean;
}

export function ImageUploadButton({
  onImageUpload,
  isProcessing,
}: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await onImageUpload(file);
      event.target.value = "";
    }
  };

  return (
    <div className="mb-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload image of notes"
        disabled={isProcessing}
      />
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isProcessing}
        className="btn-secondary flex items-center gap-2 text-sm"
        title="Upload an image to extract text"
      >
        {isProcessing ? (
          <>
            <SpinnerIcon className="animate-spin h-4 w-4" />
            <span>Processing image...</span>
          </>
        ) : (
          <>
            <ImageUploadIcon className="w-4 h-4" />
            <span>Upload Image</span>
          </>
        )}
      </button>
      <p className="text-xs text-neutral-500 mt-1">
        Upload an image of your notes to automatically extract text
      </p>
    </div>
  );
}
