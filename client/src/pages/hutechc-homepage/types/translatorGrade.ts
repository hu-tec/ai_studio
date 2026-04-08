// 번역사 등급 신청 관련 타입 정의

export type TranslatorLevel = 'new' | 'C' | 'B' | 'A' | 'native';

export type ExpertType = '일반전문가' | '고급전문가' | '특수전문가';

export type Nationality = 
  | '한국인' | '미국인' | '영국인' | '호주인' | '중국인' | '일본인' | '스페니쉬' 
  | '러시아인' | '포르투갈인' | '말레이시아인' | '대국인' | '프랑스인' | '인도인' 
  | '베트인' | '파키스탄인' | '몽골인' | '네덜란드인' | '그리스인' | '히브리인';

export type Language = 
  | '한국어' | '영어' | '중국어' | '일본어' | '스페인어' | '러시아어' | '포르투갈어' 
  | '말레이시아어' | '태국어' | '프랑스어' | '인도어' | '베트남어' | '파키스탄어' 
  | '몽골어' | '네덜란드어' | '그리스어' | '히브리어';

export type TranslationLevel = '최상' | '상' | '중' | '하';

export type AvailableTime = '언제든' | '당장' | '하루' | '이틀' | '3일 이상' | '10일 이상';

export type Experience = '신입' | '3년이하' | '4-10년' | '10년이상';

export type WorkType = 
  | '없음' | '일반번역(학생, 프리랜서, 직장인)' | '전문번역사' 
  | '특수업직장인(반도체, 기계, 공학, 환경, 무역 등)' 
  | '전문직(변호사, 의사, 노무사등)' | '번역사';

export type LanguageCertificate = 
  | '없음' | '토익' | '토플' | 'IELTS' | 'ITT통번역자격증' 
  | '통번역대학원' | '해외경험있음' | '그외';

export type CallTime = '종일' | '오전' | '오후' | '퇴근후' | '주말';

export type Education = 
  | '고졸이하' | '고졸' | '초대졸' | '학사' | '석사' | '박사' | '교수';

export type OverseasResidence = '없음' | '6개월~1년이면' | '1~3년' | '4~10년';

export interface GradeApplication {
  id: string;
  translatorId: string;
  translatorName: string;
  expertType: ExpertType;
  expertLevel: {
    A?: string;
    B?: string;
    C?: string;
  };
  availableLanguages: Language[];
  nationality: Nationality[];
  translationLevel: TranslationLevel[];
  availableTime: AvailableTime[];
  experience: Experience[];
  workType: WorkType[];
  languageCertificates: LanguageCertificate[];
  mtType: ('있음' | '없음' | '전혀모름')[];
  usesTranslationTools: ('있음' | '없음' | '전혀모름')[];
  callTime: CallTime[];
  education: Education[];
  overseasResidence: OverseasResidence[];
  remarks?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  requestedLevel: TranslatorLevel;
}
