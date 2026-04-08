/* 원본: hutechc_hompage_real/app/mypage/exam/author/in-progress/page.tsx */
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { getDrafts, updateDraft } from '../../../../lib/examDraftStore';

export default function InProgressPage() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const initialExamId = searchParams?.get('examId') ?? null;

  const [version, setVersion] = useState(0);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(initialExamId);

  const drafts = useMemo(() => getDrafts(), [version]);
  const inProgress = drafts.filter((d) => d.status === '출제중');
  const selected = inProgress.find((d) => d.id === selectedExamId) ?? inProgress[0] ?? null;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">출제중인 시험</h1>
          <p className="mt-1 text-sm text-gray-600">
            관리자에게서 의뢰받아 현재 문제를 작성 중인 시험입니다. 임시 저장 후 나중에 이어서 작성하거나, 최종 출제하기를 통해 출제를 완료할 수 있습니다.
          </p>
        </div>
      </header>

      {/* 출제중 시험 목록만 표시 (실제 출제 화면은 개별 페이지로 이동) */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 text-sm">
        <h2 className="text-xs font-semibold text-gray-500 mb-1">출제중인 시험</h2>
        {inProgress.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            출제중인 시험이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {inProgress.map((exam) => (
              <button
                key={exam.id}
                type="button"
                onClick={() => {
                  setSelectedExamId(exam.id);
                  navigate(`/hutechc-homepage/mypage/exam/author/${exam.id}`);
                }}
                className={`w-full text-left px-3 py-2 rounded-md border text-xs ${
                  selected?.id === exam.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                    : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold truncate">{exam.title}</div>
                <div className="mt-0.5 text-[11px] text-gray-500 flex flex-wrap gap-1">
                  <span>{exam.type}</span>
                  <span>· {exam.mainCategory}</span>
                  {exam.middleCategory && <span>· {exam.middleCategory}</span>}
                  {exam.subCategory && <span>· {exam.subCategory}</span>}
                  <span>· {exam.questionCount}문항</span>
                  <span>· {exam.durationMinutes}분</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
