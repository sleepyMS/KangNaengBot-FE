import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, Mail, User } from "lucide-react";
import { useAuthStore, useUIStore } from "@/store";
import { AlertModal } from "@/components/common";

export const AccountTab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { closeSettingsModal } = useUIStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    closeSettingsModal();
    navigate("/login");
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
              {user?.name || "사용자"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Google 계정
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
        onClick={() => setShowLogoutConfirm(true)}
        className="logout-btn w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-transparent dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
      >
        <LogOut size={18} />
        {t("settings.account.logout")}
      </button>

      {/* 로그아웃 확인 모달 */}
      <AlertModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        type="warning"
        title={t("settings.account.logout")}
        message={t("settings.account.logoutConfirm")}
        confirmText={t("settings.account.logout")}
        cancelText={t("common.cancel")}
      />
    </div>
  );
};
