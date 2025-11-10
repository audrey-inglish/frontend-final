import toast from "react-hot-toast";
import { AlertIcon } from "../icons";

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
          <AlertIcon className="w-5 h-5 text-custom-white" />
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
