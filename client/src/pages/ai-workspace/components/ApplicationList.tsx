import { useState } from "react";
import { ExpertApplication } from "../data/mock-applications";
import { LayoutGrid, List, Eye, CheckCircle2, XCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ApplicationListProps {
  applications: ExpertApplication[];
  onSelectItem: (app: ExpertApplication) => void;
}

export function ApplicationList({ applications, onSelectItem }: ApplicationListProps) {
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "rejected": return "bg-rose-50 text-rose-700 border-rose-100";
      default: return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle2 className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-1">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">
          신청 목록 <span className="text-slate-400 font-normal ml-2">({applications.length})</span>
        </h3>
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode("card")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "card" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "card" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
          >
            {applications.map((app) => (
              <div
                key={app.id}
                className="group bg-white rounded-md shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-2 flex flex-col gap-1.5 relative"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                      {app.name[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{app.name}</h4>
                      <p className="text-xs text-slate-500">{app.email}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    {app.status === "approved" ? "승인" : app.status === "rejected" ? "거절" : "대기"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      A: {app.field.large} &gt; {app.field.middle}
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                      D: {app.dept.large}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed h-10">
                    {app.description}
                  </p>
                </div>

                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">신청일: {app.appliedAt}</span>
                  <button
                    onClick={() => onSelectItem(app)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    상세보기
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden"
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-2 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">이름</th>
                  <th className="px-2 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">A. 분야</th>
                  <th className="px-2 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">D. 부서</th>
                  <th className="px-2 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">경력</th>
                  <th className="px-2 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">상태</th>
                  <th className="px-2 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                          {app.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 text-sm">{app.name}</div>
                          <div className="text-[11px] text-slate-500">{app.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="text-xs text-slate-600">{app.field.large} &gt; {app.field.middle}</span>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="text-xs text-slate-600">{app.dept.large}</span>
                    </td>
                    <td className="px-2 py-1.5 text-sm text-slate-600">
                      {app.experience}년
                    </td>
                    <td className="px-2 py-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        {app.status === "approved" ? "승인" : app.status === "rejected" ? "거절" : "대기"}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <button
                        onClick={() => onSelectItem(app)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
