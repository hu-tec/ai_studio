/* 원본: hutechc_hompage_real/app/translate/meta/new/editor/page.tsx */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Maximize2, MoreVertical, Save, FileText, RefreshCw, X } from 'lucide-react';

interface EditorSection {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  order: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EditorConfig {
  id: string;
  name: string;
  aiModels: string[];
  isActive: boolean;
  sections: EditorSection[];
}

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

const AI_TRANSLATORS = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'translator2', label: '번역기2' },
  { id: 'translator3', label: '번역기3' },
  { id: 'translator4', label: '번역기4' },
];

export default function EditorPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<MetaTranslationData | null>(null);
  const [selectedTranslator, setSelectedTranslator] = useState<string>('chatgpt');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [editorConfig, setEditorConfig] = useState<EditorConfig | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  // 선택된 탭들 (원문, AI 답변, 에디터, 최종 수정본) - 여러 개 동시 선택 가능
  const [activeTabs, setActiveTabs] = useState<Set<string>>(new Set(['original', 'ai', 'editor', 'final']));

  // 원문 내용
  const [originalContent, setOriginalContent] = useState<string>('');
  // AI 답변 내용
  const [aiContent, setAiContent] = useState<string>('');
  // 에디터 내용
  const [editorContent, setEditorContent] = useState<string>('');
  
  // 선택된 문장들 (여러 문장 선택 가능)
  const [selectedSentences, setSelectedSentences] = useState<Map<string, {
    text: string;
    originalText: string;
    source: 'left' | 'middle' | 'middle-split1' | 'middle-split2' | 'middle-split3' | 'middle-split4';
    section: string;
    key: string;
  }>>(new Map());
  
  // 수정된 문장 내용들 (key -> editedText)
  const [editedSentences, setEditedSentences] = useState<Map<string, string>>(new Map());
  
  // 왼쪽 패널에 표시할 섹션들 (체크박스로 선택)
  const [visibleSections, setVisibleSections] = useState<{
    section1: boolean;
    section2: boolean;
    section3: boolean;
  }>({
    section1: false,
    section2: true,
    section3: true,
  });

  // 중앙 패널(AI 답변)에 표시할 섹션들 (독립적으로 선택)
  const [visibleAiSections, setVisibleAiSections] = useState<{
    section1: boolean;
    section2: boolean;
    section3: boolean;
  }>({
    section1: false,
    section2: true,
    section3: true,
  });

  // 분할 모드: 'none' | 'split2' | 'split4'
  const [splitMode, setSplitMode] = useState<'none' | 'split2' | 'split4'>('none');
  
  // 각 분할에서 선택된 번역기들
  const [selectedTranslators, setSelectedTranslators] = useState<{
    split1?: string;
    split2?: string;
    split3?: string;
    split4?: string;
  }>({
    split1: 'chatgpt',
    split2: 'translator2',
    split3: 'translator3',
    split4: 'translator4',
  });

  // 최종 수정본 표시 여부 (저장 버튼 클릭 시)
  const [showFinalResult, setShowFinalResult] = useState<boolean>(false);
  
  // 최종 수정본 데이터 (섹션별)
  const [finalResults, setFinalResults] = useState<{
    section1?: string;
    section2?: string;
    section3?: string;
    section4?: string;
  }>({});

  // 최종 수정본 패널에 표시할 섹션들 (체크박스로 선택)
  const [visibleFinalSections, setVisibleFinalSections] = useState<{
    section1: boolean;
    section2: boolean;
    section3: boolean;
    section4: boolean;
  }>({
    section1: true,
    section2: true,
    section3: true,
    section4: true,
  });

  // 에디터 구성 불러오기 함수
  const loadEditorConfig = () => {
    if (typeof window === 'undefined') return;
    
    const storedConfig = window.localStorage.getItem('editorConfig');
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig) as EditorConfig;
        setEditorConfig(parsed);
      } catch (e) {
        console.error('Failed to parse editorConfig', e);
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // URL에서 preview 파라미터 확인
    const previewMode = window.location.search.includes('preview=true');
    setIsPreview(previewMode);

    // 에디터 구성 불러오기
    loadEditorConfig();

    // 미리보기 모드가 아닐 때만 실제 데이터 불러오기
    if (!previewMode) {
      const stored = window.sessionStorage.getItem('metaTranslationRequest');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as MetaTranslationData;
          setData(parsed);
          
          // 섹션별 내용 로드
          if (parsed.sections) {
            setOriginalContent(parsed.sections.section2Content || parsed.sections.section3Content || '');
            setAiContent(parsed.sections.section2Content || parsed.sections.section3Content || '');
            setEditorContent(parsed.sections.section2Content || parsed.sections.section3Content || '');
          }
        } catch (e) {
          console.error('Failed to parse metaTranslationRequest', e);
        }
      }
    } else {
      // 미리보기 모드: 더미 데이터 생성
      setData({
        mainCategory: '',
        middleCategory: '',
        detailCategory: '',
        language: {
          sourceMode: 'detect',
          sourceLang: null,
          targetLanguages: [],
          primaryTarget: null,
        },
        ai: {
          models: [],
          tone: '',
          customPrompt: '',
        },
        editor: 'use',
        humanWork: {
          type: '',
          level: '',
          urgent: false,
        },
        files: [],
        sections: {
          section1Content: '원문 내용이 여기에 표시됩니다.',
          section2Content: 'This is the area where the example answer is displayed.',
          section3Content: 'This is the area where the example answer is displayed.',
        },
      });
      setOriginalContent('원문 내용이 여기에 표시됩니다.');
      setAiContent('This is the area where the example answer is displayed.');
      setEditorContent('This is the area where the example answer is displayed.');
    }

    // localStorage 변경 감지 (다른 탭에서 변경된 경우)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'editorConfig') {
        loadEditorConfig();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 커스텀 이벤트 감지 (같은 탭에서 변경된 경우)
    const handleCustomStorageChange = () => {
      loadEditorConfig();
    };
    window.addEventListener('storage', handleCustomStorageChange);

    // 페이지 포커스 시 구성을 다시 불러오기
    const handleFocus = () => {
      loadEditorConfig();
    };
    window.addEventListener('focus', handleFocus);

    // 주기적으로 구성을 확인 (5초마다)
    const intervalId = setInterval(() => {
      loadEditorConfig();
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleCustomStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, []);

  // 미리보기 모드이거나 데이터가 있을 때만 렌더링
  if (!data && !isPreview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">데이터를 불러올 수 없습니다. 처음부터 다시 진행해주세요.</p>
      </div>
    );
  }

  const handleTempSave = () => {
    console.log('임시저장');
  };

  const handleSubmit = () => {
    console.log('제출');
    navigate('/hutechc-homepage/translate/meta/new/step2');
  };

  // 문장을 분리하는 함수
  const splitIntoSentences = (text: string): string[] => {
    if (!text) return [];
    const sentences = text.split(/([.!?。！？]\s*)/);
    const result: string[] = [];
    
    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = (sentences[i] || '') + (sentences[i + 1] || '');
      if (sentence.trim()) {
        result.push(sentence.trim());
      }
    }
    
    if (result.length === 0 && text.trim()) {
      return [text.trim()];
    }
    
    return result;
  };

  // 문장 체크박스 토글 핸들러
  const handleSentenceToggle = (
    sentence: string,
    source: 'left' | 'middle' | 'middle-split1' | 'middle-split2' | 'middle-split3' | 'middle-split4',
    section: string,
    key: string
  ) => {
    setSelectedSentences((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(key)) {
        newMap.delete(key);
        setEditedSentences((prevEdits) => {
          const newEdits = new Map(prevEdits);
          newEdits.delete(key);
          return newEdits;
        });
      } else {
        newMap.set(key, {
          text: sentence,
          originalText: sentence,
          source,
          section,
          key,
        });
        setEditedSentences((prevEdits) => {
          const newEdits = new Map(prevEdits);
          newEdits.set(key, sentence);
          return newEdits;
        });
      }
      return newMap;
    });
  };

  // 수정된 텍스트에서 변경된 단어만 찾아 하이라이트
  const highlightChanges = (original: string, edited: string): React.ReactNode => {
    if (original === edited) {
      return <span>{original}</span>;
    }

    const tokenize = (text: string): string[] => {
      return text.match(/\S+|\s+/g) || [];
    };
    
    const originalTokens = tokenize(original);
    const editedTokens = tokenize(edited);
    
    const result: React.ReactNode[] = [];
    let origIdx = 0;
    let editIdx = 0;
    
    while (origIdx < originalTokens.length || editIdx < editedTokens.length) {
      if (origIdx >= originalTokens.length) {
        const added = editedTokens.slice(editIdx).join('');
        if (added.trim()) {
          result.push(
            <span key={`added-${editIdx}`} className="bg-red-100 text-red-700">
              {added}
            </span>
          );
        } else {
          result.push(<span key={`added-space-${editIdx}`}>{added}</span>);
        }
        break;
      }
      
      if (editIdx >= editedTokens.length) {
        const deleted = originalTokens.slice(origIdx).join('');
        if (deleted.trim()) {
          result.push(
            <span key={`deleted-${origIdx}`} className="line-through text-gray-400">
              {deleted}
            </span>
          );
        } else {
          result.push(<span key={`deleted-space-${origIdx}`}>{deleted}</span>);
        }
        break;
      }
      
      const origToken = originalTokens[origIdx];
      const editToken = editedTokens[editIdx];
      
      if (/^\s+$/.test(origToken) && /^\s+$/.test(editToken)) {
        result.push(<span key={`space-${origIdx}`}>{origToken}</span>);
        origIdx++;
        editIdx++;
      } else if (origToken === editToken) {
        result.push(<span key={`same-${origIdx}`}>{origToken}</span>);
        origIdx++;
        editIdx++;
      } else {
        if (origToken.trim()) {
          result.push(
            <span key={`deleted-${origIdx}`} className="line-through text-gray-400">
              {origToken}
            </span>
          );
        }
        if (editToken.trim()) {
          result.push(
            <span key={`changed-${editIdx}`} className="bg-red-100 text-red-700">
              {editToken}
            </span>
          );
        } else {
          result.push(<span key={`space-${editIdx}`}>{editToken}</span>);
        }
        origIdx++;
        editIdx++;
      }
    }
    
    return <>{result}</>;
  };

  // 문장을 체크박스와 함께 렌더링
  const renderClickableSentences = (
    text: string,
    source: 'left' | 'middle' | 'middle-split1' | 'middle-split2' | 'middle-split3' | 'middle-split4',
    section: string
  ) => {
    if (!text) {
      text = 'This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed.';
    }
    
    const sentences = splitIntoSentences(text);
    
    return (
      <div className="leading-relaxed">
        {sentences.map((sentence, idx) => {
          const key = `${source}-${section}-${idx}`;
          const isSelected = selectedSentences.has(key);
          const editedText = editedSentences.get(key);
          // 수정된 텍스트가 있고 원본과 다를 때만 빨간색 표시
          const isEdited = editedText && editedText !== sentence;
          const displayText = editedText || sentence;
          
          return (
            <div key={idx} className="flex items-start gap-2 mb-1 group">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleSentenceToggle(sentence, source, section, key)}
                className="mt-1 w-3 h-3 cursor-pointer flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              />
              <span
                className={`flex-1 cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-1 rounded transition-colors ${
                  isSelected ? 'bg-blue-100' : ''
                } ${isEdited ? 'bg-red-100 text-red-700' : ''}`}
                title="체크박스로 선택하여 편집"
              >
                {displayText}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // 저장 버튼 핸들러 - 최종 수정본 생성 및 4번째 패널 표시
  const handleSave = () => {
    const results: {
      section1?: string;
      section2?: string;
      section3?: string;
      section4?: string;
    } = {};

    ['section1', 'section2', 'section3', 'section4'].forEach((sectionId) => {
      const sectionKey = `${sectionId}Content` as 'section1Content' | 'section2Content' | 'section3Content' | 'section4Content';
      const baseContent = (data?.sections?.[sectionKey] as string) || '';
      const sectionSentences = Array.from(selectedSentences.entries()).filter(
        ([_, sentence]) => sentence.section === sectionId
      );

      if (sectionSentences.length > 0) {
        const editedTexts = sectionSentences.map(([key, sentence]) => {
          const editedText = editedSentences.get(key) || sentence.originalText;
          return editedText;
        }).filter(Boolean);
        
        results[sectionId as keyof typeof results] = editedTexts.join(' ');
      } else {
        results[sectionId as keyof typeof results] = baseContent || '';
      }
    });

    setFinalResults(results);
    setShowFinalResult(true);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Top Header Bar */}
      <header className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-300">
          <button
            onClick={() => navigate(-1)}
            className="hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-gray-400">원문- 작성한 내용이나 없는경우 프롬프트 작성한 내용</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1 bg-gray-700 rounded-md p-1">
            <button
              onClick={() => {
                const newTabs = new Set(activeTabs);
                if (newTabs.has('original')) {
                  newTabs.delete('original');
                } else {
                  newTabs.add('original');
                }
                setActiveTabs(newTabs);
              }}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                activeTabs.has('original')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              원문
            </button>
            <button
              onClick={() => {
                const newTabs = new Set(activeTabs);
                if (newTabs.has('ai')) {
                  newTabs.delete('ai');
                } else {
                  newTabs.add('ai');
                }
                setActiveTabs(newTabs);
              }}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                activeTabs.has('ai')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              AI 프롬프트질문에 따른 답변 내용
            </button>
            <button
              onClick={() => {
                const newTabs = new Set(activeTabs);
                if (newTabs.has('editor')) {
                  newTabs.delete('editor');
                } else {
                  newTabs.add('editor');
                }
                setActiveTabs(newTabs);
              }}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                activeTabs.has('editor')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              에디터
            </button>
            <button
              onClick={() => {
                const newTabs = new Set(activeTabs);
                if (newTabs.has('final')) {
                  newTabs.delete('final');
                } else {
                  if (!showFinalResult) {
                    handleSave();
                  }
                  newTabs.add('final');
                }
                setActiveTabs(newTabs);
              }}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                activeTabs.has('final')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-600'
              }`}
            >
              최종 수정본
            </button>
          </div>
          <select
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-xs text-white"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="ko">한국어</option>
            <option value="en">영어</option>
            <option value="zh">중국어</option>
            <option value="ja">일어</option>
          </select>
          <button className="text-gray-400 hover:text-white">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-white">
            <MoreVertical className="w-4 h-4" />
          </button>
          <span className="text-gray-300 text-xs">에디터</span>
          <button
            onClick={handleTempSave}
            className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
          >
            임시저장
          </button>
          <button className="px-3 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-600">
            문단
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
          >
            기업용 제출
          </button>
          <button
            onClick={() => {
              // 기업용 응시 로직
              console.log('기업용 응시');
            }}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            기업용 응시
          </button>
        </div>
      </header>

      {/* Main Layout - Tab-based Panels */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Original Text */}
        {activeTabs.has('original') && (
        <div className="flex-1 border-r border-gray-700 bg-gray-50 flex flex-col min-h-0">
          <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900">원문- 작성한 내용이나 없는경우 프롬프트 작성한 내용</h3>
            <div className="flex items-center gap-2">
              <select className="border border-gray-300 rounded px-2 py-1 text-xs bg-white">
                <option>전체보기</option>
              </select>
              <button className="text-gray-400 hover:text-gray-600">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 text-xs text-gray-700">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">1. 원문</h4>
                <p className="text-gray-600 mb-3">
                  AI 번역기 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.
                </p>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {renderClickableSentences(
                    data?.sections?.section1Content || '원문 내용이 여기에 표시됩니다. 원문 내용이 여기에 표시됩니다. 원문 내용이 여기에 표시됩니다. 원문 내용이 여기에 표시됩니다. 원문 내용이 여기에 표시됩니다. 원문 내용이 여기에 표시됩니다.',
                    'left',
                    'section1'
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">2. 목적</h4>
                <p className="text-gray-600 mb-3">
                  AI 번역기 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.
                </p>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {renderClickableSentences(
                    data?.sections?.section2Content || originalContent || 'This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed.',
                    'left',
                    'section2'
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">3. 내용</h4>
                <p className="text-gray-600 mb-3">
                  AI 번역기 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.
                </p>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {renderClickableSentences(
                    data?.sections?.section3Content || 'This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed.',
                    'left',
                    'section3'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Middle Panel - AI Response */}
        {activeTabs.has('ai') && (
        <div className="flex-1 border-r border-gray-700 bg-gray-50 flex flex-col min-h-0 overflow-hidden">
          <div className="bg-white border-b border-gray-200 p-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-900">AI 프롬프트질문에 따른 답변 내용</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
                  <button
                    onClick={() => setSplitMode('none')}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      splitMode === 'none'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    분할없음
                  </button>
                  <button
                    onClick={() => setSplitMode('split2')}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      splitMode === 'split2'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    2분할
                  </button>
                  <button
                    onClick={() => setSplitMode('split4')}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      splitMode === 'split4'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    4분할
                  </button>
                </div>
              </div>
            </div>
            {splitMode === 'none' && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-gray-100 rounded-md p-1">
                  {AI_TRANSLATORS.map((translator) => (
                    <button
                      key={translator.id}
                      onClick={() => setSelectedTranslator(translator.id)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        selectedTranslator === translator.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {translator.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden min-h-0 text-xs text-gray-700 flex flex-col">
            {splitMode === 'none' ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">1. 원문</h4>
                  <p className="text-gray-600 mb-3">
                    AI AI 프롬프트 수정 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.
                  </p>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {renderClickableSentences(
                      data?.sections?.section1Content || '원문 내용이 여기에 표시됩니다. 원문 내용이 여기에 표시됩니다. 원문 내용이 여기에 표시됩니다. 원문 내용이 여기에 표시됩니다. 원문 내용이 여기에 표시됩니다. 원문 내용이 여기에 표시됩니다.',
                      'middle',
                      'section1'
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">2. 목적</h4>
                  <p className="text-gray-600 mb-3">
                    AI AI 프롬프트 수정 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.
                  </p>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {renderClickableSentences(
                      data?.sections?.section2Content || aiContent || 'This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed.',
                      'middle',
                      'section2'
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">3. 내용</h4>
                  <p className="text-gray-600 mb-3">
                    AI AI 프롬프트 수정 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.
                  </p>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {renderClickableSentences(
                      data?.sections?.section3Content || 'This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed. This is the area where the example answer is displayed.',
                      'middle',
                      'section3'
                    )}
                  </div>
                </div>
              </div>
            ) : splitMode === 'split2' ? (
              <div className="flex-1 flex flex-col gap-2 p-2 min-h-0">
                {[1, 2].map((index) => {
                  const splitKey = `split${index}` as keyof typeof selectedTranslators;
                  return (
                    <div key={index} className="flex-1 border border-gray-300 rounded-lg overflow-hidden flex flex-col min-h-0 bg-white">
                      <div className="bg-gray-100 border-b border-gray-300 p-2 flex-shrink-0">
                        <div className="flex gap-1 bg-white rounded-md p-1">
                          {AI_TRANSLATORS.map((translator) => (
                            <button
                              key={translator.id}
                              onClick={() => setSelectedTranslators((prev) => ({ ...prev, [splitKey]: translator.id }))}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                selectedTranslators[splitKey] === translator.id
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {translator.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 whitespace-nowrap overflow-x-auto">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 text-xs">1. 원문</h4>
                          <div className="text-xs">
                            {renderClickableSentences(
                              data?.sections?.section1Content || '원문 내용이 여기에 표시됩니다.',
                              `middle-split${index}` as 'middle-split1' | 'middle-split2',
                              'section1'
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 text-xs">2. 목적</h4>
                          <div className="text-xs">
                            {renderClickableSentences(
                              data?.sections?.section2Content || 'This is the area where the example answer is displayed. This is the area where the example answer is displayed.',
                              `middle-split${index}` as 'middle-split1' | 'middle-split2',
                              'section2'
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 text-xs">3. 내용</h4>
                          <div className="text-xs">
                            {renderClickableSentences(
                              data?.sections?.section3Content || 'This is the area where the example answer is displayed. This is the area where the example answer is displayed.',
                              `middle-split${index}` as 'middle-split1' | 'middle-split2',
                              'section3'
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-2 gap-2 p-2 min-h-0">
                {[1, 2, 3, 4].map((index) => {
                  const splitKey = `split${index}` as keyof typeof selectedTranslators;
                  return (
                    <div key={index} className="border border-gray-300 rounded-lg overflow-hidden flex flex-col min-h-0 bg-white">
                      <div className="bg-gray-100 border-b border-gray-300 p-2 flex-shrink-0">
                        <div className="flex gap-1 bg-white rounded-md p-1">
                          {AI_TRANSLATORS.map((translator) => (
                            <button
                              key={translator.id}
                              onClick={() => setSelectedTranslators((prev) => ({ ...prev, [splitKey]: translator.id }))}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                selectedTranslators[splitKey] === translator.id
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {translator.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0 whitespace-nowrap overflow-x-auto">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 text-xs">1. 원문</h4>
                          <div className="text-xs">
                            {renderClickableSentences(
                              data?.sections?.section1Content || '원문 내용이 여기에 표시됩니다.',
                              `middle-split${index}` as 'middle-split1' | 'middle-split2' | 'middle-split3' | 'middle-split4',
                              'section1'
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 text-xs">2. 목적</h4>
                          <div className="text-xs">
                            {renderClickableSentences(
                              data?.sections?.section2Content || 'This is the area where the example answer is displayed.',
                              `middle-split${index}` as 'middle-split1' | 'middle-split2' | 'middle-split3' | 'middle-split4',
                              'section2'
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1 text-xs">3. 내용</h4>
                          <div className="text-xs">
                            {renderClickableSentences(
                              data?.sections?.section3Content || 'This is the area where the example answer is displayed.',
                              `middle-split${index}` as 'middle-split1' | 'middle-split2' | 'middle-split3' | 'middle-split4',
                              'section3'
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Right Panel - Editor */}
        {activeTabs.has('editor') && (
        <div className="flex-1 bg-gray-50 flex flex-col min-h-0 overflow-hidden">
          <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-gray-900">에디터</h3>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              {/* Editor Toolbar Icons */}
              <button className="p-1 hover:bg-gray-100 rounded" title="Grid">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button className="p-1 hover:bg-gray-100 rounded" title="Expand">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              <button className="p-1 hover:bg-gray-100 rounded" title="More">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {/* 저장된 구성을 기반으로 섹션 동적 렌더링 */}
            {editorConfig && editorConfig.sections.length > 0 ? (
              <div className="space-y-6">
                {editorConfig.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => {
                    // 섹션 ID 매핑 (title에서 추출하거나 기본값 사용)
                    const sectionIdMap: Record<string, string> = {
                      '1. 원문': 'section1',
                      '2. 목적': 'section2',
                      '3. 내용': 'section3',
                      '4. 추가 요청사항': 'section4',
                    };
                    const sectionId = sectionIdMap[section.title] || `section${section.order}`;
                    const sectionSentences = Array.from(selectedSentences.entries()).filter(
                      ([_, sentence]) => sentence.section === sectionId
                    );
                    
                    // 기본 내용 가져오기
                    let baseContent = '';
                    if (sectionId === 'section1') {
                      baseContent = data?.sections?.section1Content || section.placeholder;
                    } else if (sectionId === 'section2') {
                      baseContent = editorContent || data?.sections?.section2Content || section.placeholder;
                    } else if (sectionId === 'section3') {
                      baseContent = data?.sections?.section3Content || section.placeholder;
                    } else if (sectionId === 'section4') {
                      baseContent = data?.sections?.section4Content || section.placeholder;
                    } else {
                      baseContent = section.placeholder;
                    }
                    
                    return (
                      <div key={section.id}>
                        <h4 className="font-semibold text-gray-900 mb-2 text-xs">{section.title}</h4>
                        <p className="text-gray-600 mb-3 text-xs">{section.description}</p>
                        <div className="border border-gray-300 rounded-md p-3 bg-white min-h-[200px]">
                          {sectionSentences.length > 0 ? (
                            <div className="space-y-3">
                              {sectionSentences.map(([key, sentence]) => {
                                const editedText = editedSentences.get(key) || sentence.originalText;
                                const isEdited = editedText !== sentence.originalText;
                                return (
                                  <div key={key} className="space-y-2">
                                    <textarea
                                      value={editedText}
                                      onChange={(e) => {
                                        setEditedSentences((prev) => {
                                          const newMap = new Map(prev);
                                          newMap.set(key, e.target.value);
                                          return newMap;
                                        });
                                      }}
                                      className={`w-full border rounded-md p-2 text-xs min-h-[60px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        isEdited ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                                      }`}
                                      placeholder={section.placeholder}
                                    />
                                    {isEdited && (
                                      <div className="p-2 bg-gray-50 rounded text-xs">
                                        <span className="text-gray-500">수정된 부분: </span>
                                        <span className="whitespace-pre-wrap leading-relaxed text-gray-700">
                                          {highlightChanges(sentence.originalText, editedText)}
                                        </span>
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-500">
                                      <button
                                        onClick={() => {
                                          setSelectedSentences((prev) => {
                                            const newMap = new Map(prev);
                                            newMap.delete(key);
                                            return newMap;
                                          });
                                          setEditedSentences((prev) => {
                                            const newMap = new Map(prev);
                                            newMap.delete(key);
                                            return newMap;
                                          });
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        제거
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap leading-relaxed text-xs text-gray-700">
                              {baseContent}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              // 기본 섹션 (구성이 없을 때)
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-xs">1. 원문</h4>
                  <p className="text-gray-600 mb-3 text-xs">
                    AI 번역기 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.
                  </p>
                  <div className="border border-gray-300 rounded-md p-3 bg-white min-h-[200px]">
                    <div className="whitespace-pre-wrap leading-relaxed text-xs text-gray-700">
                      {data?.sections?.section1Content || '원문 내용이 여기에 표시됩니다.'}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-xs">2. 목적</h4>
                  <p className="text-gray-600 mb-3 text-xs">
                    AI 번역기 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.
                  </p>
                  <div className="border border-gray-300 rounded-md p-3 bg-white min-h-[200px]">
                    <div className="whitespace-pre-wrap leading-relaxed text-xs text-gray-700">
                      {editorContent || data?.sections?.section2Content || 'This is the area where the example answer is displayed.'}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-xs">3. 내용</h4>
                  <p className="text-gray-600 mb-3 text-xs">
                    AI 번역기 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.
                  </p>
                  <div className="border border-gray-300 rounded-md p-3 bg-white min-h-[200px]">
                    <div className="whitespace-pre-wrap leading-relaxed text-xs text-gray-700">
                      {data?.sections?.section3Content || 'This is the area where the example answer is displayed.'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 저장 버튼 - 에디터 패널 하단 */}
          <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-end flex-shrink-0">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-orange-500 text-white text-xs font-medium rounded-md hover:bg-orange-600"
            >
              저장
            </button>
          </div>
        </div>
        )}

        {/* 4th Panel - Final Result */}
        {activeTabs.has('final') && (
          <div className="flex-1 border-l border-gray-700 bg-gray-50 flex flex-col min-h-0 overflow-hidden">
            <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold text-gray-900">최종 수정본</h3>
                {/* 섹션 선택 체크박스 */}
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleFinalSections.section1}
                      onChange={(e) => setVisibleFinalSections((prev) => ({ ...prev, section1: e.target.checked }))}
                      className="w-3 h-3"
                    />
                    <span>1</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleFinalSections.section2}
                      onChange={(e) => setVisibleFinalSections((prev) => ({ ...prev, section2: e.target.checked }))}
                      className="w-3 h-3"
                    />
                    <span>2</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleFinalSections.section3}
                      onChange={(e) => setVisibleFinalSections((prev) => ({ ...prev, section3: e.target.checked }))}
                      className="w-3 h-3"
                    />
                    <span>3</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleFinalSections.section4}
                      onChange={(e) => setVisibleFinalSections((prev) => ({ ...prev, section4: e.target.checked }))}
                      className="w-3 h-3"
                    />
                    <span>4</span>
                  </label>
                </div>
              </div>
              <button
                onClick={() => setShowFinalResult(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {visibleFinalSections.section1 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-xs">1. 원문</h4>
                    <p className="text-gray-600 mb-3 text-xs">
                      AI 번역기 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.
                    </p>
                    <div className="border border-gray-300 rounded-md p-3 bg-white min-h-[200px]">
                      <textarea
                        value={finalResults.section1 || ''}
                        onChange={(e) => {
                          setFinalResults((prev) => ({
                            ...prev,
                            section1: e.target.value,
                          }));
                        }}
                        className="w-full border border-gray-300 rounded-md p-2 text-xs min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap"
                        placeholder="내용을 입력하세요..."
                      />
                      {finalResults.section1 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <span className="text-gray-500">수정된 부분: </span>
                          <span className="whitespace-pre-wrap leading-relaxed text-gray-700">
                            {highlightChanges(data?.sections?.section1Content || '', finalResults.section1 || '')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {visibleFinalSections.section2 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-xs">2. 목적</h4>
                    <p className="text-gray-600 mb-3 text-xs">
                      AI 번역기 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.
                    </p>
                    <div className="border border-gray-300 rounded-md p-3 bg-white min-h-[200px]">
                      <textarea
                        value={finalResults.section2 || ''}
                        onChange={(e) => {
                          setFinalResults((prev) => ({
                            ...prev,
                            section2: e.target.value,
                          }));
                        }}
                        className="w-full border border-gray-300 rounded-md p-2 text-xs min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap"
                        placeholder="내용을 입력하세요..."
                      />
                      {finalResults.section2 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <span className="text-gray-500">수정된 부분: </span>
                          <span className="whitespace-pre-wrap leading-relaxed text-gray-700">
                            {highlightChanges(data?.sections?.section2Content || '', finalResults.section2 || '')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {visibleFinalSections.section3 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-xs">3. 내용</h4>
                    <p className="text-gray-600 mb-3 text-xs">
                      AI 번역기 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.
                    </p>
                    <div className="border border-gray-300 rounded-md p-3 bg-white min-h-[200px]">
                      <textarea
                        value={finalResults.section3 || ''}
                        onChange={(e) => {
                          setFinalResults((prev) => ({
                            ...prev,
                            section3: e.target.value,
                          }));
                        }}
                        className="w-full border border-gray-300 rounded-md p-2 text-xs min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap"
                        placeholder="내용을 입력하세요..."
                      />
                      {finalResults.section3 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <span className="text-gray-500">수정된 부분: </span>
                          <span className="whitespace-pre-wrap leading-relaxed text-gray-700">
                            {highlightChanges(data?.sections?.section3Content || '', finalResults.section3 || '')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {visibleFinalSections.section4 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 text-xs">4. 추가 요청사항</h4>
                    <p className="text-gray-600 mb-3 text-xs">
                      AI 번역기 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.
                    </p>
                    <div className="border border-gray-300 rounded-md p-3 bg-white min-h-[200px]">
                      <textarea
                        value={finalResults.section4 || ''}
                        onChange={(e) => {
                          setFinalResults((prev) => ({
                            ...prev,
                            section4: e.target.value,
                          }));
                        }}
                        className="w-full border border-gray-300 rounded-md p-2 text-xs min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap"
                        placeholder="내용을 입력하세요..."
                      />
                      {finalResults.section4 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <span className="text-gray-500">수정된 부분: </span>
                          <span className="whitespace-pre-wrap leading-relaxed text-gray-700">
                            {highlightChanges(data?.sections?.section4Content || '', finalResults.section4 || '')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
