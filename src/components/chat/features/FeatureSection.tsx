import { useTranslation } from "react-i18next";
import { Calendar, Mail } from "lucide-react";
import { useScheduleStore, useUIStore, useEmailStore } from "@/store";
import { FeatureCard } from "./FeatureCard";

export const FeatureSection = () => {
  const { t } = useTranslation();
  const { enterScheduleMode, exitScheduleMode, isScheduleMode } =
    useScheduleStore();
  const { isMobile } = useUIStore();

  const { enterEmailMode, isEmailMode, exitEmailMode } = useEmailStore();

  const handleCreateSchedule = () => {
    if (isScheduleMode) {
      exitScheduleMode();
    } else {
      enterScheduleMode();
      // 이메일 모드가 켜져있다면 끄기
      if (isEmailMode) exitEmailMode();
    }
  };

  const handleCreateEmail = () => {
    if (isEmailMode) {
      exitEmailMode();
    } else {
      enterEmailMode();
      // 시간표 모드가 켜져있다면 끄기
      if (isScheduleMode) exitScheduleMode();
    }
  };

  const features = [
    {
      id: "schedule",
      title: t("schedule.createSchedule", "시간표 만들기"),
      description: t(
        "schedule.createScheduleDesc",
        "AI가 최적의 시간표를 만들어 줄게요",
      ),
      icon: Calendar,
      onClick: handleCreateSchedule,
      isComingSoon: false,
    },
    {
      id: "email",
      title: t("chat.feature.email", "이메일 작성"),
      description: t(
        "chat.feature.emailDesc",
        "교수님 기분 상하지 않게 메일 쓰는 법",
      ),
      icon: Mail,
      onClick: handleCreateEmail,
      isComingSoon: false,
    },
    // 앱 심사를 위해 임시 숨김 처리
    // {
    //   id: "coming-soon-1",
    //   title: t("chat.feature.new", "새로운 기능"),
    //   description: t("chat.feature.newDesc", "새로운 기능이 추가될 예정이에요"),
    //   icon: Lock,
    //   isComingSoon: true,
    // },
  ];

  return (
    <div className="w-full max-w-4xl md:w-[60%] md:max-w-[33.6rem] mx-auto px-1 mt-6 mb-8">
      {isMobile ? (
        // Mobile Layout: Horizontal Scroll (Carousel)
        <div className="flex flex-row gap-3 overflow-x-auto py-4 px-4 -mx-4 scrollbar-hide snap-x snap-mandatory">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="snap-start shrink-0 first:pl-1 last:pr-1"
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                onClick={feature.onClick}
                isComingSoon={feature.isComingSoon}
                isActive={
                  (feature.id === "schedule" && isScheduleMode) ||
                  (feature.id === "email" && isEmailMode)
                }
              />
            </div>
          ))}
        </div>
      ) : (
        // Desktop Layout: Grid
        <div className="grid grid-cols-3 gap-5">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              onClick={feature.onClick}
              isComingSoon={feature.isComingSoon}
              isActive={
                (feature.id === "schedule" && isScheduleMode) ||
                (feature.id === "email" && isEmailMode)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
