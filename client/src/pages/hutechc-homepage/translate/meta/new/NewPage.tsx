/* 원본: hutechc_hompage_real/app/translate/meta/new/page.tsx */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { extractTextStats } from '../../../lib/priceCalculator';

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

const LANGUAGES = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: '영어' },
  { code: 'zh', name: '중국어' },
  { code: 'ja', name: '일어' },
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

interface MetaTranslationData {
  mainCategory: string;
  middleCategory: string;
  detailCategory: string;
  language: {
    sourceMode: 'detect' | 'fixed';
    sourceLang: string | null;
    targetLanguages: string[];
    primaryTarget: string | null;
  };
  ai: {
    models: string[];
    tone: string;
    customPrompt: string;
  };
  editor: 'use' | 'no';
  humanWork: {
    type: string;
    level: string;
    urgent: boolean;
  };
  files: { name: string; size: number }[];
  fileStats?: {
    charCount: number;
    wordCount: number;
    minutes: number;
  };
  sections?: {
    section1Content?: string;
    section2Content: string;
    section3Content: string;
    section4Content?: string;
  };
}

export default function NewPage() {
  const navigate = useNavigate();
  const [mainCategory, setMainCategory] = useState<string>('law');
  const [middleCategory, setMiddleCategory] = useState<string>('law-domestic');
  const [detailCategory, setDetailCategory] = useState<string>('law-domestic-complaint');
  const [sourceMode, setSourceMode] = useState<'detect' | 'fixed'>('detect');
  const [fixedSourceLang, setFixedSourceLang] = useState<string>('ko');
  const [targetLanguages, setTargetLanguages] = useState<string[]>(['en']);
  const [selectedModels, setSelectedModels] = useState<string[]>(['chatgpt']);
  const [tone, setTone] = useState<string>('formal');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [useEditor, setUseEditor] = useState<'use' | 'no'>('use');
  const [humanWorkType, setHumanWorkType] = useState<string>('review');
  const [humanLevel, setHumanLevel] = useState<string>('senior');
  const [isUrgentFlag, setIsUrgentFlag] = useState<boolean>(false);
  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [fileStats, setFileStats] = useState<{
    charCount: number;
    wordCount: number;
    minutes: number;
  }>({ charCount: 0, wordCount: 0, minutes: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // 섹션별 내용
  const [section1Content, setSection1Content] = useState<string>('');
  const [section2Content, setSection2Content] = useState<string>('');
  const [section3Content, setSection3Content] = useState<string>('');
  const [section4Content, setSection4Content] = useState<string>('');

  // 섹션 표시 여부
  const [visibleSections, setVisibleSections] = useState<{
    section1: boolean;
    section2: boolean;
    section3: boolean;
  }>({
    section1: false,
    section2: true,
    section3: true,
  });

  const [showPreview, setShowPreview] = useState<boolean>(true);

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
    
    if (fileList.length > 0) {
      try {
        const stats = await extractTextStats(fileList[0] as File);
        setFileStats(stats);
      } catch (e) {
        console.error('Failed to extract file stats:', e);
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

  const handleEditInEditor = () => {
    const payload: MetaTranslationData = {
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
      fileStats,
      sections: {
        section1Content,
        section2Content,
        section3Content,
        section4Content,
      },
    };

    sessionStorage.setItem('metaTranslationRequest', JSON.stringify(payload));
    navigate('/hutechc-homepage/translate/meta/new/editor');
  };

  const middleOptions = MIDDLE_CATEGORIES[mainCategory] ?? [];
  const detailOptions = DETAIL_CATEGORIES[middleCategory] ?? [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel: Input Forms */}
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">새 메타번역 의뢰</h1>
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
          <section className="bg-white border border-gray-200 rounded-lg p-4">
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

          {/* 언어 설정 */}
          <section className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">언어</h2>
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
                      {lang.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

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
                    <span>{lang.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* AI 설정 */}
          <section className="bg-white border border-gray-200 rounded-lg p-4">
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

          {/* 섹션별 내용 입력 */}
          <section className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800">내용</h2>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleSections.section1}
                    onChange={(e) => setVisibleSections((prev) => ({ ...prev, section1: e.target.checked }))}
                    className="w-3 h-3"
                  />
                  <span>1</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleSections.section2}
                    onChange={(e) => setVisibleSections((prev) => ({ ...prev, section2: e.target.checked }))}
                    className="w-3 h-3"
                  />
                  <span>2</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleSections.section3}
                    onChange={(e) => setVisibleSections((prev) => ({ ...prev, section3: e.target.checked }))}
                    className="w-3 h-3"
                  />
                  <span>3</span>
                </label>
              </div>
            </div>

            {visibleSections.section1 && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">1. 원문</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs bg-white"
                  rows={4}
                  value={section1Content}
                  onChange={(e) => setSection1Content(e.target.value)}
                  placeholder="원문을 입력하세요..."
                />
              </div>
            )}

            {visibleSections.section2 && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">2. 목적</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs bg-white"
                  rows={4}
                  value={section2Content}
                  onChange={(e) => setSection2Content(e.target.value)}
                  placeholder="목적을 입력하세요..."
                />
              </div>
            )}

            {visibleSections.section3 && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">3. 내용</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs bg-white"
                  rows={4}
                  value={section3Content}
                  onChange={(e) => setSection3Content(e.target.value)}
                  placeholder="내용을 입력하세요..."
                />
              </div>
            )}
          </section>

          {/* 파일 업로드 */}
          <section className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">첨부 파일</h2>
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

          {/* 에디터 편집 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={handleEditInEditor}
              className="inline-flex items-center gap-2 px-6 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600"
            >
              에디터편집
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: Real-time Preview */}
      {showPreview && (
        <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">미리보기</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {visibleSections.section1 && section1Content && (
              <div>
                <h4 className="text-xs font-semibold text-gray-900 mb-2">1. 원문</h4>
                <p className="text-xs text-gray-700 whitespace-pre-wrap">{section1Content}</p>
              </div>
            )}
            {visibleSections.section2 && section2Content && (
              <div>
                <h4 className="text-xs font-semibold text-gray-900 mb-2">2. 목적</h4>
                <p className="text-xs text-gray-700 whitespace-pre-wrap">{section2Content}</p>
              </div>
            )}
            {visibleSections.section3 && section3Content && (
              <div>
                <h4 className="text-xs font-semibold text-gray-900 mb-2">3. 내용</h4>
                <p className="text-xs text-gray-700 whitespace-pre-wrap">{section3Content}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
