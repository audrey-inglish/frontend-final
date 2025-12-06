import { useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "react-oidc-context";
import {
  useGetDashboard,
  useGetNotes,
  useFlashcardGenerator,
  useGetFlashcards,
  useMarkFlashcard,
} from "../../hooks";
import { Navbar, LoadingSpinner, ProtectedRoute } from "../../components";
import {
  FlashcardPageHeader,
  FlashcardEmptyState,
  FlashcardFilter,
  FlashcardCarousel,
} from "../../components/flashcard";

type FlashcardFilter = "all" | "marked";

export default function FlashcardsPage() {
  const { id } = useParams();
  const dashboardId = Number(id);
  const auth = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<FlashcardFilter>("all");

  const isAuthReady = auth.isAuthenticated && !auth.isLoading;
  const { data: dashboard, isLoading: dashboardLoading } = useGetDashboard(
    dashboardId,
    isAuthReady
  );
  
  const { data: savedFlashcards, isLoading: flashcardsLoading } = useGetFlashcards(
    dashboardId,
    filter === "marked" ? true : undefined,
    isAuthReady
  );

  // Load notes in background - needed for generation but shouldn't block initial render
  const { data: notes, isLoading: notesLoading } = useGetNotes(
    dashboardId,
    isAuthReady
  );

  const flashcardGenerator = useFlashcardGenerator({ dashboardId, notes });
  const markFlashcard = useMarkFlashcard();

  const handleGenerateFlashcards = async () => {
    setCurrentIndex(0);
    setFilter("all");
    await flashcardGenerator.handleGenerate();
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    const cards = flashcardGenerator.flashcards ?? savedFlashcards ?? [];
    setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
  };

  const handleToggleReview = (flashcardId: number, currentState: boolean) => {
    markFlashcard.mutate({
      flashcardId,
      needsReview: !currentState,
      dashboardId,
    });
  };

  const handleFilterChange = (newFilter: FlashcardFilter) => {
    setFilter(newFilter);
    setCurrentIndex(0);
  };

  // Prefer saved flashcards (with IDs) over freshly generated ones
  const flashcards = savedFlashcards ?? flashcardGenerator.flashcards ?? [];
  const hasFlashcards = flashcards && flashcards.length > 0;
  const markedCount = savedFlashcards?.filter((card) => card.needs_review).length ?? 0;

  const isFlashcardsLoading = flashcardsLoading && !savedFlashcards && !flashcardGenerator.flashcards;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar showBackButton />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FlashcardPageHeader 
            dashboardTitle={dashboard?.title} 
            dashboardId={dashboardId}
            onRegenerate={hasFlashcards ? handleGenerateFlashcards : undefined}
            isGenerating={flashcardGenerator.isGenerating}
            isLoading={dashboardLoading}
          />

          {isFlashcardsLoading ? (
            <LoadingSpinner message="Loading flashcards..." />
          ) : (
            <>
              {!hasFlashcards ? (
                <FlashcardEmptyState
                  onGenerate={handleGenerateFlashcards}
                  isGenerating={flashcardGenerator.isGenerating}
                  hasNotes={!!notes && notes.length > 0}
                  isLoadingNotes={notesLoading}
                />
              ) : (
                <div className="space-y-2">
                  {hasFlashcards && (
                    <FlashcardFilter
                      filter={filter}
                      markedCount={markedCount}
                      onFilterChange={handleFilterChange}
                    />
                  )}

                  <FlashcardCarousel
                    flashcards={flashcards}
                    currentIndex={currentIndex}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onToggleReview={handleToggleReview}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
