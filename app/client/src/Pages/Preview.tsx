import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ConceptsArraySchema, type Concept } from "../schemas/concept";
import { LoadingSpinner } from "../components";
import { showErrorToast, showSuccessToast } from "../lib/toasts";
import {
  PreviewNav,
  PreviewHeader,
  NoteInputForm,
  ConceptResults,
} from "../components/preview";

interface GenerateConceptsResponse {
  concepts: Concept[];
}

export default function Preview() {
  const [noteText, setNoteText] = useState("");
  const [generatedConcepts, setGeneratedConcepts] = useState<Concept[] | null>(
    null
  );

  const generateConcepts = useMutation({
    mutationFn: async (text: string): Promise<GenerateConceptsResponse> => {
      const res = await fetch("/api/generateConcepts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || "Failed to generate concepts");
      }

      const json = await res.json();
      const validated = ConceptsArraySchema.parse(json.concepts);
      return { concepts: validated };
    },
    onSuccess: (data) => {
      setGeneratedConcepts(data.concepts);
      showSuccessToast(`Generated ${data.concepts.length} concepts!`);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to generate concepts";
      showErrorToast(message);
      console.error(error);
    },
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      showErrorToast("Please enter some notes first");
      return;
    }
    generateConcepts.mutate(noteText);
  };

  const handleReset = () => {
    setNoteText("");
    setGeneratedConcepts(null);
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <PreviewNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PreviewHeader />

        <div className="space-y-6">
          <NoteInputForm
            noteText={noteText}
            onNoteTextChange={setNoteText}
            onSubmit={handleGenerate}
            onReset={handleReset}
            isPending={generateConcepts.isPending}
            hasContent={!!(noteText || generatedConcepts)}
          />

          {generateConcepts.isPending && (
            <div className="card p-8">
              <LoadingSpinner message="Analyzing your notes and extracting concepts..." />
            </div>
          )}

          {generatedConcepts && (
            <ConceptResults concepts={generatedConcepts} />
          )}
        </div>
      </main>
    </div>
  );
}
