import React, { useState, useCallback } from "react";
import {
  Eye, Info, Printer, Download, CheckCircle2,
  Plus, X, Trash2, Lock, ShieldCheck, ToggleRight, ChevronDown, ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Manual } from "./manuals-data";

/* Types */
interface FI { id: string; label: string; type: "text"|"date"|"textarea"|"select"|"number"|"time"; placeholder?: string; options?: string[]; span?: number; }
interface HistRow { id: string; status: string; date: string; time: string; counselor: string; category: string; courseType: string; result: string; nextCall: string; memo: string; }
interface PayRow { id: string; category: string; payDate: string; status: string; realCourse: string; amount: string; discount: string; method: string; installment: string; cardCompany: string; approvalNo: string; refundDate: string; memo: string; }

/* Constants */
const CAT = ["전체(Gen)","상담/상담예약","배정","기타","QnL","가상이체"];
const H_STATUS = ["신규","재상담","등록완료","보류","취소","이관"];
const C_TYPE_OPT = ["온라인 상담","방문 상담","전화 상담","불만 접수","레벨테스트 예약","레벨테스트 완료","수강 문의","환불/변경"];
const SAT = ["매우 만족","만족","보통","불만족","매우 불만족"];
const P_STATUS = ["납부 완료","미납","부분 납부","환불","이월"];
const P_METHOD = ["카드 일시불","카드 할부","현금","계좌이체","무통장입금","기타"];
const P_CAT = ["수강료","교재비","레벨테스트비","등록비","기타"];
const REFERRAL = ["광고 확인","검색엔진","지인 소개","SNS","블로그/카페","오프라인 홍보물","기존 회원","기타"];
const NATIONALITY = ["한국","미국","일본","중국","필리핀","캐나다","영국","기타"];
const LANG_LEVEL = ["입문","초급","중급","중상급","고급","원어민"];
const COURSE_TYPE = ["화상영어","전화영어","방문수업","그룹수업","1:1수업","기타"];

/* A 고정 필드 */
const FIXED: FI[] = [
  { id: "m_name", label: "이름", type: "text", placeholder: "홍길동" },
  { id: "m_phone", label: "HP", type: "text", placeholder: "010-0000-0000" },
  { id: "m_regDate", label: "등록일", type: "date" },
  { id: "m_email", label: "이메일", type: "text", placeholder: "email@example.com" },
  { id: "c_counselor", label: "상담원", type: "text", placeholder: "상담원명" },
  { id: "c_date", label: "상담일자", type: "date" },
];

/* B 준고정 depths */
const B_DEPTHS: { key: string; label: string; desc: string; fields: FI[] }[] = [
  { key: "common", label: "공통", desc: "회원 기본 정보",
    fields: [
      { id: "m_eng", label: "영문명", type: "text", placeholder: "English Name" },
      { id: "m_tel", label: "일반전화", type: "text", placeholder: "02-000-0000" },
      { id: "m_nat", label: "국적", type: "select", options: NATIONALITY },
      { id: "m_gender", label: "성별", type: "select", options: ["남","여"] },
      { id: "m_bday", label: "생년월일", type: "date" },
      { id: "m_age", label: "나이", type: "number", placeholder: "만 나이" },
      { id: "m_addr", label: "주소", type: "text", placeholder: "서울시 강남구...", span: 2 },
      { id: "m_photo", label: "사진여부", type: "select", options: ["없음","있음"] },
      { id: "m_lms", label: "LMS번호", type: "text", placeholder: "LMS-0000" },
    ] },
  { key: "confirmed", label: "확정", desc: "학력·시험·카테고리",
    fields: [
      { id: "m_school1", label: "초·중·고", type: "text", placeholder: "학교명" },
      { id: "m_school2", label: "대학교", type: "text", placeholder: "대학교명" },
      { id: "m_school3", label: "대학원", type: "text", placeholder: "대학원명" },
      { id: "m_major", label: "전공", type: "text", placeholder: "전공" },
      { id: "m_toeic", label: "TOEIC", type: "text", placeholder: "점수" },
      { id: "m_toefl", label: "TOEFL", type: "text", placeholder: "점수" },
      { id: "m_tesol", label: "TESOL", type: "text", placeholder: "점수/유무" },
      { id: "m_otherTest", label: "기타 시험", type: "text", placeholder: "시험명·점수" },
      { id: "m_cert1", label: "자격증 1", type: "text", placeholder: "자격증명" },
      { id: "m_cert2", label: "자격증 2", type: "text", placeholder: "자격증명" },
      { id: "m_cert3", label: "자격증 3", type: "text", placeholder: "자격증명" },
    ] },
  { key: "adjustable", label: "조절", desc: "상담 내용 상세",
    fields: [
      { id: "c_topic", label: "상담항목", type: "text", placeholder: "영어회화 수강 문의" },
      { id: "c_category", label: "상담카테고리", type: "select", options: C_TYPE_OPT },
      { id: "c_courseWant", label: "희망 과정", type: "select", options: COURSE_TYPE },
      { id: "c_level", label: "현재 수준", type: "select", options: LANG_LEVEL },
      { id: "c_content", label: "상담내용", type: "textarea", placeholder: "요구사항, 수준, 목표 등", span: 4 },
      { id: "c_result", label: "결과/조치", type: "textarea", placeholder: "안내 과정, 추천 커리큘럼", span: 4 },
      { id: "c_prevCounsel", label: "이전상담", type: "text", placeholder: "이전상담 요약" },
      { id: "c_lastCounsel", label: "최종상담", type: "text", placeholder: "최종상담 요약" },
    ] },
  { key: "option", label: "옵션", desc: "선택적 항목",
    fields: [
      { id: "m_job", label: "직업", type: "text", placeholder: "대학생" },
      { id: "m_company", label: "직장/학교", type: "text", placeholder: "회사명/학교명" },
      { id: "m_ref", label: "유입경로", type: "select", options: REFERRAL },
      { id: "m_coupon", label: "쿠폰", type: "text", placeholder: "쿠폰코드" },
      { id: "c_dur", label: "소요시간", type: "text", placeholder: "30분" },
      { id: "c_sat", label: "만족도", type: "select", options: SAT },
      { id: "c_nextD", label: "다음통화일", type: "date" },
      { id: "c_nextT", label: "다음통화시간", type: "time" },
      { id: "c_action", label: "후속조치", type: "textarea", placeholder: "자료 발송, 콜백 등", span: 4 },
      { id: "c_fu", label: "후속상담필요", type: "select", options: ["아니오","예"] },
      { id: "c_assign", label: "배정상담원", type: "text", placeholder: "담당자" },
      { id: "c_note", label: "특이사항/주의사항", type: "textarea", placeholder: "VIP, 불만, 특이사항 등", span: 4 },
    ] },
];

/* C 선택 depths */
const C_DEPTHS: { key: string; label: string; desc: string; fields: FI[] }[] = [
  { key: "common", label: "공통", desc: "수납 전체 설정",
    fields: [
      { id: "p_totalExpected", label: "예상 총액", type: "number", placeholder: "0" },
      { id: "p_currency", label: "통화", type: "select", options: ["KRW","USD","JPY","기타"] },
    ] },
  { key: "confirmed", label: "확정", desc: "수납 시 필수",
    fields: [
      { id: "p_bank", label: "입금 은행", type: "text", placeholder: "은행명" },
      { id: "p_account", label: "계좌번호", type: "text", placeholder: "계좌번호" },
      { id: "p_holder", label: "예금주", type: "text", placeholder: "예금주명" },
    ] },
  { key: "adjustable", label: "조절", desc: "조정 가능",
    fields: [
      { id: "p_installCnt", label: "할부 개월", type: "select", options: ["일시불","2개월","3개월","6개월","10개월","12개월"] },
      { id: "p_discountType", label: "할인 유형", type: "select", options: ["없음","조기등록","재등록","소개","직원할인","프로모션"] },
      { id: "p_discountAmt", label: "할인 금액", type: "number", placeholder: "0" },
    ] },
  { key: "option", label: "옵션", desc: "자유 추가",
    fields: [
      { id: "p_receipt", label: "영수증 발급", type: "select", options: ["미발급","현금영수증","세금계산서"] },
      { id: "p_receiptNo", label: "사업자/주민번호", type: "text", placeholder: "번호" },
      { id: "p_note", label: "수납비고", type: "textarea", placeholder: "결제 참고 사항", span: 4 },
    ] },
];

const mkH = (): HistRow => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, status: "", date: "", time: "", counselor: "", category: "", courseType: "", result: "", nextCall: "", memo: "" });
const mkP = (): PayRow => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, category: "", payDate: "", status: "", realCourse: "", amount: "", discount: "", method: "", installment: "", cardCompany: "", approvalNo: "", refundDate: "", memo: "" });

interface CounselingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manual: Manual | null;
}

export function CounselingFormDialog({ open, onOpenChange, manual }: CounselingFormDialogProps) {
  const [fd, setFd] = useState<Record<string, string>>({});
  const [on, setOn] = useState<Set<string>>(() => {
    const s = new Set<string>();
    B_DEPTHS.forEach((d) => d.fields.forEach((f) => s.add(f.id)));
    C_DEPTHS.forEach((d) => d.fields.forEach((f) => s.add(f.id)));
    return s;
  });
  const [cats, setCats] = useState<string[]>(["전체(Gen)"]);
  const [hist, setHist] = useState<HistRow[]>([mkH()]);
  const [pay, setPay] = useState<PayRow[]>([mkP()]);
  const [coll, setColl] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"preview"|"guide">("preview");

  if (!manual) return null;

  const ch = (id: string, v: string) => setFd((p) => ({ ...p, [id]: v }));
  const tog = useCallback((id: string) => {
    setOn((p) => {
      const n = new Set(p);
      if (n.has(id)) { n.delete(id); setFd((pp) => { const nn = { ...pp }; delete nn[id]; return nn; }); }
      else n.add(id);
      return n;
    });
  }, []);
  const togCat = (c: string) => setCats((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);
  const togD = (k: string) => setColl((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const uH = (id: string, k: string, v: string) => setHist((p) => p.map((h) => h.id === id ? { ...h, [k]: v } : h));
  const uP = (id: string, k: string, v: string) => setPay((p) => p.map((x) => x.id === id ? { ...x, [k]: v } : x));

  const fixedOk = FIXED.filter((f) => fd[f.id]?.trim()).length;
  const catOk = cats.length > 0 ? 1 : 0;
  const total = FIXED.length + 1;
  const pct = Math.round(((fixedOk + catOk) / total) * 100);

  const ic = "w-full px-2 py-1 text-[11px] rounded border border-border bg-input-background focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all";
  const tc = "w-full px-1.5 py-0.5 text-[10px] rounded border border-border bg-input-background focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all";

  const CycleBtn = ({ value, options, onChange, className }: { value: string; options: string[]; onChange: (v: string) => void; className?: string }) => {
    const cycle = (dir: 1 | -1) => {
      const all = ["", ...options];
      const idx = all.indexOf(value);
      const next = all[(idx + dir + all.length) % all.length];
      onChange(next);
    };
    return (
      <button
        type="button"
        onClick={(e) => cycle(e.shiftKey ? -1 : 1)}
        title="클릭: 다음 · Shift+클릭: 이전"
        className={`${className || tc} text-left cursor-pointer hover:bg-secondary/30 ${value ? 'text-foreground' : 'text-muted-foreground/40'}`}
      >
        {value || '-'}
      </button>
    );
  };
  const ri = (fi: FI, cls?: string) => {
    const v = fd[fi.id] || "";
    const c = cls || ic;
    switch (fi.type) {
      case "textarea": return <textarea value={v} onChange={(e) => ch(fi.id, e.target.value)} placeholder={fi.placeholder} rows={2} className={`${c} resize-y`} />;
      case "select": return (
        <div className="flex flex-wrap gap-0.5">
          {fi.options?.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => ch(fi.id, v === o ? "" : o)}
              className={`px-1.5 py-0.5 text-[10px] rounded border ${v === o ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-slate-600 border-border hover:border-primary/50'}`}
            >
              {o}
            </button>
          ))}
        </div>
      );
      case "date": return <input type="date" value={v} onChange={(e) => ch(fi.id, e.target.value)} className={`${c} cursor-pointer`} />;
      case "time": return <input type="time" value={v} onChange={(e) => ch(fi.id, e.target.value)} className={`${c} cursor-pointer`} />;
      case "number": return <input type="text" inputMode="numeric" value={v} onChange={(e) => ch(fi.id, e.target.value.replace(/[^0-9]/g,""))} placeholder={fi.placeholder} className={c} />;
      default: return <input type="text" value={v} onChange={(e) => ch(fi.id, e.target.value)} placeholder={fi.placeholder} className={c} />;
    }
  };

  const fD = (v: string) => { if (!v) return ""; const d = new Date(v); return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`; };
  const fN = (v: string) => v ? Number(v).toLocaleString("ko-KR") : "";

  const depthDot: Record<string, string> = { common: "bg-gray-400", confirmed: "bg-green-500", adjustable: "bg-yellow-500", option: "bg-purple-400" };
  const smeta = [
    { color: "border-l-red-400", icon: <Lock size={10} className="text-red-500" />, tag: "A", tagCls: "text-red-600 bg-red-50" },
    { color: "border-l-amber-400", icon: <ShieldCheck size={10} className="text-amber-500" />, tag: "B", tagCls: "text-amber-600 bg-amber-50" },
    { color: "border-l-blue-300", icon: <ToggleRight size={10} className="text-blue-400" />, tag: "C", tagCls: "text-blue-600 bg-blue-50" },
  ];

  const renderDepths = (depths: typeof B_DEPTHS, prefix: string) =>
    depths.map((depth) => {
      const dk = `${prefix}-${depth.key}`;
      const closed = coll.has(dk);
      const actives = depth.fields.filter((f) => on.has(f.id));
      return (
        <div key={depth.key} className="border border-border rounded overflow-hidden flex flex-col">
          <button onClick={() => togD(dk)} className="w-full flex items-center gap-1.5 px-2 py-1 bg-secondary/10 hover:bg-secondary/25 transition-colors cursor-pointer shrink-0">
            {closed ? <ChevronRight size={10} className="text-muted-foreground" /> : <ChevronDown size={10} className="text-muted-foreground" />}
            <span className={`w-1.5 h-1.5 rounded-full ${depthDot[depth.key]}`} />
            <span className="text-[10px] text-foreground">{depth.label}</span>
            <span className="text-[9px] text-muted-foreground/50 truncate">{depth.desc}</span>
            {actives.length > 0 && <span className="ml-auto text-[9px] px-1 rounded-full bg-primary/10 text-primary shrink-0">{actives.length}/{depth.fields.length}</span>}
          </button>
          {!closed && (
            <div className="px-2 py-1.5 space-y-1.5 flex-1">
              {depth.fields.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-1">
                    {depth.fields.map((sf) => {
                      const a = on.has(sf.id);
                      return (
                        <button key={sf.id} onClick={() => tog(sf.id)}
                          className={`inline-flex items-center gap-0.5 px-1.5 py-px rounded-full text-[10px] border cursor-pointer transition-all ${a ? "bg-blue-50 text-blue-600 border-blue-200" : "text-muted-foreground/50 border-border/60 line-through hover:bg-secondary"}`}>
                          {a ? <X size={8} /> : <span className="w-2 h-2 rounded-full border border-current" />}{sf.label}
                        </button>
                      );
                    })}
                  </div>
                  {actives.length > 0 && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-3 gap-y-1.5">
                      {actives.map((fi) => (
                        <div key={fi.id} className={`group ${(fi.span && fi.span > 1) || fi.type === "textarea" ? "col-span-1 xl:col-span-2" : ""}`}
                          style={(fi.span && fi.span > 1) || fi.type === "textarea" ? { gridColumn: `span ${Math.min(fi.span || 2, 2)}` } : undefined}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[10px] text-muted-foreground">{fi.label}</span>
                            <button onClick={() => tog(fi.id)} className="text-muted-foreground/40 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"><X size={9} /></button>
                          </div>
                          {ri(fi)}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : <p className="text-[9px] text-muted-foreground/40 italic">항목 없음</p>}
            </div>
          )}
        </div>
      );
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1600px] w-[95vw] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-3 py-2 border-b border-border flex-row items-center gap-2 space-y-0">
          <DialogTitle className="text-[11px] text-foreground truncate">{manual.title}</DialogTitle>
          <span className="px-1 py-px text-[9px] rounded bg-emerald-50 text-emerald-700 shrink-0">서류</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
            <span className="text-[9px] text-muted-foreground">{fixedOk + catOk}/{total}</span>
            <button onClick={() => window.print()} className="px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border rounded hover:bg-secondary/50 cursor-pointer"><Printer size={10} className="inline -mt-px" /></button>
            <button className="px-1.5 py-0.5 text-[10px] text-muted-foreground border border-border rounded hover:bg-secondary/50 cursor-pointer"><Download size={10} className="inline -mt-px" /></button>
            <button disabled={fixedOk + catOk < total} className={`px-2 py-0.5 text-[10px] rounded cursor-pointer ${fixedOk + catOk >= total ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}><CheckCircle2 size={10} className="inline -mt-px" /> 저장</button>
          </div>
        </DialogHeader>

        <div className="overflow-auto max-h-[calc(90vh-50px)] px-3 py-2">
          <div className="flex gap-2">
            {/* 좌 */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* A 고정 */}
              <Sec meta={smeta[0]} title="고정" desc="회원기본정보 + 상담 필수">
                <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-3 gap-y-1.5">
                  {FIXED.map((fi) => (
                    <div key={fi.id}>
                      <label className="block text-[10px] text-muted-foreground mb-0.5">{fi.label}<span className="text-red-500 ml-0.5">*</span></label>
                      {ri(fi)}
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-1.5 border-t border-border">
                  <label className="block text-[10px] text-muted-foreground mb-1">탭/카테고리<span className="text-red-500 ml-0.5">*</span></label>
                  <div className="flex flex-wrap gap-1">
                    {CAT.map((c) => (
                      <button key={c} onClick={() => togCat(c)}
                        className={`px-2 py-0.5 rounded text-[10px] border cursor-pointer transition-all ${cats.includes(c) ? "bg-blue-50 text-blue-600 border-blue-200" : "text-muted-foreground border-border hover:bg-secondary"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </Sec>

              {/* B 준고정 */}
              <Sec meta={smeta[1]} title="준고정" desc="회원 상세 + 상담 내용 + 이력">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {renderDepths(B_DEPTHS, "B")}
                </div>
                {/* 상담이력 테이블 */}
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-foreground">상담이력 테이블</span>
                    <button onClick={() => setHist((p) => [...p, mkH()])} className="text-[9px] text-primary flex items-center gap-0.5 cursor-pointer"><Plus size={9} />행 추가</button>
                  </div>
                  <div className="border border-border rounded overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead><tr className="bg-secondary/30 border-b border-border">
                        {["상태","일자","시간","상담원","카테고리","수강형태","결과","다음통화","메모"].map((h) => <th key={h} className="text-left px-1.5 py-1 text-[9px] text-muted-foreground/70 whitespace-nowrap">{h}</th>)}
                        <th className="w-5" />
                      </tr></thead>
                      <tbody className="divide-y divide-border">
                        {hist.map((h) => (
                          <tr key={h.id} className="group">
                            <td className="px-1 py-0.5"><CycleBtn value={h.status} options={H_STATUS} onChange={(v) => uH(h.id,"status",v)} /></td>
                            <td className="px-1 py-0.5"><input type="date" className={`${tc} cursor-pointer`} value={h.date} onChange={(e) => uH(h.id,"date",e.target.value)} /></td>
                            <td className="px-1 py-0.5"><input type="time" className={`${tc} cursor-pointer`} value={h.time} onChange={(e) => uH(h.id,"time",e.target.value)} /></td>
                            <td className="px-1 py-0.5"><input className={tc} value={h.counselor} onChange={(e) => uH(h.id,"counselor",e.target.value)} placeholder="이름" /></td>
                            <td className="px-1 py-0.5"><CycleBtn value={h.category} options={C_TYPE_OPT} onChange={(v) => uH(h.id,"category",v)} /></td>
                            <td className="px-1 py-0.5"><CycleBtn value={h.courseType} options={COURSE_TYPE} onChange={(v) => uH(h.id,"courseType",v)} /></td>
                            <td className="px-1 py-0.5"><input className={tc} value={h.result} onChange={(e) => uH(h.id,"result",e.target.value)} placeholder="결과" /></td>
                            <td className="px-1 py-0.5"><input type="date" className={`${tc} cursor-pointer`} value={h.nextCall} onChange={(e) => uH(h.id,"nextCall",e.target.value)} /></td>
                            <td className="px-1 py-0.5"><input className={tc} value={h.memo} onChange={(e) => uH(h.id,"memo",e.target.value)} placeholder="메모" /></td>
                            <td className="px-0.5"><button onClick={() => setHist((p) => p.length > 1 ? p.filter((x) => x.id !== h.id) : p)} className="text-muted-foreground/40 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"><Trash2 size={9} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Sec>

              {/* C 선택 */}
              <Sec meta={smeta[2]} title="선택" desc="수납/결제 상세">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {renderDepths(C_DEPTHS, "C")}
                </div>
                {/* 결제 내역 테이블 */}
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-foreground">결제 내역 테이블</span>
                    <button onClick={() => setPay((p) => [...p, mkP()])} className="text-[9px] text-primary flex items-center gap-0.5 cursor-pointer"><Plus size={9} />행 추가</button>
                  </div>
                  <div className="border border-border rounded overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead>
                        <tr className="bg-secondary/30 border-b border-border">
                          <th colSpan={5} className="text-center px-1.5 py-0.5 text-[8px] text-muted-foreground/50 border-r border-border uppercase tracking-wider">기본 정보</th>
                          <th colSpan={5} className="text-center px-1.5 py-0.5 text-[8px] text-muted-foreground/50 border-r border-border uppercase tracking-wider">결제 상세</th>
                          <th colSpan={3} className="text-center px-1.5 py-0.5 text-[8px] text-muted-foreground/50 uppercase tracking-wider">비고</th>
                        </tr>
                        <tr className="bg-secondary/15 border-b border-border">
                          {["구분","결제일","상태","실제수강","금액","할인","방식","할부","카드사","승인번호","환불일","메모"].map((h) => <th key={h} className="text-left px-1 py-0.5 text-[9px] text-muted-foreground/70 whitespace-nowrap">{h}</th>)}
                          <th className="w-4" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {pay.map((p) => (
                          <tr key={p.id} className="group">
                            <td className="px-0.5 py-0.5"><CycleBtn value={p.category} options={P_CAT} onChange={(v) => uP(p.id,"category",v)} /></td>
                            <td className="px-0.5 py-0.5"><input type="date" className={`${tc} cursor-pointer`} value={p.payDate} onChange={(e) => uP(p.id,"payDate",e.target.value)} /></td>
                            <td className="px-0.5 py-0.5"><CycleBtn value={p.status} options={P_STATUS} onChange={(v) => uP(p.id,"status",v)} /></td>
                            <td className="px-0.5 py-0.5"><input className={tc} value={p.realCourse} onChange={(e) => uP(p.id,"realCourse",e.target.value)} placeholder="과정" /></td>
                            <td className="px-0.5 py-0.5"><input className={`${tc} text-right`} inputMode="numeric" value={p.amount} onChange={(e) => uP(p.id,"amount",e.target.value.replace(/[^0-9]/g,""))} placeholder="0" /></td>
                            <td className="px-0.5 py-0.5"><input className={`${tc} text-right`} inputMode="numeric" value={p.discount} onChange={(e) => uP(p.id,"discount",e.target.value.replace(/[^0-9]/g,""))} placeholder="0" /></td>
                            <td className="px-0.5 py-0.5"><CycleBtn value={p.method} options={P_METHOD} onChange={(v) => uP(p.id,"method",v)} /></td>
                            <td className="px-0.5 py-0.5"><input className={tc} value={p.installment} onChange={(e) => uP(p.id,"installment",e.target.value)} placeholder="개월" /></td>
                            <td className="px-0.5 py-0.5"><input className={tc} value={p.cardCompany} onChange={(e) => uP(p.id,"cardCompany",e.target.value)} placeholder="카드사" /></td>
                            <td className="px-0.5 py-0.5"><input className={tc} value={p.approvalNo} onChange={(e) => uP(p.id,"approvalNo",e.target.value)} placeholder="번호" /></td>
                            <td className="px-0.5 py-0.5"><input type="date" className={`${tc} cursor-pointer`} value={p.refundDate} onChange={(e) => uP(p.id,"refundDate",e.target.value)} /></td>
                            <td className="px-0.5 py-0.5"><input className={tc} value={p.memo} onChange={(e) => uP(p.id,"memo",e.target.value)} placeholder="메모" /></td>
                            <td className="px-0.5"><button onClick={() => setPay((pp) => pp.length > 1 ? pp.filter((x) => x.id !== p.id) : pp)} className="text-muted-foreground/40 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"><Trash2 size={9} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot><tr className="bg-secondary/20 border-t border-border">
                        <td colSpan={4} className="px-1.5 py-1 text-[9px] text-right text-muted-foreground">합계</td>
                        <td className="px-1 py-1 text-[10px] text-right text-foreground">{fN(String(pay.reduce((s, p) => s + (Number(p.amount)||0), 0)))}</td>
                        <td className="px-1 py-1 text-[10px] text-right text-destructive">-{fN(String(pay.reduce((s, p) => s + (Number(p.discount)||0), 0)))}</td>
                        <td colSpan={7} />
                      </tr></tfoot>
                    </table>
                  </div>
                </div>
              </Sec>
            </div>

            {/* 우 */}
            <div className="w-[370px] shrink-0 hidden lg:block">
              <div className="sticky top-0 space-y-1.5">
                <div className="flex bg-secondary/50 rounded p-px">
                  {(["preview","guide"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[10px] rounded cursor-pointer transition-all ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                      {t === "preview" ? <><Eye size={10} />미리보기</> : <><Info size={10} />안내</>}
                    </button>
                  ))}
                </div>

                {tab === "preview" && (
                  <CPreview fd={fd} cats={cats} on={on} bFields={B_DEPTHS.flatMap((d) => d.fields)} cFields={C_DEPTHS.flatMap((d) => d.fields)} hist={hist} pay={pay} fD={fD} fN={fN} />
                )}

                {tab === "guide" && (
                  <div className="bg-card border border-border rounded p-2.5 space-y-2 overflow-auto max-h-[calc(90vh-120px)] text-[10px]">
                    <div>
                      <span className="text-[11px] text-foreground">작성 안내</span>
                      <ul className="mt-1 space-y-0.5">
                        {["고정(A): 이름, HP, 등록일, 이메일, 상담원, 일자 필수","모든 준고정(B)/선택(C) 항목은 기본 ON -- 필요 없으면 OFF","카테고리 탭을 선택하면 해당 뷰 활성화","상담내용은 요구사항·수준·목표 구체 기재","학력/시험 점수를 입력하면 레벨 판정에 참고","이력 테이블에 과거 내역 시간순 기록","결제 테이블에 구분·카드사·승인번호까지 기록","할인 금액은 자동으로 차감 합계에 반영"].map((t, i) => (
                          <li key={i} className="flex gap-1.5 text-muted-foreground"><span className="text-primary shrink-0">{i+1}.</span>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-t border-border pt-2 space-y-0.5">
                      <span className="text-foreground">3단 구조</span>
                      {[
                        { c: "bg-red-400", l: "A 고정", d: "무조건 적용, OFF 불가" },
                        { c: "bg-amber-400", l: "B 준고정", d: "기본 ON, 필요시 OFF" },
                        { c: "bg-blue-300", l: "C 선택", d: "기본 ON, 필요시 OFF" },
                      ].map((x) => (
                        <div key={x.l} className="flex items-start gap-1.5 text-muted-foreground"><span className={`w-2 h-2 rounded-full ${x.c} shrink-0 mt-0.5`} /><span><span className="text-foreground">{x.l}</span> -- {x.d}</span></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* Section wrapper */
function Sec({ meta, title, desc, children }: { meta: { color: string; icon: React.ReactNode; tag: string; tagCls: string }; title: string; desc: string; children: React.ReactNode }) {
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

/* Preview */
function CPreview({ fd, cats, on, bFields, cFields, hist, pay, fD, fN }: {
  fd: Record<string, string>; cats: string[]; on: Set<string>; bFields: FI[]; cFields: FI[];
  hist: HistRow[]; pay: PayRow[]; fD: (v: string) => string; fN: (v: string) => string;
}) {
  const hasAny = !!fd.m_name || !!fd.c_counselor || cats.length > 0;
  const gv = (fi: FI) => { const v = fd[fi.id] || ""; if (!v) return null; if (fi.type === "date") return fD(v); return v; };

  const th = "border border-[#333] bg-[#f2f2f2] px-2 py-1 text-[9px] text-[#333] text-left whitespace-nowrap align-top";
  const td = "border border-[#333] px-2 py-1 text-[10px] text-[#111] align-top whitespace-pre-wrap";

  return (
    <div className="bg-white border border-border rounded shadow-sm overflow-auto max-h-[calc(90vh-120px)]">
      <div className="p-3 min-h-[480px] text-[#1a1a1a]" style={{ fontFamily: "'Noto Serif KR', 'Batang', serif" }}>
        <div className="border-2 border-[#333] p-3">
          <div className="flex justify-between items-start mb-1">
            <span className="text-[8px] text-[#999] tracking-wider">문서번호 : CRS-____-_____</span>
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
            <h1 className="text-[15px] tracking-[0.5em] text-[#111] border-b-2 border-t-2 border-[#333] py-2 inline-block px-6">상 담 기 록</h1>
            <p className="text-[8px] text-[#999] mt-1.5 tracking-wider">{cats.join(" / ")}</p>
          </div>

          {!hasAny ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-14 h-14 rounded border-2 border-dashed border-[#ddd] flex items-center justify-center mb-3"><Eye size={20} className="text-[#ccc]" /></div>
              <p className="text-[10px] text-[#bbb]">좌측 양식에 내용을 입력하시면</p>
              <p className="text-[10px] text-[#bbb]">실시간으로 문서가 작성됩니다.</p>
            </div>
          ) : (
            <>
              {/* 기본 정보 */}
              <table className="w-full border-collapse mb-3">
                <thead><tr><th className={`${th} text-center`} colSpan={4}>기 본 정 보</th></tr></thead>
                <tbody>
                  <tr>
                    <th className={th} style={{ width: "18%" }}>이 름</th>
                    <td className={td}>{fd.m_name || ""}</td>
                    <th className={th} style={{ width: "18%" }}>상담원</th>
                    <td className={td}>{fd.c_counselor || ""}</td>
                  </tr>
                  <tr>
                    <th className={th}>연 락 처</th>
                    <td className={td}>{fd.m_phone || ""}</td>
                    <th className={th}>상담일</th>
                    <td className={td}>{fd.c_date ? fD(fd.c_date) : ""}</td>
                  </tr>
                  <tr>
                    <th className={th}>이 메 일</th>
                    <td className={td}>{fd.m_email || ""}</td>
                    <th className={th}>등록일</th>
                    <td className={td}>{fd.m_regDate ? fD(fd.m_regDate) : ""}</td>
                  </tr>
                </tbody>
              </table>

              {/* 상세 정보 */}
              {(() => {
                const rows = bFields.filter((f) => on.has(f.id) && f.type !== "textarea").map((f) => [f.label, gv(f)] as [string, string | null]).filter(([, v]) => v);
                if (!rows.length) return null;
                const pairs: [string, string, string?, string?][] = [];
                for (let i = 0; i < rows.length; i += 2) {
                  const a = rows[i];
                  const b = rows[i + 1];
                  pairs.push(b ? [a[0], a[1]!, b[0], b[1]!] : [a[0], a[1]!]);
                }
                return (
                  <table className="w-full border-collapse mb-3">
                    <thead><tr><th className={`${th} text-center`} colSpan={4}>상 세 정 보</th></tr></thead>
                    <tbody>
                      {pairs.map(([l1, v1, l2, v2], i) => (
                        <tr key={i}>
                          <th className={th} style={{ width: "18%" }}>{l1}</th>
                          {l2 ? <td className={td}>{v1}</td> : <td className={td} colSpan={3}>{v1}</td>}
                          {l2 && <th className={th} style={{ width: "18%" }}>{l2}</th>}
                          {l2 && <td className={td}>{v2}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}

              {/* 상담 내용 (textarea) */}
              {(() => {
                const ta = bFields.filter((f) => on.has(f.id) && f.type === "textarea" && fd[f.id]?.trim());
                if (!ta.length) return null;
                return (
                  <table className="w-full border-collapse mb-3">
                    <thead><tr><th className={`${th} text-center`} colSpan={2}>상 담 내 용</th></tr></thead>
                    <tbody>
                      {ta.map((f) => (
                        <tr key={f.id}>
                          <th className={th} style={{ width: "18%" }}>{f.label}</th>
                          <td className={`${td} min-h-[30px]`}>{fd[f.id]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}

              {/* 상담 이력 */}
              {hist.some((h) => h.date || h.result) && (
                <table className="w-full border-collapse mb-3 text-[9px]">
                  <thead>
                    <tr><th className={`${th} text-center`} colSpan={5}>상 담 이 력</th></tr>
                    <tr>
                      {["상태", "일자", "상담원", "결과", "비고"].map((h) => <th key={h} className={th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {hist.filter((h) => h.date || h.result).map((h) => (
                      <tr key={h.id}>
                        <td className={td}>{h.status || "-"}</td>
                        <td className={td}>{h.date ? fD(h.date) : "-"}</td>
                        <td className={td}>{h.counselor || "-"}</td>
                        <td className={td}>{h.result || "-"}</td>
                        <td className={td}>{h.memo || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 수납 정보 */}
              {(() => {
                const rows = cFields.filter((f) => on.has(f.id) && f.type !== "textarea").map((f) => [f.label, gv(f)] as [string, string | null]).filter(([, v]) => v);
                if (!rows.length) return null;
                return (
                  <table className="w-full border-collapse mb-3">
                    <thead><tr><th className={`${th} text-center`} colSpan={4}>수 납 정 보</th></tr></thead>
                    <tbody>
                      {rows.map(([l, v], i) => {
                        const next = rows[i + 1];
                        if (i % 2 !== 0) return null;
                        return (
                          <tr key={i}>
                            <th className={th} style={{ width: "18%" }}>{l}</th>
                            {next ? <td className={td}>{v}</td> : <td className={td} colSpan={3}>{v}</td>}
                            {next && <th className={th} style={{ width: "18%" }}>{next[0]}</th>}
                            {next && <td className={td}>{next[1]}</td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}

              {/* 결제 내역 */}
              {pay.some((p) => p.amount) && (
                <table className="w-full border-collapse mb-3 text-[9px]">
                  <thead>
                    <tr><th className={`${th} text-center`} colSpan={5}>결 제 내 역</th></tr>
                    <tr>
                      {["구분", "일자", "방식"].map((h) => <th key={h} className={th}>{h}</th>)}
                      <th className={`${th} text-right`}>금액</th>
                      <th className={`${th} text-right`}>할인</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pay.filter((p) => p.amount).map((p) => (
                      <tr key={p.id}>
                        <td className={td}>{p.category || "-"}</td>
                        <td className={td}>{p.payDate ? fD(p.payDate) : "-"}</td>
                        <td className={td}>{p.method || "-"}</td>
                        <td className={`${td} text-right`}>{fN(p.amount)}</td>
                        <td className={`${td} text-right`} style={{ color: "#c00" }}>{p.discount ? `-${fN(p.discount)}` : ""}</td>
                      </tr>
                    ))}
                    <tr>
                      <th className={th} colSpan={3} style={{ textAlign: "right" }}>합 계</th>
                      <td className={`${td} text-right`} style={{ fontWeight: 600 }}>{fN(String(pay.reduce((s, p) => s + (Number(p.amount) || 0), 0)))}</td>
                      <td className={`${td} text-right`} style={{ color: "#c00" }}>-{fN(String(pay.reduce((s, p) => s + (Number(p.discount) || 0), 0)))}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </>
          )}

          <div className="mt-8 text-center space-y-3">
            <p className="text-[10px] text-[#444]">위 내용은 사실과 다름없음을 확인합니다.</p>
            <p className="text-[10px] text-[#666] mt-3">{fd.c_date ? fD(fd.c_date) : "____년  __월  __일"}</p>
            <div className="mt-4 flex justify-end items-center gap-3 pr-4">
              <span className="text-[10px] text-[#444]">상 담 원 :</span>
              <span className="text-[10px] text-[#111] border-b border-[#333] px-3 min-w-[80px] inline-block text-center">{fd.c_counselor || ""}</span>
              <span className="text-[9px] text-[#999]">(인)</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[8px] text-[#bbb] tracking-[0.3em]">상담팀</p>
          </div>
        </div>
      </div>
    </div>
  );
}
