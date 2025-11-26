import type { ReactElement } from "react";

interface StudyToolCardProps {
  title: string;
  icon: ReactElement;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
}

export default function StudyToolCard({
  title,
  icon,
  onClick,
  disabled = false,
  tooltip,
}: StudyToolCardProps) {
  const baseClasses = "card p-4 border-neutral-100 ";
  const interactiveClasses = disabled 
    ? "opacity-50 cursor-not-allowed bg-neutral-50" 
    : "hover:shadow-sm bg-neutral-50 cursor-pointer";

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`${baseClasses} ${interactiveClasses}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      title={tooltip}
      aria-disabled={disabled}
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-neutral-600 mb-0">{title}</h4>
        <div className={disabled ? "text-neutral-300" : "text-primary-300"}>
          {icon}
        </div>
      </div>
      {tooltip && disabled && (
        <p className="text-xs text-neutral-500 mt-2">{tooltip}</p>
      )}
    </div>
  );
}
