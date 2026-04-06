import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface ToggleCheckboxGroupProps {
  title: string;
  items: string[];
  selectedItems: string[];
  isActive: boolean;
  onToggle: (active: boolean) => void;
  onItemChange: (items: string[]) => void;
}

export function ToggleCheckboxGroup({
  title,
  items,
  selectedItems,
  isActive,
  onToggle,
  onItemChange,
}: ToggleCheckboxGroupProps) {
  const handleCheckChange = (item: string, checked: boolean) => {
    if (checked) {
      onItemChange([...selectedItems, item]);
    } else {
      onItemChange(selectedItems.filter((i) => i !== item));
    }
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div
        className="flex items-center justify-between px-2.5 py-1 bg-[#f4f4f5] cursor-pointer"
        onClick={() => onToggle(!isActive)}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{title}</span>
          {isActive && selectedItems.length > 0 && (
            <span className="text-[10px] bg-black text-white rounded-md px-1.5 leading-[16px]">
              {selectedItems.length}
            </span>
          )}
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="scale-75 origin-right"
        />
      </div>
      {isActive && (
        <div className="px-2.5 py-1.5 grid grid-cols-4 gap-x-2 gap-y-0.5">
          {items.map((item) => (
            <label
              key={item}
              className="flex items-center gap-1 cursor-pointer"
            >
              <Checkbox
                checked={selectedItems.includes(item)}
                onCheckedChange={(checked) =>
                  handleCheckChange(item, checked === true)
                }
                className="size-3 rounded-sm border-gray-300"
              />
              <span className="text-[10px] leading-tight truncate text-black">
                {item}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
