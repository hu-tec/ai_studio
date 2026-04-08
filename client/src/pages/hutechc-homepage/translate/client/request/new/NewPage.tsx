/* 원본: hutechc_hompage_real/app/translate/client/request/new/page.tsx */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { extractTextStats } from '../../../../lib/priceCalculator';

// 카테고리 (대/중/소)
const MAIN_CATEGORIES = [
  { id: 'law', label: '법률' },
  { id: 'business', label: '비즈니스' },
  { id: 'medical', label: '의료' },
  { id: 'tech', label: '기술' },
  { id: 'general', label: '일반' },
];

const MIDDLE_CATEGORIES: Record<string, { id: string; label: string }[]> = {
  law: [
    { id: 'law-domestic', label: '국내 법률' },
    { id: 'law-international', label: '국제 법률' },
  ],
  business: [
    { id: 'biz-marketing', label: '마케팅' },
    { id: 'biz-contract', label: '계약/영업' },
  ],
  medical: [
    { id: 'med-general', label: '일반 의료' },
    { id: 'med-pharma', label: '제약' },
  ],
  tech: [
    { id: 'tech-manual', label: '매뉴얼' },
    { id: 'tech-spec', label: '기술 명세' },
  ],
  general: [
    { id: 'gen-document', label: '일반 문서' },
    { id: 'gen-etc', label: '기타' },
  ],
};

const DETAIL_CATEGORIES: Record<string, { id: string; label: string }[]> = {
  'law-domestic': [
    { id: 'law-domestic-complaint', label: '고소장' },
    { id: 'law-domestic-contract', label: '계약서' },
  ],
  'law-international': [
    { id: 'law-international-contract', label: '국제 계약서' },
  ],
  'biz-marketing': [
    { id: 'biz-marketing-copy', label: '카피라이팅' },
  ],
};

// 언어 + 티어
const LANGUAGE_TIERS = {
  tier1: { id: 'tier1', label: 'Tier1', display: 'Tier1' },
  tier2: { id: 'tier2', label: 'Tier2', display: 'Tier2' },
  tier3: { id: 'tier3', label: 'Tier3', display: 'Tier3' },
};

const LANGUAGES = [
  { code: 'ko', name: '한국어', tier: 'tier1' },
  { code: 'en', name: '영어', tier: 'tier1' },
  { code: 'zh', name: '중국어', tier: 'tier1' },
  { code: 'ja', name: '일어', tier: 'tier1' },
  { code: 'ar', name: '아랍어', tier: 'tier2' },
  { code: 'vi', name: '베트남어', tier: 'tier2' },
  { code: 'fr', name: '프랑스어', tier: 'tier2' },
  { code: 'de', name: '독일어', tier: 'tier2' },
];

const AI_MODELS = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'wrtn', label: 'wrtn.' },
  { id: 'other', label: '다른 AI' },
];

const TONES = [
  { id: 'formal', label: '공식적인' },
  { id: 'casual', label: '일상적인' },
  { id: 'technical', label: '기술적' },
  { id: 'creative', label: '창의적' },
];

const HUMAN_WORK_TYPES = [
  { id: 'none', label: '요청 없음' },
  { id: 'review', label: '감수 요청' },
];

const HUMAN_LEVELS = [
  { id: 'standard', label: '일반 전문가' },
  { id: 'senior', label: '고급전문가' },
];

function getLanguageLabel(code: string) {
  const lang = LANGUAGES.find((l) => l.code === code);
  if (!lang) return '';
  const tier = LANGUAGE_TIERS[lang.tier as keyof typeof LANGUAGE_TIERS];
  return `${lang.name} (${tier.display})`;
}

export default function NewPage() {
  const navigate = useNavigate();

  // 카테고리
  const [mainCategory, setMainCategory] = useState<string>('law');
  const [middleCategory, setMiddleCategory] = useState<string>('law-domestic');
  const [detailCategory, setDetailCategory] = useState<string>('law-domestic-complaint');

  // 언어 설정 (출발어 모드 + 대상 언어)
  const [sourceMode, setSourceMode] = useState<'detect' | 'fixed'>('detect');
  const [fixedSourceLang, setFixedSourceLang] = useState<string>('ko');
  const [targetLanguages, setTargetLanguages] = useState<string[]>(['en']);

  // AI / 에디터 / 휴먼 작업
  const [selectedModels, setSelectedModels] = useState<string[]>(['chatgpt']);
  const [tone, setTone] = useState<string>('formal');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [useEditor, setUseEditor] = useState<'use' | 'no'>('use');
  const [humanWorkType, setHumanWorkType] = useState<string>('review');
  const [humanLevel, setHumanLevel] = useState<string>('senior');
  const [isUrgentFlag, setIsUrgentFlag] = useState<boolean>(false);

  // 파일
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [fileStats, setFileStats] = useState<{
    charCount: number;
    wordCount: number;
    minutes: number;
  }>({ charCount: 0, wordCount: 0, minutes: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const [errors, setErrors] = useState<string[]>([]);

  const handleModelToggle = (id: string) => {
    setSelectedModels((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleTargetToggle = (code: string) => {
    setTargetLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const applyFiles = async (fileList: FileList | File[]) => {
    const next = Array.from(fileList).map((f) => ({ name: f.name, size: f.size }));
    setFiles(next);
    
    // 첫 번째 파일의 글자 수 추출
    if (fileList.length > 0) {
      try {
        const stats = await extractTextStats(fileList[0] as File);
        setFileStats(stats);
      } catch (e) {
        console.error('Failed to extract file stats:', e);
        // 파일 크기 기반 추정
        const estimatedChars = Math.floor(fileList[0].size / 2);
        setFileStats({
          charCount: estimatedChars,
          wordCount: Math.floor(estimatedChars / 5),
          minutes: 0,
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList: FileList | null = e.target.files;
    if (!fileList) return;
    applyFiles(fileList);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) {
      applyFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleNext = () => {
    const newErrors: string[] = [];

    if (!mainCategory || !middleCategory || !detailCategory) {
      newErrors.push('카테고리를 모두 선택해주세요.');
    }
    if (sourceMode === 'fixed' && !fixedSourceLang) {
      newErrors.push('출발어를 선택해주세요.');
    }
    if (targetLanguages.length === 0) {
      newErrors.push('도착어(대상 언어)를 최소 1개 이상 선택해주세요.');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      mainCategory,
      middleCategory,
      detailCategory,
      language: {
        sourceMode,
        sourceLang: sourceMode === 'fixed' ? fixedSourceLang : null,
        targetLanguages,
        primaryTarget: targetLanguages[0] ?? null,
      },
      ai: {
        models: selectedModels,
        tone,
        customPrompt,
      },
      editor: useEditor,
      humanWork: {
        type: humanWorkType,
        level: humanLevel,
        urgent: isUrgentFlag,
      },
      files,
      fileStats, // 파일 글자 수 통계
    };

    sessionStorage.setItem('translationRequest', JSON.stringify(payload));
    navigate('/hutechc-homepage/translate/client/request/new/step2');
  };

  const middleOptions = MIDDLE_CATEGORIES[mainCategory] ?? [];
  const detailOptions = DETAIL_CATEGORIES[middleCategory] ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">새 번역 의뢰</h1>
          <p className="text-sm text-gray-600">카테고리, 언어, AI 설정, 휴먼 작업, 파일까지 한 번에 입력합니다.</p>
        </header>

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <ul className="space-y-1 text-sm text-red-700">
              {errors.map((err, idx) => (
                <li key={idx}>• {err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-5">
          {/* 카테고리 선택 */}
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">카테고리 선택</h2>
            <div className="flex flex-wrap gap-3 items-center">
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[140px] bg-white"
                value={mainCategory}
                onChange={(e) => {
                  const nextMain = e.target.value;
                  setMainCategory(nextMain);
                  const firstMiddle = (MIDDLE_CATEGORIES[nextMain] ?? [])[0]?.id ?? '';
                  setMiddleCategory(firstMiddle);
                  const firstDetail = (firstMiddle && DETAIL_CATEGORIES[firstMiddle]?.[0]?.id) || '';
                  setDetailCategory(firstDetail);
                }}
              >
                {MAIN_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[150px] bg-white"
                value={middleCategory}
                onChange={(e) => {
                  const nextMid = e.target.value;
                  setMiddleCategory(nextMid);
                  const firstDetail = DETAIL_CATEGORIES[nextMid]?.[0]?.id || '';
                  setDetailCategory(firstDetail);
                }}
              >
                {middleOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[150px] bg-white"
                value={detailCategory}
                onChange={(e) => setDetailCategory(e.target.value)}
              >
                {detailOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* 첨부파일 */}
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">첨부 파일</h2>
            <p className="text-xs text-gray-600 mb-2">파일을 업로드하면 출발어를 자동 감지하는 데 활용됩니다.</p>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed rounded-md text-xs mb-3 transition-colors ${
                isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-white'
              }`}
            >
              <p className="text-gray-700 mb-1">이 영역으로 파일을 드래그해서 올려주세요.</p>
              <p className="text-gray-500">또는 아래 파일 선택 버튼을 사용하세요.</p>
            </div>

            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="text-sm"
            />
            {files.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-gray-700">
                {files.map((f) => (
                  <li key={f.name}>
                    {f.name} ({Math.round(f.size / 1024)} KB)
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 언어 (언어설정 통합) */}
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">언어</h2>

            {/* 출발어 모드 */}
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-gray-600">출발어:</span>
              <select
                className="border border-gray-300 rounded-md px-3 py-1.5 text-xs bg-white"
                value={sourceMode}
                onChange={(e) => setSourceMode(e.target.value as 'detect' | 'fixed')}
              >
                <option value="detect">언어 감지</option>
                <option value="fixed">직접 선택</option>
              </select>

              {sourceMode === 'fixed' && (
                <select
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-xs bg-white min-w-[140px]"
                  value={fixedSourceLang}
                  onChange={(e) => setFixedSourceLang(e.target.value)}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {getLanguageLabel(lang.code)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 도착어(대상 언어) */}
            <div>
              <p className="text-xs text-gray-600 mb-2">도착어 (대상 언어 선택)</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {LANGUAGES.map((lang) => (
                  <label key={lang.code} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={targetLanguages.includes(lang.code)}
                      onChange={() => handleTargetToggle(lang.code)}
                    />
                    <span>{getLanguageLabel(lang.code)}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* 사용 AI + 톤 + 프롬프트 */}
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">사용 AI</h2>
            <div className="flex flex-wrap gap-4 text-sm mb-4">
              {AI_MODELS.map((m) => (
                <label key={m.id} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(m.id)}
                    onChange={() => handleModelToggle(m.id)}
                  />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">톤</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  {TONES.map((t) => (
                    <label key={t.id} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="tone"
                        value={t.id}
                        checked={tone === t.id}
                        onChange={(e) => setTone(e.target.value)}
                      />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">커스텀 프롬프트 (선택)</p>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs bg-white"
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="예: 법률 용어는 원문 유지, 매우 자연스럽게 번역 등"
                />
              </div>
            </div>
          </section>

          {/* 양식 에디터 */}
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">양식 에디터</h2>
            <div className="flex gap-6 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="editor"
                  value="use"
                  checked={useEditor === 'use'}
                  onChange={() => setUseEditor('use')}
                />
                <span>에디터 사용</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="editor"
                  value="no"
                  checked={useEditor === 'no'}
                  onChange={() => setUseEditor('no')}
                />
                <span>에디터 미사용</span>
              </label>
            </div>
          </section>

          {/* 휴먼 작업 요청 */}
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">휴먼 작업 요청</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[130px] bg-white"
                value={humanWorkType}
                onChange={(e) => setHumanWorkType(e.target.value)}
              >
                {HUMAN_WORK_TYPES.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.label}
                  </option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[130px] bg-white"
                value={humanLevel}
                onChange={(e) => setHumanLevel(e.target.value)}
              >
                {HUMAN_LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isUrgentFlag}
                  onChange={(e) => setIsUrgentFlag(e.target.checked)}
                />
                <span>긴급</span>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </label>
            </div>
          </section>
        </div>

        {/* 다음 버튼 */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
          >
            다음 단계
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
