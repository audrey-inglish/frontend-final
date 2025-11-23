import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "react-oidc-context";
import {
  useGetDashboard,
  useGetNotes,
  useFlashcardGenerator,
  useGetFlashcards,
  useMarkFlashcard,
} from "../hooks";
import { Navbar, LoadingSpinner, ProtectedRoute } from "../components";
import { Carousel } from "../components/layout/Carousel";
import { FlipCard } from "../components/flashcard/FlipCard";
import { FlashcardActionButtons } from "../components/flashcard/FlashcardActionButtons";

type FlashcardFilter = "all" | "marked";

export default function FlashcardsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dashboardId = Number(id);
  const auth = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<FlashcardFilter>("all");

  const isAuthReady = auth.isAuthenticated && !auth.isLoading;
  const { data: dashboard, isLoading: dashboardLoading } = useGetDashboard(
    dashboardId,
    isAuthReady
  );
  const { data: notes, isLoading: notesLoading } = useGetNotes(
    dashboardId,
    isAuthReady
  );

  const { data: savedFlashcards, isLoading: flashcardsLoading } = useGetFlashcards(
    dashboardId,
    filter === "marked" ? true : undefined,
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

  const isLoading = dashboardLoading || notesLoading || flashcardsLoading;
  // Prefer saved flashcards (with IDs) over freshly generated ones
  const flashcards = savedFlashcards ?? flashcardGenerator.flashcards ?? [];
  const hasFlashcards = flashcards && flashcards.length > 0;
  const markedCount = savedFlashcards?.filter((card) => card.needs_review).length ?? 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar showBackButton />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading && <LoadingSpinner />}

          {!isLoading && dashboard && (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary-800 mb-2">
                  Flashcards: {dashboard.title}
                </h1>
                <p className="text-primary-600">
                  Study with AI-generated flashcards from your notes
                </p>
              </div>

              {/* Generate button or flashcard display */}
              {!hasFlashcards ? (
                <div className="card p-8 text-center">
                  <h3 className="text-xl font-semibold text-primary-700 mb-4">
                    Ready to study?
                  </h3>
                  <p className="text-primary-400 mb-6">
                    Generate flashcards from your notes to begin studying
                  </p>
                  <button
                    onClick={handleGenerateFlashcards}
                    disabled={
                      flashcardGenerator.isGenerating ||
                      !notes ||
                      notes.length === 0
                    }
                    className="btn"
                  >
                    {flashcardGenerator.isGenerating
                      ? "Generating..."
                      : "Generate Flashcards"}
                  </button>
                  {(!notes || notes.length === 0) && (
                    <p className="text-custom-red-500 mt-4 text-sm">
                      Add some notes to your dashboard first
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Filter segmented control - only show for saved cards */}
                  {savedFlashcards && savedFlashcards.length > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="inline-flex rounded-lg border border-neutral-300 bg-custom-white p-1">
                        <button
                          onClick={() => handleFilterChange("all")}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            filter === "all"
                              ? "bg-primary-500 text-custom-white"
                              : "text-neutral-500 hover:text-primary-500"
                          }`}
                        >
                          All Cards
                        </button>
                        <button
                          onClick={() => handleFilterChange("marked")}
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
                  )}

                  {/* Flashcard carousel */}
                  <Carousel
                    currentIndex={currentIndex}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                  >
                    {flashcards.map((card, index) => (
                      <FlipCard 
                        key={card.id || index} 
                        front={card.front} 
                        back={card.back}
                        id={card.id}
                        needsReview={card.needs_review}
                        onToggleReview={handleToggleReview}
                      />
                    ))}
                  </Carousel>

                  {/* Action buttons */}
                  <FlashcardActionButtons
                    onBack={() => navigate(`/dashboard/${dashboardId}`)}
                    onRegenerate={handleGenerateFlashcards}
                    isGenerating={flashcardGenerator.isGenerating}
                    disableRegenerate={false}
                    className="mt-6"
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
