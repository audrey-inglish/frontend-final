interface NoteInputFormProps {
  noteText: string;
  onNoteTextChange: (text: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  isPending: boolean;
  hasContent: boolean;
}

export function NoteInputForm({
  noteText,
  onNoteTextChange,
  onSubmit,
  onReset,
  isPending,
  hasContent,
}: NoteInputFormProps) {
  return (
    <div className="card p-6">
      <form onSubmit={onSubmit}>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-neutral-700 mb-2"
        >
          Your Notes
        </label>
        <textarea
          id="notes"
          value={noteText}
          onChange={(e) => onNoteTextChange(e.target.value)}
          placeholder="Paste your class notes here..."
          className="w-full h-64 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          disabled={isPending}
        />
        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            className="btn"
            disabled={isPending || !noteText.trim()}
          >
            {isPending ? "Generating..." : "Generate Concepts"}
          </button>
          {hasContent && (
            <button
              type="button"
              onClick={onReset}
              className="btn-secondary"
              disabled={isPending}
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
