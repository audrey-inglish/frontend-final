import { useRef } from "react";
import { LoadingSpinner, EmptyState, ConceptList } from "../index";
import { SpinnerIcon, LightbulbIcon, ImageUploadIcon } from "../icons";
import type { Concept } from "../../schemas/concept";

interface ConceptsSectionProps {
  concepts: Concept[] | undefined;
  isLoading: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
  onImageUpload?: (file: File) => void;
}


export function ConceptsSection({
  concepts,
  isLoading,
  isGenerating,
  onGenerate,
  onImageUpload,
}: ConceptsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
      // Reset input so the same file can be uploaded again if needed
      event.target.value = "";
    }
  };

  return (
    <div className="lg:col-span-1">
      {/* Sticky wrapper so concepts stay visible while scrolling */}
      <div className="lg:sticky lg:top-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-neutral-900">Study Concepts</h3>
          <div className="flex gap-2">
            {onImageUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload image of notes"
                />
                <button
                  onClick={handleImageButtonClick}
                  disabled={isGenerating}
                  className="btn flex items-center gap-2 text-sm"
                  title="Upload an image of your notes"
                >
                  {isGenerating ? (
                    <SpinnerIcon className="animate-spin h-4 w-4" />
                  ) : (
                    <ImageUploadIcon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Image</span>
                </button>
              </>
            )}
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="btn flex items-center gap-2 text-sm"
              title="Generate study concepts from notes"
            >
              {isGenerating ? (
                <>
                  <SpinnerIcon className="animate-spin h-4 w-4" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <LightbulbIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Generate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Max height with scroll for concepts */}
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
          {isLoading ? (
            <LoadingSpinner />
          ) : concepts && concepts.length > 0 ? (
            <ConceptList concepts={concepts} />
          ) : (
            <EmptyState
              title="No concepts yet"
              description="Generate AI-powered study concepts from your notes or upload an image"
            />
          )}
        </div>
      </div>
    </div>
  );
}
