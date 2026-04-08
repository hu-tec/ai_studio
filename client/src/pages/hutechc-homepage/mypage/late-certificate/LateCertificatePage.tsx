/* 원본: hutechc_hompage_real/app/mypage/late-certificate/page.tsx */
import { useState } from 'react';
import type { CertificateOption } from '../../types/exam';

export default function LateCertificatePage() {
  const [selectedExam, setSelectedExam] = useState('24년 05차');
  const [mainPurpose, setMainPurpose] = useState('번역자격 전문1급');
  
  const [options, setOptions] = useState<CertificateOption[]>([
    {
      id: 'certificate',
      name: '지적증',
      description: '인쇄: 2,000원 / 배송: 4,000원 (배송료포함)',
      quantity: 1,
      selected: false
    },
    {
      id: 'card',
      name: '카드 지적증',
      description: '배송: 5,000원',
      quantity: 1,
      selected: true
    },
    {
      id: 'english-cert',
      name: '영어시',
      description: '인쇄: 2,00G / 배송: 4,00G원 (배송료포함)',
      quantity: 1,
      selected: false
    },
    {
      id: 'english-card',
      name: '영어시',
      description: '인쇄: 2,00G / 배송: 4,00G원 (배송료포함)',
      quantity: 1,
      selected: false
    }
  ]);

  const toggleOption = (id: string) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, selected: !opt.selected } : opt
    ));
  };

  const updateQuantity = (id: string, delta: number) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, quantity: Math.max(1, (opt.quantity || 1) + delta) } : opt
    ));
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span>홈</span>
        <span>{'>'}</span>
        <span>마이페이지</span>
        <span>{'>'}</span>
        <span className="text-gray-900 font-semibold">지각증신청</span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900">자격증신청</h1>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 font-semibold">법률 자격증</span>
          <span className="text-blue-600">전문1급</span>
        </div>
        <p className="mt-2 text-gray-700">
          시험병이 나오는 영역 시험병이 나오는 영역
        </p>
      </div>

      {/* Selection Section */}
      <div className="mb-8 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">주시</label>
          <select 
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24년 05차">24년 05차</option>
            <option value="24년 04차">24년 04차</option>
            <option value="24년 03차">24년 03차</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">방식</label>
          <select 
            value={mainPurpose}
            onChange={(e) => setMainPurpose(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="번역자격 전문1급">번역자격 전문1급</option>
            <option value="번역자격 전문2급">번역자격 전문2급</option>
          </select>
        </div>
      </div>

      {/* Options Table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            전체누르기
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700">
            결제
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">번호</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">선택</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">자격증 종류</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">방식</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">미리보기</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">출력 수</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">출력상태</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">배송 상태</th>
              </tr>
            </thead>
            <tbody>
              {options.map((option, index) => (
                <tr 
                  key={option.id} 
                  className={`border-b border-gray-100 ${option.selected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={option.selected}
                      onChange={() => toggleOption(option.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-blue-600 font-semibold">{option.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {option.id.includes('card') ? '배송' : '인쇄, 배송'}
                  </td>
                  <td className="px-4 py-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(option.id, -1)}
                        className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{option.quantity}</span>
                      <button
                        onClick={() => updateQuantity(option.id, 1)}
                        className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                      인쇄
                    </button>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    배송전
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-2">
        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">{'|<'}</button>
        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">{'<'}</button>
        <button className="px-3 py-1 bg-blue-600 text-white border-blue-600 rounded">1</button>
        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">{'>'}</button>
        <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">{'>|'}</button>
      </div>
    </div>
  );
}
