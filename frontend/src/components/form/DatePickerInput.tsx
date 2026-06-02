// frontend/src/components/form/DatePickerInput.tsx
import { useState, useRef, useEffect } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function DatePickerInput({ id, value, onChange, placeholder = "Jan 2022" }: Props) {
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(() => {
    const match = value?.match(/\d{4}/);
    return match ? parseInt(match[0]) : new Date().getFullYear();
  });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleMonthSelect = (month: string) => {
    onChange(`${month} ${pickerYear}`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative flex items-center h-10 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent pl-3 pr-10 text-sm text-gray-800 dark:text-white placeholder-gray-400 outline-none"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          tabIndex={-1}
          aria-label="Open date picker"
          className="absolute right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl p-3">
          {/* Year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setPickerYear((y) => y - 1); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-800 dark:text-white">{pickerYear}</span>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setPickerYear((y) => y + 1); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-4 gap-1">
            {MONTHS.map((m) => (
              <button
                key={m}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleMonthSelect(m); }}
                className="rounded-md py-1.5 text-xs text-center text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {m}
              </button>
            ))}
          </div>

          {/* Present shortcut */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onChange("Present"); setOpen(false); }}
            className="mt-2 w-full rounded-md py-1.5 text-xs font-medium text-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 transition-colors"
          >
            Present
          </button>
        </div>
      )}
    </div>
  );
}
