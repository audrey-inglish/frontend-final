import { useNavigate } from "react-router";
import { BrainIcon, BookmarkIcon, ClipboardListIcon, ChartIcon } from "../icons";
import StudyToolCard from "../cards/StudyToolCardSimple";

interface StudyToolsProps {
  dashboardId: number;
  conceptsReady?: boolean;
}

export function StudyTools({ dashboardId, conceptsReady = true }: StudyToolsProps) {
  const navigate = useNavigate();

  const studyTools = [
    {
      title: "AI Study Session",
      icon: <BrainIcon className="study-tool-icon" />,
      onClick: () => navigate(`/dashboard/${dashboardId}/study`),
      disabled: !conceptsReady,
      tooltip: !conceptsReady ? "Waiting for concepts to be generated..." : undefined,
    },
    {
      title: "Flashcards",
      icon: <BookmarkIcon className="study-tool-icon" />,
      onClick: () => navigate(`/dashboard/${dashboardId}/flashcards`),
    },
    {
      title: "Take a Quiz",
      icon: <ClipboardListIcon className="study-tool-icon" />,
      onClick: () => navigate(`/dashboard/${dashboardId}/quiz`),
    },
    {
      title: "View Statistics",
      icon: <ChartIcon className="study-tool-icon" />,
      onClick: () => navigate(`/dashboard/${dashboardId}/stats`),
    },
  ];

  return (
    <div className="card p-6 mb-6">
      <h3 className="text-lg font-semibold text-primary-700 mb-4">
        Study Tools
      </h3>
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        {studyTools.map((tool) => (
          <StudyToolCard
            key={tool.title}
            title={tool.title}
            icon={tool.icon}
            onClick={tool.onClick}
            disabled={tool.disabled}
            tooltip={tool.tooltip}
          />
        ))}
      </div>
    </div>
  );
}
