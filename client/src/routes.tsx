import { createBrowserRouter, Navigate } from 'react-router';
import { lazy, Suspense, type ReactElement } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import RouteGuard from './components/RouteGuard';
import type { UserTier } from './contexts/AuthContext';

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

function guard(tiers: UserTier[], element: ReactElement) {
  return <RouteGuard tiers={tiers}>{element}</RouteGuard>;
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
        { path: 'work-hub-a', element: lazyPage(() => import('./pages/work-hub-a/WorkHubVerA')) },
        { path: 'work-materials', element: lazyPage(() => import('./pages/work-materials/WorkMaterialsPage')) },
        { path: 'work-log', element: lazyPage(() => import('./pages/work-log/EmployeePage')) },
        { path: 'work-log-old', element: lazyPage(() => import('./pages/work-log-old/EmployeePage')) },
        { path: 'work-log/admin', element: lazyPage(() => import('./pages/work-log/AdminPage')) },
        { path: 'pledge', element: lazyPage(() => import('./pages/pledge/PledgePage')) },
        { path: 'guidelines', element: lazyPage(() => import('./pages/guidelines/GuidelinesPage')) },
        { path: 'company-guidelines', element: lazyPage(() => import('./pages/company-guidelines/CompanyGuidelinesPage')) },
        { path: 'lesson-plan', element: lazyPage(() => import('./pages/lesson-plan/LessonPlanPage')) },
        // 관리자 도구 (admin/manager 전용)
        { path: 'recruitment', element: guard(['admin', 'manager'], lazyPage(() => import('./pages/recruitment/RecruitmentPage'))) },
        { path: 'interview', element: lazyPage(() => import('./pages/interview/InterviewForm')) },
        { path: 'interview/dashboard', element: lazyPage(() => import('./pages/interview/Dashboard')) },
        { path: 'attendance', element: lazyPage(() => import('./pages/attendance/AttendancePage')) },
        { path: 'attendance-b', element: lazyPage(() => import('./pages/attendance/AttendancePageB')) },
        { path: 'meetings', element: lazyPage(() => import('./pages/meetings/MeetingsPage')) },
        { path: 'outbound-calls', element: lazyPage(() => import('./pages/outbound-calls/OutboundCallsPage')) },
        { path: 'photo-dashboard', element: lazyPage(() => import('./pages/photo-dashboard/PhotoDashboardPage')) },
        { path: 'schedule', element: lazyPage(() => import('./pages/schedule/SchedulePage')) },
        { path: 'rules', element: lazyPage(() => import('./pages/rules/RulesPage')) },
        { path: 'rules-mgmt', element: lazyPage(() => import('./pages/rules-mgmt/RulesMgmtPage')) },
        { path: 'rules-editor', element: lazyPage(() => import('./pages/rules-editor/RulesEditorPage')) },
        { path: 'eval-criteria', element: lazyPage(() => import('./pages/eval-criteria/EvalCriteriaPage')) },
        { path: 'admin-system', element: guard(['admin'], lazyPage(() => import('./pages/admin-system/AdminSystemPage'))) },

        // ===== 추가 완료 =====
        { path: 'meeting-form', element: lazyPage(() => import('./pages/meeting-form/MeetingFormPage')) },
        { path: 'overdue', element: lazyPage(() => import('./pages/overdue/OverduePage')) },
        { path: 'shortcuts', element: lazyPage(() => import('./pages/shortcuts/ShortcutsPage')) },
        { path: 'rules-jungeol', element: lazyPage(() => import('./pages/rules-jungeol/RulesJungeolPage')) },
        { path: 'instructor-curri', element: lazyPage(() => import('./pages/instructor-curri/InstructorCurriPage')) },
        { path: 'work-class-demo', element: lazyPage(() => import('./pages/work-class-demo/WorkClassDemoPage')) },
        { path: 'ai-course-plan', element: lazyPage(() => import('./pages/ai-course-plan/AiCoursePlanPage')) },
        { path: 'marketing', element: lazyPage(() => import('./pages/marketing/MarketingPage')) },
        { path: 'rules-layout', element: lazyPage(() => import('./pages/rules-layout/RulesLayoutPage')) },
        { path: 'rules-manual', element: lazyPage(() => import('./pages/rules-manual/RulesManualPage')) },
        { path: 'prompt-guide', element: lazyPage(() => import('./pages/prompt-guide/PromptGuidePage')) },
        { path: 'manual-list', element: lazyPage(() => import('./pages/manual-list/ManualListPage')) },
        { path: 'claude-rules', element: lazyPage(() => import('./pages/claude-rules/ClaudeRulesPage')) },
        { path: 'coming/ai-studio', element: comingSoon },

        // ===== G: 커뮤니티 (gw + 신규) =====
        { path: 'community-notice', element: comingSoon },
        { path: 'community-team-notice', element: comingSoon },
        { path: 'community-center-notice', element: comingSoon },
        { path: 'community-work-notice', element: comingSoon },
        { path: 'community-free-board', element: comingSoon },
        { path: 'community-qna', element: comingSoon },
        { path: 'community-memo', element: comingSoon },
        { path: 'community-meeting-board', element: comingSoon },

        // ===== H: 학생관리 (gw) =====
        { path: 'student-tesol', element: comingSoon },
        { path: 'student-tesol-old', element: comingSoon },
        { path: 'student-accounting', element: comingSoon },
        { path: 'student-certi', element: comingSoon },
        { path: 'student-translator', element: comingSoon },
        { path: 'student-ics', element: comingSoon },
        { path: 'student-etc', element: comingSoon },

        // ===== I: 서식/확인서 (gw) =====
        { path: 'form-mgmt', element: comingSoon },
        { path: 'design-materials', element: comingSoon },
        { path: 'cert-kukton', element: comingSoon },
        { path: 'cert-tesol', element: comingSoon },
        { path: 'cert-itt', element: comingSoon },

        // ===== J: 출장관리 (gw) =====
        { path: 'dispatch-instructor', element: comingSoon },
        { path: 'dispatch-client', element: comingSoon },

        // ===== C 추가: 관리/운영 (gw) =====
        { path: 'staff-info', element: comingSoon },
        { path: 'client-mgmt', element: comingSoon },
        { path: 'online-meeting-search', element: comingSoon },
        { path: 'online-project', element: comingSoon },
        { path: 'instructor-eval', element: lazyPage(() => import('./pages/instructor-eval/InstructorEvalPage')) },
        { path: 'instructor-flow', element: lazyPage(() => import('./pages/instructor-flow/InstructorFlowPage')) },
        // ===== 영규-hutechc (hutechc_hompage_real 변환) =====
        { path: 'hutechc-homepage', element: lazyPage(() => import('./pages/hutechc-homepage/HutechcHomepagePage')) },
        { path: 'hutechc-homepage/exam', element: lazyPage(() => import('./pages/hutechc-homepage/exam/ExamEntryPage')) },
        { path: 'hutechc-homepage/translate', element: lazyPage(() => import('./pages/hutechc-homepage/translate/TranslatePage')) },
        { path: 'hutechc-homepage/exhibition', element: lazyPage(() => import('./pages/hutechc-homepage/exhibition/ExhibitionPage')) },
        { path: 'hutechc-homepage/admin', element: guard(['admin', 'manager'], lazyPage(() => import('./pages/hutechc-homepage/admin/AdminDashboardPage'))) },
        { path: 'hutechc-homepage/payment-guide', element: lazyPage(() => import('./pages/hutechc-homepage/payment-guide/PaymentGuidePage')) },
        { path: 'hutechc-homepage/expert', element: lazyPage(() => import('./pages/hutechc-homepage/expert/ExpertApplyPage')) },
        { path: 'hutechc-homepage/question-bank', element: lazyPage(() => import('./pages/hutechc-homepage/question-bank/QuestionBankPage')) },
        // --- admin 하위 ---
        { path: 'hutechc-homepage/admin/admins', element: guard(['admin'], lazyPage(() => import('./pages/hutechc-homepage/admin/admins/AdminsPage'))) },
        { path: 'hutechc-homepage/admin/data', element: lazyPage(() => import('./pages/hutechc-homepage/admin/data/DataPage')) },
        { path: 'hutechc-homepage/admin/exams', element: lazyPage(() => import('./pages/hutechc-homepage/admin/exams/ExamsPage')) },
        { path: 'hutechc-homepage/admin/exams/status', element: lazyPage(() => import('./pages/hutechc-homepage/admin/exams/status/StatusPage')) },
        { path: 'hutechc-homepage/admin/experts', element: lazyPage(() => import('./pages/hutechc-homepage/admin/experts/ExpertsPage')) },
        { path: 'hutechc-homepage/admin/grading', element: lazyPage(() => import('./pages/hutechc-homepage/admin/grading/GradingPage')) },
        { path: 'hutechc-homepage/admin/market', element: lazyPage(() => import('./pages/hutechc-homepage/admin/market/MarketPage')) },
        { path: 'hutechc-homepage/admin/members', element: lazyPage(() => import('./pages/hutechc-homepage/admin/members/MembersPage')) },
        { path: 'hutechc-homepage/admin/members/:id', element: lazyPage(() => import('./pages/hutechc-homepage/admin/members/[id]/MembersDetailPage')) },
        { path: 'hutechc-homepage/admin/modules', element: lazyPage(() => import('./pages/hutechc-homepage/admin/modules/ModulesPage')) },
        { path: 'hutechc-homepage/admin/payment-guide', element: lazyPage(() => import('./pages/hutechc-homepage/admin/payment-guide/PaymentGuidePage')) },
        { path: 'hutechc-homepage/admin/payment-settlement', element: lazyPage(() => import('./pages/hutechc-homepage/admin/payment-settlement/PaymentSettlementPage')) },
        { path: 'hutechc-homepage/admin/plugins', element: lazyPage(() => import('./pages/hutechc-homepage/admin/plugins/PluginsPage')) },
        { path: 'hutechc-homepage/admin/pricing', element: lazyPage(() => import('./pages/hutechc-homepage/admin/pricing/PricingPage')) },
        { path: 'hutechc-homepage/admin/prompt-rules', element: lazyPage(() => import('./pages/hutechc-homepage/admin/prompt-rules/PromptRulesPage')) },
        { path: 'hutechc-homepage/admin/quote', element: lazyPage(() => import('./pages/hutechc-homepage/admin/quote/QuotePage')) },
        { path: 'hutechc-homepage/admin/roles', element: guard(['admin'], lazyPage(() => import('./pages/hutechc-homepage/admin/roles/RolesPage'))) },
        { path: 'hutechc-homepage/admin/settings', element: guard(['admin'], lazyPage(() => import('./pages/hutechc-homepage/admin/settings/SettingsPage'))) },
        { path: 'hutechc-homepage/admin/sites', element: lazyPage(() => import('./pages/hutechc-homepage/admin/sites/SitesPage')) },
        { path: 'hutechc-homepage/admin/sites/new', element: lazyPage(() => import('./pages/hutechc-homepage/admin/sites/new/NewPage')) },
        { path: 'hutechc-homepage/admin/translators', element: lazyPage(() => import('./pages/hutechc-homepage/admin/translators/TranslatorsPage')) },
        { path: 'hutechc-homepage/admin/translators/:id', element: lazyPage(() => import('./pages/hutechc-homepage/admin/translators/[id]/TranslatorsDetailPage')) },
        { path: 'hutechc-homepage/admin/translators/grades', element: lazyPage(() => import('./pages/hutechc-homepage/admin/translators/grades/GradesPage')) },
        { path: 'hutechc-homepage/admin/translators/profile-requests', element: lazyPage(() => import('./pages/hutechc-homepage/admin/translators/profile-requests/ProfileRequestsPage')) },
        { path: 'hutechc-homepage/admin/ui', element: lazyPage(() => import('./pages/hutechc-homepage/admin/ui/UiPage')) },
        { path: 'hutechc-homepage/admin/ui/client-editor', element: lazyPage(() => import('./pages/hutechc-homepage/admin/ui/client-editor/ClientEditorPage')) },
        { path: 'hutechc-homepage/admin/ui/editor', element: lazyPage(() => import('./pages/hutechc-homepage/admin/ui/editor/EditorPage')) },
        { path: 'hutechc-homepage/admin/ui/exam-author', element: lazyPage(() => import('./pages/hutechc-homepage/admin/ui/exam-author/ExamAuthorPage')) },
        { path: 'hutechc-homepage/admin/ui/exam-candidate', element: lazyPage(() => import('./pages/hutechc-homepage/admin/ui/exam-candidate/ExamCandidatePage')) },
        { path: 'hutechc-homepage/admin/ui/exam-grader', element: lazyPage(() => import('./pages/hutechc-homepage/admin/ui/exam-grader/ExamGraderPage')) },
        { path: 'hutechc-homepage/admin/ui/translator-editor', element: lazyPage(() => import('./pages/hutechc-homepage/admin/ui/translator-editor/TranslatorEditorPage')) },
        // --- exhibition 하위 ---
        { path: 'hutechc-homepage/exhibition/list', element: lazyPage(() => import('./pages/hutechc-homepage/exhibition/list/ListPage')) },
        { path: 'hutechc-homepage/exhibition/museum', element: lazyPage(() => import('./pages/hutechc-homepage/exhibition/museum/MuseumPage')) },
        { path: 'hutechc-homepage/exhibition/upload', element: lazyPage(() => import('./pages/hutechc-homepage/exhibition/upload/UploadPage')) },
        { path: 'hutechc-homepage/exhibition/write', element: lazyPage(() => import('./pages/hutechc-homepage/exhibition/write/WritePage')) },
        // --- grading ---
        { path: 'hutechc-homepage/grading/:examId', element: lazyPage(() => import('./pages/hutechc-homepage/grading/[examId]/GradingDetailPage')) },
        // --- login/logout ---
        { path: 'hutechc-homepage/login', element: lazyPage(() => import('./pages/hutechc-homepage/login/LoginPage')) },
        { path: 'hutechc-homepage/logout', element: lazyPage(() => import('./pages/hutechc-homepage/logout/LogoutPage')) },
        // --- mypage 하위 ---
        { path: 'hutechc-homepage/mypage/available', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/available/AvailablePage')) },
        { path: 'hutechc-homepage/mypage/exam', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/exam/ExamPage')) },
        { path: 'hutechc-homepage/mypage/exam/author', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/exam/author/AuthorPage')) },
        { path: 'hutechc-homepage/mypage/exam/author/:examId', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/exam/author/[examId]/AuthorDetailPage')) },
        { path: 'hutechc-homepage/mypage/exam/author/completed', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/exam/author/completed/CompletedPage')) },
        { path: 'hutechc-homepage/mypage/exam/author/grading/:examId', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/exam/author/grading/[examId]/GradingDetailPage')) },
        { path: 'hutechc-homepage/mypage/exam/author/in-progress', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/exam/author/in-progress/InProgressPage')) },
        { path: 'hutechc-homepage/mypage/exam/author/requests', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/exam/author/requests/RequestsPage')) },
        { path: 'hutechc-homepage/mypage/exam/prompt', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/exam/prompt/PromptPage')) },
        { path: 'hutechc-homepage/mypage/exam/prompt/test', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/exam/prompt/test/TestPage')) },
        { path: 'hutechc-homepage/mypage/exam/prompt_test', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/exam/prompt_test/PromptTestPage')) },
        { path: 'hutechc-homepage/mypage/exam/prompt_test/test', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/exam/prompt_test/test/TestPage')) },
        { path: 'hutechc-homepage/mypage/exam/test', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/exam/test/TestPage')) },
        { path: 'hutechc-homepage/mypage/inquiry', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/inquiry/InquiryPage')) },
        { path: 'hutechc-homepage/mypage/late-certificate', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/late-certificate/LateCertificatePage')) },
        { path: 'hutechc-homepage/mypage/payments', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/payments/PaymentsPage')) },
        { path: 'hutechc-homepage/mypage/profile', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/profile/ProfilePage')) },
        { path: 'hutechc-homepage/mypage/registration', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/registration/RegistrationPage')) },
        { path: 'hutechc-homepage/mypage/results', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/results/ResultsPage')) },
        { path: 'hutechc-homepage/mypage/settings', element: lazyPage(() => import('./pages/hutechc-homepage/mypage/settings/SettingsPage')) },
        // --- translate 하위 ---
        { path: 'hutechc-homepage/translate/client/payments', element: lazyPage(() => import('./pages/hutechc-homepage/translate/client/payments/PaymentsPage')) },
        { path: 'hutechc-homepage/translate/client/request/all', element: lazyPage(() => import('./pages/hutechc-homepage/translate/client/request/all/AllPage')) },
        { path: 'hutechc-homepage/translate/client/request/new', element: lazyPage(() => import('./pages/hutechc-homepage/translate/client/request/new/NewPage')) },
        { path: 'hutechc-homepage/translate/client/request/new/step2', element: lazyPage(() => import('./pages/hutechc-homepage/translate/client/request/new/step2/Step2Page')) },
        { path: 'hutechc-homepage/translate/client/request/prompt-translation', element: lazyPage(() => import('./pages/hutechc-homepage/translate/client/request/prompt-translation/PromptTranslationPage')) },
        { path: 'hutechc-homepage/translate/client/requests', element: lazyPage(() => import('./pages/hutechc-homepage/translate/client/requests/RequestsPage')) },
        { path: 'hutechc-homepage/translate/meta/new', element: lazyPage(() => import('./pages/hutechc-homepage/translate/meta/new/NewPage')) },
        { path: 'hutechc-homepage/translate/meta/new/editor', element: lazyPage(() => import('./pages/hutechc-homepage/translate/meta/new/editor/EditorPage')) },
        { path: 'hutechc-homepage/translate/meta/new/step2', element: lazyPage(() => import('./pages/hutechc-homepage/translate/meta/new/step2/Step2Page')) },
        { path: 'hutechc-homepage/translate/translator/available', element: lazyPage(() => import('./pages/hutechc-homepage/translate/translator/available/AvailablePage')) },
        { path: 'hutechc-homepage/translate/translator/completed', element: lazyPage(() => import('./pages/hutechc-homepage/translate/translator/completed/CompletedPage')) },
        { path: 'hutechc-homepage/translate/translator/profile', element: lazyPage(() => import('./pages/hutechc-homepage/translate/translator/profile/ProfilePage')) },
        { path: 'hutechc-homepage/translate/translator/profile/grade-application', element: lazyPage(() => import('./pages/hutechc-homepage/translate/translator/profile/grade-application/GradeApplicationPage')) },
        { path: 'hutechc-homepage/translate/translator/requests', element: lazyPage(() => import('./pages/hutechc-homepage/translate/translator/requests/RequestsPage')) },
        { path: 'hutechc-homepage/translate/translator/settings', element: lazyPage(() => import('./pages/hutechc-homepage/translate/translator/settings/SettingsPage')) },
        { path: 'hutechc-homepage/translate/translator/working', element: lazyPage(() => import('./pages/hutechc-homepage/translate/translator/working/WorkingPage')) },
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
