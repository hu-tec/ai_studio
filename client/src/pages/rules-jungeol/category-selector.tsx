import { categoryTree } from "./rule-data";

interface CategorySelectorProps {
  major: string;
  mid: string;
  minor: string;
  onMajorChange: (v: string) => void;
  onMidChange: (v: string) => void;
  onMinorChange: (v: string) => void;
}

function ColumnHeader({ label }: { label: string }) {
  return (
    <div className="px-2 py-1 bg-[#f4f4f5] border-b border-gray-200 text-[10px] text-gray-500 tracking-wide shrink-0">
      {label}
    </div>
  );
}

function ColumnItem({
  label,
  isSelected,
  hasChildren,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  hasChildren?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-2 py-1 text-[12px] text-left transition-colors cursor-pointer ${
        isSelected
          ? "bg-black text-white"
          : "text-black hover:bg-[#f4f4f5]"
      }`}
    >
      <span className="truncate">{label}</span>
      {hasChildren && (
        <span className={`text-[10px] shrink-0 ml-1 ${isSelected ? "text-white/50" : "text-gray-300"}`}>›</span>
      )}
    </button>
  );
}

export function CategorySelector({
  major,
  mid,
  minor,
  onMajorChange,
  onMidChange,
  onMinorChange,
}: CategorySelectorProps) {
  const majors = Object.keys(categoryTree);
  const mids = Object.keys(categoryTree[major] || {});
  const minors = categoryTree[major]?.[mid] || [];

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden bg-white flex divide-x divide-gray-200 h-[100px]">
      <div className="flex-1 flex flex-col min-w-0">
        <ColumnHeader label="대분류" />
        <div className="flex-1 overflow-y-auto">
          {majors.map((m) => (
            <ColumnItem key={m} label={m} isSelected={m === major} hasChildren onClick={() => onMajorChange(m)} />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <ColumnHeader label="중분류" />
        <div className="flex-1 overflow-y-auto">
          {mids.map((m) => (
            <ColumnItem key={m} label={m} isSelected={m === mid} hasChildren onClick={() => onMidChange(m)} />
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <ColumnHeader label="소분류" />
        <div className="flex-1 overflow-y-auto">
          {minors.map((m) => (
            <ColumnItem key={m} label={m} isSelected={m === minor} onClick={() => onMinorChange(m)} />
          ))}
        </div>
      </div>
    </div>
  );
}
