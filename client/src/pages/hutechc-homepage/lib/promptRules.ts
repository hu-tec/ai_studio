// 프롬프트 규정 데이터 타입 정의

export type MainCategory = "document" | "voice" | "video" | "creative";

export type PresetType = "basic" | "institution" | "risk" | "light";

export type RuleStatus = "always" | "default" | "enhanced";

// 동적 필드 타입
export interface CustomField {
  id: string;
  label: string;
  value: string;
  type?: "text" | "select" | "checkbox";
}

// A. 고정 규정
export interface FixedRuleA {
  id: string;
  title?: string; // 항목 타이틀 (예: "항목 1", "항목(템플릿)")
  fieldLabels?: { // 필드 라벨 커스터마이징
    purpose?: string;
    target?: string;
    prohibition?: string;
    safety?: string;
    ethics?: string;
    security?: string;
    checklist?: string;
  };
  purpose: string;
  target: string;
  prohibition: string;
  safety: string;
  ethics: string;
  security: string;
  checklist: string;
  customFields?: CustomField[]; // 동적 필드
}

// B1. 고정 규정
export interface FixedRuleB1 {
  id: string;
  title?: string; // 항목 타이틀
  format: string;
  layout: string;
  volume: string;
  expressionRestrictions: string;
  verification: string;
  basis: string;
  responsibilityNotice: string;
  customFields?: CustomField[]; // 동적 필드
}

// B2. 준고정 규정
export interface SemiFixedRuleB2 {
  id: string;
  title?: string; // 항목 타이틀
  volume: "short" | "normal" | "detailed";
  technicalTerms: "low" | "medium" | "high";
  factualityVerification: boolean;
  logicVerification: boolean;
  consistencyVerification: boolean;
  basisStrength: "none" | "recommended" | "required";
  internalStandards: boolean;
  noticeLocation: "top" | "bottom" | "eachSection";
  customFields?: CustomField[]; // 동적 필드
}

// B3. 선택 규정
export interface OptionalRuleB3 {
  id: string;
  title?: string; // 항목 타이틀
  summaryFirst: boolean;
  fixedTableTemplate: boolean;
  glossary: boolean;
  citationMethod: "footnote" | "parentheses" | "references";
  verificationReport: boolean;
  customFields?: CustomField[]; // 동적 필드
}

// C1. 고정 규정
export interface FixedRuleC1 {
  id: string;
  title?: string; // 항목 타이틀
  fixedOutputStructure: boolean;
  checklistApplication: boolean;
  historyManagement: boolean;
  reviewNotation: boolean;
  customFields?: CustomField[]; // 동적 필드
}

// C2. 준고정 규정
export interface SemiFixedRuleC2 {
  id: string;
  title?: string; // 항목 타이틀
  structureDepth: "shallow" | "basic" | "deep";
  checkStrictness: "low" | "medium" | "high";
  institutionGuideReflection: boolean;
  institutionGuideRange: string;
  brandTone: boolean;
  brandToneStrength: "weak" | "medium" | "strong";
  readabilityEnhancement: boolean;
  readabilityStrength: "weak" | "medium" | "strong";
  sensitiveFilter: boolean;
  sensitiveFilterStrength: "weak" | "medium" | "strong";
  regionalCulturalScope: "kr" | "global";
  historyNotationLevel: "internal" | "display" | "detailed";
  reviewBadge: boolean;
  customFields?: CustomField[]; // 동적 필드
}

// C3. 선택 규정
export interface OptionalRuleC3 {
  id: string;
  title?: string; // 항목 타이틀
  sensitiveTopicFilter: boolean;
  countrySpecificStandards: boolean;
  versionControl: boolean;
  sensitiveWarningBox: boolean;
  changeHighlight: boolean;
  brandExamples: boolean;
  checklistResultReport: boolean;
  customFields?: CustomField[]; // 동적 필드
}

// 전체 규정 구조
export interface PromptRule {
  id: string;
  mainCategory: MainCategory;
  preset: PresetType;
  status: RuleStatus;
  enabled: boolean;
  order: number;
  
  // A. 고정 규정 (배열로 변경 - 여러 항목 가능)
  ruleA?: FixedRuleA[];
  
  // B. 준고정 규정 (배열로 변경 - 여러 항목 가능)
  ruleB1?: FixedRuleB1[];
  ruleB2?: SemiFixedRuleB2[];
  ruleB3?: OptionalRuleB3[];
  
  // C. 선택 규정 (강화 모드, 배열로 변경 - 여러 항목 가능)
  ruleC1?: FixedRuleC1[];
  ruleC2?: SemiFixedRuleC2[];
  ruleC3?: OptionalRuleC3[];
  
  // 동적 섹션 (D1, D2 등 추가 가능)
  customSections?: {
    id: string;
    title: string;
    type: string;
    items: CustomField[];
  }[];
  
  createdAt: string;
  updatedAt: string;
}

// 기본 규정 데이터 (이미지 내용 기반)
export const DEFAULT_RULES: PromptRule[] = [
  {
    id: "doc-basic",
    mainCategory: "document",
    preset: "basic",
    status: "default",
    enabled: true,
    order: 1,
    ruleA: [{
      id: "doc-basic-a",
      purpose: "문서 생성 목적",
      target: "독자/수신자",
      prohibition: "근거 없는 단정·학정 표현 금지",
      safety: "오해 방지 문단 포함",
      ethics: "편견 조장 금지, 민감 주제 보호",
      security: "개인정보·내부기밀·계정정보 노출 금지",
      checklist: "A/B/C 필수항목 누락 여부 자동 점검",
    }],
    ruleB1: [{
      id: "doc-basic-b1",
      format: "보고서형",
      layout: "제목 본문 요약 표 중심",
      volume: "보통~상세",
      expressionRestrictions: "전문용어 허용",
      verification: "사실성 검증·논리성 검증·일관성 검증",
      basis: "출처 필요 내부 기준",
      responsibilityNotice: "내부검토용",
    }],
    ruleB2: [{
      id: "doc-basic-b2",
      volume: "normal",
      technicalTerms: "medium",
      factualityVerification: true,
      logicVerification: true,
      consistencyVerification: true,
      basisStrength: "recommended",
      internalStandards: true,
      noticeLocation: "bottom",
    }],
    ruleB3: [{
      id: "doc-basic-b3",
      summaryFirst: false,
      fixedTableTemplate: true,
      glossary: false,
      citationMethod: "parentheses",
      verificationReport: false,
    }],
    ruleC1: [{
      id: "doc-basic-c1",
      fixedOutputStructure: true,
      checklistApplication: true,
      historyManagement: true,
      reviewNotation: true,
    }],
    ruleC2: [{
      id: "doc-basic-c2",
      structureDepth: "basic",
      checkStrictness: "medium",
      institutionGuideReflection: true,
      institutionGuideRange: "기본",
      brandTone: true,
      brandToneStrength: "medium",
      readabilityEnhancement: true,
      readabilityStrength: "medium",
      sensitiveFilter: true,
      sensitiveFilterStrength: "medium",
      regionalCulturalScope: "kr",
      historyNotationLevel: "display",
      reviewBadge: true,
    }],
    ruleC3: [{
      id: "doc-basic-c3",
      sensitiveTopicFilter: false,
      countrySpecificStandards: false,
      versionControl: false,
      sensitiveWarningBox: true,
      changeHighlight: true,
      brandExamples: false,
      checklistResultReport: false,
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "voice-basic",
    mainCategory: "voice",
    preset: "basic",
    status: "default",
    enabled: true,
    order: 2,
    ruleA: [{
      id: "voice-basic-a",
      purpose: "문서 생성 목적",
      target: "독자/수신자",
      prohibition: "근거 없는 단정·학정 표현 금지",
      safety: "오해 방지 문단 포함",
      ethics: "편견 조장 금지, 민감 주제 보호",
      security: "개인정보·내부기밀·계정정보 노출 금지",
      checklist: "A/B/C 필수항목 누락 여부 자동 점검",
    }],
    ruleB1: [{
      id: "voice-basic-b1",
      format: "설명형 단계별",
      layout: "단계별 구성",
      volume: "보통",
      expressionRestrictions: "간단한 언어",
      verification: "사실성 검증·일관성 검증",
      basis: "출처 기준",
      responsibilityNotice: "참고용",
    }],
    ruleB2: [{
      id: "voice-basic-b2",
      volume: "normal",
      technicalTerms: "low",
      factualityVerification: true,
      logicVerification: false,
      consistencyVerification: true,
      basisStrength: "recommended",
      internalStandards: false,
      noticeLocation: "bottom",
    }],
    ruleB3: [{
      id: "voice-basic-b3",
      summaryFirst: false,
      fixedTableTemplate: false,
      glossary: false,
      citationMethod: "parentheses",
      verificationReport: false,
    }],
    ruleC1: [{
      id: "voice-basic-c1",
      fixedOutputStructure: true,
      checklistApplication: true,
      historyManagement: true,
      reviewNotation: true,
    }],
    ruleC2: [{
      id: "voice-basic-c2",
      structureDepth: "basic",
      checkStrictness: "medium",
      institutionGuideReflection: true,
      institutionGuideRange: "기본",
      brandTone: true,
      brandToneStrength: "medium",
      readabilityEnhancement: true,
      readabilityStrength: "medium",
      sensitiveFilter: true,
      sensitiveFilterStrength: "medium",
      regionalCulturalScope: "kr",
      historyNotationLevel: "display",
      reviewBadge: true,
    }],
    ruleC3: [{
      id: "voice-basic-c3",
      sensitiveTopicFilter: false,
      countrySpecificStandards: false,
      versionControl: false,
      sensitiveWarningBox: true,
      changeHighlight: true,
      brandExamples: false,
      checklistResultReport: false,
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "video-basic",
    mainCategory: "video",
    preset: "basic",
    status: "default",
    enabled: true,
    order: 3,
    ruleA: [{
      id: "video-basic-a",
      purpose: "문서 생성 목적",
      target: "독자/수신자",
      prohibition: "근거 없는 단정·학정 표현 금지",
      safety: "오해 방지 문단 포함",
      ethics: "편견 조장 금지, 민감 주제 보호",
      security: "개인정보·내부기밀·계정정보 노출 금지",
      checklist: "A/B/C 필수항목 누락 여부 자동 점검",
    }],
    ruleB1: [{
      id: "video-basic-b1",
      format: "작성/설명형 단계별",
      layout: "단계별 구성",
      volume: "짧음~보통",
      expressionRestrictions: "간단한 언어",
      verification: "사실성 검증·일관성 검증",
      basis: "출처 기준",
      responsibilityNotice: "참고용",
    }],
    ruleB2: [{
      id: "video-basic-b2",
      volume: "normal",
      technicalTerms: "low",
      factualityVerification: true,
      logicVerification: false,
      consistencyVerification: true,
      basisStrength: "recommended",
      internalStandards: false,
      noticeLocation: "bottom",
    }],
    ruleB3: [{
      id: "video-basic-b3",
      summaryFirst: false,
      fixedTableTemplate: false,
      glossary: false,
      citationMethod: "parentheses",
      verificationReport: false,
    }],
    ruleC1: [{
      id: "video-basic-c1",
      fixedOutputStructure: true,
      checklistApplication: true,
      historyManagement: true,
      reviewNotation: true,
    }],
    ruleC2: [{
      id: "video-basic-c2",
      structureDepth: "basic",
      checkStrictness: "medium",
      institutionGuideReflection: true,
      institutionGuideRange: "기본",
      brandTone: true,
      brandToneStrength: "medium",
      readabilityEnhancement: true,
      readabilityStrength: "medium",
      sensitiveFilter: true,
      sensitiveFilterStrength: "medium",
      regionalCulturalScope: "kr",
      historyNotationLevel: "display",
      reviewBadge: true,
    }],
    ruleC3: [{
      id: "video-basic-c3",
      sensitiveTopicFilter: false,
      countrySpecificStandards: false,
      versionControl: false,
      sensitiveWarningBox: true,
      changeHighlight: true,
      brandExamples: false,
      checklistResultReport: false,
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "creative-basic",
    mainCategory: "creative",
    preset: "basic",
    status: "default",
    enabled: true,
    order: 4,
    ruleA: [{
      id: "creative-basic-a",
      purpose: "문서 생성 목적",
      target: "독자/수신자",
      prohibition: "근거 없는 단정·학정 표현 금지",
      safety: "오해 방지 문단 포함",
      ethics: "편견 조장 금지, 민감 주제 보호",
      security: "개인정보·내부기밀·계정정보 노출 금지",
      checklist: "A/B/C 필수항목 누락 여부 자동 점검",
    }],
    ruleB1: [{
      id: "creative-basic-b1",
      format: "작성 질문형",
      layout: "질문 기반 구성",
      volume: "무제한",
      expressionRestrictions: "감정 표현 제한(필요시)",
      verification: "일관성 검증",
      basis: "경험 기반",
      responsibilityNotice: "참고용",
    }],
    ruleB2: [{
      id: "creative-basic-b2",
      volume: "normal",
      technicalTerms: "low",
      factualityVerification: false,
      logicVerification: false,
      consistencyVerification: true,
      basisStrength: "none",
      internalStandards: false,
      noticeLocation: "bottom",
    }],
    ruleB3: [{
      id: "creative-basic-b3",
      summaryFirst: false,
      fixedTableTemplate: false,
      glossary: false,
      citationMethod: "parentheses",
      verificationReport: false,
    }],
    ruleC1: [{
      id: "creative-basic-c1",
      fixedOutputStructure: true,
      checklistApplication: true,
      historyManagement: true,
      reviewNotation: true,
    }],
    ruleC2: [{
      id: "creative-basic-c2",
      structureDepth: "basic",
      checkStrictness: "medium",
      institutionGuideReflection: false,
      institutionGuideRange: "기본",
      brandTone: false,
      brandToneStrength: "medium",
      readabilityEnhancement: false,
      readabilityStrength: "medium",
      sensitiveFilter: false,
      sensitiveFilterStrength: "medium",
      regionalCulturalScope: "kr",
      historyNotationLevel: "display",
      reviewBadge: false,
    }],
    ruleC3: [{
      id: "creative-basic-c3",
      sensitiveTopicFilter: false,
      countrySpecificStandards: false,
      versionControl: false,
      sensitiveWarningBox: false,
      changeHighlight: false,
      brandExamples: false,
      checklistResultReport: false,
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MAIN_CATEGORY_LABELS: Record<MainCategory, string> = {
  document: "문서",
  voice: "음성",
  video: "영상",
  creative: "창의",
};

export const PRESET_LABELS: Record<PresetType, string> = {
  basic: "기본",
  institution: "기관/브랜드",
  risk: "리스크(의학/법률)",
  light: "가볍게",
};

// 저장/로드 함수
export function loadStored(): PromptRule[] {
  if (typeof window === "undefined") return DEFAULT_RULES;
  try {
    const raw = localStorage.getItem("admin-prompt-rules");
    if (!raw) {
      // localStorage에 데이터가 없으면 기본값 저장 후 반환
      saveStored(DEFAULT_RULES);
      return DEFAULT_RULES;
    }
    const parsed = JSON.parse(raw) as PromptRule[];
    // 기본 규정이 없으면 기본값으로 초기화
    if (parsed.length === 0) {
      saveStored(DEFAULT_RULES);
      return DEFAULT_RULES;
    }
    
    // 기존 데이터를 배열 형식으로 변환 (하위 호환성)
    const normalized = parsed.map(rule => {
      const normalizedRule = { ...rule };
      // 각 섹션이 배열이 아니면 배열로 변환
      if (normalizedRule.ruleA && !Array.isArray(normalizedRule.ruleA)) {
        normalizedRule.ruleA = [normalizedRule.ruleA];
      }
      if (normalizedRule.ruleB1 && !Array.isArray(normalizedRule.ruleB1)) {
        normalizedRule.ruleB1 = [normalizedRule.ruleB1];
      }
      if (normalizedRule.ruleB2 && !Array.isArray(normalizedRule.ruleB2)) {
        normalizedRule.ruleB2 = [normalizedRule.ruleB2];
      }
      if (normalizedRule.ruleB3 && !Array.isArray(normalizedRule.ruleB3)) {
        normalizedRule.ruleB3 = [normalizedRule.ruleB3];
      }
      if (normalizedRule.ruleC1 && !Array.isArray(normalizedRule.ruleC1)) {
        normalizedRule.ruleC1 = [normalizedRule.ruleC1];
      }
      if (normalizedRule.ruleC2 && !Array.isArray(normalizedRule.ruleC2)) {
        normalizedRule.ruleC2 = [normalizedRule.ruleC2];
      }
      if (normalizedRule.ruleC3 && !Array.isArray(normalizedRule.ruleC3)) {
        normalizedRule.ruleC3 = [normalizedRule.ruleC3];
      }
      return normalizedRule;
    });
    
    // 기본 규정들이 있는지 확인하고 없으면 추가
    const hasDefaultRules = DEFAULT_RULES.every(defaultRule => 
      normalized.some(p => p.id === defaultRule.id)
    );
    if (!hasDefaultRules) {
      // 기본 규정이 하나라도 없으면 기본값과 병합
      const merged = [...DEFAULT_RULES];
      normalized.forEach(rule => {
        if (!DEFAULT_RULES.some(dr => dr.id === rule.id)) {
          merged.push(rule);
        }
      });
      saveStored(merged);
      return merged;
    }
    
    // 정규화된 데이터 저장 (다음 로드 시 배열 형식 유지)
    saveStored(normalized);
    return normalized;
  } catch {
    // 에러 발생 시 기본값 저장 후 반환
    saveStored(DEFAULT_RULES);
    return DEFAULT_RULES;
  }
}

export function saveStored(rules: PromptRule[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("admin-prompt-rules", JSON.stringify(rules));
  } catch {
    /* noop */
  }
}
