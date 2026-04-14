import { X, User, Briefcase, FileText, Calendar, CheckCircle, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";

interface ExpertDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expert: {
    name: string;
    deptLarge: string;
    deptMiddle?: string;
    fieldLarge: string;
    fieldMiddle: string;
    fieldSmall?: string;
    appliedAt: string;
    status: string;
    score: number;
  } | null;
}

export function ExpertDetailModal({ isOpen, onClose, expert }: ExpertDetailModalProps) {
  if (!expert) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-[51] overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="text-[16px] font-semibold text-gray-900">전문가 상세 정보</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                {/* Left side: Basic Info */}
                <div className="space-y-6">
                  <div>
                    <label className="text-[12px] text-gray-400 block mb-1">성명</label>
                    <p className="text-[15px] text-gray-900 font-medium">{expert.name}</p>
                  </div>
                  <div>
                    <label className="text-[12px] text-gray-400 block mb-1">소속 부서</label>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                      <p className="text-[14px] text-gray-700">{expert.deptLarge} &gt; {expert.deptMiddle || "N/A"}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] text-gray-400 block mb-1">전문 분야</label>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] rounded border border-blue-100">{expert.fieldLarge}</span>
                      <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[11px] rounded border border-gray-200">{expert.fieldMiddle}</span>
                      {expert.fieldSmall && (
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[11px] rounded border border-gray-200">{expert.fieldSmall}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Application Status */}
                <div className="space-y-6">
                  <div>
                    <label className="text-[12px] text-gray-400 block mb-1">신청일</label>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-[14px] text-gray-700">{expert.appliedAt}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] text-gray-400 block mb-1">상태</label>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[12px] font-medium ${
                        expert.status === "승인" ? "bg-emerald-100 text-emerald-700" :
                        expert.status === "검토중" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {expert.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] text-gray-400 block mb-1">문서 매칭 점수</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${expert.score}%` }} />
                      </div>
                      <span className="text-[14px] font-bold text-blue-600">{expert.score}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-[14px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  신청 사유 및 전문성 기술
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[13px] text-gray-600 leading-relaxed italic">
                    "해당 분야에서 10년 이상의 실무 경력을 보유하고 있으며, 특히 {expert.fieldMiddle} 관련 법적 분쟁 및 문서 작성에 특화되어 있습니다. 사내 Studio를 통해 더 많은 클라이언트들에게 정확한 가이드를 제공하고자 신청하게 되었습니다."
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-100 rounded-xl bg-emerald-50/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-[13px] font-medium text-emerald-700">검증 완료 항목</span>
                  </div>
                  <ul className="text-[12px] text-emerald-600 space-y-1">
                    <li>- 자격증 진위 여부 확인</li>
                    <li>- 과거 경력 증명 완료</li>
                  </ul>
                </div>
                <div className="p-4 border border-gray-100 rounded-xl bg-blue-50/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="text-[13px] font-medium text-blue-700">추천 경로</span>
                  </div>
                  <ul className="text-[12px] text-blue-600 space-y-1">
                    <li>- 고득점 AI 문서 분석가</li>
                    <li>- 사내 추천 전문가</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/30">
              <Button variant="outline" onClick={onClose}>닫기</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">승인 처리</Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
