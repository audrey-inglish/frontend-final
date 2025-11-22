import { useEffect, useRef, useState } from "react";
import { TextInput, TextArea, FormButtons } from "../form";
import { ImageUploadIcon, SpinnerIcon } from "../icons";

interface NoteFormProps {
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
  isEditing?: boolean;
  draftKey?: string; // localStorage key for auto-saving drafts
  onImageUpload?: (file: File) => Promise<void>;
  isProcessingImage?: boolean;
}

export default function NoteForm({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSubmit,
  onCancel,
  isPending,
  isEditing = false,
  draftKey,
  onImageUpload,
  isProcessingImage = false,
}: NoteFormProps) {
  const [draftSaved, setDraftSaved] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpload) {
      await onImageUpload(file);
      // Reset input so the same file can be uploaded again if needed
      event.target.value = "";
    }
  };

  // Auto-save draft to localStorage with debounce
  useEffect(() => {
    if (!draftKey) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce: wait 500ms after last change before saving
    saveTimeoutRef.current = setTimeout(() => {
      try {
        if (title || content) {
          localStorage.setItem(draftKey, JSON.stringify({ title, content }));
          setDraftSaved(true);
          setTimeout(() => setDraftSaved(false), 2000); // Hide indicator after 2s
        }
      } catch {
        // Ignore write errors
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, draftKey]);

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e);
    // Clear draft after successful submit (called by parent after mutation succeeds)
  };

  const handleCancel = () => {
    // Clear draft on cancel
    if (draftKey) {
      try {
        localStorage.removeItem(draftKey);
      } catch {
        // Ignore
      }
    }
    onCancel();
  };
  
  return (
    <div className="card p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">
          {isEditing ? "Edit Note" : "Create Note"}
        </h4>
   
      </div>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Title"
          value={title}
          onChange={onTitleChange}
          placeholder="e.g., Chapter 3 Notes"
          required
          autoFocus
        />
        <TextArea
          label="Content"
          value={content}
          onChange={onContentChange}
          placeholder="Enter your notes here..."
          rows={8}
          required
        />
        {onImageUpload && (
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload image of notes"
              disabled={isProcessingImage}
            />
            <button
              type="button"
              onClick={handleImageButtonClick}
              disabled={isProcessingImage}
              className="btn-secondary flex items-center gap-2 text-sm"
              title="Upload an image to extract text"
            >
              {isProcessingImage ? (
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
        )}
        <div className="flex items-center">
          <FormButtons
            onCancel={handleCancel}
            isPending={isPending}
            submitLabel={isEditing ? "Update" : "Create"}
          />
          {draftSaved && (
            <span className="text-xs text-green-600 ml-auto">Draft saved</span>
          )}
        </div>
      </form>
    </div>
  );
}
