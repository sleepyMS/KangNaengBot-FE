import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export type DropdownOption = {
  label: string;
  value: string;
};

interface CustomDropdownProps {
  options: (string | DropdownOption)[];
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

  // Normalize options to DropdownOption[]
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  // Find selected option label
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

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

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-6">
      {label && (
        <label className="w-16 text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
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
            w-full px-4 py-3 bg-gray-100/80 dark:bg-slate-800 rounded-xl
            flex items-center justify-between
            focus:outline-none focus:ring-2 focus:ring-primary-400/30
            transition-all text-left
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
            }
            ${isOpen ? "ring-2 ring-primary-400/30" : ""}
          `}
        >
          <span
            className={
              selectedOption
                ? "text-gray-800 dark:text-gray-100"
                : "text-gray-400 dark:text-gray-500"
            }
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* 드롭다운 메뉴 */}
        {isOpen && normalizedOptions.length > 0 && (
          <div
            className="absolute z-50 w-full mt-2 py-2 rounded-xl overflow-hidden animate-fade-in glass-modal"
            style={{
              maxHeight: "240px",
              overflowY: "auto",
            }}
          >
            {normalizedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  dropdown-item w-[calc(100%-8px)] mx-1 px-3 py-2.5 text-left text-sm rounded-lg
                  flex items-center justify-between
                  transition-all duration-150
                  ${
                    value === option.value
                      ? "bg-gradient-to-r from-primary-500 to-blue-600 text-white font-medium"
                      : "text-gray-700 dark:text-gray-200 hover:bg-primary-50"
                  }
                `}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <Check size={16} className="text-white" />
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
