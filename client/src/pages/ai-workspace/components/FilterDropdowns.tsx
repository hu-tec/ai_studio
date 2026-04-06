import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { FIELD_A_CATEGORIES } from "../data/categories";

function Dropdown({
  label,
  options,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => !disabled && setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-white text-[13px] min-w-[120px] justify-between transition-colors ${
          disabled
            ? "border-gray-100 text-gray-300 cursor-not-allowed"
            : "border-gray-200 text-gray-700 hover:border-gray-300 cursor-pointer"
        }`}
      >
        <span className="truncate">{value || placeholder || label}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""} ${disabled ? "text-gray-100" : "text-gray-400"}`} />
      </button>
      {open && !disabled && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-50 min-w-[160px] py-1 max-h-[300px] overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-[12px] text-gray-400">데이터가 없습니다.</div>
          ) : (
            options.map((opt) => (
              <div
                key={opt}
                className={`px-4 py-2 text-[13px] cursor-pointer hover:bg-slate-50 transition-colors ${
                  opt === value ? "text-blue-600 bg-blue-50/50 font-bold" : "text-gray-600 font-medium"
                }`}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function FilterDropdowns() {
  const [large, setLarge] = useState("문서");
  const [middle, setMiddle] = useState("법률");
  const [small, setSmall] = useState("형사");

  const largeOptions = FIELD_A_CATEGORIES.map(c => c.large);
  const currentLarge = FIELD_A_CATEGORIES.find(c => c.large === large);
  const middleOptions = currentLarge?.middle.map(m => m.name) || [];
  const currentMiddle = currentLarge?.middle.find(m => m.name === middle);
  const smallOptions = currentMiddle?.small || [];

  const handleLargeChange = (v: string) => {
    setLarge(v);
    const newLarge = FIELD_A_CATEGORIES.find(c => c.large === v);
    if (newLarge && newLarge.middle.length > 0) {
      setMiddle(newLarge.middle[0].name);
      if (newLarge.middle[0].small.length > 0) {
        setSmall(newLarge.middle[0].small[0]);
      } else {
        setSmall("");
      }
    } else {
      setMiddle("");
      setSmall("");
    }
  };

  const handleMiddleChange = (v: string) => {
    setMiddle(v);
    const newMiddle = currentLarge?.middle.find(m => m.name === v);
    if (newMiddle && newMiddle.small.length > 0) {
      setSmall(newMiddle.small[0]);
    } else {
      setSmall("");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dropdown
        label="대분류"
        options={largeOptions}
        value={large}
        onChange={handleLargeChange}
      />
      <Dropdown
        label="중분류"
        options={middleOptions}
        value={middle}
        onChange={handleMiddleChange}
        disabled={middleOptions.length === 0}
        placeholder="중분류"
      />
      <Dropdown
        label="소분류"
        options={smallOptions}
        value={small}
        onChange={setSmall}
        disabled={smallOptions.length === 0}
        placeholder="소분류"
      />
      <button className="px-5 py-1.5 bg-slate-900 text-white text-[13px] font-bold rounded-md hover:bg-slate-800 transition-all shadow-sm active:scale-95">
        프리셋
      </button>
    </div>
  );
}
