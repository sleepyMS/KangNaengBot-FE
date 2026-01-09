import { useState, MouseEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useScheduleStore, useToastStore, useUIStore } from "@/store";
import { Trash2, Star, Calendar } from "lucide-react";
import type { SavedSchedule } from "@/types";
import { AlertModal } from "@/components/common";

export const SavedScheduleList = () => {
  const {
    savedSchedules,
    deleteSavedSchedule,
    loadSchedule,
    loadSavedSchedules,
  } = useScheduleStore();

  const { t } = useTranslation();

  useEffect(() => {
    loadSavedSchedules();
  }, [loadSavedSchedules]);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleDeleteClick = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteSavedSchedule(deleteTargetId);
      useToastStore
        .getState()
        .addToast("success", t("schedule.delete.success"));
      setDeleteTargetId(null);
    }
  };

  const handleClickSchedule = (schedule: SavedSchedule) => {
    loadSchedule(schedule);
    const { isMobile, setSidebarOpen } = useUIStore.getState();
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (savedSchedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
        <Star size={24} className="opacity-20" />
        <span className="text-xs">{t("schedule.saved.empty")}</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1 px-2">
        {savedSchedules.map((schedule) => (
          <div
            key={schedule.id}
            onClick={() => handleClickSchedule(schedule)}
            className="group relative flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-transparent hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                <Calendar size={14} />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                    {schedule.name}
                  </span>
                  {schedule.isFavorite && (
                    <Star
                      size={10}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  )}
                </div>
                <span className="text-xs text-gray-400 truncate">
                  {schedule.totalCredits}
                  {t("schedule.canvas.credits")} •{" "}
                  {t("schedule.filter.emptyDay")} {schedule.emptyDays.length}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => handleDeleteClick(schedule.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              title={t("schedule.saved.delete")}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <AlertModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        type="warning"
        title={t("schedule.saved.delete")}
        message={t("schedule.delete.confirm")}
        confirmText={t("schedule.saved.delete")}
        cancelText={t("common.cancel")}
      />
    </>
  );
};
