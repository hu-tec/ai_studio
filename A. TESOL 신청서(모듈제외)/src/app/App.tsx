import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import { ExpertApplicationForm } from "./components/expert-application-form";
import { AdminDashboard } from "./components/admin-dashboard";
import { MOCK_APPLICANTS } from "./components/mock-data";
import type { Applicant } from "./components/types";

const STORAGE_KEY = "expert_applicants_v2";

function loadApplicants(): Applicant[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }
  return MOCK_APPLICANTS;
}

function saveApplicants(applicants: Applicant[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applicants));
}

export default function App() {
  const [applicants, setApplicants] = useState<Applicant[]>(loadApplicants);
  const [activeTab, setActiveTab] = useState<"apply" | "admin">("apply");

  useEffect(() => {
    saveApplicants(applicants);
  }, [applicants]);

  const handleNewApplicant = (applicant: Applicant) => {
    setApplicants((prev) => [applicant, ...prev]);
  };

  const handleUpdateStatus = (
    id: string,
    status: "approved" | "rejected",
    reason?: string
  ) => {
    setApplicants((prev) =>
      prev.map((a) =>
        a.applicant_id === id
          ? { ...a, status, rejection_reason: reason || a.rejection_reason }
          : a
      )
    );
  };

  const handleDelete = (ids: string[]) => {
    if (window.confirm(ids.length === applicants.length ? "리스트 전체를 삭제하시겠습니까?" : `${ids.length}개의 신청서를 삭제하시겠습니까?`)) {
      setApplicants((prev) => prev.filter((a) => !ids.includes(a.applicant_id)));
    }
  };

  const pendingCount = applicants.filter((a) => a.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <Toaster position="top-center" richColors />

      <header className="border-b border-black/10 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#7b1023] text-white text-[10px] grid place-items-center">
              TM
            </div>
            <div className="leading-tight">
              <p className="text-xs text-black">TIMES MEDIA</p>
              <p className="text-[10px] text-black/40">SINCE 2021</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-5 text-xs text-black/60">
            <span>회사소개</span>
            <span>교육프로그램</span>
            <span>커뮤니티</span>
            <span>문의</span>
          </nav>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("apply")}
              className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                activeTab === "apply"
                  ? "bg-[#7b1023] text-white border-[#7b1023]"
                  : "bg-white border-black/10 hover:bg-[#f4f4f5]"
              }`}
            >
              신청
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-2.5 py-1 text-xs rounded-md border transition-all flex items-center gap-1 ${
                activeTab === "admin"
                  ? "bg-black text-white border-black"
                  : "bg-white border-black/10 hover:bg-[#f4f4f5]"
              }`}
            >
              관리
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[16px] h-[16px] rounded-md border border-black/20 bg-white text-black text-[10px] px-0.5">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {activeTab === "apply" && (
        <section className="bg-[#7b1023] text-white">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <p className="text-xl">신청서</p>
            <p className="text-xs text-white/80 mt-1">
              교육 프로그램 신청을 원하시면 아래 신청서를 작성 후 제출해주세요.
            </p>
          </div>
        </section>
      )}

      <main className="px-4 py-8">
        {activeTab === "apply" ? (
          <div className="max-w-6xl mx-auto">
            <div className="max-w-4xl mx-auto">
              <ExpertApplicationForm onSubmit={handleNewApplicant} />
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <AdminDashboard
              applicants={applicants}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDelete}
            />
          </div>
        )}
      </main>

      <footer className="mt-8 bg-[#7b1023] text-white">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm">AI 시대, 당신의 경쟁력을 지금 시작하세요</p>
          <div className="flex gap-2">
            <button className="h-8 px-3 rounded-md bg-white text-[#7b1023] text-xs">
              수강 신청하기
            </button>
            <button className="h-8 px-3 rounded-md border border-white/50 text-xs">
              1:1 문의
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
