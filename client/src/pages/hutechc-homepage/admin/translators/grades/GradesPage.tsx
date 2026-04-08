/* 원본: hutechc_hompage_real/app/(client-layout)/admin/translators/grades/page.tsx */
import { useState } from 'react';

type TabType = 'general' | 'advanced' | 'specialized' | 'remarks';

type GradeKey = string; // 'A' | 'B' | 'C' | 'D' ...

/** 각 등급(A,B,C...)별 옵션 체크: { A: { '한국어': true, ... }, B: {...}, ... } */
type GradeOptionMap = Record<GradeKey, Record<string, boolean>>;

/** 탭 하나의 기준 데이터: 등급 열 A,B,C(또는 D..)별로 각 기준을 설정 */
interface PerTabCriteria {
  grades: GradeKey[];
  availableLanguages: GradeOptionMap;
  nationality: GradeOptionMap;
  translationLevel: GradeOptionMap;
  availableTime: GradeOptionMap;
  translationExperience: GradeOptionMap;
  occupation: GradeOptionMap;
  languageCertificates: GradeOptionMap;
  mtExperience: GradeOptionMap;
  translationTools: GradeOptionMap;
  callAvailableTime: GradeOptionMap;
  education: GradeOptionMap;
  overseasResidency: GradeOptionMap;
}

const OPTIONS = {
  availableLanguages: ['한국어', '영어', '중국어', '일본어', '스페인어', '러시아어', '포르투갈어', '말레이시아어', '태국어', '프랑스어', '인도어', '베트남어', '파키스탄어', '몽골어', '네덜란드어', '그리스어', '히브리어', '등등등'],
  nationality: ['한국인', '미국인', '영국인', '호주인', '중국인', '일본인', '스페니쉬', '러시아인', '포르투갈인', '말레이시아인', '태국인', '프랑스인', '인도인', '베트남인', '파키스탄인', '몽골인', '네덜란드인', '그리스인', '히브리인', '등등등'],
  translationLevel: ['최상', '상', '중', '하'],
  availableTime: ['언제든', '당장', '하루', '이틀', '3일 이상', '10일 이상'],
  translationExperience: ['신입', '3년이하', '4-10년', '10년이상'],
  occupation: ['없음', '일반번역(학생, 프리랜서, 직장인)', '전문번역사', '특수업직장인(반도체, 기계, 공학, 환경, 무역 등)', '전문직(변호사, 의사, 노무사 등)', '번역사'],
  languageCertificates: ['없음', '토익', '토플', 'IELTS', 'ITT통번역자격증', '통번역대학원', '해외경험있음', '그외'],
  mtExperience: ['있음', '없음', '전혀모름'],
  translationTools: ['있음', '없음', '전혀모름'],
  callAvailableTime: ['종일', '오전', '오후', '퇴근후', '주말'],
  education: ['고졸이하', '고졸', '초대졸', '학사', '석사', '박사', '교수'],
  overseasResidency: ['없음', '6개월~1년미만', '1~3년', '4~10년'],
} as const;

type OptionCategory = keyof typeof OPTIONS;

function createEmptyOptions(category: OptionCategory): Record<string, boolean> {
  return Object.fromEntries(OPTIONS[category].map((k) => [k, false]));
}

function createInitialGradeOptionMap(grades: GradeKey[], category: OptionCategory): GradeOptionMap {
  const empty = createEmptyOptions(category);
  return Object.fromEntries(grades.map((g) => [g, { ...empty }]));
}

/** 이미지 기준: A에 한국어,영어,중국어,프랑스어,네덜란드어,히브리어 등 / B,C는 일부만 etc. */
function createInitialPerTabCriteria(): PerTabCriteria {
  const grades: GradeKey[] = ['A', 'B', 'C'];

  const availableLanguages = createInitialGradeOptionMap(grades, 'availableLanguages');
  availableLanguages.A['한국어'] = true;
  availableLanguages.A['영어'] = true;
  availableLanguages.A['중국어'] = true;
  availableLanguages.A['프랑스어'] = true;
  availableLanguages.A['네덜란드어'] = true;
  availableLanguages.A['히브리어'] = true;

  const nationality = createInitialGradeOptionMap(grades, 'nationality');
  nationality.A['한국인'] = true;
  nationality.A['미국인'] = true;
  nationality.A['영국인'] = true;
  nationality.A['네덜란드인'] = true;
  nationality.A['히브리인'] = true;

  const translationLevel = createInitialGradeOptionMap(grades, 'translationLevel');
  translationLevel.A['최상'] = true;

  const availableTime = createInitialGradeOptionMap(grades, 'availableTime');
  availableTime.A['언제든'] = true;
  availableTime.A['당장'] = true;
  availableTime.A['하루'] = true;

  const translationExperience = createInitialGradeOptionMap(grades, 'translationExperience');
  translationExperience.A['신입'] = true;

  const occupation = createInitialGradeOptionMap(grades, 'occupation');
  occupation.A['없음'] = true;
  occupation.A['전문번역사'] = true;

  const languageCertificates = createInitialGradeOptionMap(grades, 'languageCertificates');
  languageCertificates.A['없음'] = true;

  const mtExperience = createInitialGradeOptionMap(grades, 'mtExperience');
  mtExperience.A['있음'] = true;

  const translationTools = createInitialGradeOptionMap(grades, 'translationTools');
  translationTools.A['있음'] = true;

  const callAvailableTime = createInitialGradeOptionMap(grades, 'callAvailableTime');
  callAvailableTime.A['종일'] = true;

  const education = createInitialGradeOptionMap(grades, 'education');
  education.A['고졸이하'] = true;
  education.A['고졸'] = true;
  education.A['초대졸'] = true;
  education.A['학사'] = true;

  const overseasResidency = createInitialGradeOptionMap(grades, 'overseasResidency');
  overseasResidency.A['없음'] = true;

  return {
    grades,
    availableLanguages,
    nationality,
    translationLevel,
    availableTime,
    translationExperience,
    occupation,
    languageCertificates,
    mtExperience,
    translationTools,
    callAvailableTime,
    education,
    overseasResidency,
  };
}

function createEmptyPerTabCriteria(): PerTabCriteria {
  const grades: GradeKey[] = ['A', 'B', 'C'];
  return {
    grades,
    availableLanguages: createInitialGradeOptionMap(grades, 'availableLanguages'),
    nationality: createInitialGradeOptionMap(grades, 'nationality'),
    translationLevel: createInitialGradeOptionMap(grades, 'translationLevel'),
    availableTime: createInitialGradeOptionMap(grades, 'availableTime'),
    translationExperience: createInitialGradeOptionMap(grades, 'translationExperience'),
    occupation: createInitialGradeOptionMap(grades, 'occupation'),
    languageCertificates: createInitialGradeOptionMap(grades, 'languageCertificates'),
    mtExperience: createInitialGradeOptionMap(grades, 'mtExperience'),
    translationTools: createInitialGradeOptionMap(grades, 'translationTools'),
    callAvailableTime: createInitialGradeOptionMap(grades, 'callAvailableTime'),
    education: createInitialGradeOptionMap(grades, 'education'),
    overseasResidency: createInitialGradeOptionMap(grades, 'overseasResidency'),
  };
}

/** 탭별로 독립된 기준: 전문가 유형(일반/고급/특수)마다 A,B,C 등급 기준을 따로 설정 → 자동배치에 사용 */
const initialCriteriaByTab: Record<TabType, PerTabCriteria> = {
  general: createInitialPerTabCriteria(),
  advanced: createEmptyPerTabCriteria(),
  specialized: createEmptyPerTabCriteria(),
  remarks: createEmptyPerTabCriteria(),
};

const CONDITION_LABELS: Record<OptionCategory, string> = {
  availableLanguages: '가능언어',
  nationality: '국적',
  translationLevel: '번역레벨',
  availableTime: '번역가능시간',
  translationExperience: '번역경력',
  occupation: '직업',
  languageCertificates: '언어자격증',
  mtExperience: 'MT경험',
  translationTools: '번역기사용 유무',
  callAvailableTime: '통화가능시간',
  education: '학력',
  overseasResidency: '해외거주기간',
};

export default function GradesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [selectedGrade, setSelectedGrade] = useState<GradeKey>('A'); // A|B|C 중 하나만 선택 → 아래 체크박스가 해당 등급 기준
  const [criteriaByTab, setCriteriaByTab] = useState<Record<TabType, PerTabCriteria>>(initialCriteriaByTab);

  const criteria = criteriaByTab[activeTab];
  const grades = criteria.grades;

  const setCriteria = (updater: (prev: PerTabCriteria) => PerTabCriteria) => {
    setCriteriaByTab((p) => ({ ...p, [activeTab]: updater(p[activeTab]) }));
  };

  /** 선택된 등급(selectedGrade)의 해당 기준(category) 옵션 체크 토글 */
  const handleOptionChange = (category: OptionCategory, optionKey: string) => {
    const grade = selectedGrade;
    setCriteria((prev) => {
      const gradeMap = prev[category][grade];
      if (!gradeMap) return prev;
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [grade]: { ...gradeMap, [optionKey]: !gradeMap[optionKey] },
        },
      };
    });
  };

  /** 등급 추가 (D, E, ...): 모든 체크박스 기준에 새 등급 열 추가 */
  const handleAddGrade = () => {
    const next = String.fromCharCode(grades[grades.length - 1].charCodeAt(0) + 1);
    if (next > 'Z') return;
    setCriteria((prev) => {
      const newGrades = [...prev.grades, next];
      const patch = (cat: OptionCategory) => ({
        ...prev[cat],
        [next]: createEmptyOptions(cat),
      });
      return {
        ...prev,
        grades: newGrades,
        availableLanguages: patch('availableLanguages'),
        nationality: patch('nationality'),
        translationLevel: patch('translationLevel'),
        availableTime: patch('availableTime'),
        translationExperience: patch('translationExperience'),
        occupation: patch('occupation'),
        languageCertificates: patch('languageCertificates'),
        mtExperience: patch('mtExperience'),
        translationTools: patch('translationTools'),
        callAvailableTime: patch('callAvailableTime'),
        education: patch('education'),
        overseasResidency: patch('overseasResidency'),
      };
    });
  };

  const tabs = [
    { id: 'general' as TabType, label: '일반전문가' },
    { id: 'advanced' as TabType, label: '고급전문가' },
    { id: 'specialized' as TabType, label: '특수전문가' },
    { id: 'remarks' as TabType, label: '비고' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-1">홈 &gt; 번역사 등급 관리</div>
          <h1 className="text-xl font-bold text-gray-900">번역사 등급 관리</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
            추가
          </button>
          <button type="button" className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">
            저장
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex gap-1 px-2 pt-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 overflow-x-auto">
          {/* 등급 선택 (A|B|C): 일반전문가/고급전문가/특수전문가 탭처럼 하나만 선택 → 아래 체크박스가 선택한 등급 기준 */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-700 mr-1">등급 선택:</span>
            <div className="flex gap-1">
              {grades.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGrade(g)}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    selectedGrade === g ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddGrade}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-semibold"
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            <strong>{selectedGrade}등급</strong>을 선택한 뒤, 아래 체크박스로 해당 등급의 기준을 설정하세요. A·B·C를 바꿔 가며 각 등급별 기준을 넣으면, 이에 따라 번역사가 <strong>자동 배치</strong>됩니다.
          </p>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-gray-700 w-28">조건명</th>
                <th className="text-left py-2 px-2 font-semibold text-gray-700">설정</th>
              </tr>
            </thead>
            <tbody>
              {/* 선택된 등급(selectedGrade)에 대한 체크박스만 표시 */}
              {(Object.keys(OPTIONS) as OptionCategory[]).map((cat) => (
                <tr key={cat} className="border-b border-gray-100 align-top">
                  <td className="py-2 pr-4 font-semibold text-gray-700">{CONDITION_LABELS[cat]}</td>
                  <td className="py-2 px-2">
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                      {OPTIONS[cat].map((opt) => (
                        <label key={opt} className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={!!criteria[cat]?.[selectedGrade]?.[opt]}
                            onChange={() => handleOptionChange(cat, opt)}
                            className="w-3 h-3 border-gray-300 rounded"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <button type="button" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
              추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
