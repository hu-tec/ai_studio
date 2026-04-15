import { useState, useEffect, useCallback } from "react";
import {
  HOMEPAGES,
  type MarketingEntry,
  loadEntries,
  saveEntries,
} from "./constants";
import { CategorySelector } from "./CategorySelector";
import { PersonaBuilder, type PersonaState } from "./PersonaBuilder";
import { MarketingCopyForm, type MarketingCopy } from "./MarketingCopyForm";
import { SavedList } from "./SavedList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { toast } from "sonner";

const emptyPersona: PersonaState = {
  targetClasses: [],
  targetSubclasses: [],
  ages: [],
  activeSituations: {},
  situationSelections: {},
  activeNeeds: {},
  needsSelections: {},
  channels: [],
  usedAi: "",
  contentType: "",
  exceptions: "",
};

const emptyCopy: MarketingCopy = {
  headline: "",
  subcopy: "",
  hook: "",
  ai_prompt: "",
  points: {
    surveillance: "",
    evaluation: "",
    approval: "",
  },
};

export default function MarketingPage() {
  const [homepage, setHomepage] = useState<string>(HOMEPAGES[0]);
  const [category, setCategory] = useState({ big: "", mid: "", small: "" });
  const [persona, setPersona] = useState<PersonaState>(emptyPersona);
  const [copy, setCopy] = useState<MarketingCopy>(emptyCopy);
  const [entries, setEntries] = useState<MarketingEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>([]);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const resetForm = useCallback(() => {
    setCategory({ big: "", mid: "", small: "" });
    setPersona(emptyPersona);
    setCopy(emptyCopy);
    setEditingId(null);
  }, []);

  const handleSave = useCallback(() => {
    if (!homepage) {
      toast.error("홈페이지를 선택해주세요.");
      return;
    }

    const situations: Record<string, string[]> = {};
    Object.entries(persona.activeSituations).forEach(([cat, active]) => {
      if (active && persona.situationSelections[cat]?.length > 0) {
        situations[cat] = persona.situationSelections[cat];
      }
    });

    const needs: Record<string, string[]> = {};
    Object.entries(persona.activeNeeds).forEach(([cat, active]) => {
      if (active && persona.needsSelections[cat]?.length > 0) {
        needs[cat] = persona.needsSelections[cat];
      }
    });

    const now = new Date().toISOString();
    const entry: MarketingEntry = {
      id: editingId || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      homepage,
      category,
      target_persona: {
        classes: persona.targetClasses,
        subclasses: persona.targetSubclasses,
        ages: persona.ages,
        situations,
        needs,
        channel: persona.channels,
        used_ai: persona.usedAi,
        content_type: persona.contentType,
        exceptions: persona.exceptions,
      },
      marketing_copy: copy,
      created_at: editingId
        ? entries.find((e) => e.id === editingId)?.created_at || now
        : now,
      updated_at: now,
    };

    let newEntries: MarketingEntry[];
    if (editingId) {
      newEntries = entries.map((e) => (e.id === editingId ? entry : e));
      toast.success("수정 완료");
    } else {
      newEntries = [entry, ...entries];
      toast.success("저장 완료");
    }

    setEntries(newEntries);
    saveEntries(newEntries);
    resetForm();
  }, [homepage, category, persona, copy, editingId, entries, resetForm]);

  const handleEdit = useCallback((entry: MarketingEntry) => {
    setHomepage(entry.homepage);
    setCategory(entry.category);

    const activeSituations: Record<string, boolean> = {};
    const situationSelections: Record<string, string[]> = {};
    Object.entries(entry.target_persona.situations).forEach(([cat, items]) => {
      activeSituations[cat] = true;
      situationSelections[cat] = items;
    });

    const activeNeeds: Record<string, boolean> = {};
    const needsSelections: Record<string, string[]> = {};
    Object.entries(entry.target_persona.needs).forEach(([cat, items]) => {
      activeNeeds[cat] = true;
      needsSelections[cat] = items;
    });

    setPersona({
      targetClasses: entry.target_persona.classes,
      targetSubclasses: entry.target_persona.subclasses,
      ages: entry.target_persona.ages,
      activeSituations,
      situationSelections,
      activeNeeds,
      needsSelections,
      channels: entry.target_persona.channel,
      usedAi: entry.target_persona.used_ai,
      contentType: entry.target_persona.content_type,
      exceptions: entry.target_persona.exceptions,
    });

    setCopy(entry.marketing_copy);
    setEditingId(entry.id);
    setOpenSections(["category", "persona"]);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const newEntries = entries.filter((e) => e.id !== id);
      setEntries(newEntries);
      saveEntries(newEntries);
      toast.success("삭제 완료");
    },
    [entries]
  );

  const handleCategoryChange = (field: "big" | "mid" | "small", value: string) => {
    setCategory((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="size-full flex flex-col bg-white text-black overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 px-2 py-1.5 flex items-center gap-1 shrink-0">
        <span className="text-sm shrink-0">마케팅 타겟 DB</span>

        {/* Homepage pills */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {HOMEPAGES.map((hp) => (
            <button
              key={hp}
              onClick={() => setHomepage(hp)}
              className={`px-2.5 py-0.5 rounded-md text-xs whitespace-nowrap transition-colors border ${
                homepage === hp
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-[#f4f4f5]"
              }`}
            >
              {hp}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {editingId && (
            <Badge variant="outline" className="text-[10px] border-black mr-1">
              수정중
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 hover:bg-[#f4f4f5]"
            onClick={() => {
              resetForm();
              toast.info("초기화");
            }}
          >
            초기화
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs px-2 hover:bg-[#f4f4f5]"
            onClick={resetForm}
          >
            새로 작성
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs px-2 bg-black text-white hover:bg-gray-800 rounded-md"
            onClick={handleSave}
          >
            {editingId ? "수정" : "저장"}
          </Button>
          <span className="text-[10px] text-gray-400 ml-1">
            {entries.length}건
          </span>
        </div>
      </header>

      {/* Two-panel body */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* LEFT: Form */}
        <div className="w-[55%] border-r border-gray-200 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            {/* Collapsed settings: Category + Persona */}
            <div className="border-b border-gray-200">
              <Accordion
                type="multiple"
                value={openSections}
                onValueChange={setOpenSections}
              >
                <AccordionItem value="category" className="border-b border-gray-200">
                  <AccordionTrigger className="gap-1.5 px-2 py-1.5 hover:no-underline hover:bg-[#f4f4f5]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs">카테고리</span>
                      {category.big ? (
                        <Badge variant="outline" className="text-[10px] py-0 border-gray-300">
                          {category.big}
                          {category.mid ? ` > ${category.mid}` : ""}
                          {category.small ? ` > ${category.small}` : ""}
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-gray-300">--</span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-2.5">
                    <CategorySelector
                      big={category.big}
                      mid={category.mid}
                      small={category.small}
                      onChange={handleCategoryChange}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="persona" className="border-b-0">
                  <AccordionTrigger className="gap-1.5 px-2 py-1.5 hover:no-underline hover:bg-[#f4f4f5]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs">페르소나</span>
                      {persona.targetClasses.length > 0 ? (
                        <Badge variant="outline" className="text-[10px] py-0 border-gray-300">
                          {persona.targetClasses.join(", ")}
                          {persona.ages.length > 0
                            ? ` / ${persona.ages.join(", ")}`
                            : ""}
                        </Badge>
                      ) : (
                        <span className="text-[10px] text-gray-300">--</span>
                      )}
                      {persona.channels.length > 0 && (
                        <Badge variant="outline" className="text-[10px] py-0 border-gray-300">
                          채널 {persona.channels.length}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-2.5">
                    <PersonaBuilder persona={persona} onChange={setPersona} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Main area: Marketing Copy (always visible) */}
            <div className="p-1">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs">카피 작성</span>
                {copy.headline && (
                  <Badge variant="outline" className="text-[10px] py-0 max-w-60 truncate border-gray-300">
                    {copy.headline}
                  </Badge>
                )}
              </div>
              <MarketingCopyForm copy={copy} onChange={setCopy} />
            </div>
          </div>
        </div>

        {/* RIGHT: Saved List */}
        <div className="w-[45%] flex flex-col min-h-0">
          <div className="border-b border-gray-200 px-2 py-1.5 flex items-center justify-between shrink-0 bg-[#f4f4f5]">
            <span className="text-xs">저장 목록</span>
            <span className="text-[10px] text-gray-400">{entries.length}건</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <SavedList
                entries={entries}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
