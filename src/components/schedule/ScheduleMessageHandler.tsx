/**
 * 시간표 메시지 핸들러
 * 채팅 내에서 시간표 관련 상태에 따른 인라인 메시지 표시
 */
import { useScheduleStore, useChatStore } from "@/store";
import {
  CourseConfirmMessage,
  ScheduleGeneratingMessage,
} from "@/components/schedule";
import { useTranslation } from "react-i18next";

export const ScheduleMessageHandler = () => {
  const { t } = useTranslation();
  const { currentSessionId } = useChatStore();
  const {
    isScheduleMode,
    status,
    parsedCourses,
    ambiguousCourses,
    error,
    confirmAllCourses,
    generateSchedules,
    reset,
  } = useScheduleStore();

  // 시간표 모드가 아니면 아무것도 렌더링하지 않음
  if (!isScheduleMode) return null;

  // 과목 확인 → 생성 핸들러
  const handleConfirm = async () => {
    confirmAllCourses();
    if (currentSessionId) {
      await generateSchedules(currentSessionId);
    }
  };

  // 수정하기 핸들러
  const handleModify = () => {
    // 상태 리셋하고 다시 입력 받기
    reset();
  };

  return (
    <>
      {/* 과목 확인 상태 */}
      {status === "confirming" && (
        <div className="flex gap-3 items-end animate-slide-up">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center overflow-hidden">
            <img
              src="/assets/images/logo.svg"
              alt="강냉봇"
              className="w-5 h-5"
            />
          </div>
          <CourseConfirmMessage
            parsedCourses={parsedCourses}
            ambiguousCourses={ambiguousCourses}
            notFoundCourses={[]}
            onConfirm={handleConfirm}
            onModify={handleModify}
          />
        </div>
      )}

      {/* 생성 중 상태 */}
      {status === "generating" && (
        <div className="flex gap-3 items-end animate-slide-up">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center overflow-hidden">
            <img
              src="/assets/images/logo.svg"
              alt="강냉봇"
              className="w-5 h-5"
            />
          </div>
          <ScheduleGeneratingMessage />
        </div>
      )}

      {/* 완료 상태 - 이제 일반 채팅 메시지(type: schedule_result)로 처리되므로 여기서는 렌더링하지 않음 */}

      {/* 에러 상태 */}
      {status === "error" && error && (
        <div className="flex gap-3 items-end animate-slide-up">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center overflow-hidden">
            <img
              src="/assets/images/logo.svg"
              alt="강냉봇"
              className="w-5 h-5"
            />
          </div>
          <div className="bubble-ai max-w-sm">
            <div className="text-red-600 dark:text-red-400 font-medium mb-2">
              {t("schedule.status.error")}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {error.message}
            </p>
            {error.retryable && (
              <button
                onClick={handleModify}
                className="mt-3 px-4 py-2 text-sm bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                {t("schedule.retry")}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
