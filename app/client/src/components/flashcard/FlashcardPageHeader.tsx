interface FlashcardPageHeaderProps {
  dashboardTitle: string;
}

export function FlashcardPageHeader({ dashboardTitle }: FlashcardPageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-primary-800 mb-2">
        Flashcards: {dashboardTitle}
      </h1>
      <p className="text-primary-600">
        Study with AI-generated flashcards from your notes
      </p>
    </div>
  );
}
