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
        { path: 'work-hub', element: lazyPage(() => import('./pages/work-hub/WorkHubPage')) },
        { path: 'work-materials', element: lazyPage(() => import('./pages/work-materials/WorkMaterialsPage')) },
        { path: 'work-log', element: lazyPage(() => import('./pages/work-log/EmployeePage')) },
        { path: 'work-log-old', element: lazyPage(() => import('./pages/work-log-old/EmployeePage')) },
        { path: 'work-log/admin', element: lazyPage(() => import('./pages/work-log/AdminPage')) },
        { path: 'pledge', element: lazyPage(() => import('./pages/pledge/PledgePage')) },
        { path: 'guidelines', element: lazyPage(() => import('./pages/guidelines/GuidelinesPage')) },
        { path: 'company-guidelines', element: lazyPage(() => import('./pages/company-guidelines/CompanyGuidelinesPage')) },
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

        // ===== 추가 완료 =====
        { path: 'meeting-form', element: lazyPage(() => import('./pages/meeting-form/MeetingFormPage')) },
        { path: 'overdue', element: lazyPage(() => import('./pages/overdue/OverduePage')) },
        { path: 'shortcuts', element: lazyPage(() => import('./pages/shortcuts/ShortcutsPage')) },
        { path: 'rules-jungeol', element: lazyPage(() => import('./pages/rules-jungeol/RulesJungeolPage')) },
        { path: 'instructor-curri', element: lazyPage(() => import('./pages/instructor-curri/InstructorCurriPage')) },
        { path: 'marketing', element: lazyPage(() => import('./pages/marketing/MarketingPage')) },
        { path: 'rules-layout', element: lazyPage(() => import('./pages/rules-layout/RulesLayoutPage')) },
        { path: 'rules-manual', element: lazyPage(() => import('./pages/rules-manual/RulesManualPage')) },
        { path: 'prompt-guide', element: lazyPage(() => import('./pages/prompt-guide/PromptGuidePage')) },
        { path: 'manual-list', element: lazyPage(() => import('./pages/manual-list/ManualListPage')) },
        { path: 'coming/ai-studio', element: comingSoon },
        { path: 'instructor-eval', element: lazyPage(() => import('./pages/instructor-eval/InstructorEvalPage')) },
        { path: 'instructor-flow', element: lazyPage(() => import('./pages/instructor-flow/InstructorFlowPage')) },
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
