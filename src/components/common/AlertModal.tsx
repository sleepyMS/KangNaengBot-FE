import { ReactNode } from "react";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";

type AlertType = "info" | "warning" | "success";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: AlertType;
}

const icons: Record<AlertType, ReactNode> = {
  info: <Info className="w-12 h-12 text-primary-500" />,
  warning: <AlertTriangle className="w-12 h-12 text-amber-500" />,
  success: <CheckCircle className="w-12 h-12 text-green-500" />,
};

export const AlertModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  type = "info",
}: AlertModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">{icons[type]}</div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center mb-2">
          {title}
        </h3>

        {/* Message */}
        <div className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6">
          {message}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
