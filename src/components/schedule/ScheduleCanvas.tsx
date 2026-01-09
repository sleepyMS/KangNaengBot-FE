/**
 * 시간표 Canvas 컴포넌트
 * 데스크톱: 화면 오른쪽에 고정 패널 (채팅과 side-by-side)
 * 모바일: 오버레이
 */
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Download, Share2, Bookmark } from "lucide-react";
import { useScheduleStore, useUIStore } from "@/store";
import { ScheduleCarousel } from "./ScheduleCarousel";
import { CourseDetailModal } from "./CourseDetailModal";
import { FilterPanel } from "./FilterPanel";
import { toPng } from "html-to-image";
import type { Course } from "@/types";

export const ScheduleCanvas = () => {
  const { t } = useTranslation();
  const gridRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useUIStore();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const {
    isCanvasOpen,
    closeCanvas,
    generatedSchedules,
    activeScheduleIndex,
    setActiveSchedule,
    saveSchedule,
    status,
    setFilters,
  } = useScheduleStore();

  const handleResetFilters = () => {
    setFilters({ emptyDays: [], excludePeriods: [] });
    // 클라이언트 필터링이므로 재생성 필요 없음
  };

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCanvasOpen) {
        closeCanvas();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isCanvasOpen, closeCanvas]);

  // 이미지 저장 - 시간표 그리드만 저장
  const handleSaveImage = async () => {
    if (!gridRef.current) return;

    try {
      // 다크 모드 감지
      const isDarkMode = document.documentElement.classList.contains("dark");
      const backgroundColor = isDarkMode ? "#0f172a" : "#ffffff"; // slate-900 or white

      const dataUrl = await toPng(gridRef.current, {
        backgroundColor,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `timetable-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Image save failed:", error);
    }
  };

  // 공유
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: t("schedule.canvas.shareTitle"),
          text: t("schedule.canvas.shareText"),
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert(t("schedule.canvas.linkCopied"));
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  if (!isCanvasOpen) return null;

  return (
    <>
      {/* 백드롭 (모바일만) */}
      {isMobile && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={closeCanvas} />
      )}

      {/* Canvas 패널 */}
      <div
        className={`
          fixed top-0 bottom-0 right-0 z-50
          bg-white dark:bg-slate-900 
          flex flex-col
          transition-transform duration-300 ease-out
          ${
            isMobile
              ? "w-full"
              : "w-[480px] border-l border-gray-200 dark:border-slate-700"
          }
          ${isCanvasOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("schedule.canvas.title")}
          </h2>
          <button
            onClick={closeCanvas}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={t("schedule.canvas.close")}
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* 필터 패널 (항상 표시) */}
        {status !== "idle" && <FilterPanel />}

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          {generatedSchedules.length > 0 ? (
            <ScheduleCarousel
              schedules={generatedSchedules}
              activeIndex={activeScheduleIndex}
              onIndexChange={setActiveSchedule}
              gridRef={gridRef}
              onCourseClick={(course) => setSelectedCourse(course)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                {status === "complete"
                  ? t("schedule.filter.noResults")
                  : t("schedule.canvas.noSchedule")}
              </div>
              {status === "complete" && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  {t("schedule.filter.reset")}
                </button>
              )}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        {generatedSchedules.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex gap-2">
              <button
                onClick={handleSaveImage}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Download size={18} />
                <span className="text-sm">{t("schedule.canvas.save")}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Share2 size={18} />
                <span className="text-sm">{t("schedule.canvas.share")}</span>
              </button>
              <button
                onClick={() => saveSchedule()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Bookmark size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 과목 상세 모달 */}
      <CourseDetailModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </>
  );
};
