/**
 * 시간표 Canvas 컴포넌트
 * 데스크톱: 화면 오른쪽에 고정 패널 (채팅과 side-by-side)
 * 모바일: 오버레이
 */
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Download, Star, Bookmark, ChevronLeft } from "lucide-react";
import { useScheduleStore, useUIStore, useToastStore } from "@/store";
import { ScheduleCarousel } from "./ScheduleCarousel";

import { InputModal, AlertModal, Spinner } from "@/components/common";
import { Course } from "@/types";
import { toPng } from "html-to-image";
import { FilterPanel } from "./FilterPanel";
import { CourseDetailModal } from "./CourseDetailModal";

export const ScheduleCanvas = () => {
  const { t } = useTranslation();
  const gridRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useUIStore();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const {
    isCanvasOpen,
    closeCanvas,
    generatedSchedules,
    activeScheduleIndex,
    setActiveSchedule,

    status,
    setFilters,
    saveSchedule,
    deleteSavedSchedule,
    viewMode,
    loadedSchedule,
    switchToGeneratedView,
    savedSchedules,
    activeSavedIndex,
    setActiveSavedIndex,
    representativeScheduleId,
    setAsRepresentative,
  } = useScheduleStore();

  const handleResetFilters = () => {
    setFilters({ emptyDays: [], excludeTimeRanges: [] });
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
    if (!gridRef.current || isDownloading) return;

    try {
      setIsDownloading(true);
      // 다크 모드 감지
      const isDarkMode = document.documentElement.classList.contains("dark");
      const backgroundColor = isDarkMode ? "#0f172a" : "#ffffff"; // slate-900 or white

      const dataUrl = await toPng(gridRef.current, {
        backgroundColor,
        pixelRatio: 2, // 고해상도 (속도 저하의 주원인이지만 품질 위해 유지)
      });

      const link = document.createElement("a");
      link.download = `timetable-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      useToastStore
        .getState()
        .addToast("success", t("schedule.save.success_image_download"));
    } catch (error) {
      console.error("Image save failed:", error);
      useToastStore
        .getState()
        .addToast("error", t("schedule.save.failed_image_download"));
    } finally {
      setIsDownloading(false);
    }
  };

  // 대표 시간표 설정
  const handleSetRepresentative = async () => {
    const currentSchedule =
      viewMode === "saved"
        ? loadedSchedule
        : generatedSchedules[activeScheduleIndex];

    const scheduleId =
      viewMode === "saved" ? currentSchedule?.id : currentSchedule?.savedId;

    if (!scheduleId) {
      useToastStore
        .getState()
        .addToast("info", t("schedule.representative.saveFirst"));
      return;
    }

    await setAsRepresentative(scheduleId);
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
          <div className="flex items-center gap-2 overflow-hidden">
            {viewMode === "saved" && generatedSchedules.length > 0 && (
              <button
                onClick={switchToGeneratedView}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                title="목록으로 돌아가기"
              >
                <ChevronLeft
                  size={20}
                  className="text-gray-600 dark:text-gray-400"
                />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {viewMode === "saved"
                ? savedSchedules[activeSavedIndex]?.name ||
                  t("schedule.saved.title")
                : t("schedule.generated.title")}
            </h2>
          </div>
          <button
            onClick={closeCanvas}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={t("schedule.canvas.close")}
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* 필터 패널 (생성 모드일 때만 표시) */}
        {viewMode === "generated" && status !== "idle" && <FilterPanel />}

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === "saved" && savedSchedules.length > 0 ? (
            // [Saved Mode] 보관된 시간표들 캐러셀 표시
            <ScheduleCarousel
              schedules={savedSchedules}
              activeIndex={activeSavedIndex}
              onIndexChange={setActiveSavedIndex}
              gridRef={gridRef}
              onCourseClick={(course: Course) => setSelectedCourse(course)}
              disableCircular={true}
            />
          ) : generatedSchedules.length > 0 ? (
            // [Generated Mode] 생성된 시간표 목록 표시
            <ScheduleCarousel
              schedules={generatedSchedules}
              activeIndex={activeScheduleIndex}
              onIndexChange={setActiveSchedule}
              gridRef={gridRef}
              onCourseClick={(course: Course) => setSelectedCourse(course)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                {status === "complete"
                  ? t("schedule.status.noResults")
                  : status === "generating"
                    ? t("schedule.status.generating")
                    : t("schedule.status.noResults")}
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
        {(generatedSchedules.length > 0 ||
          (viewMode === "saved" && loadedSchedule)) && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex gap-2">
              {/* Icon Only Buttons */}
              <button
                onClick={handleSaveImage}
                disabled={isDownloading}
                className="p-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
                title={t("schedule.save.title")}
              >
                {isDownloading ? <Spinner size="sm" /> : <Download size={20} />}
              </button>
              {/* Star (Representative) Button */}
              {(() => {
                const currentSchedule =
                  viewMode === "saved"
                    ? loadedSchedule
                    : generatedSchedules[activeScheduleIndex];

                const currentId =
                  viewMode === "saved"
                    ? currentSchedule?.id
                    : currentSchedule?.savedId;

                const canSet = !!currentId;
                const isRepresentative = currentId === representativeScheduleId;

                return (
                  <button
                    onClick={handleSetRepresentative}
                    disabled={!canSet}
                    className={`p-3 rounded-xl transition-colors ${
                      isRepresentative
                        ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={
                      isRepresentative
                        ? t("schedule.representative.current")
                        : t("schedule.representative.set")
                    }
                  >
                    <Star
                      size={20}
                      className={isRepresentative ? "fill-current" : ""}
                    />
                  </button>
                );
              })()}

              {/* Bookmark Toggle Button */}
              {(() => {
                const currentSchedule =
                  viewMode === "saved"
                    ? loadedSchedule
                    : generatedSchedules[activeScheduleIndex];

                // 저장된 상태 여부 확인 (Generated 모드에서 savedId가 있거나, Saved 모드일 때)
                const isSaved =
                  (viewMode === "generated" && !!currentSchedule?.savedId) ||
                  viewMode === "saved";

                return (
                  <button
                    onClick={() => {
                      if (isSaved) {
                        setIsDeleteModalOpen(true);
                      } else {
                        setIsInputModalOpen(true);
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all shadow-sm ${
                      isSaved
                        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                        : "bg-primary-500 text-white hover:bg-primary-600"
                    }`}
                  >
                    <Bookmark
                      size={20}
                      className={isSaved ? "fill-current" : ""}
                    />
                    <span className="font-medium">
                      {isSaved
                        ? t("schedule.viewSaved")
                        : t("schedule.save.confirm")}
                    </span>
                  </button>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* 과목 상세 모달 */}
      <CourseDetailModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />

      {/* 시간표 이름 입력 모달 */}
      <InputModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        onConfirm={(name) => {
          saveSchedule(name);
          useToastStore
            .getState()
            .addToast("success", t("schedule.save.success"));
        }}
        title={t("schedule.save.title")}
        placeholder={t("schedule.save.placeholder")}
        confirmText={t("schedule.save.confirm")}
      />

      {/* 삭제 확인 모달 */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          let targetId: string | undefined;

          if (viewMode === "saved") {
            targetId = loadedSchedule?.id;
          } else {
            const currentSchedule = generatedSchedules[activeScheduleIndex];
            targetId = currentSchedule?.savedId;
          }

          if (targetId) {
            deleteSavedSchedule(targetId);
            // Saved 모드였으면 캔버스 닫기
            if (viewMode === "saved") {
              closeCanvas();
            }
            useToastStore
              .getState()
              .addToast("success", t("schedule.delete.success"));
          }
          setIsDeleteModalOpen(false);
        }}
        type="warning"
        title={t("schedule.delete.title")}
        message={t("schedule.delete.message")}
        confirmText={t("schedule.saved.delete")}
        cancelText={t("common.cancel")}
      />
    </>
  );
};
