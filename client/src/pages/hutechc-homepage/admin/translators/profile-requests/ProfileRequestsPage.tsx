/* 원본: hutechc_hompage_real/app/(client-layout)/admin/translators/profile-requests/page.tsx */
import React, { useMemo, useState, useEffect } from 'react';
import type {
  ExpertType,
  Nationality,
  Language,
  TranslationLevel,
  AvailableTime,
  Experience,
  WorkType,
  LanguageCertificate,
  CallTime,
  Education,
  OverseasResidence,
  GradeApplication,
} from '../../../types/translatorGrade';

type RequestStatus = '새 번역사 요청' | '수정승인요청' | '수정승인완료';

type TranslatorRequest = {
  id: number;
  translatorName: string;
  level: string;
  calculatedLevel?: string; // 자동 산정된 레벨
  expertType?: ExpertType; // 번역사 구분
  area: string;
  subArea: string;
  status: RequestStatus;
  summary: string;
  detail: string;
  gradeApplication?: GradeApplication;
};

// 레벨 자동 산정 함수
function calculateLevel(application: GradeApplication): string {
  let score = 0;
  
  // 번역 경력 점수
  if (application.experience.includes('10년이상')) score += 30;
  else if (application.experience.includes('4-10년')) score += 20;
  else if (application.experience.includes('3년이하')) score += 10;
  
  // 학력 점수
  if (application.education.includes('교수')) score += 25;
  else if (application.education.includes('박사')) score += 20;
  else if (application.education.includes('석사')) score += 15;
  else if (application.education.includes('학사')) score += 10;
  
  // 해외 거주 기간 점수
  if (application.overseasResidence.includes('4~10년')) score += 20;
  else if (application.overseasResidence.includes('1~3년')) score += 15;
  else if (application.overseasResidence.includes('6개월~1년이면')) score += 10;
  
  // 언어 자격증 점수
  if (application.languageCertificates.includes('통번역대학원')) score += 15;
  else if (application.languageCertificates.includes('ITT통번역자격증')) score += 10;
  else if (application.languageCertificates.includes('해외경험있음')) score += 5;
  
  // 번역 레벨 점수
  if (application.translationLevel.includes('최상')) score += 15;
  else if (application.translationLevel.includes('상')) score += 10;
  else if (application.translationLevel.includes('중')) score += 5;
  
  // 전문가 타입 보너스
  if (application.expertType === '특수전문가') score += 10;
  else if (application.expertType === '고급전문가') score += 5;
  
  // 레벨 결정
  if (score >= 90) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  return 'new';
}

// 각 번역사별 실제 신청 데이터
const createGradeApplication = (
  id: string,
  translatorId: string,
  translatorName: string,
  expertType: ExpertType,
  availableLanguages: Language[],
  nationality: Nationality[],
  translationLevel: TranslationLevel[],
  availableTime: AvailableTime[],
  experience: Experience[],
  workType: WorkType[],
  languageCertificates: LanguageCertificate[],
  mtType: ('있음' | '없음' | '전혀모름')[],
  usesTranslationTools: ('있음' | '없음' | '전혀모름')[],
  callTime: CallTime[],
  education: Education[],
  overseasResidence: OverseasResidence[],
  remarks?: string
): GradeApplication => {
  const app: GradeApplication = {
    id,
    translatorId,
    translatorName,
    expertType,
    expertLevel: {},
    availableLanguages,
    nationality,
    translationLevel,
    availableTime,
    experience,
    workType,
    languageCertificates,
    mtType,
    usesTranslationTools,
    callTime,
    education,
    overseasResidence,
    remarks,
    status: 'pending',
    createdAt: new Date().toISOString(),
    requestedLevel: 'C',
  };
  return app;
};

// 김번역 - 법률 전문, 고급전문가, 8년 경력
const kimApplication = createGradeApplication(
  '1',
  '1',
  '김번역',
  '고급전문가',
  ['한국어', '영어', '일본어', '중국어'],
  ['한국인'],
  ['최상', '상'],
  ['언제든', '하루'],
  ['4-10년'],
  ['전문직(변호사, 의사, 노무사등)', '전문번역사'],
  ['통번역대학원', 'ITT통번역자격증', '해외경험있음'],
  ['있음'],
  ['있음'],
  ['오전', '오후'],
  ['석사'],
  ['1~3년'],
  '민사/상사 소송 서류, 계약서 번역 경력 8년입니다. 대형 로펌 근무 경력과 해외 로스쿨 석사 학위 보유하고 있습니다.'
);

// 이나라 - 법률 전문, 일반전문가, 5년 경력
const leeApplication = createGradeApplication(
  '2',
  '2',
  '이나라',
  '일반전문가',
  ['한국어', '영어', '일본어'],
  ['한국인'],
  ['최상', '상'],
  ['하루', '이틀'],
  ['4-10년'],
  ['전문번역사'],
  ['ITT통번역자격증', '해외경험있음'],
  ['있음'],
  ['있음'],
  ['오후'],
  ['학사'],
  ['1~3년'],
  '형사사건 피의자/피고인 면담 통역 및 조서 번역 경험 5년입니다. 경찰/검찰기관 수행 이력 포함됩니다.'
);

// 박글로벌 - 경영 전문, 일반전문가, 6년 경력
const parkApplication = createGradeApplication(
  '3',
  '3',
  '박글로벌',
  '일반전문가',
  ['한국어', '영어', '중국어'],
  ['한국인'],
  ['상', '중'],
  ['3일 이상', '10일 이상'],
  ['4-10년'],
  ['일반번역(학생, 프리랜서, 직장인)', '전문번역사'],
  ['토익', '토플', '해외경험있음'],
  ['있음'],
  ['있음'],
  ['주말'],
  ['석사'],
  ['1~3년'],
  '다국적 기업 IR 자료, 영문 사업계획서 번역 경험 6년입니다. 투자자 대상 프레젠테이션 제작 경험도 있습니다.'
);

// 최정밀 - IT 전문, 고급전문가, 7년 경력
const choiApplication = createGradeApplication(
  '4',
  '4',
  '최정밀',
  '고급전문가',
  ['한국어', '영어', '일본어', '중국어'],
  ['한국인'],
  ['최상', '상'],
  ['언제든', '당장'],
  ['4-10년'],
  ['특수업직장인(반도체, 기계, 공학, 환경, 무역 등)', '전문번역사'],
  ['토익', '토플', '해외경험있음'],
  ['있음'],
  ['있음'],
  ['종일'],
  ['박사'],
  ['1~3년'],
  '최근 3년간 반도체 장비 특허 명세서 번역 프로젝트 40건 이상 수행하여, 세부 분야에 반도체/특허를 추가 요청드립니다.'
);

// 오세무 - 세무 전문, 일반전문가, 5년 경력
const ohApplication = createGradeApplication(
  '5',
  '5',
  '오세무',
  '일반전문가',
  ['한국어', '영어'],
  ['한국인'],
  ['상'],
  ['당장', '하루'],
  ['4-10년'],
  ['전문번역사'],
  ['토익', '해외경험있음'],
  ['있음'],
  ['있음'],
  ['종일', '퇴근후'],
  ['학사'],
  ['없음'],
  '세무조정 보고서 번역 누적 120건을 달성하여 레벨 승급을 요청드립니다. 또한 평일 야간 긴급 작업 가능으로 설정 변경을 요청합니다.'
);

// 정헬스 - 의료 전문, 일반전문가, 6년 경력
const jungApplication = createGradeApplication(
  '6',
  '6',
  '정헬스',
  '일반전문가',
  ['한국어', '영어', '일본어'],
  ['한국인'],
  ['최상', '상'],
  ['하루', '이틀'],
  ['4-10년'],
  ['전문직(변호사, 의사, 노무사등)', '전문번역사'],
  ['토익', '토플', '해외경험있음'],
  ['있음'],
  ['있음'],
  ['오후'],
  ['석사'],
  ['6개월~1년이면'],
  '임상시험 프로토콜 및 CSR 번역 경험 30건 이상으로, 임상시험 전문 카테고리 추가 승인을 요청드립니다.'
);

// 한국제 - 국제거래 전문, 특수전문가, 12년 경력
const hanApplication = createGradeApplication(
  '7',
  '7',
  '한국제',
  '특수전문가',
  ['한국어', '영어', '중국어', '일본어'],
  ['한국인'],
  ['최상'],
  ['언제든', '당장'],
  ['10년이상'],
  ['전문직(변호사, 의사, 노무사등)', '전문번역사'],
  ['통번역대학원', 'ITT통번역자격증', '해외경험있음'],
  ['있음'],
  ['있음'],
  ['오전', '오후'],
  ['석사'],
  ['4~10년'],
  '2024-05-12에 국제계약 회의 통역 서비스가 승인되었습니다. 현재 통역/번역 동시 제공 가능합니다.'
);

// 서리서치 - 마케팅 전문, 일반전문가, 3년 경력
const seoApplication = createGradeApplication(
  '8',
  '8',
  '서리서치',
  '일반전문가',
  ['한국어', '영어'],
  ['한국인'],
  ['중', '하'],
  ['3일 이상', '10일 이상'],
  ['3년이하'],
  ['일반번역(학생, 프리랜서, 직장인)'],
  ['토익'],
  ['없음'],
  ['없음'],
  ['주말'],
  ['학사'],
  ['없음'],
  '2024-03-01에 요약/편집 옵션이 승인되어 현재 번역 + 요약 패키지 제공 중입니다.'
);

// 류컨설트 - 취업 전문, 일반전문가, 2년 경력
const ryuApplication = createGradeApplication(
  '9',
  '9',
  '류컨설트',
  '일반전문가',
  ['한국어', '영어'],
  ['한국인'],
  ['하'],
  ['하루', '이틀'],
  ['3년이하'],
  ['일반번역(학생, 프리랜서, 직장인)'],
  ['토익'],
  ['없음'],
  ['없음'],
  ['종일'],
  ['학사'],
  ['6개월~1년이면'],
  '2024-04-20에 템플릿 제공 기능이 승인되었습니다. 현재 3종의 권장 템플릿을 제공 중입니다.'
);

// 문세심 - 학술 전문, 고급전문가, 9년 경력
const moonApplication = createGradeApplication(
  '10',
  '10',
  '문세심',
  '고급전문가',
  ['한국어', '영어', '일본어'],
  ['한국인'],
  ['최상', '상'],
  ['언제든', '당장'],
  ['4-10년'],
  ['전문번역사'],
  ['토익', '토플', 'IELTS', '해외경험있음'],
  ['있음'],
  ['있음'],
  ['종일'],
  ['박사'],
  ['4~10년'],
  '2024-02-15에 논문 교정(에디팅) 서비스가 승인되어, 현재 번역 + 교정 패키지로 판매 중입니다.'
);

const initialRequests: TranslatorRequest[] = [
  {
    id: 1,
    translatorName: '김번역',
    level: calculateLevel(kimApplication),
    calculatedLevel: calculateLevel(kimApplication),
    expertType: kimApplication.expertType,
    area: '법률',
    subArea: '민사법',
    status: '새 번역사 요청',
    summary: '민사/상사 전문 신규 번역가 등록 요청',
    detail:
      '민사/상사 소송 서류, 계약서 번역 경력 8년입니다. 대형 로펌 근무 경력과 해외 로스쿨 석사 학위 보유하고 있습니다.',
    gradeApplication: kimApplication,
  },
  {
    id: 2,
    translatorName: '이나라',
    level: calculateLevel(leeApplication),
    calculatedLevel: calculateLevel(leeApplication),
    expertType: leeApplication.expertType,
    area: '법률',
    subArea: '형사법',
    status: '새 번역사 요청',
    summary: '형사사건 관련 통역/번역 신규 등록',
    detail:
      '형사사건 피의자/피고인 면담 통역 및 조서 번역 경험 5년입니다. 경찰/검찰기관 수행 이력 포함됩니다.',
    gradeApplication: leeApplication,
  },
  {
    id: 3,
    translatorName: '박글로벌',
    level: calculateLevel(parkApplication),
    calculatedLevel: calculateLevel(parkApplication),
    expertType: parkApplication.expertType,
    area: '경영',
    subArea: '영업',
    status: '새 번역사 요청',
    summary: 'IR/사업계획서 전문 번역가 등록 요청',
    detail:
      '다국적 기업 IR 자료, 영문 사업계획서 번역 경험 6년입니다. 투자자 대상 프레젠테이션 제작 경험도 있습니다.',
    gradeApplication: parkApplication,
  },
  {
    id: 4,
    translatorName: '최정밀',
    level: calculateLevel(choiApplication),
    calculatedLevel: calculateLevel(choiApplication),
    expertType: choiApplication.expertType,
    area: 'IT',
    subArea: '특허',
    status: '수정승인요청',
    summary: '전문 분야에 "반도체/특허" 세부 카테고리 추가 요청',
    detail:
      '최근 3년간 반도체 장비 특허 명세서 번역 프로젝트 40건 이상 수행하여, 세부 분야에 반도체/특허를 추가 요청드립니다.',
    gradeApplication: choiApplication,
  },
  {
    id: 5,
    translatorName: '오세무',
    level: calculateLevel(ohApplication),
    calculatedLevel: calculateLevel(ohApplication),
    expertType: ohApplication.expertType,
    area: '세무',
    subArea: '세무정산',
    status: '수정승인요청',
    summary: '레벨 C → B 승급 및 긴급 작업 가능 시간 추가 요청',
    detail:
      '세무조정 보고서 번역 누적 120건을 달성하여 레벨 승급을 요청드립니다. 또한 평일 야간 긴급 작업 가능으로 설정 변경을 요청합니다.',
    gradeApplication: ohApplication,
  },
  {
    id: 6,
    translatorName: '정헬스',
    level: calculateLevel(jungApplication),
    calculatedLevel: calculateLevel(jungApplication),
    expertType: jungApplication.expertType,
    area: '의료',
    subArea: '임상기록',
    status: '수정승인요청',
    summary: '의료 기록 번역에서 임상시험 관련 추가 전문분야 승인 요청',
    detail:
      '임상시험 프로토콜 및 CSR 번역 경험 30건 이상으로, 임상시험 전문 카테고리 추가 승인을 요청드립니다.',
    gradeApplication: jungApplication,
  },
  {
    id: 7,
    translatorName: '한국제',
    level: calculateLevel(hanApplication),
    calculatedLevel: calculateLevel(hanApplication),
    expertType: hanApplication.expertType,
    area: '국제거래',
    subArea: '계약',
    status: '수정승인완료',
    summary: '국제계약 통역 추가 승인 완료 (기존: 번역 전용)',
    detail:
      '2024-05-12에 국제계약 회의 통역 서비스가 승인되었습니다. 현재 통역/번역 동시 제공 가능합니다.',
    gradeApplication: hanApplication,
  },
  {
    id: 8,
    translatorName: '서리서치',
    level: calculateLevel(seoApplication),
    calculatedLevel: calculateLevel(seoApplication),
    expertType: seoApplication.expertType,
    area: '마케팅',
    subArea: '리서치',
    status: '수정승인완료',
    summary: '시장조사 리포트 요약/편집 기능 추가 승인',
    detail:
      '2024-03-01에 요약/편집 옵션이 승인되어 현재 번역 + 요약 패키지 제공 중입니다.',
    gradeApplication: seoApplication,
  },
  {
    id: 9,
    translatorName: '류컨설트',
    level: calculateLevel(ryuApplication),
    calculatedLevel: calculateLevel(ryuApplication),
    expertType: ryuApplication.expertType,
    area: '취업',
    subArea: '해외취업',
    status: '수정승인완료',
    summary: '해외 취업용 이력서/자소서 템플릿 제공 기능 승인',
    detail:
      '2024-04-20에 템플릿 제공 기능이 승인되었습니다. 현재 3종의 권장 템플릿을 제공 중입니다.',
    gradeApplication: ryuApplication,
  },
  {
    id: 10,
    translatorName: '문세심',
    level: calculateLevel(moonApplication),
    calculatedLevel: calculateLevel(moonApplication),
    expertType: moonApplication.expertType,
    area: '학술',
    subArea: '논문',
    status: '수정승인완료',
    summary: '논문 교정 서비스(에디팅) 추가 승인',
    detail:
      '2024-02-15에 논문 교정(에디팅) 서비스가 승인되어, 현재 번역 + 교정 패키지로 판매 중입니다.',
    gradeApplication: moonApplication,
  },
];

const statusTabs: RequestStatus[] = ['새 번역사 요청', '수정승인요청', '수정승인완료'];

// 상세 신청서 보기 컴포넌트
function GradeApplicationDetailView({
  request,
  onBack,
  onApprove,
  onReject,
  onLevelChange,
  onExpertTypeChange,
}: {
  request: TranslatorRequest;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  onLevelChange: (level: string) => void;
  onExpertTypeChange: (expertType: ExpertType) => void;
}) {
  const application = request.gradeApplication;
  
  // Hooks는 항상 조건문 전에 호출되어야 함
  const [editableLevel, setEditableLevel] = useState(request.level);
  const [editableExpertType, setEditableExpertType] = useState<ExpertType>(
    application?.expertType || '일반전문가'
  );

  // request.level이 변경되면 editableLevel도 업데이트
  useEffect(() => {
    setEditableLevel(request.level);
  }, [request.level]);

  // application.expertType이 변경되면 editableExpertType도 업데이트
  useEffect(() => {
    if (application?.expertType) {
      setEditableExpertType(application.expertType);
    }
  }, [application?.expertType]);

  // 조건부 반환은 Hooks 호출 후에
  if (!application) {
    return (
      <div className="mt-4 bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-gray-600">신청서 데이터가 없습니다.</p>
        <button
          onClick={onBack}
          className="mt-4 text-sm text-gray-600 hover:text-gray-900 underline"
        >
          ← 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const LANGUAGES: Language[] = [
    '한국어', '영어', '중국어', '일본어', '스페인어', '러시아어', '포르투갈어',
    '말레이시아어', '태국어', '프랑스어', '인도어', '베트남어', '파키스탄어',
    '몽골어', '네덜란드어', '그리스어', '히브리어',
  ];

  const NATIONALITIES: Nationality[] = [
    '한국인', '미국인', '영국인', '호주인', '중국인', '일본인', '스페니쉬',
    '러시아인', '포르투갈인', '말레이시아인', '대국인', '프랑스인', '인도인',
    '베트인', '파키스탄인', '몽골인', '네덜란드인', '그리스인', '히브리인',
  ];

  const TRANSLATION_LEVELS: TranslationLevel[] = ['최상', '상', '중', '하'];
  const AVAILABLE_TIMES: AvailableTime[] = ['언제든', '당장', '하루', '이틀', '3일 이상', '10일 이상'];
  const EXPERIENCES: Experience[] = ['신입', '3년이하', '4-10년', '10년이상'];
  const WORK_TYPES: WorkType[] = [
    '없음', '일반번역(학생, 프리랜서, 직장인)', '전문번역사',
    '특수업직장인(반도체, 기계, 공학, 환경, 무역 등)',
    '전문직(변호사, 의사, 노무사등)', '번역사',
  ];
  const LANGUAGE_CERTIFICATES: LanguageCertificate[] = [
    '없음', '토익', '토플', 'IELTS', 'ITT통번역자격증',
    '통번역대학원', '해외경험있음', '그외',
  ];
  const CALL_TIMES: CallTime[] = ['종일', '오전', '오후', '퇴근후', '주말'];
  const EDUCATION_LEVELS: Education[] = ['고졸이하', '고졸', '초대졸', '학사', '석사', '박사', '교수'];
  const OVERSEAS_RESIDENCE: OverseasResidence[] = ['없음', '6개월~1년이면', '1~3년', '4~10년'];

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-lg p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← 목록으로 돌아가기
          </button>
          <h2 className="text-2xl font-bold text-gray-900">번역사 등급</h2>
          <p className="text-sm text-gray-600 mt-1">번역사: {request.translatorName}</p>
        </div>
        <div className="flex gap-2">
          {request.status !== '수정승인완료' && (
            <>
              <button
                onClick={onReject}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                반려
              </button>
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                저장
              </button>
            </>
          )}
        </div>
      </div>

      {/* 전문가 타입 표시 및 수정 */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">전문가 타입:</label>
          {request.status !== '수정승인완료' ? (
            <select
              value={editableExpertType}
              onChange={(e) => {
                const newType = e.target.value as ExpertType;
                setEditableExpertType(newType);
                onExpertTypeChange(newType);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="일반전문가">일반전문가</option>
              <option value="고급전문가">고급전문가</option>
              <option value="특수전문가">특수전문가</option>
            </select>
          ) : (
            <span className="text-sm text-gray-700">{editableExpertType}</span>
          )}
        </div>
      </div>

      {/* 필터 양식 */}
      <div className="space-y-6">
        {/* 산정된 레벨 표시 및 수정 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">산정된 레벨</label>
          <div className="flex items-center gap-2">
            {request.status !== '수정승인완료' ? (
              <select
                value={editableLevel}
                onChange={(e) => {
                  setEditableLevel(e.target.value);
                  onLevelChange(e.target.value);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">신입</option>
                <option value="C">C등급</option>
                <option value="B">B등급</option>
                <option value="A">A등급</option>
                <option value="native">원어민</option>
              </select>
            ) : (
              <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-semibold">
                {editableLevel === 'new' ? '신입' : editableLevel === 'native' ? '원어민' : `${editableLevel}등급`}
              </span>
            )}
            {request.calculatedLevel && (
              <span className="text-xs text-gray-500">
                (자동 산정: {request.calculatedLevel === 'new' ? '신입' : request.calculatedLevel === 'native' ? '원어민' : `${request.calculatedLevel}등급`})
              </span>
            )}
          </div>
        </div>

        {/* 가능언어 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">가능언어</label>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {LANGUAGES.map((lang) => (
              <label key={lang} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={application.availableLanguages.includes(lang)}
                  disabled
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{lang}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 국적 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">국적</label>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {NATIONALITIES.map((nat) => (
              <label key={nat} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={application.nationality.includes(nat)}
                  disabled
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{nat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 번역레벨 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">번역레벨</label>
          <div className="flex gap-2">
            {TRANSLATION_LEVELS.map((level) => (
              <label key={level} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={application.translationLevel.includes(level)}
                  disabled
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 번역가능시간 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">번역가능시간</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TIMES.map((time) => (
              <label key={time} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={application.availableTime.includes(time)}
                  disabled
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{time}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 번역경력 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">번역경력</label>
          <div className="flex gap-2">
            {EXPERIENCES.map((exp) => (
              <label key={exp} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={application.experience.includes(exp)}
                  disabled
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{exp}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 작업 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">작업</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {WORK_TYPES.map((work) => (
              <label key={work} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={application.workType.includes(work)}
                  disabled
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{work}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 언어자격증 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">언어자격증</label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {LANGUAGE_CERTIFICATES.map((cert) => (
              <label key={cert} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={application.languageCertificates.includes(cert)}
                  disabled
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{cert}</span>
              </label>
            ))}
          </div>
        </div>

        {/* MT강형 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">MT강형</label>
          <div className="flex gap-2">
            {(['있음', '없음', '전혀모름'] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={application.mtType.includes(type)}
                  disabled
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 번역기사용 유무 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">번역기사용 유무</label>
          <div className="flex gap-2">
            {(['있음', '없음', '전혀모름'] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={application.usesTranslationTools.includes(type)}
                  disabled
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 통화가능시간 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">통화가능시간</label>
          <div className="flex flex-wrap gap-2">
            {CALL_TIMES.map((time) => (
              <label key={time} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={application.callTime.includes(time)}
                  disabled
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{time}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 학력 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">학력</label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {EDUCATION_LEVELS.map((edu) => (
              <label key={edu} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={application.education.includes(edu)}
                  disabled
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{edu}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 해외거주기간 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">해외거주기간</label>
          <div className="flex gap-2">
            {OVERSEAS_RESIDENCE.map((period) => (
              <label key={period} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={application.overseasResidence.includes(period)}
                  disabled
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{period}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 비고 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">비고</label>
          <textarea
            value={application.remarks || ''}
            disabled
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
      </div>

      {/* 하단 버튼 */}
      {request.status !== '수정승인완료' && (
        <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onReject}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            반려
          </button>
          <button
            onClick={onApprove}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            저장
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProfileRequestsPage() {
  const [activeStatus, setActiveStatus] = useState<RequestStatus>('새 번역사 요청');
  const [requests, setRequests] = useState<TranslatorRequest[]>(initialRequests);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = useMemo(
    () => requests.filter((r) => r.status === activeStatus),
    [requests, activeStatus],
  );

  const selected = useMemo(
    () => {
      const found = requests.find((r) => r.id === selectedId);
      return found ? { ...found } : null;
    },
    [requests, selectedId],
  );

  const handleLevelChange = (level: string) => {
    if (!selectedId) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedId ? { ...r, level } : r,
      ),
    );
  };

  const handleExpertTypeChange = (expertType: ExpertType) => {
    if (!selectedId) return;
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === selectedId && r.gradeApplication) {
          return {
            ...r,
            expertType,
            gradeApplication: {
              ...r.gradeApplication,
              expertType,
            },
          };
        }
        return r;
      }),
    );
  };

  const handleApprove = () => {
    if (!selected) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selected.id
          ? { ...r, status: '수정승인완료', summary: r.summary, detail: r.detail }
          : r,
      ),
    );
    setActiveStatus('수정승인완료');
  };

  const handleReject = () => {
    if (!selected) return;
    // 간단히 반려 시 리스트에서 제거
    setRequests((prev) => prev.filter((r) => r.id !== selected.id));
    setSelectedId(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">번역사 프로필 요청 리스트</h1>
        <p className="text-sm text-gray-600">
          번역사 신규 등록, 프로필 수정 승인 요청을 상태별로 확인하고 승인/반려할 수 있습니다.
        </p>
      </div>

      {/* 상단 상태 탭 */}
      <div className="flex gap-2">
        {statusTabs.map((tab) => {
          const isActive = tab === activeStatus;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveStatus(tab);
                setSelectedId(null);
              }}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {!selectedId ? (
        // 요청 리스트 화면
        <div className="mt-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">
              {activeStatus} ({filtered.length}건)
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500">해당 상태의 요청이 없습니다.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">번역사</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">번역사 구분</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">레벨</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">전문분야</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">요청 요약</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">액션</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2 font-medium text-gray-900">{req.translatorName}</td>
                    <td className="px-4 py-2 text-gray-700">
                      {req.expertType || '-'}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                        레벨 {req.level}
                      </span>
                      {req.calculatedLevel && req.calculatedLevel !== req.level && (
                        <span className="ml-1 text-xs text-gray-500">
                          (자동: {req.calculatedLevel})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {req.area} / {req.subArea}
                    </td>
                    <td className="px-4 py-2 text-gray-700 truncate max-w-xs" title={req.summary}>
                      {req.summary}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => setSelectedId(req.id)}
                        className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                      >
                        신청서 자세히 보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        // 상세 신청서 화면
        <GradeApplicationDetailView
          request={selected!}
          onBack={() => setSelectedId(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onLevelChange={handleLevelChange}
          onExpertTypeChange={handleExpertTypeChange}
        />
      )}
    </div>
  );
}
