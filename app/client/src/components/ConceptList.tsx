import type { Concept } from "../schemas/concept";
import ConceptCard from "./ConceptCard";

interface ConceptListProps {
  concepts: Concept[];
}

export default function ConceptList({ concepts }: ConceptListProps) {
  if (concepts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {concepts.map((concept, index) => {
        const key = "id" in concept ? concept.id : index;
        return <ConceptCard key={key} concept={concept} />;
      })}
    </div>
  );
}
