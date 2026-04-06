import { CATEGORY_DATA } from "./constants";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategorySelectorProps {
  big: string;
  mid: string;
  small: string;
  onChange: (field: "big" | "mid" | "small", value: string) => void;
}

function ColItem({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2.5 py-1 text-xs truncate transition-colors ${
        selected
          ? "bg-black text-white"
          : "hover:bg-[#f4f4f5] text-black"
      }`}
    >
      {label}
    </button>
  );
}

export function CategorySelector({ big, mid, small, onChange }: CategorySelectorProps) {
  const bigCategories = Object.keys(CATEGORY_DATA);
  const midCategories = big ? Object.keys(CATEGORY_DATA[big] || {}) : [];
  const smallCategories = big && mid ? CATEGORY_DATA[big]?.[mid] || [] : [];

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden flex h-40 bg-white">
      {/* Col 1: 대분류 */}
      <div className="flex-1 flex flex-col border-r border-gray-200 min-w-0">
        <div className="px-2.5 py-1 border-b border-gray-200 bg-[#f4f4f5] text-[10px] text-gray-500 shrink-0">
          대분류
        </div>
        <ScrollArea className="flex-1">
          {bigCategories.map((cat) => (
            <ColItem
              key={cat}
              label={cat}
              selected={big === cat}
              onClick={() => {
                onChange("big", cat);
                onChange("mid", "");
                onChange("small", "");
              }}
            />
          ))}
        </ScrollArea>
      </div>

      {/* Col 2: 중분류 */}
      <div className="flex-1 flex flex-col border-r border-gray-200 min-w-0">
        <div className="px-2.5 py-1 border-b border-gray-200 bg-[#f4f4f5] text-[10px] text-gray-500 shrink-0">
          중분류
        </div>
        <ScrollArea className="flex-1">
          {midCategories.length > 0 ? (
            midCategories.map((cat) => (
              <ColItem
                key={cat}
                label={cat}
                selected={mid === cat}
                onClick={() => {
                  onChange("mid", cat);
                  onChange("small", "");
                }}
              />
            ))
          ) : (
            <div className="p-2.5 text-[10px] text-gray-300 text-center">--</div>
          )}
        </ScrollArea>
      </div>

      {/* Col 3: 소분류 */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-2.5 py-1 border-b border-gray-200 bg-[#f4f4f5] text-[10px] text-gray-500 shrink-0">
          소분류
        </div>
        <ScrollArea className="flex-1">
          {smallCategories.length > 0 ? (
            smallCategories.map((cat) => (
              <ColItem
                key={cat}
                label={cat}
                selected={small === cat}
                onClick={() => onChange("small", cat)}
              />
            ))
          ) : (
            <div className="p-2.5 text-[10px] text-gray-300 text-center">--</div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
