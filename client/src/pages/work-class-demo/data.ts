import type {
  Facets, GovernanceMatrix, SampleItem,
  DomainCode, IndustryCode, ActorCode, VerbCode, GovLevel,
} from './types';

// ─── 샘플 아이템 6종 ──────────────────────────────
export const SAMPLE_ITEMS: SampleItem[] = [
  {
    id: 'sm1',
    label: '초등 TESOL 교사연수 영상과정',
    facets: { domain: 'TESOL', tier: 'educator', grade: '5급', modality: 'video', industry: 'edu' },
    note: '초등학교 영어교사 대상 5급 영상강의',
  },
  {
    id: 'sm2',
    label: '법률 AI 프롬프트 전문가 1급',
    facets: { domain: 'PROMPT', tier: 'expert', grade: '1급', modality: 'doc', industry: 'law' },
    note: '소송장·준비서면 작성용 프롬프트',
  },
  {
    id: 'sm3',
    label: '의료 AI 번역 전문가 2급',
    facets: { domain: 'TRANS', tier: 'expert', grade: '2급', modality: 'doc', industry: 'med' },
    note: '의료 문서/논문 전문 번역',
  },
  {
    id: 'sm4',
    label: '정부 AI 윤리 가이드 일반 1급',
    facets: { domain: 'ETHICS', tier: 'general', grade: '1급', modality: 'doc', industry: 'gov' },
    note: '공공기관용 AI 윤리 가이드라인',
  },
  {
    id: 'sm5',
    label: '외교 동시통역 전문 1급',
    facets: { domain: 'ITT', tier: 'expert', grade: '1급', modality: 'live', industry: 'gov' },
    note: '국제회의 동시통역',
  },
  {
    id: 'sm6',
    label: '일반인 영어회화 TESOL 일반 2급',
    facets: { domain: 'TESOL', tier: 'general', grade: '2급', modality: 'doc', industry: 'gen' },
    note: '직장인 일반 영어회화',
  },
];

// ─── (domain × industry) 규정 기본값 매트릭스 seed ───
// high risk 산업(의료/법률/금융/정부)은 전 축 '규정'(fixed)
// 일반 산업은 전 축 '선택'(optional)
// 교육·IT·미디어·무역은 혼합
export function inferGovernance(domain: DomainCode, industry: IndustryCode): GovernanceMatrix {
  const HIGH: IndustryCode[] = ['med', 'law', 'fin', 'gov'];
  if (HIGH.includes(industry)) {
    return { translation: 'fixed', ethics: 'fixed', security: 'fixed' };
  }
  if (industry === 'gen') {
    return { translation: 'optional', ethics: 'optional', security: 'optional' };
  }
  // mid-risk
  const map: Record<IndustryCode, GovernanceMatrix> = {
    edu:   { translation: 'semi',     ethics: 'fixed', security: 'optional' },
    it:    { translation: 'optional', ethics: 'semi',  security: 'fixed' },
    media: { translation: 'semi',     ethics: 'semi',  security: 'optional' },
    trade: { translation: 'fixed',    ethics: 'optional', security: 'semi' },
    // unreachable but TS-complete
    med:   { translation: 'fixed', ethics: 'fixed', security: 'fixed' },
    law:   { translation: 'fixed', ethics: 'fixed', security: 'fixed' },
    fin:   { translation: 'fixed', ethics: 'fixed', security: 'fixed' },
    gov:   { translation: 'fixed', ethics: 'fixed', security: 'fixed' },
    gen:   { translation: 'optional', ethics: 'optional', security: 'optional' },
  };
  // domain-specific bump: ETHICS·TRANS·ITT domain은 각각 해당 축을 +1 상승
  const gov = { ...map[industry] };
  if (domain === 'ETHICS') gov.ethics = bump(gov.ethics);
  if (domain === 'TRANS' || domain === 'ITT') gov.translation = bump(gov.translation);
  if (domain === 'PROMPT') gov.security = bump(gov.security);
  return gov;
}

function bump(lv: GovLevel): GovLevel {
  if (lv === 'optional') return 'semi';
  if (lv === 'semi') return 'fixed';
  return 'fixed';
}

// ─── actor × verb × governance 허용 매트릭스 ───
// 원칙:
// - product_owner만 sell 가능
// - operator만 operate 가능
// - instructor/staff는 teach 가능
// - certify는 instructor만, 단 해당 governance.fixed 축이 있을 때 인증 필수
export function isAllowed(
  actor: ActorCode,
  verb: VerbCode,
  gov: GovernanceMatrix,
): { allowed: boolean; reason?: string } {
  // sell
  if (verb === 'sell') {
    if (actor !== 'product_owner') return { allowed: false, reason: '판매는 상품 주체만' };
    return { allowed: true };
  }
  // operate
  if (verb === 'operate') {
    if (actor !== 'operator') return { allowed: false, reason: '운영은 직원만' };
    return { allowed: true };
  }
  // teach
  if (verb === 'teach') {
    if (actor !== 'instructor' && actor !== 'staff') {
      return { allowed: false, reason: '강의는 강사/교육만' };
    }
    // 고정 규정 축이 있고 staff면 blocked
    const anyFixed = Object.values(gov).includes('fixed');
    if (anyFixed && actor === 'staff') {
      return { allowed: false, reason: '고정 규정 있음 → 인증 강사 필요' };
    }
    return { allowed: true };
  }
  // certify
  if (verb === 'certify') {
    if (actor !== 'instructor') return { allowed: false, reason: '인증은 강사만' };
    return { allowed: true };
  }
  return { allowed: false };
}

// ─── lens별 facet 진입 순서 ───
export const LENS_ORDER: Record<'ai-studio' | 'work-studio' | 'homepage', (keyof Facets)[]> = {
  'ai-studio':   ['modality', 'domain', 'tier', 'industry'],
  'work-studio': ['domain', 'industry', 'modality', 'tier'],
  'homepage':    ['domain', 'tier', 'industry'],
};
