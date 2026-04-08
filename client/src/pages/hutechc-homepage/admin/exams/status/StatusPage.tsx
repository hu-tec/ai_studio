/* 원본: hutechc_hompage_real/app/(client-layout)/admin/exams/status/page.tsx */
import { Link } from 'react-router';
import { useState, useEffect } from "react";
import { getDrafts, approveDraft } from '../../../lib/examDraftStore';

const STATUS_BADGE_CLASS: Record<string, string> = {
  출제중: "bg-yellow-100 text-yellow-800 border-yellow-200",
  출제완료: "bg-blue-100 text-blue-800 border-blue-200",
  최종승인: "bg-green-100 text-green-800 border-green-200",
};

export default function StatusPage() {
  const [version, setVersion] = useState(0);
  const drafts = getDrafts();

  useEffect(() => {
    // 인메모리 mock이므로 별도 초기화는 없음. 나중에 스토어 구조 변경 시 여기서 처리.
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">출제 현황</h1>
          <p className="mt-1 text-sm text-gray-500">
            관리자에서 출제하기로 생성된 시험 출제본의 진행 상태를 확인하고, 출제 완료된 시험을 최종 승인할 수 있습니다.
          </p>
        </div>
        <Link to="/hutechc-homepage/admin/exams"
          className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          시험 관리로 돌아가기
        </Link>
      </header>

      {drafts.length === 0 ? (
        <section className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-200 rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-2">아직 생성된 출제본이 없습니다.</p>
          <p className="text-sm text-gray-400 mb-4">시험 관리에서 &quot;출제하기&quot; 버튼을 눌러 새로운 출제본을 생성하세요.</p>
          <Link to="/hutechc-homepage/admin/exams"
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
          >
            시험 관리 바로가기
          </Link>
        </section>
      ) : (
        <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">출제본 목록</h2>
            <span className="text-sm text-gray-500">총 {drafts.length}건</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">시험명</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">유형</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">카테고리</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">문항 수</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">시험 시간</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">출제자</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">상태</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {drafts.map((draft) => {
                  const statusClass = STATUS_BADGE_CLASS[draft.status] ??
                    "bg-gray-100 text-gray-700 border-gray-200";
                  const categoryLabel = [
                    draft.mainCategory,
                    draft.middleCategory,
                    draft.subCategory,
                  ]
                    .filter(Boolean)
                    .join(" / ");

                  return (
                    <tr key={draft.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium text-gray-900">{draft.title}</div>
                        <div className="text-xs text-gray-400">ID: {draft.id}</div>
                      </td>
                      <td className="px-4 py-3 align-top text-gray-700">{draft.type}</td>
                      <td className="px-4 py-3 align-top text-gray-700">{categoryLabel}</td>
                      <td className="px-4 py-3 align-top text-center text-gray-700">{draft.questionCount}문항</td>
                      <td className="px-4 py-3 align-top text-center text-gray-700">{draft.durationMinutes}분</td>
                      <td className="px-4 py-3 align-top text-gray-700">
                        {draft.assignedTranslatorId ?? "-"}
                      </td>
                      <td className="px-4 py-3 align-top text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass}`}
                        >
                          {draft.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-center">
                        {draft.status === "출제완료" ? (
                          <button
                            className="px-3 py-1.5 text-xs rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
                            onClick={() => approveDraft(draft.id)}
                          >
                            최종 승인하기
                          </button>
                        ) : draft.status === "최종승인" ? (
                          <span className="text-xs text-gray-400">승인 완료</span>
                        ) : (
                          <span className="text-xs text-gray-400">출제 진행 중</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
