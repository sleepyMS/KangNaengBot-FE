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
        relative overflow-hidden group w-full text-left 
        p-4 md:p-5 
        min-w-[160px] md:min-w-0
        flex flex-col justify-start items-start gap-3
        rounded-2xl md:rounded-3xl transition-all duration-300 ease-out
        border
        
        ${
          disabled || isComingSoon
            ? "cursor-default opacity-80 border-white/60 dark:border-slate-700/50"
            : isActive
              ? "border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 cursor-pointer scale-[1.02] shadow-[0_0_15px_0_rgba(59,130,246,0.3)] md:shadow-[0_0_40px_0_rgba(59,130,246,0.3)]"
              : "border-white/60 dark:border-slate-700/50 hover:scale-[1.02] hover:border-primary-200 dark:hover:border-primary-800 cursor-pointer bg-white/40 dark:bg-slate-800/40 shadow-[0_0_15px_0_rgba(105,162,255,0.24)] md:shadow-[0_0_40px_0_rgba(105,162,255,0.24)]"
        }
        backdrop-blur-[28px]
      `}
      aria-label={title}
    >
      {/* Icon Circle */}
      <div
        className={`
        w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0
        transition-colors duration-300
        ${
          isComingSoon
            ? "bg-gray-100/80 dark:bg-slate-700/80 text-gray-400 dark:text-gray-500"
            : "bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
        }
      `}
      >
        <Icon size={18} className="md:w-5 md:h-5" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-0.5 md:gap-1 w-full">
        <h3
          className={`
          font-bold text-base leading-tight
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
          text-xs md:text-sm leading-snug line-clamp-2 md:line-clamp-none
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
