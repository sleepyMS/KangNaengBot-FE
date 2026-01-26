/**
 * 과목 상세 정보 모달
 * 시간표에서 과목 클릭 시 표시
 */
import { useTranslation } from "react-i18next";
import { X, Clock, MapPin, User, BookOpen, Hash } from "lucide-react";
import type { Course, Day } from "@/types";
import { useModalBackHandler } from "@/hooks/useModalBackHandler";

interface CourseDetailModalProps {
  course: Course | null;
  onClose: () => void;
}

export const CourseDetailModal = ({
  course,
  onClose,
}: CourseDetailModalProps) => {
  const { t } = useTranslation();

  // 네이티브 앱에서 뒤로가기 제스처로 모달 닫기 지원
  // course가 있으면 모달이 열린 상태
  useModalBackHandler(!!course, onClose);

  if (!course) return null;

  const DAY_MAP: Record<Day, string> = {
    mon: t("schedule.days.mon"),
    tue: t("schedule.days.tue"),
    wed: t("schedule.days.wed"),
    thu: t("schedule.days.thu"),
    fri: t("schedule.days.fri"),
  };

  // 시간 문자열 생성
  const getTimeString = () => {
    return course.slots
      .map((slot) => {
        const day = DAY_MAP[slot.day];
        return `${day} ${slot.startTime}~${slot.endTime}`;
      })
      .join(", ");
  };

  // 장소 문자열 생성
  const getLocationString = () => {
    const locations = [
      ...new Set(course.slots.map((s) => s.location).filter(Boolean)),
    ];
    return locations.join(", ") || "-";
  };

  // 과목 코드-분반 문자열
  const getCodeSection = () => {
    return course.section ? `${course.code}[${course.section}]` : course.code;
  };

  return (
    <>
      {/* 백드롭 */}
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

      {/* 모달 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 헤더 - 과목 색상 배경 */}
        <div
          className="p-4 text-white"
          style={{ backgroundColor: course.color || "#4e92ff" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold">{course.name}</h3>
              <p className="text-white/80 text-sm mt-0.5">{getCodeSection()}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-4 space-y-3">
          {/* 교수 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
              <User size={16} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t("schedule.detail.professor")}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {course.professor}
              </div>
            </div>
          </div>

          {/* 분반 */}
          {course.section && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                <Hash size={16} className="text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t("schedule.detail.section")}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {course.section}
                </div>
              </div>
            </div>
          )}

          {/* 시간 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
              <Clock size={16} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t("schedule.detail.time")}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {getTimeString()}
              </div>
            </div>
          </div>

          {/* 장소 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
              <MapPin size={16} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t("schedule.detail.location")}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {getLocationString()}
              </div>
            </div>
          </div>

          {/* 학점 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
              <BookOpen
                size={16}
                className="text-gray-500 dark:text-gray-400"
              />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t("schedule.detail.credits")}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {course.credits}
                {t("schedule.canvas.credits")}
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </>
  );
};
