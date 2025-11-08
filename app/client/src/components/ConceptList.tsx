import { marked } from "marked";
// marked types differ between versions; we'll use a permissive renderer
import DOMPurify from "dompurify";
import type { Concept } from "../schemas/concept";

interface ConceptListProps {
  concepts: Concept[];
}

marked.setOptions({
  gfm: true,
  breaks: true,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const renderer: any = new (marked as any).Renderer();

renderer.codespan = (arg: any) => {
  const text = typeof arg === "string" ? arg : arg?.text ?? "";
  return `<code class="inline-code">${text}</code>`;
};

renderer.code = (code: string, infostring: string | undefined, escaped: boolean) => {
  const lang = (infostring || "").trim().split(/\s+/)[0] || "";
  const langClass = lang ? `language-${lang}` : "";
  // block code
  return `<pre class="code-block"><code class="${langClass}">${escaped ? code : code}</code></pre>`;
};

const renderMarkdown = (content: string) => {
  const rawMarkup = marked.parse(content, { renderer });
  const cleanedMarkup = DOMPurify.sanitize(rawMarkup as string);
  return { __html: cleanedMarkup };
};

export default function ConceptList({ concepts }: ConceptListProps) {
  if (concepts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {concepts.map((concept, index) => {
        const examples = concept.examples ?? [];
        
        return (
          <div
            key={"id" in concept ? concept.id : index}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h4 className="font-semibold text-gray-900 mb-2">
              {concept.concept_title}
            </h4>
            <div
              className="text-gray-700 text-sm mb-3 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={renderMarkdown(concept.concept_summary)}
            />
            {examples.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Examples:
                </p>
                <ul className="space-y-1 ml-4">
                  {examples.map((example, exIndex) => (
                    <li key={exIndex} className="text-sm text-gray-600 list-disc">
                      <div
                        className="prose prose-sm max-w-none inline"
                        dangerouslySetInnerHTML={renderMarkdown(example)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
