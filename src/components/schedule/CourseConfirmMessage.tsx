/**
 * 과목 확인 메시지 컴포넌트
 * AI가 파싱한 과목을 사용자에게 확인받는 인라인 메시지
 */
import { useTranslation } from "react-i18next";
import { Check, AlertCircle, HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Course, AmbiguousCourse } from "@/types";
import { useScheduleStore } from "@/store";

interface CourseConfirmMessageProps {
  parsedCourses: Course[];
  ambiguousCourses: AmbiguousCourse[];
  notFoundCourses: string[];
  onConfirm: () => void;
  onModify: () => void;
}

export const CourseConfirmMessage = ({
  parsedCourses,
  ambiguousCourses,
  notFoundCourses,
  onConfirm,
  onModify,
}: CourseConfirmMessageProps) => {
  const { t } = useTranslation();
  const { selectAmbiguousCourse } = useScheduleStore();
  const [expandedAmbiguous, setExpandedAmbiguous] = useState<number | null>(
    null
  );

  // 모든 애매한 과목이 선택되었는지 확인
  const allAmbiguousResolved = ambiguousCourses.every(
    (amb) => amb.selectedIndex !== null
  );

  // 확인 가능 여부
  const canConfirm =
    (parsedCourses.length > 0 || allAmbiguousResolved) &&
    (ambiguousCourses.length === 0 || allAmbiguousResolved);

  return (
    <div className="bubble-ai max-w-lg">
      {/* 헤더 */}
      <div className="font-medium text-gray-900 dark:text-white mb-3">
        {t("schedule.confirm.title")}
      </div>

      {/* 찾은 과목 */}
      {parsedCourses.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
            <Check size={12} className="text-green-500" />
            {t("schedule.confirm.matched")}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {parsedCourses.map((course) => (
              <span
                key={course.id}
                className="px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm border border-green-200 dark:border-green-800"
              >
                {course.name}
                <span className="text-green-500 dark:text-green-500 ml-1 text-xs">
                  ({course.professor})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 선택 필요 과목 */}
      {ambiguousCourses.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
            <HelpCircle size={12} className="text-amber-500" />
            {t("schedule.confirm.ambiguous")}
          </div>
          <div className="space-y-2">
            {ambiguousCourses.map((amb, ambIndex) => (
              <div key={ambIndex}>
                <button
                  onClick={() =>
                    setExpandedAmbiguous(
                      expandedAmbiguous === ambIndex ? null : ambIndex
                    )
                  }
                  className="w-full px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-left flex items-center justify-between"
                >
                  <div>
                    <span className="text-amber-800 dark:text-amber-300 font-medium text-sm">
                      {amb.input}
                    </span>
                    {amb.selectedIndex !== null && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                        ✓ {amb.candidates[amb.selectedIndex].professor}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-amber-500 transition-transform ${
                      expandedAmbiguous === ambIndex ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* 분반 선택 드롭다운 */}
                {expandedAmbiguous === ambIndex && (
                  <div className="mt-1 p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 space-y-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t("schedule.confirm.selectClass")}
                    </div>
                    {amb.candidates.map((candidate, candIndex) => (
                      <button
                        key={candidate.id}
                        onClick={() => {
                          selectAmbiguousCourse(ambIndex, candIndex);
                          setExpandedAmbiguous(null);
                        }}
                        className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                          amb.selectedIndex === candIndex
                            ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                            : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <div className="font-medium">{candidate.code}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {candidate.professor} ·{" "}
                          {candidate.slots
                            .map(
                              (s) =>
                                `${s.day.charAt(0).toUpperCase()} ${
                                  s.startTime
                                }~${s.endTime}`
                            )
                            .join(", ")}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 찾지 못한 과목 */}
      {notFoundCourses.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
            <AlertCircle size={12} className="text-red-500" />
            {t("schedule.confirm.notFound")}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {notFoundCourses.map((name, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm border border-red-200 dark:border-red-800 line-through"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-slate-700">
        <button
          onClick={onModify}
          className="flex-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        >
          {t("schedule.confirm.modify")}
        </button>
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          className={`flex-1 px-4 py-2 text-sm text-white rounded-lg transition-colors ${
            canConfirm
              ? "bg-primary-500 hover:bg-primary-600"
              : "bg-gray-300 dark:bg-slate-600 cursor-not-allowed"
          }`}
        >
          {t("schedule.confirm.generate")}
        </button>
      </div>
    </div>
  );
};
