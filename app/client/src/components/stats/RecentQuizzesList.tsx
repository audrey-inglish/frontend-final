interface RecentQuiz {
  id: number;
  title: string;
  score: number;
  created_at: string;
}

interface RecentQuizzesListProps {
  quizzes: RecentQuiz[];
}

export function RecentQuizzesList({ quizzes }: RecentQuizzesListProps) {
  if (quizzes.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-primary-800 mb-4">Recent Quizzes</h3>
        <div className="text-center py-8 text-neutral-500">
          <p>No completed quizzes yet.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-custom-green-600 bg-custom-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 50) return 'text-yellow-600 bg-orange-100';
    return 'text-custom-red-500 bg-custom-red-100';
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-primary-800 mb-4">Recent Quizzes</h3>
      <div className="space-y-3">
        {quizzes.map((quiz) => (
          <div 
            key={quiz.id}
            className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-800 truncate">
                {quiz.title}
              </p>
              <p className="text-sm text-neutral-500">
                {formatDate(quiz.created_at)}
              </p>
            </div>
            <div className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(quiz.score)}`}>
              {quiz.score.toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
