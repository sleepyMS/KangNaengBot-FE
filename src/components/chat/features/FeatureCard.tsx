import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  isComingSoon?: boolean;
  isActive?: boolean;
}

export const FeatureCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  disabled = false,
  isComingSoon = false,
  isActive = false,
}: FeatureCardProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isComingSoon}
      className={`
        relative overflow-hidden group w-full text-left p-5
        flex flex-col justify-start items-start gap-3
        rounded-3xl transition-all duration-300 ease-out
        border
        
        ${
          disabled || isComingSoon
            ? "cursor-default opacity-80 border-white/60 dark:border-slate-700/50"
            : isActive
              ? "border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 cursor-pointer scale-[1.02]"
              : "border-white/60 dark:border-slate-700/50 hover:scale-[1.02] hover:border-primary-200 dark:hover:border-primary-800 cursor-pointer bg-white/40 dark:bg-slate-800/40"
        }
      `}
      style={{
        boxShadow: isActive
          ? "0px 0px 40px 0px rgba(59, 130, 246, 0.3)" // Blue shadow for active
          : "0px 0px 40px 0px rgba(105, 162, 255, 0.24)", // Default shadow
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
      }}
      aria-label={title}
    >
      {/* Icon Circle */}
      <div
        className={`
        w-10 h-10 rounded-2xl flex items-center justify-center shrink-0
        transition-colors duration-300
        ${
          isComingSoon
            ? "bg-gray-100/80 dark:bg-slate-700/80 text-gray-400 dark:text-gray-500"
            : "bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
        }
      `}
      >
        <Icon size={20} />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 w-full">
        <h3
          className={`
          font-bold text-lg leading-tight
          ${
            isComingSoon
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-800 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400"
          }
        `}
        >
          {title}
        </h3>
        <p
          className={`
          text-sm leading-snug
          ${
            isComingSoon
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
          }
        `}
        >
          {description}
        </p>
      </div>
    </button>
  );
};
