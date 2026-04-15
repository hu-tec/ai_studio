import { ExpertApplication } from "../data/mock-applications";
import { X, ExternalLink, Mail, Calendar, Briefcase, FileText, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ApplicationDetailProps {
  application: ExpertApplication | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: "approved" | "rejected") => void;
}

export function ApplicationDetail({ application, onClose, onUpdateStatus }: ApplicationDetailProps) {
  if (!application) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "rejected": return "bg-rose-50 text-rose-700 border-rose-100";
      default: return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
        />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-sm pointer-events-auto overflow-y-auto"
        >
          <div className="sticky top-0 z-10 bg-white border-b border-slate-100 flex items-center justify-between px-2 py-1.5">
            <h2 className="text-sm font-bold text-slate-800">신청 상세 정보</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-2 space-y-2">
            {/* Profile Header */}
            <div className="flex items-center gap-2">
              <div className="w-20 h-20 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-100 shadow-sm">
                {application.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <h3 className="text-sm font-bold text-slate-900">{application.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(application.status)}`}>
                    {application.status === "approved" ? "승인" : application.status === "rejected" ? "거절" : "대기"}
                  </span>
                </div>
                <p className="text-slate-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {application.email}
                </p>
              </div>
            </div>

            {/* Application Info */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5 p-2 bg-slate-50 rounded-md border border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> A. 분야
                </label>
                <p className="text-sm font-semibold text-slate-700">
                  {application.field.large} &gt; {application.field.middle} &gt; {application.field.small || "-"}
                </p>
              </div>
              <div className="space-y-1.5 p-2 bg-slate-50 rounded-md border border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> D. 부서
                </label>
                <p className="text-sm font-semibold text-slate-700">
                  {application.dept.large} &gt; {application.dept.middle || "-"}
                </p>
              </div>
              <div className="space-y-1.5 p-2 bg-slate-50 rounded-md border border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> 신청일
                </label>
                <p className="text-sm font-semibold text-slate-700">{application.appliedAt}</p>
              </div>
              <div className="space-y-1.5 p-2 bg-slate-50 rounded-md border border-slate-100">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> 경력
                </label>
                <p className="text-sm font-semibold text-slate-700">{application.experience}년</p>
              </div>
            </div>

            {/* Portfolio & Description */}
            <div className="space-y-2">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">포트폴리오</h4>
                <a
                  href={application.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-md group transition-all"
                >
                  <div className="flex items-center gap-1">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-blue-800">{application.portfolio}</span>
                  </div>
                  <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">열기</span>
                </a>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">자기소개</h4>
                <div className="p-2 bg-slate-50 rounded-md border border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {application.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {application.status === "pending" && (
              <div className="flex gap-1.5 pt-2">
                <button
                  onClick={() => onUpdateStatus(application.id, "approved")}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-md shadow-sm shadow-emerald-200 transition-all transform active:scale-[0.98]"
                >
                  <CheckCircle className="w-5 h-5" />
                  승인하기
                </button>
                <button
                  onClick={() => onUpdateStatus(application.id, "rejected")}
                  className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold py-1.5 px-2 rounded-md transition-all transform active:scale-[0.98]"
                >
                  <XCircle className="w-5 h-5" />
                  거절하기
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
