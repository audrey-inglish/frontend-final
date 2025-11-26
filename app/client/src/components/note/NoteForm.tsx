import { TextInput, TextArea, FormButtons } from "../form";
import { ImageUploadButton } from "./ImageUploadButton";
import { useDraftAutoSave } from "../../hooks/note/useDraftAutoSave";

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
  const { draftSaved, clearDraft } = useDraftAutoSave({ title, content, draftKey });

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e);
  };

  const handleCancel = () => {
    clearDraft();
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
          <ImageUploadButton
            onImageUpload={onImageUpload}
            isProcessing={isProcessingImage}
          />
        )}
        <div className="flex items-center">
          <FormButtons
            onCancel={handleCancel}
            isPending={isPending}
            submitLabel={isEditing ? "Update" : "Create"}
          />
          {draftSaved && (
            <span className="text-xs text-custom-green-600 ml-auto">Draft saved</span>
          )}
        </div>
      </form>
    </div>
  );
}
