/**
 * 가격 계산 유틸리티
 * payment-guide의 가격표를 기반으로 기본 금액을 자동 산정합니다.
 */

// ============= 가격 데이터 =============

// 1. 번역 방식별 기본 요금
export const BASE_PRICES = {
  translator_text: 50, // ₩50/단어
  translator_voice: 3000, // ₩3,000/분
  translator_video: 5000, // ₩5,000/분
  ai_text: 3, // ₩3/글자
  ai_voice: 500, // ₩500/분
  ai_video: 800, // ₩800/분
} as const;

// 2. 언어 티어별 계수
export const LANGUAGE_TIERS: Record<string, number> = {
  // Tier 1
  ko: 1.0,
  en: 1.0,
  ja: 1.0,
  zh: 1.0,
  es: 1.0,
  // Tier 2
  ar: 1.2,
  vi: 1.2,
  fr: 1.2,
  de: 1.2,
  th: 1.2,
  ru: 1.2,
  // Tier 3
  pt: 1.5,
  it: 1.5,
  tr: 1.5,
  nl: 1.5,
  sv: 1.5,
  pl: 1.5,
  // Tier 4
  hi: 2.0,
  id: 2.0,
  ms: 2.0,
  bn: 2.0,
  ur: 2.0,
  fa: 2.0,
} as const;

// 3. 전문 분야별 추가 요금
export const FIELD_SURCHARGES: Record<string, number> = {
  general: 0,
  'biz-marketing': 25, // 마케팅 +₩25/단어
  'law-domestic': 30, // 법률/계약 +₩30/단어
  'law-international': 30,
  'tech-manual': 35, // 기술/IT +₩35/단어
  'tech-spec': 35,
  // 학술/논문 +₩38/단어 (추후 추가 가능)
  'med-general': 40, // 의료/제약 +₩40/단어
  'med-pharma': 40,
  // 금융 +₩45/단어 (추후 추가 가능)
  'gen-document': 0,
  'gen-etc': 0,
} as const;

// ============= 계산 함수 =============

interface CalculationParams {
  // STEP 1에서 받는 정보
  categoryId: string; // law-domestic, biz-marketing 등
  targetLanguage: string; // 대상 언어 코드 (기본값: 첫 번째 대상 언어)
  isAI: boolean; // AI 사용 여부
  isHumanReview: boolean; // 휴먼 리뷰/감수 여부

  // 파일에서 감지된 정보
  contentLength: number; // 글자 수 (텍스트) 또는 분 (음성/동영상)
  contentType: 'text' | 'voice' | 'video'; // 콘텐츠 타입

  // 휴먼 레벨 (선택사항)
  humanLevel?: 'standard' | 'senior';
}

/**
 * 기본 금액 계산
 *
 * 계산 순서:
 * 1. 기본 단가 × 콘텐츠 길이 = 기본 금액
 * 2. 분야 추가 요금 더하기
 * 3. 언어 티어 계수 적용
 * 4. 휴먼 리뷰 추가 (선택사항)
 */
export function calculateBaseAmount(params: CalculationParams): number {
  const {
    categoryId,
    targetLanguage,
    isAI,
    isHumanReview,
    contentLength,
    contentType,
    humanLevel = 'standard',
  } = params;

  // Step 1: 기본 요금 계산
  let basePrice: number;

  if (isAI) {
    // AI 번역사
    if (contentType === 'text') {
      basePrice = BASE_PRICES.ai_text; // ₩3/글자
    } else if (contentType === 'voice') {
      basePrice = BASE_PRICES.ai_voice; // ₩500/분
    } else {
      basePrice = BASE_PRICES.ai_video; // ₩800/분
    }
  } else {
    // 인간 번역사
    if (contentType === 'text') {
      basePrice = BASE_PRICES.translator_text; // ₩50/단어
    } else if (contentType === 'voice') {
      basePrice = BASE_PRICES.translator_voice; // ₩3,000/분
    } else {
      basePrice = BASE_PRICES.translator_video; // ₩5,000/분
    }
  }

  let amount = contentLength * basePrice;

  // Step 2: 분야 추가 요금 (텍스트만 적용)
  if (contentType === 'text') {
    const fieldSurcharge = FIELD_SURCHARGES[categoryId] || 0;
    amount += contentLength * fieldSurcharge;
  }

  // Step 3: 언어 티어 계수 적용
  const languageTier = LANGUAGE_TIERS[targetLanguage] || 1.0;
  amount *= languageTier;

  // Step 4: 휴먼 리뷰/감수 추가 (AI 번역의 경우 선택적)
  if (isHumanReview && isAI) {
    // AI 번역 + 휴먼 리뷰 (약 30% 추가)
    amount *= 1.3;
  }

  return Math.round(amount);
}

/**
 * 계산 상세 정보 반환
 * (UI에서 단계별 계산 결과를 표시할 때 사용)
 */
export interface PriceBreakdown {
  baseAmount: number; // 기본 금액
  fieldSurcharge: number; // 분야 추가
  subtotalBeforeTier: number; // 언어 티어 적용 전 소계
  languageTier: number; // 적용된 언어 티어
  subtotalAfterTier: number; // 언어 티어 적용 후
  humanReviewAddition?: number; // 휴먼 리뷰 추가분
  finalAmount: number; // 최종 금액
}

export function calculatePriceBreakdown(params: CalculationParams): PriceBreakdown {
  const {
    categoryId,
    targetLanguage,
    isAI,
    isHumanReview,
    contentLength,
    contentType,
  } = params;

  // Step 1: 기본 요금
  let basePrice: number;
  if (isAI) {
    if (contentType === 'text') basePrice = BASE_PRICES.ai_text;
    else if (contentType === 'voice') basePrice = BASE_PRICES.ai_voice;
    else basePrice = BASE_PRICES.ai_video;
  } else {
    if (contentType === 'text') basePrice = BASE_PRICES.translator_text;
    else if (contentType === 'voice') basePrice = BASE_PRICES.translator_voice;
    else basePrice = BASE_PRICES.translator_video;
  }

  const baseAmount = contentLength * basePrice;

  // Step 2: 분야 추가 요금 (텍스트만)
  let fieldSurcharge = 0;
  if (contentType === 'text') {
    fieldSurcharge = contentLength * (FIELD_SURCHARGES[categoryId] || 0);
  }

  const subtotalBeforeTier = baseAmount + fieldSurcharge;

  // Step 3: 언어 티어 계수
  const languageTier = LANGUAGE_TIERS[targetLanguage] || 1.0;
  const subtotalAfterTier = subtotalBeforeTier * languageTier;

  // Step 4: 휴먼 리뷰
  let humanReviewAddition = 0;
  let finalAmount = subtotalAfterTier;

  if (isHumanReview && isAI) {
    humanReviewAddition = subtotalAfterTier * 0.3;
    finalAmount = subtotalAfterTier + humanReviewAddition;
  }

  return {
    baseAmount: Math.round(baseAmount),
    fieldSurcharge: Math.round(fieldSurcharge),
    subtotalBeforeTier: Math.round(subtotalBeforeTier),
    languageTier,
    subtotalAfterTier: Math.round(subtotalAfterTier),
    humanReviewAddition: humanReviewAddition > 0 ? Math.round(humanReviewAddition) : undefined,
    finalAmount: Math.round(finalAmount),
  };
}

/**
 * 파일에서 텍스트를 추출하고 글자/단어 수를 계산합니다.
 * (현재는 기본 구현, 추후 파일 타입별 처리 확대 예정)
 */
export async function extractTextStats(
  file: File
): Promise<{ wordCount: number; charCount: number; minutes: number }> {
  const fileName = file.name.toLowerCase();

  try {
    // 텍스트 파일
    if (fileName.endsWith('.txt')) {
      const text = await file.text();
      const charCount = text.length;
      const wordCount = text.trim().split(/\s+/).length;
      return { wordCount, charCount, minutes: 0 };
    }

    // JSON 파일 (테스트용)
    if (fileName.endsWith('.json')) {
      const text = await file.text();
      const charCount = text.length;
      const wordCount = text.trim().split(/\s+/).length;
      return { wordCount, charCount, minutes: 0 };
    }

    // PDF, DOCX 등은 추후 추가 (라이브러리 필요)
    // 현재는 파일 크기를 기반으로 예측
    const estimatedChars = Math.floor(file.size / 2); // 평균 2바이트/글자 가정
    const estimatedWords = Math.floor(estimatedChars / 5); // 평균 5글자/단어 가정

    return {
      wordCount: estimatedWords,
      charCount: estimatedChars,
      minutes: 0,
    };
  } catch (error) {
    console.error('Failed to extract text stats:', error);
    // 오류 시 파일 크기 기반 예측
    const estimatedChars = Math.floor(file.size / 2);
    const estimatedWords = Math.floor(estimatedChars / 5);
    return { wordCount: estimatedWords, charCount: estimatedChars, minutes: 0 };
  }
}

/**
 * 계산을 위한 STEP 1 데이터 타입
 */
export interface TranslationRequestData {
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
    type: string; // 'none', 'review'
    level: string; // 'standard', 'senior'
    urgent: boolean;
  };
  files: { name: string; size: number }[];
}

/**
 * STEP 1 데이터와 파일 정보를 기반으로 기본 금액을 계산합니다.
 */
export async function calculateAmountFromStep1(
  requestData: TranslationRequestData,
  stats: { wordCount: number; charCount: number; minutes: number }
): Promise<number> {
  const isAI = requestData.ai.models.length > 0;
  const isHumanReview = requestData.humanWork.type === 'review';
  const targetLanguage = requestData.language.primaryTarget || 'en';
  const categoryId = requestData.middleCategory; // 중분류 ID 사용

  // 콘텐츠 타입 결정 (현재는 텍스트로 기본 설정)
  const contentType: 'text' | 'voice' | 'video' = 'text';
  const contentLength = stats.charCount; // 글자 수 사용

  const params: CalculationParams = {
    categoryId,
    targetLanguage,
    isAI,
    isHumanReview,
    contentLength,
    contentType,
    humanLevel: (requestData.humanWork.level as 'standard' | 'senior') || 'standard',
  };

  return calculateBaseAmount(params);
}
