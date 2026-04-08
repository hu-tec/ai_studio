/* 원본: hutechc_hompage_real/app/translate/client/request/all/page.tsx */
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router';
import { ChevronRight } from "lucide-react";
import {
  extractTextStats,
  calculateAmountFromStep1,
  type TranslationRequestData,
} from '../../../../lib/priceCalculator';

// STEP1과 동일한 카테고리/언어 설정 -----------------
const MAIN_CATEGORIES = [
  { id: "law", label: "법률" },
  { id: "business", label: "비즈니스" },
  { id: "medical", label: "의료" },
  { id: "tech", label: "기술" },
  { id: "general", label: "일반" },
];

const MIDDLE_CATEGORIES: Record<string, { id: string; label: string }[]> = {
  law: [
    { id: "law-domestic", label: "국내 법률" },
    { id: "law-international", label: "국제 법률" },
  ],
  business: [
    { id: "biz-marketing", label: "마케팅" },
    { id: "biz-contract", label: "계약/영업" },
  ],
  medical: [
    { id: "med-general", label: "일반 의료" },
    { id: "med-pharma", label: "제약" },
  ],
  tech: [
    { id: "tech-manual", label: "매뉴얼" },
    { id: "tech-spec", label: "기술 명세" },
  ],
  general: [
    { id: "gen-document", label: "일반 문서" },
    { id: "gen-etc", label: "기타" },
  ],
};

const DETAIL_CATEGORIES: Record<string, { id: string; label: string }[]> = {
  "law-domestic": [
    { id: "law-domestic-complaint", label: "고소장" },
    { id: "law-domestic-contract", label: "계약서" },
  ],
  "law-international": [
    { id: "law-international-contract", label: "국제 계약서" },
  ],
  "biz-marketing": [{ id: "biz-marketing-copy", label: "카피라이팅" }],
};

const LANGUAGE_TIERS = {
  tier1: { id: "tier1", display: "Tier1" },
  tier2: { id: "tier2", display: "Tier2" },
  tier3: { id: "tier3", display: "Tier3" },
};

const LANGUAGES = [
  { code: "ko", name: "한국어", tier: "tier1" },
  { code: "en", name: "영어", tier: "tier1" },
  { code: "zh", name: "중국어", tier: "tier1" },
  { code: "ja", name: "일어", tier: "tier1" },
  { code: "ar", name: "아랍어", tier: "tier2" },
  { code: "vi", name: "베트남어", tier: "tier2" },
  { code: "fr", name: "프랑스어", tier: "tier2" },
  { code: "de", name: "독일어", tier: "tier2" },
];

const AI_MODELS = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "gemini", label: "Gemini" },
  { id: "wrtn", label: "wrtn." },
  { id: "other", label: "다른 AI" },
];

const TONES = [
  { id: "formal", label: "공식적인" },
  { id: "casual", label: "일상적인" },
  { id: "technical", label: "기술적" },
  { id: "creative", label: "창의적" },
];

const HUMAN_WORK_TYPES = [
  { id: "none", label: "요청 없음" },
  { id: "review", label: "감수 요청" },
];

const HUMAN_LEVELS = [
  { id: "standard", label: "일반 전문가" },
  { id: "senior", label: "고급전문가" },
];

// 전문가 진행·매칭 테이블 요약 -----------------
const EXPERT_LEVELS = [
  { id: "A", label: "A레벨", time: "평일 오전", duration: "3시간 이내" },
  { id: "B", label: "B레벨", time: "평일 오후", duration: "6시간 이내" },
  { id: "C", label: "C레벨", time: "주말", duration: "12시간 이내" },
  { id: "D", label: "D레벨", time: "평일 종일", duration: "24시간 이내" },
  { id: "E", label: "긴급(E)", time: "언제든(긴급)", duration: "희망일 이내" },
] as const;

const MATCHING_METHODS = [
  { id: "direct", label: "직접 찾기" },
  { id: "request", label: "매칭 요청" },
  { id: "auto", label: "자동 매칭" },
  { id: "other", label: "기타(기업)" },
] as const;

const EXPERT_TYPES = [
  { id: "general", label: "일반" },
  { id: "pro", label: "전문가" },
  { id: "high", label: "고급전문가" },
  { id: "special", label: "특수전문가" },
] as const;

const EXPERT_DOMAINS = [
  {
    id: "law",
    label: "법률",
    roles: [
      { id: "civil", label: "민사법" },
      { id: "criminal", label: "형사법" },
      { id: "contract", label: "계약" },
    ],
  },
  {
    id: "tax",
    label: "세무",
    roles: [
      { id: "tax-general", label: "세무" },
      { id: "tax-account", label: "세무정산" },
    ],
  },
  {
    id: "hr",
    label: "인사/노무",
    roles: [
      { id: "hr-employment", label: "취업" },
      { id: "labor", label: "노무사" },
    ],
  },
  {
    id: "biz",
    label: "영업/마케팅",
    roles: [
      { id: "sales", label: "영업" },
    ],
  },
  {
    id: "ip",
    label: "지식재산",
    roles: [
      { id: "patent", label: "특허" },
    ],
  },
  {
    id: "medical",
    label: "의료",
    roles: [
      { id: "doctor", label: "의사" },
    ],
  },
] as const;

// 결제/할인 플랜 -----------------
const PAYMENT_PLANS = [
  {
    id: "event",
    label: "이벤트", // 할인 유형
    discountRate: 10, // 할인율
    serviceLevel: "A레벨", // 서비스 레벨
    extraSetting: "*1", // 추가 설정1(갯수)
    contentLabel: "에디터 글자", // 내용
    benefit: "1천자", // 혜택
    amount: "월 1만원", // 금액
    settlementLevel: "A레벨", // 정산 기준
    settlementRate: 70, // 정산 비율
    unit: "글자수", // 서비스 단위
    unitThreshold: "1만자", // 서비스 기준
    inquiryType: "결제", // 문의 분류
    paymentType: "포인트", // 결제 분류
    paymentContent: "포인트 충전", // 결제 내용
    purchaseMethod: "다운로드", // 활용법 구매
    useCase: "일반", // 활용법
    priceGroup: "일반", // 요금 그룹
  },
  {
    id: "signup",
    label: "회원가입",
    discountRate: 10,
    serviceLevel: "B레벨",
    extraSetting: "*2",
    contentLabel: "번역(AI)",
    benefit: "1만자",
    amount: "월 5천원",
    settlementLevel: "B레벨",
    settlementRate: 80,
    unit: "장당",
    unitThreshold: "10장",
    inquiryType: "오류", // 예시 값
    paymentType: "구독",
    paymentContent: "베이직 구독",
    purchaseMethod: "구독",
    useCase: "GPT 작성",
    priceGroup: "표준",
  },
  {
    id: "first",
    label: "첫 결제",
    discountRate: 5,
    serviceLevel: "C레벨",
    extraSetting: "*3",
    contentLabel: "",
    benefit: "",
    amount: "",
    settlementLevel: "C레벨",
    settlementRate: 85,
    unit: "시간당",
    unitThreshold: "10시간",
    inquiryType: "환불",
    paymentType: "구독",
    paymentContent: "스탠다드구독",
    purchaseMethod: "구독",
    useCase: "감수 요청",
    priceGroup: "전문",
  },
  {
    id: "friend",
    label: "친구 소개",
    discountRate: 7,
    serviceLevel: "D레벨",
    extraSetting: "*4",
    contentLabel: "",
    benefit: "",
    amount: "",
    settlementLevel: "D레벨",
    settlementRate: 90,
    unit: "",
    unitThreshold: "",
    inquiryType: "서비스",
    paymentType: "구독",
    paymentContent: "프리미엄구독",
    purchaseMethod: "구독",
    useCase: "작성 요청",
    priceGroup: "고급",
  },
  {
    id: "urgent",
    label: "긴급",
    discountRate: 3,
    serviceLevel: "긴급",
    extraSetting: "*2",
    contentLabel: "",
    benefit: "",
    amount: "",
    settlementLevel: "긴급",
    settlementRate: 90,
    unit: "",
    unitThreshold: "",
    inquiryType: "개선 요청",
    paymentType: "1회결제",
    paymentContent: "서비스 이용",
    purchaseMethod: "1회결제",
    useCase: "컨설팅 요청",
    priceGroup: "프리미엄",
  },
] as const;

// 미디어 카테고리/서비스 영역 -----------------
const MEDIA_MODES = [
  { id: "STT", label: "STT - 영상 → 텍스트/음성" },
  { id: "TTS", label: "TTS - 텍스트 → 음성" },
  { id: "STS", label: "STS - 동시통역" },
  { id: "TTT", label: "TTT - 문서 번역" },
] as const;

type MediaModeId = (typeof MEDIA_MODES)[number]["id"]; 

const MEDIA_USECASES: Record<MediaModeId, { id: string; label: string }[]> = {
  STT: [
    { id: "variety", label: "예능" },
    { id: "drama", label: "드라마" },
    { id: "movie", label: "영화" },
    { id: "sns", label: "SNS" },
    { id: "youtube", label: "유튜브" },
    { id: "docu", label: "다큐멘터리" },
  ],
  TTS: [
    { id: "announcer", label: "아나운서" },
    { id: "guide", label: "관광 가이드" },
    { id: "curator", label: "큐레이터" },
    { id: "announce", label: "안내" },
  ],
  STS: [
    { id: "conference", label: "동시통역" },
    { id: "lecture", label: "강의" },
    { id: "music", label: "음악" },
  ],
  TTT: [
    { id: "webtoon", label: "웹툰" },
    { id: "classic", label: "고전" },
    { id: "business", label: "비즈니스" },
    { id: "ppt", label: "PPT" },
    { id: "company", label: "사업소개서" },
    { id: "cosmetics", label: "화장품" },
    { id: "semiconductor", label: "반도체" },
    { id: "defense", label: "방산" },
    { id: "news", label: "뉴스" },
    { id: "politics", label: "정치" },
    { id: "economy", label: "경제" },
    { id: "literature", label: "문학" },
  ],
};

function getLanguageLabel(code: string | null | undefined) {
  if (!code) return "";
  const lang = LANGUAGES.find((l) => l.code === code);
  if (!lang) return code;
  const tier = LANGUAGE_TIERS[lang.tier as keyof typeof LANGUAGE_TIERS];
  return `${lang.name} (${tier.display})`;
}

// STEP2와 동일한 긴급도 / 번역 타입 / 매칭 방식 -----------------
const URGENCY_OPTIONS = [
  {
    id: "normal" as const,
    label: "일반",
    description: "기본 일정 (5일+)",
    days: "5일 이상",
    multiplier: 1.0,
  },
  {
    id: "urgent1" as const,
    label: "긴급 1단계",
    description: "3일 이내 완료",
    days: "3일 이내",
    multiplier: 1.3,
  },
  {
    id: "urgent2" as const,
    label: "긴급 2단계",
    description: "1일 이내 완료",
    days: "1일 이내",
    multiplier: 1.5,
  },
];

const TRANSLATION_TYPES = [
  { id: "TTT" as const, label: "TTT", description: "텍스트 → 텍스트", extra: "기본" },
  { id: "STT" as const, label: "STT", description: "음성 → 텍스트", extra: "+₩7k/분" },
  { id: "TTS" as const, label: "TTS", description: "텍스트 → 음성", extra: "+₩5k/분" },
  { id: "STS" as const, label: "STS", description: "음성 → 음성", extra: "+₩10k/분" },
];

const MATCHING_MODES = [
  {
    id: "auto" as const,
    label: "번역사 자동매칭",
    description: "AI가 분류/언어/금액을 기준으로 자동으로 번역사를 추천합니다.",
  },
  {
    id: "direct" as const,
    label: "번역사 직접 선택",
    description: "번역사 리스트를 보고 사용자가 직접 한 명을 선택합니다.",
  },
  {
    id: "accepted" as const,
    label: "요청 수락 번역사 중 선택",
    description: "견적을 수락한 번역사 리스트에서 나중에 선택합니다.",
  },
];

export default function AllPage() {
  const navigate = useNavigate();

  // STEP1 상태 -----------------
  const [mainCategory, setMainCategory] = useState<string>("law");
  const [middleCategory, setMiddleCategory] = useState<string>("law-domestic");
  const [detailCategory, setDetailCategory] = useState<string>("law-domestic-complaint");

  const [sourceMode, setSourceMode] = useState<"detect" | "fixed">("detect");
  const [fixedSourceLang, setFixedSourceLang] = useState<string>("ko");
  const [targetLanguages, setTargetLanguages] = useState<string[]>(["en"]);

  const [selectedModels, setSelectedModels] = useState<string[]>(["chatgpt"]);
  const [tone, setTone] = useState<string>("formal");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [useEditor, setUseEditor] = useState<"use" | "no">("use");
  const [humanWorkType, setHumanWorkType] = useState<string>("review");
  const [humanLevel, setHumanLevel] = useState<string>("senior");
  const [isUrgentFlag, setIsUrgentFlag] = useState<boolean>(false);

  // 전문가 진행/매칭
  const [expertLevel, setExpertLevel] = useState<(typeof EXPERT_LEVELS)[number]["id"]>("A");
  const [expertPriority, setExpertPriority] = useState<number>(1);
  const [expertType, setExpertType] = useState<(typeof EXPERT_TYPES)[number]["id"]>("general");
  const [matchingMethod, setMatchingMethod] = useState<(typeof MATCHING_METHODS)[number]["id"]>("direct");
  const [expertDomainId, setExpertDomainId] = useState<string>("law");
  const [expertRoleId, setExpertRoleId] = useState<string>("civil");

  // 결제 방식
  type PaymentMethod = "points" | "subscription" | "oneTime";
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("points");
  const [subscriptionTier, setSubscriptionTier] = useState<"basic" | "standard" | "premium" | null>(null);
  const [showSubscriptionInfo, setShowSubscriptionInfo] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  // 미디어 카테고리/서비스 영역
  const [mediaMode, setMediaMode] = useState<MediaModeId>("TTT");
  const [mediaUsecaseId, setMediaUsecaseId] = useState<string | null>(null);

  const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
  const [fileStats, setFileStats] = useState<{
    charCount: number;
    wordCount: number;
    minutes: number;
  }>({ charCount: 0, wordCount: 0, minutes: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // STEP2 상태 -----------------
  const [urgencyId, setUrgencyId] = useState<"normal" | "urgent1" | "urgent2">("normal");
  const [translationTypeId, setTranslationTypeId] = useState<"TTT" | "STT" | "TTS" | "STS">("TTT");
  const [matchingMode, setMatchingMode] =
    useState<"auto" | "direct" | "accepted">("auto");

  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const [errors, setErrors] = useState<string[]>([]);

  // 핸들러들 -----------------
  const handleModelToggle = (id: string) => {
    setSelectedModels((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleTargetToggle = (code: string) => {
    setTargetLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const applyFiles = async (fileList: FileList | File[]) => {
    const next = Array.from(fileList).map((f) => ({ name: f.name, size: f.size }));
    setFiles(next);

    if (fileList.length > 0) {
      try {
        const stats = await extractTextStats(fileList[0] as File);
        setFileStats(stats);
        setCharCount(stats.charCount);
      } catch (e) {
        console.error("Failed to extract file stats:", e);
        const estimatedChars = Math.floor(fileList[0].size / 2);
        const stats = {
          charCount: estimatedChars,
          wordCount: Math.floor(estimatedChars / 5),
          minutes: 0,
        };
        setFileStats(stats);
        setCharCount(stats.charCount);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    void applyFiles(fileList);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) {
      void applyFiles(e.dataTransfer.files);
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

  // 기본 금액 자동 계산 (STEP1 상태 + fileStats 변화 시)
  useEffect(() => {
    const calc = async () => {
      // 필수 조건 없으면 계산 안 함
      if (!fileStats.charCount && !files.length) {
        setBaseAmount(0);
        return;
      }

      const requestData: TranslationRequestData = {
        mainCategory,
        middleCategory,
        detailCategory,
        language: {
          sourceMode,
          sourceLang: sourceMode === "fixed" ? fixedSourceLang : null,
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
      };

      setIsCalculating(true);
      try {
        const amount = await calculateAmountFromStep1(requestData, fileStats);
        setBaseAmount(amount);
      } catch (e) {
        console.error("Failed to calculate amount from all-in-one page", e);
        setBaseAmount(0);
      }
      setIsCalculating(false);
    };

    void calc();
  }, [
    mainCategory,
    middleCategory,
    detailCategory,
    sourceMode,
    fixedSourceLang,
    targetLanguages,
    selectedModels,
    tone,
    customPrompt,
    useEditor,
    humanWorkType,
    humanLevel,
    isUrgentFlag,
    files,
    fileStats,
  ]);

  const middleOptions = MIDDLE_CATEGORIES[mainCategory] ?? [];
  const detailOptions = DETAIL_CATEGORIES[middleCategory] ?? [];

  const urgency = URGENCY_OPTIONS.find((u) => u.id === urgencyId)!;
  const translationType = TRANSLATION_TYPES.find((t) => t.id === translationTypeId)!;
  const matchingModeLabel = MATCHING_MODES.find((m) => m.id === matchingMode)?.label ?? "";

  const totalAmount = Math.round(baseAmount * urgency.multiplier);

  const handleSubmit = () => {
    const newErrors: string[] = [];

    if (!mainCategory || !middleCategory || !detailCategory) {
      newErrors.push("카테고리를 모두 선택해주세요.");
    }
    if (sourceMode === "fixed" && !fixedSourceLang) {
      newErrors.push("출발어를 선택해주세요.");
    }
    if (targetLanguages.length === 0) {
      newErrors.push("도착어(대상 언어)를 최소 1개 이상 선택해주세요.");
    }
    if (!files.length) {
      newErrors.push("최소 1개 이상의 파일을 업로드해주세요.");
    }
    // 결제 방식은 기본값(포인트 결제)이 있으므로 필수 검증은 생략

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const requestData: TranslationRequestData = {
      mainCategory,
      middleCategory,
      detailCategory,
      language: {
        sourceMode,
        sourceLang: sourceMode === "fixed" ? fixedSourceLang : null,
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
    };

    const payload = {
      request: requestData,
      pricing: {
        urgencyId,
        translationTypeId,
        matchingMode,
        baseAmount,
        totalAmount,
        charCount,
        paymentMethod,
        subscriptionTier,
        referralCode,
      },
      expert: {
        level: expertLevel,
        priority: expertPriority,
        type: expertType,
        method: matchingMethod,
        domain: expertDomainId,
        role: expertRoleId,
      },
      media: {
        mode: mediaMode,
        usecaseId: mediaUsecaseId,
      },
    };

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("translationRequestAllInOne", JSON.stringify(payload));
    }

    alert("(mock) 번역 의뢰가 접수되었습니다. 추후 의뢰 목록/결제로 연결 예정입니다.");
    navigate("/hutechc-homepage/translate/client/requests");
  };

  const mainLabel = MAIN_CATEGORIES.find((m) => m.id === mainCategory)?.label ?? mainCategory;
  const middleLabel =
    MIDDLE_CATEGORIES[mainCategory]?.find((m) => m.id === middleCategory)?.label ??
    middleCategory;
  const detailLabel =
    DETAIL_CATEGORIES[middleCategory]?.find((d) => d.id === detailCategory)?.label ??
    detailCategory;

  const sourceLabel =
    sourceMode === "detect" ? "언어 감지" : getLanguageLabel(fixedSourceLang);
  const targetLabels = targetLanguages.map((code) => getLanguageLabel(code));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">전체 의뢰 (원페이지)</h1>
            <p className="text-sm text-gray-600">
              기존 STEP 1 · STEP 2에서 입력하던 모든 정보를 한 화면에서 입력하고 바로 의뢰합니다.
            </p>
          </div>
        </header>

        {errors.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <ul className="space-y-1 text-sm text-red-700">
              {errors.map((err, idx) => (
                <li key={idx}>• {err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* LEFT: 파일 + 세부 설정들 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 파일 업로드 영역 (상단 큰 박스) */}
            <section className="bg-white border border-purple-200 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">파일 업로드</h2>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex flex-col items-center justify-center px-4 py-10 border-2 border-dashed rounded-lg text-sm mb-4 transition-colors ${
                  isDragging ? "border-purple-400 bg-purple-50" : "border-gray-300 bg-gray-50"
                }`}
              >
                <p className="text-gray-700 mb-2">번역할 파일을 이 영역으로 드래그 해주세요.</p>
                <p className="text-gray-500 text-xs mb-3">
                  PDF, DOCX, TXT 등 다양한 형식을 지원합니다. 첫 번째 파일 기준으로 분량을 계산합니다.
                </p>
                <label className="inline-flex items-center px-4 py-2 bg-black text-white text-xs font-semibold rounded-md cursor-pointer hover:bg-gray-800">
                  파일 선택하기
                  <input type="file" multiple onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              {files.length > 0 && (
                <div className="border-t border-gray-200 pt-3 mt-2 text-xs text-gray-700">
                  <div className="flex justify-between mb-1">
                    <span>업로드된 파일</span>
                    <span>
                      글자수 추정: {charCount ? `${charCount.toLocaleString()}자` : "-"}
                    </span>
                  </div>
                  <ul className="space-y-1 max-h-24 overflow-y-auto">
                    {files.map((f) => (
                      <li key={f.name}>
                        {f.name} ({Math.round(f.size / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* 카테고리 */}
            <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">카테고리</h2>
              <div className="flex flex-wrap gap-3 items-center text-xs">
                <select
                  className="border border-gray-300 rounded-md px-3 py-1.5 bg-white min-w-[140px]"
                  value={mainCategory}
                  onChange={(e) => {
                    const nextMain = e.target.value;
                    setMainCategory(nextMain);
                    const firstMiddle = (MIDDLE_CATEGORIES[nextMain] ?? [])[0]?.id ?? "";
                    setMiddleCategory(firstMiddle);
                    const firstDetail =
                      (firstMiddle && DETAIL_CATEGORIES[firstMiddle]?.[0]?.id) || "";
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
                  className="border border-gray-300 rounded-md px-3 py-1.5 bg-white min-w-[160px]"
                  value={middleCategory}
                  onChange={(e) => {
                    const nextMid = e.target.value;
                    setMiddleCategory(nextMid);
                    const firstDetail = DETAIL_CATEGORIES[nextMid]?.[0]?.id || "";
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
                  className="border border-gray-300 rounded-md px-3 py-1.5 bg-white min-w-[160px]"
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

            {/* AI / 톤 / 프롬프트 */}
            <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">AI 설정</h2>
              <div className="flex flex-wrap gap-4 text-xs">
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs"
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="예: 법률 용어는 원문 유지, 매우 자연스럽게 번역 등"
                  />
                </div>
              </div>
            </section>

            {/* 에디터 / 휴먼 작업 */}
            <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">휴먼 작업 / 에디터</h2>
              <div className="flex flex-wrap gap-4 text-xs items-center">
                <span className="text-gray-600">양식 에디터</span>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="editor"
                    value="use"
                    checked={useEditor === "use"}
                    onChange={() => setUseEditor("use")}
                  />
                  <span>사용</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="editor"
                    value="no"
                    checked={useEditor === "no"}
                    onChange={() => setUseEditor("no")}
                  />
                  <span>미사용</span>
                </label>
              </div>

              <div className="flex flex-wrap gap-4 text-xs items-center">
                <span className="text-gray-600">휴먼 작업</span>
                <select
                  className="border border-gray-300 rounded-md px-3 py-1.5 bg-white min-w-[130px]"
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
                  className="border border-gray-300 rounded-md px-3 py-1.5 bg-white min-w-[130px]"
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
                  <span>긴급 플래그</span>
                </label>
              </div>
            </section>

            {/* 전문가 진행 · 매칭 설정 */}
            <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">전문가 진행 · 매칭</h2>

              {/* 레벨 / 우선순위 / 전문가 구분 */}
              <div className="grid md:grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-gray-600 mb-1">서비스 레벨</p>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 bg-white"
                    value={expertLevel}
                    onChange={(e) => setExpertLevel(e.target.value as (typeof EXPERT_LEVELS)[number]["id"])}
                  >
                    {EXPERT_LEVELS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label} ({l.time}, {l.duration})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">우선 전문가 업무순위</p>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 bg-white"
                    value={expertPriority}
                    onChange={(e) => setExpertPriority(Number(e.target.value) || 1)}
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}순위
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">전문가 구분</p>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 bg-white"
                    value={expertType}
                    onChange={(e) => setExpertType(e.target.value as (typeof EXPERT_TYPES)[number]["id"])}
                  >
                    {EXPERT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 매칭 방법 */}
              <div>
                <p className="text-xs text-gray-600 mb-1">매칭 방법</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  {MATCHING_METHODS.map((m) => (
                    <label key={m.id} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="matching-method"
                        value={m.id}
                        checked={matchingMethod === m.id}
                        onChange={() => setMatchingMethod(m.id)}
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 전문가 영역 / 세부 전문가 */}
              <div className="grid md:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-600 mb-1">전문가 영역</p>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 bg-white"
                    value={expertDomainId}
                    onChange={(e) => {
                      const next = e.target.value;
                      setExpertDomainId(next);
                      const domain = EXPERT_DOMAINS.find((d) => d.id === next);
                      setExpertRoleId(domain?.roles[0]?.id ?? "");
                    }}
                  >
                    {EXPERT_DOMAINS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">세부 전문가</p>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 bg-white"
                    value={expertRoleId}
                    onChange={(e) => setExpertRoleId(e.target.value)}
                  >
                    {EXPERT_DOMAINS.find((d) => d.id === expertDomainId)?.roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 긴급도 + 번역 타입 + 매칭 방식 + 미디어 카테고리 */}
            <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">긴급도</h2>
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  {URGENCY_OPTIONS.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgencyId(u.id)}
                      className={`text-left border rounded-md px-3 py-3 transition-colors ${
                        urgencyId === u.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-300 bg-white hover:border-indigo-300"
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{u.label}</div>
                      <div className="text-[11px] text-gray-600">{u.description}</div>
                      <div className="mt-1 text-[11px] text-gray-500">{u.days} · {u.multiplier}배</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">언어 설정</h2>

                <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                  <span className="text-gray-600">출발어</span>
                  <select
                    className="border border-gray-300 rounded-md px-3 py-1.5 bg-white"
                    value={sourceMode}
                    onChange={(e) => setSourceMode(e.target.value as "detect" | "fixed")}
                  >
                    <option value="detect">언어 감지</option>
                    <option value="fixed">직접 선택</option>
                  </select>
                  {sourceMode === "fixed" && (
                    <select
                      className="border border-gray-300 rounded-md px-3 py-1.5 bg-white min-w-[140px]"
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

                <div>
                  <p className="text-xs text-gray-600 mb-2">도착어 (대상 언어)</p>
                  <div className="flex flex-wrap gap-3 text-xs">
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
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">번역 타입</h2>
                <div className="space-y-2 text-xs">
                  {TRANSLATION_TYPES.map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer transition-colors ${
                        translationTypeId === t.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-300 bg-white hover:border-indigo-300"
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
                          <div className="text-[11px] text-gray-600">{t.description}</div>
                        </div>
                      </div>
                      <div className="text-[11px] font-semibold text-indigo-600">{t.extra}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 미디어 카테고리 / 서비스 영역 */}
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-2">카테고리 분류와 서비스 영역</h2>
                <p className="text-[11px] text-gray-600 mb-2">
                  STT/TTS/STS/TTT 조합으로 파일 변환 방식과 서비스 영역을 선택합니다.
                </p>
                <div className="flex flex-wrap gap-3 mb-3 text-xs">
                  {MEDIA_MODES.map((m) => (
                    <label key={m.id} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="media-mode"
                        value={m.id}
                        checked={mediaMode === m.id}
                        onChange={() => {
                          setMediaMode(m.id);
                          const first = MEDIA_USECASES[m.id][0]?.id ?? null;
                          setMediaUsecaseId(first);
                        }}
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
                <div className="text-[11px] text-gray-600 mb-1">세부 서비스 영역</div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {MEDIA_USECASES[mediaMode].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setMediaUsecaseId(u.id)}
                      className={`px-3 py-1 rounded-full border text-xs ${
                        mediaUsecaseId === u.id
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: 요약 + 금액 */}
          <aside className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <section className="bg-white border border-gray-200 rounded-lg p-4 text-xs">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">요약</h2>
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
                      {targetLabels.length > 0 ? targetLabels.join(", ") : "선택 없음"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500">AI / 톤</div>
                    <div className="font-medium text-gray-900">
                      {selectedModels.join(", ") || "선택 없음"} / {tone}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500">휴먼 작업</div>
                    <div className="font-medium text-gray-900">
                      {humanWorkType === "none"
                        ? "요청 없음"
                        : `${humanWorkType} · ${humanLevel}`}
                      {isUrgentFlag && " · 긴급 플래그"}
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
                  {files.length > 0 && (
                    <div>
                      <div className="text-[11px] text-gray-500">첨부 파일</div>
                      <ul className="space-y-1 max-h-20 overflow-y-auto text-[11px] text-gray-700">
                        {files.map((f) => (
                          <li key={f.name}>
                            {f.name} ({Math.round(f.size / 1024)} KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>

              {/* 결제 방식 선택 */}
              <section className="bg-white border border-gray-200 rounded-lg p-4 text-xs">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">결제 방식</h2>
                <div className="space-y-2 mb-3">
                  <label className={`flex items-center justify-between px-3 py-2 rounded-md border cursor-pointer ${
                    paymentMethod === "points"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-300 bg-white hover:border-indigo-300"
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment-method"
                        value="points"
                        checked={paymentMethod === "points"}
                        onChange={() => setPaymentMethod("points")}
                      />
                      <div>
                        <div className="font-semibold text-gray-900">포인트 구매</div>
                        <div className="text-[11px] text-gray-600">번역 이용 전 포인트를 충전하여 사용합니다.</div>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center justify-between px-3 py-2 rounded-md border cursor-pointer ${
                    paymentMethod === "subscription"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-300 bg-white hover:border-indigo-300"
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment-method"
                        value="subscription"
                        checked={paymentMethod === "subscription"}
                        onChange={() => setPaymentMethod("subscription")}
                      />
                      <div>
                        <div className="font-semibold text-gray-900">구독권 구매</div>
                        <div className="text-[11px] text-gray-600">월 구독권(베이직/스탠다드/프리미엄)으로 번역을 이용합니다.</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSubscriptionInfo(true)}
                      className="ml-2 px-2 py-1 text-[11px] rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      구독권 안내
                    </button>
                  </label>

                  <label className={`flex items-center justify-between px-3 py-2 rounded-md border cursor-pointer ${
                    paymentMethod === "oneTime"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-300 bg-white hover:border-indigo-300"
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="payment-method"
                        value="oneTime"
                        checked={paymentMethod === "oneTime"}
                        onChange={() => setPaymentMethod("oneTime")}
                      />
                      <div>
                        <div className="font-semibold text-gray-900">1회 서비스 이용료</div>
                        <div className="text-[11px] text-gray-600">이번 의뢰 1건에 대해서만 결제합니다.</div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* 추천인 코드 입력 */}
                <div className="mt-3">
                  <label className="block text-[11px] font-medium text-gray-700 mb-1">
                    추천인 코드
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="예: FRIEND123"
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs"
                  />
                  <p className="mt-1 text-[10px] text-gray-500">
                    * 첫 결제 / 이벤트 / 추천인 코드는 실제 결제 단계에서 자동으로 할인에 반영됩니다.
                  </p>
                </div>
              </section>

              {/* 할인 / 이벤트 안내 (읽기 전용) */}
              <section className="bg-white border border-gray-200 rounded-lg p-4 text-[11px]">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">할인 / 이벤트 안내</h2>
                <div className="max-h-56 overflow-y-auto border border-gray-200 rounded-md">
                  <table className="w-full text-[10px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-2 py-1 text-left">할인 유형</th>
                        <th className="px-2 py-1 text-right">할인율</th>
                        <th className="px-2 py-1 text-left">서비스 레벨</th>
                        <th className="px-2 py-1 text-left">내용/혜택</th>
                        <th className="px-2 py-1 text-left">금액</th>
                        <th className="px-2 py-1 text-left">결제 분류</th>
                        <th className="px-2 py-1 text-left">결제 내용</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PAYMENT_PLANS.map((p) => (
                        <tr key={p.id} className="border-b border-gray-100 last:border-0">
                          <td className="px-2 py-1">{p.label}</td>
                          <td className="px-2 py-1 text-right">{p.discountRate}%</td>
                          <td className="px-2 py-1">{p.serviceLevel}</td>
                          <td className="px-2 py-1">
                            {p.contentLabel || '-'} {p.benefit && `(${p.benefit})`}
                          </td>
                          <td className="px-2 py-1">{p.amount || '-'}</td>
                          <td className="px-2 py-1">{p.paymentType}</td>
                          <td className="px-2 py-1">{p.paymentContent}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="bg-white border border-indigo-200 rounded-lg p-4 text-xs shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">금액 요약</h2>
                {isCalculating && (
                  <div className="text-[11px] text-blue-600 mb-2">기본 금액 계산 중...</div>
                )}
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">기본 금액</span>
                  <span className="font-medium text-gray-900">
                    {baseAmount ? `₩${baseAmount.toLocaleString()}` : "-"}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">글자 수</span>
                  <span className="font-medium text-gray-900">
                    {charCount ? `${charCount.toLocaleString()}자` : "-"}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">긴급도 ({urgency.label})</span>
                  <span className="font-medium text-gray-900">× {urgency.multiplier}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">번역 타입 ({translationType.label})</span>
                  <span className="font-medium text-indigo-600">{translationType.extra}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-2">
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-semibold text-gray-900">합계 (VAT 별도)</span>
                    <span className="text-xl font-bold text-indigo-600">
                      {totalAmount ? `₩${totalAmount.toLocaleString()}` : "₩0"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700"
                >
                  의뢰하기
                  <ChevronRight className="w-4 h-4" />
                </button>

                <p className="mt-2 text-[11px] text-gray-500 text-center">
                  * 실제 결제 연동 전까지는 모의 의뢰로 처리됩니다.
                </p>
              </section>
            </div>
          </aside>
        </div>
      </div>

      {/* 구독권 안내 모달 */}
      {showSubscriptionInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6 text-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-1">구독권 안내</h2>
                <p className="text-[11px] text-gray-600">
                  번역 사용 패턴에 맞게 베이직 / 스탠다드 / 프리미엄 중에서 선택하세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSubscriptionInfo(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {[
                {
                  id: "basic" as const,
                  name: "베이직",
                  price: "월 5,000원",
                  desc: "AI 번역 10,000자 포함",
                  bestFor: "가볍게 테스트해보고 싶은 개인",
                },
                {
                  id: "standard" as const,
                  name: "스탠다드",
                  price: "월 10,000원",
                  desc: "AI + 에디터 혼합, 30,000자",
                  bestFor: "정기적으로 번역이 필요한 프리랜서",
                },
                {
                  id: "premium" as const,
                  name: "프리미엄",
                  price: "월 20,000원",
                  desc: "AI + 휴먼 감수, 50,000자",
                  bestFor: "고품질 번역이 필요한 기업/전문가",
                },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => {
                    setSubscriptionTier(tier.id);
                    setPaymentMethod("subscription");
                  }}
                  className={`h-full flex flex-col items-start justify-between px-3 py-3 rounded-lg border text-left ${
                    subscriptionTier === tier.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-white hover:border-indigo-300"
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900 mb-1">{tier.name}</div>
                    <div className="text-[11px] text-indigo-600 font-semibold mb-1">{tier.price}</div>
                    <div className="text-[11px] text-gray-700 mb-1">{tier.desc}</div>
                    <div className="text-[10px] text-gray-500">추천 대상: {tier.bestFor}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowSubscriptionInfo(false)}
                className="px-4 py-2 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
