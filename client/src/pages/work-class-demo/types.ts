export type DomainCode = 'TESOL' | 'PROMPT' | 'TRANS' | 'ETHICS' | 'ITT';
export type TierCode = 'general' | 'expert' | 'educator';
export type ModalityCode = 'doc' | 'video' | 'audio' | 'image' | 'code' | 'live';
export type IndustryCode =
  | 'med' | 'law' | 'fin' | 'gov' | 'edu' | 'it' | 'media' | 'trade' | 'gen';

export type GovAxis = 'translation' | 'ethics' | 'security';
export type GovLevel = 'fixed' | 'semi' | 'optional';

export type ActorCode = 'product_owner' | 'operator' | 'instructor' | 'staff';
export type VerbCode = 'sell' | 'operate' | 'teach' | 'certify';

export interface Facets {
  domain: DomainCode;
  tier: TierCode;
  grade?: string;
  modality: ModalityCode;
  industry: IndustryCode;
}

export type GovernanceMatrix = Record<GovAxis, GovLevel>;

export interface SampleItem {
  id: string;
  label: string;
  facets: Facets;
  note?: string;
}

export type LensKind = 'ai-studio' | 'work-studio' | 'homepage';
export type PlanKind = 'existing' | 'A' | 'B' | 'C';
