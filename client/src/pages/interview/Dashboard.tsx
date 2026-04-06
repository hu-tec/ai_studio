import React, { useState, useMemo } from "react";
import { Download, ChevronDown, ChevronRight, LayoutDashboard, List, Eye, Search, X, Users } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useStore, type Applicant } from "./interviewStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const GRADE_COLORS: Record<string, string> = {
  A: "#10b981",
  B: "#3b82f6",
  C: "#f59e0b",
  D: "#ef4444",
};

const GRADE_EMOJI: Record<string, string> = {
  A: "⭐",
  B: "👍",
  C: "🤔",
  D: "⚠️",
};

const TYPE_EMOJI: Record<string, string> = {
  "강사": "🏫",
  "직원": "💼",
};

function ScoreDots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${
            i < value ? "bg-indigo-500" : "bg-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function DetailContent({ a }: { a: Applicant }) {
  const allSkills = Object.entries(a.skills)
    .filter(([, v]) => v.length > 0)
    .map(([k, v]) => {
      const labels: Record<string, string> = {
        aiVibeCoding: "🤖 AI 바이브코딩",
        prompt: "💬 프롬프트",
        design: "🎨 디자인",
        program: "💻 프로그램",
        etc: "🔧 기타",
        documentWriting: "📝 문서작성",
        translationSystem: "🌐 번역시스템",
        usageExperience: "📋 사용경력",
        workExperience: "📁 업무경력",
      };
      return { label: labels[k] || k, items: v };
    });

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr] gap-6">
      {/* Col 1: Basic Info Detail */}
      <div className="space-y-3">
        <div style={{ fontSize: "0.78rem", fontWeight: 600 }} className="text-gray-700 flex items-center gap-1.5 border-b pb-1">
          📋 기본 정보 상세
        </div>
        <div className="space-y-1.5" style={{ fontSize: "0.75rem" }}>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-16">🎓 학력</span>
            <span className="text-gray-700">{a.education || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-16">📜 자격증</span>
            <span className="text-gray-700">{a.certificates || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-16">🤖 AI</span>
            <span className="text-gray-700">{a.availableAI || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 w-16">🧠 MBTI</span>
            <span className="text-purple-600" style={{ fontWeight: 500 }}>{a.mbti || "-"}</span>
          </div>
          {a.specialNotes && (
            <div className="flex items-start gap-2 mt-1">
              <span className="text-gray-400 w-16">💡 특이</span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex-1">{a.specialNotes}</span>
            </div>
          )}
          {a.memo && (
            <div className="flex items-start gap-2 mt-1">
              <span className="text-gray-400 w-16">📝 메모</span>
              <span className="text-gray-600 flex-1">{a.memo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Col 2: Score Detail */}
      <div className="space-y-3">
        <div style={{ fontSize: "0.78rem", fontWeight: 600 }} className="text-gray-700 flex items-center gap-1.5 border-b pb-1">
          📊 평가 점수 상세
        </div>
        <div className="space-y-2" style={{ fontSize: "0.75rem" }}>
          {[
            { emoji: "🧐", label: "판단력", value: a.judgment },
            { emoji: "💪", label: "성실성/태도", value: a.sincerity },
            { emoji: "✨", label: "센스", value: a.sense },
            { emoji: "🏠", label: "장기근무", value: a.longTermWork },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-2">
              <span className="text-gray-500 whitespace-nowrap">{item.emoji} {item.label}</span>
              <div className="flex items-center gap-2">
                <ScoreDots value={item.value} />
                <span className="text-gray-400 w-8 text-right">{item.value}/5</span>
              </div>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-700" style={{ fontWeight: 600 }}>🎯 총점</span>
              <span className="text-indigo-600" style={{ fontWeight: 700, fontSize: "0.9rem" }}>{a.totalScore}점</span>
            </div>
          </div>
        </div>
      </div>

      {/* Col 3: Skills */}
      <div className="space-y-3">
        <div style={{ fontSize: "0.78rem", fontWeight: 600 }} className="text-gray-700 flex items-center gap-1.5 border-b pb-1">
          🛠️ 보유 스킬
        </div>
        {allSkills.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2" style={{ fontSize: "0.72rem" }}>
            {allSkills.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="text-gray-500 font-medium">{group.label}</div>
                <div className="flex flex-wrap gap-1">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="bg-white border border-gray-200 text-gray-700 rounded px-1.5 py-0.5"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 italic" style={{ fontSize: "0.75rem" }}>등록된 스킬이 없습니다.</div>
        )}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { applicants } = useStore();
  const [viewMode, setViewMode] = useState<"summary" | "list">("summary");
  const [filterType, setFilterType] = useState<string>("전체");
  const [filterGrade, setFilterGrade] = useState<string>("전체");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [previewApplicant, setPreviewApplicant] = useState<Applicant | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return applicants.filter((a) => {
      if (filterType !== "전체" && a.type !== filterType) return false;
      if (filterGrade !== "전체" && a.grade !== filterGrade) return false;
      return true;
    });
  }, [applicants, filterType, filterGrade]);

  const stats = useMemo(() => {
    const total = applicants.length;
    const byGrade: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    const byType: Record<string, number> = { "강사": 0, "직원": 0 };
    const passStatus: Record<string, number> = { "합격": 0, "불합격": 0, "미정": 0 };
    let totalScore = 0;

    applicants.forEach((a) => {
      byGrade[a.grade]++;
      byType[a.type]++;
      passStatus[a.passStatus || "미정"]++;
      totalScore += a.totalScore;
    });

    return {
      total,
      byGrade,
      byType,
      passStatus,
      avgScore: total > 0 ? (totalScore / total).toFixed(1) : "0",
    };
  }, [applicants]);

  const gradeChartData = Object.entries(stats.byGrade).map(([grade, count]) => ({
    grade,
    count,
    fill: GRADE_COLORS[grade],
  }));

  const typeChartData = [
    { name: "강사", value: stats.byType["강사"], fill: "#6366f1" },
    { name: "직원", value: stats.byType["직원"], fill: "#a855f7" },
  ];

  const passStatusData = [
    { name: "합격", value: stats.passStatus["합격"], fill: "#10b981" },
    { name: "불합격", value: stats.passStatus["불합격"], fill: "#ef4444" },
    { name: "미정", value: stats.passStatus["미정"], fill: "#94a3b8" },
  ];

  const handleExcelDownload = () => {
    if (applicants.length === 0) {
      toast.error("다운로드할 데이터가 없습니다.");
      return;
    }

    const data = filtered.map((a) => ({
      "이름": a.name,
      "분류": a.type,
      "대분류": a.categoryLarge,
      "중분류": a.categoryMedium,
      "소분류": a.categorySmall,
      "경력": a.career === "경력" ? `경력 ${a.careerYears}년` : "신입",
      "학력": a.education,
      "자격증": a.certificates,
      "사용가능 AI": a.availableAI,
      "판단력": a.judgment,
      "성실성/태도": a.sincerity,
      "센스": a.sense,
      "장기근무": a.longTermWork,
      "특이사항": a.specialNotes,
      MBTI: a.mbti,
      "AI 바이브코딩": a.skills.aiVibeCoding.join(", "),
      "프롬프트": a.skills.prompt.join(", "),
      "디자인": a.skills.design.join(", "),
      "프로그램": a.skills.program.join(", "),
      "기타": a.skills.etc.join(", "),
      "문서작성": a.skills.documentWriting.join(", "),
      "번역시스템": a.skills.translationSystem.join(", "),
      "상태": a.passStatus,
      "등급": a.grade,
      "총점": a.totalScore,
      "메모": a.memo,
      "면접일": a.date,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "면접평가");
    ws["!cols"] = Object.keys(data[0] || {}).map(() => ({ wch: 15 }));
    XLSX.writeFile(wb, `면접평가표_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("엑셀 파일이 다운로드되었습니다.");
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header with View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            📊 면접 평가 대시보드
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">실시간 면접 데이터 요약 및 상세 관리</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg self-start md:self-center">
          <button
            onClick={() => setViewMode("summary")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === "summary" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            요약 대시보드
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="w-4 h-4" />
            전체 리스트
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "summary" ? (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* KPI 인라인 바 */}
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 flex items-center divide-x divide-gray-200">
              <div className="pr-5">
                <span className="text-[10px] text-gray-400">지원자</span>
                <div className="text-lg font-bold text-gray-900 leading-tight">{stats.total}<span className="text-[10px] font-normal text-gray-400 ml-0.5">명</span></div>
              </div>
              <div className="px-5">
                <span className="text-[10px] text-gray-400">A등급</span>
                <div className="text-lg font-bold text-emerald-600 leading-tight">{stats.byGrade.A}<span className="text-[10px] font-normal text-gray-400 ml-0.5">명 ({stats.total > 0 ? ((stats.byGrade.A / stats.total) * 100).toFixed(0) : 0}%)</span></div>
              </div>
              <div className="px-5">
                <span className="text-[10px] text-gray-400">평균점수</span>
                <div className="text-lg font-bold text-blue-600 leading-tight">{stats.avgScore}<span className="text-[10px] font-normal text-gray-400 ml-0.5">점</span></div>
              </div>
              <div className="px-5">
                <span className="text-[10px] text-gray-400">합격</span>
                <div className="text-lg font-bold text-amber-600 leading-tight">{stats.passStatus.합격 + stats.passStatus.불합격}<span className="text-[10px] font-normal text-gray-400 ml-0.5">건</span></div>
              </div>
              <div className="pl-5">
                <span className="text-[10px] text-gray-400">미정</span>
                <div className="text-lg font-bold text-gray-400 leading-tight">{stats.passStatus.미정}<span className="text-[10px] font-normal text-gray-400 ml-0.5">건</span></div>
              </div>
            </div>

            {/* 차트 + 테이블 2단 */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3">
              {/* 왼쪽: 차트 2개 세로 */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
                <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">등급 분포</h3>
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeChartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                      <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 2px 4px rgb(0 0 0 / 0.1)', fontSize: '11px' }} />
                      <Bar dataKey="count" radius={[3, 3, 0, 0]} barSize={28}>
                        {gradeChartData.map((entry) => (
                          <Cell key={entry.grade} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="border-t border-gray-100 pt-2">
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">분류 / 합격</h3>
                  <div className="grid grid-cols-2 h-[110px]">
                    <div className="relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={typeChartData} cx="50%" cy="50%" innerRadius={28} outerRadius={42} paddingAngle={5} dataKey="value">
                            {typeChartData.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[9px] text-gray-400">분류</span>
                      </div>
                    </div>
                    <div className="relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={passStatusData} cx="50%" cy="50%" innerRadius={28} outerRadius={42} paddingAngle={5} dataKey="value">
                            {passStatusData.map((entry) => (<Cell key={entry.name} fill={entry.fill} />))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[9px] text-gray-400">합격</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 고득점 테이블 */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-100">
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">전체 지원자 ({applicants.length}명)</h3>
                </div>
                <div className="overflow-y-auto max-h-[300px]">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50/80 sticky top-0">
                    <tr>
                      <th className="px-3 py-1.5 text-left font-medium text-gray-400">이름</th>
                      <th className="px-3 py-1.5 text-left font-medium text-gray-400">분류</th>
                      <th className="px-3 py-1.5 text-left font-medium text-gray-400">등급</th>
                      <th className="px-3 py-1.5 text-right font-medium text-gray-400">총점</th>
                      <th className="px-3 py-1.5 text-right font-medium text-gray-400"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {applicants.slice().sort((a, b) => b.totalScore - a.totalScore).map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50/50">
                        <td className="px-3 py-1.5 font-medium text-gray-900">{a.name}</td>
                        <td className="px-3 py-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${a.type === "강사" ? "bg-indigo-50 text-indigo-600" : "bg-purple-50 text-purple-600"}`}>
                            {a.type}
                          </span>
                        </td>
                        <td className="px-3 py-1.5">
                          <span className="font-bold" style={{ color: GRADE_COLORS[a.grade] }}>{a.grade}</span>
                        </td>
                        <td className="px-3 py-1.5 text-right font-bold text-indigo-600">{a.totalScore}</td>
                        <td className="px-3 py-1.5 text-right">
                          <button onClick={() => setPreviewApplicant(a)} className="text-gray-300 hover:text-indigo-600">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="지원자 검색..."
                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 md:w-64 transition-all"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="전체">전체 분류</option>
                  <option value="강사">🏫 강사</option>
                  <option value="직원">💼 직원</option>
                </select>
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="전체">전체 등급</option>
                  <option value="A">⭐ A등급</option>
                  <option value="B">👍 B등급</option>
                  <option value="C">🤔 C등급</option>
                  <option value="D">⚠️ D등급</option>
                </select>
                <div className="text-xs text-gray-400 ml-1">결과 {filtered.length}건</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedIds(expandedIds.size === filtered.length ? new Set() : new Set(filtered.map(a => a.id)))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                >
                  {expandedIds.size === filtered.length ? "모두 접기" : "모두 펼치기"}
                </button>
                <button
                  onClick={handleExcelDownload}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  엑셀 다운로드
                </button>
              </div>
            </div>

            {/* Main Data Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500">
                      <th className="px-4 py-3 text-left font-semibold">등급</th>
                      <th className="px-4 py-3 text-left font-semibold">이름 / 분류</th>
                      <th className="px-4 py-3 text-left font-semibold">카테고리</th>
                      <th className="px-4 py-3 text-left font-semibold">경력 / 학력</th>
                      <th className="px-4 py-3 text-center font-semibold">상태</th>
                      <th className="px-4 py-3 text-center font-semibold">총점</th>
                      <th className="px-4 py-3 text-right font-semibold">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-20 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <Users className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm">검색 결과가 없습니다.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((a) => (
                        <React.Fragment key={a.id}>
                          <tr
                            className={`group cursor-pointer transition-colors ${expandedIds.has(a.id) ? "bg-indigo-50/30" : "hover:bg-gray-50/80"}`}
                            onClick={() => toggleExpand(a.id)}
                          >
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-xs"
                                style={{
                                  color: GRADE_COLORS[a.grade],
                                  backgroundColor: `${GRADE_COLORS[a.grade]}10`,
                                  borderColor: `${GRADE_COLORS[a.grade]}30`
                                }}>
                                {GRADE_EMOJI[a.grade]} {a.grade}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{a.name}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${a.type === "강사" ? "bg-indigo-100 text-indigo-700" : "bg-purple-100 text-purple-700"}`}>
                                  {a.type}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5">{a.date} · {a.mbti || "MBTI 미정"}</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-xs text-gray-700">{a.categoryLarge}</div>
                              <div className="text-[10px] text-gray-400 truncate max-w-[120px]">
                                {a.categoryMedium} {a.categorySmall && `› ${a.categorySmall}`}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-xs text-gray-700 flex items-center gap-1">
                                {a.career === "경력" ? `경력 ${a.careerYears}년` : "신입"}
                              </div>
                              <div className="text-[10px] text-gray-400">{a.education || "-"}</div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                a.passStatus === "합격" ? "bg-emerald-100 text-emerald-700" :
                                a.passStatus === "불합격" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-600"
                              }`}>
                                {a.passStatus || "미정"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-sm font-bold text-indigo-600">{a.totalScore}</span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setPreviewApplicant(a); }}
                                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                  title="미리보기"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                  onClick={(e) => { e.stopPropagation(); toggleExpand(a.id); }}
                                >
                                  {expandedIds.has(a.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedIds.has(a.id) && (
                            <tr>
                              <td colSpan={7} className="px-0 py-0 border-b border-gray-100">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  className="bg-gray-50/50 px-6 py-6 border-t border-gray-100"
                                >
                                  <DetailContent a={a} />
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <Dialog open={!!previewApplicant} onOpenChange={() => setPreviewApplicant(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl">
          {previewApplicant && (
            <div className="bg-white">
              <div className="bg-indigo-600 px-6 py-6 text-white relative">
                <button
                  onClick={() => setPreviewApplicant(null)}
                  className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-end gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                    {TYPE_EMOJI[previewApplicant.type]}
                  </div>
                  <div className="mb-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{previewApplicant.name}</h2>
                      <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium">{previewApplicant.type}</span>
                    </div>
                    <p className="text-indigo-100 text-sm mt-1">{previewApplicant.categoryLarge} › {previewApplicant.categoryMedium} › {previewApplicant.categorySmall}</p>
                  </div>
                  <div className="ml-auto flex flex-col items-end gap-1">
                    <div className="text-xs text-indigo-200">종합 평가 등급</div>
                    <div className="text-4xl font-black bg-white text-indigo-600 w-12 h-12 flex items-center justify-center rounded-xl shadow-lg border-2 border-indigo-400">
                      {previewApplicant.grade}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                <DetailContent a={previewApplicant} />

                <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400">결정된 상태</div>
                    <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${
                      previewApplicant.passStatus === "합격" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      previewApplicant.passStatus === "불합격" ? "bg-red-50 text-red-600 border border-red-100" :
                      "bg-gray-50 text-gray-500 border border-gray-100"
                    }`}>
                      {previewApplicant.passStatus || "상태 미정"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPreviewApplicant(null)}>닫기</Button>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                      handleExcelDownload();
                      setPreviewApplicant(null);
                    }}>엑셀 내보내기</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Dashboard;
