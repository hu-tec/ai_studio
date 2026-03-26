import { useState, useMemo } from "react";
import type { Applicant } from "./types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AdminDashboardProps {
  applicants: Applicant[];
  onUpdateStatus: (
    id: string,
    status: "approved" | "rejected",
    reason?: string
  ) => void;
  onDelete: (ids: string[]) => void;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const STATUS_MAP: Record<string, { emoji: string; label: string }> = {
  pending: { emoji: "\u23F3", label: "\uB300\uAE30" },
  approved: { emoji: "\u2705", label: "\uC2B9\uC778" },
  rejected: { emoji: "\u274C", label: "\uBC18\uB824" },
};

export function AdminDashboard({
  applicants,
  onUpdateStatus,
  onDelete,
}: AdminDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [hoveredApplicant, setHoveredApplicant] = useState<Applicant | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) => {
      const matchStatus =
        statusFilter === "all" || a.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        a.basic.name.includes(q) ||
        a.basic.email.includes(q) ||
        a.application.available_languages.some((l) =>
          l.toLowerCase().includes(q)
        );
      return matchStatus && matchSearch;
    });
  }, [applicants, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const p = applicants.filter((a) => a.status === "pending").length;
    const ap = applicants.filter((a) => a.status === "approved").length;
    const r = applicants.filter((a) => a.status === "rejected").length;
    return { total: applicants.length, pending: p, approved: ap, rejected: r };
  }, [applicants]);

  const handleApprove = (a: Applicant) => {
    onUpdateStatus(a.applicant_id, "approved");
    toast.success(`${a.basic.name} — 승인 완료`);
  };

  const handleRejectClick = (a: Applicant) => {
    setSelectedApplicant(a);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim())
      return toast.error("반려 사유를 입력해주세요.");
    if (selectedApplicant) {
      onUpdateStatus(
        selectedApplicant.applicant_id,
        "rejected",
        rejectReason
      );
      toast.success(`${selectedApplicant.basic.name} — 반려 처리`);
      setRejectDialogOpen(false);
      setSelectedApplicant(null);
    }
  };

  const handleViewDetail = (a: Applicant) => {
    setSelectedApplicant(a);
    setDetailDialogOpen(true);
  };

  const filterBtns: { key: StatusFilter; emoji: string; label: string }[] = [
    { key: "all", emoji: "\uD83D\uDCCB", label: `전체 ${stats.total}` },
    { key: "pending", emoji: "\u23F3", label: `대기 ${stats.pending}` },
    { key: "approved", emoji: "\u2705", label: `승인 ${stats.approved}` },
    { key: "rejected", emoji: "\u274C", label: `반려 ${stats.rejected}` },
  ];

  return (
    <div className="w-full">
      {/* ── Filter + Search ── */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <div className="flex gap-0.5">
          {filterBtns.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                statusFilter === f.key
                  ? "border-black bg-black text-white"
                  : "border-black/10 hover:bg-[#f4f4f5]"
              }`}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[160px]">
          <Input
            placeholder="\uD83D\uDD0D 이름 · 이메일 · 언어 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 text-[10px]"
          />
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {selectedIds.size > 0 && (
            <button
              onClick={() => {
                onDelete(Array.from(selectedIds));
                setSelectedIds(new Set());
              }}
              className="px-2.5 py-1 text-[10px] rounded-md border transition-all flex items-center gap-1 bg-white hover:bg-red-50 text-red-600 border-red-200 shadow-sm font-medium whitespace-nowrap"
            >
              선택 삭제 ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => {
              if (filteredApplicants.length > 0) {
                onDelete(filteredApplicants.map((a) => a.applicant_id));
                setSelectedIds(new Set());
              }
            }}
            disabled={filteredApplicants.length === 0}
            className="px-2.5 py-1 text-[10px] rounded-md border transition-all flex items-center gap-1 bg-black text-white hover:bg-black/80 border-black shadow-sm font-medium whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed"
          >
            전체 삭제
          </button>
        </div>
      </div>

      {/* ── Applicant Table ── */}
      {filteredApplicants.length === 0 ? (
        <div className="border border-black/10 rounded-md py-10 text-center">
          <div className="text-3xl opacity-30 mb-1">{"\uD83D\uDCED"}</div>
          <p className="text-[10px] text-black/30">
            {searchQuery || statusFilter !== "all"
              ? "검색 결과 없음"
              : "신청자 없음"}
          </p>
        </div>
      ) : (
        <div className="flex gap-4 items-start">
          <div className="flex-1 min-w-0 border border-black/10 rounded-md overflow-hidden bg-white">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[28px_28px_1fr_1fr_1fr_110px] bg-[#fafafa] border-b border-black/10 text-[10px] text-black/35 px-2.5 py-1">
            <span className="flex items-center justify-center">
              <Checkbox
                checked={filteredApplicants.length > 0 && selectedIds.size === filteredApplicants.length}
                onCheckedChange={(c) => {
                  if (c) setSelectedIds(new Set(filteredApplicants.map((a) => a.applicant_id)));
                  else setSelectedIds(new Set());
                }}
              />
            </span>
            <span />
            <span>신청자</span>
            <span>언어 · 경력</span>
            <span>직업 · 학력</span>
            <span className="text-right">액션</span>
          </div>

          {filteredApplicants.map((a, idx) => {
            const st = STATUS_MAP[a.status];
            return (
              <div
                key={a.applicant_id}
                onMouseEnter={() => setHoveredApplicant(a)}
                onMouseLeave={() => setHoveredApplicant(null)}
                className={`grid grid-cols-1 sm:grid-cols-[28px_28px_1fr_1fr_1fr_110px] items-center gap-0.5 sm:gap-0 px-2.5 py-1.5 text-xs hover:bg-[#f4f4f5] transition-colors cursor-pointer ${
                  idx !== filteredApplicants.length - 1
                    ? "border-b border-black/5"
                    : ""
                }`}
              >
                {/* Checkbox */}
                <span className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(a.applicant_id)}
                    onCheckedChange={(c) => {
                      const next = new Set(selectedIds);
                      if (c) next.add(a.applicant_id);
                      else next.delete(a.applicant_id);
                      setSelectedIds(next);
                    }}
                  />
                </span>

                {/* Status */}
                <span className="text-xs" title={st.label}>
                  {st.emoji}
                </span>

                {/* Name + email + date */}
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs truncate">{a.basic.name}</span>
                    <span className="text-[10px] text-black/25 truncate">
                      {a.basic.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-black/30 mt-0.5">
                    <span className="flex items-center gap-1">
                      {"\uD83D\uDCC5"} {a.applied_at.split(' ')[0]}
                    </span>
                    {a.applied_at.split(' ')[1] && (
                      <span className="flex items-center gap-1">
                        {"\uD83D\uDD52"} {a.applied_at.split(' ')[1]}
                      </span>
                    )}
                  </div>
                  {a.status === "rejected" && a.rejection_reason && (
                    <p className="text-[10px] text-red-500 truncate">
                      {"\u26A0\uFE0F"} {a.rejection_reason}
                    </p>
                  )}
                </div>

                {/* Languages + Experience */}
                <div className="flex flex-wrap gap-0.5 items-center">
                  {a.application.available_languages.map((l) => (
                    <span
                      key={l}
                      className="text-[10px] border border-black/10 rounded-md px-1 py-px"
                    >
                      {l}
                    </span>
                  ))}
                  <span className="text-[10px] text-black/30 ml-0.5">
                    · {a.application.experience}
                  </span>
                </div>

                {/* Occupation + Education */}
                <div className="text-[10px] text-black/40 truncate">
                  {a.application.occupation.join(", ")} ·{" "}
                  {a.application.education}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 justify-end">
                  <button
                    onClick={() => handleViewDetail(a)}
                    className="text-[10px] px-1.5 py-px rounded-md border border-black/10 hover:bg-[#f4f4f5] transition-colors"
                  >
                    {"\uD83D\uDC41\uFE0F"}
                  </button>
                  {a.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(a)}
                        className="text-[10px] px-1.5 py-px rounded-md bg-black text-white hover:bg-black/80 transition-colors"
                      >
                        {"\u2713"}승인
                      </button>
                      <button
                        onClick={() => handleRejectClick(a)}
                        className="text-[10px] px-1.5 py-px rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        {"\u2717"}반려
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          </div>

          {/* ── Hover Preview Panel (Right Side) ── */}
          <div className="hidden lg:block w-[320px] shrink-0 sticky top-4">
            {hoveredApplicant ? (
              <div className="border border-black/10 rounded-md bg-white shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]">
                <div className="px-3 py-2 border-b border-black/10 bg-[#fafafa]">
                  <p className="text-sm font-bold flex items-center gap-1.5">
                    {"\uD83D\uDCC4"} 미리보기 <span className="text-[10px] font-normal text-black/40">Preview</span>
                  </p>
                </div>
                <div className="p-3 overflow-y-auto space-y-3">
                  <div>
                    <div className="text-[10px] text-black/40 mb-1">{"\uD83D\uDC64"} 기본 정보</div>
                    <p className="text-xs font-medium">{hoveredApplicant.basic.name}</p>
                    <p className="text-[10px] text-black/60">{hoveredApplicant.basic.email}</p>
                    <p className="text-[10px] text-black/60">{hoveredApplicant.basic.phone}</p>
                    {hoveredApplicant.basic.course && <p className="text-[10px] text-black/60 mt-1">지원 구분: {hoveredApplicant.basic.course}</p>}
                    <p className="text-[10px] text-black/60 mt-1">생년월일: {hoveredApplicant.basic.birthDate || "미상"}</p>
                  </div>
                  <div>
                    <div className="text-[10px] text-black/40 mb-1">{"\uD83D\uDCDD"} 신청 정보</div>
                    <p className="text-xs">{hoveredApplicant.application.available_languages.join(", ")}</p>
                    <p className="text-[10px] text-black/60 mt-0.5">희망 시간: {hoveredApplicant.application.available_time}</p>
                    <p className="text-[10px] text-black/60">지역: {hoveredApplicant.application.experience}</p>
                  </div>
                  {hoveredApplicant.basic.introduction && (
                    <div className="border-t border-black/5 pt-2">
                      <div className="text-[10px] text-black/40 mb-1">{"\u270F\uFE0F"} 자기소개</div>
                      <p className="text-[10px] text-black/60 whitespace-pre-line line-clamp-4">{hoveredApplicant.basic.introduction}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-black/5 border-dashed rounded-md bg-[#fafafa] flex items-center justify-center p-8 h-full min-h-[200px]">
                <p className="text-xs text-black/30 text-center">리스트에 마우스를 올리면<br/>미리보기가 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Reject Dialog ── */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-xs rounded-md">
          <DialogHeader>
            <DialogTitle className="text-xs">
              {"\uD83D\uDDD1\uFE0F"} 신청 반려 — {selectedApplicant?.basic.name}
            </DialogTitle>
            <DialogDescription className="text-[10px]">
              반려 사유를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-1">
            <Textarea
              placeholder="반려 사유..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="text-xs"
            />
          </div>
          <DialogFooter className="gap-0.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectDialogOpen(false)}
              className="text-xs h-7 rounded-md"
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={handleRejectConfirm}
              className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 rounded-md"
            >
              반려 처리
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ── */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-md">
          <DialogHeader className="px-3 pt-3 pb-1.5">
            <DialogTitle className="text-xs flex items-center gap-1.5">
              {"\uD83D\uDCC4"} {selectedApplicant?.basic.name}
              {selectedApplicant && (
                <span className="text-[10px] text-black/35">
                  {STATUS_MAP[selectedApplicant.status].emoji}{" "}
                  {STATUS_MAP[selectedApplicant.status].label} ·{" "}
                  {"\uD83D\uDCC5"} {selectedApplicant.applied_at}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedApplicant && (
            <div className="max-h-[60vh] overflow-y-auto px-3 pb-3 space-y-1.5">
              {/* 기본 정보 */}
              <div className="border border-black/10 rounded-md">
                <div className="border-b border-black/10 px-2 py-0.5 bg-[#fafafa] text-[10px] text-black/40">
                  {"\uD83D\uDC64"} 기본 정보
                </div>
                <div className="p-2 grid grid-cols-3 gap-x-2 gap-y-1 text-[10px]">
                  <div>
                    <span className="text-black/30">이름</span>
                    <p className="text-xs">{selectedApplicant.basic.name}</p>
                  </div>
                  <div>
                    <span className="text-black/30">이메일</span>
                    <p className="text-xs truncate">
                      {selectedApplicant.basic.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/30">전화번호</span>
                    <p className="text-xs">{selectedApplicant.basic.phone}</p>
                  </div>
                  {selectedApplicant.basic.course && (
                    <div>
                      <span className="text-black/30">지원 구분</span>
                      <p className="text-xs">{selectedApplicant.basic.course}</p>
                    </div>
                  )}
                  {selectedApplicant.basic.job && (
                    <div>
                      <span className="text-black/30">직업</span>
                      <p className="text-xs">{selectedApplicant.basic.job}</p>
                    </div>
                  )}
                  {selectedApplicant.basic.introduction && (
                    <div className="col-span-3 mt-0.5 border-t border-black/5 pt-1">
                      <span className="text-black/30">{"\u270F\uFE0F"} 자기소개</span>
                      <p className="text-xs whitespace-pre-line mt-0.5 text-black/60">
                        {selectedApplicant.basic.introduction}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 신청 정보 */}
              <div className="border border-black/10 rounded-md">
                <div className="border-b border-black/10 px-2 py-0.5 bg-[#fafafa] text-[10px] text-black/40">
                  {"\uD83D\uDCDD"} 신청 정보
                </div>
                <div className="p-2 grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-1.5 text-[10px]">
                  <div>
                    <span className="text-black/30">{"\uD83C\uDF10"} 언어</span>
                    <p className="text-xs">
                      {selectedApplicant.application.available_languages.join(
                        ", "
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/30">{"\u23F0"} 가능 시간</span>
                    <p className="text-xs">
                      {selectedApplicant.application.available_time}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/30">{"\uD83D\uDCBC"} 경력</span>
                    <p className="text-xs">
                      {selectedApplicant.application.experience}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/30">{"\uD83C\uDF93"} 학력</span>
                    <p className="text-xs">
                      {selectedApplicant.application.education}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-black/30">{"\uD83C\uDFE2"} 직업</span>
                    <p className="text-xs">
                      {selectedApplicant.application.occupation.join(", ")}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-black/30">{"\uD83D\uDCDE"} 통화 가능</span>
                    <p className="text-xs">
                      {selectedApplicant.application.call_time}
                    </p>
                  </div>
                </div>
              </div>

              {/* 기타 정보 */}
              <div className="border border-black/10 rounded-md">
                <div className="border-b border-black/10 px-2 py-0.5 bg-[#fafafa] text-[10px] text-black/40">
                  {"\uD83D\uDCCE"} 기타 정보
                </div>
                <div className="p-2 grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-1.5 text-[10px]">
                  <div>
                    <span className="text-black/30">{"\uD83C\uDFAF"} 목표</span>
                    <p className="text-xs">
                      {selectedApplicant.extra.work_goals.length > 0
                        ? selectedApplicant.extra.work_goals.join(", ")
                        : "\u2014"}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/30">{"\uD83C\uDFC6"} 자격증</span>
                    <p className="text-xs">
                      {selectedApplicant.extra.language_certs.length > 0
                        ? selectedApplicant.extra.language_certs.join(", ")
                        : "\u2014"}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/30">{"\u2708\uFE0F"} 해외</span>
                    <p className="text-xs">
                      {selectedApplicant.extra.overseas_experience || "\u2014"}
                    </p>
                  </div>
                  <div>
                    <span className="text-black/30">{"\uD83E\uDD16"} MT</span>
                    <p className="text-xs">
                      {selectedApplicant.extra.mt_experience || "\u2014"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rejection reason */}
              {selectedApplicant.status === "rejected" &&
                selectedApplicant.rejection_reason && (
                  <div className="border border-red-200 rounded-md p-2 text-[10px] text-red-600">
                    {"\u26A0\uFE0F"} 반려 사유: {selectedApplicant.rejection_reason}
                  </div>
                )}
            </div>
          )}

          {/* Footer actions */}
          {selectedApplicant?.status === "pending" && (
            <div className="border-t border-black/10 px-3 py-1.5 flex gap-1">
              <button
                onClick={() => {
                  handleApprove(selectedApplicant);
                  setDetailDialogOpen(false);
                }}
                className="flex-1 text-xs h-7 rounded-md bg-black text-white hover:bg-black/80 transition-colors"
              >
                {"\u2713"} 승인
              </button>
              <button
                onClick={() => {
                  setDetailDialogOpen(false);
                  handleRejectClick(selectedApplicant);
                }}
                className="flex-1 text-xs h-7 rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
              >
                {"\u2717"} 반려
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
