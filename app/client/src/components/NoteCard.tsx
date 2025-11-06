interface NoteCardProps {
  id: number;
  title: string;
  content: string;
  uploadedAt: string;
  onEdit: (id: number, title: string, content: string) => void;
  onDelete: (id: number, title: string) => void;
  isDeleting: boolean;
}

export default function NoteCard({
  id,
  title,
  content,
  uploadedAt,
  onEdit,
  onDelete,
  isDeleting,
}: NoteCardProps) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(id, title, content)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit note"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(id, title)}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Delete note"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-4 mb-3">
        {content}
      </p>
      <div className="text-xs text-gray-500">
        {new Date(uploadedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
