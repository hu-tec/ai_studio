/* 원본: hutechc_hompage_real/app/mypage/exam/author/requests/page.tsx */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { getDrafts, updateDraft } from '../../../../lib/examDraftStore';

export default function RequestsPage() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<'author' | 'grading'>('author');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const drafts = useMemo(() => getDrafts(), [version]);
  const requested = drafts.filter((d) => d.status === '출제자전달완료');

  const selected =
    drafts.find((d) => d.id === selectedExamId) ?? requested[0] ?? drafts[0] ?? null;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">요청온 시험 출제 · 채점</h1>
          <p className="mt-1 text-sm text-gray-600">
            관리자에게서 출제 요청이 온 시험을 왼쪽에서 선택하고, 오른쪽 패널에서 출제 설정과 채점 방식을 미리 설계합니다.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-[minmax(260px,320px),minmax(0,1fr)] gap-6 items-start">
        {/* 좌측: 요청 온 시험 리스트 (사이드바 역할) */}
        <aside className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 text-sm">
          <h2 className="text-xs font-semibold text-gray-500 mb-1">요청 온 시험</h2>
          {requested.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50">
              아직 출제 요청이 온 시험이 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {requested.map((exam) => (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => setSelectedExamId(exam.id)}
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

          <div className="pt-4 border-t border-gray-100 space-y-3 text-xs">
            <p className="font-semibold text-gray-700 mb-1">보기 전환</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('author')}
                className={`px-2 py-1.5 rounded-md border text-xs font-semibold ${
                  activeTab === 'author'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                출제 설정
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('grading')}
                className={`px-2 py-1.5 rounded-md border text-xs font-semibold ${
                  activeTab === 'grading'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                채점 · 평가 설정
              </button>
            </div>

            {/* 선택한 시험 실제 출제 시작 버튼 */}
            <button
              type="button"
              className="w-full mt-2 px-3 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!selected}
              onClick={() => {
                if (!selected) return;
                // 상태를 출제중으로 변경하고 출제중인 시험 페이지로 이동
                updateDraft(selected.id, { status: '출제중' });
                setVersion((v) => v + 1);
                navigate(`/hutechc-homepage/mypage/exam/author/in-progress?examId=${selected.id}`);
              }}
            >
              선택한 시험 출제하기
            </button>
          </div>
        </aside>

        {/* 우측: 출제/채점 상세 설정 페이지 */}
        <section className="space-y-4">
          {activeTab === 'author' ? (
            <div className="space-y-4">
              {/* 출제 페이지 (관리자 출제 시스템 스펙 반영) */}
              <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 text-xs">
                <header className="flex items-center justify-between mb-1">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">출제 설정</h2>
                    <p className="mt-1 text-[11px] text-gray-500">
                      관리자 화면에서 정의한 출제 시스템(공통 영역, 번역시험, 프롬프트 시험, 윤리 시험)을 기준으로 이 시험의 문항 구조를 설계합니다.
                    </p>
                  </div>
                </header>

                {selected ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-[11px] text-gray-500">시험명</label>
                        <div className="text-sm font-semibold text-gray-900">{selected.title}</div>
                      </div>
                      <div>
                        <label className="block mb-1 text-[11px] text-gray-500">유형 / 카테고리</label>
                        <div className="text-xs text-gray-700 flex flex-wrap gap-1">
                          <span>{selected.type}</span>
                          <span>· {selected.mainCategory}</span>
                          {selected.middleCategory && <span>· {selected.middleCategory}</span>}
                          {selected.subCategory && <span>· {selected.subCategory}</span>}
                        </div>
                      </div>
                    </div>

                    {/* 공통 영역 / 번역 / 프롬프트 / 윤리 섹션 요약 */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-md p-3">
                        <h3 className="text-xs font-semibold text-gray-900 mb-2">공통 영역</h3>
                        <ul className="text-[11px] text-gray-600 list-disc list-inside space-y-1">
                          <li>객관식 50문제 중 20개 랜덤 출제</li>
                          <li>레벨 상·중·하 혼합, 단답형 포함</li>
                          <li>평가: 단어수, 검색 허용 횟수</li>
                        </ul>
                      </div>
                      <div className="border border-gray-200 rounded-md p-3">
                        <h3 className="text-xs font-semibold text-gray-900 mb-2">번역 / 프롬프트 / 윤리 시험</h3>
                        <ul className="text-[11px] text-gray-600 list-disc list-inside space-y-1">
                          <li>번역 시험: 주관식 5개 중 학생 공용 2개 분야 2개 선택</li>
                          <li>프롬프트 시험: 주관식 5개 중 공용 2개 선택, 단계 평가</li>
                          <li>윤리 시험: 객관식 20문제, 전체 문자수 및 파일 종류 기준 평가</li>
                        </ul>
                      </div>
                    </div>

                    {/* 상/중/하 비율은 관리자 출제 설정(/admin/exams)에서 설정하되, 여기서는 요약만 표시 */}
                    <div className="rounded-md bg-indigo-50 border border-indigo-100 p-3 text-[11px] text-indigo-900">
                      상·중·하 난이도 비율과 문제 유형별 난이도 비율은 관리자 출제 설정 화면(/admin/exams)에서 정의된 내용을 그대로 사용합니다.
                      <br />
                      이 페이지에서는 출제자는 문제 내용만 작성하고, 난이도 배분은 시스템 규칙에 따라 자동으로 적용됩니다.
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                    왼쪽에서 시험을 선택하면 출제 설정 요약이 표시됩니다.
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 채점 페이지 (채점 시스템 스펙 반영) */}
              <section className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 text-xs">
                <header className="flex items-center justify-between mb-1">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">채점 · 평가 설정</h2>
                    <p className="mt-1 text-[11px] text-gray-500">
                      관리자 채점 시스템 스펙(객관식 통합 1차 AI 자동채점, 휴먼 평가 1·2차)을 기준으로 이 시험의 채점 방식을 확인합니다.
                    </p>
                  </div>
                </header>

                <div className="grid md:grid-cols-4 gap-3">
                  <div>
                    <label className="block mb-1 text-[11px] text-gray-500">채점 방식</label>
                    <div className="text-xs text-gray-800">객관식 통합 1차 합격/불합격 결정 후 일부 휴먼평가</div>
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px] text-gray-500">채점 방식 세부</label>
                    <div className="text-xs text-gray-800">자동 채점 + AI 자동채점 + 휴먼 채점</div>
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px] text-gray-500">점수 배점</label>
                    <div className="text-xs text-gray-800">자동채점 80점 + 휴먼채점 20점</div>
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px] text-gray-500">자동 채점 문항 유형</label>
                    <div className="text-xs text-gray-800">객관식 (4지선다, 단답형, OX)</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div className="border border-gray-200 rounded-md p-3 space-y-2">
                    <h3 className="text-xs font-semibold text-gray-900">휴먼 평가 1차</h3>
                    <p className="text-[11px] text-gray-600">60~70점대 대상, AI 자동채점 결과를 바탕으로 주관식 일부를 재평가합니다.</p>
                    <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-1">
                      <li>AI 자동채점 점수 + 휴먼 채점 점수 합산</li>
                      <li>주관식 유의어 / 표현에 대한 기본평가 포함</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 rounded-md p-3 space-y-2">
                    <h3 className="text-xs font-semibold text-gray-900">휴먼 평가 2차</h3>
                    <p className="text-[11px] text-gray-600">50~80점대만 대상, 완전 휴먼 채점으로 재확인합니다.</p>
                    <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-1">
                      <li>문장 의미 / 맥락 / 윤리 기준까지 종합 평가</li>
                      <li>필요 시 재채점 의뢰 및 이의 제기 프로세스 연동</li>
                    </ul>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-3 mt-3">
                  <div>
                    <label className="block mb-1 text-[11px] text-gray-500">응시생 수 / 접수생 수</label>
                    <div className="text-[11px] text-gray-400">(관리자 통계 화면과 연동 예정)</div>
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px] text-gray-500">합격생수 / 불합격생수</label>
                    <div className="text-[11px] text-gray-400">합격점수 70점 이상 기준</div>
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px] text-gray-500">결과 확인 인증</label>
                    <div className="text-[11px] text-gray-400">수험자 마이페이지에서 결과 확인 및 재채점 의뢰</div>
                  </div>
                  <div>
                    <label className="block mb-1 text-[11px] text-gray-500">비고</label>
                    <div className="text-[11px] text-gray-400">향후 세부 점수표 / 리포트 템플릿 추가 예정</div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
