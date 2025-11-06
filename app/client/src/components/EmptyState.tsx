interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      <p className="text-gray-600 mb-4">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
