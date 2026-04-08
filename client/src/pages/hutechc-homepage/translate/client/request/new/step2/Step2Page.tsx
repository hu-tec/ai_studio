/* 원본: hutechc_hompage_real/app/translate/client/request/new/step2/page.tsx */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import {
  extractTextStats,
  calculateAmountFromStep1,
  TranslationRequestData,
} from '../../../../../lib/priceCalculator';

// 카테고리 레이블 매핑 (STEP1과 동일 구조)
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

// 언어 + 티어 (표시용)
const LANGUAGE_TIERS = {
  tier1: { id: 'tier1', display: 'Tier1' },
  tier2: { id: 'tier2', display: 'Tier2' },
  tier3: { id: 'tier3', display: 'Tier3' },
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

function getLanguageLabel(code: string | null | undefined) {
  if (!code) return '';
  const lang = LANGUAGES.find((l) => l.code === code);
  if (!lang) return code;
  const tier = LANGUAGE_TIERS[lang.tier as keyof typeof LANGUAGE_TIERS];
  return `${lang.name} (${tier.display})`;
}

// STEP1에서 저장된 payload 타입
interface TranslationRequest {
  mainCategory: string;
  middleCategory: string;
  detailCategory: string;
  language: {
    sourceMode: 'detect' | 'fixed';
    sourceLang: string | null;
    targetLanguages: string[];
    primaryTarget: string | null;
  };
  ai:{
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
}

// 긴급 단계 정의
const URGENCY_OPTIONS = [
  {
    id: 'normal',
    label: '일반',
    description: '기본 일정 (5일+)',
    days: '5일 이상',
    multiplier: 1.0,
  },
  {
    id: 'urgent1',
    label: '긴급 1단계',
    description: '3일 이내 완료',
    days: '3일 이내',
    multiplier: 1.3,
  },
  {
    id: 'urgent2',
    label: '긴급 2단계',
    description: '1일 이내 완료',
    days: '1일 이내',
    multiplier: 1.5,
  },
] as const;

// 번역 타입별 추가 요금 (payment-guide와 동일 텍스트)
const TRANSLATION_TYPES = [
  {
    id: 'TTT',
    label: 'TTT',
    description: '텍스트 → 텍스트',
    extra: '기본',
  },
  {
    id: 'STT',
    label: 'STT',
    description: '음성 → 텍스트',
    extra: '+₩7k/분',
  },
  {
    id: 'TTS',
    label: 'TTS',
    description: '텍스트 → 음성',
    extra: '+₩5k/분',
  },
  {
    id: 'STS',
    label: 'STS',
    description: '음성 → 음성',
    extra: '+₩10k/분',
  },
] as const;

// 번역사 매칭 방식
const MATCHING_MODES = [
  {
    id: 'auto',
    label: '번역사 자동매칭',
    description: 'AI가 분류/언어/금액을 기준으로 자동으로 번역사를 추천합니다.',
  },
  {
    id: 'direct',
    label: '번역사 직접 선택',
    description: '번역사 리스트를 보고 사용자가 직접 한 명을 선택합니다.',
  },
  {
    id: 'accepted',
    label: '요청 수락 번역사 중 선택',
    description: '견적을 수락한 번역사 리스트에서 나중에 선택합니다.',
  },
] as const;

export default function Step2Page() {
  const navigate = useNavigate();
  const [request, setRequest] = useState<TranslationRequest | null>(null);

  const [urgencyId, setUrgencyId] = useState<'normal' | 'urgent1' | 'urgent2'>('normal');
  const [translationTypeId, setTranslationTypeId] = useState<'TTT' | 'STT' | 'TTS' | 'STS'>('TTT');
  const [matchingMode, setMatchingMode] = useState<'auto' | 'direct' | 'accepted'>('auto');

  const [baseAmount, setBaseAmount] = useState<number>(0); // 자동 계산되는 기본 금액
  const [charCount, setCharCount] = useState<number>(0); // 글자수 (자동 감지)
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // STEP 1 데이터 로드 및 기본 금액 자동 계산
  useEffect(() => {
    const loadAndCalculate = async () => {
      if (typeof window === 'undefined') return;
      
      const stored = window.sessionStorage.getItem('metaTranslationRequest');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as TranslationRequest;
          setRequest(parsed);
          
          // 자동 계산 시작
          setIsCalculating(true);
          
          // STEP 1에서 저장된 파일 글자 수 통계 사용
          let stats = parsed.fileStats || { wordCount: 0, charCount: 0, minutes: 0 };
          
          // fileStats가 없으면 파일 메타데이터로 추정
          if (!parsed.fileStats && parsed.files && parsed.files.length > 0) {
            const estimatedChars = Math.floor(parsed.files[0].size / 2);
            stats = {
              charCount: estimatedChars,
              wordCount: Math.floor(estimatedChars / 5),
              minutes: 0,
            };
          }
          
          setCharCount(stats.charCount);
          
          // 기본 금액 계산
          try {
            const amount = await calculateAmountFromStep1(
              parsed as TranslationRequestData,
              stats
            );
            setBaseAmount(amount);
          } catch (e) {
            console.error('Failed to calculate amount:', e);
            setBaseAmount(0);
          }
          
          setIsCalculating(false);
        } catch (e) {
          console.error('Failed to parse translationRequest', e);
          setIsCalculating(false);
        }
      }
    };
    
    loadAndCalculate();
  }, []);

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">STEP 1 정보가 없습니다. 처음부터 다시 진행해주세요.</p>
      </div>
    );
  }

  const urgency = URGENCY_OPTIONS.find((u) => u.id === urgencyId)!;
  const translationType = TRANSLATION_TYPES.find((t) => t.id === translationTypeId)!;
  const matchingModeLabel = MATCHING_MODES.find((m) => m.id === matchingMode)?.label ?? '';

  const totalAmount = Math.round(baseAmount * urgency.multiplier);

  const mainLabel = MAIN_CATEGORIES.find((m) => m.id === request.mainCategory)?.label ?? request.mainCategory;
  const middleLabel =
    MIDDLE_CATEGORIES[request.mainCategory]?.find((m) => m.id === request.middleCategory)?.label ??
    request.middleCategory;
  const detailLabel =
    DETAIL_CATEGORIES[request.middleCategory]?.find((d) => d.id === request.detailCategory)?.label ??
    request.detailCategory;

  const sourceLabel =
    request.language.sourceMode === 'detect'
      ? '언어 감지'
      : getLanguageLabel(request.language.sourceLang ?? undefined);

  const targetLabels = request.language.targetLanguages.map((code) => getLanguageLabel(code));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <div className="text-xs text-gray-500 mb-1">STEP 2</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">긴급도 / 번역 타입 및 최종 견적</h1>
          <p className="text-sm text-gray-600">
            이전 단계에서 선택한 정보에 긴급도와 번역 타입을 적용해 최종 결제 금액을 확인합니다.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* LEFT: 설정 */}
          <div className="lg:col-span-2 space-y-5">
            {/* 기본 금액 - 자동 계산 */}
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">기본 금액 (자동 계산)</h2>
              <p className="text-xs text-gray-600 mb-3">
                1단계 선택(분류, 언어, AI/휴먼 작업 등)과 업로드된 파일의 글자수를 기준으로 자동 산정되었습니다.
              </p>
              {isCalculating && (
                <div className="text-xs text-blue-600 mb-2">계산 중...</div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-700">₩</span>
                <input
                  type="number"
                  value={baseAmount || ''}
                  disabled
                  className="w-40 border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>감지된 글자수</span>
                <input
                  type="number"
                  value={charCount || ''}
                  disabled
                  className="w-28 border border-gray-300 rounded-md px-2 py-1 text-xs bg-gray-100 text-gray-700 cursor-not-allowed"
                />
                <span>자</span>
              </div>
              <p className="text-[11px] text-blue-600 mt-2">※ 정확한 계산을 위해 STEP 1에서 파일을 다시 업로드하거나 수정해주세요.</p>
            </section>

            {/* 번역사 매칭 방식 */}
            <section className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">번역사 매칭 방식</h2>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                {MATCHING_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMatchingMode(m.id)}
                    className={`text-left border rounded-md px-3 py-3 transition-colors ${
                      matchingMode === m.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">{m.label}</div>
                    <div className="text-xs text-gray-600">{m.description}</div>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-gray-500">
                ※ 이후 &quot;내 의뢰 목록&quot; 화면에서 직접 선택 / 자동매칭 결과 / 요청 수락 번역사 리스트를 기반으로 번역사를
                확정합니다.
              </p>
            </section>

            {/* 긴급도 */}
            <section className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">긴급도 선택</h2>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                {URGENCY_OPTIONS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUrgencyId(u.id)}
                    className={`text-left border rounded-md px-3 py-3 transition-colors ${
                      urgencyId === u.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">{u.label}</div>
                    <div className="text-xs text-gray-600">{u.description}</div>
                    <div className="mt-1 text-[11px] text-gray-500">{u.days} · {u.multiplier}배</div>
                  </button>
                ))}
              </div>
            </section>

            {/* 번역 타입 */}
            <section className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">번역 타입 선택</h2>
              <p className="text-xs text-gray-600 mb-3">번역 타입에 따라 추가 요금이 적용됩니다. (상세는 가격 안내 참고)</p>
              <div className="space-y-2 text-sm">
                {TRANSLATION_TYPES.map((t) => (
                  <label
                    key={t.id}
                    className={`flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer transition-colors ${
                      translationTypeId === t.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="translation-type"
                        value={t.id}
                        checked={translationTypeId === t.id}
                        onChange={() => setTranslationTypeId(t.id)}
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{t.label}</div>
                        <div className="text-xs text-gray-600">{t.description}</div>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-indigo-600">{t.extra}</div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: 요약 & 결제 */}
          <aside className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* 요약 카드 */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">선택 요약</h3>

                <div className="space-y-2 mb-3">
                  <div>
                    <div className="text-[11px] text-gray-500">카테고리</div>
                    <div className="font-medium text-gray-900">
                      {mainLabel} &gt; {middleLabel} &gt; {detailLabel}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500">출발어</div>
                    <div className="font-medium text-gray-900">{sourceLabel}</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500">도착어</div>
                    <div className="font-medium text-gray-900">
                      {targetLabels.length > 0 ? targetLabels.join(', ') : '선택 없음'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500">AI / 톤</div>
                    <div className="font-medium text-gray-900">
                      {request.ai.models.join(', ') || '선택 없음'} / {request.ai.tone}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500">휴먼 작업</div>
                    <div className="font-medium text-gray-900">
                      {request.humanWork.type === 'none'
                        ? '요청 없음'
                        : `${request.humanWork.type} · ${request.humanWork.level}`}
                      {request.humanWork.urgent && ' · 긴급 요청'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500">번역사 매칭</div>
                    <div className="font-medium text-gray-900">{matchingModeLabel}</div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500">긴급도</div>
                    <div className="font-medium text-gray-900">
                      {urgency.label} ({urgency.days}, {urgency.multiplier}배)
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-500">번역 타입</div>
                    <div className="font-medium text-gray-900">
                      {translationType.label} · {translationType.description} ({translationType.extra})
                    </div>
                  </div>
                </div>

                {request.files.length > 0 && (
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="text-[11px] text-gray-500 mb-1">첨부 파일</div>
                    <ul className="space-y-1 max-h-24 overflow-y-auto text-[11px] text-gray-700">
                      {request.files.map((f) => (
                        <li key={f.name}>
                          {f.name} ({Math.round(f.size / 1024)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 결제 박스 */}
              <div className="bg-white border border-indigo-200 rounded-lg p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">최종 결제 금액</h3>

                <div className="flex justify-between items-center mb-2 text-xs text-gray-600">
                  <span>기본 금액</span>
                  <span>{baseAmount ? `₩${baseAmount.toLocaleString()}` : '-'}</span>
                </div>
                <div className="flex justify-between items-center mb-2 text-xs text-gray-600">
                  <span>글자수/단어수</span>
                  <span>{charCount ? `${charCount.toLocaleString()}자` : '-'}</span>
                </div>
                <div className="flex justify-between items-center mb-2 text-xs text-gray-600">
                  <span>긴급도 ({urgency.label})</span>
                  <span>× {urgency.multiplier}</span>
                </div>
                <div className="flex justify-between items-center mb-3 text-xs text-gray-600">
                  <span>번역 타입 ({translationType.label})</span>
                  <span>{translationType.extra}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-semibold text-gray-900">합계</span>
                    <span className="text-xl font-bold text-indigo-600">
                      {totalAmount ? `₩${totalAmount.toLocaleString()}` : '₩0'}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">※ 번역 타입별 추가 요금(분당)은 별도 적용됩니다.</div>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    className="w-full py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    신용카드 / 페이 결제
                  </button>
                  <button
                    type="button"
                    className="w-full py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                  >
                    포인트 결제
                  </button>
                </div>

                <div className="mt-3 text-center">
                  <Link to="/hutechc-homepage/payment-guide"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <span>가격 안내 보기</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
