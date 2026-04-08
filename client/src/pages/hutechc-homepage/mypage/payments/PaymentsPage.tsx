/* 원본: hutechc_hompage_real/app/mypage/payments/page.tsx */
import { useState } from 'react';
import type { PaymentHistory } from '../../types/exam';

const mockPayments: PaymentHistory[] = [
  {
    id: 1,
    date: '24.01.10.월\n10:00-16:00',
    examType: '시험 접수',
    amount: 100000,
    discount: -10000,
    finalAmount: 90000,
    paymentMethod: '카드 결제',
    status: '완료'
  },
  {
    id: 2,
    date: '24.01.10.월\n10:00-16:00',
    examType: '시험 접수',
    amount: 100000,
    discount: -10000,
    finalAmount: 90000,
    paymentMethod: '카드 결제',
    status: '완료'
  },
  {
    id: 3,
    date: '24.01.10.월\n10:00-16:00',
    examType: '시험 접수',
    amount: 100000,
    discount: -10000,
    finalAmount: 90000,
    paymentMethod: '카드 결제',
    status: '환불 상세'
  },
  {
    id: 4,
    date: '24.01.10.월\n10:00-16:00',
    examType: '시험 접수',
    amount: 100000,
    discount: -10000,
    finalAmount: 90000,
    paymentMethod: '카드 결제',
    status: '환불 완료'
  },
];

export default function PaymentsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusButton = (status: string, id: number) => {
    switch (status) {
      case '완료':
        return (
          <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
            완성
          </button>
        );
      case '환불 신청':
        return (
          <button className="px-3 py-1 border border-gray-400 text-gray-700 rounded text-xs hover:bg-gray-50">
            환불 신청
          </button>
        );
      case '환불 상세':
        return (
          <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200">
            환불 상세
          </button>
        );
      case '환불 완료':
        return (
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">
            환불 완료
          </button>
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
        <span className="text-gray-900 font-semibold">결제 내역</span>
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 text-gray-900">결제 내역</h1>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">번호</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">날짜/시간</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">구분</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">금액</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">할인</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">결제 금액</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">결제 방식</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">상태</th>
            </tr>
          </thead>
          <tbody>
            {mockPayments.map((payment, index) => (
              <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-900">{index + 1}</td>
                <td className="px-4 py-4 text-sm text-blue-600">
                  {payment.date.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">{payment.examType}</td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  {payment.amount.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">
                  (이벤트 할인) {(payment.discount || 0).toLocaleString()}
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                  {(payment.finalAmount || 0).toLocaleString()}
                </td>
                <td className="px-4 py-4 text-sm text-gray-700">{payment.paymentMethod}</td>
                <td className="px-4 py-4 text-sm">
                  {getStatusButton(payment.status, payment.id)}
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
