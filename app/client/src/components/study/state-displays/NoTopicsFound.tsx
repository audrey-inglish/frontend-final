interface NoTopicsFoundProps {
  onGoBack: () => void;
}

export function NoTopicsFound({ onGoBack }: NoTopicsFoundProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-8 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">No Topics Found</h2>
        <p className="text-primary-600 mb-6">
          Please add some notes or generate concepts before starting a study session.
        </p>
        <button onClick={onGoBack} className="btn">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
