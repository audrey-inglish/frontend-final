interface PaginationControlsProps {
  currentOffset: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export default function PaginationControls({
  currentOffset,
  pageSize,
  total,
  hasMore,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  return (
    <div className="flex justify-between items-center">
      <button
        onClick={onPrevious}
        disabled={currentOffset === 0}
        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <span className="text-sm text-neutral-600">
        Showing {currentOffset + 1} -{" "}
        {Math.min(currentOffset + pageSize, total)} of {total}
      </span>

      <button
        onClick={onNext}
        disabled={!hasMore}
        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
