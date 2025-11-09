import { useEffect, useRef, useState } from "react";
import { TextInput, TextArea, FormButtons } from "./form";

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
}: NoteFormProps) {
  const [draftSaved, setDraftSaved] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

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
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">
          {isEditing ? "Edit Note" : "Create Note"}
        </h4>
        {draftSaved && (
          <span className="text-xs text-green-600">Draft saved</span>
        )}
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
        <FormButtons
          onCancel={handleCancel}
          isPending={isPending}
          submitLabel={isEditing ? "Update" : "Create"}
        />
      </form>
    </div>
  );
}
