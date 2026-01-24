import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  isComingSoon?: boolean;
}

export const FeatureCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  disabled = false,
  isComingSoon = false,
}: FeatureCardProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isComingSoon}
      className={`
        relative overflow-hidden group w-full text-left p-5 min-h-[140px]
        flex flex-col justify-start gap-3
        rounded-2xl transition-all duration-300 ease-out
        border border-white/60 dark:border-slate-700/50
        
        ${
          disabled || isComingSoon
            ? "cursor-default opacity-80"
            : "hover:scale-[1.02] hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 cursor-pointer"
        }
        
        /* Glass Effect */
        bg-white/40 dark:bg-slate-800/40 backdrop-blur-md
        shadow-sm
      `}
      aria-label={title}
    >
      {/* Icon Circle */}
      <div
        className={`
        w-10 h-10 rounded-xl flex items-center justify-center
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
