export type ExamType = '번역' | '프롬프트' | '오프라인';

export interface Exam {
  id: number;
  title: string;
  type: ExamType;
  description: string;
  category: string;
  level: string;
  instructor: string;
  duration: number;
  questionCount: number;
}

export interface ExamQuestion {
  id: number;
  examId: number;
  question: string;
  type: 'translation' | 'prompt' | 'essay';
  maxLength?: number;
  attachments?: string[];
}

export interface ExamAnswer {
  questionId: number;
  answer: string;
  submittedAt?: string;
}

export interface AnswerUnit {
  index: number;
  text: string;
  isCorrect?: boolean;
}

export interface ExamResult {
  id: number;
  examId?: number;
  userId?: string;
  country?: string;
  region?: string;
  examDate?: string;
  examType?: string;
  round?: string;
  category?: string;
  targetAudience?: string;
  language?: string;
  examStatus?: string;
  passed?: boolean;
  examPeriod?: string;
  actions?: {
    payment: boolean;
    cancel: boolean;
  };
  score?: number;
  feedback?: string;
  submittedAt?: string;
  gradedAt?: string;
}

export interface Inquiry {
  id: number;
  date: string;
  category: string;
  title: string;
  content: string;
  status: '답변중' | '문의완성' | '답변완료';
  attachments?: string[];
  answer?: string;
}

export interface PaymentHistory {
  id: number;
  date: string;
  examType?: string;
  amount: number;
  discount?: number;
  finalAmount?: number;
  paymentMethod?: string;
  method?: string;
  status: '완료' | '환불 신청' | '환불 상세' | '환불 완료' | 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt?: string;
  completedAt?: string;
}

export interface UserProfile {
  id?: string;
  name?: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  gender?: '남자' | '여자';
  phone?: string;
  emergencyPhone?: string;
  address?: string | {
    country: string;
    region: string;
    city: string;
  };
  birthDate?: string;
  birthInfo?: {
    birthDate: string;
    birthPlace: string;
    residentNumber: string;
  };
  bio?: string;
}

export interface CertificateOption {
  id: string;
  name: string;
  description?: string;
  price?: number;
  quantity?: number;
  selected?: boolean;
}

export interface ExamRegistration {
  id: number;
  examId?: number;
  userId?: string;
  country?: string;
  region?: string;
  dateTime?: string;
  examType?: string;
  round?: string;
  category?: string;
  targetAudience?: string;
  language?: string;
  status: '접수하기' | '변경' | '취소' | '접수완료' | 'registered' | 'cancelled' | 'completed';
  applicationPeriod?: string;
  registeredAt?: string;
  examDate?: string;
}
