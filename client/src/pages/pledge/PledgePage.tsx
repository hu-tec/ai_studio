import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileText,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  FileSpreadsheet,
  Signature,
  Calendar,
  User,
  Briefcase,
  Target,
  Clock,
  ClipboardCheck,
  Building2,
  FileCheck,
  TrendingUp,
  History,
  LayoutGrid,
  UserCircle,
  Settings,
  ClipboardList,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PolicyItem } from './policy-item';
import { KpiTable } from './kpi-table';
import { WorkLogView } from './work-log-view';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Mode = 'view' | 'edit' | 'add' | 'delete';

interface Section {
  id: string;
  title: string;
  emoji: string;
  items: { id: string; text: string; emoji?: string }[];
}

const initialData: Record<string, Section> = {
  security: {
    id: 'security',
    title: '2. 보안 규정',
    emoji: '🔒',
    items: [
      { id: 's1', text: '회사 데이터 및 자료를 개인 저장 장치에 저장하지 않는다.' },
      { id: 's2', text: '회사 데이터베이스(DB)를 개인적으로 구축하지 않는다.' },
      { id: 's3', text: '회사 자료를 외부 클라우드(구글, MS 등)에 업로드하지 않는다.' },
      { id: 's4', text: '회사 자료(문서, 이미지, 링크)를 외부로 공유하지 않는다.' },
      { id: 's5', text: '개인 노션, GPT, 메모리 등에 회사 데이터를 저장하지 않는다.' },
      { id: 's6', text: '회사 계정을 타인에게 공유하지 않는다.' },
    ]
  },
  ethics: {
    id: 'ethics',
    title: '3. 윤리 규정',
    emoji: '⚖️',
    items: [
      { id: 'e1', text: '고객 정보를 외부에 공개하지 않는다.' },
      { id: 'e2', text: '회사 내부 자료를 외부에 전달하지 않는다.' },
      { id: 'e3', text: '저작권을 침해하는 콘텐츠를 제작하지 않는다.' },
      { id: 'e4', text: '허위 업무 보고를 하지 않는다.' },
      { id: 'e5', text: '회사 명의를 개인적으로 사용하지 않는다.' },
    ]
  },
  operational: {
    id: 'operational',
    title: '4. 회사 운영 규정',
    emoji: '🏢',
    items: [
      { id: 'o1', text: '회사 업무 지침을 준수한다.' },
      { id: 'o2', text: '회사 규정에 따른 업무 프로세스를 따른다.' },
      { id: 'o3', text: '업무 진행 상황을 회사에 보고한다.' },
    ]
  },
  handover: {
    id: 'handover',
    title: '6. 인수인계 규정',
    emoji: '🔄',
    items: [
      { id: 'h1', text: '업무 자료는 회사 시스템에 기록한다.' },
      { id: 'h2', text: '프로젝트 종료 시 업무 내용을 정리한다.' },
      { id: 'h3', text: '계약 종료 시 모든 자료를 회사에 인계한다.' },
    ]
  }
};

const workSpecifics = [
  {
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
  },
  {
    title: "마케팅 업무 기준",
    target: "1일 10개 콘텐츠",
    items: [
      "SNS / 블로그 / 광고 유형 등록",
      "등록 후 조회수 필수로 기록",
      "클릭/문의 발생 시 CRM 즉시 등록",
      "문의는 상담팀으로 즉시 전달"
    ]
  },
  {
    title: "아웃바운드/전화 업무 기준",
    target: "1일 100통",
    items: [
      "결과 상세 기록 (신규, 연결, 상담 등)",
      "상담 대상 상담팀 전달",
      "추후 연락 대상 follow-up 등록"
    ]
  }
];

const kpiHeaders = ["부서", "시도", "연결", "상담", "보류", "거절", "결"];
const kpiData = [
  { "부서": "전화", "시도": "신규/재연락", "연결": "연결", "상담": "상담", "보류": "추후", "거절": "거절", "결과": "계약" },
  { "부서": "상담", "시도": "예약", "연결": "방문", "상담": "상담", "보류": "고민", "거절": "거절", "결과": "계약" },
  { "부서": "번역사", "시도": "컨택", "연결": "응답", "상담": "인터뷰", "보류": "검토", "거절": "거절", "결과": "매칭" },
  { "부서": "마케팅", "시도": "콘텐츠", "연결": "조회", "상담": "클릭", "보류": "문의", "거절": "-", "결과": "계약" },
  { "부서": "개발", "시도": "작업", "연결": "진행", "상담": "완료", "보류": "수정", "거절": "-", "결과": "배포" },
];

const dailyRecordData = [
  { "날짜": "3/1", "신규": 80, "재연락": 40, "부재": 50, "연결": 70, "상담": 25, "보류": 15, "거절": 20, "결과": 5 },
  { "날짜": "3/2", "신규": 70, "재연락": 30, "부재": 45, "연결": 60, "상담": 20, "보류": 10, "거절": 18, "결과": 4 },
  { "날짜": "3/3", "신규": 90, "재연락": 35, "부재": 55, "연결": 75, "상담": 28, "보류": 17, "거절": 22, "결과": 6 },
];

export function PledgePage() {
  const [currentView, setCurrentView] = useState<'pledge' | 'worklog'>('pledge');
  const [mode, setMode] = useState<Mode>('view');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [sections, setSections] = useState(initialData);
  const [userName, setUserName] = useState('김민수');
  const [jobTitle, setJobTitle] = useState('기획자');
  const [contractType, setContractType] = useState('정규직');
  const [signature, setSignature] = useState('');
  const loadedRef = useRef(false);

  // Load pledge template from API on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    fetch('/api/pledges/pledge-template')
      .then((r) => r.json())
      .then((row: any) => {
        if (row && row.data && row.data.sections) {
          setSections(row.data.sections);
        }
      })
      .catch(() => {});
  }, []);

  // Save pledge template when sections change
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    fetch('/api/pledges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pledge_id: 'pledge-template', data: { sections } }),
    }).catch(() => {});
  }, [sections]);

  // Submit pledge to server
  const submitPledge = () => {
    const pledgeId = `pledge-${userName}-${Date.now()}`;
    fetch('/api/pledges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pledge_id: pledgeId,
        data: {
          userName, jobTitle, contractType, signature,
          sections,
          checkedItems: Array.from(checkedItems),
          submittedAt: new Date().toISOString(),
        },
      }),
    }).catch(() => {});
  };

  const jobRoles = ["개발자", "기획자", "디자이너", "마케터", "아웃바운드 영업", "번역사 매칭", "대면 상담", "기타"];

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) newChecked.delete(id);
    else newChecked.add(id);
    setCheckedItems(newChecked);
  };

  const handleUpdateItem = (sectionId: string, itemId: string, newText: string) => {
    setSections(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        items: prev[sectionId].items.map(item => item.id === itemId ? { ...item, text: newText } : item)
      }
    }));
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    setSections(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        items: prev[sectionId].items.filter(item => item.id !== itemId)
      }
    }));
  };

  const handleAddItem = (sectionId: string) => {
    const newId = `new-${Date.now()}`;
    setSections(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        items: [...prev[sectionId].items, { id: newId, text: '새 규정을 입력하세요.' }]
      }
    }));
  };

  const downloadFile = (type: 'excel' | 'word') => {
    const content = JSON.stringify({ sections, checkedItems, userName, signature }, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pledge_data_${Date.now()}.${type === 'excel' ? 'xlsx' : 'docx'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalProgress = useMemo(() => {
    const totalItems = Object.values(sections).reduce((acc, s) => acc + s.items.length, 0);
    return Math.round((checkedItems.size / totalItems) * 100) || 0;
  }, [sections, checkedItems]);

  return (
    <div className="min-h-screen bg-slate-50 p-2 font-sans text-slate-900">

      {/* Utility Top Bar (Benchmark style) */}
      <div className="max-w-[2000px] mx-auto mb-2 flex justify-end items-center gap-2">
        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-6">
          <button
            onClick={() => setCurrentView('worklog')}
            className={cn(
              "flex items-center gap-2 text-xs font-bold transition-colors",
              currentView === 'worklog' ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <div className={cn("p-1 rounded", currentView === 'worklog' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>
              <ClipboardList size={14} />
            </div>
            업무 일지
          </button>
          <div className="w-px h-3 bg-slate-200" />
          <button
            onClick={() => setCurrentView('pledge')}
            className={cn(
              "flex items-center gap-2 text-xs font-medium transition-colors",
              currentView === 'pledge' ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Shield size={14} />
            서약서 관리
          </button>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <UserCircle size={16} className="text-slate-400" />
            {userName || '이름 없음'}
          </div>
        </div>
      </div>

      {/* Dashboard Header */}
      <div className="max-w-[2000px] mx-auto mb-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            {currentView === 'pledge' ? <ShieldCheck size={28} /> : <ClipboardList size={28} />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {currentView === 'pledge' ? '업무 및 보안 준수 서약 시스템' : '일일 업무 일지 시스템'}
            </h1>
            <p className="text-sm text-slate-500">본 대시보드에서 모든 항목을 확인 및 관리할 수 있습니다.</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'view', icon: <CheckCircle2 size={16} />, label: '조회' },
            { id: 'add', icon: <Plus size={16} />, label: '추가' },
            { id: 'edit', icon: <Edit3 size={16} />, label: '수정' },
            { id: 'delete', icon: <Trash2 size={16} />, label: '삭제' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as Mode)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                mode === m.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => downloadFile('excel')} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100">
            <FileSpreadsheet size={16} /> 엑셀 다운받기
          </button>
          <button onClick={() => downloadFile('word')} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">
            <FileText size={16} /> 워드 다운받기
          </button>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto">
        {currentView === 'pledge' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Column 1: Info & Core Policies */}
            <div className="space-y-3">
              <SectionContainer title="1. 기본 정보" emoji="📝">
                <div className="space-y-4">
                  <InputGroup label="이름" value={userName} onChange={setUserName} icon={<User size={14}/>} placeholder="성함 입력" />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                      <Briefcase size={12} className="text-slate-400" /> 직무
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {jobRoles.map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setJobTitle(r)}
                          className={`px-2 py-0.5 text-xs rounded-md border transition-colors ${jobTitle === r ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <InputGroup label="계약형태" value={contractType} onChange={setContractType} icon={<Building2 size={14}/>} placeholder="정규직 / 계약직 등" />
                  <InputGroup label="계약기간" defaultValue="1년" icon={<Clock size={14}/>} placeholder="기간 입력" />
                  <InputGroup label="날짜" defaultValue={new Date().toLocaleDateString()} icon={<Calendar size={14}/>} />
                </div>
              </SectionContainer>

              <PolicyGroup section={sections.security} mode={mode} checkedItems={checkedItems} onToggle={toggleCheck} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} onAdd={() => handleAddItem('security')} />
              <PolicyGroup section={sections.ethics} mode={mode} checkedItems={checkedItems} onToggle={toggleCheck} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} onAdd={() => handleAddItem('ethics')} />
            </div>

            {/* Column 2: Operations & Detailed Clauses */}
            <div className="space-y-3">
              <PolicyGroup section={sections.operational} mode={mode} checkedItems={checkedItems} onToggle={toggleCheck} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} onAdd={() => handleAddItem('operational')} />
              <PolicyGroup section={sections.handover} mode={mode} checkedItems={checkedItems} onToggle={toggleCheck} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} onAdd={() => handleAddItem('handover')} />

              <SectionContainer title="7. 비밀 유지" emoji="🤫">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    "본인은 업무 중 알게 된 회사 정보, 고객 정보, 자료를 외부에 공개하지 않을 것을 서약합니다."
                  </p>
                  <button
                    onClick={() => toggleCheck('secret-pledge')}
                    className={cn(
                      "mt-4 w-full py-2 rounded-lg text-xs font-bold transition-all border",
                      checkedItems.has('secret-pledge') ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-200"
                    )}
                  >
                    비밀유지 내용 확인 완료
                  </button>
                </div>
              </SectionContainer>
            </div>

            {/* Column 3: 5. Detailed Work Regulations (KPI Standards) */}
            <div className="space-y-3">
              <SectionContainer title="5. 세부 업무 규정" emoji="📊">
                <div className="space-y-5">
                  {[
                    { title: "개발/기획/디자인 업무 기준", target: "1일 10개 작업", items: ["1시간은 프롬프트 정리/수정으로 대처", "작업 기준 : 30분 단위", "타업무 지연 시 10/20분 단위 쪼개기"] },
                    { title: "마케팅 업무 기준", target: "1일 10개 콘텐츠", items: ["SNS / 블로그 / 광고 유형 등록", "등록 후 조회수 필수로 기록"] },
                    { title: "아웃바운드/전화 업무 기준", target: "1일 100통", items: ["결과 상세 기록 (신규, 연결, 상담 등)", "상담 대상 상담팀 전달"] }
                  ].map((w, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Target size={14} className="text-slate-400" /> {w.title}
                        </h3>
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{w.target}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {w.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                            <span className="mt-1 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </SectionContainer>
              <KpiTable title="전체 회사 KPI 통합표" emoji="🌎" headers={kpiHeaders} data={kpiData} mode={mode} />
            </div>

            {/* Column 4: Records & Final Pledge */}
            <div className="space-y-3">
              <SectionContainer title="담당자용 일일 업무 기록" emoji="📅">
                <div className="space-y-4">
                  <KpiTable title="최근 3일 기록" emoji="📈" headers={Object.keys(dailyRecordData[0])} data={dailyRecordData} mode={mode} />
                </div>
              </SectionContainer>

              <SectionContainer title="8. 최종 서약 및 서명" emoji="✍️">
                <div className="space-y-4">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-medium text-slate-500 uppercase">전체 진행률</span>
                    <span className="text-xl font-black text-slate-900">{totalProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${totalProgress}%` }} className="bg-slate-900 h-full" />
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                    <p className="text-[11px] text-slate-600 leading-normal">본인은 위 내용을 충분히 이해하였으며 이를 성실히 준수할 것을 서약합니다.</p>
                    <div className="relative h-24 w-full bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200">
                      {signature ? <span className="text-2xl font-cursive text-slate-800">{signature}</span> : <span className="text-[10px] text-slate-300">이름을 입력하여 서명하세요</span>}
                      <input type="text" value={signature} onChange={(e) => setSignature(e.target.value)} disabled={totalProgress < 100} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                  <button disabled={totalProgress < 100 || !signature} onClick={submitPledge} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm">최종 서약서 제출</button>
                </div>
              </SectionContainer>
            </div>
          </div>
        ) : (
          <WorkLogView
            jobTitle={jobTitle}
            mode={mode}
            onModeChange={setMode}
          />
        )}
      </div>
    </div>
  );
}

// Sub-components
function SectionContainer({ title, emoji, children }: { title: string, emoji: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
      <div className="px-4 py-2 border-b border-slate-50 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        </div>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

function InputGroup({ label, value, defaultValue, onChange, icon, placeholder }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-400 uppercase">{label}</label>
      <div className="flex items-center gap-2 border-b border-slate-200 py-1">
        <span className="text-slate-400">{icon}</span>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-grow bg-transparent border-none focus:ring-0 text-sm p-0"
        />
      </div>
    </div>
  );
}

function PolicyGroup({ section, mode, checkedItems, onToggle, onUpdate, onDelete, onAdd }: any) {
  return (
    <SectionContainer title={section.title} emoji={section.emoji}>
      <div className="space-y-2">
        {section.items.map((item: any) => (
          <PolicyItem key={item.id} id={item.id} text={item.text} isChecked={checkedItems.has(item.id)} onToggle={onToggle} mode={mode} onUpdate={(id:any, text:any) => onUpdate(section.id, id, text)} onDelete={(id:any) => onDelete(section.id, id)} />
        ))}
        {mode === 'add' && (
          <button onClick={onAdd} className="w-full py-2 border-2 border-dashed border-slate-100 rounded-lg text-slate-300 hover:text-slate-500 hover:border-slate-200 transition-all flex items-center justify-center gap-2 text-[10px] font-bold">
            <Plus size={12} /> 항목 추가
          </button>
        )}
      </div>
    </SectionContainer>
  );
}

export default PledgePage;
