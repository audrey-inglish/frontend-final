import { LoadingSpinner, EmptyState, ConceptList } from "./index";
import { SpinnerIcon, LightbulbIcon } from "./icons";
import type { Concept } from "../schemas/concept";

interface ConceptsSectionProps {
  concepts: Concept[] | undefined;
  isLoading: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
}


export function ConceptsSection({
  concepts,
  isLoading,
  isGenerating,
  onGenerate,
}: ConceptsSectionProps) {
  return (
    <div className="lg:col-span-1">
      {/* Sticky wrapper so concepts stay visible while scrolling */}
      <div className="lg:sticky lg:top-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-neutral-900">Study Concepts</h3>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="btn flex items-center gap-2 text-sm"
            title="Generate study concepts from notes"
          >
            {isGenerating ? (
              <>
                <SpinnerIcon className="animate-spin h-4 w-4" />
                <span className="hidden sm:inline">Generating...</span>
              </>
            ) : (
              <>
                <LightbulbIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Generate</span>
              </>
            )}
          </button>
        </div>

        {/* Max height with scroll for concepts */}
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
          {isLoading ? (
            <LoadingSpinner />
          ) : concepts && concepts.length > 0 ? (
            <ConceptList concepts={concepts} />
          ) : (
            <EmptyState
              title="No concepts yet"
              description="Generate AI-powered study concepts from your notes"
            />
          )}
        </div>
      </div>
    </div>
  );
}
