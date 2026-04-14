import { useState, lazy, Suspense } from 'react';
import {
  UserPlus, ClipboardCheck, BarChart3, Users,
  CalendarClock, BookOpen, ClipboardList, Briefcase,
} from 'lucide-react';

// 기존 페이지 컴포넌트 lazy import
const InterviewForm = lazy(() => import('../interview/InterviewForm'));
const InterviewDashboard = lazy(() => import('../interview/Dashboard'));
const InstructorEvalPage = lazy(() => import('../instructor-eval/InstructorEvalPage'));
const InterviewAlbaGuide = lazy(() => import('./InterviewAlbaGuide'));
const PersonalEntryView = lazy(() =>
  import('../instructor-flow/PersonalEntryView').then(m => ({ default: m.PersonalEntryView }))
);
const ApplicantListView = lazy(() =>
  import('../instructor-flow/ApplicantListView').then(m => ({ default: m.ApplicantListView }))
);
const TimetableRegulationsView = lazy(() =>
  import('../instructor-flow/TimetableRegulationsView').then(m => ({ default: m.TimetableRegulationsView }))
);
const CurriculumDescriptionView = lazy(() =>
  import('../instructor-flow/CurriculumDescriptionView').then(m => ({ default: m.CurriculumDescriptionView }))
);

const Loading = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#94a3b8', fontSize: 13 }}>
    로딩 중...
  </div>
);

const tabs = [
  { id: 'personal',   label: '지원서 작성',       icon: UserPlus,      group: '채용' },
  { id: 'interview',  label: '면접 입력',         icon: ClipboardCheck, group: '채용' },
  { id: 'alba',       label: '알바 면접 안내',    icon: Briefcase,     group: '채용' },
  { id: 'dashboard',  label: '면접 대시보드',      icon: BarChart3,     group: '채용' },
  { id: 'eval',       label: '강사 평가(상세)',    icon: ClipboardList,  group: '평가' },
  { id: 'applicants', label: '지원자 리스트',      icon: Users,         group: '관리' },
  { id: 'timetable',  label: '시간표 규정',       icon: CalendarClock,  group: '참고' },
  { id: 'curriculum', label: '커리큘럼 설명',      icon: BookOpen,      group: '참고' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<TabId>('personal');

  // 그룹별 구분
  const groups = [...new Set(tabs.map(t => t.group))];

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':   return <PersonalEntryView />;
      case 'interview':  return <InterviewForm />;
      case 'alba':       return <InterviewAlbaGuide />;
      case 'dashboard':  return <InterviewDashboard />;
      case 'eval':       return <InstructorEvalPage />;
      case 'applicants': return <ApplicantListView />;
      case 'timetable':  return <TimetableRegulationsView />;
      case 'curriculum': return <CurriculumDescriptionView />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100%', background: '#f8fafc' }}>
      {/* 헤더 + 탭 */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px' }}>
          {/* 타이틀 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0 6px' }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ClipboardCheck size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>채용관리(통합)</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>면접 입력 / 평가 / 지원자 관리 / 참고자료</div>
            </div>
          </div>

          {/* 탭 네비 — 그룹별 구분선 */}
          <div style={{ display: 'flex', gap: 2, overflowX: 'auto', paddingBottom: 6 }}>
            {groups.map((group, gi) => (
              <div key={group} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {gi > 0 && (
                  <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 4px' }} />
                )}
                {tabs.filter(t => t.group === group).map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 6,
                        border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#3b82f6' : '#64748b',
                        background: isActive ? '#eff6ff' : 'transparent',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                      }}
                    >
                      <tab.icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <Suspense fallback={<Loading />}>
          {renderContent()}
        </Suspense>
      </div>
    </div>
  );
}
