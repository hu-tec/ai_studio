/* 원본: hutechc_hompage_real/app/translate/translator/profile/grade-application/page.tsx */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
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
} from '../../../../types/translatorGrade';

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

interface GradeApplicationForm {
  expertType: ExpertType;
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
}

export default function GradeApplicationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<GradeApplicationForm>({
    expertType: '일반전문가',
    availableLanguages: [],
    nationality: [],
    translationLevel: [],
    availableTime: [],
    experience: [],
    workType: [],
    languageCertificates: [],
    mtType: [],
    usesTranslationTools: [],
    callTime: [],
    education: [],
    overseasResidence: [],
  });

  const handleToggle = <T,>(
    field: keyof GradeApplicationForm,
    value: T,
    currentArray: T[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value],
    }));
  };

  const handleSubmit = () => {
    // 실제로는 서버에 제출
    // 예시: 관리자 페이지에서 볼 수 있도록 저장
    alert('등급 신청이 완료되었습니다. 관리자 검토 후 승인 여부를 알려드리겠습니다.');
    navigate('/hutechc-homepage/translate/translator/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link to="/hutechc-homepage/translate/translator/profile" className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block">
            ← 프로필로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">번역사 등급 신청</h1>
          <p className="text-gray-600">상세 정보를 입력하여 등급을 신청하세요</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-8">
          {/* 전문가 타입 탭 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">전문가 타입</label>
            <div className="flex gap-2">
              {(['일반전문가', '고급전문가', '특수전문가'] as ExpertType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, expertType: type })}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    formData.expertType === type
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {type}
                </button>
              ))}
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
                    checked={formData.availableLanguages.includes(lang)}
                    onChange={() => handleToggle('availableLanguages', lang, formData.availableLanguages)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                    checked={formData.nationality.includes(nat)}
                    onChange={() => handleToggle('nationality', nat, formData.nationality)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                    checked={formData.translationLevel.includes(level)}
                    onChange={() => handleToggle('translationLevel', level, formData.translationLevel)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                    checked={formData.availableTime.includes(time)}
                    onChange={() => handleToggle('availableTime', time, formData.availableTime)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                    checked={formData.experience.includes(exp)}
                    onChange={() => handleToggle('experience', exp, formData.experience)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                    checked={formData.workType.includes(work)}
                    onChange={() => handleToggle('workType', work, formData.workType)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                    checked={formData.languageCertificates.includes(cert)}
                    onChange={() => handleToggle('languageCertificates', cert, formData.languageCertificates)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                    checked={formData.mtType.includes(type)}
                    onChange={() => handleToggle('mtType', type, formData.mtType)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                    checked={formData.usesTranslationTools.includes(type)}
                    onChange={() => handleToggle('usesTranslationTools', type, formData.usesTranslationTools)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                    checked={formData.callTime.includes(time)}
                    onChange={() => handleToggle('callTime', time, formData.callTime)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                    checked={formData.education.includes(edu)}
                    onChange={() => handleToggle('education', edu, formData.education)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                    checked={formData.overseasResidence.includes(period)}
                    onChange={() => handleToggle('overseasResidence', period, formData.overseasResidence)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
              value={formData.remarks || ''}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="추가 정보나 특이사항을 입력하세요"
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Link to="/hutechc-homepage/translate/translator/profile"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              신청 제출
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
