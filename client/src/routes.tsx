import { createBrowserRouter, Navigate } from 'react-router';
import { lazy, Suspense } from 'react';
import { AppLayout } from './components/layout/AppLayout';

const Loading = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: 14 }}>
    로딩 중...
  </div>
);

function lazyPage(importFn: () => Promise<any>) {
  const LazyComponent = lazy(importFn);
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}

const comingSoon = lazyPage(() => import('./pages/ComingSoon'));

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: AppLayout,
      children: [
        { index: true, element: <Navigate to="/tesol" replace /> },

        // ===== 구현 완료 =====
        // 소비자 접수
        { path: 'tesol', element: lazyPage(() => import('./pages/tesol/TesolPage')) },
        { path: 'level-test', element: lazyPage(() => import('./pages/level-test/LevelTestPage')) },
        // 직원 도구
        { path: 'work-log', element: lazyPage(() => import('./pages/work-log/EmployeePage')) },
        { path: 'work-log/admin', element: lazyPage(() => import('./pages/work-log/AdminPage')) },
        { path: 'pledge', element: lazyPage(() => import('./pages/pledge/PledgePage')) },
        { path: 'guidelines', element: lazyPage(() => import('./pages/guidelines/GuidelinesPage')) },
        { path: 'lesson-plan', element: lazyPage(() => import('./pages/lesson-plan/LessonPlanPage')) },
        // 관리자 도구
        { path: 'interview', element: lazyPage(() => import('./pages/interview/InterviewForm')) },
        { path: 'interview/dashboard', element: lazyPage(() => import('./pages/interview/Dashboard')) },
        { path: 'attendance', element: lazyPage(() => import('./pages/attendance/AttendancePage')) },
        { path: 'meetings', element: lazyPage(() => import('./pages/meetings/MeetingsPage')) },
        { path: 'outbound-calls', element: lazyPage(() => import('./pages/outbound-calls/OutboundCallsPage')) },
        { path: 'photo-dashboard', element: lazyPage(() => import('./pages/photo-dashboard/PhotoDashboardPage')) },
        { path: 'schedule', element: lazyPage(() => import('./pages/schedule/SchedulePage')) },
        { path: 'rules-mgmt', element: lazyPage(() => import('./pages/rules-mgmt/RulesMgmtPage')) },
        { path: 'rules-editor', element: lazyPage(() => import('./pages/rules-editor/RulesEditorPage')) },
        { path: 'eval-criteria', element: lazyPage(() => import('./pages/eval-criteria/EvalCriteriaPage')) },
        { path: 'admin-system', element: lazyPage(() => import('./pages/admin-system/AdminSystemPage')) },

        // ===== 공사중 (40개) =====
        { path: 'coming/meeting-form', element: comingSoon },
        { path: 'coming/overdue', element: comingSoon },
        { path: 'coming/shortcuts', element: comingSoon },
        { path: 'coming/app-forms', element: comingSoon },
        { path: 'coming/db-page', element: comingSoon },
        { path: 'coming/rules-jungeol', element: comingSoon },
        { path: 'coming/instructor-curri', element: comingSoon },
        { path: 'coming/marketing', element: comingSoon },
        { path: 'coming/question-bank', element: comingSoon },
        { path: 'coming/rules-layout', element: comingSoon },
        { path: 'coming/rules-manual', element: comingSoon },
        { path: 'coming/prompt-guide', element: comingSoon },
        { path: 'coming/tesol-landing', element: comingSoon },
        { path: 'coming/ceo-homepage', element: comingSoon },
        { path: 'coming/arabic-translation', element: comingSoon },
        { path: 'coming/tongdok', element: comingSoon },
        { path: 'coming/translation-all', element: comingSoon },
        { path: 'coming/ceo-v3-deploy', element: comingSoon },
        { path: 'coming/classic-translation', element: comingSoon },
        { path: 'coming/aite', element: comingSoon },
        { path: 'coming/hutechc-homepage', element: comingSoon },
        { path: 'coming/combined-homepage', element: comingSoon },
        { path: 'coming/iita', element: comingSoon },
        { path: 'coming/onepage', element: comingSoon },
        { path: 'coming/semiconductor', element: comingSoon },
        { path: 'coming/physical', element: comingSoon },
        { path: 'coming/manual-list', element: comingSoon },
        { path: 'coming/worklog-jungeol', element: comingSoon },
        { path: 'coming/ai-studio', element: comingSoon },
        { path: 'coming/exam', element: comingSoon },
        { path: 'coming/expert-apply', element: comingSoon },
        { path: 'coming/translator-apply', element: comingSoon },
        { path: 'coming/instructor-apply', element: comingSoon },
        { path: 'coming/instructor-eval', element: comingSoon },
        { path: 'coming/instructor-apply-v3', element: comingSoon },
        { path: 'coming/expert-1page', element: comingSoon },
        { path: 'coming/expert-step1', element: comingSoon },
        { path: 'coming/instructor-flow', element: comingSoon },
        { path: 'coming/expert-admin', element: comingSoon },
        { path: 'coming/expert-consult', element: comingSoon },
      ],
    },
  ],
  { basename: '/app' }
);
