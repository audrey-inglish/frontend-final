import { SpinnerIcon } from "../icons";

export function GeneratingConcepts() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8 text-center">
        <div className="flex justify-center mb-4">
          <SpinnerIcon className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
          Generating Study Concepts
        </h2>
        <p className="text-primary-600 mb-2">
          Please wait while we analyze your notes and extract key concepts for your
          study session.
        </p>
        <p className="text-sm text-neutral-500">
          This usually takes just a few moments...
        </p>
      </div>
    </div>
  );
}
