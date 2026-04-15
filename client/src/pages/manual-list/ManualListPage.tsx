import { useState, useMemo, useCallback } from "react";
import { Search, X } from "lucide-react";
import { manuals, Manual, FILTER_OPTIONS } from "./manuals-data";
import { FilterBar } from "./FilterBar";
import { ManualTable } from "./ManualTable";
import { DocumentFormDialog } from "./DocumentFormDialog";
import { CounselingFormDialog } from "./CounselingFormDialog";

type Filters = Record<string, string[]>;

export default function ManualListPage() {
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<"전체" | "매뉴얼" | "서류">("전체");
  const [selectedFilters, setSelectedFilters] = useState<Filters>({
    homepage: [],
    homepageMid: [],
    homepageSub: [],
    department: [],
    employmentType: [],
    role: [],
  });

  // Dialog state for document forms
  const [selectedDocument, setSelectedDocument] = useState<Manual | null>(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [counselingDialogOpen, setCounselingDialogOpen] = useState(false);

  const handleDocumentOpen = useCallback((manual: Manual) => {
    setSelectedDocument(manual);
    if (manual.id === "67") {
      setCounselingDialogOpen(true);
    } else {
      setDocumentDialogOpen(true);
    }
  }, []);

  const handleFilterChange = useCallback(
    (category: string, value: string) => {
      setSelectedFilters((prev) => {
        const current = prev[category] || [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        const next = { ...prev, [category]: updated };

        // 대분류 해제 시 -> 해당 중분류도 해제
        if (category === "homepage") {
          const removedBig = current.includes(value) ? value : null;
          if (removedBig) {
            const mids = FILTER_OPTIONS.homepageMid[removedBig] || [];
            next.homepageMid = (next.homepageMid || []).filter((m) => !mids.includes(m));
          }
        }

        return next;
      });
    },
    []
  );

  const handleClearAll = useCallback(() => {
    setSelectedFilters({ homepage: [], homepageMid: [], homepageSub: [], department: [], employmentType: [], role: [] });
    setKeyword("");
  }, []);

  const filteredManuals = useMemo(() => {
    const filtered = manuals.filter((manual) => {
      if (typeFilter !== "전체" && manual.type !== typeFilter) return false;
      if (keyword.trim()) {
        if (!manual.title.toLowerCase().includes(keyword.trim().toLowerCase())) return false;
      }

      // 홈페이지 대분류
      const selBig = selectedFilters.homepage;
      if (selBig && selBig.length > 0) {
        if (!selBig.some((s) => manual.homepage.includes(s))) return false;
      }

      // 홈페이지 중분류
      const selMid = selectedFilters.homepageMid;
      if (selMid && selMid.length > 0) {
        const manualMids = manual.homepageMid || [];
        if (manualMids.length > 0) {
          if (!selMid.some((s) => manualMids.includes(s))) return false;
        }
      }

      // 부서, 고용형태, 직군
      const otherMap: Record<string, keyof typeof manual> = {
        department: "department", employmentType: "employmentType", role: "role",
      };
      for (const [fk, mk] of Object.entries(otherMap)) {
        const sel = selectedFilters[fk];
        if (sel && sel.length > 0) {
          const vals = manual[mk] as string[];
          if (!sel.some((s) => vals.includes(s))) return false;
        }
      }

      return true;
    });

    filtered.sort((a, b) => {
      const cmp = (arrA: string[], arrB: string[]) => arrA.join(", ").localeCompare(arrB.join(", "), "ko");
      let r = cmp(a.homepage, b.homepage); if (r) return r;
      r = cmp(a.department, b.department); if (r) return r;
      r = cmp(a.employmentType, b.employmentType); if (r) return r;
      r = cmp(a.role, b.role); if (r) return r;
      return a.title.localeCompare(b.title, "ko");
    });
    return filtered;
  }, [keyword, typeFilter, selectedFilters]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-[1440px] mx-auto px-2 h-9 flex items-center gap-1">
          <span className="text-[11px] text-muted-foreground shrink-0 tracking-wide uppercase">Admin · 매뉴얼/서류</span>

          <div className="relative flex-1 max-w-xs">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="제목 검색..."
              className="w-full pl-2 pr-2 py-1 text-[11px] rounded border border-border bg-input-background focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
            />
            {keyword && (
              <button onClick={() => setKeyword("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={10} />
              </button>
            )}
          </div>

          <div className="flex items-center bg-secondary/60 rounded p-px shrink-0">
            {(["전체", "매뉴얼", "서류"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2 py-0.5 text-[10px] rounded cursor-pointer transition-all ${
                  typeFilter === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <span className="text-[10px] text-muted-foreground ml-auto">
            {filteredManuals.length}<span className="text-muted-foreground/60">/{manuals.length}</span>
          </span>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-2 py-1 space-y-1.5">
        <FilterBar selectedFilters={selectedFilters} onFilterChange={handleFilterChange} onClearAll={handleClearAll} />
        <ManualTable manuals={filteredManuals} totalCount={manuals.length} onDocumentOpen={handleDocumentOpen} />
      </div>

      {/* Document Form Dialog (generic) */}
      <DocumentFormDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        manual={selectedDocument}
      />

      {/* Counseling Form Dialog (id=67) */}
      <CounselingFormDialog
        open={counselingDialogOpen}
        onOpenChange={setCounselingDialogOpen}
        manual={selectedDocument}
      />
    </div>
  );
}
