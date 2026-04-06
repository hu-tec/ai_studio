import { useState } from "react";
import {
  ChevronRight,
  Settings2,
  Archive,
  CheckCircle2,
  Layers,
  Plus,
  Users,
  ShieldCheck,
  BarChart3,
  Globe,
  Briefcase,
  GraduationCap,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Shared widget card (white/grey tone)
// ---------------------------------------------------------------------------

const DashboardWidget = ({
  icon: Icon,
  title,
  count,
  items,
  color = "bg-slate-800",
}: {
  icon: React.ElementType;
  title: string;
  count?: string;
  items: { icon?: React.ElementType; label: string; active?: boolean }[];
  color?: string;
}) => (
  <div className="bg-white border border-slate-200 rounded shadow-sm flex flex-col mb-3 last:mb-0">
    <div className={`${color} p-2 flex items-center justify-between text-white`}>
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 opacity-70" />
        <h4 className="text-[11px] font-bold tracking-tight uppercase">{title}</h4>
      </div>
      {count && <span className="text-[10px] font-mono opacity-50">{count}</span>}
    </div>
    <div className="p-1">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded group transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {item.icon && (
              <item.icon
                className={`w-3 h-3 ${item.active ? "text-slate-900" : "text-slate-400"}`}
              />
            )}
            <span
              className={`text-[11px] ${item.active ? "text-slate-900 font-bold" : "text-slate-600"}`}
            >
              {item.label}
            </span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <X className="w-3 h-3 text-slate-300 hover:text-slate-900" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// 1단: A.분야 & 소분류
// ---------------------------------------------------------------------------

export const ColumnOne = () => {
  const [activeMain, setActiveMain] = useState("IT/개발");

  const categories = [
    { name: "문서", sub: ["비즈니스", "법률", "의료", "특허", "노무", "교재", "논문", "기사", "고전"] },
    { name: "음성", sub: ["아나운서", "관광가이드", "큐레이터", "안내 방송", "교육 강의"] },
    { name: "영상/SNS", sub: ["미디어/장르"] },
    { name: "IT/개발", sub: ["개발/보안", "디자인/기획"] },
    { name: "창의적활동", sub: ["콘텐츠"] },
    { name: "번역", sub: ["통번역 방식"] },
    { name: "확장영역", sub: ["라이프/전문"] },
  ];

  return (
    <div className="flex flex-col h-full bg-white p-2 space-y-2 overflow-y-auto custom-scrollbar">
      <div className="p-3 rounded border border-slate-200 bg-slate-50/30 shadow-sm">
        <h3 className="text-[12px] font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-tight border-b border-slate-200 pb-2">
          <Layers className="w-3.5 h-3.5 text-slate-500" /> A. 분야 탐색
        </h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <div key={cat.name}>
              <button
                onClick={() => setActiveMain(cat.name)}
                className={`w-full text-left px-2 py-1.5 rounded text-[11px] flex items-center justify-between transition-all ${
                  activeMain === cat.name
                    ? "bg-slate-900 text-white font-bold shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat.name}
                <ChevronRight
                  className={`w-3 h-3 ${activeMain === cat.name ? "rotate-90" : ""}`}
                />
              </button>
              {activeMain === cat.name && (
                <div className="ml-2 border-l border-slate-200 pl-2 mt-1 space-y-0.5 mb-2 py-1">
                  {cat.sub.map((s) => (
                    <button
                      key={s}
                      className="w-full text-left py-1 text-[10.5px] text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-3 rounded border border-slate-200">
        <h4 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
          IT/개발 소분류
        </h4>
        <div className="flex flex-wrap gap-1">
          {["AI", "에이전트", "DB", "빅데이터", "백엔드", "프론트", "프로그램"].map((t) => (
            <span
              key={t}
              className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded hover:bg-slate-200 hover:text-slate-900 cursor-pointer transition-colors border border-slate-200/50"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto p-2 bg-slate-50 rounded border border-slate-200 flex items-center justify-between group cursor-pointer hover:bg-slate-100 transition-all">
        <span className="text-[10px] text-slate-600 font-bold">확장영역 추가</span>
        <Plus className="w-3 h-3 text-slate-400 group-hover:text-slate-900" />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2단: B.급수 (Configuration)
// ---------------------------------------------------------------------------

export const ColumnTwo = () => {
  const [activeTab, setActiveTab] = useState("프롬");
  const grades = [
    { name: "프롬", sub: ["교육", "일반", "전문"] },
    { name: "번역", sub: ["교육", "일반", "전문"] },
    { name: "윤리", sub: ["교육", "일반", "전문"] },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-x border-slate-200 p-2 space-y-2 overflow-y-auto custom-scrollbar">
      <div className="bg-slate-50/50 p-3 rounded border border-slate-200">
        <h3 className="text-[12px] font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-tight border-b border-slate-200 pb-2">
          <Settings2 className="w-3.5 h-3.5 text-slate-500" /> 2. 급수 (B)
        </h3>
        <div className="flex gap-1 mb-3">
          {grades.map((g) => (
            <button
              key={g.name}
              onClick={() => setActiveTab(g.name)}
              className={`flex-1 py-1.5 rounded text-[10px] font-bold border transition-all ${
                activeTab === g.name
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {grades
            .find((g) => g.name === activeTab)
            ?.sub.map((s) => (
              <div key={s} className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                  {s}
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {(s === "교육" ? [1, 2, 3, 4, 5, 6, 7, 8] : s === "일반" ? [1, 2, 3] : [1, 2]).map(
                    (lv) => (
                      <button
                        key={lv}
                        className="py-1.5 bg-white border border-slate-100 rounded text-[9px] text-slate-500 hover:border-slate-900 hover:text-slate-900 font-mono transition-all shadow-sm active:scale-95"
                      >
                        {lv}급
                      </button>
                    ),
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-white p-3 rounded border border-slate-200 flex-1 flex flex-col">
        <h4 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest border-b border-slate-50 pb-2">
          분야별 급수 현황
        </h4>
        <div className="space-y-2 overflow-y-auto no-scrollbar">
          {["법률 (민사)", "음성 (강의)", "영상 (드라마)", "IT (백엔드)", "문서 (비즈니스)"].map(
            (item) => (
              <div
                key={item}
                className="flex items-center justify-between p-1 hover:bg-slate-50 rounded transition-colors group cursor-pointer"
              >
                <span className="text-[10.5px] text-slate-600 group-hover:text-slate-900">
                  {item}
                </span>
                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">
                  1급
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 3단: C.홈페이지 / D.부서 (Workspace)
// ---------------------------------------------------------------------------

export const ColumnThree = () => {
  const hpItems = [
    { label: "교육", icon: GraduationCap },
    { label: "번역 (109개언어)", icon: Globe, active: true },
    { label: "통독 문서", icon: Archive },
    { label: "전시회 (박물관/전시회)", icon: Layers },
    { label: "전문가 매칭 (번역가)", icon: Users },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/20 p-2 space-y-2 overflow-y-auto custom-scrollbar">
      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
          <h3 className="text-[12px] font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
            <Globe className="w-3.5 h-3.5 text-slate-500" /> 3. 홈페이지 (C)
          </h3>
          <span className="text-[8px] font-black text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded tracking-widest italic uppercase">
            Preview
          </span>
        </div>
        <div className="space-y-1">
          {hpItems.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 p-2 rounded transition-all cursor-pointer border ${
                item.active
                  ? "bg-slate-900 border-slate-900 shadow-md"
                  : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <item.icon
                className={`w-3.5 h-3.5 ${item.active ? "text-white" : "text-slate-400"}`}
              />
              <span
                className={`text-[11px] ${item.active ? "text-white font-bold" : "text-slate-600"}`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-3 rounded border border-slate-200">
        <h3 className="text-[12px] font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-tight border-b border-slate-100 pb-2">
          <Briefcase className="w-3.5 h-3.5 text-slate-500" /> D. 부서 (관리)
        </h3>
        <div className="space-y-3">
          {[
            { team: "강사 팀", subs: ["테슬", "프롬프트", "AI번역", "윤리"] },
            { team: "커리 교재 팀", subs: ["테슬", "프롬프트", "AI번역", "윤리"] },
            { team: "문제은행팀", subs: ["프롬프트", "AI번역", "윤리"] },
          ].map((t) => (
            <div key={t.team} className="space-y-1.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                {t.team}
              </span>
              <div className="flex flex-wrap gap-1">
                {t.subs.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 bg-white text-slate-600 text-[10px] rounded border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all cursor-pointer shadow-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded p-3 text-white mt-auto border border-slate-700 shadow-inner">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
          <h4 className="text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider">
            <BarChart3 className="w-3 h-3 text-slate-400" /> Experts Matching
          </h4>
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] items-center">
            <span className="opacity-50">영업전문가 현황</span>
            <span className="font-mono font-bold bg-white/10 px-1.5 rounded">42/100</span>
          </div>
          <div className="flex justify-between text-[10px] items-center">
            <span className="opacity-50">신입 매칭 진행</span>
            <span className="font-mono font-bold bg-white/10 px-1.5 rounded">12</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 4단: D.부서 / E.직급 (Inventory)
// ---------------------------------------------------------------------------

export const ColumnFour = () => {
  const departments = [
    "기획", "홈페이지", "영업", "마케팅", "회계", "인사", "관리", "상담", "총무", "강사", "커리/교재", "문제은행",
  ];
  const ranks = ["알바", "신입", "강사", "팀장", "개발", "외부", "임원", "대표"];

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 p-2 space-y-2 overflow-y-auto custom-scrollbar">
      <div className="p-3 rounded border border-slate-200 bg-slate-50/30">
        <h3 className="text-[12px] font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-tight border-b border-slate-200 pb-2">
          <Briefcase className="w-3.5 h-3.5 text-slate-500" /> D. 부서 (전체)
        </h3>
        <div className="grid grid-cols-2 gap-1">
          {departments.map((d) => (
            <div
              key={d}
              className="bg-white p-1.5 border border-slate-200 rounded text-[10px] text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all cursor-pointer truncate shadow-sm text-center"
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
        <h3 className="text-[12px] font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase tracking-tight border-b border-slate-100 pb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> E. 직급 (Standard)
        </h3>
        <div className="space-y-0.5">
          {ranks.map((r) => (
            <div
              key={r}
              className={`px-2 py-1.5 rounded text-[10.5px] flex items-center justify-between group cursor-pointer transition-all border ${
                r === "팀장"
                  ? "bg-slate-900 text-white font-bold border-slate-900 shadow-md"
                  : "text-slate-500 border-transparent hover:bg-slate-50 hover:border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-1 h-1 rounded-full ${
                    r === "팀장" ? "bg-white" : "bg-slate-300 group-hover:bg-slate-900"
                  }`}
                ></div>
                {r}
              </div>
              {r === "팀장" && <CheckCircle2 className="w-3 h-3 text-white/50" />}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto bg-slate-50 p-3 rounded border border-slate-200 shadow-inner">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            저장 리포트
          </span>
          <span className="text-[9px] font-mono text-slate-300">14:22:01</span>
        </div>
        <div className="space-y-1.5">
          {["2026 AI 입문 과정", "디지털 마케팅 전문가"].map((item) => (
            <div
              key={item}
              className="flex justify-between items-center p-1.5 bg-white rounded border border-slate-100 hover:border-slate-300 transition-all cursor-pointer"
            >
              <span className="text-[10px] text-slate-600 truncate font-medium">{item}</span>
              <ChevronRight className="w-2.5 h-2.5 text-slate-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
