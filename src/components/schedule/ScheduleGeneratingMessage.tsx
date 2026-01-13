/**
 * 시간표 생성 중 메시지 컴포넌트
 * 시간표를 생성하는 동안 보여주는 로딩 애니메이션
 */
import { useTranslation } from "react-i18next";
import { Calendar, Loader2 } from "lucide-react";
import { useChatStore } from "@/store";

export const ScheduleGeneratingMessage = () => {
  const { t } = useTranslation();
  const streamingMessage = useChatStore((state) => state.streamingMessage);

  return (
    <div className="bubble-ai max-w-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Calendar
            size={20}
            className="text-primary-600 dark:text-primary-400"
          />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-white">
            {t("schedule.status.generating")}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Loader2 size={14} className="animate-spin text-primary-500" />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {streamingMessage || t("schedule.generating.analyzing")}
            </div>
          </div>
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className="mt-3 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse w-2/3" />
      </div>
    </div>
  );
};
