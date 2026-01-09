/**
 * 시간표 Canvas 컴포넌트
 * 데스크톱: 화면 오른쪽에 고정 패널 (채팅과 side-by-side)
 * 모바일: 오버레이
 */
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Download, Share2, Bookmark, ChevronLeft } from "lucide-react";
import { useScheduleStore, useUIStore, useToastStore } from "@/store";
import { ScheduleCarousel } from "./ScheduleCarousel";

import { InputModal, AlertModal } from "@/components/common";
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
                ? loadedSchedule?.name || "보관된 시간표"
                : t("schedule.canvas.title")}
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
          {viewMode === "saved" && loadedSchedule ? (
            // [Saved Mode] 불러온 시간표 표시
            <ScheduleCarousel
              schedules={[loadedSchedule]}
              activeIndex={0}
              onIndexChange={() => {}} // 단일 항목이므로 변경 없음
              gridRef={gridRef}
              onCourseClick={(course: Course) => setSelectedCourse(course)}
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
        {(generatedSchedules.length > 0 ||
          (viewMode === "saved" && loadedSchedule)) && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex gap-2">
              {/* Icon Only Buttons */}
              <button
                onClick={handleSaveImage}
                className="p-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                title={t("schedule.canvas.saveImage")}
              >
                <Download size={20} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                title={t("schedule.canvas.share")}
              >
                <Share2 size={20} />
              </button>

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
                      {isSaved ? "보관됨" : "저장"}
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
            .addToast("success", "시간표가 보관함에 저장되었습니다.");
        }}
        title="시간표 이름 저장"
        placeholder="예: 2024-1 1안, 공강 최대 시간표..."
        confirmText="저장"
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
              .addToast("success", "시간표가 삭제되었습니다.");
          }
          setIsDeleteModalOpen(false);
        }}
        type="warning"
        title="보관함에서 삭제"
        message="이 시간표를 보관함에서 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
      />
    </>
  );
};
