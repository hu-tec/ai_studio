/* 원본: hutechc_hompage_real/app/mypage/exam/prompt_test/page.tsx */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const AI_CUSTOM = '__custom__';

const AI_OPTIONS: { label: string; value: string }[] = [
  { label: 'ChatGPT (OpenAI)', value: 'ChatGPT (OpenAI)' },
  { label: 'OpenAI API (직접 호출)', value: 'OpenAI API' },
  { label: 'Claude (Anthropic)', value: 'Claude (Anthropic)' },
  { label: 'Gemini (Google)', value: 'Gemini (Google)' },
  { label: 'Microsoft Copilot', value: 'Microsoft Copilot' },
  { label: 'Perplexity', value: 'Perplexity' },
  { label: 'Grok (xAI)', value: 'Grok (xAI)' },
  { label: 'Meta AI', value: 'Meta AI' },
  { label: 'Llama (Meta)', value: 'Llama (Meta)' },
  { label: 'Mistral', value: 'Mistral' },
  { label: 'Cohere Command', value: 'Cohere Command' },
  { label: 'DeepSeek', value: 'DeepSeek' },
  { label: 'Qwen (Alibaba)', value: 'Qwen (Alibaba)' },
  { label: 'Kimi (Moonshot)', value: 'Kimi (Moonshot)' },
  { label: 'Baidu ERNIE', value: 'Baidu ERNIE' },
  { label: 'NAVER HyperCLOVA X', value: 'NAVER HyperCLOVA X' },
  { label: 'Kakao KoGPT', value: 'Kakao KoGPT' },
  { label: 'Amazon Bedrock', value: 'Amazon Bedrock' },
  { label: 'Azure OpenAI', value: 'Azure OpenAI' },
  { label: 'Vertex AI (Google Cloud)', value: 'Vertex AI (Google Cloud)' },
  { label: 'Ollama (Local)', value: 'Ollama (Local)' },
  { label: 'LM Studio (Local)', value: 'LM Studio (Local)' },
  { label: '직접 입력', value: AI_CUSTOM },
];

type PromptTestSettings = {
  topic: string;
  level: string;
  wordCount: string;
  aiUsed: string;
  aiUsedOption: string;
  aiUsedCustom: string;
  promptDetails: string[]; // 문제1: 1~5번 프롬프트 입력
  problem2Question: string; // 문제2: 어떤 질문을 했는지
  problem2AiAnswer: string; // 문제2: AI 원본 답변
};

export default function PromptTestPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<PromptTestSettings>({
    topic: '교육용',
    level: '전문적',
    wordCount: '1000자 이내',
    aiUsed: '',
    aiUsedOption: '',
    aiUsedCustom: '',
    promptDetails: ['', '', '', '', ''],
    problem2Question: '',
    problem2AiAnswer: '',
  });

  const handleChange = (
    key: keyof Omit<PromptTestSettings, 'promptDetails'>,
    value: string
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePromptChange = (index: number, value: string) => {
    setSettings(prev => {
      const next = prev.promptDetails.slice();
      next[index] = value;
      return { ...prev, promptDetails: next };
    });
  };

  const handleAiUsedOptionChange = (value: string) => {
    setSettings(prev => {
      const next = { ...prev, aiUsedOption: value };
      const aiUsed = value === AI_CUSTOM ? next.aiUsedCustom : value;
      return { ...next, aiUsed };
    });
  };

  const handleAiUsedCustomChange = (value: string) => {
    setSettings(prev => {
      const next = { ...prev, aiUsedCustom: value };
      const aiUsed = next.aiUsedOption === AI_CUSTOM ? value : next.aiUsedOption;
      return { ...next, aiUsed };
    });
  };

  const contentDetail = useMemo(() => {
    return settings.promptDetails
      .map((text, i) => `프롬프트 ${i + 1}: ${text}`)
      .join('\n');
  }, [settings.promptDetails]);

  const handleSubmit = () => {
    if (typeof window !== 'undefined') {
      try {
        // 기존 prompt/test 페이지와의 호환을 위해 contentDetail도 함께 저장
        sessionStorage.setItem(
          'promptSettings',
          JSON.stringify({
            ...settings,
            contentDetail,
          })
        );
      } catch {
        // ignore
      }
    }
    navigate('/hutechc-homepage/mypage/exam/prompt_test/test');
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* 상단 시험 정보 + 문제 탭 (번역 시험과 동일한 구조) */}
      <div className="border-b border-gray-200 bg-white">
        {/* 시험 정보 카드 */}
        <div className="px-6 py-4 flex items-start justify-between border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden">
              <img src="https://via.placeholder.com/64" alt="프로필" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">번역 자격증 <span className="text-blue-600 font-semibold">전문1급</span></p>
              <h1 className="text-xl font-bold text-gray-900 mb-1">시험명이 나오는 영역</h1>
              <p className="text-xs text-gray-600">A형 태국 여행에 대해서 기획서를 작성해보시고.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-gray-500">한국어 &gt; <span className="text-blue-600">English</span></p>
              <p className="text-xs text-gray-500 mt-1">검정과목 · 분야</p>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">5:00</div>
              <p className="text-xs text-gray-500 mt-1">09:00 - 09:15</p>
            </div>
          </div>
        </div>

        {/* 문제 탭 */}
        <div className="px-6 py-2 flex gap-6 border-b border-gray-200 text-sm font-semibold">
          <button className="text-blue-600 border-b-2 border-blue-600 pb-2">문제1</button>
          <button className="text-gray-600 pb-2 hover:text-gray-900">문제2</button>
          <button className="text-gray-600 pb-2 hover:text-gray-900">문제3</button>
          <button className="text-gray-600 pb-2 hover:text-gray-900">문제4</button>
          <button className="text-gray-600 pb-2 hover:text-gray-900">문제5</button>
        </div>
      </div>

      {/* 본문: 단계별 프롬프트 설정 */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gray-50">
        {/* 1단계 사용자 기본 정보 */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">1단계 사용자 기본 정보</h2>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="font-semibold text-gray-700 mb-2">주제 설정</p>
              <div className="flex items-center gap-4 text-xs text-gray-700">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="topic"
                    value="법용/일반"
                    checked={settings.topic === '법용/일반'}
                    onChange={(e) => handleChange('topic', e.target.value)}
                  />
                  법용/일반
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="topic"
                    value="교육용"
                    checked={settings.topic === '교육용'}
                    onChange={(e) => handleChange('topic', e.target.value)}
                  />
                  교육용
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="topic"
                    value="전문가"
                    checked={settings.topic === '전문가'}
                    onChange={(e) => handleChange('topic', e.target.value)}
                  />
                  전문가
                </label>
              </div>
            </div>

            <div>
              <p className="font-semibold text-gray-700 mb-2">문제 설정</p>
              <div className="flex items-center gap-4 text-xs text-gray-700">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="level"
                    value="친근함"
                    checked={settings.level === '친근함'}
                    onChange={(e) => handleChange('level', e.target.value)}
                  />
                  친근함
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="level"
                    value="전문적"
                    checked={settings.level === '전문적'}
                    onChange={(e) => handleChange('level', e.target.value)}
                  />
                  전문적
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="level"
                    value="창의적"
                    checked={settings.level === '창의적'}
                    onChange={(e) => handleChange('level', e.target.value)}
                  />
                  창의적
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="font-semibold text-gray-700 mb-2 text-sm">사용한 AI</p>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={settings.aiUsedOption}
                onChange={(e) => handleAiUsedOptionChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {AI_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <input
                value={settings.aiUsedOption === AI_CUSTOM ? settings.aiUsedCustom : settings.aiUsed}
                onChange={(e) => handleAiUsedCustomChange(e.target.value)}
                disabled={settings.aiUsedOption !== AI_CUSTOM}
                placeholder={
                  settings.aiUsedOption === AI_CUSTOM
                    ? '사용한 AI를 직접 입력하세요.'
                    : '직접 입력을 선택하면 활성화됩니다.'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-800 disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* 2단계 문장 기본 설정 */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">2단계 문장 기본 설정</h2>
          <div className="border border-dashed border-blue-300 rounded-lg p-4 grid grid-cols-2 gap-8 text-xs text-gray-700">
            {/* 왼쪽 설정 */}
            <div className="space-y-3">
              <div>
                <p className="font-semibold mb-2">분량 설정</p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="wordCount"
                      value="500자 이내"
                      checked={settings.wordCount === '500자 이내'}
                      onChange={(e) => handleChange('wordCount', e.target.value)}
                    />
                    500자 이내
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="wordCount"
                      value="1000자 이내"
                      checked={settings.wordCount === '1000자 이내'}
                      onChange={(e) => handleChange('wordCount', e.target.value)}
                    />
                    1000자 이내
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="wordCount"
                      value="상한없음"
                      checked={settings.wordCount === '상한없음'}
                      onChange={(e) => handleChange('wordCount', e.target.value)}
                    />
                    상한없음
                  </label>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">내용 설정</p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1">
                    <input type="checkbox" defaultChecked /> 구체적
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" defaultChecked /> 명확성
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" /> 정확성
                  </label>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">기타 설정</p>
                <input
                  type="text"
                  placeholder="입력해주세요."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 오른쪽 설정 (미러 구조) */}
            <div className="space-y-3">
              <div>
                <p className="font-semibold mb-2">분량 설정</p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1">
                    <input type="radio" name="wordCountRight" /> 500자 이내
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="wordCountRight" defaultChecked /> 1000자 이내
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="wordCountRight" /> 상한없음
                  </label>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">내용 설정</p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1">
                    <input type="checkbox" defaultChecked /> 구체적
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" defaultChecked /> 명확성
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" /> 정확성
                  </label>
                </div>
              </div>

              <div>
                <p className="font-semibold mb-2">기타 설정</p>
                <input
                  type="text"
                  placeholder="입력해주세요."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3단계 문제1: 프롬프트 입력 (1~5번) */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">3단계 문제1 입력</h2>
          <p className="text-xs text-gray-600 mb-4">
            문제 1~5에 대해, 수험자가 어떤 방식으로 프롬프트를 입력해야 하는지(가이드/조건/형식 등)를 작성하세요.
          </p>

          <div className="space-y-4">
            {settings.promptDetails.map((value, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-gray-700 mb-2">프롬프트 {i + 1}</p>
                <textarea
                  placeholder={`프롬프트 ${i + 1} 입력 가이드를 작성해주세요.`}
                  value={value}
                  onChange={(e) => handlePromptChange(i, e.target.value)}
                  className="w-full h-28 p-3 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 4단계 문제2: 질문 + AI 원본 답변 입력 */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">4단계 문제2 입력</h2>
          <p className="text-xs text-gray-600 mb-4">
            문제2는 &quot;어떤 질문을 했을 때 AI 답변이 이렇게 왔다&quot;를 제시하고, 수험자가 AI 답변을 어떻게 개선할지 작성하는 유형입니다.
          </p>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">질문(내가 AI에게 한 질문)</p>
              <textarea
                value={settings.problem2Question}
                onChange={(e) => handleChange('problem2Question', e.target.value)}
                placeholder="예) 태국 여행 기획서를 작성해줘"
                className="w-full h-24 p-3 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">AI 원본 답변</p>
              <textarea
                value={settings.problem2AiAnswer}
                onChange={(e) => handleChange('problem2AiAnswer', e.target.value)}
                placeholder="AI가 이렇게 답변했다(원본)를 붙여넣어 주세요."
                className="w-full h-60 p-3 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-3">
          <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm font-semibold">
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-semibold"
          >
            제출하기
          </button>
        </div>
      </div>
    </div>
  );
}
