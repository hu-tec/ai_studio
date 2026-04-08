/* 원본: hutechc_hompage_real/app/expert/apply/page.tsx
   Next.js → React Router 변환: useRouter→useNavigate, Link href→to */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router';

type TranslatorLevel = 'new' | 'C' | 'B' | 'A' | 'native';

const LEVEL_INFO: Record<TranslatorLevel, { label: string; desc: string; bonus: string }> = {
  new: { label: '신입', desc: '시험 60점 이상', bonus: '+0%' },
  C: { label: 'C등급', desc: '1년+ 경력, 70점 이상', bonus: '+10%' },
  B: { label: 'B등급', desc: '3년+ 경력, 80점 이상', bonus: '+25%' },
  A: { label: 'A등급', desc: '5년+ 경력, 90점 이상', bonus: '+40%' },
  native: { label: '원어민', desc: '원어민 번역가', bonus: '+50%' },
};

const SPECIALTY_FIELDS = [
  { id: 'general', label: '일반' },
  { id: 'law-domestic', label: '법률/계약 (국내)' },
  { id: 'law-international', label: '법률/계약 (국제)' },
  { id: 'tech-manual', label: '기술/IT (매뉴얼)' },
  { id: 'tech-spec', label: '기술/IT (사양서)' },
  { id: 'med-general', label: '의료/제약 (일반)' },
  { id: 'med-pharma', label: '의료/제약 (제약)' },
  { id: 'biz-marketing', label: '비즈니스/마케팅' },
  { id: 'academic', label: '학술/논문' },
  { id: 'finance', label: '금융' },
];

const LANGUAGES = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: '영어' },
  { code: 'ja', label: '일본어' },
  { code: 'zh', label: '중국어' },
  { code: 'es', label: '스페인어' },
  { code: 'fr', label: '프랑스어' },
  { code: 'de', label: '독일어' },
  { code: 'ar', label: '아랍어' },
  { code: 'vi', label: '베트남어' },
  { code: 'th', label: '태국어' },
  { code: 'ru', label: '러시아어' },
  { code: 'pt', label: '포르투갈어' },
  { code: 'it', label: '이탈리아어' },
];

interface ApplicationForm {
  name: string;
  email: string;
  phone: string;
  bio: string;
  languages: string[];
  specialties: string[];
  requestedLevel: TranslatorLevel;
  experience: string;
  certificates: File[];
}

export default function ExpertApplyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationForm>({
    name: '', email: '', phone: '', bio: '',
    languages: [], specialties: [], requestedLevel: 'new',
    experience: '', certificates: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요.';
    if (!formData.email.trim()) newErrors.email = '이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    if (!formData.phone.trim()) newErrors.phone = '전화번호를 입력해주세요.';
    else if (!/^[0-9-]+$/.test(formData.phone)) newErrors.phone = '올바른 전화번호 형식을 입력해주세요.';
    if (!formData.bio.trim()) newErrors.bio = '자기소개를 입력해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (formData.languages.length === 0) newErrors.languages = '최소 1개 이상의 언어를 선택해주세요.';
    if (formData.specialties.length === 0) newErrors.specialties = '최소 1개 이상의 전문 분야를 선택해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (step === 1 && !validateStep1()) return; if (step === 2 && !validateStep2()) return; setStep(step + 1); };
  const handleBack = () => setStep(step - 1);
  const handleLanguageToggle = (code: string) => setFormData(prev => ({ ...prev, languages: prev.languages.includes(code) ? prev.languages.filter(l => l !== code) : [...prev.languages, code] }));
  const handleSpecialtyToggle = (id: string) => setFormData(prev => ({ ...prev, specialties: prev.specialties.includes(id) ? prev.specialties.filter(s => s !== id) : [...prev.specialties, id] }));
  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => { const files = Array.from(e.target.files || []); setFormData(prev => ({ ...prev, certificates: [...prev.certificates, ...files] })); };
  const handleRemoveCertificate = (index: number) => setFormData(prev => ({ ...prev, certificates: prev.certificates.filter((_, i) => i !== index) }));

  const handleSubmit = () => {
    alert('전문가 신청이 완료되었습니다. 관리자 검토 후 승인 여부를 알려드리겠습니다.');
    navigate('/hutechc-homepage');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/hutechc-homepage" className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">전문가 신청</h1>
          <p className="text-gray-600">번역 전문가로 등록하고 다양한 프로젝트에 참여하세요</p>
        </div>

        {/* 진행 단계 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{s}</div>
                {s < 3 && <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-500'}>기본 정보</span>
            <span className={step >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-500'}>전문 분야</span>
            <span className={step >= 3 ? 'text-blue-600 font-semibold' : 'text-gray-500'}>등급 및 증명서</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">기본 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이름 <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder="홍길동" />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이메일 <span className="text-red-500">*</span></label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="example@email.com" />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">전화번호 <span className="text-red-500">*</span></label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} placeholder="010-1234-5678" />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">자기소개 <span className="text-red-500">*</span></label>
                <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={4} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.bio ? 'border-red-500' : 'border-gray-300'}`} placeholder="자신의 번역 경험, 전문성, 강점 등을 자유롭게 작성해주세요." />
                {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">전문 분야 및 언어</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">보유 언어 <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {LANGUAGES.map(lang => (
                    <button key={lang.code} type="button" onClick={() => handleLanguageToggle(lang.code)} className={`px-4 py-2 border-2 rounded-lg transition-all ${formData.languages.includes(lang.code) ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>{lang.label}</button>
                  ))}
                </div>
                {errors.languages && <p className="text-red-500 text-sm mt-2">{errors.languages}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">전문 분야 <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPECIALTY_FIELDS.map(field => (
                    <button key={field.id} type="button" onClick={() => handleSpecialtyToggle(field.id)} className={`px-4 py-2 border-2 rounded-lg transition-all text-left ${formData.specialties.includes(field.id) ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>{field.label}</button>
                  ))}
                </div>
                {errors.specialties && <p className="text-red-500 text-sm mt-2">{errors.specialties}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">등급 신청 및 증명서</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">신청 등급</label>
                <p className="text-sm text-gray-600 mb-4">자신의 경력과 능력에 맞는 등급을 선택하세요.</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {(Object.entries(LEVEL_INFO) as [TranslatorLevel, (typeof LEVEL_INFO)[TranslatorLevel]][]).map(([key, info]) => (
                    <button key={key} type="button" onClick={() => setFormData({ ...formData, requestedLevel: key })} className={`p-4 border-2 rounded-lg transition-all text-center ${formData.requestedLevel === key ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="font-semibold text-sm mb-1">{info.label}</div>
                      <div className="text-xs text-gray-600 mb-1">{info.desc}</div>
                      <div className="text-xs font-semibold text-blue-600">{info.bonus}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">증명서 업로드</label>
                <p className="text-sm text-gray-600 mb-4">선택한 등급을 증명할 수 있는 증명서를 업로드해주세요.</p>
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer transition-colors">
                    <div className="text-3xl mb-2">📄</div>
                    <div className="text-sm font-medium text-gray-700 mb-1">파일을 여기에 드래그하거나 클릭</div>
                    <div className="text-xs text-gray-500">PDF, JPG, PNG (최대 5MB)</div>
                  </div>
                  <input type="file" multiple onChange={handleCertificateUpload} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                </label>
                {formData.certificates.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.certificates.map((cert, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2"><span>📄</span><span className="text-sm text-gray-700">{cert.name}</span></div>
                        <button type="button" onClick={() => handleRemoveCertificate(idx)} className="text-red-500 hover:text-red-700 text-sm">삭제</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 ? <button type="button" onClick={handleBack} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">이전</button> : <div />}
            {step < 3 ? <button type="button" onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">다음</button>
              : <button type="button" onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">신청 제출</button>}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">📌 안내 사항</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>제출하신 정보는 관리자 검토 후 승인 여부가 결정됩니다.</li>
            <li>승인까지 약 3-5일 정도 소요될 수 있습니다.</li>
            <li>증명서는 신청하신 등급을 증명할 수 있는 자료를 제출해주세요.</li>
            <li>승인 후 번역가 대시보드에서 프로필을 관리할 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
