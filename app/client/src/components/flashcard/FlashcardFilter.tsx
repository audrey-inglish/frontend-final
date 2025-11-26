type FlashcardFilterType = "all" | "marked";

interface FlashcardFilterProps {
  filter: FlashcardFilterType;
  markedCount: number;
  onFilterChange: (filter: FlashcardFilterType) => void;
}

export function FlashcardFilter({
  filter,
  markedCount,
  onFilterChange,
}: FlashcardFilterProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="inline-flex rounded-lg border border-neutral-300 bg-custom-white p-1">
        <button
          onClick={() => onFilterChange("all")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-primary-500 text-custom-white"
              : "text-neutral-500 hover:text-primary-500"
          }`}
        >
          All Cards
        </button>
        <button
          onClick={() => onFilterChange("marked")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "marked"
              ? "bg-primary-500 text-custom-white"
              : "text-neutral-500 hover:text-primary-500"
          }`}
        >
          Marked ({markedCount})
        </button>
      </div>
    </div>
  );
}
