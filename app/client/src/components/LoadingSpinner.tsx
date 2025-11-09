interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="text-center py-12">
      <div className="spinner"></div>
      <p className="mt-2 text-neutral-600">{message}</p>
    </div>
  );
}
