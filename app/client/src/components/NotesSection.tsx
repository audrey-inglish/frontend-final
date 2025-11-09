import { NoteForm, NoteCard, EmptyState } from "./index";
import type { Note } from "../schemas/note";
import type { useNoteEditor } from "../hooks/useNoteEditor";

interface NotesSectionProps {
  notes: Note[] | undefined;
  noteEditor: ReturnType<typeof useNoteEditor>;
}


export function NotesSection({ notes, noteEditor }: NotesSectionProps) {
  return (
    <div className="lg:col-span-2 pr-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-neutral-800">Notes</h3>
        <button
          onClick={noteEditor.handleToggleNoteForm}
          className="btn text-sm"
        >
          {noteEditor.showNoteForm ? "Cancel" : "+ New Note"}
        </button>
      </div>

      {noteEditor.showNoteForm && (
        <NoteForm
          title={noteEditor.noteTitle}
          content={noteEditor.noteContent}
          onTitleChange={noteEditor.setNoteTitle}
          onContentChange={noteEditor.setNoteContent}
          onSubmit={
            noteEditor.editingNoteId
              ? noteEditor.handleUpdateNote
              : noteEditor.handleCreateNote
          }
          onCancel={noteEditor.handleCancelNoteForm}
          isPending={noteEditor.isPending}
          isEditing={!!noteEditor.editingNoteId}
          draftKey={noteEditor.draftKey}
        />
      )}

      {notes && notes.length === 0 && (
        <EmptyState
          title="No notes yet"
          description="Create your first note to get started"
        />
      )}

      {notes && notes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((note: Note) => (
            <NoteCard
              key={note.id}
              id={note.id}
              title={note.title}
              content={note.content}
              uploadedAt={note.uploaded_at}
              onEdit={noteEditor.handleEditNote}
              onDelete={noteEditor.handleDeleteNote}
              isDeleting={noteEditor.isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
