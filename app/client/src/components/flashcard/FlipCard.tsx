import { useState } from "react";
import { BookmarkIcon, BookmarkFilledIcon } from "../icons";

interface FlipCardProps {
  front: string;
  back: string;
  id?: number;
  needsReview?: boolean;
  onToggleReview?: (id: number, currentState: boolean) => void;
}

export function FlipCard({ 
  front, 
  back, 
  id, 
  needsReview = false,
  onToggleReview 
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleToggleReview = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking flag button
    if (id && onToggleReview) {
      onToggleReview(id, needsReview);
    }
  };

  return (
    <div
      className="w-full h-80 cursor-pointer relative"
      style={{ perspective: "1000px" }}
      onClick={handleFlip}
    >
      {/* Flag button - only show if card has an ID and toggle handler */}
      {id && onToggleReview && (
        <button
          onClick={handleToggleReview}
          className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-colors ${
            needsReview
              ? "bg-yellow-500 text-custom-white hover:bg-yellow-600"
              : "bg-primary-50 text-primary-300 hover:bg-primary-100 hover:text-primary-600"
          }`}
          aria-label={needsReview ? "Remove flag" : "Flag for review"}
          title={needsReview ? "Remove flag" : "Flag for review"}
        >
          {needsReview ? (
            <BookmarkFilledIcon className="w-5 h-5" />
          ) : (
            <BookmarkIcon className="w-5 h-5" />
          )}
        </button>
      )}

      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of card */}
        <div
          className="absolute w-full h-full card flex flex-col items-center justify-center p-8"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div className="text-center">
            <p className="text-xl font-medium text-primary-700">{front}</p>
            <p className="text-sm text-primary-400 mt-4">Click to reveal</p>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute w-full h-full card flex flex-col items-center justify-center p-8"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="text-center">
            <p className="text-lg text-primary-600">{back}</p>
            <p className="text-sm text-primary-400 mt-4">Click to flip back</p>
          </div>
        </div>
      </div>
    </div>
  );
}
