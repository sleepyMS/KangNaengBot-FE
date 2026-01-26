import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, Mail, User, UserX } from "lucide-react";
import {
  useAuthStore,
  useUIStore,
  useToastStore,
  useModalStore,
} from "@/store";

export const AccountTab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, deleteAccount, isLoading } =
    useAuthStore();
  const { closeSettingsModal, isMobile } = useUIStore();
  const { addToast } = useToastStore();
  const { openModal } = useModalStore();

  const handleLogout = async () => {
    await logout();
    closeSettingsModal();
    if (!isMobile) {
      addToast("success", t("auth.logoutSuccess"));
    }
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      closeSettingsModal();
      if (!isMobile) {
        addToast("success", t("settings.account.deleteAccountSuccess"));
      }
      navigate("/login");
    } catch {
      addToast("error", t("store.error.deleteAccount"));
    }
  };

  // 게스트 모드
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {t("settings.account.title")}
        </h3>

        <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-2xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <User size={32} className="text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {t("settings.account.guestMode")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("settings.account.guestDescription")}
            </p>
          </div>
          <button
            onClick={() => {
              closeSettingsModal();
              navigate("/login");
            }}
            className="px-6 py-2.5 bg-primary-500 text-white rounded-full font-medium hover:bg-primary-600 transition-colors"
          >
            {t("chat.login")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        {t("settings.account.title")}
      </h3>

      {/* 사용자 정보 */}
      <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-2xl space-y-4">
        {/* 프로필 이미지 */}
        <div className="flex items-center gap-4">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <User size={32} className="text-primary-500" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {user?.name || t("common.user")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("settings.account.googleAccount")}
            </p>
          </div>
        </div>

        {/* 이메일 */}
        <div className="account-email-box flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl">
          <Mail size={18} className="text-gray-400 dark:text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("settings.account.email")}
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-100 font-medium">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <button
        onClick={() =>
          openModal({
            type: "warning",
            title: t("settings.account.logout"),
            message: t("settings.account.logoutConfirm"),
            confirmText: t("settings.account.logout"),
            cancelText: t("common.cancel"),
            onConfirm: handleLogout,
          })
        }
        className="logout-btn w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-transparent dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
      >
        <LogOut size={18} />
        {t("settings.account.logout")}
      </button>

      {/* 회원탈퇴 버튼 */}
      <button
        onClick={() =>
          openModal({
            type: "danger",
            title: t("settings.account.deleteAccount"),
            message: t("settings.account.deleteAccountConfirm"),
            confirmText: t("settings.account.deleteAccount"),
            cancelText: t("common.cancel"),
            onConfirm: handleDeleteAccount,
          })
        }
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
      >
        <UserX size={18} />
        {t("settings.account.deleteAccount")}
      </button>
    </div>
  );
};
