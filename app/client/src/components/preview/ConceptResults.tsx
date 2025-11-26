import { Link } from "react-router";
import ConceptList from "../concept/ConceptList";
import type { Concept } from "../../schemas/concept";

interface ConceptResultsProps {
  concepts: Concept[];
}

export function ConceptResults({ concepts }: ConceptResultsProps) {
  if (concepts.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-neutral-600">
          No concepts were generated. Try adding more detailed notes.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-neutral-800 mb-4">
        Generated Concepts ({concepts.length})
      </h2>
      <ConceptList concepts={concepts} />

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
  );
}
