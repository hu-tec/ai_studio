import {
  TARGET_CLASSES,
  AGE_GROUPS,
  SITUATION_OPTIONS,
  NEEDS_OPTIONS,
  CHANNELS,
  AI_TOOLS,
  CONTENT_TYPES,
} from "./constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ToggleCheckboxGroup } from "./ToggleCheckboxGroup";

export interface PersonaState {
  targetClasses: string[];
  targetSubclasses: string[];
  ages: string[];
  activeSituations: Record<string, boolean>;
  situationSelections: Record<string, string[]>;
  activeNeeds: Record<string, boolean>;
  needsSelections: Record<string, string[]>;
  channels: string[];
  usedAi: string;
  contentType: string;
  exceptions: string;
}

interface PersonaBuilderProps {
  persona: PersonaState;
  onChange: (persona: PersonaState) => void;
}

export function PersonaBuilder({ persona, onChange }: PersonaBuilderProps) {
  const availableSubclasses: string[] = [];
  persona.targetClasses.forEach((cls) => {
    const subs = TARGET_CLASSES[cls] || [];
    subs.forEach((s) => {
      if (!availableSubclasses.includes(s)) availableSubclasses.push(s);
    });
  });

  const updateField = <K extends keyof PersonaState>(
    field: K,
    value: PersonaState[K]
  ) => {
    onChange({ ...persona, [field]: value });
  };

  const toggleTargetClass = (cls: string) => {
    const next = persona.targetClasses.includes(cls)
      ? persona.targetClasses.filter((c) => c !== cls)
      : [...persona.targetClasses, cls];
    const validSubs: string[] = [];
    next.forEach((c) => {
      (TARGET_CLASSES[c] || []).forEach((s) => {
        if (!validSubs.includes(s)) validSubs.push(s);
      });
    });
    const filteredSubs = persona.targetSubclasses.filter((s) =>
      validSubs.includes(s)
    );
    onChange({ ...persona, targetClasses: next, targetSubclasses: filteredSubs });
  };

  const toggleSubclass = (sub: string) => {
    const next = persona.targetSubclasses.includes(sub)
      ? persona.targetSubclasses.filter((s) => s !== sub)
      : [...persona.targetSubclasses, sub];
    updateField("targetSubclasses", next);
  };

  const toggleAge = (age: string) => {
    const next = persona.ages.includes(age)
      ? persona.ages.filter((a) => a !== age)
      : [...persona.ages, age];
    updateField("ages", next);
  };

  const toggleSituation = (category: string, active: boolean) => {
    const newActive = { ...persona.activeSituations, [category]: active };
    const newSelections = { ...persona.situationSelections };
    if (!active) delete newSelections[category];
    onChange({ ...persona, activeSituations: newActive, situationSelections: newSelections });
  };

  const toggleNeeds = (category: string, active: boolean) => {
    const newActive = { ...persona.activeNeeds, [category]: active };
    const newSelections = { ...persona.needsSelections };
    if (!active) delete newSelections[category];
    onChange({ ...persona, activeNeeds: newActive, needsSelections: newSelections });
  };

  const updateSituationItems = (category: string, items: string[]) => {
    onChange({
      ...persona,
      situationSelections: { ...persona.situationSelections, [category]: items },
    });
  };

  const updateNeedsItems = (category: string, items: string[]) => {
    onChange({
      ...persona,
      needsSelections: { ...persona.needsSelections, [category]: items },
    });
  };

  const toggleChannel = (channel: string) => {
    const newChannels = persona.channels.includes(channel)
      ? persona.channels.filter((c) => c !== channel)
      : [...persona.channels, channel];
    updateField("channels", newChannels);
  };

  return (
    <div className="space-y-2">
      {/* 타겟 대분류 / 세부분류 / 연령대 -- 3칼럼 */}
      <div className="grid grid-cols-3 gap-2">
        {/* 대분류 */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="px-2.5 py-1 bg-[#f4f4f5] border-b border-gray-200 text-[10px] text-gray-500">
            대분류
          </div>
          <div className="p-2 grid grid-cols-2 gap-x-1 gap-y-0.5">
            {Object.keys(TARGET_CLASSES).map((cls) => (
              <label key={cls} className="flex items-center gap-1 cursor-pointer">
                <Checkbox
                  checked={persona.targetClasses.includes(cls)}
                  onCheckedChange={() => toggleTargetClass(cls)}
                  className="size-3 rounded-sm border-gray-300"
                />
                <span className="text-xs truncate">{cls}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 세부분류 */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="px-2.5 py-1 bg-[#f4f4f5] border-b border-gray-200 text-[10px] text-gray-500">
            세부분류
          </div>
          <div className="p-2">
            {availableSubclasses.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                {availableSubclasses.map((sub) => (
                  <label key={sub} className="flex items-center gap-1 cursor-pointer">
                    <Checkbox
                      checked={persona.targetSubclasses.includes(sub)}
                      onCheckedChange={() => toggleSubclass(sub)}
                      className="size-3 rounded-sm border-gray-300"
                    />
                    <span className="text-xs truncate">{sub}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-gray-300">대분류 선택 시 표시</div>
            )}
          </div>
        </div>

        {/* 연령대 */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="px-2.5 py-1 bg-[#f4f4f5] border-b border-gray-200 text-[10px] text-gray-500">
            연령대
          </div>
          <div className="p-2 grid grid-cols-2 gap-x-1 gap-y-0.5">
            {AGE_GROUPS.map((age) => (
              <label key={age} className="flex items-center gap-1 cursor-pointer">
                <Checkbox
                  checked={persona.ages.includes(age)}
                  onCheckedChange={() => toggleAge(age)}
                  className="size-3 rounded-sm border-gray-300"
                />
                <span className="text-xs">{age}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 선택 뱃지 요약 */}
      {(persona.targetClasses.length > 0 || persona.ages.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {persona.targetClasses.map((cls) => (
            <Badge
              key={`c-${cls}`}
              variant="outline"
              className="text-[10px] py-0 px-1.5 cursor-pointer border-gray-300 hover:bg-[#f4f4f5]"
              onClick={() => toggleTargetClass(cls)}
            >
              {cls} x
            </Badge>
          ))}
          {persona.targetSubclasses.map((sub) => (
            <Badge
              key={`s-${sub}`}
              variant="outline"
              className="text-[10px] py-0 px-1.5 cursor-pointer border-gray-300 hover:bg-[#f4f4f5]"
              onClick={() => toggleSubclass(sub)}
            >
              {sub} x
            </Badge>
          ))}
          {persona.ages.map((age) => (
            <Badge
              key={`a-${age}`}
              variant="outline"
              className="text-[10px] py-0 px-1.5 cursor-pointer border-gray-300 hover:bg-[#f4f4f5]"
              onClick={() => toggleAge(age)}
            >
              {age} x
            </Badge>
          ))}
        </div>
      )}

      {/* 상황 + 니즈 -- 2칼럼 병렬 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <span className="text-xs text-gray-500">상황</span>
          <div className="space-y-1">
            {Object.entries(SITUATION_OPTIONS).map(([category, items]) => (
              <ToggleCheckboxGroup
                key={category}
                title={category}
                items={items}
                isActive={persona.activeSituations[category] || false}
                selectedItems={persona.situationSelections[category] || []}
                onToggle={(active) => toggleSituation(category, active)}
                onItemChange={(newItems) => updateSituationItems(category, newItems)}
              />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs text-gray-500">니즈</span>
          <div className="space-y-1">
            {Object.entries(NEEDS_OPTIONS).map(([category, items]) => (
              <ToggleCheckboxGroup
                key={category}
                title={category}
                items={items}
                isActive={persona.activeNeeds[category] || false}
                selectedItems={persona.needsSelections[category] || []}
                onToggle={(active) => toggleNeeds(category, active)}
                onItemChange={(newItems) => updateNeedsItems(category, newItems)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 채널 + AI/콘텐츠/예외 -- 2칼럼 */}
      <div className="grid grid-cols-2 gap-2">
        {/* 채널 */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="px-2.5 py-1 bg-[#f4f4f5] border-b border-gray-200 text-[10px] text-gray-500">
            홍보 채널
          </div>
          <div className="p-2 grid grid-cols-2 gap-x-1 gap-y-0.5">
            {CHANNELS.map((channel) => (
              <label key={channel} className="flex items-center gap-1 cursor-pointer">
                <Checkbox
                  checked={persona.channels.includes(channel)}
                  onCheckedChange={() => toggleChannel(channel)}
                  className="size-3 rounded-sm border-gray-300"
                />
                <span className="text-[10px] truncate">{channel}</span>
              </label>
            ))}
          </div>
        </div>

        {/* AI + 콘텐츠 + 예외 */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="px-2.5 py-1 bg-[#f4f4f5] border-b border-gray-200 text-[10px] text-gray-500">
            AI / 콘텐츠 / 예외
          </div>
          <div className="p-2 space-y-1.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-gray-500">AI 도구</span>
                <Select
                  value={persona.usedAi}
                  onValueChange={(v) => updateField("usedAi", v)}
                >
                  <SelectTrigger className="h-8 text-xs mt-0.5 border-gray-200 rounded-md">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_TOOLS.map((tool) => (
                      <SelectItem key={tool} value={tool} className="text-xs">
                        {tool}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="text-[10px] text-gray-500">콘텐츠</span>
                <Select
                  value={persona.contentType}
                  onValueChange={(v) => updateField("contentType", v)}
                >
                  <SelectTrigger className="h-8 text-xs mt-0.5 border-gray-200 rounded-md">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((ct) => (
                      <SelectItem key={ct} value={ct} className="text-xs">
                        {ct}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-gray-500">예외</span>
              <Input
                value={persona.exceptions}
                onChange={(e) => updateField("exceptions", e.target.value)}
                placeholder="예외사항 입력"
                className="h-8 text-xs mt-0.5 border-gray-200 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
