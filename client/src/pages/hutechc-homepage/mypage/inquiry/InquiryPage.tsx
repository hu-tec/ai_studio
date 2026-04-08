/* 원본: hutechc_hompage_real/app/mypage/inquiry/page.tsx */
import { useState } from 'react';
import type { Inquiry } from '../../types/exam';

const mockInquiries: Inquiry[] = [
  {
    id: 1,
    date: '25.01.01',
    category: '결제 관련',
    title: '재목이 표시되는 영역입니다.',
    content: '문의한 내용이 표시 되는 영역입니다. 문의한 내용이 표시 되는 영역입니다.',
    status: '답변중',
    attachments: ['첨부파일1.pdf', '첨부파일2.pdf']
  },
  {
    id: 2,
    date: '25.01.01',
    category: '사이트 이용 관련',
    title: '재목이 표시되는 영역입니다.',
    content: '문의한 내용이 표시 되는 영역입니다.',
    status: '문의완성'
  },
  {
    id: 3,
    date: '25.01.01',
    category: '사이트 이용 관련',
    title: '재목이 표시되는 영역입니다.',
    content: '문의한 내용이 표시 되는 영역입니다.',
    status: '답변완료'
  },
  {
    id: 4,
    date: '25.01.01',
    category: '결제 관련',
    title: '재목이 표시되는 영역입니다.',
    content: '문의한 내용이 표시 되는 영역입니다.',
    status: '답변중'
  },
  {
    id: 5,
    date: '25.01.01',
    category: '사이트 이용 관련',
    title: '재목이 표시되는 영역입니다.',
    content: '문의한 내용이 표시 되는 영역입니다.',
    status: '문의완성'
  },
  {
    id: 6,
    date: '25.01.01',
    category: '사이트 이용 관련',
    title: '재목이 표시되는 영역입니다.',
    content: '문의한 내용이 표시 되는 영역입니다.',
    status: '답변완료'
  },
  {
    id: 7,
    date: '25.01.01',
    category: '사이트 이용 관련',
    title: '재목이 표시되는 영역입니다.',
    content: '문의한 내용이 표시 되는 영역입니다.',
    status: '답변완료'
  },
  {
    id: 8,
    date: '25.01.01',
    category: '사이트 이용 관련',
    title: '재목이 표시되는 영역입니다.',
    content: '문의한 내용이 표시 되는 영역입니다.',
    status: '답변완료'
  },
  {
    id: 9,
    date: '25.01.01',
    category: '사이트 이용 관련',
    title: '재목이 표시되는 영역입니다.',
    content: '문의한 내용이 표시 되는 영역입니다.',
    status: '문의완성'
  },
  {
    id: 10,
    date: '25.01.01',
    category: '사이트 이용 관련',
    title: '재목이 표시되는 영역입니다.',
    content: '문의한 내용이 표시 되는 영역입니다.',
    status: '답변완료'
  }
];

export default function InquiryPage() {
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [formData, setFormData] = useState({
    category: '문의 유형',
    title: '',
    content: ''
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '답변중':
        return (
          <span className="px-3 py-1 bg-blue-600 text-white rounded text-xs">
            답변중
          </span>
        );
      case '문의완성':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            문의완성
          </span>
        );
      case '답변완료':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            답변완료
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span>홈</span>
        <span>{'>'}</span>
        <span>마이페이지</span>
        <span>{'>'}</span>
        <span className="text-gray-900 font-semibold">1:1 문의</span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900">1:1 문의</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('form')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors ${
              activeTab === 'form'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            1:1 문의
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            문의 내역
          </button>
        </div>
      </div>

      {activeTab === 'form' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-4xl">
          {/* Category Dropdown */}
          <div className="mb-6">
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="문의 유형">문의 유형</option>
              <option value="결제 관련">결제 관련</option>
              <option value="사이트 이용 관련">사이트 이용 관련</option>
              <option value="시험 관련">시험 관련</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* Title Input */}
          <div className="mb-6">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="제목을 입력해주세요."
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Content Textarea */}
          <div className="mb-6">
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="내용을 입력해주세요."
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* File Upload Section */}
          <div className="mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">첨부파이1</span>
                <button className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center hover:bg-gray-500">
                  ×
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">첨부파이2</span>
                <button className="w-4 h-4 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center hover:bg-gray-500">
                  ×
                </button>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded border border-dashed border-gray-300">
              <p className="text-xs text-gray-500 mb-1">파일을 드래그 또는 업로드를 통해 첨부해주세요.</p>
              <p className="text-xs text-gray-400">PPT, DOC, TXT, PDF</p>
            </div>
            <button className="mt-3 px-6 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              파일찾기
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">
              등록
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <>
          {/* Search Bar */}
          <div className="mb-6 flex gap-4">
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="flex items-center">~</span>
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Inquiry List */}
          <div className="space-y-3">
            {mockInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{inquiry.id}</span>
                      <span className="text-sm text-gray-500">{inquiry.date}</span>
                      <span className="text-sm font-semibold text-gray-900">{inquiry.category}</span>
                    </div>
                    {getStatusBadge(inquiry.status)}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {inquiry.title}
                  </h3>
                  <button
                    onClick={() => setSelectedInquiry(selectedInquiry?.id === inquiry.id ? null : inquiry)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {selectedInquiry?.id === inquiry.id ? '접기' : '자세히 보기'}
                  </button>
                </div>

                {/* Expanded Content */}
                {selectedInquiry?.id === inquiry.id && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {/* Question */}
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-gray-900">결제 관련</span>
                        <span className="ml-4 text-sm text-gray-500">재목이 표시되는 영역입니다.</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed mb-4">
                        {inquiry.content}
                      </p>
                      {inquiry.attachments && inquiry.attachments.length > 0 && (
                        <div className="space-y-1">
                          {inquiry.attachments.map((file, index) => (
                            <div key={index} className="text-sm text-blue-600 hover:underline cursor-pointer">
                              {file}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Answer Section */}
                    {inquiry.status === '답변완료' && (
                      <div className="border-t border-gray-200 bg-white p-4">
                        <div className="mb-2">
                          <span className="text-sm font-semibold text-blue-600">답변</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          문의한 내용이 표시 되는 영역입니다. 문의한 내용이 표시 되는 영역입니다. 
                          문의한 내용이 표시 되는 영역입니다. 문의한 내용이 표시 되는 영역입니다.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
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
        </>
      )}

    </div>
  );
}
