import { useEffect, useRef, useState } from "react";

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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Chapter 3 Notes"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your notes here..."
            rows={8}
            required
          />
        </div>
        <div className="flex">
          <button
            type="submit"
            disabled={isPending}
            className="btn text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2  rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
