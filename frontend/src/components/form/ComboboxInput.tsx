// frontend/src/components/form/ComboboxInput.tsx
import { useState, useRef, useEffect } from "react";

interface Props {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}

export default function ComboboxInput({
  id, value, onChange, onSelect, onKeyDown, onBlur,
  suggestions, placeholder, className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim()
    ? suggestions.filter(
        (s) => s.toLowerCase().includes(value.toLowerCase()) && s.toLowerCase() !== value.toLowerCase()
      )
    : suggestions;

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 left-0 w-full max-h-52 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl py-1">
          {filtered.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (onSelect) {
                    onSelect(s);
                  } else {
                    onChange(s);
                  }
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
