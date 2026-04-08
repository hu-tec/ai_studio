/* 원본: hutechc_hompage_real/app/mypage/exam/author/completed/page.tsx */
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { getDrafts } from '../../../../lib/examDraftStore';

const today = new Date();

function isPast(dateStr?: string) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d.getTime() < today.getTime();
}

export default function CompletedPage() {
  const [version] = useState(0);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [gradingStatus, setGradingStatus] = useState<
    Record<string, 'none' | 'grading' | 'draft' | 'submitted'>
  >({});
  const [view, setView] = useState<'completed' | 'grading' | 'graded'>('completed');

  // URL 쿼리 (?view=grading|graded)를 통해 초기 뷰 설정
  const searchParams = useSearchParams();

  useEffect(() => {
    const v = searchParams.get('view');
    if (v === 'grading') setView('grading');
    else if (v === 'graded') setView('graded');
    else setView('completed');
  }, [searchParams]);

  const drafts = useMemo(() => getDrafts(), [version]);
  const completed = drafts.filter((d) => d.status === '출제완료' || d.status === '최종승인');

  const filtered = completed.filter((exam) => {
    const status = gradingStatus[exam.id] ?? 'none';
    if (view === 'completed') return status === 'none';
    if (view === 'grading') return status === 'grading' || status === 'draft';
    return status === 'submitted';
  });

  const selected =
    (filtered.find((d) => d.id === selectedExamId) ?? filtered[0]) ?? null;

  const canGrade = (examId?: string) => {
    if (!examId) return false;
    // TODO: 실제 시험일 기준으로 변경
    return isPast('2025-01-15');
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">완료된 시험</h1>
          <p className="mt-1 text-sm text-gray-600">
            출제를 완료한 시험을 기준으로, 채점 전 · 채점중 · 채점완료 상태를 나눠서 관리합니다.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-[minmax(260px,320px),minmax(0,1fr)] gap-6 items-start">
        {/* 좌측: 완료된/채점중/채점완료 시험 리스트 */}
        <aside className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500">시험 목록</h2>
          </div>

          {filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50">
              {view === 'completed'
                ? '아직 채점을 시작하지 않은 완료된 시험이 없습니다.'
                : view === 'grading'
                ? '현재 채점중인 시험이 없습니다.'
                : '채점을 완료한 시험이 없습니다.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((exam) => {
                const status = gradingStatus[exam.id] ?? 'none';
                const gradeReady = canGrade(exam.id);

                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => setSelectedExamId(exam.id)}
                    className={`w-full text-left px-3 py-2 rounded-md border text-xs ${
                      selected?.id === exam.id
                        ? 'border-purple-500 bg-purple-50 text-purple-800'
                        : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold truncate">{exam.title}</div>
                      {status === 'submitted' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 text-[11px]">
                          채점완료
                        </span>
                      )}
                      {status === 'grading' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px]">
                          채점중
                        </span>
                      )}
                      {status === 'draft' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 text-[11px]">
                          임시저장
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-500 flex flex-wrap gap-1">
                      <span>{exam.type}</span>
                      <span>· {exam.mainCategory}</span>
                      {exam.middleCategory && <span>· {exam.middleCategory}</span>}
                      {exam.subCategory && <span>· {exam.subCategory}</span>}
                      <span>· {exam.questionCount}문항</span>
                      <span>· {exam.durationMinutes}분</span>
                    </div>
                    <div className="mt-1 text-[11px] text-gray-400">
                      {gradeReady ? '채점 가능' : '시험일 이전 · 채점 대기'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* 우측: 시험/채점 상세 페이지 */}
        <section className="space-y-4">
          {!selected ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-xs text-gray-500">
              왼쪽에서 시험을 선택하면 시험 현황 요약과 응시자 리스트가 표시됩니다.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5 text-xs">
              {/* 상단: 시험 현황 요약 */}
              <header className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">시험 현황 요약</h2>
                    <p className="mt-1 text-[11px] text-gray-500">
                      시험 기본 정보와 합격점수, 배점 구조를 확인한 뒤 필요 시 채점을 시작할 수 있습니다.
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-gray-500">
                    <div>시험 ID: {selected.id}</div>
                    <div>문항 수 {selected.questionCount}문항 · {selected.durationMinutes}분</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-3 mt-2">
                  <div className="border border-gray-200 rounded-md p-3">
                    <div className="text-[11px] text-gray-500 mb-1">합격점수</div>
                    <div className="text-sm font-semibold text-gray-900">70점 이상</div>
                    <p className="mt-1 text-[11px] text-gray-500">급수별 70점 이상을 합격 기준으로 사용합니다.</p>
                  </div>
                  <div className="border border-gray-200 rounded-md p-3">
                    <div className="text-[11px] text-gray-500 mb-1">점수 배점</div>
                    <div className="text-sm font-semibold text-gray-900">자동 80점 · 휴먼 20점</div>
                    <p className="mt-1 text-[11px] text-gray-500">객관식 1차 자동채점 후 일부 응시자는 휴먼 평가로 보정합니다.</p>
                  </div>
                  <div className="border border-gray-200 rounded-md p-3">
                    <div className="text-[11px] text-gray-500 mb-1">휴먼 평가 1차</div>
                    <div className="text-sm font-semibold text-gray-900">60~70점대 대상</div>
                    <p className="mt-1 text-[11px] text-gray-500">AI 자동채점 결과를 바탕으로 주관식 일부를 재평가합니다.</p>
                  </div>
                  <div className="border border-gray-200 rounded-md p-3">
                    <div className="text-[11px] text-gray-500 mb-1">휴먼 평가 2차</div>
                    <div className="text-sm font-semibold text-gray-900">50~80점대 일부</div>
                    <p className="mt-1 text-[11px] text-gray-500">필요 시 완전 휴먼 채점으로 재확인합니다.</p>
                  </div>
                </div>
              </header>

              {/* 하단: 응시자 리스트 (mock) */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-900">응시자 리스트</h3>
                  <span className="text-[11px] text-gray-500">(mock 데이터) 실제 응시 기록 연동 예정</span>
                </div>

                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">응시자</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-500">자동채점</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-500">휴먼 1차</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-500">휴먼 2차</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-500">최종 점수</th>
                        <th className="px-3 py-2 text-center font-medium text-gray-500">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {['홍길동', '김번역', '이프롬프트'].map((name, idx) => (
                        <tr key={name} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-900">{name}</td>
                          <td className="px-3 py-2 text-center text-gray-700">{60 + idx * 5}점</td>
                          <td className="px-3 py-2 text-center text-gray-700">{idx === 0 ? '보정 +3점' : '-'}</td>
                          <td className="px-3 py-2 text-center text-gray-700">{idx === 2 ? '재채점 -2점' : '-'}</td>
                          <td className="px-3 py-2 text-center font-semibold text-gray-900">{70 + idx * 2}점</td>
                          <td className="px-3 py-2 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-[11px]">
                              합격
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 하단: 버튼 영역 */}
              <footer className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                <span className="text-[11px] text-gray-500">채점 내용은 현재 (mock) 상태로만 관리되며, 실제 점수 저장 로직은 이후 서버와 연동됩니다.</span>
                <div className="space-x-2">
                  {(() => {
                    const status = gradingStatus[selected.id] ?? 'none';

                    if (status === 'none') {
                      return (
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-700"
                          onClick={() => {
                            setGradingStatus((prev) => ({ ...prev, [selected.id]: 'grading' }));
                            setView('grading');
                            // 채점 전용 화면을 새 창으로 열기 (사이드바/헤더 없는 전체화면)
                            window.open(
                              `/grading/${selected.id}`,
                              '_blank',
                              'width=1920,height=1080,resizable=yes,scrollbars=yes'
                            );
                          }}
                        >
                          채점하기
                        </button>
                      );
                    }

                    if (status === 'grading' || status === 'draft') {
                      return (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 whitespace-nowrap"
                            onClick={() => {
                              setGradingStatus((prev) => ({ ...prev, [selected.id]: 'draft' }));
                              alert('채점 내용이 임시 저장되었습니다. (mock)');
                            }}
                          >
                            임시 저장
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 whitespace-nowrap"
                            onClick={() => {
                              // 채점 전용 화면을 새 창으로 열기 (사이드바/헤더 없는 전체화면)
                              window.open(
                                `/grading/${selected.id}`,
                                '_blank',
                                'width=1920,height=1080,resizable=yes,scrollbars=yes'
                              );
                            }}
                          >
                            채점화면가기
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-700 whitespace-nowrap"
                            onClick={() => {
                              setGradingStatus((prev) => ({ ...prev, [selected.id]: 'submitted' }));
                              setView('graded');
                              alert('채점이 완료 처리되었습니다. (mock)');
                            }}
                          >
                            채점 완료하기
                          </button>
                        </div>
                      );
                    }

                    return (
                      <span className="text-[11px] text-green-600 font-semibold">
                        이 시험은 채점이 완료되었습니다.
                      </span>
                    );
                  })()}
                </div>
              </footer>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
