export interface Applicant {
  applicant_id: string;
  status: "pending" | "approved" | "rejected";
  applied_at: string;
  rejection_reason?: string;

  // Step 1: 기본 정보
  basic: {
    name: string;
    email: string;
    phone: string;
    birthDate?: string;
    introduction: string;
    course?: string;
    job?: string;
  };

  // Step 2 - 섹션 1: 신청 정보
  application: {
    available_languages: string[];
    available_time: string;
    experience: string;
    occupation: string[];
    education: string;
    call_time: string;
  };

  // Step 2 - 섹션 2: 기타 정보
  extra: {
    work_goals: string[];
    language_certs: string[];
    overseas_experience: string;
    mt_experience: string;
  };
}
