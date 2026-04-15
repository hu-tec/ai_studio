import React from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

interface CategoryCardProps {
  title: string;
  emoji: string;
  items: string[];
  selectedItems: string[];
  onToggleItem: (item: string) => void;
  onToggleAll: (checked: boolean) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  emoji,
  items,
  selectedItems,
  onToggleItem,
  onToggleAll,
}) => {
  const isAllSelected = items.every((item) => selectedItems.includes(item));
  const isSomeSelected = items.some((item) => selectedItems.includes(item)) && !isAllSelected;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-slate-50 p-2 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{emoji}</span>
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox.Root
            className={`flex h-5 w-5 appearance-none items-center justify-center rounded border outline-none transition-colors ${
              isAllSelected ? "bg-slate-900 border-slate-900" : isSomeSelected ? "bg-slate-400 border-slate-400" : "bg-white border-slate-300 hover:border-slate-400"
            }`}
            checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
            onCheckedChange={onToggleAll}
          >
            <Checkbox.Indicator className="text-white">
              <Check size={14} strokeWidth={3} />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">전체</span>
        </div>
      </div>
      <div className="p-2 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-3 group cursor-pointer" onClick={() => onToggleItem(item)}>
            <Checkbox.Root
              className={`flex h-5 w-5 appearance-none items-center justify-center rounded border outline-none transition-colors ${
                selectedItems.includes(item) ? "bg-slate-700 border-slate-700" : "bg-white border-slate-300 group-hover:border-slate-400"
              }`}
              checked={selectedItems.includes(item)}
              onCheckedChange={() => onToggleItem(item)}
            >
              <Checkbox.Indicator className="text-white">
                <Check size={14} strokeWidth={3} />
              </Checkbox.Indicator>
            </Checkbox.Root>
            <span className={`text-sm transition-colors ${selectedItems.includes(item) ? "text-slate-900 font-medium" : "text-slate-600 group-hover:text-slate-900"}`}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
