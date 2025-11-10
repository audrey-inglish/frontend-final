import type { ReactNode } from "react";

interface CarouselProps {
  children: ReactNode[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  showProgress?: boolean;
  className?: string;
}

export function Carousel({
  children,
  currentIndex,
  onPrevious,
  onNext,
  showProgress = true,
  className = "",
}: CarouselProps) {
  const totalItems = children.length;
  const currentItem = children[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalItems - 1;

  if (totalItems === 0) {
    return (
      <div className="text-center py-8 text-primary-400">
        No items to display
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-6 ${className}`}>
      {/* Progress indicator */}
      {showProgress && (
        <div className="text-sm text-primary-500 font-medium">
          {currentIndex + 1} / {totalItems}
        </div>
      )}

      {/* Main content area */}
      <div className="w-full max-w-2xl">{currentItem}</div>

      {/* Navigation controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="btn-secondary bg-primary-100 hover:bg-primary-200"
          aria-label="Previous item"
        >
          ← Previous
        </button>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className="btn-secondary bg-primary-100 hover:bg-primary-200"
          aria-label="Next item"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
