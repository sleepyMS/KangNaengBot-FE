import { useTranslation } from "react-i18next";
import { AlertModal } from "@/components/common";

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
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onLogin}
      type="warning"
      title={t("auth.quotaExceeded.title", "대화 횟수 초과")}
      message={t(
        "auth.quotaExceeded.message",
        "게스트 모드에서는 최대 3개의 메시지만 보낼 수 있습니다.\n계속 대화하려면 로그인해주세요.",
      )}
      confirmText={t("auth.loginToContinue", "로그인하고 계속하기")}
      cancelText={t("common.cancel", "취소")}
    />
  );
};
