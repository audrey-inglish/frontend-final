import { useState } from "react";

interface FlipCardProps {
  front: string;
  back: string;
}

export function FlipCard({ front, back }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="w-full h-80 cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={handleFlip}
    >
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
