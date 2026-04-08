/* 원본: hutechc_hompage_real/app/mypage/exam/prompt/test/page.tsx */
import { useState, useMemo, useEffect } from 'react';

interface PromptSettings {
  topic: string;
  level: string;
  wordCount: string;
  contentDetail: string;
}

const mockPrompts = [
  {
    id: 1,
    title: '1교제',
    prompt: '서울시 기후 변화 대응 정책에 대해 설명하시오.',
    aiAnswer: '서울시는 2050년 탄소중립을 달성하기 위해 다양한 기후변화 대응 정책을 추진하고 있습니다. 주요 정책으로는 재생에너지 확대, 그린뉴딜 추진, 녹색건설 확대 등이 있습니다...'
  },
  {
    id: 2,
    title: '2교제',
    prompt: '인공지능 시대의 교육 변화에 대해 논술하시오.',
    aiAnswer: '인공지능 시대에 교육의 역할은 크게 변하고 있습니다. 기존의 지식 전달 중심 교육에서 벗어나 창의력, 비판적 사고, 협업 능력 등 고차원적 능력 개발에 중점을 두어야 합니다...'
  },
  {
    id: 3,
    title: '3교제',
    prompt: '스마트시티 구축의 장점과 과제를 분석하시오.',
    aiAnswer: '스마트시티는 정보통신기술을 활용하여 도시 문제를 해결하고 삶의 질을 향상시킵니다. 장점으로는 효율성 증대, 환경 개선, 시민 편의성 증대 등이 있으며, 과제로는 개인정보 보호, 초기 투자비용 등이 있습니다...'
  },
  {
    id: 4,
    title: '4교제',
    prompt: '디지털 격차 해소 방안을 제시하시오.',
    aiAnswer: '디지털 격차는 정보 접근성의 불평등 문제입니다. 이를 해소하기 위해서는 디지털 인프라 투자, 디지털 리터러시 교육, 취약계층 지원 강화 등의 정책이 필요합니다...'
  },
  {
    id: 5,
    title: '5교제',
    prompt: '로컬 경제 활성화 전략을 수립하시오.',
    aiAnswer: '로컬 경제 활성화는 지역 공동체 발전의 핵심입니다. 지역 특산품 브랜딩, 관광 산업 육성, 로컬 플랫폼 구축 등을 통해 지역 경제를 활성화할 수 있습니다...'
  }
];

const splitSentences = (text: string): string[] => {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
};

export default function TestPage() {
  const [selectedProblem, setSelectedProblem] = useState(1);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [settings, setSettings] = useState<PromptSettings | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem('promptSettings');
        if (raw) {
          const parsed = JSON.parse(raw) as PromptSettings;
          setSettings(parsed);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const currentProblem = mockPrompts.find(p => p.id === selectedProblem);
  const aiSentences = useMemo(
    () => (currentProblem ? splitSentences(currentProblem.aiAnswer) : []),
    [currentProblem]
  );

  useEffect(() => {
    setSelectedIndices([]);
    setUserAnswer('');
  }, [selectedProblem]);

  const selectedText = useMemo(
    () =>
      selectedIndices
        .slice()
        .sort((a, b) => a - b)
        .map(i => aiSentences[i])
        .join(' '),
    [selectedIndices, aiSentences]
  );

  useEffect(() => {
    setUserAnswer(selectedText);
  }, [selectedText]);

  const toggleSentence = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Top: Exam Info + Problem Tabs */}
      <div className="border-b border-gray-200 bg-white">
        {/* 설정 요약 + 시험 정보 */}
        <div className="px-6 py-4 flex items-start justify-between border-b border-gray-200 gap-8">
          {/* 왼쪽: 1/2/3단계 설정 요약 */}
          <div className="flex-1 text-xs text-gray-700 space-y-4">
            <div>
              <p className="text-sm font-bold text-gray-900 mb-2">1단계 사용자 기본 정보</p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold mb-1">주제 설정</p>
                  <p>{settings?.topic ?? '교육용'}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">문제 설정</p>
                  <p>{settings?.level ?? '전문적'}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-2">2단계 문장 기본 설정</p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold mb-1">분량 설정</p>
                  <p>{settings?.wordCount ?? '1000자 이내'}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">내용 설정</p>
                  <p>구체성, 명확성</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-2">3단계 질문 내용 작성</p>
              <p className="text-gray-800 whitespace-pre-wrap">
                {settings?.contentDetail || '구체적으로 질문할 내용이 여기에 표시됩니다.'}
              </p>
            </div>
          </div>

          {/* 오른쪽: 시험 정보 카드 */}
          <div className="w-72 border border-gray-200 rounded-lg p-4 bg-white flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                <img src="https://via.placeholder.com/48" alt="프로필" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs text-gray-500">홍길동</p>
                <p className="text-xs text-gray-500">abcde@gmail.com</p>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">번역 자격증 <span className="text-blue-600">전문1급</span></p>
              <p className="text-sm font-bold text-gray-900">시험명 시험명이 나오는 영역 시험명 2줄까지</p>
              <p className="text-xs text-gray-600 mt-1">A형 태국 여행에 대해서 기획서를 작성해보시고.</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-xs text-gray-500">한국어 &gt; <span className="text-blue-600">English</span></p>
                <p className="text-xs text-gray-500 mt-1">검정과목 · 분야</p>
              </div>
              <div className="text-right">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">5:00</div>
                <p className="text-xs text-gray-500 mt-1">09:00 - 09:15</p>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Selection Tabs */}
        <div className="px-6 py-2 flex gap-4 border-b border-gray-200">
          {mockPrompts.map((problem) => (
            <button
              key={problem.id}
              onClick={() => setSelectedProblem(problem.id)}
              className={`px-3 py-2 text-sm font-semibold border-b-2 ${
                selectedProblem === problem.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {problem.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: AI 문장 + 답안 문 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 상단 컨트롤 바 */}
        <div className="px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <select className="border border-gray-300 rounded-md px-3 py-1 text-xs text-gray-700 bg-white">
              <option>전체보기</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              임시저장
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              에디터편집
            </button>
          </div>
        </div>

        {/* 하단: AI 문 / 답안 문 */}
        <div className="flex-1 flex overflow-hidden px-6 py-4 bg-gray-50">
          {/* AI 문장 리스트 */}
          <div className="flex-1 mr-4 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-gray-800 rounded-full" />
              <span>AI 문</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-sm text-gray-700 leading-relaxed space-y-3">
              {aiSentences.map((sentence, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 rounded-md px-2 py-1"
                  onClick={() => toggleSentence(index)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIndices.includes(index)}
                    onChange={() => toggleSentence(index)}
                    className="mt-1 w-3 h-3"
                  />
                  <p className="flex-1 whitespace-pre-wrap">{sentence}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 답안 문 영역 */}
          <div className="flex-1 ml-4 flex flex-col">
            <div className="bg-white border border-gray-200 rounded-lg flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
                <span>선택된 문장</span>
              </div>
              <div className="p-4 bg-blue-50 text-sm text-blue-700 min-h-[80px] whitespace-pre-wrap">
                {selectedText || '선택된 문장이 없습니다. 문장을 클릭하여 선택하세요.'}
              </div>

              <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
                선택된 문장은 아래 답안 작성 영역에 자동으로 채워지며, 자유롭게 수정할 수 있습니다.
              </div>
            </div>

            {/* 최종 답안 작성 */}
            <div className="mt-4 bg-white border border-gray-200 rounded-lg flex flex-col flex-1">
              <div className="px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-700 flex items-center justify-between">
                <span>답안 문</span>
                <span className="text-gray-400">글자수: {userAnswer.length}</span>
              </div>
              <textarea
                placeholder="답안을 입력하거나 수정하세요."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="flex-1 p-4 text-sm border-0 resize-none focus:outline-none focus:ring-0 focus:ring-offset-0"
              />
              <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 text-xs">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
                  저장
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  제출
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
