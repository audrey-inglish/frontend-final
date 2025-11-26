import { Carousel } from "../layout/Carousel";
import { FlipCard } from "./FlipCard";
import type { Flashcard } from "../../schemas/flashcard";

interface FlashcardCarouselProps {
  flashcards: Flashcard[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onToggleReview: (flashcardId: number, currentState: boolean) => void;
}

export function FlashcardCarousel({
  flashcards,
  currentIndex,
  onPrevious,
  onNext,
  onToggleReview,
}: FlashcardCarouselProps) {
  return (
    <Carousel
      currentIndex={currentIndex}
      onPrevious={onPrevious}
      onNext={onNext}
    >
      {flashcards.map((card, index) => (
        <FlipCard
          key={card.id || index}
          front={card.front}
          back={card.back}
          id={card.id}
          needsReview={card.needs_review}
          onToggleReview={onToggleReview}
        />
      ))}
    </Carousel>
  );
}
