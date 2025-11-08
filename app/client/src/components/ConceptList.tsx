import type { Concept } from "../schemas/concept";

interface ConceptListProps {
  concepts: Concept[];
}

export default function ConceptList({ concepts }: ConceptListProps) {
  if (concepts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {concepts.map((concept, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <h4 className="font-semibold text-gray-900 mb-2">
            {concept.concept_title}
          </h4>
          <p className="text-gray-700 text-sm mb-3">{concept.concept_summary}</p>
          {concept.examples && concept.examples.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Examples:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {concept.examples.map((example, exIndex) => (
                  <li key={exIndex} className="text-sm text-gray-600">
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
