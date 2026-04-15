import { useState, useMemo } from "react";
import { StatSummary } from "./StatSummary";
import { FilterSystem } from "./FilterSystem";
import { ApplicationList } from "./ApplicationList";
import { ApplicationDetail } from "./ApplicationDetail";
import { MOCK_APPLICATIONS, ExpertApplication } from "../data/mock-applications";
import { toast } from "sonner";

export function ExpertDashboard() {
  const [applications, setApplications] = useState<ExpertApplication[]>(MOCK_APPLICATIONS);
  const [selectedApp, setSelectedApp] = useState<ExpertApplication | null>(null);
  const [filters, setFilters] = useState({
    field: { large: "", middle: "", small: "" },
    dept: { large: "", middle: "" },
    searchTerm: ""
  });

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const fieldMatch =
        (!filters.field.large || app.field.large === filters.field.large) &&
        (!filters.field.middle || app.field.middle === filters.field.middle) &&
        (!filters.field.small || app.field.small === filters.field.small);

      const deptMatch =
        (!filters.dept.large || app.dept.large === filters.dept.large) &&
        (!filters.dept.middle || app.dept.middle === filters.dept.middle);

      const searchMatch =
        !filters.searchTerm ||
        app.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(filters.searchTerm.toLowerCase());

      return fieldMatch && deptMatch && searchMatch;
    });
  }, [applications, filters]);

  const handleUpdateStatus = (id: string, status: "approved" | "rejected") => {
    setApplications(prev => prev.map(app =>
      app.id === id ? { ...app, status } : app
    ));
    setSelectedApp(prev => prev && prev.id === id ? { ...prev, status } : prev);
    toast.success(status === "approved" ? "신청이 승인되었습니다." : "신청이 거절되었습니다.");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-2 md:p-2">
      <div className="max-w-[1600px] mx-auto space-y-2">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">전문가 신청 관리</h1>
          <p className="text-slate-500 font-medium">분야별 전문가 신청 현황을 확인하고 승인 여부를 결정합니다.</p>
        </div>

        {/* Dashboard Components */}
        <StatSummary />

        <div className="space-y-2">
          <FilterSystem onFilterChange={setFilters} />

          <ApplicationList
            applications={filteredApplications}
            onSelectItem={setSelectedApp}
          />
        </div>

        {/* Detail Panel */}
        <ApplicationDetail
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
}
