import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToastStore, ToastType } from "@/store/useToastStore";
import { useSettingsStore } from "@/store";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-primary-500" />,
  error: <AlertCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-blue-500" />,
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();
  const { resolvedTheme } = useSettingsStore();
  const isDark = resolvedTheme === "dark";

  const getToastStyles = (type: ToastType) => {
    if (type === "success") {
      return isDark
        ? "bg-slate-800 border-primary-500"
        : "bg-primary-50 border-primary-200";
    }
    if (type === "info") {
      return isDark
        ? "bg-slate-800 border-blue-500"
        : "bg-blue-50 border-blue-200";
    }
    return isDark ? "bg-slate-800 border-red-500" : "bg-red-50 border-red-200";
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
            animate-slide-up ${getToastStyles(toast.type)}
          `}
        >
          {icons[toast.type]}
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
