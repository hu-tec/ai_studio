/* 원본: hutechc_hompage_real/app/(client-layout)/admin/payment-settlement/page.tsx */
import { Link } from 'react-router';
import { useState } from 'react';

type TabType = 'all' | 'payment' | 'subscription' | 'discount' | 'settlement';

interface PaymentStandard {
  id: number;
  managementNumber: string;
  siteType: string;
  serviceType: string;
  serviceCategory: string;
  unit: string;
  pricePerUnit: string;
  effectiveDate: string;
  isNew?: boolean; // 새로 추가된 항목 표시
}

interface SubscriptionStandard {
  id: number;
  managementNumber: string;
  serviceType: string;
  planA: string;
  planB: string;
  planC: string;
  isNew?: boolean;
}

interface DiscountStandard {
  id: number;
  managementNumber: string;
  discountType: string;
  scope: string;
  period: string;
  benefit: string;
  isNew?: boolean;
}

interface SettlementStandard {
  id: number;
  managementNumber: string;
  standard: string;
  ratio: string;
  effectiveDate: string;
  isNew?: boolean;
}

export default function PaymentSettlementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 편집 모드 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [nextId, setNextId] = useState(1000);

  // Mock 데이터를 state로 관리
  const [paymentStandards, setPaymentStandards] = useState<PaymentStandard[]>(
    Array.from({ length: 23 }, (_, i) => ({
      id: i + 1,
      managementNumber: 'UI240110001',
      siteType: ['시험', '품목', '메타번역'][i % 3],
      serviceType: 'AI',
      serviceCategory: [
        'ChatGPT', '다른 AI', '음성 변환 AI', '번역기', '긴급 여부',
        '휴대씨 에디터', '대면', '전화(화상)'
      ][i % 8],
      unit: ['글자수', '사용 시', '횟수당', '시간당'][i % 4],
      pricePerUnit: ['1', '월 50,000', '100,000', '글자수*2'][i % 4],
      effectiveDate: '2024.01.01',
    }))
  );

  const [subscriptionStandards, setSubscriptionStandards] = useState<SubscriptionStandard[]>(
    Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      managementNumber: 'UI240110001',
      serviceType: ['ChatGPT', '다른 AI', '음성 변환 AI', '번역기'][i],
      planA: '10,000',
      planB: '30,000',
      planC: '무제한',
    }))
  );

  const [discountStandards, setDiscountStandards] = useState<DiscountStandard[]>(
    Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      managementNumber: 'UI240110001',
      discountType: ['회원가입', '첫 결제', '이벤트'][i],
      scope: '가입 후 한 달',
      period: '2024.01.01 - 2024.12.31',
      benefit: '20 %',
    }))
  );

  const [settlementStandards, setSettlementStandards] = useState<SettlementStandard[]>(
    Array.from({ length: 1 }, (_, i) => ({
      id: i + 1,
      managementNumber: 'UI240110001',
      standard: 'A',
      ratio: '20 %',
      effectiveDate: '2024.01.01',
    }))
  );

  // 추가 기능
  const handleAdd = (type: 'payment' | 'subscription' | 'discount' | 'settlement') => {
    const newId = nextId;
    setNextId(newId + 1);

    if (type === 'payment') {
      const newItem: PaymentStandard = {
        id: newId,
        managementNumber: 'UI240110001',
        siteType: '',
        serviceType: '',
        serviceCategory: '',
        unit: '',
        pricePerUnit: '',
        effectiveDate: '',
        isNew: true, // 새로 추가된 항목 표시
      };
      setPaymentStandards([newItem, ...paymentStandards]);
    } else if (type === 'subscription') {
      const newItem: SubscriptionStandard = {
        id: newId,
        managementNumber: 'UI240110001',
        serviceType: '',
        planA: '',
        planB: '',
        planC: '',
        isNew: true,
      };
      setSubscriptionStandards([newItem, ...subscriptionStandards]);
    } else if (type === 'discount') {
      const newItem: DiscountStandard = {
        id: newId,
        managementNumber: 'UI240110001',
        discountType: '',
        scope: '',
        period: '',
        benefit: '',
        isNew: true,
      };
      setDiscountStandards([newItem, ...discountStandards]);
    } else if (type === 'settlement') {
      const newItem: SettlementStandard = {
        id: newId,
        managementNumber: 'UI240110001',
        standard: '',
        ratio: '',
        effectiveDate: '',
        isNew: true,
      };
      setSettlementStandards([newItem, ...settlementStandards]);
    }
  };

  const handleSave = () => {
    // 새로 추가된 항목의 isNew 플래그 제거
    setPaymentStandards(paymentStandards.map(item => ({ ...item, isNew: false })));
    setSubscriptionStandards(subscriptionStandards.map(item => ({ ...item, isNew: false })));
    setDiscountStandards(discountStandards.map(item => ({ ...item, isNew: false })));
    setSettlementStandards(settlementStandards.map(item => ({ ...item, isNew: false })));
    
    alert('저장되었습니다.');
    setIsEditMode(false);
  };

  const handleDelete = (id: number, type: 'payment' | 'subscription' | 'discount' | 'settlement') => {
    if (confirm('정말 삭제하시겠습니까?')) {
      if (type === 'payment') {
        setPaymentStandards(paymentStandards.filter(item => item.id !== id));
      } else if (type === 'subscription') {
        setSubscriptionStandards(subscriptionStandards.filter(item => item.id !== id));
      } else if (type === 'discount') {
        setDiscountStandards(discountStandards.filter(item => item.id !== id));
      } else if (type === 'settlement') {
        setSettlementStandards(settlementStandards.filter(item => item.id !== id));
      }
    }
  };

  // 업데이트 함수들
  const updatePaymentStandard = (id: number, field: keyof PaymentStandard, value: string) => {
    setPaymentStandards(paymentStandards.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const updateSubscriptionStandard = (id: number, field: keyof SubscriptionStandard, value: string) => {
    setSubscriptionStandards(subscriptionStandards.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const updateDiscountStandard = (id: number, field: keyof DiscountStandard, value: string) => {
    setDiscountStandards(discountStandards.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const updateSettlementStandard = (id: number, field: keyof SettlementStandard, value: string) => {
    setSettlementStandards(settlementStandards.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const getPaginatedData = <T,>(data: T[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const totalPages = (dataLength: number) => Math.ceil(dataLength / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* 왼쪽: 햄버거 메뉴 + 검색 */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="검색..."
                className="w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* 오른쪽: 관리자 + 로그아웃 */}
          <div className="flex items-center gap-4">
            <Link to="/hutechc-homepage/admin/dashboard" className="text-sm text-gray-700 hover:text-gray-900">
              관리자
            </Link>
            <Link to="/hutechc-homepage/logout" className="text-sm text-gray-700 hover:text-gray-900">
              로그아웃
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 좌측 사이드바 (아이콘 메뉴) */}
        <aside className="w-[60px] bg-gray-100 min-h-screen border-r border-gray-200 flex flex-col items-center py-6">
          <div className="space-y-6">
            <Link to="/hutechc-homepage/admin/dashboard" className="p-3 hover:bg-gray-200 rounded-lg transition-colors block">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
            <button className="p-3 hover:bg-gray-200 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            <button className="p-3 hover:bg-gray-200 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>
            <button className="p-3 hover:bg-gray-200 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button className="p-3 hover:bg-gray-200 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </div>
        </aside>

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 p-8">
          {/* Breadcrumbs */}
          <div className="text-sm text-gray-600 mb-4">
            홈 &gt; 결제 정산 관리
          </div>

          {/* 페이지 제목 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6">결제/정산 관리</h1>

          {/* 탭 메뉴 */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-1">
              {[
                { id: 'all', label: '전체' },
                { id: 'payment', label: '결제 기준' },
                { id: 'subscription', label: '번역 구독 기준' },
                { id: 'discount', label: '할인 기준' },
                { id: 'settlement', label: '정산 기준' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setCurrentPage(1);
                  }}
                  className={`px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3 mb-6">
            {activeTab === 'all' ? (
              <>
                <button
                  onClick={() => handleAdd('payment')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  결제 기준 추가
                </button>
                <button
                  onClick={() => handleAdd('subscription')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  구독 기준 추가
                </button>
                <button
                  onClick={() => handleAdd('discount')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  할인 기준 추가
                </button>
                <button
                  onClick={() => handleAdd('settlement')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  정산 기준 추가
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  if (activeTab === 'payment') handleAdd('payment');
                  else if (activeTab === 'subscription') handleAdd('subscription');
                  else if (activeTab === 'discount') handleAdd('discount');
                  else if (activeTab === 'settlement') handleAdd('settlement');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                추가
              </button>
            )}
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isEditMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {isEditMode ? '수정 완료' : '수정하기'}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              저장
            </button>
          </div>

          {/* 테이블 영역 */}
          {activeTab === 'all' ? (
            // 전체 탭: 1x4 가로 스크롤 레이아웃
            <div className="overflow-x-auto">
              <div className="inline-flex gap-6 min-w-max">
                {/* 결제 기준 섹션 */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0" style={{ minWidth: '400px' }}>
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">결제 기준</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">번호</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">결제 기준 관리 번호</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">사이트 구분</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">서비스 구분</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">서비스 유형</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">단위</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">단위당 금액</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">수정 적용일</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getPaginatedData(paymentStandards).map((item) => {
                        const isEditable = isEditMode || item.isNew; // 수정 모드이거나 새로 추가된 항목
                        return (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-900">{item.id}</td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.managementNumber}
                                  onChange={(e) => updatePaymentStandard(item.id, 'managementNumber', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              ) : (
                                <span className="text-gray-700">{item.managementNumber}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.siteType}
                                  onChange={(e) => updatePaymentStandard(item.id, 'siteType', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="시험, 품목, 메타번역"
                                />
                              ) : (
                                <span className="text-gray-700">{item.siteType}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.serviceType}
                                  onChange={(e) => updatePaymentStandard(item.id, 'serviceType', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="AI"
                                />
                              ) : (
                                <span className="text-gray-700">{item.serviceType}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.serviceCategory}
                                  onChange={(e) => updatePaymentStandard(item.id, 'serviceCategory', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="ChatGPT, 다른 AI 등"
                                />
                              ) : (
                                <span className="text-gray-700">{item.serviceCategory}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.unit}
                                  onChange={(e) => updatePaymentStandard(item.id, 'unit', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="글자수, 사용 시 등"
                                />
                              ) : (
                                <span className="text-gray-700">{item.unit}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.pricePerUnit}
                                  onChange={(e) => updatePaymentStandard(item.id, 'pricePerUnit', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="1, 월 50,000 등"
                                />
                              ) : (
                                <span className="text-gray-700">{item.pricePerUnit}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.effectiveDate}
                                  onChange={(e) => updatePaymentStandard(item.id, 'effectiveDate', e.target.value)}
                                  className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="YYYY.MM.DD"
                                />
                              ) : (
                                <span className="text-gray-700">{item.effectiveDate}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDelete(item.id, 'payment')}
                                className="text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

                {/* 번역 구독 기준 섹션 */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0" style={{ minWidth: '400px' }}>
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">번역 구독 기준</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">번역 기준 관리 번호</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">서비스 구분</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">A구독 기준 (월 기준)</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">B구독 기준 (월 기준)</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">C구독 기준 (월 기준)</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptionStandards.map((item) => {
                        const isEditable = isEditMode || item.isNew;
                        return (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.managementNumber}
                                  onChange={(e) => updateSubscriptionStandard(item.id, 'managementNumber', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              ) : (
                                <span className="text-gray-700">{item.managementNumber}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.serviceType}
                                  onChange={(e) => updateSubscriptionStandard(item.id, 'serviceType', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="ChatGPT, 다른 AI 등"
                                />
                              ) : (
                                <span className="text-gray-700">{item.serviceType}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.planA}
                                  onChange={(e) => updateSubscriptionStandard(item.id, 'planA', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="10,000"
                                />
                              ) : (
                                <span className="text-gray-700">{item.planA}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.planB}
                                  onChange={(e) => updateSubscriptionStandard(item.id, 'planB', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="30,000"
                                />
                              ) : (
                                <span className="text-gray-700">{item.planB}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.planC}
                                  onChange={(e) => updateSubscriptionStandard(item.id, 'planC', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="무제한"
                                />
                              ) : (
                                <span className="text-gray-700">{item.planC}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDelete(item.id, 'subscription')}
                                className="text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

                {/* 할인 기준 섹션 */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0" style={{ minWidth: '400px' }}>
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">할인 기준</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">할인기준 관리 번호</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">할인 유형</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">적용 범위</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">수정 적용 기간</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">할인혜택</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {discountStandards.map((item) => {
                        const isEditable = isEditMode || item.isNew;
                        return (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.managementNumber}
                                  onChange={(e) => updateDiscountStandard(item.id, 'managementNumber', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              ) : (
                                <span className="text-gray-700">{item.managementNumber}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.discountType}
                                  onChange={(e) => updateDiscountStandard(item.id, 'discountType', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="회원가입, 첫 결제 등"
                                />
                              ) : (
                                <span className="text-gray-700">{item.discountType}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.scope}
                                  onChange={(e) => updateDiscountStandard(item.id, 'scope', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="가입 후 한 달"
                                />
                              ) : (
                                <span className="text-gray-700">{item.scope}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.period}
                                  onChange={(e) => updateDiscountStandard(item.id, 'period', e.target.value)}
                                  className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="YYYY.MM.DD - YYYY.MM.DD"
                                />
                              ) : (
                                <span className="text-gray-700">{item.period}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.benefit}
                                  onChange={(e) => updateDiscountStandard(item.id, 'benefit', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="20 %"
                                />
                              ) : (
                                <span className="text-gray-700">{item.benefit}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDelete(item.id, 'discount')}
                                className="text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

                {/* 정산 기준 섹션 */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0" style={{ minWidth: '400px' }}>
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">정산 기준</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">정산 기준 관리 번호</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">정산 기준</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">정산 비율</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">수정 적용일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlementStandards.map((item) => {
                        const isEditable = isEditMode || item.isNew;
                        return (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.managementNumber}
                                  onChange={(e) => updateSettlementStandard(item.id, 'managementNumber', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              ) : (
                                <span className="text-gray-700">{item.managementNumber}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.standard}
                                  onChange={(e) => updateSettlementStandard(item.id, 'standard', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="A"
                                />
                              ) : (
                                <span className="text-gray-700">{item.standard}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.ratio}
                                  onChange={(e) => updateSettlementStandard(item.id, 'ratio', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="20 %"
                                />
                              ) : (
                                <span className="text-gray-700">{item.ratio}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditable ? (
                                <input
                                  type="text"
                                  value={item.effectiveDate}
                                  onChange={(e) => updateSettlementStandard(item.id, 'effectiveDate', e.target.value)}
                                  className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="YYYY.MM.DD"
                                />
                              ) : (
                                <span className="text-gray-700">{item.effectiveDate}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            </div>
          ) : (
            // 개별 탭: 전체 너비 사용
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* 결제 기준 섹션 */}
              {activeTab === 'payment' && (
                <div>
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">결제 기준</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">번호</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">결제 기준 관리 번호</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">사이트 구분</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">서비스 구분</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">서비스 유형</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">단위</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">단위당 금액</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">수정 적용일</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">삭제</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedData(paymentStandards).map((item) => {
                          const isEditable = isEditMode || item.isNew;
                          return (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-900">{item.id}</td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.managementNumber}
                                    onChange={(e) => updatePaymentStandard(item.id, 'managementNumber', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.managementNumber}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.siteType}
                                    onChange={(e) => updatePaymentStandard(item.id, 'siteType', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="시험, 품목, 메타번역"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.siteType}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.serviceType}
                                    onChange={(e) => updatePaymentStandard(item.id, 'serviceType', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="AI"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.serviceType}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.serviceCategory}
                                    onChange={(e) => updatePaymentStandard(item.id, 'serviceCategory', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="ChatGPT, 다른 AI 등"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.serviceCategory}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.unit}
                                    onChange={(e) => updatePaymentStandard(item.id, 'unit', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="글자수, 사용 시 등"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.unit}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.pricePerUnit}
                                    onChange={(e) => updatePaymentStandard(item.id, 'pricePerUnit', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="1, 월 50,000 등"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.pricePerUnit}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.effectiveDate}
                                    onChange={(e) => updatePaymentStandard(item.id, 'effectiveDate', e.target.value)}
                                    className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="YYYY.MM.DD"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.effectiveDate}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleDelete(item.id, 'payment')}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                    >
                      &lt;
                    </button>
                    {Array.from({ length: Math.min(10, totalPages(paymentStandards.length)) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border border-gray-300 rounded ${
                          currentPage === page ? 'bg-blue-600 text-white' : 'bg-white'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages(paymentStandards.length), currentPage + 1))}
                      disabled={currentPage >= totalPages(paymentStandards.length)}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                    >
                      &gt;
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded">I</button>
                  </div>
                </div>
              )}

              {/* 번역 구독 기준 섹션 */}
              {activeTab === 'subscription' && (
                <div>
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">번역 구독 기준</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">번역 기준 관리 번호</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">서비스 구분</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">A구독 기준 (월 기준)</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">B구독 기준 (월 기준)</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">C구독 기준 (월 기준)</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">삭제</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptionStandards.map((item) => {
                          const isEditable = isEditMode || item.isNew;
                          return (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.managementNumber}
                                    onChange={(e) => updateSubscriptionStandard(item.id, 'managementNumber', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.managementNumber}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.serviceType}
                                    onChange={(e) => updateSubscriptionStandard(item.id, 'serviceType', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="ChatGPT, 다른 AI 등"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.serviceType}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.planA}
                                    onChange={(e) => updateSubscriptionStandard(item.id, 'planA', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="10,000"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.planA}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.planB}
                                    onChange={(e) => updateSubscriptionStandard(item.id, 'planB', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="30,000"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.planB}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.planC}
                                    onChange={(e) => updateSubscriptionStandard(item.id, 'planC', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="무제한"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.planC}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleDelete(item.id, 'subscription')}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 할인 기준 섹션 */}
              {activeTab === 'discount' && (
                <div>
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">할인 기준</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">할인기준 관리 번호</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">할인 유형</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">적용 범위</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">수정 적용 기간</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">할인혜택</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">삭제</th>
                        </tr>
                      </thead>
                      <tbody>
                        {discountStandards.map((item) => {
                          const isEditable = isEditMode || item.isNew;
                          return (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.managementNumber}
                                    onChange={(e) => updateDiscountStandard(item.id, 'managementNumber', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.managementNumber}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.discountType}
                                    onChange={(e) => updateDiscountStandard(item.id, 'discountType', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="회원가입, 첫 결제 등"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.discountType}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.scope}
                                    onChange={(e) => updateDiscountStandard(item.id, 'scope', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="가입 후 한 달"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.scope}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.period}
                                    onChange={(e) => updateDiscountStandard(item.id, 'period', e.target.value)}
                                    className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="YYYY.MM.DD - YYYY.MM.DD"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.period}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.benefit}
                                    onChange={(e) => updateDiscountStandard(item.id, 'benefit', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="20 %"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.benefit}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleDelete(item.id, 'discount')}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 정산 기준 섹션 */}
              {activeTab === 'settlement' && (
                <div>
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">정산 기준</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">정산 기준 관리 번호</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">정산 기준</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">정산 비율</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">수정 적용일</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settlementStandards.map((item) => {
                          const isEditable = isEditMode || item.isNew;
                          return (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.managementNumber}
                                    onChange={(e) => updateSettlementStandard(item.id, 'managementNumber', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.managementNumber}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.standard}
                                    onChange={(e) => updateSettlementStandard(item.id, 'standard', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="A"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.standard}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.ratio}
                                    onChange={(e) => updateSettlementStandard(item.id, 'ratio', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="20 %"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.ratio}</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditable ? (
                                  <input
                                    type="text"
                                    value={item.effectiveDate}
                                    onChange={(e) => updateSettlementStandard(item.id, 'effectiveDate', e.target.value)}
                                    className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="YYYY.MM.DD"
                                  />
                                ) : (
                                  <span className="text-gray-700">{item.effectiveDate}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
