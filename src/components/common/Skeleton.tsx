interface SkeletonProps {
  className?: string;
}

// 스켈레톤 기본 컴포넌트 - 시머 애니메이션
export const Skeleton = ({ className = "" }: SkeletonProps) => {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200/80 dark:bg-gray-700/80 rounded ${className}`}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
        }}
      />
    </div>
  );
};

// AI 메시지 버블 스켈레톤 (실제 bubble-ai 스타일 적용)
const AIBubbleSkeleton = ({ lineCount = 3 }: { lineCount?: number }) => {
  // 다양한 너비로 자연스러운 텍스트 느낌
  const lineWidths = [
    "w-48 sm:w-56",
    "w-56 sm:w-72",
    "w-40 sm:w-48",
    "w-32 sm:w-40",
  ];

  return (
    <div className="flex gap-3 items-end">
      {/* AI 아바타 - 로고 자리 */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center overflow-hidden">
        <Skeleton className="w-5 h-5 rounded-full" />
      </div>
      {/* 메시지 버블 */}
      <div className="bubble-ai min-w-[200px] sm:min-w-[280px]">
        <div className="space-y-2.5">
          {Array.from({ length: lineCount }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-3.5 ${
                lineWidths[i % lineWidths.length]
              } max-w-full rounded-full`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// 사용자 메시지 버블 스켈레톤 (실제 bubble-user 스타일 적용)
const UserBubbleSkeleton = ({ lineCount = 2 }: { lineCount?: number }) => {
  const lineWidths = ["w-32 sm:w-40", "w-24 sm:w-32"];

  return (
    <div className="flex gap-3 flex-row-reverse">
      {/* 메시지 버블 - 사용자 스타일 (어두운 배경에 밝은 스켈레톤) */}
      <div className="bg-gray-800 rounded-2xl rounded-br-md px-4 py-3 min-w-[120px] sm:min-w-[160px]">
        <div className="space-y-2.5">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div
              key={i}
              className={`relative overflow-hidden bg-gray-600 rounded-full h-3.5 ${
                lineWidths[i % lineWidths.length]
              } max-w-full`}
            >
              <div
                className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 채팅 메시지 스켈레톤 (전체 대화 형태)
export const MessageSkeleton = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 첫 번째 AI 메시지 */}
      <AIBubbleSkeleton lineCount={3} />

      {/* 사용자 응답 */}
      <UserBubbleSkeleton lineCount={1} />

      {/* 두 번째 AI 메시지 (더 긴 응답) */}
      <AIBubbleSkeleton lineCount={4} />
    </div>
  );
};
