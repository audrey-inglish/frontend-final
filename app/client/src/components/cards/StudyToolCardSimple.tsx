import type { ReactElement } from "react";

interface StudyToolCardProps {
  title: string;
  icon: ReactElement;
  onClick: () => void;
}

export default function StudyToolCard({
  title,
  icon,
  onClick,
}: StudyToolCardProps) {
  const baseClasses = "card p-4 hover:shadow-sm border-neutral-100 bg-neutral-50 ";

  return (
    <div
      onClick={onClick}
      className={`${baseClasses}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-neutral-600 mb-0">{title}</h4>
        <div className="text-primary-300">
          {icon}
        </div>
      </div>
    </div>
  );
}
