import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

export const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder = "선택",
  disabled = false,
  label,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지하여 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-6">
      {label && (
        <label className="w-16 text-sm text-gray-500 flex-shrink-0">
          {label}
        </label>
      )}
      <div ref={dropdownRef} className="flex-1 relative">
        {/* 트리거 버튼 */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 bg-gray-100/80 rounded-xl
            flex items-center justify-between
            focus:outline-none focus:ring-2 focus:ring-primary-400/30
            transition-all text-left
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-100"
            }
            ${isOpen ? "ring-2 ring-primary-400/30" : ""}
          `}
        >
          <span className={value ? "text-gray-800" : "text-gray-400"}>
            {value || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* 드롭다운 메뉴 */}
        {isOpen && options.length > 0 && (
          <div
            className="absolute z-50 w-full mt-2 py-2 rounded-xl overflow-hidden animate-fade-in"
            style={{
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow:
                "0px 4px 24px rgba(0, 0, 0, 0.1), 0px 0px 40px rgba(105, 162, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              maxHeight: "240px",
              overflowY: "auto",
            }}
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  w-[calc(100%-8px)] mx-1 px-3 py-2.5 text-left text-sm rounded-lg
                  flex items-center justify-between
                  transition-all duration-150
                  ${
                    value === option
                      ? "bg-gradient-to-r from-primary-50 to-blue-50 text-primary-600 font-medium"
                      : "text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                  }
                `}
              >
                <span>{option}</span>
                {value === option && (
                  <Check size={16} className="text-primary-500" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* 드롭다운 열렸을 때 오버레이 */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
