import { useMemo } from "react";
import { CATEGORY_TREE } from "./constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategorySelectorProps {
  selectedLarge: string;
  selectedMedium: string;
  selectedSmall: string;
  onLargeChange: (v: string) => void;
  onMediumChange: (v: string) => void;
  onSmallChange: (v: string) => void;
}

export function CategorySelector({
  selectedLarge,
  selectedMedium,
  selectedSmall,
  onLargeChange,
  onMediumChange,
  onSmallChange,
}: CategorySelectorProps) {
  const largeItems = useMemo(() => CATEGORY_TREE.map((n) => n.name), []);

  const mediumItems = useMemo(() => {
    if (!selectedLarge) return [];
    const node = CATEGORY_TREE.find((n) => n.name === selectedLarge);
    return node?.children?.map((c) => c.name) ?? [];
  }, [selectedLarge]);

  const smallItems = useMemo(() => {
    if (!selectedLarge || !selectedMedium) return [];
    const largeNode = CATEGORY_TREE.find((n) => n.name === selectedLarge);
    const midNode = largeNode?.children?.find((c) => c.name === selectedMedium);
    return midNode?.children?.map((c) => c.name) ?? [];
  }, [selectedLarge, selectedMedium]);

  const handleLargeChange = (v: string) => {
    onLargeChange(v);
    onMediumChange("");
    onSmallChange("");
  };

  const handleMediumChange = (v: string) => {
    onMediumChange(v);
    onSmallChange("");
  };

  const hasMedium = mediumItems.length > 0;
  const hasSmall = smallItems.length > 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {/* 대 */}
        <div className="flex-1 min-w-0">
          <label className="text-[0.75rem] mb-0.5 block">📂 대</label>
          <Select value={selectedLarge} onValueChange={handleLargeChange}>
            <SelectTrigger className="w-full h-8 text-[0.75rem]">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              {largeItems.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-neutral-300 mt-1.5 text-[0.75rem]">→</span>

        {/* 중 */}
        <div className="flex-1 min-w-0">
          <label className="text-[0.75rem] mb-0.5 block">🏷️ 중</label>
          <Select value={selectedMedium} onValueChange={handleMediumChange} disabled={!hasMedium}>
            <SelectTrigger className="w-full h-8 text-[0.75rem]">
              <SelectValue placeholder={!selectedLarge ? "—" : hasMedium ? "선택" : "없음"} />
            </SelectTrigger>
            <SelectContent>
              {mediumItems.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-neutral-300 mt-1.5 text-[0.75rem]">→</span>

        {/* 소 */}
        <div className="flex-1 min-w-0">
          <label className="text-[0.75rem] mb-0.5 block">📌 소</label>
          <Select value={selectedSmall} onValueChange={onSmallChange} disabled={!hasSmall}>
            <SelectTrigger className="w-full h-8 text-[0.75rem]">
              <SelectValue placeholder={!selectedMedium ? "—" : hasSmall ? "선택" : "없음"} />
            </SelectTrigger>
            <SelectContent>
              {smallItems.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 선택 요약 */}
      {selectedLarge && selectedMedium && (
        <div className="text-[0.625rem] text-neutral-500">
          📌 {selectedLarge} › {selectedMedium}
          {selectedSmall && <> › {selectedSmall}</>}
          {!hasSmall && selectedMedium && <span className="text-neutral-300"> (소 없음)</span>}
        </div>
      )}
    </div>
  );
}
