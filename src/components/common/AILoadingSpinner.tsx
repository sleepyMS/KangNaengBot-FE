// 로딩 컴포넌트
export const AILoadingSpinner = () => {
  return (
    <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* 애니메이션 배경 그라데이션 */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(78, 146, 255, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
        }}
      />

      {/* 움직이는 그리드 라인 */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="w-full h-full opacity-[0.03]">
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="#4E92FF"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* 떠다니는 파티클 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary-400/20 blur-sm"
            style={{
              width: `${8 + Math.random() * 16}px`,
              height: `${8 + Math.random() * 16}px`,
              left: `${10 + ((i * 7) % 80)}%`,
              top: `${10 + ((i * 11) % 80)}%`,
              animation: `float ${4 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* 글로우 효과 오브 */}
      <div
        className="absolute w-[500px] h-[500px] -top-48 -right-48 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(78, 146, 255, 0.4) 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] -bottom-32 -left-32 rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
          animation: "pulse 5s ease-in-out infinite",
          animationDelay: "1s",
        }}
      />

      {/* 중앙 컨텐츠 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex flex-col items-center gap-6">
          {/* 외부 회전 링들 */}
          <div className="relative w-28 h-28">
            {/* 가장 바깥 링 */}
            <div
              className="absolute inset-0 rounded-full border-2 border-dashed border-primary-200/50 animate-spin"
              style={{ animationDuration: "8s" }}
            />

            {/* 두 번째 링 - 반대로 회전 */}
            <div
              className="absolute inset-2 rounded-full border border-primary-300/30 animate-spin"
              style={{ animationDuration: "6s", animationDirection: "reverse" }}
            />

            {/* 그라데이션 회전 링 */}
            <div className="absolute inset-4">
              <svg
                className="w-full h-full animate-spin"
                style={{ animationDuration: "3s" }}
                viewBox="0 0 100 100"
              >
                <defs>
                  <linearGradient
                    id="ring-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#4E92FF" stopOpacity="0" />
                    <stop offset="30%" stopColor="#4E92FF" stopOpacity="1" />
                    <stop offset="70%" stopColor="#8B5CF6" stopOpacity="1" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#ring-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="80 180"
                />
              </svg>
            </div>

            {/* 펄스 효과 */}
            <div
              className="absolute inset-6 rounded-full bg-primary-400/10 animate-ping"
              style={{ animationDuration: "2s" }}
            />

            {/* 로고 컨테이너 */}
            <div className="absolute inset-6 rounded-full bg-white dark:bg-slate-900 shadow-xl shadow-primary-200/50 dark:shadow-primary-900/30 flex items-center justify-center border border-white/50 dark:border-slate-700">
              <img
                src="/assets/images/logo.svg"
                alt="강냉봇"
                className="w-10 h-10"
                style={{ animation: "pulse 2s ease-in-out infinite" }}
              />
            </div>
          </div>

          {/* 로딩 텍스트 */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span className="text-sm font-medium tracking-wide">
                대화를 불러오는 중
              </span>
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"
                    style={{
                      animationDelay: `${i * 150}ms`,
                      animationDuration: "1s",
                    }}
                  />
                ))}
              </span>
            </div>
          </div>

          {/* 하단 데코레이션 - 파형 */}
          <div className="flex items-end gap-1 h-8">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-primary-400 to-primary-300 rounded-full"
                style={{
                  height: `${12 + Math.sin(i * 0.7) * 10}px`,
                  animation: "wave 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS 애니메이션 정의 */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.8); }
        }
      `}</style>
    </div>
  );
};
