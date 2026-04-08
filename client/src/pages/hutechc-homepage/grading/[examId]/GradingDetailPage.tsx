/* 원본: hutechc_hompage_real/app/grading/[examId]/page.tsx */
import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { getDrafts } from '../../lib/examDraftStore';

interface GradingQuestion {
  id: number;
  title: string;
  stem: string;
  isAutoGraded: boolean; // 자동채점 여부
  points: number; // 문제당 배점
  isGraded?: boolean; // 채점 완료 여부
  score?: number; // 채점 점수
}

interface EvaluationCriteria {
  id: string;
  name: string; // 대 평가 기준 이름
  ratio: number; // 비율 (%)
  subCriteria: Array<{
    id: string;
    definition: string; // 정의
    factor: string; // 요인
    ratio: number; // 소 평가 기준 비율 (%)
  }>;
}

interface CandidateInfo {
  name: string;
  autoScore: number; // 자동채점 점수
  status: '불합격' | '채점필요' | '합격'; // 자동채점 결과 상태
  reviewRequested: boolean; // 검수 요청 여부
}

const MOCK_CANDIDATES: CandidateInfo[] = [
  { name: '홍길동', autoScore: 60, status: '채점필요', reviewRequested: true },
  { name: '김번역', autoScore: 55, status: '불합격', reviewRequested: true },
  { name: '이프롬프트', autoScore: 75, status: '합격', reviewRequested: false },
];

export default function GradingDetailPage() {
  const params = useParams<{ examId: string }>();
  const examId = params.examId;

  const drafts = useMemo(() => getDrafts(), []);
  const exam = drafts.find((d) => d.id === examId);

  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [graderNotes, setGraderNotes] = useState<Record<string, string>>({});
  const [questionScores, setQuestionScores] = useState<Record<string, { isGraded: boolean; score: number }>>({});
  const [evaluationScores, setEvaluationScores] = useState<Record<string, Record<string, number>>>({});
  const [showCandidateListModal, setShowCandidateListModal] = useState(false);
  const [showDetailedGrading, setShowDetailedGrading] = useState<Record<string, boolean>>({});

  const questions: GradingQuestion[] = useMemo(() => {
    const count = exam?.questionCount ?? 3;
    return Array.from({ length: count }).map((_, idx) => ({
      id: idx + 1,
      title: `문제 ${idx + 1}`,
      stem: `문제 ${idx + 1}의 지문/설명을 여기에 작성합니다. (mock)`,
      isAutoGraded: idx < 2, // 처음 2개 문제는 자동채점, 나머지는 수동채점 (예시)
      points: idx === 0 ? 20 : idx === 1 ? 15 : 10, // 문제별 배점 예시
    }));
  }, [exam?.questionCount]);

  // Mock 평가 기준 데이터 (실제로는 exam.evaluationCriteria에서 가져와야 함)
  const evaluationCriteria: EvaluationCriteria[] = useMemo(() => {
    // TODO: ExamDraft에 evaluationCriteria 속성 추가 후 exam.evaluationCriteria 사용
    return [
      {
        id: 'ec-1',
        name: '정확성',
        ratio: 25,
        subCriteria: [
          { id: 'sc-1-1', definition: '의미 전달의 정확성', factor: '의미 일치도', ratio: 10 },
          { id: 'sc-1-2', definition: '문법적 정확성', factor: '문법 오류', ratio: 10 },
          { id: 'sc-1-3', definition: '용어 사용의 정확성', factor: '전문 용어', ratio: 5 },
        ],
      },
      {
        id: 'ec-2',
        name: '적절성',
        ratio: 25,
        subCriteria: [
          { id: 'sc-2-1', definition: '문맥 적합성', factor: '상황 적합', ratio: 15 },
          { id: 'sc-2-2', definition: '어조의 적절성', factor: '어조 일치', ratio: 10 },
        ],
      },
      {
        id: 'ec-3',
        name: '효율성',
        ratio: 25,
        subCriteria: [
          { id: 'sc-3-1', definition: '표현의 간결성', factor: '불필요한 표현', ratio: 15 },
          { id: 'sc-3-2', definition: '가독성', factor: '문장 구조', ratio: 10 },
        ],
      },
      {
        id: 'ec-4',
        name: '윤리',
        ratio: 25,
        subCriteria: [
          { id: 'sc-4-1', definition: '저작권 준수', factor: '출처 표기', ratio: 15 },
          { id: 'sc-4-2', definition: '편향성 없음', factor: '객관성', ratio: 10 },
        ],
      },
    ];
  }, []);

  // 자동채점 결과 통계 계산
  const autoGradingStats = useMemo(() => {
    const failed = MOCK_CANDIDATES.filter((c) => c.status === '불합격').length;
    const needsGrading = MOCK_CANDIDATES.filter((c) => c.status === '채점필요').length;
    const passed = MOCK_CANDIDATES.filter((c) => c.status === '합격').length;
    const reviewRequested = MOCK_CANDIDATES.filter((c) => c.reviewRequested).length;
    return { failed, needsGrading, passed, reviewRequested };
  }, []);

  // 채점 필요 인원과 완료된 채점 인원 계산
  const gradingStats = useMemo(() => {
    const needsGrading = MOCK_CANDIDATES.filter((c) => c.status === '채점필요').length;
    const completedGrading = MOCK_CANDIDATES.filter((c) => {
      // 모든 문제가 채점 완료된 응시자 수 계산
      const allQuestionsGraded = questions.every((q) => {
        const qKey = `${c.name}-${q.id}`;
        return questionScores[qKey]?.isGraded ?? false;
      });
      return allQuestionsGraded;
    }).length;
    return { needsGrading, completedGrading };
  }, [questionScores, questions]);

  // 현재 응시자의 최종 점수 계산 (early return 전에 호출)
  const currentCandidate = MOCK_CANDIDATES[currentCandidateIndex];
  const finalScore = useMemo(() => {
    let totalScore = 0;
    let totalPoints = 0;
    questions.forEach((q) => {
      const qKey = `${currentCandidate.name}-${q.id}`;
      const qScore = questionScores[qKey];
      totalPoints += q.points;
      if (qScore?.isGraded) {
        totalScore += qScore.score;
      }
    });
    return { score: totalScore, total: totalPoints };
  }, [questionScores, currentCandidate.name, questions]);

  // 다음 채점 필요 응시자로 이동
  const handleNextNeedsGrading = () => {
    const needsGradingCandidates = MOCK_CANDIDATES
      .map((c, idx) => ({ candidate: c, idx }))
      .filter(({ candidate }) => candidate.status === '채점필요');
    
    if (needsGradingCandidates.length === 0) {
      alert('채점이 필요한 응시자가 없습니다.');
      return;
    }

    const currentIdx = needsGradingCandidates.findIndex(({ idx }) => idx === currentCandidateIndex);
    const nextIdx = currentIdx === -1 || currentIdx === needsGradingCandidates.length - 1
      ? 0
      : currentIdx + 1;
    
    setCurrentCandidateIndex(needsGradingCandidates[nextIdx].idx);
    setCurrentQuestionIndex(0); // 첫 번째 문제로 이동
  };

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-sm text-gray-600">
        해당 시험 정보를 찾을 수 없습니다.
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const key = `${currentCandidate.name}-${currentQuestion.id}`;
  const note = graderNotes[key] ?? '';
  const questionScore = questionScores[key] ?? { isGraded: false, score: 0 };
  const currentEvaluationScores = evaluationScores[key] ?? {};

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-sm w-full">
      {/* 상단 헤더바 */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => window.close()}
            className="px-3 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-100"
          >
            ← 완료된 시험으로 돌아가기
          </button>
          <div className="text-sm font-semibold text-gray-900">{exam.title}</div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
            onClick={() => {
              alert('채점 내용이 (mock) 기준으로 임시 저장되었습니다.');
              window.close();
            }}
          >
            임시 저장 후 나가기
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded-md bg-purple-600 text-white font-semibold hover:bg-purple-700 text-xs"
            onClick={() => {
              alert('이 시험의 채점을 (mock) 기준으로 완료 처리했습니다.');
              window.close();
            }}
          >
            채점 완료하기
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 좌측: 응시자 리스트 + 문제 목록 */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 space-y-2">
          <div>
            <div className="text-[11px] text-gray-500 mb-1">채점 중인 시험</div>
            <div className="text-[11px] text-gray-500 mt-1 flex flex-wrap gap-1">
              <span>{exam.type}</span>
              <span>· {exam.mainCategory}</span>
              {exam.middleCategory && <span>· {exam.middleCategory}</span>}
              {exam.subCategory && <span>· {exam.subCategory}</span>}
              <span>· {exam.questionCount}문항</span>
              <span>· {exam.durationMinutes}분</span>
              <span>· 합격 점수: <span className="font-semibold">70점</span></span>
              <span>· 자동채점 최대 점수: <span className="font-semibold">80점</span></span>
              <span>· 총 응시자: <span className="font-semibold text-gray-900">{MOCK_CANDIDATES.length}명</span></span>
            </div>
            
            {/* 자동채점 결과 */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-[11px] font-semibold text-gray-700 mb-2">자동채점 결과:</div>
              <div className="space-y-1 text-[11px] text-gray-600">
                <div className="flex items-center justify-between">
                  <span>불합격:</span>
                  <span className="font-semibold text-red-600">{autoGradingStats.failed}명</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>채점으로 합격 확인필요:</span>
                  <span className="font-semibold text-yellow-600">{autoGradingStats.needsGrading}명</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>합격:</span>
                  <span className="font-semibold text-green-600">{autoGradingStats.passed}명</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-[11px] text-gray-600">
                  <span>검수 요청인원:</span>
                  <span className="font-semibold text-blue-600">{autoGradingStats.reviewRequested}명</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 응시자 리스트 */}
        <div className="border-b border-gray-200 p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-700">응시자</h3>
            <button
              type="button"
              onClick={() => setShowCandidateListModal(true)}
              className="px-2 py-1 text-[10px] rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              전체 리스트 보기
            </button>
          </div>
          
          {/* 채점 통계 및 빠른 네비게이션 */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-600">채점 필요 인원:</span>
              <span className="font-semibold text-yellow-600">{gradingStats.needsGrading}명</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-600">완료된 채점 인원:</span>
              <span className="font-semibold text-green-600">{gradingStats.completedGrading}명</span>
            </div>
          </div>

          {/* 현재 응시자 정보 */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-md p-2 mb-2">
            <div className="text-xs font-semibold text-gray-900 mb-1">
              {MOCK_CANDIDATES[currentCandidateIndex]?.name}
            </div>
            <div className="text-[10px] text-gray-600">
              자동채점 결과: <span className="font-semibold">{MOCK_CANDIDATES[currentCandidateIndex]?.autoScore}점</span>
            </div>
          </div>

          {/* 다음 채점 필요 응시자로 이동 버튼 */}
          <button
            type="button"
            onClick={handleNextNeedsGrading}
            className="w-full px-3 py-2 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
          >
            다음 채점 필요 응시자 →
          </button>
        </div>

        {/* 문제 목록 */}
        <div className="flex-1 overflow-auto p-3 flex flex-col">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">문제 목록</h3>
          <div className="space-y-1 flex-1">
            {questions.map((q, idx) => {
              const qKey = `${currentCandidate.name}-${q.id}`;
              const qScore = questionScores[qKey];
              const isGraded = qScore?.isGraded ?? false;
              const score = qScore?.score ?? 0;
              return (
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
                  <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span>{q.title}</span>
                      {q.isAutoGraded && (
                        <span className="text-[10px] text-blue-600 font-medium">
                          자동채점처리
                        </span>
                      )}
                      {isGraded && (
                        <span className="text-[10px] text-green-600 font-medium">
                          채점완료
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="text-[10px] text-gray-600 whitespace-nowrap">
                        {q.points}점
                      </span>
                      {isGraded && (
                        <span className="text-[10px] text-green-600 font-semibold whitespace-nowrap">
                          {score}점
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {/* 최종 점수 */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700">최종 점수:</span>
              <span className="font-semibold text-gray-900">
                {finalScore.score}점 / {finalScore.total}점
              </span>
            </div>
          </div>
        </div>
      </aside>

        {/* 우측: 채점 패널 */}
        <main className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-6 space-y-5">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 mb-1">
                {currentQuestion.title} · {currentCandidate.name} 채점
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
          <section className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">응시자 답안 (mock)</h3>
              <div className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50 min-h-[600px] overflow-auto text-gray-800 text-sm">
                {currentCandidate.name} 님이 작성한 답안 예시입니다. 실제 서비스에서는 이 영역에 응시자가 제출한 번역문/프롬프트/에세이 내용이 표시됩니다.
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {showDetailedGrading[key] ? '평가 기준 채점' : '통합점수'}
                </h3>
                {!showDetailedGrading[key] ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailedGrading((prev) => ({
                        ...prev,
                        [key]: true,
                      }));
                    }}
                    className="px-3 py-1.5 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    세부체점하기
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDetailedGrading((prev) => ({
                          ...prev,
                          [key]: false,
                        }));
                      }}
                      className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      통합점수로
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // 평가 기준 채점 점수 합계 계산
                        let totalScore = 0;
                        evaluationCriteria.forEach((criterion) => {
                          criterion.subCriteria.forEach((sub) => {
                            const subKey = `${key}-${criterion.id}-${sub.id}`;
                            const subScore = currentEvaluationScores[subKey] ?? 0;
                            totalScore += subScore;
                          });
                        });
                        
                        // 계산된 점수를 채점 점수 필드에 자동 입력
                        setQuestionScores((prev) => ({
                          ...prev,
                          [key]: {
                            isGraded: totalScore > 0,
                            score: totalScore,
                          },
                        }));
                        
                        alert(`평가 기준 채점 점수가 저장되었습니다. (총 ${totalScore.toFixed(1)}점)`);
                      }}
                      className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                      저장
                    </button>
                  </div>
                )}
              </div>
              {!showDetailedGrading[key] ? (
                <div className="border border-gray-200 rounded-md p-4 min-h-[600px] flex flex-col items-center justify-center space-y-3">
                  <div className="text-center">
                    <label className="block text-sm text-gray-600 mb-2">통합점수 입력</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={currentQuestion.points}
                        step="0.5"
                        value={questionScore.score}
                        onChange={(e) => {
                          const newScore = Math.max(0, Math.min(currentQuestion.points, Number(e.target.value) || 0));
                          setQuestionScores((prev) => ({
                            ...prev,
                            [key]: {
                              isGraded: newScore > 0 || questionScore.isGraded,
                              score: newScore,
                            },
                          }));
                        }}
                        className="w-24 px-4 py-3 text-base border border-gray-300 rounded-md text-center"
                        placeholder="0"
                      />
                      <span className="text-base text-gray-500">/ {currentQuestion.points}점</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-md p-3 min-h-[600px] space-y-4">
                  {evaluationCriteria.map((criterion) => {
                    return (
                      <div key={criterion.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                        <div className="font-semibold text-sm text-gray-800 mb-2">
                          {criterion.name} ({criterion.ratio}%)
                        </div>
                        <div className="space-y-3 pl-2">
                          {criterion.subCriteria.map((sub) => {
                            const subMaxScore = (sub.ratio / 100) * currentQuestion.points;
                            const subKey = `${key}-${criterion.id}-${sub.id}`;
                            const subScore = currentEvaluationScores[subKey] ?? 0;
                            return (
                              <div key={sub.id} className="text-xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-gray-700 font-medium">
                                    {sub.definition} ({sub.ratio}%)
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max={subMaxScore}
                                      step="0.5"
                                      value={subScore}
                                      onChange={(e) => {
                                        const newScore = Math.max(0, Math.min(subMaxScore, Number(e.target.value) || 0));
                                        setEvaluationScores((prev) => ({
                                          ...prev,
                                          [key]: {
                                            ...(prev[key] || {}),
                                            [subKey]: newScore,
                                          },
                                        }));
                                      }}
                                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                                    />
                                    <span className="text-xs text-gray-500">/ {subMaxScore.toFixed(1)}</span>
                                  </div>
                                </div>
                                <div className="text-gray-500 text-xs pl-1">
                                  요인: {sub.factor}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2 flex-nowrap gap-3">
                <h3 className="font-semibold text-gray-800 text-sm whitespace-nowrap">출제자 채점 메모</h3>
                <div className="flex items-center gap-2 flex-nowrap flex-shrink-0">
                  <label className="text-xs text-gray-600 whitespace-nowrap">채점 점수:</label>
                  <input
                    type="number"
                    min="0"
                    max={currentQuestion.points}
                    value={questionScore.score}
                    onChange={(e) => {
                      const newScore = Math.max(0, Math.min(currentQuestion.points, Number(e.target.value) || 0));
                      setQuestionScores((prev) => ({
                        ...prev,
                        [key]: {
                          isGraded: newScore > 0 || questionScore.isGraded,
                          score: newScore,
                        },
                      }));
                    }}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded-md flex-shrink-0"
                    placeholder="0"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">/ {currentQuestion.points}점</span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuestionScores((prev) => ({
                        ...prev,
                        [key]: {
                          isGraded: true,
                          score: questionScore.score || 0,
                        },
                      }));
                      alert('채점이 완료되었습니다.');
                    }}
                    className={`px-3 py-1 text-xs rounded-md whitespace-nowrap flex-shrink-0 ${
                      questionScore.isGraded
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    채점완료
                  </button>
                </div>
              </div>
              <textarea
                className="w-full min-h-[600px] border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
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
          </footer>
        </div>
      </main>
      </div>

      {/* 응시자 전체 리스트 모달 */}
      {showCandidateListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">응시자 전체 리스트</h2>
              <button
                type="button"
                onClick={() => setShowCandidateListModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">이름</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">상태</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">자동채점 결과</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">최종 점수</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">검수 요청</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">채점 완료</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">작업</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {MOCK_CANDIDATES.map((candidate, idx) => {
                      const statusColors = {
                        불합격: 'text-red-600',
                        채점필요: 'text-yellow-600',
                        합격: 'text-green-600',
                      };
                      
                      // 해당 응시자의 최종 점수 계산
                      let candidateFinalScore = 0;
                      let candidateTotalPoints = 0;
                      let allGraded = true;
                      questions.forEach((q) => {
                        const qKey = `${candidate.name}-${q.id}`;
                        const qScore = questionScores[qKey];
                        candidateTotalPoints += q.points;
                        if (qScore?.isGraded) {
                          candidateFinalScore += qScore.score;
                        } else {
                          allGraded = false;
                        }
                      });

                      return (
                        <tr
                          key={candidate.name}
                          className={`hover:bg-gray-50 cursor-pointer ${
                            idx === currentCandidateIndex ? 'bg-indigo-50' : ''
                          }`}
                          onClick={() => {
                            setCurrentCandidateIndex(idx);
                            setShowCandidateListModal(false);
                          }}
                        >
                          <td className="px-4 py-2 text-xs font-medium text-gray-900">{candidate.name}</td>
                          <td className="px-4 py-2">
                            <span className={`text-xs font-medium ${statusColors[candidate.status]}`}>
                              {candidate.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-700">
                            {candidate.autoScore}점
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-700">
                            {candidateFinalScore.toFixed(1)}점 / {candidateTotalPoints}점
                          </td>
                          <td className="px-4 py-2">
                            {candidate.reviewRequested ? (
                              <span className="text-xs text-blue-600 font-medium">요청함</span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {allGraded ? (
                              <span className="text-xs text-green-600 font-medium">완료</span>
                            ) : (
                              <span className="text-xs text-yellow-600 font-medium">진행중</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentCandidateIndex(idx);
                                setShowCandidateListModal(false);
                              }}
                              className="px-2 py-1 text-[10px] rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                              채점하기
                            </button>
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
      )}
    </div>
  );
}

