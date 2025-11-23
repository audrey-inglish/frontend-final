import { useParams, useNavigate } from "react-router";
import {
  useGetDashboard,
  useGetDashboardStats,
} from "../hooks";
import {
  Navbar,
  LoadingSpinner,
  ProtectedRoute,
  StatsCard,
  ScoreHistoryChart,
  RecentQuizzesList,
} from "../components";
import { TrophyIcon, ChartIcon, TargetIcon, ClipboardListIcon } from "../components/icons";

export default function StatsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dashboardId = Number(id);
  
  const { data: dashboard, isLoading: dashboardLoading } = useGetDashboard(dashboardId);
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats(dashboardId);

  const isLoading = dashboardLoading || statsLoading;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <Navbar showBackButton />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading && <LoadingSpinner />}

          {!isLoading && dashboard && stats && (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary-800 mb-2">
                  Statistics: {dashboard.title}
                </h1>
                <p className="text-primary-600">
                  Track your quiz performance and progress over time
                </p>
              </div>

              {/* No data state */}
              {stats.total_quizzes === 0 ? (
                <div className="card p-12 text-center">
                  <div className="text-neutral-400 mb-4">
                    <ChartIcon className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-700 mb-2">
                    No Quiz Data Yet
                  </h3>
                  <p className="text-neutral-500 mb-6">
                    Complete some quizzes to see your statistics and track your progress.
                  </p>
                  <button
                    onClick={() => navigate(`/dashboard/${dashboardId}/quiz`)}
                    className="btn"
                  >
                    Take a Quiz
                  </button>
                </div>
              ) : (
                <>
                  {/* Stats Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                      title="Total Quizzes"
                      value={stats.total_quizzes}
                      subtitle="Completed"
                      icon={<ClipboardListIcon className="w-8 h-8" />}
                    />
                    
                    <StatsCard
                      title="Average Score"
                      value={`${stats.average_score.toFixed(1)}%`}
                      subtitle="Overall performance"
                      icon={<ChartIcon className="w-8 h-8" />}
                      trend={stats.improvement !== null ? {
                        value: stats.improvement,
                        isPositive: stats.improvement > 0
                      } : undefined}
                    />
                    
                    <StatsCard
                      title="Highest Score"
                      value={`${stats.highest_score.toFixed(0)}%`}
                      subtitle="Best performance"
                      icon={<TrophyIcon className="w-8 h-8" />}
                    />
                    
                    <StatsCard
                      title="Lowest Score"
                      value={`${stats.lowest_score.toFixed(0)}%`}
                      subtitle="Room for improvement"
                      icon={<TargetIcon className="w-8 h-8" />}
                    />
                  </div>

                  {/* Charts and Lists Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <ScoreHistoryChart data={stats.score_history} />
                    <RecentQuizzesList quizzes={stats.recent_quizzes} />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => navigate(`/dashboard/${dashboardId}`)}
                      className="btn-secondary"
                    >
                      Back to Dashboard
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/${dashboardId}/quiz`)}
                      className="btn"
                    >
                      <span className="sm:hidden">New Quiz</span>
                      <span className="hidden sm:inline">Take Another Quiz</span>
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
