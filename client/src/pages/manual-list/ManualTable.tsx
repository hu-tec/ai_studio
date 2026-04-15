import { Manual } from "./manuals-data";
import { ExternalLink, PenLine } from "lucide-react";

interface ManualTableProps {
  manuals: Manual[];
  totalCount: number;
  onDocumentOpen: (manual: Manual) => void;
}

const HP_CLR: Record<string, string> = {
  교육: "text-blue-600",
  번역: "text-purple-600",
  문서: "text-amber-600",
  전시회: "text-teal-600",
};

export function ManualTable({ manuals, totalCount, onDocumentOpen }: ManualTableProps) {
  if (manuals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-1 text-center">
        <p className="text-[11px] text-muted-foreground">검색 조건에 맞는 항목이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded overflow-x-auto bg-card">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-border bg-secondary/40">
            {[
              { label: "홈페이지", w: "8%" },
              { label: "부서", w: "18%" },
              { label: "고용형태", w: "11%" },
              { label: "직군/특성", w: "14%" },
              { label: "제목", w: "auto" },
            ].map((col) => (
              <th key={col.label} className="text-left px-2 py-1 text-[10px] text-muted-foreground/70 uppercase tracking-wider" style={{ width: col.w }}>
                {col.label}
              </th>
            ))}
            <th className="w-5" />
          </tr>
        </thead>
        <tbody>
          {manuals.map((m, i) => (
            <tr
              key={m.id}
              className={`group cursor-pointer transition-colors hover:bg-primary/[0.03] ${i % 2 === 0 ? "" : "bg-secondary/15"}`}
              onClick={() => {
                if (m.type === "서류") {
                  onDocumentOpen(m);
                } else {
                  window.open(m.url, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <td className="px-2 py-1">
                <div className="flex gap-1">
                  {m.homepage.map((t) => (
                    <span key={t} className={`text-[10px] ${HP_CLR[t] || "text-gray-500"}`}>{t}</span>
                  ))}
                  {m.homepageMid && m.homepageMid.length > 0 && (
                    <span className="text-[9px] text-muted-foreground/50">· {m.homepageMid.join(", ")}</span>
                  )}
                </div>
              </td>
              <td className="px-2 py-1 text-[11px] text-muted-foreground truncate max-w-0">{m.department.join(", ")}</td>
              <td className="px-2 py-1 text-[11px] text-muted-foreground">{m.employmentType.join(", ")}</td>
              <td className="px-2 py-1 text-[11px] text-muted-foreground">{m.role.join(", ")}</td>
              <td className="px-2 py-1">
                <span className="text-[11px] text-foreground group-hover:text-primary transition-colors">{m.title}</span>
              </td>
              <td className="px-1.5 py-1 text-center">
                {m.type === "서류"
                  ? <PenLine size={10} className="text-emerald-500 inline-block" />
                  : <ExternalLink size={10} className="text-muted-foreground inline-block" />
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
