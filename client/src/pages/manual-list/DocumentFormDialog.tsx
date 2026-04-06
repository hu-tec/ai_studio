import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Eye, Info, Printer, Download, CheckCircle2,
  X, Lock, ShieldCheck, ToggleRight, ChevronDown, ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Manual } from "./manuals-data";
import {
  getDocumentTemplate, FieldItem, DepthSection, DocumentTemplate,
} from "./document-templates-data";

interface ActiveField { sectionIdx: number; depthKey: string; field: FieldItem; }

interface DocumentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manual: Manual | null;
}

export function DocumentFormDialog({ open, onOpenChange, manual }: DocumentFormDialogProps) {
  const template = useMemo(() => (manual ? getDocumentTemplate(manual.id) : null), [manual]);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [activeFields, setActiveFields] = useState<ActiveField[]>([]);
  const [collapsedDepths, setCollapsedDepths] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"preview" | "guide">("preview");

  useEffect(() => {
    if (!template) return;
    const init: ActiveField[] = [];
    ([1, 2] as const).forEach((si) => {
      const sec = template.sections[si] as DepthSection;
      sec.depths.forEach((depth) => {
        depth.suggestedFields.forEach((field) => {
          if (!init.some((a) => a.field.id === field.id)) {
            init.push({ sectionIdx: si, depthKey: depth.key, field });
          }
        });
      });
    });
    setActiveFields(init);
    setFormData({});
    setCollapsedDepths(new Set());
    setActiveTab("preview");
  }, [template]);

  const handleChange = useCallback((fid: string, v: string) => setFormData((p) => ({ ...p, [fid]: v })), []);

  const toggleField = useCallback((si: number, dk: string, field: FieldItem) => {
    setActiveFields((p) => {
      const exists = p.some((a) => a.field.id === field.id);
      if (exists) {
        setFormData((pp) => { const n = { ...pp }; delete n[field.id]; return n; });
        return p.filter((a) => a.field.id !== field.id);
      }
      return [...p, { sectionIdx: si, depthKey: dk, field }];
    });
  }, []);

  const toggleDepth = useCallback((k: string) => {
    setCollapsedDepths((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });
  }, []);

  const isActive = useCallback((fid: string) => activeFields.some((a) => a.field.id === fid), [activeFields]);

  if (!manual || !template) return null;

  const fixed = template.sections[0];
  const filledFixed = fixed.fields.filter((f) => formData[f.id]?.trim()).length;
  const totalFixed = fixed.fields.length;
  const pct = totalFixed > 0 ? Math.round((filledFixed / totalFixed) * 100) : 0;
  const getDepthFields = (si: number, dk: string) => activeFields.filter((a) => a.sectionIdx === si && a.depthKey === dk);

  const ic = "w-full px-2 py-1 text-[11px] rounded border border-border bg-input-background focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all";

  const renderInput = (fi: FieldItem) => {
    const v = formData[fi.id] || "";
    switch (fi.type) {
      case "textarea": return <textarea value={v} onChange={(e) => handleChange(fi.id, e.target.value)} placeholder={fi.placeholder} rows={2} className={`${ic} resize-y`} />;
      case "select": return <select value={v} onChange={(e) => handleChange(fi.id, e.target.value)} className={`${ic} cursor-pointer`}><option value="">선택</option>{fi.options?.map((o) => <option key={o}>{o}</option>)}</select>;
      case "date": return <input type="date" value={v} onChange={(e) => handleChange(fi.id, e.target.value)} className={`${ic} cursor-pointer`} />;
      case "number": return <input type="text" inputMode="numeric" value={v} onChange={(e) => handleChange(fi.id, e.target.value.replace(/[^0-9]/g, ""))} placeholder={fi.placeholder} className={ic} />;
      default: return <input type="text" value={v} onChange={(e) => handleChange(fi.id, e.target.value)} placeholder={fi.placeholder} className={ic} />;
    }
  };

  const fmtDate = (v: string) => { if (!v) return ""; const d = new Date(v); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`; };
  const fmtNum = (v: string) => v ? Number(v).toLocaleString("ko-KR") : "";
  const getDisplay = (fi: FieldItem) => { const v = formData[fi.id] || ""; if (!v) return null; if (fi.type === "date") return fmtDate(v); if (fi.type === "number") return `${fmtNum(v)}원`; return v; };

  const sectionMeta = [
    { color: "border-l-red-400",   icon: <Lock size={10} className="text-red-500" />,       tag: "A", tagCls: "text-red-600 bg-red-50" },
    { color: "border-l-amber-400", icon: <ShieldCheck size={10} className="text-amber-500" />, tag: "B", tagCls: "text-amber-600 bg-amber-50" },
    { color: "border-l-blue-300",  icon: <ToggleRight size={10} className="text-blue-400" />,  tag: "C", tagCls: "text-blue-600 bg-blue-50" },
  ];

  const depthDot: Record<string, string> = { common: "bg-gray-400", confirmed: "bg-green-500", adjustable: "bg-yellow-500", option: "bg-purple-400" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1440px] w-[95vw] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-3 py-2 border-b border-border flex-row items-center gap-2 space-y-0">
          <DialogTitle className="text-[11px] text-foreground truncate">{manual.title}</DialogTitle>
          <span className="px-1 py-px text-[9px] rounded bg-emerald-50 text-emerald-700 shrink-0">서류</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
            <span className="text-[9px] text-muted-foreground">{filledFixed}/{totalFixed}</span>
            <button onClick={() => window.print()} className="px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border rounded hover:bg-secondary/50 cursor-pointer"><Printer size={10} className="inline -mt-px" /></button>
            <button className="px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border rounded hover:bg-secondary/50 cursor-pointer"><Download size={10} className="inline -mt-px" /></button>
            <button disabled={filledFixed < totalFixed} className={`px-2 py-0.5 text-[10px] rounded cursor-pointer ${filledFixed >= totalFixed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}><CheckCircle2 size={10} className="inline -mt-px" /> 제출</button>
          </div>
        </DialogHeader>

        <div className="overflow-auto max-h-[calc(90vh-50px)] px-3 py-2">
          <div className="flex gap-2">
            {/* 좌: 폼 */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* A. 고정 */}
              <SectionBox meta={sectionMeta[0]} title="고정" desc="변경 불가 - 필수 입력">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-1.5">
                  {fixed.fields.map((fi) => (
                    <div key={fi.id} className={fi.type === "textarea" ? "col-span-2 lg:col-span-3 xl:col-span-4" : ""}>
                      <label className="block text-[10px] text-muted-foreground mb-0.5">{fi.label}<span className="text-red-500 ml-0.5">*</span></label>
                      {renderInput(fi)}
                    </div>
                  ))}
                </div>
              </SectionBox>

              {/* B, C */}
              {([1, 2] as const).map((si) => {
                const sec = template.sections[si] as DepthSection;
                const meta = sectionMeta[si];
                return (
                  <SectionBox key={si} meta={meta} title={si === 1 ? "준고정" : "선택"} desc={sec.description}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      {sec.depths.map((depth) => {
                        const dk = `${si}-${depth.key}`;
                        const closed = collapsedDepths.has(dk);
                        const depthActive = getDepthFields(si, depth.key);
                        const hasSug = depth.suggestedFields.length > 0;
                        return (
                          <div key={depth.key} className="border border-border rounded overflow-hidden flex flex-col">
                            <button onClick={() => toggleDepth(dk)} className="w-full flex items-center gap-1.5 px-2 py-1 bg-secondary/10 hover:bg-secondary/25 transition-colors cursor-pointer shrink-0">
                              {closed ? <ChevronRight size={10} className="text-muted-foreground" /> : <ChevronDown size={10} className="text-muted-foreground" />}
                              <span className={`w-1.5 h-1.5 rounded-full ${depthDot[depth.key]}`} />
                              <span className="text-[10px] text-foreground">{depth.label}</span>
                              <span className="text-[9px] text-muted-foreground/50 truncate">{depth.description}</span>
                              {depthActive.length > 0 && <span className="ml-auto text-[9px] px-1 rounded-full bg-primary/10 text-primary shrink-0">{depthActive.length}</span>}
                            </button>
                            {!closed && (
                              <div className="px-2 py-1.5 space-y-1.5 flex-1">
                                {hasSug && (
                                  <div className="flex flex-wrap gap-1">
                                    {depth.suggestedFields.map((sf) => {
                                      const on = isActive(sf.id);
                                      return (
                                        <button key={sf.id} onClick={() => toggleField(si, depth.key, sf)}
                                          className={`inline-flex items-center gap-0.5 px-1.5 py-px rounded-full text-[10px] border cursor-pointer transition-all ${on ? "bg-blue-50 text-blue-600 border-blue-200" : "text-muted-foreground/50 border-border/60 line-through hover:bg-secondary"}`}>
                                          {on ? <X size={8} /> : <span className="w-2 h-2 rounded-full border border-current" />}{sf.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                                {depthActive.length > 0 && (
                                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-3 gap-y-1.5">
                                    {depthActive.map((af) => (
                                      <div key={af.field.id} className={`group ${af.field.type === "textarea" ? "col-span-1 xl:col-span-2" : ""}`}>
                                        <div className="flex items-center justify-between mb-0.5">
                                          <span className="text-[10px] text-muted-foreground">{af.field.label}</span>
                                          <button onClick={() => toggleField(af.sectionIdx, af.depthKey, af.field)} className="text-muted-foreground/40 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"><X size={9} /></button>
                                        </div>
                                        {renderInput(af.field)}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {!hasSug && depthActive.length === 0 && <p className="text-[9px] text-muted-foreground/40 italic">항목 없음</p>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </SectionBox>
                );
              })}
            </div>

            {/* 우: 미리보기/안내 */}
            <div className="w-[380px] shrink-0 hidden lg:block">
              <div className="sticky top-0 space-y-1.5">
                <div className="flex bg-secondary/50 rounded p-px">
                  {(["preview", "guide"] as const).map((t) => (
                    <button key={t} onClick={() => setActiveTab(t)}
                      className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[10px] rounded cursor-pointer transition-all ${activeTab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                      {t === "preview" ? <><Eye size={10} />미리보기</> : <><Info size={10} />안내</>}
                    </button>
                  ))}
                </div>

                {activeTab === "preview" && (
                  <Preview title={manual.title} dept={manual.department.join(", ")} template={template} formData={formData} activeFields={activeFields} getDisplay={getDisplay} fmtDate={fmtDate} />
                )}

                {activeTab === "guide" && (
                  <GuidePanel template={template} manual={manual} />
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* SectionBox */
function SectionBox({ meta, title, desc, children }: { meta: { color: string; icon: React.ReactNode; tag: string; tagCls: string }; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className={`bg-card border border-border rounded overflow-hidden border-l-[3px] ${meta.color}`}>
      <div className="px-2.5 py-1.5 border-b border-border bg-secondary/10 flex items-center gap-1.5">
        {meta.icon}
        <span className={`text-[9px] px-1 py-px rounded ${meta.tagCls}`}>{meta.tag}</span>
        <span className="text-[11px] text-foreground">{title}</span>
        <span className="text-[9px] text-muted-foreground/50 ml-1 truncate">{desc}</span>
      </div>
      <div className="px-2.5 py-2">{children}</div>
    </div>
  );
}

/* GuidePanel */
function GuidePanel({ template, manual }: { template: DocumentTemplate; manual: { title: string; department: string[] } }) {
  return (
    <div className="bg-card border border-border rounded p-2.5 space-y-2.5 overflow-auto max-h-[calc(90vh-120px)] text-[10px]">
      <div>
        <span className="text-foreground text-[11px]">작성 안내</span>
        <ul className="mt-1 space-y-0.5">
          {template.guide.map((t, i) => <li key={i} className="flex gap-1.5 text-muted-foreground"><span className="text-primary shrink-0">{i+1}.</span>{t}</li>)}
        </ul>
      </div>
      <div className="border-t border-border pt-2 space-y-0.5">
        <span className="text-foreground">3단 구조</span>
        {[
          { c: "bg-red-400", l: "A 고정", d: "무조건 적용, OFF 불가" },
          { c: "bg-amber-400", l: "B 준고정", d: "기본 ON, 필요시 OFF (공통->확정->조절->옵션)" },
          { c: "bg-blue-300", l: "C 선택", d: "기본 ON, 필요시 OFF (공통->확정->조절->옵션)" },
        ].map((x) => (
          <div key={x.l} className="flex items-start gap-1.5 text-muted-foreground"><span className={`w-2 h-2 rounded-full ${x.c} shrink-0 mt-0.5`} /><span><span className="text-foreground">{x.l}</span> -- {x.d}</span></div>
        ))}
      </div>
      <div className="border-t border-border pt-2 text-muted-foreground">
        <p><span className="text-foreground">서류:</span> {manual.title}</p>
        <p><span className="text-foreground">부서:</span> {manual.department.join(", ")}</p>
      </div>
    </div>
  );
}

/* Preview */
function Preview({ title, dept, template, formData, activeFields, getDisplay, fmtDate }: {
  title: string; dept: string; template: DocumentTemplate; formData: Record<string, string>;
  activeFields: ActiveField[]; getDisplay: (fi: FieldItem) => string | null; fmtDate: (v: string) => string;
}) {
  const fixed = template.sections[0];
  const hasAny = Object.values(formData).some((v) => v?.trim());

  const groups: Record<string, { fi: FieldItem; val: string | null }[]> = {};
  for (const fi of fixed.fields) { const v = getDisplay(fi); if (v) (groups["고정"] ||= []).push({ fi, val: v }); }
  for (const af of activeFields) { const v = getDisplay(af.field); const l = af.sectionIdx === 1 ? "준고정" : "선택"; if (v) (groups[l] ||= []).push({ fi: af.field, val: v }); }

  const dateVal = formData.issueDate || formData.reportDate || formData.planDate || formData.counselDate || "";
  const nameVal = formData.name || formData.author || "";
  const allItems = [...(groups["고정"]||[]), ...(groups["준고정"]||[]), ...(groups["선택"]||[])];

  const thCls = "border border-[#333] bg-[#f2f2f2] px-2 py-1 text-[9px] text-[#333] text-left whitespace-nowrap align-top";
  const tdCls = "border border-[#333] px-2 py-1 text-[10px] text-[#111] align-top whitespace-pre-wrap";
  const emptyCell = "border border-[#333] px-2 py-1 text-[10px] text-[#ccc] italic";

  return (
    <div className="bg-white border border-border rounded shadow-sm overflow-auto max-h-[calc(90vh-120px)]">
      <div className="p-6 min-h-[520px] text-[#1a1a1a]" style={{ fontFamily: "'Noto Serif KR', 'Batang', serif" }}>
        <div className="border-2 border-[#333] p-5">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[8px] text-[#999] tracking-wider">문서번호 : ___-____-_____</span>
            <div className="text-right">
              <span className="text-[8px] text-[#999]">결재</span>
              <div className="mt-0.5 border border-[#999] w-[60px] h-[28px] grid grid-cols-2 grid-rows-2">
                <div className="border-r border-b border-[#999] flex items-center justify-center text-[7px] text-[#999]">담당</div>
                <div className="border-b border-[#999] flex items-center justify-center text-[7px] text-[#999]">팀장</div>
                <div className="border-r border-[#999]" />
                <div />
              </div>
            </div>
          </div>

          <div className="text-center my-5">
            <h1 className="text-[16px] tracking-[0.4em] text-[#111] border-b-2 border-t-2 border-[#333] py-2 inline-block px-6">{title}</h1>
          </div>

          <table className="w-full border-collapse mb-4">
            <tbody>
              <tr>
                <th className={thCls} style={{ width: "22%" }}>소속 부서</th>
                <td className={tdCls}>{dept || <span className="text-[#ccc]">-</span>}</td>
                <th className={thCls} style={{ width: "22%" }}>작성일</th>
                <td className={tdCls}>{dateVal ? fmtDate(dateVal) : <span className="text-[#ccc]">____. __. __.</span>}</td>
              </tr>
              {nameVal && (
                <tr>
                  <th className={thCls}>성명 / 작성자</th>
                  <td className={tdCls} colSpan={3}>{nameVal}</td>
                </tr>
              )}
            </tbody>
          </table>

          {!hasAny ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 rounded border-2 border-dashed border-[#ddd] flex items-center justify-center mb-3">
                <Eye size={20} className="text-[#ccc]" />
              </div>
              <p className="text-[10px] text-[#bbb]">좌측 양식에 내용을 입력하시면</p>
              <p className="text-[10px] text-[#bbb]">실시간으로 문서가 작성됩니다.</p>
            </div>
          ) : (
            <>
              <table className="w-full border-collapse mb-4">
                <thead>
                  <tr>
                    <th className={`${thCls} text-center`} style={{ width: "26%" }}>항 목</th>
                    <th className={`${thCls} text-center`}>내 용</th>
                  </tr>
                </thead>
                <tbody>
                  {allItems.map(({ fi, val }) => (
                    <tr key={fi.id}>
                      <th className={thCls}>{fi.label}</th>
                      <td className={val ? tdCls : emptyCell}>{val || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {allItems.filter(({ fi }) => fi.type === "textarea").map(({ fi, val }) => val && (
                <div key={fi.id} className="mb-3">
                  <div className="text-[9px] text-[#666] bg-[#f2f2f2] border border-[#333] border-b-0 px-2 py-0.5">{fi.label}</div>
                  <div className="border border-[#333] px-3 py-2 text-[10px] min-h-[40px] whitespace-pre-wrap">{val}</div>
                </div>
              ))}
            </>
          )}

          <div className="mt-8 text-center space-y-3">
            <p className="text-[10px] text-[#444]">위 내용이 사실과 다름없음을 확인합니다.</p>
            <div className="mt-5 space-y-0.5">
              <p className="text-[10px] text-[#666]">{dateVal ? fmtDate(dateVal) : "____년  __월  __일"}</p>
            </div>
            <div className="mt-4 flex justify-end items-center gap-3 pr-4">
              <span className="text-[10px] text-[#444]">작 성 자 :</span>
              <span className="text-[10px] text-[#111] border-b border-[#333] px-3 min-w-[80px] inline-block text-center">{nameVal || ""}</span>
              <span className="text-[9px] text-[#999]">(인)</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[8px] text-[#bbb] tracking-[0.3em]">{dept}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
