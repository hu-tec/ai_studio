/* 원본: hutechc_hompage_real/app/translate/client/payments/page.tsx */
import { useState } from 'react';

const payments = [
  {
    id: 1,
    requestTitle: '비즈니스 계약서 번역',
    amount: 450000,
    status: '완료',
    paymentDate: '2024-11-20',
    method: '신용카드',
  },
  {
    id: 2,
    requestTitle: '의료 논문 번역',
    amount: 620000,
    status: '완료',
    paymentDate: '2024-11-22',
    method: '계좌이체',
  },
  {
    id: 3,
    requestTitle: '마케팅 자료 번역',
    amount: 180000,
    status: '대기',
    paymentDate: '2024-11-25',
    method: '-',
  },
];

type Payment = (typeof payments)[number];

export default function PaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="text-sm text-gray-600 mb-2">홈 &gt; 결제 내역</div>
        <h1 className="text-3xl font-bold text-gray-900">결제 내역</h1>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">총 결제 금액</div>
          <div className="text-3xl font-bold text-blue-600">
            ₩{payments.filter(p => p.status === '완료').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">완료된 결제</div>
          <div className="text-3xl font-bold text-green-600">
            {payments.filter(p => p.status === '완료').length}건
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">대기 중인 결제</div>
          <div className="text-3xl font-bold text-yellow-600">
            {payments.filter(p => p.status === '대기').length}건
          </div>
        </div>
      </div>

      {/* 결제 목록 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">번역 의뢰</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">결제 금액</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">결제 방법</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">결제일</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">상태</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">액션</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-6 text-sm text-gray-900">{payment.requestTitle}</td>
                <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                  ₩{payment.amount.toLocaleString()}
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{payment.method}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{payment.paymentDate}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    payment.status === '완료'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  {payment.status === '완료' ? (
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      상세보기
                    </button>
                  ) : (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors">
                      결제하기
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 상세보기 모달 */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedPayment(null)}>
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-600">결제 상세 정보</h2>
              <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-gray-50 rounded-md">
                <span className="text-gray-600">의뢰 내용</span>
                <span className="font-bold">{selectedPayment.requestTitle}</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50 rounded-md">
                <span className="text-gray-600">기본 번역료</span>
                <span className="font-bold text-blue-600">₩{(selectedPayment.amount * 0.9).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50 rounded-md">
                <span className="text-gray-600">부가세 (10%)</span>
                <span className="font-bold text-blue-600">₩{(selectedPayment.amount * 0.1).toLocaleString()}</span>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg text-center">
                <div className="text-sm opacity-90 mb-2">최종 결제 금액</div>
                <div className="text-4xl font-bold mb-1">₩{selectedPayment.amount.toLocaleString()}</div>
                <div className="text-xs opacity-80">VAT 포함</div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPayment(null)}
              className="w-full mt-6 px-6 py-3 bg-gray-600 text-white rounded-md font-semibold hover:bg-gray-700 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
