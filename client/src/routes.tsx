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
        { index: true, element: <Navigate to="/work-log" replace /> },

        // ===== 구현 완료 =====
        // 직원 도구
        { path: 'work-log', element: lazyPage(() => import('./pages/work-log/EmployeePage')) },
        { path: 'work-log-old', element: lazyPage(() => import('./pages/work-log-old/EmployeePage')) },
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

        // ===== 공사중 (ai_studio 내부 업무만) =====
        { path: 'coming/meeting-form', element: comingSoon },
        { path: 'coming/overdue', element: comingSoon },
        { path: 'coming/shortcuts', element: comingSoon },
        { path: 'coming/rules-jungeol', element: comingSoon },
        { path: 'coming/instructor-curri', element: comingSoon },
        { path: 'coming/marketing', element: comingSoon },
        { path: 'coming/rules-layout', element: comingSoon },
        { path: 'coming/rules-manual', element: comingSoon },
        { path: 'coming/prompt-guide', element: comingSoon },
        { path: 'coming/manual-list', element: comingSoon },
        { path: 'coming/ai-studio', element: comingSoon },
        { path: 'coming/instructor-eval', element: comingSoon },
        { path: 'coming/instructor-flow', element: comingSoon },
        // 아래 항목은 work_studio로 이관됨:
        // tesol-landing, ceo-homepage, arabic-translation, tongdok, translation-all,
        // ceo-v3-deploy, classic-translation, aite, hutechc-homepage, combined-homepage,
        // iita, onepage, semiconductor, physical, db-page, app-forms, question-bank,
        // exam, expert-apply, translator-apply, instructor-apply, instructor-apply-v3,
        // expert-1page, expert-step1, expert-admin, expert-consult, worklog-jungeol
      ],
    },
  ],
  { basename: '/app' }
);
