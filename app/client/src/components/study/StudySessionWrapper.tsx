import { StudySession } from "./StudySession";
import { getStudySessionTitle } from "../../lib/studyTopicExtractor";
import type { Dashboard } from "../../schemas/dashboard";

interface StudySessionWrapperProps {
  dashboard: Dashboard;
  topics: string[];
  dashboardId: number;
  onComplete: () => void;
}

export function StudySessionWrapper({
  dashboard,
  topics,
  dashboardId,
  onComplete,
}: StudySessionWrapperProps) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">
          {getStudySessionTitle(dashboard.title)}
        </h1>
        <p className="text-primary-600 mt-2">
          AI-guided study session covering {topics.length} topic
          {topics.length !== 1 ? "s" : ""}
        </p>
      </div>

      <StudySession
        topics={topics}
        dashboardId={dashboardId}
        onComplete={onComplete}
      />
    </>
  );
}
