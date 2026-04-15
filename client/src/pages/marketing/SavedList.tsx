import { useState } from "react";
import { type MarketingEntry } from "./constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SavedListProps {
  entries: MarketingEntry[];
  onEdit: (entry: MarketingEntry) => void;
  onDelete: (id: string) => void;
}

export function SavedList({ entries, onEdit, onDelete }: SavedListProps) {
  const [search, setSearch] = useState("");
  const [detailEntry, setDetailEntry] = useState<MarketingEntry | null>(null);
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = entries
    .filter((entry) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        entry.homepage.toLowerCase().includes(q) ||
        entry.category.big.toLowerCase().includes(q) ||
        entry.category.mid.toLowerCase().includes(q) ||
        entry.category.small.toLowerCase().includes(q) ||
        entry.target_persona.classes.some((c: string) => c.toLowerCase().includes(q)) ||
        entry.marketing_copy.headline.toLowerCase().includes(q) ||
        entry.marketing_copy.hook.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.updated_at).getTime();
      const dateB = new Date(b.updated_at).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs">🔍</span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색..."
            className="pl-7 h-8 text-xs border-gray-200 rounded-md"
          />
        </div>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="text-xs text-gray-400 hover:text-black shrink-0 px-1.5 py-0.5 border border-gray-200 rounded-md hover:bg-[#f4f4f5] transition-colors"
        >
          {sortAsc ? "↑ 오래된순" : "↓ 최신순"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-1">
          <span className="text-sm opacity-30 mb-2">📋</span>
          <span className="text-xs text-gray-400">
            {entries.length === 0 ? "저장된 데이터 없음" : "검색 결과 없음"}
          </span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 rounded-md p-2 hover:bg-[#f4f4f5] transition-colors cursor-pointer group"
              onClick={() => setDetailEntry(entry)}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap mb-0.5">
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-gray-300">
                      {entry.homepage}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-gray-300">
                      {entry.category.big}
                      {entry.category.mid && ` › ${entry.category.mid}`}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-gray-300">
                      {entry.target_persona.classes.join(",")}
                    </Badge>
                  </div>
                  <p className="text-xs truncate text-black">
                    {entry.marketing_copy.headline || "(헤드라인 없음)"}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    📅 {new Date(entry.updated_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    className="text-xs hover:bg-white rounded-md px-1.5 py-0.5 border border-transparent hover:border-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(entry);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="text-xs hover:bg-red-50 text-red-500 rounded-md px-1.5 py-0.5 border border-transparent hover:border-red-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(entry.id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!detailEntry} onOpenChange={() => setDetailEntry(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] p-2 rounded-md">
          <DialogHeader className="pb-1.5">
            <DialogTitle className="text-sm">
              📌 {detailEntry?.marketing_copy.headline || "상세 보기"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              {detailEntry?.homepage} · {detailEntry?.category.big} › {detailEntry?.category.mid} › {detailEntry?.category.small}
            </DialogDescription>
          </DialogHeader>
          {detailEntry && (
            <ScrollArea className="max-h-[60vh] pr-2">
              <div className="space-y-2">
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="px-2.5 py-1 bg-[#f4f4f5] border-b border-gray-200 text-xs text-gray-500">
                    ① 🎯 타겟 페르소나
                  </div>
                  <div className="p-2.5">
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">👥 </span>
                        {detailEntry.target_persona.classes.join(", ")}
                        {detailEntry.target_persona.subclasses.length > 0 &&
                          ` — ${detailEntry.target_persona.subclasses.join(", ")}`}
                      </div>
                      <div>
                        <span className="text-gray-400">🎂 </span>
                        {detailEntry.target_persona.ages.join(", ") || "—"}
                      </div>
                      <div>
                        <span className="text-gray-400">🤖 </span>
                        {detailEntry.target_persona.used_ai || "—"}
                      </div>
                      <div>
                        <span className="text-gray-400">🎬 </span>
                        {detailEntry.target_persona.content_type || "—"}
                      </div>
                    </div>

                    {detailEntry.target_persona.channel.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-gray-400">📡</span>
                        {detailEntry.target_persona.channel.map((ch: string) => (
                          <Badge key={ch} variant="outline" className="text-[10px] py-0 px-1.5 border-gray-300">
                            {ch}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {Object.keys(detailEntry.target_persona.situations).length > 0 && (
                      <div className="mt-2">
                        <span className="text-[10px] text-gray-400">📍 상황</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {Object.entries(detailEntry.target_persona.situations).map(
                            ([cat, items]) =>
                              (items as string[]).map((item: string) => (
                                <Badge key={`${cat}-${item}`} variant="outline" className="text-[10px] py-0 px-1.5 border-gray-300">
                                  {item}
                                </Badge>
                              ))
                          )}
                        </div>
                      </div>
                    )}

                    {Object.keys(detailEntry.target_persona.needs).length > 0 && (
                      <div className="mt-2">
                        <span className="text-[10px] text-gray-400">💡 니즈</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {Object.entries(detailEntry.target_persona.needs).map(
                            ([cat, items]) =>
                              (items as string[]).map((item: string) => (
                                <Badge key={`${cat}-${item}`} variant="outline" className="text-[10px] py-0 px-1.5 border-gray-300">
                                  {item}
                                </Badge>
                              ))
                          )}
                        </div>
                      </div>
                    )}

                    {detailEntry.target_persona.exceptions && (
                      <div className="mt-2 text-xs">
                        <span className="text-gray-400">⚠️ </span>
                        {detailEntry.target_persona.exceptions}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="px-2.5 py-1 bg-[#f4f4f5] border-b border-gray-200 text-xs text-gray-500">
                    ② 📝 마케팅 카피
                  </div>
                  <div className="p-2.5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400">📢 헤드라인</span>
                        <p className="mt-0.5">{detailEntry.marketing_copy.headline || "—"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400">🪝 후킹</span>
                        <p className="mt-0.5">{detailEntry.marketing_copy.hook || "—"}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs">
                      <span className="text-[10px] text-gray-400">💬 서브카피</span>
                      <p className="mt-0.5">{detailEntry.marketing_copy.subcopy || "—"}</p>
                    </div>
                    {detailEntry.marketing_copy.ai_prompt && (
                      <div className="mt-2">
                        <span className="text-[10px] text-gray-400">🤖 AI 지시문</span>
                        <p className="mt-0.5 text-[10px] bg-[#f4f4f5] rounded-md p-2 whitespace-pre-wrap">
                          {detailEntry.marketing_copy.ai_prompt}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="border border-gray-200 rounded-md p-2">
                    <span className="text-[10px] text-gray-400">👁️ 감시</span>
                    <p className="text-xs mt-0.5">
                      {detailEntry.marketing_copy.points.surveillance || "—"}
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-md p-2">
                    <span className="text-[10px] text-gray-400">📋 평가</span>
                    <p className="text-xs mt-0.5">
                      {detailEntry.marketing_copy.points.evaluation || "—"}
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-md p-2">
                    <span className="text-[10px] text-gray-400">✅ 승인</span>
                    <p className="text-xs mt-0.5">
                      {detailEntry.marketing_copy.points.approval || "—"}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400">
                  📅 생성 {new Date(detailEntry.created_at).toLocaleString("ko-KR")} · 수정 {new Date(detailEntry.updated_at).toLocaleString("ko-KR")}
                </div>
              </div>
            </ScrollArea>
          )}
          {detailEntry && (
            <div className="flex justify-end gap-1.5 pt-1.5 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2 rounded-md border-gray-200 hover:bg-[#f4f4f5]"
                onClick={() => {
                  onEdit(detailEntry);
                  setDetailEntry(null);
                }}
              >
                ✏️ 수정
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs px-2 rounded-md"
                onClick={() => {
                  onDelete(detailEntry.id);
                  setDetailEntry(null);
                }}
              >
                🗑️ 삭제
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
