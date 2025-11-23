import { useState } from "react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { ConceptsArraySchema, type Concept } from "../schemas/concept";
import { LoadingSpinner, ConceptList } from "../components";
import { showErrorToast, showSuccessToast } from "../lib/toasts";

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
      {/* Simple navbar */}
      <nav className="bg-custom-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary-700">
              Mindset
            </Link>
            <Link to="/" className="text-sm text-neutral-600 hover:text-primary-600">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-800 mb-4">
            Try It Out
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Paste your class notes below and see how the agent extracts key concepts
            to guide your studies.
          </p>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          <div className="card p-6">
            <form onSubmit={handleGenerate}>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Your Notes
              </label>
              <textarea
                id="notes"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Paste your class notes here..."
                className="w-full h-64 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                disabled={generateConcepts.isPending}
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="btn"
                  disabled={generateConcepts.isPending || !noteText.trim()}
                >
                  {generateConcepts.isPending ? "Generating..." : "Generate Concepts"}
                </button>
                {(noteText || generatedConcepts) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-secondary"
                    disabled={generateConcepts.isPending}
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {generateConcepts.isPending && (
            <div className="card p-8">
              <LoadingSpinner message="Analyzing your notes and extracting concepts..." />
            </div>
          )}

          {generatedConcepts && generatedConcepts.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">
                Generated Concepts ({generatedConcepts.length})
              </h2>
              <ConceptList concepts={generatedConcepts} />
              
              <div className="card bg-primary-50 border-2 mt-8 border-neutral-200 flex flex-col">
                <p className="text-sm text-primary-700 mb-4">
                  Sign in to save your concepts, create flashcards, take quizzes, and
                  get personalized AI study sessions.
                </p>
                <Link to="/" className="btn inline-block w-50 text-center mx-auto">
                  Get Started
                </Link>
              </div>
            </div>
          )}

          {generatedConcepts && generatedConcepts.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-neutral-600">
                No concepts were generated. Try adding more detailed notes.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
