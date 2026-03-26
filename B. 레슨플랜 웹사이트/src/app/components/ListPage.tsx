import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Search, PenSquare, Paperclip, ChevronLeft, ChevronRight } from "lucide-react";
import { mockLessonPlans } from "./mockData";

export function ListPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [searchFields, setSearchFields] = useState<Record<string, boolean>>({
    title: true,
    comment: false,
    name: false,
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleField = (field: string) => {
    setSearchFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const filtered = useMemo(() => {
    if (!searchText.trim()) return mockLessonPlans;
    const q = searchText.toLowerCase();
    return mockLessonPlans.filter((lp) => {
      if (searchFields.title && lp.topic.toLowerCase().includes(q)) return true;
      if (searchFields.comment && lp.tags.toLowerCase().includes(q)) return true;
      if (searchFields.name && lp.author.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [searchText, searchFields]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-2">
      {/* Header + Search */}
      <div className="bg-white border border-border rounded-lg p-2.5">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-sm shrink-0">레슨플랜 목록</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {[
              { key: "title", label: "제목" },
              { key: "comment", label: "내용" },
              { key: "name", label: "작성자" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchFields[key]}
                  onChange={() => toggleField(key)}
                  className="w-3 h-3 rounded accent-blue-600"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="flex gap-1.5 flex-1 min-w-[200px]">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="검색..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-7 pr-2 py-1.5 border border-border rounded bg-[var(--input-background)] focus:outline-none focus:ring-1 focus:ring-blue-500/30 text-sm"
              />
            </div>
            <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded hover:opacity-90 text-sm">
              검색
            </button>
          </div>
          <button
            onClick={() => navigate("/write")}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm shrink-0"
          >
            <PenSquare className="w-3 h-3" />
            등록
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-border">
                {["#","센터","분류","과정명","기수","태그","학습영역","작성자","레벨","학생수","시간","작성일","조회","첨부"].map((h) => (
                  <th key={h} className="px-2 py-1.5 text-left text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-2 py-6 text-center text-muted-foreground text-sm">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                paginated.map((lp, idx) => (
                  <tr
                    key={lp.id}
                    onClick={() => navigate(`/edit/${lp.id}`)}
                    className="border-b border-border/50 hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-2 py-1.5 text-muted-foreground">{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{lp.center}</td>
                    <td className="px-2 py-1.5">
                      <span className="inline-block px-1.5 py-px bg-blue-100 text-blue-700 rounded text-xs">
                        {lp.category}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{lp.courseName}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap text-xs">{lp.cohort}</td>
                    <td className="px-2 py-1.5">
                      <div className="flex flex-wrap gap-0.5">
                        {lp.tags.split(",").map((t) => (
                          <span key={t.trim()} className="inline-block px-1 py-px bg-gray-100 text-gray-600 rounded text-xs">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{lp.topic}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{lp.author}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{lp.level}</td>
                    <td className="px-2 py-1.5 text-center">{lp.studentCount}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{lp.timeLength}</td>
                    <td className="px-2 py-1.5 whitespace-nowrap">{lp.createdAt}</td>
                    <td className="px-2 py-1.5 text-center">{lp.views}</td>
                    <td className="px-2 py-1.5 text-center">
                      {lp.hasAttachment && <Paperclip className="w-3 h-3 text-muted-foreground mx-auto" />}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-border bg-gray-50/50 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>표시</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-border rounded px-1 py-0.5 bg-white text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>/ 전체 {filtered.length}건</span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-white disabled:opacity-30"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-6 h-6 rounded text-xs ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "hover:bg-white text-muted-foreground"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-white disabled:opacity-30"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}