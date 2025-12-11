interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = "" }: SkeletonProps) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
    />
  );
};

// 채팅 메시지 스켈레톤
export const MessageSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* AI 메시지 스켈레톤 */}
      <div className="flex gap-3 items-end animate-fade-in">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="max-w-[70%] space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* 사용자 메시지 스켈레톤 */}
      <div
        className="flex gap-3 flex-row-reverse animate-fade-in"
        style={{ animationDelay: "100ms" }}
      >
        <div className="max-w-[70%] space-y-2">
          <Skeleton className="h-4 w-40 ml-auto" />
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
      </div>

      {/* AI 메시지 스켈레톤 */}
      <div
        className="flex gap-3 items-end animate-fade-in"
        style={{ animationDelay: "200ms" }}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        <div className="max-w-[70%] space-y-2">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
};
