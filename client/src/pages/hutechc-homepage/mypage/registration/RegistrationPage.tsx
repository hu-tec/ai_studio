/* 원본: hutechc_hompage_real/app/mypage/registration/page.tsx */
import { useState } from 'react';
import type { ExamRegistration } from '../../types/exam';

const mockData: ExamRegistration[] = [
  {
    id: 1,
    country: '대한민국 서울',
    region: '서울',
    dateTime: '24.01.10.월 10:00-16:00',
    examType: '정시',
    round: 'AITe 번역 전문가 전문1급',
    category: '커리어리 (대), (중), (소)',
    targetAudience: '비즈니스 문서',
    language: '한국어 > English(US)',
    status: '접수하기',
    applicationPeriod: '25.10.10 - 24.10.30'
  },
  {
    id: 2,
    country: '대한민국 서울',
    region: '서울',
    dateTime: '24.01.10.월 10:00-16:00',
    examType: '정시',
    round: 'AITe 번역 전문가 전문1급',
    category: '커리어리 (대), (중), (소)',
    targetAudience: '비즈니스 문서',
    language: '한국어 > English(US)',
    status: '변경',
    applicationPeriod: '25.10.10 - 24.10.30'
  },
  {
    id: 3,
    country: '대한민국 서울',
    region: '서울',
    dateTime: '24.01.10.월 10:00-16:00',
    examType: '정시',
    round: 'AITe 번역 전문가 전문1급',
    category: '커리어리 (대), (중), (소)',
    targetAudience: '비즈니스 문서',
    language: '한국어 > English(US)',
    status: '접수하기',
    applicationPeriod: '25.10.10 - 24.10.30'
  },
  {
    id: 4,
    country: '대한민국 서울',
    region: '서울',
    dateTime: '24.01.10.월 10:00-16:00',
    examType: '정시',
    round: 'AITe 번역 전문가 전문1급',
    category: '커리어리 (대), (중), (소)',
    targetAudience: '비즈니스 문서',
    language: '한국어 > English(US)',
    status: '접수완료',
    applicationPeriod: '25.10.10 - 24.10.30'
  },
];

export default function RegistrationPage() {
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
        <span className="text-gray-900 font-semibold">시험접수</span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900">시험접수</h1>

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
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 whitespace-nowrap">연습용</th>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-gray-600 whitespace-nowrap">시험상태</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((exam, index) => (
              <tr key={exam.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-2 py-3 text-[11px] text-gray-900">{index + 1}</td>
                <td className="px-2 py-3 text-[11px] text-gray-700 whitespace-nowrap">
                  {exam.country}
                </td>
                <td className="px-2 py-3 text-[11px] text-blue-600 whitespace-nowrap">
                  {exam.dateTime}
                </td>
                <td className="px-2 py-3 text-[11px] text-gray-700 whitespace-nowrap">
                  {exam.examType} {exam.round}
                </td>
                <td className="px-2 py-3 text-[11px] text-blue-600 whitespace-nowrap">
                  {exam.round}
                </td>
                <td className="px-2 py-3 text-[11px] text-gray-700 whitespace-nowrap">
                  {exam.category}
                </td>
                <td className="px-2 py-3 text-[11px] text-gray-700 whitespace-nowrap">
                  {exam.targetAudience}
                </td>
                <td className="px-2 py-3 text-[11px] text-blue-600 whitespace-nowrap">
                  {exam.language}
                </td>
                <td className="px-2 py-3 text-[11px]">
                  <button className="text-blue-600 hover:underline">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </td>
                <td className="px-2 py-3 text-[11px]">
                  {exam.status === '접수하기' && (
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-[10px] hover:bg-blue-700 whitespace-nowrap">
                      접수하기
                    </button>
                  )}
                  {exam.status === '변경' && (
                    <button className="px-3 py-1.5 bg-orange-600 text-white rounded text-[10px] hover:bg-orange-700 whitespace-nowrap">
                      변경
                    </button>
                  )}
                  {exam.status === '취소' && (
                    <button className="px-3 py-1.5 bg-gray-600 text-white rounded text-[10px] hover:bg-gray-700 whitespace-nowrap">
                      취소
                    </button>
                  )}
                  {exam.status === '접수완료' && (
                    <button className="px-3 py-1.5 bg-green-600 text-white rounded text-[10px] hover:bg-green-700 whitespace-nowrap">
                      접수완료
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-2">
        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">{'<<'}</button>
        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">{'<'}</button>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 border rounded ${
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">{'>'}</button>
        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">{'>>'}</button>
      </div>
    </div>
  );
}
