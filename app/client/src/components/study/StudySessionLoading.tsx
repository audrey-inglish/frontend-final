export function StudySessionLoading() {
  return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mx-auto"></div>
      <p className="text-primary-600 mt-4">
        AI is deciding what to do next...
      </p>
    </div>
  );
}
