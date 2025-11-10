import type { ReactElement } from "react";

interface CardsLayoutProps<T> {
  items: T[];
  renderItem: (item: T) => ReactElement;
  overflow?: "wrap" | "scroll";
  getKey?: (item: T, index: number) => string | number;
  className?: string; // optionally add to css
}

export default function CardsLayout<T>({
  items,
  renderItem,
  overflow = "wrap",
  getKey,
  className = "",
}: CardsLayoutProps<T>) {
  // If wrapping is enabled, use a responsive grid layout
  if (overflow === "wrap") {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {items.map((item, index) => {
          const key = getKey ? getKey(item, index) : index;
          return (
            <div key={key}>
              {renderItem(item)}
            </div>
          );
        })}
      </div>
    );
  }

  // If scrolling is enabled, use a horizontal flex layout with overflow
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="flex gap-4 pb-4">
        {items.map((item, index) => {
          const key = getKey ? getKey(item, index) : index;
          return (
            <div key={key} className="shrink-0 w-80">
              {renderItem(item)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
