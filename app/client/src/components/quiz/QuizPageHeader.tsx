interface QuizPageHeaderProps {
  dashboardTitle: string;
}

export function QuizPageHeader({ dashboardTitle }: QuizPageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-primary-800 mb-2">
        Quiz: {dashboardTitle}
      </h1>
      <p className="text-primary-600">
        Test your knowledge with an AI-generated quiz from your notes
      </p>
    </div>
  );
}
