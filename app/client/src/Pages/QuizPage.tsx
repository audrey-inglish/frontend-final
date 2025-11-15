import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "react-oidc-context";
import {
  useGetDashboard,
  useGetNotes,
  useQuizGenerator,
  useQuizSubmission,
} from "../hooks";
import { 
  Navbar, 
  LoadingSpinner, 
  ProtectedRoute,
  QuizConfigForm,
  QuizDisplay,
  QuizEmptyState,
} from "../components";
import type { Difficulty } from "../schemas/quiz";

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dashboardId = Number(id);
  const auth = useAuth();

  // Track user answers: { questionId: answer }
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

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
    questions: quizGenerator.questions || [],
    onComplete: (score) => {
      setShowResults(true);
      console.log(`Quiz completed with score: ${score}%`);
    },
  });

  const handleGenerateQuiz = async (
    numQuestions: number,
    questionTypes: Array<'multiple-choice' | 'short-answer'>,
    difficulty: Difficulty
  ) => {
    // Reset state when generating new quiz
    setUserAnswers({});
    setShowResults(false);
    await quizGenerator.handleGenerate(numQuestions, questionTypes, difficulty);
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
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
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary-800 mb-2">
                  Quiz: {dashboard.title}
                </h1>
                <p className="text-primary-600">
                  Test your knowledge with an AI-generated quiz from your notes
                </p>
              </div>

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
                        setShowResults(false);
                        setUserAnswers({});
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
