import { useParams, useNavigate } from "react-router";
import { useAuth } from "react-oidc-context";
import {
  useGetDashboard,
  useGetNotes,
  useQuizGenerator,
  useQuizSubmission,
} from "../../hooks";
import { useQuizAnswers } from "../../hooks/quiz/useQuizAnswers";
import {
  Navbar,
  LoadingSpinner,
  ProtectedRoute,
  QuizConfigForm,
  QuizDisplay,
  QuizEmptyState,
} from "../../components";
import { QuizPageHeader } from "../../components/quiz/QuizPageHeader";
import type { Difficulty } from "../../schemas/quiz";

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dashboardId = Number(id);
  const auth = useAuth();

  const {
    userAnswers,
    showResults,
    handleAnswerChange,
    resetAnswers,
    setShowResults,
  } = useQuizAnswers();

  const isAuthReady = auth.isAuthenticated && !auth.isLoading;
  const { data: dashboard, isLoading: dashboardLoading } = useGetDashboard(
    dashboardId,
    isAuthReady
  );
  const { data: notes, isLoading: notesLoading } = useGetNotes(
    dashboardId,
    isAuthReady
  );

  const quizGenerator = useQuizGenerator({ dashboardId, notes });
  
  const quizSubmission = useQuizSubmission({
    quizId: quizGenerator.quiz?.id,
    questions: quizGenerator.questions || [],
    onComplete: () => {
      setShowResults(true);
    },
  });

  const handleGenerateQuiz = async (
    numQuestions: number,
    questionTypes: Array<"multiple-choice" | "short-answer">,
    difficulty: Difficulty
  ) => {
    resetAnswers();
    await quizGenerator.handleGenerate(numQuestions, questionTypes, difficulty);
  };

  const handleSubmitQuiz = async () => {
    if (!quizGenerator.questions) return;
    
    // Convert answers to the format expected by the hook
    const answers = quizGenerator.questions.map(q => ({
      questionId: q.id!,
      userAnswer: userAnswers[q.id!] || "",
    }));

    await quizSubmission.submitQuiz(answers);
  };

  const isLoading = dashboardLoading || notesLoading;
  const hasNotes = notes && notes.length > 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar showBackButton />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading && <LoadingSpinner />}

          {!isLoading && dashboard && (
            <>
              <QuizPageHeader dashboardTitle={dashboard.title} />

              {/* Main content area */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side - Quiz config form */}
                <div className="lg:col-span-1">
                  <div className="card p-6">
                    <QuizConfigForm
                      onGenerate={handleGenerateQuiz}
                      isGenerating={quizGenerator.isGenerating}
                      disabled={!hasNotes}
                    />
                  </div>
                  {/* Back button */}
                  <button
                    onClick={() => navigate(`/dashboard/${dashboardId}`)}
                    className="btn-secondary w-full mt-4"
                  >
                    Back to Dashboard
                  </button>
                </div>

                {/* Right side - Quiz display or placeholder */}
                <div className="lg:col-span-2">
                  {!hasNotes || !quizGenerator.questions || quizGenerator.questions.length === 0 ? (
                    <QuizEmptyState 
                      hasNotes={!!hasNotes}
                      onGoToDashboard={() => navigate(`/dashboard/${dashboardId}`)}
                    />
                  ) : (
                    <QuizDisplay
                      questions={quizGenerator.questions}
                      userAnswers={userAnswers}
                      showResults={showResults}
                      results={quizSubmission.results}
                      isSubmitting={quizSubmission.isSubmitting}
                      onAnswerChange={handleAnswerChange}
                      onSubmit={handleSubmitQuiz}
                      onRetake={() => {
                        resetAnswers();
                      }}
                      onGenerateNew={() => handleGenerateQuiz(
                        quizGenerator.questions?.length || 5,
                        ['multiple-choice', 'short-answer'],
                        'medium'
                      )}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
