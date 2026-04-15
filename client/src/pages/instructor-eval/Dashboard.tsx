import React, { useState, useMemo } from "react";
import { Download, ChevronDown, ChevronRight, LayoutDashboard, List, Eye, Search, X, TrendingUp, Users, Award, Star } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useStore, type Applicant } from "./interviewStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const GRADE_COLORS: Record<string, string> = {
  A: "#10b981",
  B: "#3b82f6",
  C: "#f59e0b",
  D: "#ef4444",
};

const GRADE_EMOJI: Record<string, string> = {
  A: "S",
  B: "A",
  C: "B",
  D: "C",
};

const TYPE_LABEL: Record<string, string> = {
  "강사": "강사",
  "직원": "직원",
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
        aiVibeCoding: "AI 바이브코딩",
        prompt: "프롬프트",
        design: "디자인",
        program: "프로그램",
        etc: "기타",
        documentWriting: "문서작성",
        translationSystem: "번역시스템",
        usageExperience: "사용경력",
        workExperience: "업무경력",
        videoEditing: "영상편집",
        onlinePlatform: "온라인플랫폼",
        whiteboard: "화이트보드",
        quizAssessment: "퀴즈/평가",
        screenRecording: "화면녹화",
        presentationTool: "발표도구",
        contentCreation: "콘텐츠제작",
        survey: "설문조사",
      };
      return { label: labels[k] || k, items: v };
    });

  const factorScores = a.factors ? [
    { label: "판단력", value: a.factors.judgment?.score || 0 },
    { label: "성실성/태도", value: a.factors.sincerity?.score || 0 },
    { label: "센스", value: a.factors.sense?.score || 0 },
    { label: "장기근무", value: a.factors.retention?.score || 0 },
    { label: "업무경력", value: a.factors.experience?.score || 0 },
    { label: "학벌/관리", value: a.factors.academic?.score || 0 },
    { label: "강의경력", value: a.factors.teaching?.score || 0 },
    { label: "자격/전문", value: a.factors.expertCert?.score || 0 },
  ] : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr] gap-2">
      {/* Col 1: Basic Info Detail */}
      <div className="space-y-1">
        <div style={{ fontSize: "0.78rem", fontWeight: 900 }} className="text-gray-900 flex items-center gap-1.5 border-b-2 border-gray-100 pb-1 uppercase tracking-tight">
          기본 정보 상세
        </div>
        <div className="space-y-1.5 font-black text-gray-800" style={{ fontSize: "0.75rem" }}>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-16 font-bold">학력</span>
            <span className="text-gray-900">{a.education || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-16 font-bold">자격증</span>
            <span className="text-gray-900">{a.certificates || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-16 font-bold">AI</span>
            <span className="text-gray-900">{a.availableAI || "-"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-16 font-bold">MBTI</span>
            <span className="text-purple-700 font-black">{a.mbti || "-"}</span>
          </div>
          {a.specialNotes && (
            <div className="flex items-start gap-2 mt-1">
              <span className="text-gray-500 w-16 font-bold">특이</span>
              <span className="text-amber-900 bg-amber-50 px-2 py-0.5 rounded flex-1 font-black">{a.specialNotes}</span>
            </div>
          )}
          {a.memo && (
            <div className="flex items-start gap-2 mt-1">
              <span className="text-gray-500 w-16 font-bold">메모</span>
              <span className="text-gray-900 flex-1 font-bold">{a.memo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Col 2: Score Detail */}
      <div className="space-y-1">
        <div style={{ fontSize: "0.78rem", fontWeight: 900 }} className="text-gray-900 flex items-center gap-1.5 border-b-2 border-gray-100 pb-1 uppercase tracking-tight">
          평가 점수 상세
        </div>
        <div className="space-y-2 font-black" style={{ fontSize: "0.75rem" }}>
          {factorScores.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-2">
              <span className="text-gray-700 font-black whitespace-nowrap">{item.label}</span>
              <div className="flex items-center gap-2">
                <ScoreDots value={item.value} />
                <span className="text-gray-900 w-8 text-right font-black">{item.value}/5</span>
              </div>
            </div>
          ))}
          <div className="border-t-2 border-gray-100 pt-2 mt-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-900 font-black">총점</span>
              <span className="text-indigo-700 font-black" style={{ fontSize: "0.95rem" }}>{a.totalScore}점</span>
            </div>
          </div>
        </div>
      </div>

      {/* Col 3: Skills */}
      <div className="space-y-1">
        <div style={{ fontSize: "0.78rem", fontWeight: 900 }} className="text-gray-900 flex items-center gap-1.5 border-b-2 border-gray-100 pb-1 uppercase tracking-tight">
          보유 스킬
        </div>
        {allSkills.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 font-black" style={{ fontSize: "0.72rem" }}>
            {allSkills.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="text-gray-600 font-black">{group.label}</div>
                <div className="flex flex-wrap gap-1">
                  {group.items.map((item: string) => (
                    <span
                      key={item}
                      className="bg-white border-2 border-gray-200 text-gray-900 rounded px-1.5 py-0.5 font-black"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic font-black" style={{ fontSize: "0.75rem" }}>등록된 스킬이 없습니다.</div>
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
      "판단력": a.factors.judgment?.score || 0,
      "성실성/태도": a.factors.sincerity?.score || 0,
      "센스": a.factors.sense?.score || 0,
      "장기근무": a.factors.retention?.score || 0,
      "업무경력": a.factors.experience?.score || 0,
      "학벌/관리": a.factors.academic?.score || 0,
      "강의경력": a.factors.teaching?.score || 0,
      "자격/전문": a.factors.expertCert?.score || 0,
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
    <div className="space-y-2 pb-2">
      {/* Header with View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 bg-white p-2 rounded-md border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            면접 평가 대시보드
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">실시간 면접 데이터 요약 및 상세 관리</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg self-start md:self-center">
          <button
            onClick={() => setViewMode("summary")}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium transition-all ${
              viewMode === "summary" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            요약 대시보드
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium transition-all ${
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
            className="space-y-2"
          >
            {/* Top Stats KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
              <div className="bg-white rounded-md border border-gray-200 p-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 text-indigo-100 group-hover:text-indigo-200 transition-colors">
                  <Users className="w-12 h-12" />
                </div>
                <div className="relative z-10">
                  <div className="text-gray-600 text-xs font-black uppercase tracking-wider">총 지원자</div>
                  <div className="text-sm font-black text-gray-900 mt-1">{stats.total}<span className="text-sm font-black text-gray-500 ml-1">명</span></div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500 font-black">
                    <TrendingUp className="w-3 h-3 text-emerald-600 font-black" />
                    최근 7일 대비 +2명
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-md border-2 border-gray-100 p-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 text-emerald-100 group-hover:text-emerald-200 transition-colors">
                  <Star className="w-12 h-12" />
                </div>
                <div className="relative z-10">
                  <div className="text-gray-600 text-xs font-black uppercase tracking-wider">우수 인재 (A등급)</div>
                  <div className="text-sm font-black text-emerald-600 mt-1">{stats.byGrade.A}<span className="text-sm font-black text-gray-500 ml-1">명</span></div>
                  <div className="mt-2 text-[10px] text-gray-500 font-black">전체 대비 {stats.total > 0 ? ((stats.byGrade.A / stats.total) * 100).toFixed(1) : 0}% 비율</div>
                </div>
              </div>
              <div className="bg-white rounded-md border-2 border-gray-100 p-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 text-blue-100 group-hover:text-blue-200 transition-colors">
                  <Award className="w-12 h-12" />
                </div>
                <div className="relative z-10">
                  <div className="text-gray-600 text-xs font-black uppercase tracking-wider">평균 평가 점수</div>
                  <div className="text-sm font-black text-blue-600 mt-1">{stats.avgScore}<span className="text-sm font-black text-gray-500 ml-1">점</span></div>
                  <div className="mt-2 text-[10px] text-gray-500 font-black">전체 항목 기준 산출</div>
                </div>
              </div>
              <div className="bg-white rounded-md border-2 border-gray-100 p-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-1 text-amber-100 group-hover:text-amber-200 transition-colors">
                  <LayoutDashboard className="w-12 h-12" />
                </div>
                <div className="relative z-10">
                  <div className="text-gray-600 text-xs font-black uppercase tracking-wider">합격 결정 완료</div>
                  <div className="text-sm font-black text-amber-600 mt-1">{stats.passStatus["합격"] + stats.passStatus["불합격"]}<span className="text-sm font-black text-gray-500 ml-1">건</span></div>
                  <div className="mt-2 text-[10px] text-gray-500 font-black">미정 {stats.passStatus["미정"]}건 진행 중</div>
                </div>
              </div>
            </div>

            {/* Visual Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <div className="bg-white rounded-md border border-gray-200 p-2 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    등급별 분포 현황
                  </h3>
                  <div className="flex gap-2">
                    {Object.keys(GRADE_COLORS).map(g => (
                      <div key={g} className="flex items-center gap-1 text-[10px] text-gray-500">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GRADE_COLORS[g] }} />
                        {g}등급
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="grade"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fontWeight: 500, fill: "#64748b" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                        animationDuration={1500}
                      >
                        {gradeChartData.map((entry) => (
                          <Cell key={entry.grade} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-md border border-gray-200 p-2 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    분류 및 합격 여부
                  </h3>
                </div>
                <div className="grid grid-cols-2 h-[250px]">
                  <div className="relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {typeChartData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-gray-400">분류별</span>
                      <span className="text-sm font-bold text-gray-700">인원</span>
                    </div>
                  </div>
                  <div className="relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={passStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {passStatusData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-gray-400">합격여부</span>
                      <span className="text-sm font-bold text-gray-700">현황</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Rank Table Preview */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-2 py-1.5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">최근 고득점 지원자</h3>
                <button onClick={() => setViewMode("list")} className="text-xs text-indigo-600 hover:underline">전체보기</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">분류</th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">등급</th>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase">총점</th>
                      <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applicants.slice().sort((a, b) => b.totalScore - a.totalScore).slice(0, 5).map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-2 py-1 font-medium text-gray-900">{a.name}</td>
                        <td className="px-2 py-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${a.type === "강사" ? "bg-indigo-50 text-indigo-600" : "bg-purple-50 text-purple-600"}`}>
                            {TYPE_LABEL[a.type]} {a.type}
                          </span>
                        </td>
                        <td className="px-2 py-1">
                          <span className="font-bold" style={{ color: GRADE_COLORS[a.grade] }}>{a.grade}등급</span>
                        </td>
                        <td className="px-2 py-1 font-bold text-indigo-600">{a.totalScore}</td>
                        <td className="px-2 py-1 text-right">
                          <button onClick={() => setPreviewApplicant(a)} className="text-gray-400 hover:text-indigo-600">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-1"
          >
            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="지원자 검색..."
                    className="pl-9 pr-2 py-1 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 md:w-64 transition-all"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none"
                >
                  <option value="전체">전체 분류</option>
                  <option value="강사">강사</option>
                  <option value="직원">직원</option>
                </select>
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none"
                >
                  <option value="전체">전체 등급</option>
                  <option value="A">A등급</option>
                  <option value="B">B등급</option>
                  <option value="C">C등급</option>
                  <option value="D">D등급</option>
                </select>
                <div className="text-xs text-gray-400 ml-1">결과 {filtered.length}건</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedIds(expandedIds.size === filtered.length ? new Set() : new Set(filtered.map(a => a.id)))}
                  className="px-2 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                >
                  {expandedIds.size === filtered.length ? "모두 접기" : "모두 펼치기"}
                </button>
                <button
                  onClick={handleExcelDownload}
                  className="flex items-center gap-1.5 px-2 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  엑셀 다운로드
                </button>
              </div>
            </div>

            {/* Main Data Table */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-200 text-gray-700">
                      <th className="px-2 py-1 text-left font-black uppercase tracking-tighter" style={{ fontSize: "0.75rem" }}>등급</th>
                      <th className="px-2 py-1 text-left font-black uppercase tracking-tighter" style={{ fontSize: "0.75rem" }}>이름 / 분류</th>
                      <th className="px-2 py-1 text-left font-black uppercase tracking-tighter" style={{ fontSize: "0.75rem" }}>카테고리</th>
                      <th className="px-2 py-1 text-left font-black uppercase tracking-tighter" style={{ fontSize: "0.75rem" }}>경력 / 학력</th>
                      <th className="px-2 py-1 text-center font-black uppercase tracking-tighter" style={{ fontSize: "0.75rem" }}>상태</th>
                      <th className="px-2 py-1 text-center font-black uppercase tracking-tighter" style={{ fontSize: "0.75rem" }}>총점</th>
                      <th className="px-2 py-1 text-right font-black uppercase tracking-tighter" style={{ fontSize: "0.75rem" }}>관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-2 py-1 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <Users className="w-12 h-12 mb-1 opacity-20" />
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
                            <td className="px-2 py-1.5">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-xs"
                                style={{
                                  color: GRADE_COLORS[a.grade],
                                  backgroundColor: `${GRADE_COLORS[a.grade]}10`,
                                  borderColor: `${GRADE_COLORS[a.grade]}30`
                                }}>
                                {GRADE_EMOJI[a.grade]} {a.grade}
                              </span>
                            </td>
                            <td className="px-2 py-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{a.name}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${a.type === "강사" ? "bg-indigo-100 text-indigo-700" : "bg-purple-100 text-purple-700"}`}>
                                  {a.type}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400 mt-0.5">{a.date} / {a.mbti || "MBTI 미정"}</div>
                            </td>
                            <td className="px-2 py-1.5">
                              <div className="text-xs text-gray-700">{a.categoryLarge}</div>
                              <div className="text-[10px] text-gray-400 truncate max-w-[120px]">
                                {a.categoryMedium} {a.categorySmall && `> ${a.categorySmall}`}
                              </div>
                            </td>
                            <td className="px-2 py-1.5">
                              <div className="text-xs text-gray-700 flex items-center gap-1">
                                {a.career === "경력" ? `경력 ${a.careerYears}년` : "신입"}
                              </div>
                              <div className="text-[10px] text-gray-400">{a.education || "-"}</div>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                a.passStatus === "합격" ? "bg-emerald-100 text-emerald-700" :
                                a.passStatus === "불합격" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-600"
                              }`}>
                                {a.passStatus || "미정"}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span className="text-sm font-bold text-indigo-600">{a.totalScore}</span>
                            </td>
                            <td className="px-2 py-1.5 text-right">
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
                                  className="bg-gray-50/50 px-2 py-1 border-t border-gray-100"
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
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-sm">
          {previewApplicant && (
            <div className="bg-white">
              <div className="bg-indigo-600 px-2 py-1 text-white relative">
                <button
                  onClick={() => setPreviewApplicant(null)}
                  className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-end gap-1.5">
                  <div className="w-16 h-16 bg-white/20 rounded-md flex items-center justify-center text-sm shadow-inner">
                    {previewApplicant.type === "강사" ? "강" : "직"}
                  </div>
                  <div className="mb-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold">{previewApplicant.name}</h2>
                      <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium">{previewApplicant.type}</span>
                    </div>
                    <p className="text-indigo-100 text-sm mt-1">{previewApplicant.categoryLarge} &gt; {previewApplicant.categoryMedium} &gt; {previewApplicant.categorySmall}</p>
                  </div>
                  <div className="ml-auto flex flex-col items-end gap-1">
                    <div className="text-xs text-indigo-200">종합 평가 등급</div>
                    <div className="text-sm font-black bg-white text-indigo-600 w-12 h-12 flex items-center justify-center rounded-md shadow-sm border-2 border-indigo-400">
                      {previewApplicant.grade}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2 max-h-[70vh] overflow-y-auto">
                <DetailContent a={previewApplicant} />

                <div className="mt-1 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="text-xs text-gray-400">결정된 상태</div>
                    <div className={`px-2 py-1.5 rounded-full font-bold text-sm ${
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
