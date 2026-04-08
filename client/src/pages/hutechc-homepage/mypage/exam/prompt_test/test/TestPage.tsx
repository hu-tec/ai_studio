/* 원본: hutechc_hompage_real/app/mypage/exam/prompt_test/test/page.tsx */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

type PromptTestSettings = {
  topic?: string;
  level?: string;
  wordCount?: string;
  aiUsed?: string;
  promptDetails?: string[];
  problem2Question?: string;
  problem2AiAnswer?: string;
  contentDetail?: string;
};

type PromptTestSubmission = {
  aiUsed: string;
  problem1: {
    prompts: string[];
    promptReasons: string[]; // 문제(프롬프트)별 수정 사유(선택)
  };
  problem2: {
    question: string;
    aiAnswer: string;
    revisedAnswer: string;
    revisedReason?: string; // 선택
  };
  finalSummary: string; // 최종 정리(전체)
  submittedAt: string;
};

const normalizePrompts = (raw?: PromptTestSettings | null): string[] => {
  const fromArray = raw?.promptDetails;
  if (Array.isArray(fromArray) && fromArray.length) {
    return Array.from({ length: 5 }, (_, i) => fromArray[i] ?? '');
  }

  // fallback: try to parse legacy contentDetail format: "프롬프트 1: ..." per line
  const content = raw?.contentDetail ?? '';
  if (content.trim()) {
    const lines = content.split(/\r?\n/).map(l => l.trim());
    const next = Array.from({ length: 5 }, () => '');
    for (const line of lines) {
      const m = line.match(/^프롬프트\s*(\d+)\s*:\s*(.*)$/);
      if (!m) continue;
      const idx = Number(m[1]);
      if (Number.isFinite(idx) && idx >= 1 && idx <= 5) next[idx - 1] = m[2] ?? '';
    }
    return next;
  }

  return ['', '', '', '', ''];
};

export default function TestPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<PromptTestSettings | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<1 | 2>(1);

  // 문제1(프롬프트 1~5 수정)
  const [originalPrompts, setOriginalPrompts] = useState<string[]>(['', '', '', '', '']);
  const [prompts, setPrompts] = useState<string[]>(['', '', '', '', '']);
  const [promptReasons, setPromptReasons] = useState<string[]>(['', '', '', '', '']);

  // 문제2(AI 답변 수정)
  const [revisedAnswer, setRevisedAnswer] = useState('');
  const [revisedReason, setRevisedReason] = useState('');

  // 공통
  const [finalSummary, setFinalSummary] = useState('');

  const aiUsed = settings?.aiUsed ?? '';
  const problem2Question = settings?.problem2Question ?? '';
  const problem2AiAnswer = settings?.problem2AiAnswer ?? '';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = sessionStorage.getItem('promptSettings');
      const parsed = raw ? (JSON.parse(raw) as PromptTestSettings) : null;
      setSettings(parsed);

      const normalized = normalizePrompts(parsed);
      setOriginalPrompts(normalized);
      setPrompts(normalized);
      setPromptReasons(['', '', '', '', '']);

      setRevisedAnswer(parsed?.problem2AiAnswer ?? '');
      setRevisedReason('');

      setFinalSummary('');
    } catch {
      // ignore
    }
  }, []);

  const hasProblem1Changes = useMemo(() => {
    return prompts.some((p, i) => (p ?? '') !== (originalPrompts[i] ?? ''));
  }, [prompts, originalPrompts]);

  const hasProblem2Changes = useMemo(() => {
    return (revisedAnswer ?? '').trim() !== (problem2AiAnswer ?? '').trim();
  }, [revisedAnswer, problem2AiAnswer]);

  const handlePromptChange = (index: number, value: string) => {
    setPrompts(prev => {
      const next = prev.slice();
      next[index] = value;
      return next;
    });
  };

  const handleReasonChange = (index: number, value: string) => {
    setPromptReasons(prev => {
      const next = prev.slice();
      next[index] = value;
      return next;
    });
  };

  const saveDraft = () => {
    if (typeof window === 'undefined') return;

    const draft: PromptTestSubmission = {
      aiUsed,
      problem1: {
        prompts,
        promptReasons,
      },
      problem2: {
        question: problem2Question,
        aiAnswer: problem2AiAnswer,
        revisedAnswer,
        revisedReason,
      },
      finalSummary,
      submittedAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem('promptTestDraft', JSON.stringify(draft));
    } catch {
      // ignore
    }
  };

  const handleSubmit = () => {
    if (typeof window === 'undefined') return;

    const payload: PromptTestSubmission = {
      aiUsed,
      problem1: {
        prompts,
        promptReasons,
      },
      problem2: {
        question: problem2Question,
        aiAnswer: problem2AiAnswer,
        revisedAnswer,
        revisedReason,
      },
      finalSummary,
      submittedAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem('promptTestSubmission', JSON.stringify(payload));
    } catch {
      // ignore
    }

    window.alert('제출되었습니다.');
    navigate('/hutechc-homepage/mypage/available');
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Top summary */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4 flex items-start justify-between border-b border-gray-200 gap-8">
          <div className="flex-1 text-xs text-gray-700 space-y-3">
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">프롬프트 시험 제출</p>
              <p className="text-gray-600">
                문제1/문제2를 선택해서 답안을 작성하세요. 문제1은 프롬프트 1~5 수정 + 사유(선택), 문제2는 AI 답변을 어떻게 바꿀지 직접 작성합니다. 마지막에 최종 정리를 작성한 뒤 제출하세요.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="font-semibold mb-1">주제</p>
                <p>{settings?.topic ?? '-'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">문제 설정</p>
                <p>{settings?.level ?? '-'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">분량</p>
                <p>{settings?.wordCount ?? '-'}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">사용한 AI</p>
                <div className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md text-xs text-gray-800 bg-gray-50">
                  {aiUsed || '미입력'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={saveDraft}
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              임시저장
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              제출
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        <div className="h-full px-6 py-6 overflow-hidden">
          <div className="h-full bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
            {/* Problem Tabs */}
            <div className="px-4 py-2 border-b border-gray-200 flex gap-4 text-sm font-semibold">
              <button
                onClick={() => setSelectedProblem(1)}
                className={`pb-2 border-b-2 ${
                  selectedProblem === 1
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                문제1
              </button>
              <button
                onClick={() => setSelectedProblem(2)}
                className={`pb-2 border-b-2 ${
                  selectedProblem === 2
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                문제2
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Problem 1 */}
              {selectedProblem === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900">프롬프트 1~5 (수정 + 사유)</p>
                    <p className="text-xs text-gray-500">{hasProblem1Changes ? '수정됨' : '원본 유지'}</p>
                  </div>

                  {prompts.map((value, i) => {
                    const changed = (value ?? '') !== (originalPrompts[i] ?? '');
                    return (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-gray-900">프롬프트 {i + 1}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              changed ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {changed ? '수정됨' : '미수정'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-700 mb-2">프롬프트</p>
                            <textarea
                              value={value}
                              onChange={(e) => handlePromptChange(i, e.target.value)}
                              placeholder={`프롬프트 ${i + 1}를 입력하거나 수정하세요.`}
                              className="w-full h-28 p-3 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-gray-700 mb-2">수정 사유 (선택)</p>
                            <textarea
                              value={promptReasons[i] ?? ''}
                              onChange={(e) => handleReasonChange(i, e.target.value)}
                              placeholder={changed ? '왜 수정했는지 자유롭게 작성하세요.' : '수정하지 않았다면 비워도 됩니다.'}
                              className="w-full h-28 p-3 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Problem 2 */}
              {selectedProblem === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900">AI 답변 수정</p>
                    <p className="text-xs text-gray-500">{hasProblem2Changes ? '수정됨' : '원본 유지'}</p>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">질문</p>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
                      {problem2Question || '문제2 질문이 입력되지 않았습니다.'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">AI 답변 (원본)</p>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 whitespace-pre-wrap h-80 overflow-y-auto">
                        {problem2AiAnswer || '문제2 AI 원본 답변이 입력되지 않았습니다.'}
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">AI 답변 (수정본)</p>
                      <textarea
                        value={revisedAnswer}
                        onChange={(e) => setRevisedAnswer(e.target.value)}
                        className="w-full h-80 p-3 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="원본 AI 답변을 어떻게 바꿀지 작성하세요."
                      />
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">수정 사유 (선택)</p>
                        <textarea
                          value={revisedReason}
                          onChange={(e) => setRevisedReason(e.target.value)}
                          className="w-full h-24 p-3 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="왜 이렇게 바꿨는지 자유롭게 작성하세요."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Final summary (global) */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">최종 정리</p>
                  <span className="text-xs text-gray-500">글자수: {finalSummary.length}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  문제1/문제2에서의 설계/수정 핵심 포인트를 요약해서 작성하세요.
                </p>
                <textarea
                  value={finalSummary}
                  onChange={(e) => setFinalSummary(e.target.value)}
                  placeholder="최종 정리를 작성해주세요."
                  className="w-full h-36 p-3 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setPrompts(originalPrompts);
                      setPromptReasons(['', '', '', '', '']);
                      setRevisedAnswer(problem2AiAnswer);
                      setRevisedReason('');
                      setFinalSummary('');
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-xs"
                  >
                    초기화
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
                  >
                    제출
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
