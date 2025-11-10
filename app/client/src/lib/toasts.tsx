import toast from "react-hot-toast";
import ErrorToastContent from "../components/validation/ErrorToastContent";

export function showErrorToast(message: string) {
  toast.error((t) => <ErrorToastContent message={message} toastId={t.id} />, {
    duration: Infinity,
    id: `error-${Date.now()}`, // Unique ID to prevent duplicates
  });
}

export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 3000,
  });
}

export function showInfoToast(message: string) {
  toast((t) => <ErrorToastContent message={message} toastId={t.id} />, {
    duration: Infinity,
    icon: "ℹ️",
  });
}
