import { useTranslation } from "react-i18next";
import { Modal } from "@/components/common";

interface QuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export const QuotaExceededModal = ({
  isOpen,
  onClose,
  onLogin,
}: QuotaExceededModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("auth.quotaExceeded.title", "대화 횟수 초과")}
    >
      <div className="flex flex-col items-center p-2">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-line">
          {t(
            "auth.quotaExceeded.message",
            "게스트 모드에서는 최대 3개의 메시지만 보낼 수 있습니다.\n계속 대화하려면 로그인해주세요.",
          )}
        </p>

        <div className="flex flex-col w-full gap-3">
          <button
            onClick={onLogin}
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            {t("auth.loginToContinue", "로그인하고 계속하기")}
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
          >
            {t("common.cancel", "취소")}
          </button>
        </div>
      </div>
    </Modal>
  );
};
