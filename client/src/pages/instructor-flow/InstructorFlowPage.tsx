import { useState } from "react";
import {
  UserPlus,
  ClipboardCheck,
  Users,
  CalendarClock,
  BookOpen,
} from "lucide-react";
import { Toaster } from "sonner";
import { PersonalEntryView } from "./PersonalEntryView";
import { InterviewEvaluationView } from "./InterviewEvaluationView";
import { ApplicantListView } from "./ApplicantListView";
import { TimetableRegulationsView } from "./TimetableRegulationsView";
import { CurriculumDescriptionView } from "./CurriculumDescriptionView";

const tabs = [
  { id: "personal", name: "인적사항 작성", icon: UserPlus },
  { id: "evaluation", name: "면접 평가표", icon: ClipboardCheck },
  { id: "applicants", name: "면접자 리스트", icon: Users },
  { id: "timetable", name: "시간표 규정", icon: CalendarClock },
  { id: "curriculum", name: "커리큘럼 설명", icon: BookOpen },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function InstructorFlowPage() {
  const [activeTab, setActiveTab] = useState<TabId>("personal");

  const renderContent = () => {
    switch (activeTab) {
      case "personal":
        return <PersonalEntryView />;
      case "evaluation":
        return <InterviewEvaluationView />;
      case "applicants":
        return <ApplicantListView />;
      case "timetable":
        return <TimetableRegulationsView />;
      case "curriculum":
        return <CurriculumDescriptionView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" expand={false} richColors />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 md:px-2 py-1">
          <h1 className="text-sm font-bold text-blue-600">AI Edu HR</h1>
          <p className="text-xs text-gray-400 mt-1">
            강사 채용 관리 시스템
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 md:px-2">
          <nav className="flex gap-1 overflow-x-auto py-1 -mb-px scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-2 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }
                  `}
                >
                  <tab.icon
                    size={18}
                    className={isActive ? "text-blue-600" : "text-gray-400"}
                  />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-2 md:p-2">{renderContent()}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-1">
        <div className="max-w-7xl mx-auto px-2 md:px-2 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">관리자</p>
              <p className="text-xs text-gray-500">admin@aiedu.co.kr</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            &copy; 2026 AI Edu Co. Ltd.
          </p>
        </div>
      </footer>
    </div>
  );
}
