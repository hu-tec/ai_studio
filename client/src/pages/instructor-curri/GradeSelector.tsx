import { useMemo } from "react";
import {
  GRADE_FIELD_OPTIONS,
  GRADE_MID_OPTIONS,
  GRADE_LEVELS,
  GRADE_TARGETS,
} from "./constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface GradeSelectorProps {
  selectedField: string;
  selectedMid: string;
  selectedLevel: string;
  selectedTargets: string[];
  onFieldChange: (v: string) => void;
  onMidChange: (v: string) => void;
  onLevelChange: (v: string) => void;
  onTargetsChange: (v: string[]) => void;
}

export function GradeSelector({
  selectedField,
  selectedMid,
  selectedLevel,
  selectedTargets,
  onFieldChange,
  onMidChange,
  onLevelChange,
  onTargetsChange,
}: GradeSelectorProps) {
  const levels = selectedMid ? GRADE_LEVELS[selectedMid] ?? [] : [];

  const targets = useMemo(() => {
    if (!selectedMid || !selectedLevel) return [];
    return GRADE_TARGETS[selectedMid]?.[selectedLevel] ?? [];
  }, [selectedMid, selectedLevel]);

  const showTargets = !!selectedLevel && targets.length > 0;

  const handleFieldChange = (v: string) => {
    onFieldChange(v);
    onMidChange("");
    onLevelChange("");
    onTargetsChange([]);
  };

  const handleMidChange = (v: string) => {
    onMidChange(v);
    onLevelChange("");
    onTargetsChange([]);
  };

  const handleLevelChange = (v: string) => {
    onLevelChange(v);
    onTargetsChange([]);
  };

  const handleTargetToggle = (target: string) => {
    if (selectedTargets.includes(target)) {
      onTargetsChange(selectedTargets.filter((t) => t !== target));
    } else {
      onTargetsChange([...selectedTargets, target]);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {/* 분야 */}
        <div className="flex-1 min-w-0">
          <label className="text-[0.75rem] mb-0.5 block">🎯 분야</label>
          <Select value={selectedField} onValueChange={handleFieldChange}>
            <SelectTrigger className="w-full h-8 text-[0.75rem]">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_FIELD_OPTIONS.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-neutral-300 mt-1.5 text-[0.75rem]">→</span>

        {/* 중 */}
        <div className="flex-1 min-w-0">
          <label className="text-[0.75rem] mb-0.5 block">🏷️ 중</label>
          <Select value={selectedMid} onValueChange={handleMidChange} disabled={!selectedField}>
            <SelectTrigger className="w-full h-8 text-[0.75rem]">
              <SelectValue placeholder={!selectedField ? "—" : "선택"} />
            </SelectTrigger>
            <SelectContent>
              {GRADE_MID_OPTIONS.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-neutral-300 mt-1.5 text-[0.75rem]">→</span>

        {/* 급수 */}
        <div className="flex-1 min-w-0">
          <label className="text-[0.75rem] mb-0.5 block">🎓 급수</label>
          <Select value={selectedLevel} onValueChange={handleLevelChange} disabled={!selectedMid}>
            <SelectTrigger className="w-full h-8 text-[0.75rem]">
              <SelectValue placeholder={!selectedMid ? "—" : "선택"} />
            </SelectTrigger>
            <SelectContent>
              {levels.map((item) => (
                <SelectItem key={item} value={item}>{item}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 대상 선택 */}
      {showTargets && (
        <div className="border border-neutral-200 rounded-md p-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[0.75rem]">👥 대상</span>
            <span className="text-[0.625rem] border border-neutral-300 rounded-md px-1 py-0">{selectedMid} {selectedLevel}</span>
            {selectedTargets.length > 0 && (
              <span className="text-[0.625rem] bg-black text-white rounded-md px-1 py-0">{selectedTargets.length}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {targets.map((target) => (
              <label key={target} className="flex items-center gap-1 cursor-pointer text-[0.75rem]">
                <Checkbox
                  checked={selectedTargets.includes(target)}
                  onCheckedChange={() => handleTargetToggle(target)}
                />
                {target}
              </label>
            ))}
          </div>
        </div>
      )}

      {selectedLevel && targets.length === 0 && (
        <p className="text-[0.625rem] text-neutral-400">
          ⓘ {selectedMid} {selectedLevel} — 지정 대상 없음
        </p>
      )}
    </div>
  );
}
