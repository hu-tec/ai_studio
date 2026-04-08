/* 원본: hutechc_hompage_real/app/mypage/results/page.tsx */
import { useState } from 'react';
import type { ExamResult } from '../../types/exam';

const mockResults: ExamResult[] = [
  {
    id: 1,
    country: '대한민국 서울',
    region: '서울',
    examDate: '24.01.10.월 10:00-16:00',
    examType: '정시',
    round: 'AITe 번역 전문가 전문1급',
    category: '커리어리 (대), (중), (소)',
    targetAudience: '비즈니스 문서',
    language: '한국어 > English(US)',
    examStatus: '시험 응시 불가',
    passed: true,
    examPeriod: '25.10.10 - 24.10.30',
    actions: {
      payment: true,
      cancel: false
    }
  },
  {
    id: 2,
    country: '대한민국 서울',
    region: '서울',
    examDate: '24.01.10.월 10:00-16:00',
    examType: '정시',
    round: 'AITe 번역 전문가 전문1급',
    category: '커리어리 (대), (중), (소)',
    targetAudience: '비즈니스 문서',
    language: '한국어 > English(US)',
    examStatus: '시험 응시 불가',
    passed: false,
    examPeriod: '25.10.10 - 24.10.30',
    actions: {
      payment: false,
      cancel: false
    }
  },
];

export default function ResultsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span>홈</span>
        <span>{'>'}</span>
        <span>마이페이지</span>
        <span>{'>'}</span>
        <span className="text-gray-900 font-semibold">시험결과</span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900">시험결과</h1>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="YYYY.MM.DD"
        />
        <span className="flex items-center">~</span>
        <input
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="YYYY.MM.DD"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="검색해주세요."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold">
          검색
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 whitespace-nowrap">번호</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 whitespace-nowrap">지역</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 whitespace-nowrap">시험일 시험시간</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 whitespace-nowrap">접수 구분 차수</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 whitespace-nowrap">시험 종목 시험 등급</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 whitespace-nowrap">검정과목 분야-영역</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 whitespace-nowrap">시험팀 도착어</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 whitespace-nowrap">출발어 도착어</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 whitespace-nowrap">합격여부</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 whitespace-nowrap">신청</th>
            </tr>
          </thead>
          <tbody>
            {mockResults.map((result, index) => (
              <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-2 py-3 text-[11px] text-gray-900">{index + 1}</td>
                <td className="px-2 py-3 text-[11px] text-gray-700 whitespace-nowrap">
                  {result.country}
                </td>
                <td className="px-2 py-3 text-[11px] text-blue-600 whitespace-nowrap">
                  {result.examDate}
                </td>
                <td className="px-2 py-3 text-[11px] text-gray-700 whitespace-nowrap">
                  {result.examType} {result.round}
                </td>
                <td className="px-2 py-3 text-[11px] text-blue-600 whitespace-nowrap">
                  {result.round}
                </td>
                <td className="px-2 py-3 text-[11px] text-gray-700 whitespace-nowrap">
                  {result.category}
                </td>
                <td className="px-2 py-3 text-[11px] text-gray-700 whitespace-nowrap">
                  {result.targetAudience}
                </td>
                <td className="px-2 py-3 text-[11px] text-blue-600 whitespace-nowrap">
                  {result.language}
                </td>
                <td className="px-2 py-3 text-[11px]">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                    result.passed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {result.passed ? '합격' : '불합격'}
                  </span>
                </td>
                <td className="px-2 py-3 text-[11px]">
                  <div className="flex flex-col gap-1.5">
                    <button className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-600 rounded text-[10px] hover:bg-blue-100 whitespace-nowrap">
                      피드백 신청
                    </button>
                    <button className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-600 rounded text-[10px] hover:bg-blue-100 whitespace-nowrap">
                      지각증 확인
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-2">
        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">{'|<'}</button>
        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">{'<'}</button>
        <button
          onClick={() => setCurrentPage(1)}
          className="px-3 py-1 bg-blue-600 text-white border-blue-600 rounded"
        >
          1
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">{'>'}</button>
        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">{'>|'}</button>
      </div>
    </div>
  );
}
