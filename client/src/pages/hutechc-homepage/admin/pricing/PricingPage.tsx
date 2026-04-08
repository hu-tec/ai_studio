/* 원본: hutechc_hompage_real/app/(client-layout)/admin/pricing/page.tsx */
import { Link } from 'react-router';
import { PriceProvider, usePrice, type PriceSettings } from '../../lib/priceContext';
import { LanguageConfigProvider, useLanguageConfig, type LanguageTier } from '../../lib/languageConfig';
import { useEffect, useRef, useState } from 'react';

const tierLabelFallback = (tier: LanguageTier) => tier;

type PriceTableType =
  | 'client'
  | 'translator'
  | 'editor'
  | 'tuition-proofread-exhibition'
  | 'expert-review';

const PRICE_TABLE_TYPE_LABELS: Record<PriceTableType, string> = {
  client: '의뢰자 가격표',
  translator: '번역사 가격표',
  editor: '에디터비',
  'tuition-proofread-exhibition': '홈페이지',
  'expert-review': '전문가 감수비용측정',
};

const PLACEHOLDER_TYPES: PriceTableType[] = [];

const EDITOR_ITEMS: { key: string; label: string }[] = [
  { key: 'editor_doc_form', label: '문서폼 에디터' },
  { key: 'editor_translation', label: '번역에디터' },
  { key: 'editor_prompt', label: '프롬프트 에디터' },
  { key: 'editor_video', label: '영상 에디터' },
  { key: 'editor_image', label: '이미지 에디터' },
  { key: 'editor_dev', label: '개발에디터' },
  { key: 'editor_music', label: '음악 에디터' },
  { key: 'editor_creative', label: '창의에디터' },
];

const TUITION_ITEMS: { key: string; label: string }[] = [
  { key: 'tuition_tesol', label: '테솔' },
  { key: 'tuition_prompt', label: '프롬프트' },
  { key: 'tuition_ai_translation', label: 'AI통번역' },
  { key: 'tuition_itt_exam', label: 'ITT시험' },
  { key: 'tuition_ethics', label: '윤리' },
];

const PROOFREAD_ITEMS: { key: string; label: string; group?: string }[] = [
  { key: 'proofread_doc_use', label: '1. 문서사용' },
  { key: 'proofread_doc_provide', label: '2. 문서제공' },
  { key: 'proofread_expert_request', label: '3. 전문가 의뢰비' },
  { key: 'proofread_doc_sale_general', label: '4-1. 일반 문서 판매', group: '4. 문서판매' },
  { key: 'proofread_doc_sale_expert', label: '4-2. 전문가 문서 판매', group: '4. 문서판매' },
];

const EXHIBITION_ITEMS: { key: string; label: string }[] = [
  { key: 'exhibition_usage', label: '1. 사용료' },
  { key: 'exhibition_video', label: '2. 영상' },
  { key: 'exhibition_voice', label: '3. 음성' },
  { key: 'exhibition_text', label: '4. 텍스트' },
  { key: 'exhibition_down', label: '5. 다운' },
];

const EXPERT_REVIEW_ITEMS: { key: string; label: string }[] = [
  { key: 'expert_email', label: '1. 메일' },
  { key: 'expert_per_minute', label: '2. 분당' },
  { key: 'expert_per_hour', label: '3. 시간당' },
  { key: 'expert_meeting', label: '4. 만남' },
  { key: 'expert_video', label: '5. 화상' },
  { key: 'expert_phone', label: '6. 전화' },
  { key: 'expert_kakao', label: '7. 카톡' },
];

function PricingPageInner() {
  const { prices, updatePrices } = usePrice();
  const {
    tiers,
    languages,
    tierMultipliers,
    updateLanguage,
    updateTierMultiplier,
    addLanguage,
    removeLanguage,
    addTier,
    removeTier,
  } = useLanguageConfig();
  const [saved, setSaved] = useState(false);
  const [priceTableType, setPriceTableType] = useState<PriceTableType>('client');
  const [selectedLargeCategory, setSelectedLargeCategory] = useState<string | null>(null);
  const [selectedMidCategory, setSelectedMidCategory] = useState<string | null>(null);

  const isPlaceholderType = PLACEHOLDER_TYPES.includes(priceTableType);

  // 현재 선택된 가격표 (의뢰자 또는 번역사)
  const currentPrices = priceTableType === 'client' ? prices.clientPrices : prices.translatorPrices;
  
  // translatorRatios가 없으면 기본값 사용
  const translatorRatios = prices.translatorRatios || {
    translator_text_ratio: 70,
    translator_voice_ratio: 70,
    translator_video_ratio: 70,
    ai_text_ratio: 70,
    ai_voice_ratio: 70,
    ai_video_ratio: 70,
    marketing_ratio: 70,
    law_ratio: 70,
    tech_ratio: 70,
    academic_ratio: 70,
    medical_ratio: 70,
    finance_ratio: 70,
    urgent1_ratio: 70,
    urgent2_ratio: 70,
    match_direct_ratio: 70,
    match_request_ratio: 70,
    match_auto_ratio: 70,
    match_corporate_ratio: 70,
    payment_point_per_char_ratio: 70,
    payment_subscribe_per_char_ratio: 70,
    payment_oneoff_per_char_ratio: 70,
    payment_point_charge_ratio: 0,
    payment_basic_sub_ratio: 0,
    payment_standard_sub_ratio: 0,
    payment_premium_sub_ratio: 0,
    payment_service_use_ratio: 0,
  };

  const handleAddLanguage = (tier: LanguageTier) => {
    const code = window.prompt('언어 코드를 입력하세요 (예: es)');
    if (!code) return;
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    const name = window.prompt('언어 이름을 입력하세요 (예: 스페인어)') ?? '';
    const trimmedName = name.trim() || trimmedCode;

    addLanguage({
      code: trimmedCode,
      name: trimmedName,
      tier,
      enabled: true,
    });
    setSaved(false);
  };

  const tierMultiplierRowRef = useRef<HTMLDivElement | null>(null);
  const tierLanguagesRowRef = useRef<HTMLDivElement | null>(null);
  const didInitTierScrollRef = useRef(false);

  const scrollTierRowsToEnd = () => {
    const rows = [tierMultiplierRowRef.current, tierLanguagesRowRef.current].filter(Boolean) as HTMLDivElement[];
    for (const el of rows) {
      el.scrollLeft = el.scrollWidth;
    }
  };

  const scrollTierRowsToTier = (tierId: string) => {
    const rows = [tierMultiplierRowRef.current, tierLanguagesRowRef.current].filter(Boolean) as HTMLDivElement[];
    for (const row of rows) {
      const target = row.querySelector(`[data-tier-id="${tierId}"]`) as HTMLElement | null;
      if (!target) continue;
      const desiredLeft = Math.max(0, target.offsetLeft + target.offsetWidth - row.clientWidth);
      row.scrollLeft = desiredLeft;
    }
  };

  // 처음 진입 시에는 tier4까지만 보이게(=tier4가 오른쪽 끝에 오도록) 고정
  useEffect(() => {
    if (didInitTierScrollRef.current) return;
    if (!tiers || tiers.length === 0) return;
    didInitTierScrollRef.current = true;
    const id = window.setTimeout(() => {
      // tier4가 없으면 마지막 티어 기준
      const hasTier4 = tiers.some((t) => t.id === 'tier4');
      if (hasTier4) scrollTierRowsToTier('tier4');
      else scrollTierRowsToEnd();
    }, 0);
    return () => window.clearTimeout(id);
  }, [tiers]);

  const handleRemoveLanguage = (code: string) => {
    if (!window.confirm('이 언어를 목록에서 삭제하시겠습니까?')) return;
    removeLanguage(code);
    setSaved(false);
  };

  const handleChange = (key: keyof PriceSettings, value: number) => {
    updatePrices({ [key]: value });
    setSaved(false);
  };

  const handleChangeRatio = (ratioKey: keyof PriceSettings['translatorRatios'], value: number) => {
    updatePrices({
      translatorRatios: {
        ...translatorRatios,
        [ratioKey]: value,
      },
    });
    setSaved(false);
  };

  const handleChangeEditor = (key: string, value: number) => {
    const editors = { ...(prices.editorPrices || {}) };
    editors[key] = value;
    updatePrices({ editorPrices: editors });
    setSaved(false);
  };

  const handleChangeTuition = (key: string, value: number) => {
    const tuition = { ...(prices.tuitionPrices || {}) };
    tuition[key] = value;
    updatePrices({ tuitionPrices: tuition });
    setSaved(false);
  };

  const handleChangeProofread = (key: string, value: number) => {
    const proofread = { ...(prices.proofreadPrices || {}) };
    proofread[key] = value;
    updatePrices({ proofreadPrices: proofread });
    setSaved(false);
  };

  const handleChangeExhibition = (key: string, value: number) => {
    const ex = { ...(prices.exhibitionPrices || {}) };
    ex[key] = value;
    updatePrices({ exhibitionPrices: ex });
    setSaved(false);
  };

  const handleAddExhibitionRegion = () => {
    const name = window.prompt('지역명을 입력하세요 (예: 서울)');
    if (!name?.trim()) return;
    const key = name.trim();
    const regions = { ...(prices.exhibitionRegions || {}) };
    if (key in regions) {
      alert('이미 등록된 지역입니다.');
      return;
    }
    regions[key] = 0;
    updatePrices({ exhibitionRegions: regions });
    setSaved(false);
  };

  const handleRemoveExhibitionRegion = (name: string) => {
    if (!window.confirm(`"${name}" 지역을 삭제하시겠습니까?`)) return;
    const regions = { ...(prices.exhibitionRegions || {}) };
    delete regions[name];
    updatePrices({ exhibitionRegions: regions });
    setSaved(false);
  };

  const handleChangeExhibitionRegion = (name: string, value: number) => {
    const regions = { ...(prices.exhibitionRegions || {}) };
    regions[name] = value;
    updatePrices({ exhibitionRegions: regions });
    setSaved(false);
  };

  const handleAddExhibitionWork = () => {
    const name = window.prompt('작품명을 입력하세요');
    if (!name?.trim()) return;
    const key = name.trim();
    const works = { ...(prices.exhibitionWorks || {}) };
    if (key in works) {
      alert('이미 등록된 작품입니다.');
      return;
    }
    works[key] = 0;
    updatePrices({ exhibitionWorks: works });
    setSaved(false);
  };

  const handleRemoveExhibitionWork = (name: string) => {
    if (!window.confirm(`"${name}" 작품을 삭제하시겠습니까?`)) return;
    const works = { ...(prices.exhibitionWorks || {}) };
    delete works[name];
    updatePrices({ exhibitionWorks: works });
    setSaved(false);
  };

  const handleChangeExhibitionWork = (name: string, value: number) => {
    const works = { ...(prices.exhibitionWorks || {}) };
    works[name] = value;
    updatePrices({ exhibitionWorks: works });
    setSaved(false);
  };

  const handleChangeExpertReview = (key: string, value: number) => {
    const ex = { ...(prices.expertReviewPrices || {}) };
    ex[key] = value;
    updatePrices({ expertReviewPrices: ex });
    setSaved(false);
  };

  const handleSave = () => {
    alert('가격이 저장되었습니다! (모든 페이지에 반영되었습니다)');
    setSaved(true);
  };

  // 소 카테고리 추가
  const handleAddSmallCategory = (midCategoryKey: string) => {
    const name = window.prompt('소 카테고리 이름을 입력하세요');
    if (!name || !name.trim()) return;
    
    const currentSmall = currentPrices.category_small || {};
    const midCategory = currentSmall[midCategoryKey] || {};
    
    const priceKey = priceTableType === 'client' ? 'clientPrices' : 'translatorPrices';
    updatePrices({
      [priceKey]: {
        category_small: {
          ...currentSmall,
          [midCategoryKey]: {
            ...midCategory,
            [name.trim()]: 0,
          },
        },
      },
    });
    setSaved(false);
  };

  // 소 카테고리 삭제
  const handleRemoveSmallCategory = (midCategoryKey: string, smallCategoryName: string) => {
    if (!window.confirm(`"${smallCategoryName}" 소 카테고리를 삭제하시겠습니까?`)) return;
    
    const currentSmall = currentPrices.category_small || {};
    const midCategory = { ...(currentSmall[midCategoryKey] || {}) };
    delete midCategory[smallCategoryName];
    
    const priceKey = priceTableType === 'client' ? 'clientPrices' : 'translatorPrices';
    updatePrices({
      [priceKey]: {
        category_small: {
          ...currentSmall,
          [midCategoryKey]: midCategory,
        },
      },
    });
    setSaved(false);
  };

  // 소 카테고리 가격 변경
  const handleChangeSmallCategory = (midCategoryKey: string, smallCategoryName: string, value: number) => {
    const currentSmall = currentPrices.category_small || {};
    const midCategory = { ...(currentSmall[midCategoryKey] || {}) };
    midCategory[smallCategoryName] = value;
    
    const priceKey = priceTableType === 'client' ? 'clientPrices' : 'translatorPrices';
    updatePrices({
      [priceKey]: {
        category_small: {
          ...currentSmall,
          [midCategoryKey]: midCategory,
        },
      },
    });
    setSaved(false);
  };

  // 대 카테고리 추가
  const handleAddLargeCategory = () => {
    const name = window.prompt('대 카테고리 이름을 입력하세요');
    if (!name || !name.trim()) return;
    
    const icon = window.prompt('아이콘을 입력하세요 (예: 📹, 🎤)') || '📁';
    const key = `large_${Date.now()}`;
    
    const currentLarge = currentPrices.category_large || {};
    const priceKey = priceTableType === 'client' ? 'clientPrices' : 'translatorPrices';
    updatePrices({
      [priceKey]: {
        category_large: {
          ...currentLarge,
          [key]: {
            name: name.trim(),
            icon: icon.trim(),
            price: 0,
          },
        },
      },
    });
    setSaved(false);
  };

  // 대 카테고리 삭제
  const handleRemoveLargeCategory = (largeKey: string) => {
    if (!window.confirm(`"${currentPrices.category_large[largeKey]?.name}" 대 카테고리를 삭제하시겠습니까? 하위 카테고리도 모두 삭제됩니다.`)) return;
    
    const currentLarge = { ...(currentPrices.category_large || {}) };
    delete currentLarge[largeKey];
    
    // 해당 대 카테고리의 중 카테고리도 삭제
    const currentMid = { ...(currentPrices.category_mid || {}) };
    delete currentMid[largeKey];
    
    // 해당 대 카테고리의 중 카테고리에 속한 소 카테고리도 삭제
    const currentSmall = { ...(currentPrices.category_small || {}) };
    if (currentPrices.category_mid?.[largeKey]) {
      Object.keys(currentPrices.category_mid[largeKey]).forEach((midKey) => {
        delete currentSmall[midKey];
      });
    }
    
    const priceKey = priceTableType === 'client' ? 'clientPrices' : 'translatorPrices';
    updatePrices({
      [priceKey]: {
        category_large: currentLarge,
        category_mid: currentMid,
        category_small: currentSmall,
      },
    });
    
    if (selectedLargeCategory === largeKey) {
      setSelectedLargeCategory(null);
      setSelectedMidCategory(null);
    }
    setSaved(false);
  };

  // 대 카테고리 가격 변경
  const handleChangeLargeCategoryPrice = (largeKey: string, value: number) => {
    const currentLarge = { ...(currentPrices.category_large || {}) };
    if (currentLarge[largeKey]) {
      currentLarge[largeKey] = {
        ...currentLarge[largeKey],
        price: value,
      };
      const priceKey = priceTableType === 'client' ? 'clientPrices' : 'translatorPrices';
      updatePrices({
        [priceKey]: {
          category_large: currentLarge,
        },
      });
      setSaved(false);
    }
  };

  // 중 카테고리 추가
  const handleAddMidCategory = (largeKey: string) => {
    const name = window.prompt('중 카테고리 이름을 입력하세요');
    if (!name || !name.trim()) return;
    
    const key = `mid_${largeKey}_${Date.now()}`;
    const currentMid = currentPrices.category_mid || {};
    const largeMid = currentMid[largeKey] || {};
    
    const priceKey = priceTableType === 'client' ? 'clientPrices' : 'translatorPrices';
    updatePrices({
      [priceKey]: {
        category_mid: {
          ...currentMid,
          [largeKey]: {
            ...largeMid,
            [key]: {
              name: name.trim(),
              price: 0,
            },
          },
        },
      },
    });
    setSaved(false);
  };

  // 중 카테고리 삭제
  const handleRemoveMidCategory = (largeKey: string, midKey: string) => {
    if (!window.confirm(`"${currentPrices.category_mid[largeKey]?.[midKey]?.name}" 중 카테고리를 삭제하시겠습니까? 하위 소 카테고리도 모두 삭제됩니다.`)) return;
    
    const currentMid = { ...(currentPrices.category_mid || {}) };
    const largeMid = { ...(currentMid[largeKey] || {}) };
    delete largeMid[midKey];
    currentMid[largeKey] = largeMid;
    
    // 해당 중 카테고리의 소 카테고리도 삭제
    const currentSmall = { ...(currentPrices.category_small || {}) };
    delete currentSmall[midKey];
    
    const priceKey = priceTableType === 'client' ? 'clientPrices' : 'translatorPrices';
    updatePrices({
      [priceKey]: {
        category_mid: currentMid,
        category_small: currentSmall,
      },
    });
    
    if (selectedMidCategory === midKey) {
      setSelectedMidCategory(null);
    }
    setSaved(false);
  };

  // 중 카테고리 가격 변경
  const handleChangeMidCategoryPrice = (largeKey: string, midKey: string, value: number) => {
    const currentMid = { ...(currentPrices.category_mid || {}) };
    const largeMid = { ...(currentMid[largeKey] || {}) };
    if (largeMid[midKey]) {
      largeMid[midKey] = {
        ...largeMid[midKey],
        price: value,
      };
      currentMid[largeKey] = largeMid;
      const priceKey = priceTableType === 'client' ? 'clientPrices' : 'translatorPrices';
      updatePrices({
        [priceKey]: {
          category_mid: currentMid,
        },
      });
      setSaved(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/hutechc-homepage/admin/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">
            ← 관리자 대시보드
          </Link>
          <div className="text-2xl font-bold">가격 및 요금 관리</div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">가격 설정</h1>
            <p className="text-gray-600">번역 서비스의 모든 가격을 관리하세요</p>
          </div>
          <Link to="/hutechc-homepage/admin/payment-settlement"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            결제정산페이지 가기 →
          </Link>
        </div>

        {/* 가격표 타입 선택 탭 (한 줄) */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-medium text-gray-700 shrink-0">가격표 타입:</span>
            <div className="flex gap-2 flex-nowrap overflow-x-auto min-w-0 pb-0.5">
              {(Object.keys(PRICE_TABLE_TYPE_LABELS) as PriceTableType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setPriceTableType(type);
                    setSelectedLargeCategory(null);
                    setSelectedMidCategory(null);
                  }}
                  className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    priceTableType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {PRICE_TABLE_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {isPlaceholderType ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600 mb-2">
                <strong className="text-gray-900">{PRICE_TABLE_TYPE_LABELS[priceTableType]}</strong> 설정 화면 준비 중입니다.
              </p>
              <p className="text-sm text-gray-500">항목 구성이 확정되면 곧 추가될 예정입니다.</p>
            </div>
          ) : priceTableType === 'editor' ? (
            <>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b">
                  에디터비 설정 (₩)
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  에디터 유형별 단가를 입력하세요.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {EDITOR_ITEMS.map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={prices.editorPrices?.[key] ?? 0}
                        onChange={(e) => handleChangeEditor(key, Number(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  💾 가격 저장
                </button>
                {saved && (
                  <div className="text-green-600 font-semibold flex items-center gap-2">
                    ✅ 저장되었습니다
                  </div>
                )}
              </div>
            </>
          ) : priceTableType === 'tuition-proofread-exhibition' ? (
            <div className="space-y-3">
              {/* 공통 박스 */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-base font-bold text-gray-900 mb-2 pb-2 border-b">
                  공통 설정
                </h2>
                <div className="flex gap-1.5 overflow-x-auto pb-2 -mr-3 pr-3">
                  {/* 2. 전문 분야별 추가 요금 */}
                  <div className="shrink-0 flex-1 min-w-[200px] bg-gray-50 rounded border border-gray-200 p-2">
                    <h3 className="text-xs font-semibold text-gray-800 mb-2">2️⃣ 전문 분야별 (₩/단어)</h3>
                    <div className="space-y-1.5">
                      {[
                        { key: 'marketing', label: '마케팅' },
                        { key: 'law', label: '법률' },
                        { key: 'tech', label: '기술/IT' },
                        { key: 'academic', label: '학술/논문' },
                        { key: 'medical', label: '의료/제약' },
                        { key: 'finance', label: '금융' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs text-gray-700 mb-0.5">{label}</label>
                          <input
                            type="number"
                            value={prices[key as keyof PriceSettings] as number}
                            onChange={(e) => handleChange(key as keyof PriceSettings, Number(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. 긴급도별 할증 */}
                  <div className="shrink-0 flex-1 min-w-[160px] bg-gray-50 rounded border border-gray-200 p-2">
                    <h3 className="text-xs font-semibold text-gray-800 mb-2">3️⃣ 긴급도 할증 (%)</h3>
                    <div className="space-y-1.5">
                      <div>
                        <label className="block text-xs text-gray-700 mb-0.5">긴급1 (3일)</label>
                        <input
                          type="number"
                          value={prices.urgent1}
                          onChange={(e) => handleChange('urgent1', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-0.5">긴급2 (1일)</label>
                        <input
                          type="number"
                          value={prices.urgent2}
                          onChange={(e) => handleChange('urgent2', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. 매칭 방법별 추가 요금 */}
                  <div className="shrink-0 flex-1 min-w-[180px] bg-gray-50 rounded border border-gray-200 p-2">
                    <h3 className="text-xs font-semibold text-gray-800 mb-2">4️⃣ 매칭 방법별</h3>
                    <div className="space-y-1.5">
                      {[
                        { key: 'match_direct', label: '직접 찾기' },
                        { key: 'match_request', label: '매칭 요청' },
                        { key: 'match_auto', label: '자동 매칭' },
                        { key: 'match_corporate', label: '기타(기업)' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs text-gray-700 mb-0.5">{label}</label>
                          <input
                            type="number"
                            value={prices[key as keyof PriceSettings] as number}
                            onChange={(e) => handleChange(key as keyof PriceSettings, Number(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. 결제 분류별 단가 */}
                  <div className="shrink-0 flex-1 min-w-[160px] bg-gray-50 rounded border border-gray-200 p-2">
                    <h3 className="text-xs font-semibold text-gray-800 mb-2">5️⃣ 결제 분류별 (₩/글자)</h3>
                    <div className="space-y-1.5">
                      {[
                        { key: 'payment_point_per_char', label: '포인트' },
                        { key: 'payment_subscribe_per_char', label: '구독' },
                        { key: 'payment_oneoff_per_char', label: '1회 결제' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs text-gray-700 mb-0.5">{label}</label>
                          <input
                            type="number"
                            value={prices[key as keyof PriceSettings] as number}
                            onChange={(e) => handleChange(key as keyof PriceSettings, Number(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 6. 결제 내용별 금액 */}
                  <div className="shrink-0 flex-1 min-w-[200px] bg-gray-50 rounded border border-gray-200 p-2">
                    <h3 className="text-xs font-semibold text-gray-800 mb-2">6️⃣ 결제 내용별 (₩)</h3>
                    <div className="space-y-1.5">
                      {[
                        { key: 'payment_point_charge', label: '포인트 충전' },
                        { key: 'payment_basic_sub', label: '베이직 구독' },
                        { key: 'payment_standard_sub', label: '스탠다드 구독' },
                        { key: 'payment_premium_sub', label: '프리미엄 구독' },
                        { key: 'payment_service_use', label: '서비스 이용' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs text-gray-700 mb-0.5">{label}</label>
                          <input
                            type="number"
                            value={prices[key as keyof PriceSettings] as number}
                            onChange={(e) => handleChange(key as keyof PriceSettings, Number(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 7. 카테고리별 추가 요금 */}
                <div className="bg-gray-50 rounded border border-gray-200 p-2 mt-2 w-full">
                    <h3 className="text-xs font-semibold text-gray-800 mb-2">7️⃣ 카테고리별 (₩/단어 또는 %)</h3>
                    <p className="text-xs text-gray-600 mb-2">대 → 중 → 소 카테고리 선택</p>
                    <div className="flex gap-2 h-[200px] border border-gray-200 rounded overflow-hidden">
                      {/* 왼쪽: 대 카테고리 */}
                      <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
                        <div className="p-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-gray-900">대</h4>
                          <button
                            onClick={() => {
                              const name = window.prompt('대 카테고리 이름을 입력하세요');
                              if (!name || !name.trim()) return;
                              const icon = window.prompt('아이콘을 입력하세요 (예: 📹, 🎤)') || '📁';
                              const key = `large_${Date.now()}`;
                              const currentLarge = prices.clientPrices.category_large || {};
                              updatePrices({
                                clientPrices: {
                                  category_large: {
                                    ...currentLarge,
                                    [key]: {
                                      name: name.trim(),
                                      icon: icon.trim(),
                                      price: 0,
                                    },
                                  },
                                  category_mid: prices.clientPrices.category_mid || {},
                                  category_small: prices.clientPrices.category_small || {},
                                },
                              });
                              setSaved(false);
                            }}
                            className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          {prices.clientPrices.category_large && Object.keys(prices.clientPrices.category_large).length > 0 ? (
                            Object.entries(prices.clientPrices.category_large).map(([key, category]) => (
                              <div
                                key={key}
                                className={`p-2 border-b border-gray-200 cursor-pointer text-xs transition-colors ${
                                  selectedLargeCategory === key
                                    ? 'bg-blue-100 border-blue-300'
                                    : 'bg-white hover:bg-gray-50'
                                }`}
                                onClick={() => {
                                  setSelectedLargeCategory(key);
                                  setSelectedMidCategory(null);
                                }}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="font-medium text-gray-900 truncate">
                                    {category.icon} {category.name}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!window.confirm(`"${category.name}" 대 카테고리를 삭제하시겠습니까? 하위 카테고리도 모두 삭제됩니다.`)) return;
                                      const currentLarge = { ...(prices.clientPrices.category_large || {}) };
                                      delete currentLarge[key];
                                      const currentMid = { ...(prices.clientPrices.category_mid || {}) };
                                      delete currentMid[key];
                                      const currentSmall = { ...(prices.clientPrices.category_small || {}) };
                                      if (prices.clientPrices.category_mid?.[key]) {
                                        Object.keys(prices.clientPrices.category_mid[key]).forEach((midKey) => {
                                          delete currentSmall[midKey];
                                        });
                                      }
                                      updatePrices({
                                        clientPrices: {
                                          category_large: currentLarge,
                                          category_mid: currentMid,
                                          category_small: currentSmall,
                                        },
                                      });
                                      if (selectedLargeCategory === key) {
                                        setSelectedLargeCategory(null);
                                        setSelectedMidCategory(null);
                                      }
                                      setSaved(false);
                                    }}
                                    className="text-xs text-red-600 hover:text-red-800 shrink-0"
                                  >
                                    ×
                                  </button>
                                </div>
                                <input
                                  type="number"
                                  value={category.price}
                                  onChange={(e) => {
                                    const currentLarge = { ...(prices.clientPrices.category_large || {}) };
                                    if (currentLarge[key]) {
                                      currentLarge[key] = {
                                        ...currentLarge[key],
                                        price: Number(e.target.value),
                                      };
                                      updatePrices({
                                        clientPrices: {
                                          category_large: currentLarge,
                                          category_mid: prices.clientPrices.category_mid || {},
                                          category_small: prices.clientPrices.category_small || {},
                                        },
                                      });
                                      setSaved(false);
                                    }
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="가격"
                                />
                              </div>
                            ))
                          ) : (
                            <div className="p-2 text-xs text-gray-500 text-center">대 카테고리 없음</div>
                          )}
                        </div>
                      </div>

                      {/* 중간: 중 카테고리 */}
                      <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
                        <div className="p-2 border-b border-gray-200 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-gray-900">중</h4>
                            {selectedLargeCategory && (
                              <button
                                onClick={() => {
                                  const name = window.prompt('중 카테고리 이름을 입력하세요');
                                  if (!name || !name.trim()) return;
                                  const midKey = `mid_${selectedLargeCategory}_${Date.now()}`;
                                  const currentMid = prices.clientPrices.category_mid || {};
                                  const largeMid = currentMid[selectedLargeCategory] || {};
                                  updatePrices({
                                    clientPrices: {
                                      category_large: prices.clientPrices.category_large || {},
                                      category_mid: {
                                        ...currentMid,
                                        [selectedLargeCategory]: {
                                          ...largeMid,
                                          [midKey]: {
                                            name: name.trim(),
                                            price: 0,
                                          },
                                        },
                                      },
                                      category_small: prices.clientPrices.category_small || {},
                                    },
                                  });
                                  setSaved(false);
                                }}
                                className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          {!selectedLargeCategory ? (
                            <div className="p-2 text-xs text-gray-500 text-center">대 카테고리 선택</div>
                          ) : prices.clientPrices.category_mid?.[selectedLargeCategory] && Object.keys(prices.clientPrices.category_mid[selectedLargeCategory]).length > 0 ? (
                            Object.entries(prices.clientPrices.category_mid[selectedLargeCategory]).map(([key, category]) => (
                              <div
                                key={key}
                                className={`p-2 border-b border-gray-200 cursor-pointer text-xs transition-colors ${
                                  selectedMidCategory === key
                                    ? 'bg-blue-100 border-blue-300'
                                    : 'bg-white hover:bg-gray-50'
                                }`}
                                onClick={() => setSelectedMidCategory(key)}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="font-medium text-gray-900 truncate">{category.name}</div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!window.confirm(`"${category.name}" 중 카테고리를 삭제하시겠습니까? 하위 소 카테고리도 모두 삭제됩니다.`)) return;
                                      const currentMid = { ...(prices.clientPrices.category_mid || {}) };
                                      const largeMid = { ...(currentMid[selectedLargeCategory] || {}) };
                                      delete largeMid[key];
                                      currentMid[selectedLargeCategory] = largeMid;
                                      const currentSmall = { ...(prices.clientPrices.category_small || {}) };
                                      delete currentSmall[key];
                                      updatePrices({
                                        clientPrices: {
                                          category_large: prices.clientPrices.category_large || {},
                                          category_mid: currentMid,
                                          category_small: currentSmall,
                                        },
                                      });
                                      if (selectedMidCategory === key) {
                                        setSelectedMidCategory(null);
                                      }
                                      setSaved(false);
                                    }}
                                    className="text-xs text-red-600 hover:text-red-800 shrink-0"
                                  >
                                    ×
                                  </button>
                                </div>
                                <input
                                  type="number"
                                  value={category.price}
                                  onChange={(e) => {
                                    const currentMid = { ...(prices.clientPrices.category_mid || {}) };
                                    const largeMid = { ...(currentMid[selectedLargeCategory] || {}) };
                                    if (largeMid[key]) {
                                      largeMid[key] = {
                                        ...largeMid[key],
                                        price: Number(e.target.value),
                                      };
                                      currentMid[selectedLargeCategory] = largeMid;
                                      updatePrices({
                                        clientPrices: {
                                          category_large: prices.clientPrices.category_large || {},
                                          category_mid: currentMid,
                                          category_small: prices.clientPrices.category_small || {},
                                        },
                                      });
                                      setSaved(false);
                                    }
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="추가 가격"
                                />
                              </div>
                            ))
                          ) : (
                            <div className="p-2 text-xs text-gray-500 text-center">중 카테고리 없음</div>
                          )}
                        </div>
                      </div>

                      {/* 오른쪽: 소 카테고리 */}
                      <div className="w-1/3 bg-white flex flex-col">
                        <div className="p-2 border-b border-gray-200 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-gray-900">소</h4>
                            {selectedMidCategory && (
                              <button
                                onClick={() => {
                                  const name = window.prompt('소 카테고리 이름을 입력하세요');
                                  if (!name || !name.trim()) return;
                                  const currentSmall = prices.clientPrices.category_small || {};
                                  const midCategory = currentSmall[selectedMidCategory] || {};
                                  updatePrices({
                                    clientPrices: {
                                      category_large: prices.clientPrices.category_large || {},
                                      category_mid: prices.clientPrices.category_mid || {},
                                      category_small: {
                                        ...currentSmall,
                                        [selectedMidCategory]: {
                                          ...midCategory,
                                          [name.trim()]: 0,
                                        },
                                      },
                                    },
                                  });
                                  setSaved(false);
                                }}
                                className="px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          {!selectedMidCategory ? (
                            <div className="p-2 text-xs text-gray-500 text-center">중 카테고리 선택</div>
                          ) : (
                            <div className="p-2 space-y-1.5">
                              {prices.clientPrices.category_small?.[selectedMidCategory] && Object.keys(prices.clientPrices.category_small[selectedMidCategory]).length > 0 ? (
                                Object.entries(prices.clientPrices.category_small[selectedMidCategory]).map(([smallName, smallPrice]) => (
                                  <div key={smallName} className="bg-white border border-gray-200 rounded p-1.5">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="font-medium text-xs text-gray-900 truncate">{smallName}</div>
                                      <button
                                        onClick={() => {
                                          if (!window.confirm(`"${smallName}" 소 카테고리를 삭제하시겠습니까?`)) return;
                                          const currentSmall = { ...(prices.clientPrices.category_small || {}) };
                                          const midCategory = { ...(currentSmall[selectedMidCategory] || {}) };
                                          delete midCategory[smallName];
                                          currentSmall[selectedMidCategory] = midCategory;
                                          updatePrices({
                                            clientPrices: {
                                              category_large: prices.clientPrices.category_large || {},
                                              category_mid: prices.clientPrices.category_mid || {},
                                              category_small: currentSmall,
                                            },
                                          });
                                          setSaved(false);
                                        }}
                                        className="text-xs text-red-600 hover:text-red-800 shrink-0"
                                      >
                                        ×
                                      </button>
                                    </div>
                                    <input
                                      type="number"
                                      value={smallPrice}
                                      onChange={(e) => {
                                        const currentSmall = { ...(prices.clientPrices.category_small || {}) };
                                        const midCategory = { ...(currentSmall[selectedMidCategory] || {}) };
                                        midCategory[smallName] = Number(e.target.value);
                                        currentSmall[selectedMidCategory] = midCategory;
                                        updatePrices({
                                          clientPrices: {
                                            category_large: prices.clientPrices.category_large || {},
                                            category_mid: prices.clientPrices.category_mid || {},
                                            category_small: currentSmall,
                                          },
                                        });
                                        setSaved(false);
                                      }}
                                      className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      placeholder="가격"
                                    />
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-gray-500 text-center py-4">소 카테고리 없음</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* 공통 가격 설정 요약 */}
              <div className="bg-gray-50 rounded border border-gray-200 py-1.5 px-1.5 mt-2">
                <h3 className="text-xs font-semibold text-gray-800 mb-1">공통 가격 설정 요약</h3>
                <div className="space-y-0.5 text-xs">
                  <div className="text-gray-900">
                    <span className="text-gray-600">2️⃣ 전문분야:</span> 마케팅 ₩{prices.marketing} | 법률 ₩{prices.law} | 기술/IT ₩{prices.tech} | 학술 ₩{prices.academic} | 의료 ₩{prices.medical} | 금융 ₩{prices.finance}
                  </div>
                  <div className="text-gray-900">
                    <span className="text-gray-600">3️⃣ 긴급도:</span> 긴급1 {prices.urgent1}% | 긴급2 {prices.urgent2}%
                  </div>
                  <div className="text-gray-900">
                    <span className="text-gray-600">4️⃣ 매칭:</span> 직접찾기 {prices.match_direct} | 매칭요청 {prices.match_request} | 자동매칭 {prices.match_auto} | 기업 {prices.match_corporate}
                  </div>
                  <div className="text-gray-900">
                    <span className="text-gray-600">5️⃣ 결제분류:</span> 포인트 ₩{prices.payment_point_per_char}/글자 | 구독 ₩{prices.payment_subscribe_per_char}/글자 | 1회결제 ₩{prices.payment_oneoff_per_char}/글자
                  </div>
                  <div className="text-gray-900">
                    <span className="text-gray-600">6️⃣ 결제내용:</span> 포인트충전 ₩{prices.payment_point_charge} | 베이직 ₩{prices.payment_basic_sub} | 스탠다드 ₩{prices.payment_standard_sub} | 프리미엄 ₩{prices.payment_premium_sub} | 서비스이용 ₩{prices.payment_service_use}
                  </div>
                  <div className="pt-1 mt-1 border-t border-gray-300">
                    <span className="text-gray-600 font-semibold">전체 가격 산정:</span>
                    <span className="text-gray-900 font-bold ml-1">
                      전문분야 합계 ₩{prices.marketing + prices.law + prices.tech + prices.academic + prices.medical + prices.finance} | 
                      긴급도 할증 {prices.urgent1}% / {prices.urgent2}% | 
                      매칭 합계 {prices.match_direct + prices.match_request + prices.match_auto + prices.match_corporate} | 
                      결제분류 합계 ₩{prices.payment_point_per_char + prices.payment_subscribe_per_char + prices.payment_oneoff_per_char}/글자 | 
                      결제내용 합계 ₩{prices.payment_point_charge + prices.payment_basic_sub + prices.payment_standard_sub + prices.payment_premium_sub + prices.payment_service_use}
                    </span>
                  </div>
                </div>
              </div>

              {/* 수업료, 통독, 전시회 박스 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* 수업료 블록 */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-base font-bold text-gray-900 mb-2 pb-2 border-b">
                  수업료 설정 (₩)
                </h2>
                <div className="space-y-2">
                  {TUITION_ITEMS.map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {label}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={prices.tuitionPrices?.[key] ?? 0}
                        onChange={(e) => handleChangeTuition(key, Number(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
                {/* 수업료 가격 미리보기 */}
                <div className="mt-3 pt-3 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded border border-purple-200 p-2">
                  <h3 className="text-xs font-bold text-gray-900 mb-1.5">📊 현재 가격표 미리보기</h3>
                  <div className="space-y-1 text-xs">
                    <div className="text-gray-700">
                      <span className="font-semibold">수업료 가격:</span> 테솔 ₩{prices.tuitionPrices?.tuition_tesol || 0} | 프롬프트 ₩{prices.tuitionPrices?.tuition_prompt || 0} | AI통번역 ₩{prices.tuitionPrices?.tuition_ai_translation || 0} | ITT시험 ₩{prices.tuitionPrices?.tuition_itt_exam || 0} | 윤리 ₩{prices.tuitionPrices?.tuition_ethics || 0}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-semibold">공통 적용 가격:</span> 전문분야 합계 ₩{prices.marketing + prices.law + prices.tech + prices.academic + prices.medical + prices.finance} | 긴급도 {prices.urgent1}%/{prices.urgent2}% | 매칭 합계 {prices.match_direct + prices.match_request + prices.match_auto + prices.match_corporate} | 결제분류 합계 ₩{prices.payment_point_per_char + prices.payment_subscribe_per_char + prices.payment_oneoff_per_char} | 결제내용 합계 ₩{prices.payment_point_charge + prices.payment_basic_sub + prices.payment_standard_sub + prices.payment_premium_sub + prices.payment_service_use}
                    </div>
                    <div className="text-purple-700 font-bold">
                      <span>최종 가격:</span> 수업료 합계 ₩{(prices.tuitionPrices?.tuition_tesol || 0) + (prices.tuitionPrices?.tuition_prompt || 0) + (prices.tuitionPrices?.tuition_ai_translation || 0) + (prices.tuitionPrices?.tuition_itt_exam || 0) + (prices.tuitionPrices?.tuition_ethics || 0)} + 공통 적용 합계 ₩{(prices.marketing + prices.law + prices.tech + prices.academic + prices.medical + prices.finance) + (prices.match_direct + prices.match_request + prices.match_auto + prices.match_corporate) + (prices.payment_point_per_char + prices.payment_subscribe_per_char + prices.payment_oneoff_per_char) + (prices.payment_point_charge + prices.payment_basic_sub + prices.payment_standard_sub + prices.payment_premium_sub + prices.payment_service_use)} = ₩{((prices.tuitionPrices?.tuition_tesol || 0) + (prices.tuitionPrices?.tuition_prompt || 0) + (prices.tuitionPrices?.tuition_ai_translation || 0) + (prices.tuitionPrices?.tuition_itt_exam || 0) + (prices.tuitionPrices?.tuition_ethics || 0)) + ((prices.marketing + prices.law + prices.tech + prices.academic + prices.medical + prices.finance) + (prices.match_direct + prices.match_request + prices.match_auto + prices.match_corporate) + (prices.payment_point_per_char + prices.payment_subscribe_per_char + prices.payment_oneoff_per_char) + (prices.payment_point_charge + prices.payment_basic_sub + prices.payment_standard_sub + prices.payment_premium_sub + prices.payment_service_use))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 통독 블록 */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-base font-bold text-gray-900 mb-2 pb-2 border-b">
                  통독 설정 (₩)
                </h2>
                <div className="space-y-1.5">
                  {PROOFREAD_ITEMS.filter(({ group }) => !group).map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <label className="text-xs font-medium text-gray-700 shrink-0 w-24">
                        {label}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={prices.proofreadPrices?.[key] ?? 0}
                        onChange={(e) => handleChangeProofread(key, Number(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 text-right"
                        placeholder="0"
                      />
                    </div>
                  ))}
                  <div className="pt-1.5 mt-1.5 border-t border-gray-200">
                    <div className="text-xs font-semibold text-gray-700 mb-1.5">4. 문서판매</div>
                    {PROOFREAD_ITEMS.filter(({ group }) => group).map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between gap-2 mb-1.5">
                        <label className="text-xs font-medium text-gray-700 shrink-0 w-28">
                          {label}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={prices.proofreadPrices?.[key] ?? 0}
                          onChange={(e) => handleChangeProofread(key, Number(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 text-right"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* 통독 가격 미리보기 */}
                <div className="mt-3 pt-3 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded border border-purple-200 p-2">
                  <h3 className="text-xs font-bold text-gray-900 mb-1.5">📊 현재 가격표 미리보기</h3>
                  <div className="space-y-1 text-xs">
                    <div className="text-gray-700">
                      <span className="font-semibold">통독 가격:</span> 문서사용 ₩{prices.proofreadPrices?.proofread_doc_use || 0} | 문서제공 ₩{prices.proofreadPrices?.proofread_doc_provide || 0} | 전문가 의뢰비 ₩{prices.proofreadPrices?.proofread_expert_request || 0} | 일반 문서 판매 ₩{prices.proofreadPrices?.proofread_doc_sale_general || 0} | 전문가 문서 판매 ₩{prices.proofreadPrices?.proofread_doc_sale_expert || 0}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-semibold">공통 적용 가격:</span> 전문분야 합계 ₩{prices.marketing + prices.law + prices.tech + prices.academic + prices.medical + prices.finance} | 긴급도 {prices.urgent1}%/{prices.urgent2}% | 매칭 합계 {prices.match_direct + prices.match_request + prices.match_auto + prices.match_corporate} | 결제분류 합계 ₩{prices.payment_point_per_char + prices.payment_subscribe_per_char + prices.payment_oneoff_per_char} | 결제내용 합계 ₩{prices.payment_point_charge + prices.payment_basic_sub + prices.payment_standard_sub + prices.payment_premium_sub + prices.payment_service_use}
                    </div>
                    <div className="text-purple-700 font-bold">
                      <span>최종 가격:</span> 통독 합계 ₩{(prices.proofreadPrices?.proofread_doc_use || 0) + (prices.proofreadPrices?.proofread_doc_provide || 0) + (prices.proofreadPrices?.proofread_expert_request || 0) + (prices.proofreadPrices?.proofread_doc_sale_general || 0) + (prices.proofreadPrices?.proofread_doc_sale_expert || 0)} + 공통 적용 합계 ₩{(prices.marketing + prices.law + prices.tech + prices.academic + prices.medical + prices.finance) + (prices.match_direct + prices.match_request + prices.match_auto + prices.match_corporate) + (prices.payment_point_per_char + prices.payment_subscribe_per_char + prices.payment_oneoff_per_char) + (prices.payment_point_charge + prices.payment_basic_sub + prices.payment_standard_sub + prices.payment_premium_sub + prices.payment_service_use)} = ₩{((prices.proofreadPrices?.proofread_doc_use || 0) + (prices.proofreadPrices?.proofread_doc_provide || 0) + (prices.proofreadPrices?.proofread_expert_request || 0) + (prices.proofreadPrices?.proofread_doc_sale_general || 0) + (prices.proofreadPrices?.proofread_doc_sale_expert || 0)) + ((prices.marketing + prices.law + prices.tech + prices.academic + prices.medical + prices.finance) + (prices.match_direct + prices.match_request + prices.match_auto + prices.match_corporate) + (prices.payment_point_per_char + prices.payment_subscribe_per_char + prices.payment_oneoff_per_char) + (prices.payment_point_charge + prices.payment_basic_sub + prices.payment_standard_sub + prices.payment_premium_sub + prices.payment_service_use))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 전시회 블록 */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-base font-bold text-gray-900 mb-2 pb-2 border-b">
                  전시회 설정 (₩)
                </h2>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {EXHIBITION_ITEMS.map(({ key, label }) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-700">{label}</label>
                      <input
                        type="number"
                        min={0}
                        value={prices.exhibitionPrices?.[key] ?? 0}
                        onChange={(e) => handleChangeExhibition(key, Number(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 text-right"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs font-semibold text-gray-800 mb-2">6. 지역별 · 작품별</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded border border-gray-200 p-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-700">지역별</span>
                        <button
                          type="button"
                          onClick={handleAddExhibitionRegion}
                          className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          + 추가
                        </button>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {Object.keys(prices.exhibitionRegions || {}).length === 0 ? (
                          <div className="text-xs text-gray-500 py-2 text-center">지역을 추가하세요</div>
                        ) : (
                          Object.entries(prices.exhibitionRegions || {}).map(([name, val]) => (
                            <div key={name} className="flex items-center gap-1">
                              <span className="text-xs text-gray-700 shrink-0 w-16 truncate" title={name}>{name}</span>
                              <input
                                type="number"
                                min={0}
                                value={val}
                                onChange={(e) => handleChangeExhibitionRegion(name, Number(e.target.value) || 0)}
                                className="flex-1 min-w-0 px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 text-right"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveExhibitionRegion(name)}
                                className="shrink-0 text-xs text-red-600 hover:text-red-800"
                              >
                                삭제
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded border border-gray-200 p-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-700">작품별</span>
                        <button
                          type="button"
                          onClick={handleAddExhibitionWork}
                          className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          + 추가
                        </button>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {Object.keys(prices.exhibitionWorks || {}).length === 0 ? (
                          <div className="text-xs text-gray-500 py-2 text-center">작품을 추가하세요</div>
                        ) : (
                          Object.entries(prices.exhibitionWorks || {}).map(([name, val]) => (
                            <div key={name} className="flex items-center gap-1">
                              <span className="text-xs text-gray-700 shrink-0 w-16 truncate" title={name}>{name}</span>
                              <input
                                type="number"
                                min={0}
                                value={val}
                                onChange={(e) => handleChangeExhibitionWork(name, Number(e.target.value) || 0)}
                                className="flex-1 min-w-0 px-1.5 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 text-right"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveExhibitionWork(name)}
                                className="shrink-0 text-xs text-red-600 hover:text-red-800"
                              >
                                삭제
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* 전시회 가격 미리보기 */}
                <div className="mt-3 pt-3 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded border border-purple-200 p-2">
                  <h3 className="text-xs font-bold text-gray-900 mb-1.5">📊 현재 가격표 미리보기</h3>
                  <div className="space-y-1 text-xs">
                    <div className="text-gray-700">
                      <span className="font-semibold">전시회 가격:</span> 사용료 ₩{prices.exhibitionPrices?.exhibition_usage || 0} | 영상 ₩{prices.exhibitionPrices?.exhibition_video || 0} | 음성 ₩{prices.exhibitionPrices?.exhibition_voice || 0} | 텍스트 ₩{prices.exhibitionPrices?.exhibition_text || 0} | 다운 ₩{prices.exhibitionPrices?.exhibition_down || 0}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-semibold">공통 적용 가격:</span> 전문분야 합계 ₩{prices.marketing + prices.law + prices.tech + prices.academic + prices.medical + prices.finance} | 긴급도 {prices.urgent1}%/{prices.urgent2}% | 매칭 합계 {prices.match_direct + prices.match_request + prices.match_auto + prices.match_corporate} | 결제분류 합계 ₩{prices.payment_point_per_char + prices.payment_subscribe_per_char + prices.payment_oneoff_per_char} | 결제내용 합계 ₩{prices.payment_point_charge + prices.payment_basic_sub + prices.payment_standard_sub + prices.payment_premium_sub + prices.payment_service_use}
                    </div>
                    <div className="text-purple-700 font-bold">
                      <span>최종 가격:</span> 전시회 합계 ₩{(prices.exhibitionPrices?.exhibition_usage || 0) + (prices.exhibitionPrices?.exhibition_video || 0) + (prices.exhibitionPrices?.exhibition_voice || 0) + (prices.exhibitionPrices?.exhibition_text || 0) + (prices.exhibitionPrices?.exhibition_down || 0)} + 공통 적용 합계 ₩{(prices.marketing + prices.law + prices.tech + prices.academic + prices.medical + prices.finance) + (prices.match_direct + prices.match_request + prices.match_auto + prices.match_corporate) + (prices.payment_point_per_char + prices.payment_subscribe_per_char + prices.payment_oneoff_per_char) + (prices.payment_point_charge + prices.payment_basic_sub + prices.payment_standard_sub + prices.payment_premium_sub + prices.payment_service_use)} = ₩{((prices.exhibitionPrices?.exhibition_usage || 0) + (prices.exhibitionPrices?.exhibition_video || 0) + (prices.exhibitionPrices?.exhibition_voice || 0) + (prices.exhibitionPrices?.exhibition_text || 0) + (prices.exhibitionPrices?.exhibition_down || 0)) + ((prices.marketing + prices.law + prices.tech + prices.academic + prices.medical + prices.finance) + (prices.match_direct + prices.match_request + prices.match_auto + prices.match_corporate) + (prices.payment_point_per_char + prices.payment_subscribe_per_char + prices.payment_oneoff_per_char) + (prices.payment_point_charge + prices.payment_basic_sub + prices.payment_standard_sub + prices.payment_premium_sub + prices.payment_service_use))}
                    </div>
                  </div>
                </div>
              </div>
              </div>
              <div className="flex gap-2 justify-end mt-3">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-purple-600 text-white rounded text-sm font-semibold hover:bg-purple-700 transition-colors"
                >
                  💾 가격 저장
                </button>
                {saved && (
                  <div className="text-green-600 font-semibold text-sm flex items-center gap-1">
                    ✅ 저장되었습니다
                  </div>
                )}
              </div>
            </div>
          ) : priceTableType === 'expert-review' ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b">
                  전문가 감수비용측정 (₩)
                </h2>
                <div className="flex flex-nowrap gap-4 overflow-x-auto min-w-0 pb-1">
                  {EXPERT_REVIEW_ITEMS.map(({ key, label }) => (
                    <div
                      key={key}
                      className="shrink-0 flex flex-col gap-1.5 w-28"
                    >
                      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        {label}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={prices.expertReviewPrices?.[key] ?? 0}
                        onChange={(e) => handleChangeExpertReview(key, Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-right"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  💾 가격 저장
                </button>
                {saved && (
                  <div className="text-green-600 font-semibold flex items-center gap-2">
                    ✅ 저장되었습니다
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
          {/* 0. 언어 / 티어 설정 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b">
              0️⃣ 언어 및 티어 설정
            </h2>

            {/* 티어별 계수 */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">티어별 계수 (가격 배수)</h3>
              <div
                ref={tierMultiplierRowRef}
                className="flex flex-nowrap gap-3 overflow-x-auto min-w-0 pb-1 text-sm"
              >
                {tiers.map((t) => (
                  <div
                    key={t.id}
                    data-tier-id={t.id}
                    className="shrink-0 w-44 bg-gray-50 rounded-lg border border-gray-200 p-3"
                  >
                    <div className="text-xs text-gray-600 mb-1">{t.label}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">×</span>
                      <input
                        type="number"
                        step="0.1"
                        min={0.1}
                        value={tierMultipliers[t.id] ?? 1}
                        onChange={(e) => {
                          updateTierMultiplier(t.id, Number(e.target.value));
                          setSaved(false);
                        }}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 언어별 티어 및 사용 여부 (티어별 박스) */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="font-semibold text-gray-900">티어별 언어 구성</h3>
                <button
                  type="button"
                  onClick={() => {
                    addTier();
                    setSaved(false);
                    // 티어 추가 시에는 새로 추가된 티어가 보이도록 오른쪽으로 이동
                    window.setTimeout(() => {
                      scrollTierRowsToEnd();
                    }, 0);
                  }}
                  className="px-3 py-1.5 rounded-md bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700"
                >
                  티어 추가
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                각 티어 박스에서 언어를 추가/삭제하고, 사용 여부를 설정할 수 있습니다.
              </p>

              <div
                ref={tierLanguagesRowRef}
                className="flex flex-nowrap gap-3 overflow-x-auto min-w-0 pb-1"
              >
                {tiers.map((t) => {
                  const tier = t.id;
                  const tierLanguages = languages.filter((l) => l.tier === tier);
                  return (
                    <div
                      key={tier}
                      data-tier-id={tier}
                      className="shrink-0 w-64 border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-2 gap-2 flex-nowrap">
                        <div>
                          <div className="text-xs font-semibold text-gray-900">
                            {t.label ?? tierLabelFallback(tier)}
                          </div>
                          <div className="text-[11px] text-gray-500 leading-tight">
                            <div>현재 언어</div>
                            <div className="font-semibold text-gray-700">{tierLanguages.length}개</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAddLanguage(tier)}
                            className="px-2 py-1 rounded-md bg-indigo-600 text-white text-[11px] font-semibold hover:bg-indigo-700 whitespace-nowrap leading-none"
                          >
                            언어 추가하기
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!window.confirm(`${t.label ?? tier} 티어를 삭제하시겠습니까? (해당 티어 언어는 다른 티어로 이동됩니다)`)) {
                                return;
                              }
                              removeTier(tier);
                              setSaved(false);
                            }}
                            className="px-2 py-1 rounded-md bg-red-600 text-white text-[11px] font-semibold hover:bg-red-700 whitespace-nowrap leading-none"
                          >
                            티어 삭제
                          </button>
                        </div>
                      </div>

                      {tierLanguages.length === 0 ? (
                        <div className="text-xs text-gray-400 border border-dashed border-gray-300 rounded-md px-3 py-4 text-center">
                          이 티어에 등록된 언어가 없습니다.
                        </div>
                      ) : (
                        <ul className="space-y-2 text-sm">
                          {tierLanguages.map((lang) => (
                            <li
                              key={lang.code}
                              className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-3 py-2"
                            >
                              <div>
                                <div className="text-sm text-gray-900">
                                  {lang.name}
                                  <span className="ml-2 text-xs text-gray-400">({lang.code})</span>
                                </div>
                                <label className="inline-flex items-center gap-1 mt-1 text-xs text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={lang.enabled}
                                    onChange={(e) => {
                                      updateLanguage(lang.code, { enabled: e.target.checked });
                                      setSaved(false);
                                    }}
                                  />
                                  <span>{lang.enabled ? '사용' : '미사용'}</span>
                                </label>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveLanguage(lang.code)}
                                className="text-xs text-red-500 hover:text-red-700"
                              >
                                삭제
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-xs text-gray-500">
                활성화된 언어만 번역가 설정 페이지의 언어 선택 드롭다운 및 결제 안내 페이지의 언어 목록에 표시됩니다.
              </p>
            </div>
          </div>

          {/* 1. 번역 방식별 기본 요금 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b">
              1️⃣ 번역 방식별 기본 요금
            </h2>
            {priceTableType === 'client' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    번역사 - 텍스트 (₩/단어)
                  </label>
                  <input
                    type="number"
                    value={prices.translator_text}
                    onChange={(e) => handleChange('translator_text', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    번역사 - 음성 (₩/분)
                  </label>
                  <input
                    type="number"
                    value={prices.translator_voice}
                    onChange={(e) => handleChange('translator_voice', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    번역사 - 동영상 (₩/분)
                  </label>
                  <input
                    type="number"
                    value={prices.translator_video}
                    onChange={(e) => handleChange('translator_video', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI - 텍스트 (₩/글자)
                  </label>
                  <input
                    type="number"
                    value={prices.ai_text}
                    onChange={(e) => handleChange('ai_text', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI - 음성 (₩/분)
                  </label>
                  <input
                    type="number"
                    value={prices.ai_voice}
                    onChange={(e) => handleChange('ai_voice', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI - 동영상 (₩/분)
                  </label>
                  <input
                    type="number"
                    value={prices.ai_video}
                    onChange={(e) => handleChange('ai_video', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  의뢰자 가격을 기준으로 번역사가 받을 비율(%)을 설정하세요. <strong>티어별 계수는 자동으로 반영됩니다.</strong>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      번역사 - 텍스트
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-600">
                      기본 가격: ₩{prices.translator_text}/단어
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={translatorRatios.translator_text_ratio}
                        onChange={(e) => handleChangeRatio('translator_text_ratio', Number(e.target.value))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="비율 (%)"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                    <div className="bg-blue-50 px-3 py-2 rounded-lg text-sm font-semibold text-blue-700">
                      번역사 기본 가격: ₩{Math.round(prices.translator_text * translatorRatios.translator_text_ratio / 100)}/단어
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-2">티어별 최종 가격 (티어 계수 적용 후):</div>
                      {tiers.map((t) => {
                        const tier = t.id;
                        const tierMultiplier = tierMultipliers[tier] ?? 1;
                        const clientPrice = prices.translator_text * tierMultiplier;
                        const translatorPrice = Math.round(clientPrice * translatorRatios.translator_text_ratio / 100);
                        return (
                          <div key={tier} className="text-xs text-gray-600 mb-1 flex justify-between">
                            <span>{t.label ?? tierLabelFallback(tier)} (×{tierMultiplier}):</span>
                            <span className="font-semibold">의뢰자 ₩{Math.round(clientPrice)} → 번역사 ₩{translatorPrice}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      번역사 - 음성
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-600">
                      기본 가격: ₩{prices.translator_voice}/분
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={translatorRatios.translator_voice_ratio}
                        onChange={(e) => handleChangeRatio('translator_voice_ratio', Number(e.target.value))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="비율 (%)"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                    <div className="bg-blue-50 px-3 py-2 rounded-lg text-sm font-semibold text-blue-700">
                      번역사 기본 가격: ₩{Math.round(prices.translator_voice * translatorRatios.translator_voice_ratio / 100)}/분
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-2">티어별 최종 가격:</div>
                      {tiers.map((t) => {
                        const tier = t.id;
                        const tierMultiplier = tierMultipliers[tier] ?? 1;
                        const clientPrice = prices.translator_voice * tierMultiplier;
                        const translatorPrice = Math.round(clientPrice * translatorRatios.translator_voice_ratio / 100);
                        return (
                          <div key={tier} className="text-xs text-gray-600 mb-1 flex justify-between">
                            <span>{t.label ?? tierLabelFallback(tier)} (×{tierMultiplier}):</span>
                            <span className="font-semibold">의뢰자 ₩{Math.round(clientPrice)} → 번역사 ₩{translatorPrice}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      번역사 - 동영상
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-600">
                      기본 가격: ₩{prices.translator_video}/분
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={translatorRatios.translator_video_ratio}
                        onChange={(e) => handleChangeRatio('translator_video_ratio', Number(e.target.value))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="비율 (%)"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                    <div className="bg-blue-50 px-3 py-2 rounded-lg text-sm font-semibold text-blue-700">
                      번역사 기본 가격: ₩{Math.round(prices.translator_video * translatorRatios.translator_video_ratio / 100)}/분
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-2">티어별 최종 가격:</div>
                      {tiers.map((t) => {
                        const tier = t.id;
                        const tierMultiplier = tierMultipliers[tier] ?? 1;
                        const clientPrice = prices.translator_video * tierMultiplier;
                        const translatorPrice = Math.round(clientPrice * translatorRatios.translator_video_ratio / 100);
                        return (
                          <div key={tier} className="text-xs text-gray-600 mb-1 flex justify-between">
                            <span>{t.label ?? tierLabelFallback(tier)} (×{tierMultiplier}):</span>
                            <span className="font-semibold">의뢰자 ₩{Math.round(clientPrice)} → 번역사 ₩{translatorPrice}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      AI - 텍스트
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-600">
                      기본 가격: ₩{prices.ai_text}/글자
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={translatorRatios.ai_text_ratio}
                        onChange={(e) => handleChangeRatio('ai_text_ratio', Number(e.target.value))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="비율 (%)"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                    <div className="bg-blue-50 px-3 py-2 rounded-lg text-sm font-semibold text-blue-700">
                      번역사 기본 가격: ₩{Math.round(prices.ai_text * translatorRatios.ai_text_ratio / 100)}/글자
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-2">티어별 최종 가격:</div>
                      {tiers.map((t) => {
                        const tier = t.id;
                        const tierMultiplier = tierMultipliers[tier] ?? 1;
                        const clientPrice = prices.ai_text * tierMultiplier;
                        const translatorPrice = Math.round(clientPrice * translatorRatios.ai_text_ratio / 100);
                        return (
                          <div key={tier} className="text-xs text-gray-600 mb-1 flex justify-between">
                            <span>{t.label ?? tierLabelFallback(tier)} (×{tierMultiplier}):</span>
                            <span className="font-semibold">의뢰자 ₩{clientPrice.toFixed(1)} → 번역사 ₩{translatorPrice.toFixed(1)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      AI - 음성
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-600">
                      기본 가격: ₩{prices.ai_voice}/분
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={translatorRatios.ai_voice_ratio}
                        onChange={(e) => handleChangeRatio('ai_voice_ratio', Number(e.target.value))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="비율 (%)"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                    <div className="bg-blue-50 px-3 py-2 rounded-lg text-sm font-semibold text-blue-700">
                      번역사 기본 가격: ₩{Math.round(prices.ai_voice * translatorRatios.ai_voice_ratio / 100)}/분
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-2">티어별 최종 가격:</div>
                      {tiers.map((t) => {
                        const tier = t.id;
                        const tierMultiplier = tierMultipliers[tier] ?? 1;
                        const clientPrice = prices.ai_voice * tierMultiplier;
                        const translatorPrice = Math.round(clientPrice * translatorRatios.ai_voice_ratio / 100);
                        return (
                          <div key={tier} className="text-xs text-gray-600 mb-1 flex justify-between">
                            <span>{t.label ?? tierLabelFallback(tier)} (×{tierMultiplier}):</span>
                            <span className="font-semibold">의뢰자 ₩{Math.round(clientPrice)} → 번역사 ₩{translatorPrice}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      AI - 동영상
                    </label>
                    <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-600">
                      기본 가격: ₩{prices.ai_video}/분
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={translatorRatios.ai_video_ratio}
                        onChange={(e) => handleChangeRatio('ai_video_ratio', Number(e.target.value))}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="비율 (%)"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                    <div className="bg-blue-50 px-3 py-2 rounded-lg text-sm font-semibold text-blue-700">
                      번역사 기본 가격: ₩{Math.round(prices.ai_video * translatorRatios.ai_video_ratio / 100)}/분
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-2">티어별 최종 가격:</div>
                      {tiers.map((t) => {
                        const tier = t.id;
                        const tierMultiplier = tierMultipliers[tier] ?? 1;
                        const clientPrice = prices.ai_video * tierMultiplier;
                        const translatorPrice = Math.round(clientPrice * translatorRatios.ai_video_ratio / 100);
                        return (
                          <div key={tier} className="text-xs text-gray-600 mb-1 flex justify-between">
                            <span>{t.label ?? tierLabelFallback(tier)} (×{tierMultiplier}):</span>
                            <span className="font-semibold">의뢰자 ₩{Math.round(clientPrice)} → 번역사 ₩{translatorPrice}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. 전문 분야별 추가 요금 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b">
              2️⃣ 전문 분야별 추가 요금 (₩/단어)
            </h2>
            {priceTableType === 'client' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    마케팅
                  </label>
                  <input
                    type="number"
                    value={prices.marketing}
                    onChange={(e) => handleChange('marketing', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    법률
                  </label>
                  <input
                    type="number"
                    value={prices.law}
                    onChange={(e) => handleChange('law', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기술/IT
                  </label>
                  <input
                    type="number"
                    value={prices.tech}
                    onChange={(e) => handleChange('tech', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    학술/논문
                  </label>
                  <input
                    type="number"
                    value={prices.academic}
                    onChange={(e) => handleChange('academic', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    의료/제약
                  </label>
                  <input
                    type="number"
                    value={prices.medical}
                    onChange={(e) => handleChange('medical', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    금융
                  </label>
                  <input
                    type="number"
                    value={prices.finance}
                    onChange={(e) => handleChange('finance', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  의뢰자 가격을 기준으로 번역사가 받을 비율(%)을 설정하세요.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { key: 'marketing', label: '마케팅', price: prices.marketing, ratioKey: 'marketing_ratio' as const },
                    { key: 'law', label: '법률', price: prices.law, ratioKey: 'law_ratio' as const },
                    { key: 'tech', label: '기술/IT', price: prices.tech, ratioKey: 'tech_ratio' as const },
                    { key: 'academic', label: '학술/논문', price: prices.academic, ratioKey: 'academic_ratio' as const },
                    { key: 'medical', label: '의료/제약', price: prices.medical, ratioKey: 'medical_ratio' as const },
                    { key: 'finance', label: '금융', price: prices.finance, ratioKey: 'finance_ratio' as const },
                  ].map(({ key, label, price, ratioKey }) => (
                    <div key={key} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {label}
                      </label>
                      <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-600">
                        의뢰자 가격: ₩{price}/단어
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={translatorRatios[ratioKey]}
                          onChange={(e) => handleChangeRatio(ratioKey, Number(e.target.value))}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="비율 (%)"
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                      <div className="bg-blue-50 px-3 py-2 rounded-lg text-sm font-semibold text-blue-700">
                        번역사 가격: ₩{Math.round(price * translatorRatios[ratioKey] / 100)}/단어
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. 긴급도 할증 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b">
              3️⃣ 긴급도별 할증 (%)
            </h2>
            {priceTableType === 'client' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    긴급1 (3일)
                  </label>
                  <input
                    type="number"
                    value={prices.urgent1}
                    onChange={(e) => handleChange('urgent1', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">기본 금액 대비 할증 비율</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    긴급2 (1일)
                  </label>
                  <input
                    type="number"
                    value={prices.urgent2}
                    onChange={(e) => handleChange('urgent2', Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">기본 금액 대비 할증 비율</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  의뢰자 긴급도 할증을 기준으로 번역사가 받을 비율(%)을 설정하세요. (할증 금액 자체의 비율)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'urgent1', label: '긴급1 (3일)', price: prices.urgent1, ratioKey: 'urgent1_ratio' as const },
                    { key: 'urgent2', label: '긴급2 (1일)', price: prices.urgent2, ratioKey: 'urgent2_ratio' as const },
                  ].map(({ key, label, price, ratioKey }) => (
                    <div key={key} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {label}
                      </label>
                      <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-600">
                        의뢰자 할증: {price}%
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={translatorRatios[ratioKey]}
                          onChange={(e) => handleChangeRatio(ratioKey, Number(e.target.value))}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="비율 (%)"
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                      <div className="bg-blue-50 px-3 py-2 rounded-lg text-sm font-semibold text-blue-700">
                        번역사 할증: {Math.round(price * translatorRatios[ratioKey] / 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. 매칭/결제 관련 추가 요금 설정 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 4-1. 매칭 방법별 추가 요금 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b">
                4️⃣ 매칭 방법별 추가 요금
              </h2>
              {priceTableType === 'client' ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-800 mb-1">직접 찾기</div>
                    <input
                      type="number"
                      value={prices.match_direct}
                      onChange={(e) => handleChange('match_direct', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">기본 금액 대비 추가 요금 (₩ 또는 % 기준 자유)</p>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">매칭 요청</div>
                    <input
                      type="number"
                      value={prices.match_request}
                      onChange={(e) => handleChange('match_request', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">자동 매칭</div>
                    <input
                      type="number"
                      value={prices.match_auto}
                      onChange={(e) => handleChange('match_auto', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">기타(기업)</div>
                    <input
                      type="number"
                      value={prices.match_corporate}
                      onChange={(e) => handleChange('match_corporate', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600 mb-3">
                    의뢰자 가격을 기준으로 번역사가 받을 비율(%)을 설정하세요.
                  </p>
                  {[
                    { key: 'match_direct', label: '직접 찾기', price: prices.match_direct, ratioKey: 'match_direct_ratio' as const },
                    { key: 'match_request', label: '매칭 요청', price: prices.match_request, ratioKey: 'match_request_ratio' as const },
                    { key: 'match_auto', label: '자동 매칭', price: prices.match_auto, ratioKey: 'match_auto_ratio' as const },
                    { key: 'match_corporate', label: '기타(기업)', price: prices.match_corporate, ratioKey: 'match_corporate_ratio' as const },
                  ].map(({ key, label, price, ratioKey }) => (
                    <div key={key} className="space-y-2">
                      <div className="font-medium text-gray-800 text-sm">{label}</div>
                      <div className="bg-gray-50 px-3 py-2 rounded-lg text-xs text-gray-600">
                        의뢰자 가격: {price}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={translatorRatios[ratioKey]}
                          onChange={(e) => handleChangeRatio(ratioKey, Number(e.target.value))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="비율 (%)"
                        />
                        <span className="text-xs text-gray-600">%</span>
                      </div>
                      <div className="bg-blue-50 px-3 py-2 rounded-lg text-xs font-semibold text-blue-700">
                        번역사 가격: {Math.round(price * translatorRatios[ratioKey] / 100)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4-2. 결제 분류별 글자당 금액 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b">
                5️⃣ 결제 분류별 단가 (₩/글자)
              </h2>
              {priceTableType === 'client' ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-800 mb-1">포인트</div>
                    <input
                      type="number"
                      value={prices.payment_point_per_char}
                      onChange={(e) => handleChange('payment_point_per_char', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">구독</div>
                    <input
                      type="number"
                      value={prices.payment_subscribe_per_char}
                      onChange={(e) => handleChange('payment_subscribe_per_char', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">1회 결제</div>
                    <input
                      type="number"
                      value={prices.payment_oneoff_per_char}
                      onChange={(e) => handleChange('payment_oneoff_per_char', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600 mb-3">
                    의뢰자 가격을 기준으로 번역사가 받을 비율(%)을 설정하세요.
                  </p>
                  {[
                    { key: 'payment_point_per_char', label: '포인트', price: prices.payment_point_per_char, ratioKey: 'payment_point_per_char_ratio' as const },
                    { key: 'payment_subscribe_per_char', label: '구독', price: prices.payment_subscribe_per_char, ratioKey: 'payment_subscribe_per_char_ratio' as const },
                    { key: 'payment_oneoff_per_char', label: '1회 결제', price: prices.payment_oneoff_per_char, ratioKey: 'payment_oneoff_per_char_ratio' as const },
                  ].map(({ key, label, price, ratioKey }) => (
                    <div key={key} className="space-y-2">
                      <div className="font-medium text-gray-800 text-sm">{label}</div>
                      <div className="bg-gray-50 px-3 py-2 rounded-lg text-xs text-gray-600">
                        의뢰자 가격: ₩{price}/글자
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={translatorRatios[ratioKey]}
                          onChange={(e) => handleChangeRatio(ratioKey, Number(e.target.value))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="비율 (%)"
                        />
                        <span className="text-xs text-gray-600">%</span>
                      </div>
                      <div className="bg-blue-50 px-3 py-2 rounded-lg text-xs font-semibold text-blue-700">
                        번역사 가격: ₩{Math.round(price * translatorRatios[ratioKey] / 100)}/글자
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4-3. 결제 내용별 금액 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b">
                6️⃣ 결제 내용별 금액 (₩)
              </h2>
              {priceTableType === 'client' ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-800 mb-1">포인트 충전</div>
                    <input
                      type="number"
                      value={prices.payment_point_charge}
                      onChange={(e) => handleChange('payment_point_charge', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">베이직 구독</div>
                    <input
                      type="number"
                      value={prices.payment_basic_sub}
                      onChange={(e) => handleChange('payment_basic_sub', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">스탠다드 구독</div>
                    <input
                      type="number"
                      value={prices.payment_standard_sub}
                      onChange={(e) => handleChange('payment_standard_sub', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">프리미엄 구독</div>
                    <input
                      type="number"
                      value={prices.payment_premium_sub}
                      onChange={(e) => handleChange('payment_premium_sub', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 mb-1">서비스 이용 (1회결제)</div>
                    <input
                      type="number"
                      value={prices.payment_service_use}
                      onChange={(e) => handleChange('payment_service_use', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600 mb-3">
                    의뢰자 가격을 기준으로 번역사가 받을 비율(%)을 설정하세요. (일반적으로 번역사에게는 해당 없음)
                  </p>
                  {[
                    { key: 'payment_point_charge', label: '포인트 충전', price: prices.payment_point_charge, ratioKey: 'payment_point_charge_ratio' as const },
                    { key: 'payment_basic_sub', label: '베이직 구독', price: prices.payment_basic_sub, ratioKey: 'payment_basic_sub_ratio' as const },
                    { key: 'payment_standard_sub', label: '스탠다드 구독', price: prices.payment_standard_sub, ratioKey: 'payment_standard_sub_ratio' as const },
                    { key: 'payment_premium_sub', label: '프리미엄 구독', price: prices.payment_premium_sub, ratioKey: 'payment_premium_sub_ratio' as const },
                    { key: 'payment_service_use', label: '서비스 이용 (1회결제)', price: prices.payment_service_use, ratioKey: 'payment_service_use_ratio' as const },
                  ].map(({ key, label, price, ratioKey }) => (
                    <div key={key} className="space-y-2">
                      <div className="font-medium text-gray-800 text-sm">{label}</div>
                      <div className="bg-gray-50 px-3 py-2 rounded-lg text-xs text-gray-600">
                        의뢰자 가격: ₩{price}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={translatorRatios[ratioKey]}
                          onChange={(e) => handleChangeRatio(ratioKey, Number(e.target.value))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="비율 (%)"
                        />
                        <span className="text-xs text-gray-600">%</span>
                      </div>
                      <div className="bg-blue-50 px-3 py-2 rounded-lg text-xs font-semibold text-blue-700">
                        번역사 가격: ₩{Math.round(price * translatorRatios[ratioKey] / 100)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 7. 카테고리별 추가 요금 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b">
              7️⃣ 카테고리별 추가 요금 (₩/단어 또는 %)
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              AI번역 서비스의 카테고리별 추가 요금을 설정합니다. 트리 형식으로 대 → 중 → 소 카테고리를 선택하여 가격을 설정하세요.
            </p>

            {/* 트리 형식 3단 레이아웃 */}
            <div className="flex gap-4 h-[600px] border border-gray-200 rounded-lg overflow-hidden">
              {/* 왼쪽: 대 카테고리 */}
              <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">대 카테고리</h3>
                  <button
                    onClick={handleAddLargeCategory}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    + 추가
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {currentPrices.category_large && Object.keys(currentPrices.category_large).length > 0 ? (
                    Object.entries(currentPrices.category_large).map(([key, category]) => (
                      <div
                        key={key}
                        className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                          selectedLargeCategory === key
                            ? 'bg-blue-100 border-blue-300'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedLargeCategory(key);
                          setSelectedMidCategory(null);
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">
                            {category.icon} {category.name}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveLargeCategory(key);
                            }}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            삭제
                          </button>
                        </div>
                        <div className="space-y-2">
                          {priceTableType === 'client' ? (
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-600">가격:</label>
                              <input
                                type="number"
                                value={category.price}
                                onChange={(e) => {
                                  handleChangeLargeCategoryPrice(key, Number(e.target.value));
                                  e.stopPropagation();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="기본 가격"
                              />
                            </div>
                          ) : (
                            <>
                              <div className="bg-gray-50 px-2 py-1 rounded text-xs text-gray-600">
                                의뢰자 가격: {prices.clientPrices.category_large[key]?.price || 0}
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600">번역사 가격:</label>
                                <input
                                  type="number"
                                  value={category.price}
                                  onChange={(e) => {
                                    handleChangeLargeCategoryPrice(key, Number(e.target.value));
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="번역사 가격"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-gray-500 text-center">대 카테고리가 없습니다</div>
                  )}
                </div>
              </div>

              {/* 중간: 중 카테고리 */}
              <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">중 카테고리</h3>
                    {selectedLargeCategory && (
                      <button
                        onClick={() => handleAddMidCategory(selectedLargeCategory)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        + 추가
                      </button>
                    )}
                  </div>
                  {selectedLargeCategory && currentPrices.category_large[selectedLargeCategory] && (
                    <p className="text-xs text-gray-500 mt-1">
                      {currentPrices.category_large[selectedLargeCategory].icon} {currentPrices.category_large[selectedLargeCategory].name} 선택됨
                    </p>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto">
                  {!selectedLargeCategory ? (
                    <div className="p-4 text-sm text-gray-500 text-center">대 카테고리를 선택하세요</div>
                  ) : currentPrices.category_mid?.[selectedLargeCategory] && Object.keys(currentPrices.category_mid[selectedLargeCategory]).length > 0 ? (
                    Object.entries(currentPrices.category_mid[selectedLargeCategory]).map(([key, category]) => (
                      <div
                        key={key}
                        className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                          selectedMidCategory === key
                            ? 'bg-blue-100 border-blue-300'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedMidCategory(key)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMidCategory(selectedLargeCategory, key);
                            }}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            삭제
                          </button>
                        </div>
                        <div className="space-y-2">
                          {priceTableType === 'client' ? (
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-600">추가 가격:</label>
                              <input
                                type="number"
                                value={category.price}
                                onChange={(e) => {
                                  handleChangeMidCategoryPrice(selectedLargeCategory, key, Number(e.target.value));
                                  e.stopPropagation();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="추가 가격"
                              />
                            </div>
                          ) : (
                            <>
                              <div className="bg-gray-50 px-2 py-1 rounded text-xs text-gray-600">
                                의뢰자 가격: {prices.clientPrices.category_mid[selectedLargeCategory]?.[key]?.price || 0}
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600">번역사 가격:</label>
                                <input
                                  type="number"
                                  value={category.price}
                                  onChange={(e) => {
                                    handleChangeMidCategoryPrice(selectedLargeCategory, key, Number(e.target.value));
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="번역사 가격"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-gray-500 text-center">중 카테고리가 없습니다</div>
                  )}
                </div>
              </div>

              {/* 오른쪽: 소 카테고리 */}
              <div className="w-1/3 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">소 카테고리</h3>
                    {selectedMidCategory && (
                      <button
                        onClick={() => handleAddSmallCategory(selectedMidCategory)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        + 추가
                      </button>
                    )}
                  </div>
                  {selectedMidCategory && (
                    <p className="text-xs text-gray-500 mt-1">중 카테고리 선택됨</p>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto">
                  {!selectedMidCategory ? (
                    <div className="p-4 text-sm text-gray-500 text-center">중 카테고리를 선택하세요</div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {currentPrices.category_small?.[selectedMidCategory] && Object.keys(currentPrices.category_small[selectedMidCategory]).length > 0 ? (
                        Object.entries(currentPrices.category_small[selectedMidCategory]).map(([smallName, smallPrice]) => (
                          <div key={smallName} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm text-gray-900">{smallName}</div>
                              <button
                                onClick={() => handleRemoveSmallCategory(selectedMidCategory, smallName)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                삭제
                              </button>
                            </div>
                            {priceTableType === 'client' ? (
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600">가격:</label>
                                <input
                                  type="number"
                                  value={smallPrice}
                                  onChange={(e) => handleChangeSmallCategory(selectedMidCategory, smallName, Number(e.target.value))}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="가격"
                                />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="bg-gray-50 px-2 py-1 rounded text-xs text-gray-600">
                                  의뢰자 가격: {prices.clientPrices.category_small[selectedMidCategory]?.[smallName] || 0}
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-xs text-gray-600">번역사 가격:</label>
                                  <input
                                    type="number"
                                    value={smallPrice}
                                    onChange={(e) => handleChangeSmallCategory(selectedMidCategory, smallName, Number(e.target.value))}
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="번역사 가격"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-8">
                          소 카테고리가 없습니다.<br />
                          위의 &quot;+ 추가&quot; 버튼을 클릭하여 추가하세요.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              💾 가격 저장
            </button>
            {saved && (
              <div className="text-green-600 font-semibold flex items-center gap-2">
                ✅ 저장되었습니다
              </div>
            )}
          </div>
            </>
          )}
        </div>

        {/* 미리보기 */}
        {!isPlaceholderType && priceTableType !== 'editor' && priceTableType !== 'tuition-proofread-exhibition' && priceTableType !== 'expert-review' && (
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 현재 가격표 미리보기</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="text-xs text-gray-600">번역사 텍스트</div>
              <div className="text-lg font-bold text-purple-600">₩{prices.translator_text}/단어</div>
            </div>
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="text-xs text-gray-600">AI 텍스트</div>
              <div className="text-lg font-bold text-blue-600">₩{prices.ai_text}/글자</div>
            </div>
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="text-xs text-gray-600">의료/제약 추가</div>
              <div className="text-lg font-bold text-green-600">+₩{prices.medical}/단어</div>
            </div>
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="text-xs text-gray-600">긴급1 할증</div>
              <div className="text-lg font-bold text-orange-600">+{prices.urgent1}%</div>
            </div>
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="text-xs text-gray-600">긴급2 할증</div>
              <div className="text-lg font-bold text-red-600">+{prices.urgent2}%</div>
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}

export default function PricingPage() {
  return <PriceProvider><LanguageConfigProvider><PricingPageInner /></LanguageConfigProvider></PriceProvider>;
}
