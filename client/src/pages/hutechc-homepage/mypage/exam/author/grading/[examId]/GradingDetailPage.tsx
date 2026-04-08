/* 원본: hutechc_hompage_real/app/mypage/exam/author/grading/[examId]/page.tsx */
import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getDrafts } from '../../../../../lib/examDraftStore';

interface GradingQuestion {
  id: number;
  title: string;
  stem: string;
}

const MOCK_CANDIDATES = ['홍길동', '김번역', '이프롬프트'];

export default function GradingDetailPage() {
  const params = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const examId = params.examId;

  const drafts = useMemo(() => getDrafts(), []);
  const exam = drafts.find((d) => d.id === examId);

  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);

  const questions: GradingQuestion[] = useMemo(() => {
    const count = exam?.questionCount ?? 3;
    return Array.from({ length: count }).map((_, idx) => ({
      id: idx + 1,
      title: `문제 ${idx + 1}`,
      stem: `문제 ${idx + 1}의 지문/설명을 여기에 작성합니다. (mock)`,
    }));
  }, [exam?.questionCount]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [graderNotes, setGraderNotes] = useState<Record<string, string>>({});

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-sm text-gray-600">
        해당 시험 정보를 찾을 수 없습니다.
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentCandidate = MOCK_CANDIDATES[currentCandidateIndex];
  const key = `${currentCandidate}-${currentQuestion.id}`;
  const note = graderNotes[key] ?? '';

  return (
    <div className="flex h-screen bg-gray-50 text-sm w-full">
      {/* 좌측: 응시자 리스트 + 문제 목록 */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 space-y-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-100"
          >
            ← 완료된 시험으로 돌아가기
          </button>
          <div>
            <div className="text-[11px] text-gray-500 mb-1">채점 중인 시험</div>
            <div className="text-sm font-semibold text-gray-900">{exam.title}</div>
            <div className="text-[11px] text-gray-500 mt-1 flex flex-wrap gap-1">
              <span>{exam.type}</span>
              <span>· {exam.mainCategory}</span>
              {exam.middleCategory && <span>· {exam.middleCategory}</span>}
              {exam.subCategory && <span>· {exam.subCategory}</span>}
              <span>· {exam.questionCount}문항</span>
              <span>· {exam.durationMinutes}분</span>
            </div>
          </div>
        </div>

        {/* 응시자 리스트 */}
        <div className="border-b border-gray-200 p-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">응시자</h3>
          <div className="space-y-1">
            {MOCK_CANDIDATES.map((name, idx) => (
              <button
                key={name}
                type="button"
                onClick={() => setCurrentCandidateIndex(idx)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-xs border ${
                  idx === currentCandidateIndex
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-800'
                    : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* 문제 목록 */}
        <div className="flex-1 overflow-auto p-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">문제 목록</h3>
          <div className="space-y-1">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-xs border ${
                  idx === currentQuestionIndex
                    ? 'bg-purple-50 border-purple-400 text-purple-800'
                    : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                }`}
              >
                {q.title}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 우측: 채점 패널 */}
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-6 space-y-5">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 mb-1">
                {currentQuestion.title} · {currentCandidate} 채점
              </h1>
              <p className="text-[11px] text-gray-500">
                왼쪽에는 응시자가 작성한 답안을, 오른쪽에는 출제자가 작성하는 채점 기준/피드백을 입력합니다.
              </p>
            </div>
            <div className="text-right text-[11px] text-gray-500">
              <div>시험 ID: {exam.id}</div>
              <div>
                문항 {currentQuestionIndex + 1} / {questions.length}
              </div>
            </div>
          </header>

          {/* 문제 지문 */}
          <section className="space-y-2 text-xs">
            <h2 className="font-semibold text-gray-800">문제 지문</h2>
            <div className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-800">
              {currentQuestion.stem}
            </div>
          </section>

          {/* 응시자 답안 vs 출제자 채점 입력 */}
          <section className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">응시자 답안 (mock)</h3>
              <div className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50 h-48 overflow-auto text-gray-800">
                {currentCandidate} 님이 작성한 답안 예시입니다. 실제 서비스에서는 이 영역에 응시자가 제출한 번역문/프롬프트/에세이 내용이 표시됩니다.
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">출제자 채점 메모</h3>
              <textarea
                className="w-full h-48 border border-gray-300 rounded-md px-3 py-2 text-xs resize-none"
                placeholder="모범답안과 비교하여 평가 의견, 감점/가점 사유 등을 작성하세요."
                value={note}
                onChange={(e) =>
                  setGraderNotes((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
              />
            </div>
          </section>

          {/* 하단 네비게이션 */}
          <footer className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() =>
                  setCurrentQuestionIndex((idx) => Math.max(0, idx - 1))
                }
                className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← 이전 문제
              </button>
              <button
                type="button"
                disabled={currentQuestionIndex === questions.length - 1}
                onClick={() =>
                  setCurrentQuestionIndex((idx) =>
                    Math.min(questions.length - 1, idx + 1),
                  )
                }
                className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                다음 문제 →
              </button>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  alert('채점 내용이 (mock) 기준으로 임시 저장되었습니다.');
                  navigate('/hutechc-homepage/mypage/exam/author/completed?view=grading');
                }}
              >
                임시 저장 후 나가기
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-700"
                onClick={() => {
                  alert('이 시험의 채점을 (mock) 기준으로 완료 처리했습니다.');
                  navigate('/hutechc-homepage/mypage/exam/author/completed?view=graded');
                }}
              >
                채점 완료하기
              </button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
