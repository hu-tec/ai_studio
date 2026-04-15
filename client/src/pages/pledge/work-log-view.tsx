import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  Clock,
  Send,
  LayoutGrid,
  History,
  Plus,
  Trash2,
  Edit3,
  FileSpreadsheet,
  FileText,
  Target,
  ArrowRight,
  ClipboardCheck,
  MoreVertical,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WorkEntry {
  id: string;
  time: string;
  task: string;
  status: 'done' | 'doing' | 'pending';
  category: string;
}

interface WorkLogViewProps {
  jobTitle: string;
  mode: 'view' | 'edit' | 'add' | 'delete';
  onModeChange: (mode: 'view' | 'edit' | 'add' | 'delete') => void;
}

const COLORS = ['#1e293b', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];

export const WorkLogView: React.FC<WorkLogViewProps> = ({ jobTitle, mode, onModeChange }) => {
  const [entries, setEntries] = useState<WorkEntry[]>(() => {
    // Initial 30-min slots from 09:00 to 18:00
    const slots = [];
    let current = 9 * 60;
    while (current < 18 * 60) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      slots.push({
        id: Math.random().toString(36).substr(2, 9),
        time: timeStr,
        task: '',
        status: 'pending' as const,
        category: '일반업무'
      });
      current += 30;
    }
    return slots;
  });

  const [history] = useState([
    { date: '2026-03-06', tasks: 12, performance: '120%', status: '승인됨' },
    { date: '2026-03-05', tasks: 9, performance: '90%', status: '승인됨' },
    { date: '2026-03-04', tasks: 11, performance: '110%', status: '승인됨' },
  ]);

  const jobRules = useMemo(() => {
    if (['개발자', '기획자', '디자이너'].includes(jobTitle)) {
      return {
        title: "개발/기획/디자인 업무 기준",
        target: "1일 10개 작업",
        items: [
          "1시간은 프롬프트 정리/수정으로 대처",
          "작업 기준 : 30분 단위",
          "타업무 지연 시 10/20분 단위 쪼개기",
          "문제 발생 시 즉시 다음 작업 진행",
          "추가 작업 시 별도 지급 없음",
          "매일 프롬프트 업그레이드 및 정리"
        ]
      };
    } else if (jobTitle === '마케터') {
      return {
        title: "마케팅 업무 기준",
        target: "1일 10개 콘텐츠",
        items: [
          "SNS / 블로그 / 광고 유형 등록",
          "등록 후 조회수 필수로 기록",
          "클릭/문의 발생 시 CRM 즉시 등록",
          "문의는 상담팀으로 즉시 전달"
        ]
      };
    } else {
      return {
        title: "전화/영업 업무 기준",
        target: "1일 100통 / 50건",
        items: [
          "결과 상세 기록 (신규, 연결, 상담 등)",
          "상담 대상 상담팀 전달",
          "추후 연락 대상 follow-up 등록",
          "거절 사유별 리스트업 관리"
        ]
      };
    }
  }, [jobTitle]);

  const chartData = useMemo(() => {
    const counts = entries.reduce((acc, curr) => {
      if (curr.task) acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as any);
    return [
      { name: '완료', value: counts.done || 0 },
      { name: '진행중', value: counts.doing || 0 },
      { name: '대기', value: counts.pending || 0 },
    ];
  }, [entries]);

  const updateEntry = (id: string, field: keyof WorkEntry, value: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleDownload = (type: 'excel' | 'word') => {
    alert(`${type.toUpperCase()} 파일로 업무일지를 다운로드합니다.`);
  };

  const handleSubmit = () => {
    alert('관리자에게 금일 업무 보고를 전송했습니다.');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Column 1: Job Regulations */}
      <div className="space-y-1">
        <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-2 py-1 border-b border-slate-50 flex items-center gap-2">
            <Target size={18} className="text-slate-900" />
            <h2 className="text-sm font-bold text-slate-900">5. 세부 업무 규정 ({jobTitle})</h2>
          </div>
          <div className="p-1 space-y-1">
            <div className="flex items-center justify-between p-1 bg-slate-900 rounded-md text-white">
              <span className="text-xs font-medium">일일 목표 할당량</span>
              <span className="text-sm font-bold">{jobRules.target}</span>
            </div>
            <ul className="space-y-1">
              {jobRules.items.map((item, i) => (
                <li key={i} className="flex items-start gap-1 text-xs text-slate-600 leading-relaxed">
                  <div className="mt-1 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-slate-100 mt-1.5">
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <ClipboardCheck size={12} />
                <span>30분 단위 업무 일지 작성이 원칙입니다.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-1.5">현재 현황 요약</h3>
          <div className="grid grid-cols-2 gap-1">
            <div className="p-1 bg-slate-50 rounded-md">
              <span className="block text-[10px] text-slate-500 mb-1">완료 항목</span>
              <span className="text-sm font-bold text-slate-900">{chartData[0].value}</span>
            </div>
            <div className="p-1 bg-slate-50 rounded-md">
              <span className="block text-[10px] text-slate-500 mb-1">진행률</span>
              <span className="text-sm font-bold text-slate-900">
                {Math.round((chartData[0].value / entries.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Column 2: 30-min Log Input */}
      <div className="xl:col-span-1 bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
        <div className="px-2 py-1 border-b border-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-slate-900" />
            <h2 className="text-sm font-bold text-slate-900">일일 업무 일지 (30분 단위)</h2>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
             <button onClick={() => onModeChange('add')} className={cn("p-1 rounded", mode === 'add' ? "bg-white shadow-sm" : "text-slate-400")}><Plus size={14}/></button>
             <button onClick={() => onModeChange('edit')} className={cn("p-1 rounded", mode === 'edit' ? "bg-white shadow-sm" : "text-slate-400")}><Edit3 size={14}/></button>
             <button onClick={() => onModeChange('delete')} className={cn("p-1 rounded", mode === 'delete' ? "bg-white shadow-sm" : "text-slate-400")}><Trash2 size={14}/></button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-1 space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "group flex items-center gap-1 p-2.5 rounded-md border transition-all",
                entry.task ? "bg-white border-slate-100 shadow-sm" : "bg-slate-50/50 border-transparent border-dashed border-slate-200"
              )}
            >
              <div className="shrink-0 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {entry.time}
              </div>
              <div className="flex-grow min-w-0">
                {mode === 'edit' || mode === 'add' || !entry.task ? (
                  <input
                    type="text"
                    placeholder="수행 업무를 입력하세요"
                    value={entry.task}
                    onChange={(e) => updateEntry(entry.id, 'task', e.target.value)}
                    className="w-full bg-transparent border-none text-xs p-0 focus:ring-0 placeholder:text-slate-300"
                  />
                ) : (
                  <p className="text-xs text-slate-700 truncate">{entry.task}</p>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <select
                  value={entry.status}
                  onChange={(e) => updateEntry(entry.id, 'status', e.target.value)}
                  className={cn(
                    "text-[10px] bg-transparent border-none p-0 focus:ring-0 font-bold",
                    entry.status === 'done' ? "text-emerald-600" : entry.status === 'doing' ? "text-blue-600" : "text-slate-400"
                  )}
                >
                  <option value="pending">대기</option>
                  <option value="doing">진행</option>
                  <option value="done">완료</option>
                </select>
                {mode === 'delete' && (
                  <button onClick={() => deleteEntry(entry.id)} className="text-red-300 hover:text-red-500">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-1 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            onClick={handleSubmit}
            className="w-full py-1 bg-slate-900 text-white rounded-md text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-slate-200 hover:scale-[1.02] transition-transform"
          >
            <Send size={14} />
            관리자에게 업무 보고 전송
          </button>
        </div>
      </div>

      {/* Column 3: Statistics & Graphs */}
      <div className="space-y-1">
        <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-2 py-1 border-b border-slate-50 flex items-center gap-2">
            <TrendingUp size={18} className="text-slate-900" />
            <h2 className="text-sm font-bold text-slate-900">현황 분석 리포트</h2>
          </div>
          <div className="p-1">
            <div className="h-48 w-full mb-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1">
              {chartData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    {d.name}
                  </div>
                  <span className="font-bold text-slate-900">{d.value}건</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-2 space-y-1">
          <h3 className="text-sm font-bold text-slate-400 uppercase">내보내기 옵션</h3>
          <div className="grid grid-cols-2 gap-1">
            <button onClick={() => handleDownload('excel')} className="flex items-center justify-center gap-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold hover:bg-emerald-100 transition-colors">
              <FileSpreadsheet size={14} />
              엑셀 다운
            </button>
            <button onClick={() => handleDownload('word')} className="flex items-center justify-center gap-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors">
              <FileText size={14} />
              워드 다운
            </button>
          </div>
        </div>
      </div>

      {/* Column 4: History Data */}
      <div className="space-y-1">
        <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="px-2 py-1 border-b border-slate-50 flex items-center gap-2">
            <History size={18} className="text-slate-900" />
            <h2 className="text-sm font-bold text-slate-900">이전 업무 기록 (히스토리)</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {history.map((h, i) => (
              <div key={i} className="p-2 hover:bg-slate-50 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-slate-400">{h.date}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md font-bold">
                    {h.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase mb-0.5">수행 업무</p>
                      <p className="text-xs font-bold text-slate-700">{h.tasks}건</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase mb-0.5">목표 성과</p>
                      <p className="text-xs font-bold text-slate-700">{h.performance}</p>
                    </div>
                  </div>
                  <button className="p-1 text-slate-300 group-hover:text-slate-900 transition-colors">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 bg-slate-50 border-t border-slate-50 text-center">
            <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600">전체 히스토리 보기</button>
          </div>
        </div>

        <div className="p-2 rounded-md bg-slate-900 text-white space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <h3 className="text-sm font-bold">작성 가이드</h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            업무 일지는 투명한 성과 관리를 위해 정직하게 작성되어야 합니다. 누락된 시간대는 사유를 비고란에 적어주세요.
          </p>
          <div className="pt-2">
             <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-emerald-400" />
             </div>
             <p className="text-[9px] text-slate-500 mt-1">이달의 목표 달성도: 75%</p>
          </div>
        </div>
      </div>

    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
