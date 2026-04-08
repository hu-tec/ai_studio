/* 원본: hutechc_hompage_real/app/translate/translator/completed/page.tsx */
import { useState } from 'react';

type PaymentStatus = '의뢰자확인대기' | '미수령' | '수령완료' | '포인트변환';

interface CompletedRequest {
  id: string;
  title: string;
  language: string;
  field: string;
  wordCount: number;
  price: number;
  clientName: string;
  completedAt: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'transfer' | 'point'; // transfer: 계좌이체, point: 포인트
}

const mockCompletedRequests: CompletedRequest[] = [
  {
    id: 'comp-000',
    title: '마케팅 브로슈어 번역',
    language: '한국어 → 영어',
    field: '마케팅',
    wordCount: 1500,
    price: 225000,
    clientName: '마케팅에이전시 D',
    completedAt: '2024-12-04',
    paymentStatus: '의뢰자확인대기',
  },
  {
    id: 'comp-001',
    title: '기술 문서 번역',
    language: '한국어 → 영어',
    field: '기술/IT',
    wordCount: 3200,
    price: 480000,
    clientName: '테크회사 A',
    completedAt: '2024-12-02',
    paymentStatus: '수령완료',
    paymentMethod: 'transfer',
  },
  {
    id: 'comp-002',
    title: '마케팅 자료 번역',
    language: '한국어 → 중국어',
    field: '마케팅',
    wordCount: 2100,
    price: 315000,
    clientName: '마케팅사 B',
    completedAt: '2024-12-01',
    paymentStatus: '미수령',
  },
  {
    id: 'comp-003',
    title: '법률 문서 번역',
    language: '영어 → 한국어',
    field: '법률',
    wordCount: 4500,
    price: 900000,
    clientName: '법률사무소 C',
    completedAt: '2024-11-28',
    paymentStatus: '포인트변환',
    paymentMethod: 'point',
  },
];

export default function CompletedPage() {
  const [completedRequests, setCompletedRequests] = useState<CompletedRequest[]>(mockCompletedRequests);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'transfer' | 'point'>('transfer');

  const handleReceivePayment = (id: string) => {
    setCompletedRequests(
      completedRequests.map((req) =>
        req.id === id
          ? {
              ...req,
              paymentStatus: selectedPaymentMethod === 'transfer' ? '수령완료' : '포인트변환',
              paymentMethod: selectedPaymentMethod,
            }
          : req
      )
    );
    alert(
      selectedPaymentMethod === 'transfer'
        ? '계좌로 이체되었습니다. (업무일 기준 1-2일 소요)'
        : '포인트로 전환되었습니다. 포인트는 다음 번역에 사용할 수 있습니다.'
    );
  };

  const totalEarnings = completedRequests.reduce((sum, r) => sum + r.price, 0);
  const paidAmount = completedRequests
    .filter((r) => r.paymentStatus === '수령완료' || r.paymentStatus === '포인트변환')
    .reduce((sum, r) => sum + r.price, 0);
  const waitingAmount = completedRequests
    .filter((r) => r.paymentStatus === '의뢰자확인대기')
    .reduce((sum, r) => sum + r.price, 0);
  const pendingAmount = completedRequests
    .filter((r) => r.paymentStatus === '미수령')
    .reduce((sum, r) => sum + r.price, 0);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">완료된 번역</h1>
        <p className="text-gray-600">완료한 번역 작업과 수익을 확인하세요</p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="text-sm text-gray-600 mb-1">총 완료 건수</div>
          <div className="text-3xl font-bold text-blue-600">{completedRequests.length}건</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="text-sm text-gray-600 mb-1">총 수익</div>
          <div className="text-3xl font-bold text-green-600">₩{totalEarnings.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
          <div className="text-sm text-gray-600 mb-1">의뢰자 확인중</div>
          <div className="text-3xl font-bold text-purple-600">₩{waitingAmount.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="text-sm text-gray-600 mb-1">수령 완료</div>
          <div className="text-3xl font-bold text-green-600">₩{paidAmount.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-6">
          <div className="text-sm text-gray-600 mb-1">수령 대기</div>
          <div className="text-3xl font-bold text-yellow-600">₩{pendingAmount.toLocaleString()}</div>
        </div>
      </div>

      {/* 완료 목록 */}
      <div className="space-y-4">
        {completedRequests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-2">📦</div>
            <div className="text-gray-600">완료한 번역이 없습니다.</div>
          </div>
        ) : (
          completedRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{request.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        request.paymentStatus === '의뢰자확인대기'
                          ? 'bg-purple-100 text-purple-700'
                          : request.paymentStatus === '미수령'
                          ? 'bg-yellow-100 text-yellow-700'
                          : request.paymentStatus === '수령완료'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {request.paymentStatus === '의뢰자확인대기' ? '의뢰자 확인중' : request.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-green-600">₩{request.price.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">수익</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <div className="text-xs text-gray-600 mb-1">언어</div>
                  <div className="font-semibold text-gray-900">{request.language}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">분야</div>
                  <div className="font-semibold text-gray-900">{request.field}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">분량</div>
                  <div className="font-semibold text-gray-900">{request.wordCount.toLocaleString()}단어</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">완료일</div>
                  <div className="font-semibold text-gray-900">{request.completedAt}</div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">의뢰자: {request.clientName}</div>

              {/* 액션 */}
              {request.paymentStatus === '의뢰자확인대기' ? (
                <div className="px-6 py-3 bg-purple-50 text-purple-700 rounded-md font-semibold text-center">
                  ⏳ 의뢰자 최종 확인 중... (1-2일 소요)
                </div>
              ) : request.paymentStatus === '미수령' ? (
                <div className="space-y-3">
                  <div className="flex gap-3 mb-3">
                    <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                      <input
                        type="radio"
                        name={`payment-${request.id}`}
                        value="transfer"
                        checked={selectedPaymentMethod === 'transfer'}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value as 'transfer' | 'point')}
                        className="w-4 h-4"
                      />
                      <span className="font-medium text-sm">계좌 이체</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                      <input
                        type="radio"
                        name={`payment-${request.id}`}
                        value="point"
                        checked={selectedPaymentMethod === 'point'}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value as 'transfer' | 'point')}
                        className="w-4 h-4"
                      />
                      <span className="font-medium text-sm">포인트로 전환</span>
                    </label>
                  </div>
                  <button
                    onClick={() => handleReceivePayment(request.id)}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors"
                  >
                    💰 {selectedPaymentMethod === 'transfer' ? '계좌로' : '포인트로'} 수령하기
                  </button>
                </div>
              ) : (
                <div className="px-6 py-3 bg-green-50 text-green-700 rounded-md font-semibold text-center">
                  ✅ {request.paymentMethod === 'transfer' ? '계좌로 이체 완료' : '포인트로 전환 완료'}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 수익 요약 */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">수익 요약</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">총 수익</div>
            <div className="text-2xl font-bold text-indigo-600">₩{totalEarnings.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">의뢰자 확인중</div>
            <div className="text-2xl font-bold text-purple-600">₩{waitingAmount.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">수령 대기</div>
            <div className="text-2xl font-bold text-yellow-600">₩{pendingAmount.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">수령 완료</div>
            <div className="text-2xl font-bold text-green-600">₩{paidAmount.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
