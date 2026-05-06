// frontend/src/components/form/PhoneInput.tsx
import { useState, useEffect, useRef } from "react";

interface Country {
  code: string;
  dial: string;
  name: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: "AU", dial: "+61",  name: "Australia",      flag: "🇦🇺" },
  { code: "US", dial: "+1",   name: "United States",  flag: "🇺🇸" },
  { code: "GB", dial: "+44",  name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", dial: "+1",   name: "Canada",         flag: "🇨🇦" },
  { code: "NZ", dial: "+64",  name: "New Zealand",    flag: "🇳🇿" },
  { code: "SG", dial: "+65",  name: "Singapore",      flag: "🇸🇬" },
  { code: "IN", dial: "+91",  name: "India",          flag: "🇮🇳" },
  { code: "CN", dial: "+86",  name: "China",          flag: "🇨🇳" },
  { code: "JP", dial: "+81",  name: "Japan",          flag: "🇯🇵" },
  { code: "KR", dial: "+82",  name: "South Korea",    flag: "🇰🇷" },
  { code: "MY", dial: "+60",  name: "Malaysia",       flag: "🇲🇾" },
  { code: "PH", dial: "+63",  name: "Philippines",    flag: "🇵🇭" },
  { code: "ID", dial: "+62",  name: "Indonesia",      flag: "🇮🇩" },
  { code: "TH", dial: "+66",  name: "Thailand",       flag: "🇹🇭" },
  { code: "VN", dial: "+84",  name: "Vietnam",        flag: "🇻🇳" },
  { code: "HK", dial: "+852", name: "Hong Kong",      flag: "🇭🇰" },
  { code: "TW", dial: "+886", name: "Taiwan",         flag: "🇹🇼" },
  { code: "PK", dial: "+92",  name: "Pakistan",       flag: "🇵🇰" },
  { code: "BD", dial: "+880", name: "Bangladesh",     flag: "🇧🇩" },
  { code: "LK", dial: "+94",  name: "Sri Lanka",      flag: "🇱🇰" },
  { code: "DE", dial: "+49",  name: "Germany",        flag: "🇩🇪" },
  { code: "FR", dial: "+33",  name: "France",         flag: "🇫🇷" },
  { code: "IT", dial: "+39",  name: "Italy",          flag: "🇮🇹" },
  { code: "ES", dial: "+34",  name: "Spain",          flag: "🇪🇸" },
  { code: "NL", dial: "+31",  name: "Netherlands",    flag: "🇳🇱" },
  { code: "SE", dial: "+46",  name: "Sweden",         flag: "🇸🇪" },
  { code: "NO", dial: "+47",  name: "Norway",         flag: "🇳🇴" },
  { code: "CH", dial: "+41",  name: "Switzerland",    flag: "🇨🇭" },
  { code: "PL", dial: "+48",  name: "Poland",         flag: "🇵🇱" },
  { code: "RU", dial: "+7",   name: "Russia",         flag: "🇷🇺" },
  { code: "TR", dial: "+90",  name: "Turkey",         flag: "🇹🇷" },
  { code: "AE", dial: "+971", name: "UAE",            flag: "🇦🇪" },
  { code: "SA", dial: "+966", name: "Saudi Arabia",   flag: "🇸🇦" },
  { code: "ZA", dial: "+27",  name: "South Africa",   flag: "🇿🇦" },
  { code: "NG", dial: "+234", name: "Nigeria",        flag: "🇳🇬" },
  { code: "KE", dial: "+254", name: "Kenya",          flag: "🇰🇪" },
  { code: "GH", dial: "+233", name: "Ghana",          flag: "🇬🇭" },
  { code: "EG", dial: "+20",  name: "Egypt",          flag: "🇪🇬" },
  { code: "BR", dial: "+55",  name: "Brazil",         flag: "🇧🇷" },
  { code: "MX", dial: "+52",  name: "Mexico",         flag: "🇲🇽" },
  { code: "AR", dial: "+54",  name: "Argentina",      flag: "🇦🇷" },
  { code: "CO", dial: "+57",  name: "Colombia",       flag: "🇨🇴" },
];

// Country-aware local number formatter
function formatLocal(digits: string, dial: string): string {
  // Strip leading 0 for countries where it's a trunk prefix (AU, GB, etc.)
  const d = (dial === "+61" || dial === "+44" || dial === "+64") && digits.startsWith("0")
    ? digits.slice(1)
    : digits;

  if (dial === "+61") {
    // AU mobile: 4XX XXX XXX  landline: X XXXX XXXX
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)}`;
  }
  if (dial === "+1") {
    // US/CA: XXX XXX XXXX
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 10)}`;
  }
  if (dial === "+44") {
    // UK: XXXX XXXXXX
    if (d.length <= 4) return d;
    return `${d.slice(0, 4)} ${d.slice(4, 10)}`;
  }
  // Generic: 3-3-4
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 10)} ${d.slice(10)}`;
}

function parsePhone(raw: string): { country: Country; local: string } {
  const defaultCountry = COUNTRIES[0];
  if (!raw) return { country: defaultCountry, local: "" };
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (raw.startsWith(c.dial)) {
      return { country: c, local: raw.slice(c.dial.length).replace(/^\s+/, "") };
    }
  }
  return { country: defaultCountry, local: raw };
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
}

export default function PhoneInput({ value, onChange, id, required }: Props) {
  const { country: initCountry, local: initLocal } = parsePhone(value);
  const [selectedCountry, setSelectedCountry] = useState<Country>(initCountry);
  const [localNumber, setLocalNumber] = useState(initLocal);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const { country, local } = parsePhone(value);
    setSelectedCountry(country);
    setLocalNumber(local);
  // only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const emit = (country: Country, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const formatted = formatLocal(digits, country.dial);
    onChange(digits ? `${country.dial} ${formatted}` : "");
  };

  const handleCountrySelect = (c: Country) => {
    setSelectedCountry(c);
    setDropdownOpen(false);
    setSearch("");
    // Re-format existing number for the new country
    const digits = localNumber.replace(/\D/g, "");
    const formatted = formatLocal(digits, c.dial);
    setLocalNumber(formatted);
    emit(c, localNumber);
    inputRef.current?.focus();
  };

  const handleLocalChange = (v: string) => {
    const digits = v.replace(/\D/g, "");
    const formatted = formatLocal(digits, selectedCountry.dial);
    setLocalNumber(formatted);
    emit(selectedCountry, v);
  };

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const placeholder =
    selectedCountry.dial === "+61" ? "412 345 678" :
    selectedCountry.dial === "+1"  ? "555 123 4567" :
    selectedCountry.dial === "+44" ? "7700 900123" :
    "XXX XXX XXXX";

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Unified input group — single border, no gap */}
      <div className="flex h-10 w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500">
        {/* Country button */}
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex shrink-0 items-center gap-1.5 border-r border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-750"
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{selectedCountry.dial}</span>
          <svg className="h-3 w-3 shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Number input */}
        <input
          ref={inputRef}
          id={id}
          type="tel"
          inputMode="tel"
          required={required}
          value={localNumber}
          onChange={(e) => handleLocalChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-gray-800 placeholder-gray-400 outline-none dark:text-white"
        />
      </div>

      {/* Country dropdown */}
      {dropdownOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl">
          <div className="border-b border-gray-100 dark:border-gray-800 p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country…"
              autoFocus
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-2.5 py-1.5 text-xs text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    c.code === selectedCountry.code
                      ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="shrink-0 font-mono text-xs text-gray-400">{c.dial}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-xs text-gray-400">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
