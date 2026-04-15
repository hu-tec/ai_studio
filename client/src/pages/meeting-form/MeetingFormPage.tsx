import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  List,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  Edit,
  Trash2,
  Lock,
  Star,
  MapPin,
  CheckCircle2,
  Clock,
  Filter,
  Settings2,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  PieChart,
  Tag,
  Share2,
  ExternalLink,
  Check,
  TrendingUp,
  Briefcase,
  User,
  Activity,
  LayoutGrid,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Pause
} from 'lucide-react';
import { toast } from 'sonner';
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  subDays,
  eachDayOfInterval,
  parseISO,
  isToday,
  startOfDay,
  eachMonthOfInterval,
  startOfYear,
  endOfYear
} from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './ImageWithFallback';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  Legend
} from 'recharts';
import { cn } from '@/components/ui/utils';

// --- Classification Data (A/D/E) ---

const FIELD_A: Record<string, string[]> = {
  '문서': ['비즈니스', '법률', '의료', '특허', '노무', '교재', '논문', '기사', '고전'],
  '음성': ['아나운서', '관광가이드', '큐레이터', '안내 방송', '교육 강의', '실시간', '화상수업'],
  '영상/SNS': ['미디어/장르'],
  'IT/개발': ['개발/보안', '디자인/기획'],
  '창의적활동': ['콘텐츠'],
  '번역': ['불번역 방식', '통번역 방식'],
  '확장영역': ['라이프/전문']
};

const DEPT_D: Record<string, string[]> = {
  '기획': [],
  '홈피': [],
  '영업': [],
  '마케팅': [],
  '강사 팀': ['테솔', '프롬프트', 'AI번역', '윤리'],
  '커리 교제 팀': ['테솔', '프롬프트', 'AI번역', '윤리'],
  '문제은행팀': ['프롬프트', 'AI번역', '윤리']
};

const GRADE_E = ['알바', '신입', '강사', '팀장', '개발', '외부', '임원', '대표'];

// --- Types ---

type ScheduleStatus = 'pending' | 'hold' | 'rejected' | 'confirmed';

interface ScheduleRequest {
  id: string;
  title: string;
  applicant: string;
  field: string;
  subField: string;
  dept: string;
  subDept: string;
  grade: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  note: string;
  status: ScheduleStatus;
  isImportant: boolean;
}

// --- Mock Initial Data ---

const INITIAL_REQUESTS: ScheduleRequest[] = [
  {
    id: 'req-1',
    title: '비즈니스 전략 제안서 검토',
    applicant: '김전문',
    field: '문서',
    subField: '비즈니스',
    dept: '기획',
    subDept: '',
    grade: '팀장',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:30',
    duration: '60',
    location: '본사 대회의실',
    note: 'Q3 신규 프로젝트 관련 건',
    status: 'confirmed',
    isImportant: true
  },
  {
    id: 'req-2',
    title: 'AI 번역 알고리즘 미팅',
    applicant: '이개발',
    field: 'IT/개발',
    subField: '개발/보안',
    dept: '문제은행팀',
    subDept: 'AI번역',
    grade: '개발',
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    time: '14:00',
    duration: '30',
    location: 'Zoom 화상회의',
    note: '신규 엔진 성능 테스트 보고',
    status: 'pending',
    isImportant: false
  },
  {
    id: 'req-3',
    title: '프롬프트 엔지니어링 강의',
    applicant: '박강사',
    field: '음성',
    subField: '교육 강의',
    dept: '강사 팀',
    subDept: '프롬프트',
    grade: '강사',
    date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    time: '11:00',
    duration: '60',
    location: '오프라인 강의장 B',
    note: '신입 교육용 커리큘럼',
    status: 'pending',
    isImportant: false
  }
];

export default function MeetingFormPage() {
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');
  const [periodType, setPeriodType] = useState<'day' | 'month' | 'year'>('month');
  const [requests, setRequests] = useState<ScheduleRequest[]>(INITIAL_REQUESTS);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showPreview, setShowPreview] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ScheduleRequest | null>(null);

  // Address Modal States
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isZoomMeeting, setIsZoomMeeting] = useState(false);
  const [jibeonAddress, setJibeonAddress] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [locationValue, setLocationValue] = useState('');
  const [formFieldA, setFormFieldA] = useState('');
  const [formDeptD, setFormDeptD] = useState('');

  // Stats
  const stats = useMemo(() => {
    const total = requests.length;
    const confirmed = requests.filter(r => r.status === 'confirmed').length;
    const pending = requests.filter(r => r.status === 'pending').length;
    return { total, confirmed, pending, rate: total > 0 ? Math.round((confirmed / total) * 100) : 0 };
  }, [requests]);

  const statsChartData = useMemo(() => {
    const data: Record<string, number> = {};
    requests.forEach(r => {
      data[r.field] = (data[r.field] || 0) + 1;
    });
    return Object.entries(data).map(([name, value], i) => ({
      name,
      value,
      color: ['#1e293b', '#6366f1', '#f59e0b', '#10b981', '#ef4444'][i % 5]
    }));
  }, [requests]);

  // Actions
  const handlePrev = () => {
    if (periodType === 'year') setCurrentMonth(subYears(currentMonth, 1));
    else if (periodType === 'month') setCurrentMonth(subMonths(currentMonth, 1));
    else setCurrentMonth(subDays(currentMonth, 1));
  };

  const handleNext = () => {
    if (periodType === 'year') setCurrentMonth(addYears(currentMonth, 1));
    else if (periodType === 'month') setCurrentMonth(addMonths(currentMonth, 1));
    else setCurrentMonth(addDays(currentMonth, 1));
  };

  const navTitle = useMemo(() => {
    if (periodType === 'year') return format(currentMonth, 'yyyy년');
    if (periodType === 'month') return format(currentMonth, 'yyyy년 MM월');
    return format(currentMonth, 'yyyy년 MM월 dd일');
  }, [currentMonth, periodType]);

  const handleStatusUpdate = (id: string, newStatus: ScheduleStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    const statusMsg = newStatus === 'confirmed' ? '승인' : newStatus === 'hold' ? '보류' : '불가';
    toast.success(`해당 요청이 [${statusMsg}] 처리되었습니다.`);
  };

  const handleCopyLink = async () => {
    const mockUrl = `https://apply.dashboard.com/meeting/${format(new Date(), 'yyyyMMdd')}`;
    try {
      await navigator.clipboard.writeText(mockUrl);
      toast.success('전문가 신청 링크가 복사되었습니다!', {
        description: '이 링크를 전문가에게 전달하여 신청을 받으세요.'
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('링크 복사에 실패했습니다.', {
        description: '브라우저 보안 설정으로 인해 복사가 차단되었을 수 있습니다.'
      });
    }
    setShowPreview(true);
  };

  // Applicant Preview View
  if (showPreview) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-2">
        <button
          onClick={() => setShowPreview(false)}
          className="fixed top-8 left-8 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full text-white text-sm font-bold border border-white/10 backdrop-blur-md transition-all"
        >
          <ChevronLeft size={16} /> 대시보드 복귀
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-5xl bg-white rounded-lg overflow-hidden flex flex-col md:flex-row shadow-sm min-h-[700px]"
        >
          <div className="flex-1 p-3 border-r border-slate-100 bg-slate-50/30">
            <div className="mb-1">
              <h1 className="text-sm font-black text-slate-800 mb-2">전문가 미팅 신청</h1>
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Expert Application Portal</p>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">분야 (Field A)</label>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(FIELD_A).map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormFieldA(formFieldA === f ? '' : f)}
                        className={`px-2 py-1 text-[11px] font-bold rounded-md border ${formFieldA === f ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-800'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">부서 (Dept D)</label>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(DEPT_D).map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFormDeptD(formDeptD === d ? '' : d)}
                        className={`px-2 py-1 text-[11px] font-bold rounded-md border ${formDeptD === d ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-800'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">등급/직급 (Grade E)</label>
                  <div className="flex flex-wrap gap-2">
                    {GRADE_E.map(g => (
                      <button key={g} className="px-2 py-1.5 bg-white border border-slate-200 rounded-md text-[11px] font-black text-slate-600 hover:border-slate-800 transition-all">{g}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">신청 일자</label>
                  <input type="date" className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-sm font-bold outline-none" />
                </div>
              </div>

              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">미팅 장소 (Location)</label>
                <div
                  onClick={() => setShowAddressModal(true)}
                  className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-sm font-bold cursor-pointer hover:border-slate-800 transition-all min-h-[48px] flex items-center text-slate-400"
                >
                  {isZoomMeeting ? "Zoom 온라인 미팅 (주소 불필요)" : (locationValue || "예: 본사 3층 대회의실 또는 주소 검색")}
                </div>

                {/* Address Search Modal */}
                <AnimatePresence>
                  {showAddressModal && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-200 shadow-sm rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-rose-500 font-black text-sm">*</span>
                          <h3 className="text-sm font-black text-slate-800">주소</h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={isZoomMeeting}
                              onChange={(e) => setIsZoomMeeting(e.target.checked)}
                              className="w-5 h-5 rounded-lg border-2 border-slate-300 text-slate-800 focus:ring-0 transition-all cursor-pointer"
                            />
                            <span className="text-xs font-black text-slate-600 group-hover:text-slate-800 transition-colors">Zoom 미팅요청</span>
                          </label>
                          <button
                            onClick={() => setShowAddressModal(false)}
                            className="p-2 hover:bg-slate-100 rounded-md transition-all"
                          >
                            <X size={18} className="text-slate-400" />
                          </button>
                        </div>
                      </div>

                      <div className={cn("space-y-1 transition-all duration-300", isZoomMeeting && "opacity-30 pointer-events-none")}>
                        <div className="flex items-center gap-2">
                          <label className="w-24 text-xs font-black text-slate-500">지번주소</label>
                          <input
                            type="text"
                            value={jibeonAddress}
                            onChange={(e) => setJibeonAddress(e.target.value)}
                            placeholder="주소를 입력하세요"
                            className="flex-1 bg-slate-50 border border-slate-100 rounded-md px-2 py-1 text-xs font-bold focus:bg-white focus:border-slate-800 outline-none transition-all"
                          />
                          <button className="px-2 py-1 bg-white border border-slate-800 text-slate-800 rounded-md text-xs font-black hover:bg-slate-800 hover:text-white transition-all">검색</button>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="w-24 text-xs font-black text-slate-500">도로명주소</label>
                          <input
                            type="text"
                            value={roadAddress}
                            onChange={(e) => setRoadAddress(e.target.value)}
                            placeholder="주소를 입력하세요"
                            className="flex-1 bg-slate-50 border border-slate-100 rounded-md px-2 py-1 text-xs font-bold focus:bg-white focus:border-slate-800 outline-none transition-all"
                          />
                          <button className="px-2 py-1 bg-white border border-slate-800 text-slate-800 rounded-md text-xs font-black hover:bg-slate-800 hover:text-white transition-all">검색</button>
                        </div>

                        <div className="pt-2 border-t border-slate-50 mt-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">배송메세지 (추가 안내)</label>
                          <textarea
                            rows={2}
                            placeholder="비고 또는 상세 장소 안내를 입력해주세요 (예: 101호 앞)"
                            className="w-full bg-slate-50 border border-slate-100 rounded-md px-2 py-1 text-xs font-bold focus:bg-white focus:border-slate-800 outline-none resize-none transition-all"
                          />
                          <p className="text-[9px] text-slate-400 font-bold mt-2 flex items-center gap-1 italic">• 상세 장소 정보를 정확히 입력해 주세요.</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (isZoomMeeting) {
                            setLocationValue("Zoom 온라인 미팅");
                          } else if (roadAddress || jibeonAddress) {
                            setLocationValue(roadAddress || jibeonAddress);
                          }
                          setShowAddressModal(false);
                        }}
                        className="w-full py-1 bg-slate-800 text-white rounded-md text-sm font-black shadow-sm hover:bg-slate-700 active:scale-[0.98] transition-all"
                      >
                        선택 완료
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">신청 제목</label>
                <input type="text" placeholder="예: [IT/보안] 시스템 취약점 점검 미팅 신청" className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-sm font-bold outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">신청 사유 및 상세 내용</label>
                <textarea rows={4} className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-sm font-bold outline-none resize-none" placeholder="내용을 입력하세요." />
              </div>

              <button
                onClick={() => {
                  toast.success('미팅 신청이 완료되었습니다!', { description: '관리자가 검토 후 확정 여부를 안내해 드립니다.' });
                  setShowPreview(false);
                }}
                className="w-full bg-slate-800 text-white py-1 rounded-md font-black text-md shadow-sm hover:bg-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1"
              >
                <CheckCircle2 size={20} /> 신청서 제출하기
              </button>
            </div>
          </div>
          <div className="w-full md:w-[320px] bg-slate-800 p-3 text-white flex flex-col justify-center">
            <div className="space-y-2">
              <div className="w-16 h-16 bg-white/10 rounded-md flex items-center justify-center">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-sm font-black leading-tight">신청 전 확인하세요</h2>
              <ul className="space-y-1 opacity-70 text-sm font-bold">
                <li className="flex gap-2"><span>•</span> 미팅은 관리자 승인 후 캘린더에 노출됩니다.</li>
                <li className="flex gap-2"><span>•</span> 신청 시 기재하신 분야와 부서는 데이터 분류에 활용됩니다.</li>
                <li className="flex gap-2"><span>•</span> 긴급 건은 비서팀으로 별도 연락 바랍니다.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200 flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-2 py-1 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-slate-800 text-white rounded-[1rem] shadow-sm shadow-slate-200">
            <Settings2 size={24} />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800">스케줄링 대시보드</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">CEO SECRETARY DASHBOARD</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-md border border-slate-200/50">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-slate-600 tracking-tight">SYSTEM ACTIVE</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="text-right">
              <p className="text-xs font-black text-slate-800 leading-none mb-1">CEO Admin</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Master Control</p>
            </div>
            <div className="w-10 h-10 rounded-md bg-slate-200 border border-slate-300 overflow-hidden shadow-sm">
              <ImageWithFallback src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&h=100&fit=crop" alt="admin" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex gap-2 p-2">
        {/* Main Section (Regulation 1, 2) */}
        <section className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* Dashboard Summary & View Toggle */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/30 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-200/50 p-1.5 rounded-[1.25rem] border border-slate-200/50">
                  <button onClick={() => setViewType('calendar')} className={cn("px-2 py-1 rounded-md text-sm font-black transition-all flex items-center gap-2", viewType === 'calendar' ? "bg-white text-slate-800 shadow-md" : "text-slate-400 hover:text-slate-600")}><LayoutGrid size={18} /> 캘린더형</button>
                  <button onClick={() => setViewType('list')} className={cn("px-2 py-1 rounded-md text-sm font-black transition-all flex items-center gap-2", viewType === 'list' ? "bg-white text-slate-800 shadow-md" : "text-slate-400 hover:text-slate-600")}><List size={18} /> 리스트형</button>
                </div>

                {/* Year/Month/Day Summary Toggle */}
                <div className="flex items-center bg-slate-200/50 p-1.5 rounded-[1.25rem] border border-slate-200/50">
                  <button onClick={() => setPeriodType('year')} className={cn("px-2 py-1 rounded-md text-[11px] font-black transition-all", periodType === 'year' ? "bg-slate-800 text-white shadow-md" : "text-slate-400")}>년</button>
                  <button onClick={() => setPeriodType('month')} className={cn("px-2 py-1 rounded-md text-[11px] font-black transition-all", periodType === 'month' ? "bg-slate-800 text-white shadow-md" : "text-slate-400")}>월</button>
                  <button onClick={() => setPeriodType('day')} className={cn("px-2 py-1 rounded-md text-[11px] font-black transition-all", periodType === 'day' ? "bg-slate-800 text-white shadow-md" : "text-slate-400")}>일</button>
                </div>
              </div>

              <div className="flex items-center bg-white border border-slate-200 rounded-[1.25rem] p-1.5 shadow-sm">
                <button onClick={handlePrev} className="p-2 hover:bg-slate-50 rounded-md transition-colors"><ChevronLeft size={20} className="text-slate-400" /></button>
                <span className="text-sm font-black px-2 min-w-[150px] text-center text-slate-800">{navTitle}</span>
                <button onClick={handleNext} className="p-2 hover:bg-slate-50 rounded-md transition-colors"><ChevronRight size={20} className="text-slate-400" /></button>
              </div>
            </div>

            {/* Visual Stats Summary */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '전체 신청', value: stats.total, icon: Briefcase, color: 'slate', trend: '+12.5%' },
                { label: '확정 일정', value: stats.confirmed, icon: CheckCircle2, color: 'emerald', trend: '최적' },
                { label: '평균 소요', value: '35분', icon: Clock, color: 'amber', trend: '보통' },
                { label: '예약 점유율', value: `${stats.rate}%`, icon: TrendingUp, color: 'indigo', trend: '+5.2%' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm hover:shadow-sm transition-all flex items-center gap-2 group">
                  <div className={cn(
                    "p-1.5 rounded-md transition-transform group-hover:scale-110",
                    stat.color === 'slate' ? "bg-slate-100 text-slate-600" :
                    stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                    stat.color === 'amber' ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"
                  )}>
                    <stat.icon size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                      <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">{stat.trend}</span>
                    </div>
                    <p className="text-xs font-black text-slate-800 leading-none mt-1.5">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Grid View */}
          <div className="flex-1 overflow-y-auto p-1">
            {viewType === 'calendar' ? (
              <div className="flex flex-col h-full">
                {periodType === 'month' && (
                  <>
                    <div className="grid grid-cols-7 border-b border-slate-100 pb-2">
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
                        <div key={i} className={cn("text-center text-[10px] font-black uppercase tracking-[0.2em]", i === 0 ? "text-rose-400" : i === 6 ? "text-indigo-400" : "text-slate-400")}>{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 flex-1 border-l border-t border-slate-100 mt-2">
                      {(() => {
                        const monthStart = startOfMonth(currentMonth);
                        const monthEnd = endOfMonth(monthStart);
                        const startDate = startOfWeek(monthStart);
                        const endDate = endOfWeek(monthEnd);
                        const days = eachDayOfInterval({ start: startDate, end: endDate });

                        return days.map(day => {
                          const dayRequests = requests.filter(r => r.status === 'confirmed' && isSameDay(parseISO(r.date), day));
                          const isCurrentMonth = isSameMonth(day, monthStart);
                          const isTodayDate = isSameDay(day, new Date());

                          return (
                            <div key={day.toISOString()} onClick={() => { setSelectedDate(day); setPeriodType('day'); setCurrentMonth(day); }} className={cn("min-h-[160px] p-2 border-r border-b border-slate-100 transition-all flex flex-col gap-1 relative group cursor-pointer", !isCurrentMonth ? "bg-slate-50/30 opacity-40" : "bg-white", isTodayDate && "bg-slate-50/50")}>
                              <div className="flex items-center justify-between">
                                <span className={cn("text-sm font-black w-7 h-7 flex items-center justify-center rounded-md", isTodayDate ? "bg-slate-800 text-white shadow-sm" : "text-slate-600")}>{format(day, 'd')}</span>
                                {isCurrentMonth && (
                                  <div className={cn("px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter border", dayRequests.length > 0 ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-emerald-50 text-emerald-600 border-emerald-100")}>
                                    {dayRequests.length > 0 ? '요청불가' : '요청가능'}
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1.5 overflow-hidden">
                                {dayRequests.map(r => (
                                  <motion.div key={r.id} layoutId={r.id} onClick={(e) => { e.stopPropagation(); setSelectedRequest(r); }} className="p-2 bg-slate-800 text-white rounded-md text-[10px] font-black flex flex-col gap-1 cursor-pointer hover:bg-slate-700 transition-all border-l-4 border-indigo-400">
                                    <span className="truncate">{r.title}</span>
                                    <span className="opacity-60 font-bold">{r.time} ({r.duration}m)</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </>
                )}

                {periodType === 'day' && (
                  <div className="flex flex-col gap-2 h-full">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-sm font-black text-slate-800">{format(currentMonth, 'EEEE, MMM dd')}</h3>
                      <button onClick={() => setPeriodType('month')} className="px-2 py-1 bg-slate-100 rounded-md text-xs font-black text-slate-600 hover:bg-slate-200 transition-all">월별 보기로 전환</button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                      {requests.filter(r => r.status === 'confirmed' && isSameDay(parseISO(r.date), currentMonth)).length > 0 ? (
                        requests.filter(r => r.status === 'confirmed' && isSameDay(parseISO(r.date), currentMonth)).sort((a, b) => a.time.localeCompare(b.time)).map(r => (
                          <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => setSelectedRequest(r)}
                            className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm hover:shadow-sm transition-all cursor-pointer flex items-center gap-2 group"
                          >
                            <div className="w-16 h-16 bg-slate-800 text-white rounded-md flex flex-col items-center justify-center font-black">
                              <span className="text-xs opacity-60">TIME</span>
                              <span className="text-sm">{r.time}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{r.title}</h4>
                              <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                <span>장소: {r.location}</span>
                                <span>신청자: {r.applicant} ({r.grade})</span>
                              </p>
                            </div>
                            <div className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase">Confirmed</div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                          <Clock size={48} className="mb-1.5" />
                          <p className="font-black">확정된 일정이 없습니다.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {periodType === 'year' && (
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    {eachMonthOfInterval({ start: startOfYear(currentMonth), end: endOfYear(currentMonth) }).map(month => {
                      const monthRequests = requests.filter(r => r.status === 'confirmed' && isSameMonth(parseISO(r.date), month));
                      return (
                        <div
                          key={month.toISOString()}
                          onClick={() => { setCurrentMonth(month); setPeriodType('month'); }}
                          className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm hover:shadow-sm transition-all cursor-pointer group flex flex-col items-center text-center gap-2"
                        >
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, monthRequests.length * 20)}%` }}
                              className="h-full bg-indigo-500"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{format(month, 'MMM')}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(month, 'yyyy')}</p>
                          </div>
                          <div className="px-2 py-1.5 bg-slate-50 rounded-full text-[10px] font-black text-slate-500">
                            {monthRequests.length}개의 일정
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-2 pb-2">
                {requests.filter(r => r.status === 'confirmed').sort((a, b) => a.date.localeCompare(b.date)).map(r => (
                  <motion.div key={r.id} layoutId={r.id} onClick={() => setSelectedRequest(r)} className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm hover:shadow-sm hover:border-slate-800 transition-all cursor-pointer flex items-center gap-1 group">
                    <div className="w-20 h-20 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-all">
                      <span className="text-[10px] font-black uppercase mb-1">{format(parseISO(r.date), 'MMM')}</span>
                      <span className="text-xs font-black">{format(parseISO(r.date), 'd')}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-2">
                        <h4 className="text-sm font-black text-slate-800">{r.title}</h4>
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase">{r.dept}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                        <div className="flex items-center gap-2"><Clock size={16} /> {r.time} ({r.duration}분)</div>
                        <div className="flex items-center gap-2"><MapPin size={16} /> {r.location}</div>
                        <div className="flex items-center gap-2"><User size={16} /> {r.applicant} ({r.grade})</div>
                      </div>
                    </div>
                    <ChevronRight size={24} className="text-slate-200 group-hover:text-slate-800" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Sidebar (Req Status Area) */}
        <aside className="w-[380px] flex flex-col gap-1">
          {/* Analysis Section */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 flex flex-col h-[350px] shrink-0">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-1 mb-1.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md"><PieChart size={20} /></div>
              신청 분포 분석
            </h2>
            <div className="flex-1 relative min-h-0 w-full">
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={statsChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {statsChartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <ReTooltip
                      contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        fontWeight: '900',
                        fontSize: '12px'
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-1.5">
              <button onClick={handleCopyLink} className="w-full bg-slate-800 text-white py-1 rounded-md font-black text-sm flex items-center justify-between px-2 hover:bg-slate-700 transition-all shadow-sm shadow-slate-200 group">
                <div className="flex items-center gap-1">
                  <Share2 size={18} className="group-hover:rotate-12 transition-transform" />
                  <span>신청 링크 복사</span>
                </div>
                <ChevronRight size={16} className="opacity-40" />
              </button>

              <button onClick={() => setShowPreview(true)} className="w-full bg-white text-slate-800 py-1 rounded-md font-black text-sm flex items-center justify-between px-2 hover:bg-slate-50 border border-slate-200 transition-all group">
                <div className="flex items-center gap-1">
                  <Eye size={18} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
                  <span>신청화면 미리보기</span>
                </div>
                <ChevronRight size={16} className="opacity-40" />
              </button>
            </div>
          </div>

          {/* Application Status Area */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 flex flex-col flex-1 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-1">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            </div>
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-1 mb-2">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-md"><AlertCircle size={20} /></div>
              신청 접수 현황
            </h2>

            <div className="flex-1 overflow-y-auto space-y-1 pr-2">
              {requests.filter(r => r.status === 'pending').length > 0 ? (
                requests.filter(r => r.status === 'pending').map((r, i) => (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={r.id} className="p-2 bg-slate-50 border border-slate-100 rounded-lg space-y-1 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase">Pending</span>
                          <span className="text-[9px] font-bold text-slate-400">{r.date} {r.time}</span>
                        </div>
                        <h4 className="font-black text-slate-800 text-sm leading-tight mb-1">{r.title}</h4>
                        <p className="text-[10px] font-bold text-slate-500">{r.applicant} • {r.grade} • {r.dept}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => handleStatusUpdate(r.id, 'confirmed')} className="flex items-center justify-center gap-1.5 py-1 bg-white text-emerald-600 rounded-md text-[10px] font-black border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all"><ThumbsUp size={12} /> 승인</button>
                      <button onClick={() => handleStatusUpdate(r.id, 'hold')} className="flex items-center justify-center gap-1.5 py-1 bg-white text-amber-600 rounded-md text-[10px] font-black border border-amber-100 hover:bg-amber-600 hover:text-white transition-all"><Pause size={12} /> 보류</button>
                      <button onClick={() => handleStatusUpdate(r.id, 'rejected')} className="flex items-center justify-center gap-1.5 py-1 bg-white text-rose-600 rounded-md text-[10px] font-black border border-rose-100 hover:bg-rose-600 hover:text-white transition-all"><ThumbsDown size={12} /> 불가</button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-3 opacity-40">
                  <div className="p-2 bg-slate-50 rounded-lg mb-1.5">
                    <CheckCircle2 size={32} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-400">새로운 신청이 없습니다.</p>
                </div>
              )}
            </div>

            {/* Export Section */}
            <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button className="flex flex-col items-center gap-2 p-2 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100 hover:bg-emerald-100 transition-all"><FileSpreadsheet size={20} /><span className="text-[10px] font-black uppercase">Excel</span></button>
              <button className="flex flex-col items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-md border border-blue-100 hover:bg-blue-100 transition-all"><FileText size={20} /><span className="text-[10px] font-black uppercase">Word</span></button>
            </div>
          </div>
        </aside>
      </main>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-2">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRequest(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-[450px] bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200">
              <div className="h-60 relative overflow-hidden bg-slate-100">
                <ImageWithFallback src="https://images.unsplash.com/photo-1722082839841-45473f5a15cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXAlMjBzYXRlbGxpdGUlMjB2aWV3JTIwY2l0eXxlbnwxfHx8fDE3NzMxMTA1Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="map" className="w-full h-full object-cover transition-all" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <button onClick={() => setSelectedRequest(null)} className="absolute top-8 right-8 bg-white/90 backdrop-blur-md p-2.5 rounded-md shadow-sm hover:bg-slate-800 hover:text-white transition-all"><X size={20} /></button>
                <div className="absolute bottom-8 left-8 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md shadow-sm">
                  <MapPin size={18} className="text-slate-800" />
                  <span className="text-xs font-black text-slate-800">{selectedRequest.location}</span>
                </div>
              </div>

              <div className="p-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1.5 bg-slate-800 text-white rounded-md text-[10px] font-black uppercase tracking-widest">{selectedRequest.status}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /> ID: {selectedRequest.id}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight leading-tight">{selectedRequest.title}</h3>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2 py-1 bg-slate-50 text-slate-500 rounded-md text-[11px] font-black border border-slate-100">분야: {selectedRequest.field}</span>
                    <span className="px-2 py-1 bg-slate-50 text-slate-500 rounded-md text-[11px] font-black border border-slate-100">부서: {selectedRequest.dept}</span>
                    <span className="px-2 py-1 bg-slate-50 text-slate-500 rounded-md text-[11px] font-black border border-slate-100">직급: {selectedRequest.grade}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1 border-t border-b border-slate-100 py-1">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">일시</p>
                    <p className="text-sm font-black text-slate-800">{selectedRequest.date} • {selectedRequest.time}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">소요 시간</p>
                    <p className="text-sm font-black text-slate-800">{selectedRequest.duration}분 예정</p>
                  </div>
                </div>
                {selectedRequest.note && (
                  <div className="p-2 bg-slate-50 rounded-md border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">상세 메모</p>
                    <p className="text-sm text-slate-600 leading-relaxed font-bold italic">"{selectedRequest.note}"</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button className="flex-1 bg-slate-800 text-white py-1 rounded-md font-black text-md flex items-center justify-center gap-1 shadow-sm hover:bg-slate-700 transition-all"><Edit size={18} /> 수정하기</button>
                  <button className="p-2 bg-white border border-slate-200 rounded-md text-rose-500 hover:bg-rose-50 transition-all"><Trash2 size={20} /></button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
