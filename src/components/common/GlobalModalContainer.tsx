import { useModalStore } from "@/store";
import { AlertModal } from "./AlertModal";

export const GlobalModalContainer = () => {
  const {
    isOpen,
    type,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    closeModal,
  } = useModalStore();

  return (
    <AlertModal
      isOpen={isOpen}
      onClose={() => {
        if (onCancel) onCancel();
        closeModal();
      }}
      onConfirm={() => {
        onConfirm();
        closeModal();
      }}
      type={type}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
    />
  );
};
