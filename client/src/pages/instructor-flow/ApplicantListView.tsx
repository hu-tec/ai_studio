import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Calendar,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

const applicants = [
  {
    id: 1,
    name: "홍길동",
    category: "TESOL",
    type: "일반",
    grade: "1급",
    date: "2026-03-13",
    status: "면접 대기",
    score: 22,
  },
  {
    id: 2,
    name: "이영희",
    category: "Prompt",
    type: "교육용",
    grade: "2급",
    date: "2026-03-12",
    status: "합격",
    score: 24,
  },
  {
    id: 3,
    name: "김철수",
    category: "Translation",
    type: "전문",
    grade: "1급",
    date: "2026-03-11",
    status: "서류 검토",
    score: "-" as string | number,
  },
  {
    id: 4,
    name: "박지민",
    category: "Ethics",
    type: "교육용",
    grade: "5급",
    date: "2026-03-10",
    status: "불합격",
    score: 12,
  },
  {
    id: 5,
    name: "최수지",
    category: "TESOL",
    type: "전문",
    grade: "2급",
    date: "2026-03-09",
    status: "보류",
    score: 18,
  },
  {
    id: 6,
    name: "정다인",
    category: "Prompt",
    type: "일반",
    grade: "3급",
    date: "2026-03-08",
    status: "합격",
    score: 25,
  },
  {
    id: 7,
    name: "강현우",
    category: "Translation",
    type: "교육용",
    grade: "8급",
    date: "2026-03-07",
    status: "서류 탈락",
    score: "-" as string | number,
  },
  {
    id: 8,
    name: "임윤아",
    category: "Ethics",
    type: "전문",
    grade: "1급",
    date: "2026-03-06",
    status: "면접 완료",
    score: 20,
  },
];

const statusStyles: Record<string, string> = {
  "면접 대기": "bg-blue-100 text-blue-700 border-blue-200",
  합격: "bg-green-100 text-green-700 border-green-200",
  "서류 검토": "bg-orange-100 text-orange-700 border-orange-200",
  불합격: "bg-red-100 text-red-700 border-red-200",
  보류: "bg-gray-100 text-gray-700 border-gray-200",
  "서류 탈락": "bg-gray-300 text-gray-600 border-gray-400",
  "면접 완료": "bg-purple-100 text-purple-700 border-purple-200",
};

export function ApplicantListView() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApplicants = applicants.filter(
    (a) => a.name.includes(searchTerm) || a.category.includes(searchTerm)
  );

  return (
    <div className="space-y-2 pb-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-gray-200 pb-2">
        <div>
          <h2 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-1">
            <Users className="text-blue-600" size={32} />
            지원자 관리
          </h2>
          <p className="mt-2 text-gray-500">
            전체 지원 현황 및 면접 결과를 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 rounded-md text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Download size={16} />
            데이터 내보내기
          </button>
          <button className="flex items-center gap-2 px-2 py-1 bg-blue-600 text-white rounded-md text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-100">
            신규 지원자 수동 등록
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-2 rounded-md border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-green-500">+12%</span>
          </div>
          <p className="text-sm text-gray-500">전체 지원자</p>
          <h4 className="text-sm font-bold text-gray-900">128명</h4>
        </div>

        <div className="bg-white p-2 rounded-md border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-md bg-orange-50 flex items-center justify-center text-orange-600">
              <Clock size={20} />
            </div>
            <span className="text-xs font-bold text-orange-500">진행 중</span>
          </div>
          <p className="text-sm text-gray-500">검토 중</p>
          <h4 className="text-sm font-bold text-gray-900">24명</h4>
        </div>

        <div className="bg-white p-2 rounded-md border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-md bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-xs font-bold text-green-500">성공</span>
          </div>
          <p className="text-sm text-gray-500">최종 합격</p>
          <h4 className="text-sm font-bold text-gray-900">15명</h4>
        </div>

        <div className="bg-white p-2 rounded-md border border-gray-100 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-md bg-red-50 flex items-center justify-center text-red-600">
              <AlertCircle size={20} />
            </div>
            <span className="text-xs font-bold text-red-500">-2%</span>
          </div>
          <p className="text-sm text-gray-500">서류 탈락</p>
          <h4 className="text-sm font-bold text-gray-900">42명</h4>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-2 rounded-md border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-1.5">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="이름, 분야, 급수 등으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-2 pr-2 py-1 rounded-md border border-gray-100 bg-gray-50/50 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-2 py-1 border border-gray-100 rounded-md text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all w-full md:w-auto">
          <Filter size={18} />
          필터
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  지원자명
                </th>
                <th className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  지원 분야
                </th>
                <th className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  지원일
                </th>
                <th className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
                  면접 점수
                </th>
                <th className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApplicants.map((applicant) => (
                <tr
                  key={applicant.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                        {applicant.name[0]}
                      </div>
                      <span className="font-bold text-gray-900">
                        {applicant.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        {applicant.category}
                      </p>
                      <p className="text-xs text-gray-500">
                        {applicant.type} / {applicant.grade}
                      </p>
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      {applicant.date}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <span
                      className={`text-sm font-bold ${
                        typeof applicant.score === "number" &&
                        applicant.score >= 20
                          ? "text-blue-600"
                          : "text-gray-900"
                      }`}
                    >
                      {applicant.score}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className={`px-2 py-1.5 rounded-full text-xs font-bold border ${
                        statusStyles[applicant.status] ?? ""
                      }`}
                    >
                      {applicant.status}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="상세보기"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="삭제"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-900 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-2 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-1.5">
          <p className="text-sm text-gray-500">
            총 <span className="font-bold text-gray-900">128명</span> 중{" "}
            <span className="font-bold text-gray-900">1-8명</span> 표시
          </p>
          <div className="flex items-center gap-2">
            <button
              className="p-2 border border-gray-200 rounded-md text-gray-400 hover:bg-gray-50 disabled:opacity-50"
              disabled
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-1">
              <button className="w-10 h-10 rounded-md bg-blue-600 text-white font-bold text-sm shadow-md">
                1
              </button>
              <button className="w-10 h-10 rounded-md text-gray-600 hover:bg-gray-50 font-bold text-sm">
                2
              </button>
              <button className="w-10 h-10 rounded-md text-gray-600 hover:bg-gray-50 font-bold text-sm">
                3
              </button>
              <span className="px-2 text-gray-400">...</span>
              <button className="w-10 h-10 rounded-md text-gray-600 hover:bg-gray-50 font-bold text-sm">
                16
              </button>
            </div>
            <button className="p-2 border border-gray-200 rounded-md text-gray-400 hover:bg-gray-50">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
