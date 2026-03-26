import { useMemo, useState } from "react";
import type { Applicant } from "./types";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ExpertApplicationFormProps {
  onSubmit: (applicant: Applicant) => void;
}

export function ExpertApplicationForm({
  onSubmit,
}: ExpertApplicationFormProps) {
  const nationalityOptions = [
    { label: "내국인", en: "Domestic" },
    { label: "외국인", en: "Foreigner" },
    { label: "재외국인", en: "Overseas" },
  ];
  const discoveryOptions = [
    { label: "네이버 검색", en: "Naver Search" },
    { label: "인스타그램", en: "Instagram" },
    { label: "유튜브", en: "YouTube" },
    { label: "지인 추천", en: "Referral" },
    { label: "오프라인 안내", en: "Offline Guide" },
    { label: "기타", en: "Other" },
  ];
  const applicationTypeOptions = [
    { label: "수업신청", en: "Class Apply" },
    { label: "레벨테스트", en: "Level Test" },
    { label: "설명회신청", en: "Seminar" },
    { label: "테스트 TIP 신청", en: "Test TIP" },
    { label: "1:1문의", en: "1:1 Inquiry" },
  ];
  const regionOptions = [
    { label: "서울 강남", en: "Seoul Gangnam" },
    { label: "부산 서면", en: "Busan Seomyeon" },
    { label: "대구", en: "Daegu" },
    { label: "광주", en: "Gwangju" },
    { label: "경기도", en: "Gyeonggi-do" },
    { label: "충남", en: "Chungnam" },
    { label: "강원도", en: "Gangwon-do" },
    { label: "제주도", en: "Jeju-do" },
  ];
  const offlineTypes = ["수업신청", "레벨테스트", "설명회신청"];
  const courseOptions = [
    { label: "TESOL", en: "TESOL" },
    { label: "프롬프트", en: "Prompt" },
    { label: "AI 번역", en: "AI Translation" },
    { label: "AI윤리", en: "AI Ethics" },
    { label: "ITT 번역교육", en: "ITT Translation" },
  ];
  const jobOptions = [
    { label: "학생", en: "Student" },
    { label: "대학생", en: "Univ. Student" },
    { label: "직장인", en: "Employee" },
    { label: "교사", en: "Teacher" },
    { label: "기타", en: "Other" },
  ];

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState<string[]>([]);
  const [discoveryChannels, setDiscoveryChannels] = useState<string[]>([]);
  const [course, setCourse] = useState("");
  const [job, setJob] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const [applicationType, setApplicationType] = useState("");
  const [region, setRegion] = useState<string[]>([]);
  const [scheduleDate1, setScheduleDate1] = useState("");
  const [scheduleDate2, setScheduleDate2] = useState("");
  const [scheduleTime1, setScheduleTime1] = useState("");
  const [scheduleTime2, setScheduleTime2] = useState("");
  const [inquiryContent, setInquiryContent] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const timeOptions = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00"
  ];

  const isOfflineType = useMemo(
    () => offlineTypes.includes(applicationType),
    [applicationType]
  );

  const handlePhoneChange = (value: string) => {
    const n = value.replace(/[^0-9]/g, "");
    if (n.length <= 3) setPhone(n);
    else if (n.length <= 7) setPhone(`${n.slice(0, 3)}-${n.slice(3)}`);
    else setPhone(`${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7, 11)}`);
  };

  const toggle = (
    val: string,
    list: string[],
    set: (v: string[]) => void
  ) => {
    set(
      list.includes(val) ? list.filter((v) => v !== val) : [...list, val]
    );
  };

  const validateStep1 = (): boolean => {
    if (!applicationType) return toast.error("신청 유형을 선택해주세요."), false;
    if (!course) return toast.error("지원 구분을 선택해주세요."), false;
    if (!name.trim()) return toast.error("이름을 입력해주세요."), false;
    if (!phone.trim()) return toast.error("연락처를 입력해주세요."), false;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("올바른 이메일을 입력해주세요."), false;
    if (!birthDate.trim()) return toast.error("생년월일을 입력해주세요."), false;
    if (nationality.length === 0) return toast.error("외국인·내국인·재외국인을 선택해주세요."), false;
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!job) return toast.error("직업을 선택해주세요."), false;
    if (discoveryChannels.length === 0) return toast.error("신청 경로를 1개 이상 선택해주세요."), false;
    if (!introduction.trim()) return toast.error("자기소개를 입력해주세요."), false;
    if (!privacyConsent) return toast.error("개인정보제공 약관동의가 필요합니다."), false;

    if (isOfflineType) {
      if (region.length === 0) return toast.error("오프라인 신청의 지역을 선택해주세요."), false;
      if (!scheduleDate1 && !scheduleDate2) return toast.error("오프라인 신청의 일자를 1개 이상 선택해주세요."), false;
      if (!scheduleTime1 && !scheduleTime2) return toast.error("오프라인 신청의 시간을 1개 이상 선택해주세요."), false;
    } else {
      if (applicationType === "1:1문의" && !inquiryContent.trim()) return toast.error("문의할 내용을 입력해주세요."), false;
    }
    return true;
  };

  const goToStep2 = () => {
    if (!validateStep1()) return;
    setCurrentStep(2);
  };

  const handleSubmit = () => {
    if (!validateStep2()) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onSubmit({
      applicant_id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      status: "pending",
      applied_at: formattedDate,
      basic: {
        name,
        email,
        phone,
        birthDate,
        course: isOfflineType ? course : course,
        job,
        introduction: `${introduction}\n국적구분: ${nationality.join(", ")} | 신청경로: ${discoveryChannels.join(", ")}${
          applicationType === "1:1문의" ? `\n문의내용: ${inquiryContent}` : ""
        }`,
      },
      application: {
        available_languages: [applicationType],
        available_time: isOfflineType ? `${scheduleDate1} ${scheduleTime1}, ${scheduleDate2} ${scheduleTime2}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, '') : "미지정",
        experience: region.length > 0 ? region.join(", ") : "온라인",
        occupation: discoveryChannels,
        education: nationality.join(", "),
        call_time: "신청 접수",
      },
      extra: {
        work_goals: [],
        language_certs: [],
        overseas_experience: isOfflineType ? "오프라인 신청" : "온라인 신청",
        mt_experience: privacyConsent ? "약관동의 완료" : "약관동의 미완료",
      },
    });
    toast.success("신청서가 제출되었습니다.");
    resetForm();
  };

  const handleCancel = () => {
    if (window.confirm("작성 중인 내용이 초기화됩니다. 취소하시겠습니까?")) resetForm();
  };

  const resetForm = () => {
    setCurrentStep(1);
    setName("");
    setEmail("");
    setPhone("");
    setBirthDate("");
    setNationality([]);
    setCourse("");
    setJob("");
    setDiscoveryChannels([]);
    setIntroduction("");
    setPrivacyConsent(false);
    setApplicationType("");
    setRegion([]);
    setScheduleDate1("");
    setScheduleDate2("");
    setScheduleTime1("10:00");
    setScheduleTime2("");
    setInquiryContent("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex flex-wrap gap-2 justify-center md:justify-start px-1">
        {applicationTypeOptions.map((option) => (
          <button
            key={option.label}
            onClick={() => {
              setApplicationType(option.label);
              setCurrentStep(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border shadow-sm flex items-center gap-1 ${
              applicationType === option.label
                ? "border-[#7b1023] bg-white text-[#7b1023]"
                : "border-black/10 bg-[#fafafa] text-black/60 hover:bg-white"
            }`}
          >
            {option.label}
            <span className={`text-[10px] font-normal ${applicationType === option.label ? 'text-[#7b1023]/60' : 'text-black/40'}`}>
              {option.en}
            </span>
          </button>
        ))}
      </div>

      <div className="border border-black/10 rounded-xl p-5 md:p-7 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center border-b border-black/10 pb-5 gap-5 sm:gap-0 mb-5">
          <p className="text-xl font-bold text-black sm:w-1/3">신청서 <span className="text-xs font-normal text-black/40 ml-1">Application Form</span></p>

          <div className="flex items-center w-full max-w-[240px] mx-auto sm:w-1/3">
            <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors ${currentStep >= 1 ? 'bg-[#7b1023] text-white' : 'bg-gray-200 text-gray-400'}`}>
              1
            </div>
            <div className={`h-[3px] flex-1 -mx-1 z-0 transition-colors ${currentStep >= 2 ? 'bg-[#7b1023]' : 'bg-gray-200'}`} />
            <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors ${currentStep >= 2 ? 'bg-[#7b1023] text-white' : 'bg-gray-200 text-gray-400'}`}>
              2
            </div>
            <div className="h-[3px] flex-1 -mx-1 z-0 bg-gray-200" />
            <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors ${currentStep >= 3 ? 'bg-[#7b1023] text-white' : 'bg-gray-200 text-gray-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          </div>

          <div className="hidden sm:block sm:w-1/3"></div>
        </div>

        {currentStep === 1 && (
          <div className="space-y-6 pt-2">
            <div className="space-y-2 border-b border-black/10 pb-5 mb-2">
              <p className="text-sm text-black/80 font-bold">
                지원 구분 <span className="text-xs font-normal text-black/40 ml-1">Course</span>
                <span className="text-[#7b1023] ml-1">*</span>
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-2 mt-2">
                {courseOptions.map((option) => (
                  <label
                    key={option.label}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md cursor-pointer text-sm transition-colors ${
                      course === option.label ? 'border-[#7b1023] bg-[#7b1023]/5 text-[#7b1023] font-medium' : 'border-black/10 hover:bg-[#f4f4f5]'
                    }`}
                  >
                    <Checkbox
                      checked={course === option.label}
                      onCheckedChange={() => setCourse(option.label)}
                      className="hidden"
                    />
                    {option.label}
                    <span className={`text-[10px] font-normal ${course === option.label ? 'text-[#7b1023]/60' : 'text-black/40'}`}>
                      {option.en}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-black/80 font-bold">
                기본 인적사항 <span className="text-xs font-normal text-black/40 ml-1">Basic Information</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs text-black/60 font-medium">성명 <span className="text-[10px] text-black/30 ml-0.5">Name</span> *</p>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="성명 입력" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-black/60 font-medium">연락처 <span className="text-[10px] text-black/30 ml-0.5">Phone</span> *</p>
                  <Input value={phone} onChange={(e) => handlePhoneChange(e.target.value)} placeholder="010-1234-5678" maxLength={13} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-black/60 font-medium">이메일 <span className="text-[10px] text-black/30 ml-0.5">E-mail</span> *</p>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-black/60 font-medium">생년월일 <span className="text-[10px] text-black/30 ml-0.5">Birth Date</span> *</p>
                  <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="h-9 text-sm text-black/70" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <p className="text-xs text-black/60 font-medium">내국인·외국인·재외국인 <span className="text-[10px] text-black/30 ml-0.5">Nationality</span> *</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {nationalityOptions.map((option) => (
                    <label key={option.label} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <Checkbox checked={nationality.includes(option.label)} onCheckedChange={() => toggle(option.label, nationality, setNationality)} />
                      {option.label}
                      <span className="text-[10px] text-black/40">{option.en}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 pb-2 border-t border-black/10">
              <button
                onClick={handleCancel}
                className="text-sm px-6 h-10 rounded-md border border-black/10 hover:bg-[#f4f4f5] font-medium flex items-center gap-1.5"
              >
                취소 <span className="text-[10px] text-black/40 font-normal">Cancel</span>
              </button>
              <button
                onClick={goToStep2}
                className="text-sm px-8 h-10 rounded-md bg-[#7b1023] text-white hover:bg-[#7b1023]/90 font-medium flex items-center gap-1.5"
              >
                다음 단계로 <span className="text-[10px] text-white/50 font-normal">Next Step</span>
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-black/10 pb-5">
              <div className="space-y-1.5">
                <p className="text-xs text-black/60 font-medium">직업 <span className="text-[10px] text-black/30 ml-0.5">Job</span> *</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {jobOptions.map((option) => (
                    <label key={option.label} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <Checkbox checked={job === option.label} onCheckedChange={() => setJob(option.label)} className="rounded-full" />
                      {option.label}
                      <span className="text-[10px] text-black/40">{option.en}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-black/60 font-medium">신청을 알게 된 경로 <span className="text-[10px] text-black/30 ml-0.5">Discovery Channel</span> *</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {discoveryOptions.map((option) => (
                    <label key={option.label} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <Checkbox checked={discoveryChannels.includes(option.label)} onCheckedChange={() => toggle(option.label, discoveryChannels, setDiscoveryChannels)} />
                      {option.label}
                      <span className="text-[10px] text-black/40">{option.en}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {isOfflineType ? (
              <div className="space-y-5 border border-black/10 rounded-xl p-5 bg-[#fafafa]">
                <p className="text-sm text-black/80 font-bold pb-2 border-b border-black/5">신청 정보 <span className="text-xs font-normal text-black/40 ml-1">Offline Information</span></p>

                <div className="space-y-2 pt-1">
                  <p className="text-xs text-black/60 font-medium">지역 <span className="text-[10px] text-black/30 ml-0.5">Region</span> * <span className="text-[10px] font-normal text-black/40">(복수 선택 가능)</span></p>
                  <div className="flex flex-wrap gap-x-2 gap-y-2">
                    {regionOptions.map((option) => (
                      <label
                        key={option.label}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md cursor-pointer text-xs transition-colors ${
                          region.includes(option.label) ? 'border-black bg-black text-white' : 'border-black/10 hover:bg-[#f4f4f5] bg-white text-black'
                        }`}
                      >
                        <Checkbox
                          checked={region.includes(option.label)}
                          onCheckedChange={() => toggle(option.label, region, setRegion)}
                          className="hidden"
                        />
                        {option.label}
                        <span className={`text-[10px] font-normal ${region.includes(option.label) ? 'text-white/60' : 'text-black/40'}`}>
                          {option.en}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs text-black/60 font-medium">일자 <span className="text-[10px] text-black/30 ml-0.5">Date</span> *</p>
                    <div className="flex flex-col gap-2">
                      <Input
                        type="date"
                        value={scheduleDate1}
                        onChange={(e) => setScheduleDate1(e.target.value)}
                        className="h-9 text-sm bg-white"
                      />
                      <Input
                        type="date"
                        value={scheduleDate2}
                        onChange={(e) => setScheduleDate2(e.target.value)}
                        className="h-9 text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-black/60 font-medium">시간 <span className="text-[10px] text-black/30 ml-0.5">Time</span> *</p>
                    <div className="flex flex-col gap-2">
                      <select
                        value={scheduleTime1}
                        onChange={(e) => setScheduleTime1(e.target.value)}
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">선택</option>
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <select
                        value={scheduleTime2}
                        onChange={(e) => setScheduleTime2(e.target.value)}
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">선택</option>
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 border-b border-black/10 pb-5 mb-2">
                <p className="text-xs text-black/60 font-medium">문의 내용 <span className="text-[10px] text-black/30 ml-0.5">Inquiry Content</span> *</p>
                <Textarea
                  value={inquiryContent}
                  onChange={(e) => setInquiryContent(e.target.value)}
                  placeholder="문의하실 내용을 상세히 적어주세요."
                  className="min-h-[160px] text-sm mt-2"
                />
              </div>
            )}

            <div className="space-y-1.5 border-b border-black/10 pb-5 pt-2">
              <p className="text-xs text-black/60 font-medium">자기소개 <span className="text-[10px] text-black/30 ml-0.5">Introduction</span> *</p>
              <Textarea
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                className="min-h-[100px] text-sm"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer pt-2">
              <Checkbox checked={privacyConsent} onCheckedChange={(checked) => setPrivacyConsent(Boolean(checked))} />
              <span className="text-sm text-black/70">개인정보제공 약관동의 * <span className="text-xs ml-0.5 text-black/40">Privacy Policy Consent</span></span>
            </label>

            <div className="flex justify-between pt-6 pb-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-sm px-6 h-10 rounded-md border border-black/10 hover:bg-[#f4f4f5] font-medium flex items-center gap-1.5"
              >
                이전 단계로 <span className="text-[10px] text-black/40 font-normal">Prev Step</span>
              </button>
              <button
                onClick={handleSubmit}
                className="text-sm px-8 h-10 rounded-md bg-[#7b1023] text-white hover:bg-[#7b1023]/90 font-medium flex items-center gap-1.5"
              >
                제출하기 <span className="text-[10px] text-white/50 font-normal">Submit</span>
              </button>
            </div>

            <div className="text-[10px] text-black/35 space-y-1.5 leading-[1.4] pt-5 border-t border-black/5">
              <p>Registration fee for the program is non-refundable. Start of the program refers to the class starting date at Times Media. Full refund of tution will not be issoed on or after the class starting date. Partial refund of tution may be issued in the First half of the class.</p>
              <p>I understand for the Times Media refund policy and i agree to follow the policy</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
