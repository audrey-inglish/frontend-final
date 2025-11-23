import type { ReactElement } from "react";

interface StudyToolCardProps {
  title: string;
  description: string;
  icon: ReactElement;
  onClick: () => void;
}

export default function StudyToolCard({
  title,
  description,
  icon,
  onClick,
}: StudyToolCardProps) {
  const baseClasses = "card p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1";

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
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-4 rounded-full bg-accent-100 text-accent-600">
          <div className="w-8 h-8">
            {icon}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-neutral-800 mb-2">{title}</h4>
          <p className="text-sm text-neutral-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
