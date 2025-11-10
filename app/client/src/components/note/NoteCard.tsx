import { EditIcon, DeleteIcon } from "../icons";

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
    <div className="card p-6">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-lg font-semibold text-neutral-800">{title}</h4>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(id, title, content)}
            className="text-gray-400 hover:text-accent-600 transition-colors"
            title="Edit note"
          >
            <EditIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(id, title)}
            disabled={isDeleting}
            className="text-gray-400 hover:text-custom-red-600 transition-colors"
            title="Delete note"
          >
            <DeleteIcon className="w-5 h-5" />
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
