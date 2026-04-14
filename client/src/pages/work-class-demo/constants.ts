import type {
  DomainCode, TierCode, ModalityCode, IndustryCode,
  GovAxis, GovLevel, ActorCode, VerbCode,
} from './types';

export const DOMAINS: { code: DomainCode; label: string; group: 'language' | 'ai' }[] = [
  { code: 'TESOL',  label: 'TESOL 영어교육', group: 'language' },
  { code: 'PROMPT', label: 'AI 프롬프트',    group: 'ai' },
  { code: 'TRANS',  label: 'AI 번역/통역',   group: 'ai' },
  { code: 'ETHICS', label: 'AI 윤리',        group: 'ai' },
  { code: 'ITT',    label: 'ITT 정통 통번역', group: 'language' },
];

export const TIERS: { code: TierCode; label: string; grades: string[] }[] = [
  { code: 'general',  label: '일반', grades: ['1급', '2급', '3급'] },
  { code: 'expert',   label: '전문', grades: ['1급', '2급'] },
  { code: 'educator', label: '교육', grades: ['1급','2급','3급','4급','5급','6급','7급','8급'] },
];

export const MODALITIES: { code: ModalityCode; label: string }[] = [
  { code: 'doc',   label: '문서' },
  { code: 'video', label: '영상' },
  { code: 'audio', label: '음성' },
  { code: 'image', label: '이미지' },
  { code: 'code',  label: '코드' },
  { code: 'live',  label: '실시간' },
];

export const INDUSTRIES: { code: IndustryCode; label: string; risk: 'high'|'mid'|'low' }[] = [
  { code: 'med',   label: '의료',   risk: 'high' },
  { code: 'law',   label: '법률',   risk: 'high' },
  { code: 'fin',   label: '금융',   risk: 'high' },
  { code: 'gov',   label: '정부',   risk: 'high' },
  { code: 'edu',   label: '교육',   risk: 'mid' },
  { code: 'it',    label: 'IT',     risk: 'mid' },
  { code: 'media', label: '미디어', risk: 'mid' },
  { code: 'trade', label: '무역',   risk: 'mid' },
  { code: 'gen',   label: '일반',   risk: 'low' },
];

export const GOV_AXES: { code: GovAxis; label: string }[] = [
  { code: 'translation', label: '번역' },
  { code: 'ethics',      label: '윤리' },
  { code: 'security',    label: '보안' },
];

export const GOV_LEVELS: { code: GovLevel; label: string; color: string; bg: string; border: string }[] = [
  { code: 'fixed',    label: '규정',    color: '#991b1b', bg: '#fee2e2', border: '#fecaca' },
  { code: 'semi',     label: '준규정',  color: '#b45309', bg: '#fef3c7', border: '#fde68a' },
  { code: 'optional', label: '선택규정', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
];

export const ACTORS: { code: ActorCode; label: string }[] = [
  { code: 'product_owner', label: '상품' },
  { code: 'operator',      label: '직원' },
  { code: 'instructor',    label: '강사' },
  { code: 'staff',         label: '교육' },
];

export const VERBS: { code: VerbCode; label: string }[] = [
  { code: 'sell',    label: '판매' },
  { code: 'operate', label: '운영' },
  { code: 'teach',   label: '강의' },
  { code: 'certify', label: '인증' },
];

export const USER_TIERS = [
  { code: 'admin',    label: '관리자', color: '#991b1b' },
  { code: 'manager',  label: '팀장',   color: '#b45309' },
  { code: 'user',     label: '사용자', color: '#2563eb' },
  { code: 'external', label: '외부인', color: '#7e22ce' },
];
