import { X, CheckCircle, AlertCircle } from "lucide-react";
import { useToastStore, ToastType } from "@/store/useToastStore";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-primary-500" />,
  error: <AlertCircle size={18} className="text-red-500" />,
};

const bgColors: Record<ToastType, string> = {
  success: "bg-primary-50 border-primary-200",
  error: "bg-red-50 border-red-200",
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
            animate-slide-up ${bgColors[toast.type]}
          `}
        >
          {icons[toast.type]}
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 p-1 rounded-lg hover:bg-black/5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
