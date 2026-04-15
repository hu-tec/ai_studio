import { FILTER_OPTIONS, FILTER_LABELS } from "./manuals-data";
import { X, ChevronRight } from "lucide-react";

interface FilterBarProps {
  selectedFilters: Record<string, string[]>;
  onFilterChange: (category: string, value: string) => void;
  onClearAll: () => void;
}

export function FilterBar({ selectedFilters, onFilterChange, onClearAll }: FilterBarProps) {
  const totalSelected = Object.values(selectedFilters).flat().length;

  const selHpBig = selectedFilters.homepage || [];
  const selHpMid = selectedFilters.homepageMid || [];

  const midOptions: string[] = [];
  for (const big of selHpBig) {
    const mids = FILTER_OPTIONS.homepageMid[big];
    if (mids) midOptions.push(...mids);
  }
  const showMid = midOptions.length > 0;

  const btnCls = (on: boolean) =>
    `px-1.5 py-px rounded text-[10px] border cursor-pointer transition-all ${
      on ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:bg-secondary"
    }`;

  return (
    <div className="bg-card border border-border rounded px-2.5 py-1 space-y-1.5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* 홈페이지 (대/중/소) */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">홈페이지</span>

          {/* 대분류 */}
          <div>
            <span className="text-[9px] text-muted-foreground/50 block mb-0.5">대</span>
            <div className="flex flex-wrap gap-0.5">
              {FILTER_OPTIONS.homepage.map((opt) => (
                <button key={opt} onClick={() => onFilterChange("homepage", opt)} className={btnCls(selHpBig.includes(opt))}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 중분류 */}
          {showMid && (
            <div>
              <div className="flex items-center gap-0.5 mb-0.5">
                <ChevronRight size={8} className="text-muted-foreground/40" />
                <span className="text-[9px] text-muted-foreground/50">중</span>
              </div>
              <div className="flex flex-wrap gap-0.5 pl-2">
                {midOptions.map((opt) => (
                  <button key={opt} onClick={() => onFilterChange("homepageMid", opt)} className={btnCls(selHpMid.includes(opt))}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 소분류 */}
          {selHpMid.length > 0 && (
            <div>
              <div className="flex items-center gap-0.5 mb-0.5">
                <ChevronRight size={8} className="text-muted-foreground/40" />
                <ChevronRight size={8} className="text-muted-foreground/40 -ml-1" />
                <span className="text-[9px] text-muted-foreground/50">소</span>
              </div>
              <p className="text-[9px] text-muted-foreground/40 italic pl-2">-- (향후 확장)</p>
            </div>
          )}
        </div>

        {/* 부서 */}
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">부서</span>
          <div className="flex flex-wrap gap-0.5">
            {FILTER_OPTIONS.department.map((opt) => (
              <button key={opt} onClick={() => onFilterChange("department", opt)} className={btnCls((selectedFilters.department || []).includes(opt))}>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* 인물 */}
        <div className="space-y-1">
          <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">인물</span>
          {(["employmentType", "role"] as const).map((cat) => (
            <div key={cat}>
              <span className="text-[9px] text-muted-foreground/50 block mb-0.5">{FILTER_LABELS[cat]}</span>
              <div className="flex flex-wrap gap-0.5">
                {FILTER_OPTIONS[cat].map((opt) => (
                  <button key={opt} onClick={() => onFilterChange(cat, opt)} className={btnCls((selectedFilters[cat] || []).includes(opt))}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 활성 칩 */}
      {totalSelected > 0 && (
        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-border">
          {Object.entries(selectedFilters).map(([category, values]) =>
            values.map((value) => (
              <button
                key={`${category}-${value}`}
                onClick={() => onFilterChange(category, value)}
                className="inline-flex items-center gap-0.5 px-1 py-px rounded text-[10px] bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
              >
                {value}<X size={8} />
              </button>
            ))
          )}
          <button onClick={onClearAll} className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer ml-1">초기화</button>
        </div>
      )}
    </div>
  );
}
