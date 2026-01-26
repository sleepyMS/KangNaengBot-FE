import { useEffect, useState } from "react";
import { Bell, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/common/Switch";
import { useNotificationStore } from "@/store";

export const NotificationTab = () => {
  const { t } = useTranslation();
  const { enabled, offset, permissionGranted, setNotiState, syncWithNative } =
    useNotificationStore();
  const [isLoading, setIsLoading] = useState(true);

  // 1. 초기 로드: 네이티브 앱에 상태 요청
  useEffect(() => {
    if (!window.IS_NATIVE_APP) {
      setIsLoading(false);
      return;
    }

    // 상태 요청 전송 (Global Listener가 수신하여 Store 업데이트)
    syncWithNative();

    // 약간의 딜레이 후 로딩 해제 (스토어 업데이트 대기)
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [syncWithNative]);

  const handleToggle = (checked: boolean) => {
    // 켜는 경우, 네이티브에서 권한 요청 로직이 수행됨
    // UX 반응성을 위해 낙관적 업데이트(Optimistic Update) 적용
    // 켜는 경우, 네이티브에서 권한 요청 로직이 수행됨
    // UX 반응성을 위해 낙관적 업데이트(Optimistic Update) 적용
    setNotiState({ enabled: checked });

    if (window.sendToNative) {
      window.sendToNative("SET_NOTI_ENABLED", { enabled: checked });
    }
  };

  const handleOffsetChange = (newOffset: number) => {
    setNotiState({ offset: newOffset });
    if (window.sendToNative) {
      window.sendToNative("SET_NOTI_OFFSET", { offset: newOffset });
    }
  };

  if (!window.IS_NATIVE_APP) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <Bell className="w-12 h-12 mb-4 text-gray-300" />
        <p>{t("settings.notification.only_app_available")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t("settings.notification.title")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("settings.notification.description")}
        </p>
      </div>

      <div className="p-4 bg-white border border-gray-200 shadow-sm dark:bg-slate-800 dark:border-gray-700 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-0.5">
            <label className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {t("settings.notification.class_alert")}
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("settings.notification.class_alert_desc")}
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>

        {/* Offset Selector - 활성화된 경우에만 표시 */}
        <div
          className={`grid transition-all duration-200 ease-in-out ${
            enabled
              ? "grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden space-y-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Clock size={16} />
              {t("settings.notification.time_before")}
            </span>
            <div className="flex gap-2">
              {[5, 10, 15, 30].map((min) => (
                <button
                  key={min}
                  onClick={() => handleOffsetChange(min)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg border transition-colors
                    ${
                      offset === min
                        ? "bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/20 dark:border-primary-500 dark:text-primary-300"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-slate-700"
                    }
                  `}
                >
                  {min}
                  {t("common.unit.minute")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!permissionGranted && enabled && (
        <div className="p-3 text-sm text-yellow-700 bg-yellow-50 rounded-lg dark:bg-yellow-900/20 dark:text-yellow-400">
          ⚠️ {t("settings.notification.permission_required")}
        </div>
      )}
    </div>
  );
};
