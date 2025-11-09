import toast from "react-hot-toast";

interface ErrorToastContentProps {
  message: string;
  toastId: string;
}

export default function ErrorToastContent({
  message,
  toastId,
}: ErrorToastContentProps) {
  return (
    <div className="flex items-center justify-between gap-4 min-w-[300px]">
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-0.5">
          <svg
            className="w-5 h-5 text-custom-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-custom-white text-sm font-medium flex-1">
          {message}
        </p>
      </div>
      <button
        onClick={() => toast.dismiss(toastId)}
        className="error-toast-button"
      >
        Dismiss
      </button>
    </div>
  );
}
