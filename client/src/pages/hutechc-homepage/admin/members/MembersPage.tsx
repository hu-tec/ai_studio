/* 원본: hutechc_hompage_real/app/(client-layout)/admin/members/page.tsx */
import { Link } from 'react-router';
import { useState, useMemo } from 'react';
import { Pencil, Eye, Trash2, BarChart3 } from 'lucide-react';

type Homepage = '시험' | '번역' | '통독' | '교육' | '전시';
type MemberType = '일반회원' | '준회원' | '정회원';
type MemberStatus = '정상' | '탈퇴' | '휴면';

interface ActivityRow {
  regNo: string;
  completionNo: string;
  registrant: string;
  regDate: string;
  productName: string;
  price: number;
  productStatus: string;
  paymentMethod: string;
  paymentDate: string;
  refundDate: string;
  studyTime: string;
  progress: string;
  completed: 'Y' | 'N';
  certificate?: string;
  rating: string;
  qaCount: number;
}

interface InquiryRow {
  title: string;
  content: string;
  answerStatus: string;
  inquiryDate: string;
  answerDate: string;
  views: number;
  hasAttachment: boolean;
}

interface MemberRow {
  id: number;
  memberId: string;
  homepage: Homepage;
  memberType: MemberType;
  name: string;
  email: string;
  phone: string;
  country: string;
  joinDate: string;
  lastLogin: string;
  status: MemberStatus;
  points: number;
  grade: number;
  memberPrice: number;
  remarks: string;
  lastModified: string;
  lastModifiedBy: string;
  activity?: ActivityRow;
  inquiry?: InquiryRow;
}

const activityDummy = (id: number, product: string, price: number, status: string, payMethod: string, payDate: string, studyTime: string, progress: string, completed: 'Y' | 'N', rating: string, qa: number): ActivityRow => ({
  regNo: `R${10000 + id}`,
  completionNo: completed === 'Y' ? `C${10000 + id}` : '-',
  registrant: 'admin',
  regDate: '24.01.15',
  productName: product,
  price,
  productStatus: status,
  paymentMethod: payMethod,
  paymentDate: payDate,
  refundDate: '',
  studyTime,
  progress,
  completed,
  certificate: completed === 'Y' ? '수료증출력' : undefined,
  rating,
  qaCount: qa,
});

const inquiryDummy = (title: string, content: string, answerStatus: string, iDate: string, aDate: string, views: number, hasAttach: boolean): InquiryRow => ({
  title,
  content,
  answerStatus,
  inquiryDate: iDate,
  answerDate: aDate,
  views,
  hasAttachment: hasAttach,
});

// 홈페이지별 더미 회원 데이터 (활동·결제·문의 포함)
const mockMembers: MemberRow[] = [
  { id: 1, memberId: '1004.XXXX', homepage: '시험', memberType: '일반회원', name: '김철수', email: 'kim@hutech.com', phone: '010-1234-5678', country: '한국', joinDate: '24.01.24', lastLogin: '24.01.24', status: '정상', points: 200, grade: 1, memberPrice: 10000, remarks: '사용자 생성', lastModified: '24.01.24', lastModifiedBy: 'admin', activity: activityDummy(1, '정회원 가입비', 50000, '결제완료', '신용카드', '24.01.24', '30분 20초', '50%', 'N', '4.5', 2), inquiry: inquiryDummy('시험 신청 관련 문의', '접수 기간 문의드립니다.', '답변완료', '24.01.20', '24.01.21', 12, true) },
  { id: 2, memberId: '8040.XXXX', homepage: '시험', memberType: '준회원', name: '이영희', email: 'lee@example.com', phone: '010-2345-6789', country: '한국', joinDate: '23.12.15', lastLogin: '24.01.20', status: '정상', points: 1500, grade: 2, memberPrice: 50000, remarks: '-', lastModified: '24.01.20', lastModifiedBy: 'admin', activity: activityDummy(2, '메타시험 응시료', 30000, '결제완료', '무통장입금', '24.01.10', '120분 00초', '100%', 'Y', '5.0', 0), inquiry: inquiryDummy('합격증 발급 요청', '발급 절차 알려주세요.', '답변대기', '24.01.22', '', 5, false) },
  { id: 3, memberId: '1234.ABCD', homepage: '시험', memberType: '정회원', name: '박지민', email: 'park@test.com', phone: '010-3456-7890', country: '한국', joinDate: '23.11.01', lastLogin: '24.01.22', status: '정상', points: 0, grade: 3, memberPrice: 100000, remarks: '관리자 변경', lastModified: '24.01.22', lastModifiedBy: 'supervisor', activity: activityDummy(3, '연회비', 100000, '결제완료', '신용카드', '23.12.01', '-', '-', 'Y', '-', 1), inquiry: inquiryDummy('회원 등급 문의', '정회원 혜택이 궁금합니다.', '답변완료', '23.11.25', '23.11.26', 8, false) },
  { id: 4, memberId: '2001.EFGH', homepage: '번역', memberType: '일반회원', name: '최민수', email: 'choi@hutech.com', phone: '010-4567-8901', country: '한국', joinDate: '24.01.10', lastLogin: '24.01.23', status: '정상', points: 320, grade: 1, memberPrice: 10000, remarks: '-', lastModified: '24.01.10', lastModifiedBy: 'admin', activity: activityDummy(4, '번역 크레딧 1만자', 50000, '결제완료', '신용카드', '24.01.12', '-', '-', 'Y', '-', 0), inquiry: inquiryDummy('번역 품질 확인', '감수 요청 가능한가요?', '답변완료', '24.01.18', '24.01.19', 3, true) },
  { id: 5, memberId: '2002.IJKL', homepage: '번역', memberType: '정회원', name: '정수진', email: 'jung@example.com', phone: '010-5678-9012', country: '한국', joinDate: '23.12.20', lastLogin: '24.01.24', status: '정상', points: 2100, grade: 2, memberPrice: 50000, remarks: '-', lastModified: '24.01.24', lastModifiedBy: 'admin', activity: activityDummy(5, '번역 패키지', 120000, '결제완료', '계좌이체', '24.01.05', '-', '-', 'Y', '-', 2), inquiry: inquiryDummy('정산 일정 문의', '다음 정산일이 언제인가요?', '답변대기', '24.01.24', '', 1, false) },
  { id: 6, memberId: '2003.MNOP', homepage: '번역', memberType: '준회원', name: '한동훈', email: 'han@test.com', phone: '010-6789-0123', country: '한국', joinDate: '23.10.05', lastLogin: '23.12.20', status: '휴면', points: 50, grade: 1, memberPrice: 0, remarks: '-', lastModified: '23.12.01', lastModifiedBy: 'admin', activity: activityDummy(6, '번역 1건', 15000, '결제대기', '-', '-', '-', '-', 'N', '-', 0), inquiry: inquiryDummy('휴면 해제 방법', '재가입 절차 문의', '답변완료', '23.11.28', '23.11.29', 20, false) },
  { id: 7, memberId: '3001.QRST', homepage: '통독', memberType: '일반회원', name: '윤서연', email: 'yoon@hutech.com', phone: '010-7890-1234', country: '한국', joinDate: '24.01.15', lastLogin: '24.01.24', status: '정상', points: 800, grade: 1, memberPrice: 10000, remarks: '-', lastModified: '24.01.15', lastModifiedBy: 'admin', activity: activityDummy(7, '통독 이용권', 20000, '결제완료', '신용카드', '24.01.16', '45분 10초', '80%', 'N', '4.0', 3), inquiry: inquiryDummy('문서 업로드 오류', 'PDF가 올라가지 않아요.', '답변완료', '24.01.20', '24.01.21', 7, true) },
  { id: 8, memberId: '3002.UVWX', homepage: '통독', memberType: '정회원', name: '임도현', email: 'lim@example.com', phone: '010-8901-2345', country: '한국', joinDate: '23.11.18', lastLogin: '24.01.23', status: '정상', points: 0, grade: 3, memberPrice: 100000, remarks: '사용자 생성', lastModified: '24.01.23', lastModifiedBy: 'admin', activity: activityDummy(8, '전문가 의뢰 1건', 80000, '결제완료', '계좌이체', '24.01.10', '-', '100%', 'Y', '-', 1), inquiry: inquiryDummy('전문가 매칭 요청', '감수 빠른 분 원합니다.', '답변대기', '24.01.23', '', 2, false) },
  { id: 9, memberId: '3003.YZAB', homepage: '통독', memberType: '준회원', name: '송미래', email: 'song@test.com', phone: '010-9012-3456', country: '한국', joinDate: '23.09.22', lastLogin: '23.11.10', status: '탈퇴', points: 0, grade: 1, memberPrice: 0, remarks: '-', lastModified: '23.11.10', lastModifiedBy: 'admin', activity: activityDummy(9, '문서 사용 1건', 5000, '결제완료', '신용카드', '23.10.01', '10분 00초', '100%', 'Y', '3.5', 0), inquiry: inquiryDummy('탈퇴 환불 문의', '잔여 크레딧 환불 가능할까요?', '답변완료', '23.11.05', '23.11.08', 15, false) },
  { id: 10, memberId: '4001.CDEF', homepage: '교육', memberType: '일반회원', name: '강민호', email: 'kang@hutech.com', phone: '010-0123-4567', country: '한국', joinDate: '24.01.05', lastLogin: '24.01.24', status: '정상', points: 450, grade: 2, memberPrice: 50000, remarks: '-', lastModified: '24.01.05', lastModifiedBy: 'admin', activity: activityDummy(10, '테솔 과정', 300000, '결제완료', '신용카드', '24.01.05', '180분 30초', '60%', 'N', '4.8', 5), inquiry: inquiryDummy('수업 일정 변경', '2월 개강 일정 알려주세요.', '답변완료', '24.01.22', '24.01.23', 9, false) },
  { id: 11, memberId: '4002.GHIJ', homepage: '교육', memberType: '정회원', name: '오지훈', email: 'oh@example.com', phone: '010-1111-2222', country: '한국', joinDate: '23.12.01', lastLogin: '24.01.22', status: '정상', points: 1200, grade: 2, memberPrice: 50000, remarks: '관리자 변경', lastModified: '24.01.20', lastModifiedBy: 'supervisor', activity: activityDummy(11, '프롬프트 과정', 150000, '결제완료', '무통장입금', '23.12.10', '90분 00초', '100%', 'Y', '5.0', 2), inquiry: inquiryDummy('수료증 재발급', '분실했는데 재발급 가능할까요?', '답변대기', '24.01.21', '', 4, true) },
  { id: 12, memberId: '4003.KLMN', homepage: '교육', memberType: '준회원', name: '신유나', email: 'shin@test.com', phone: '010-2222-3333', country: '한국', joinDate: '23.10.30', lastLogin: '24.01.18', status: '정상', points: 90, grade: 1, memberPrice: 10000, remarks: '-', lastModified: '24.01.18', lastModifiedBy: 'admin', activity: activityDummy(12, 'AI통번역 입문', 80000, '결제완료', '신용카드', '24.01.10', '45분 00초', '30%', 'N', '-', 1), inquiry: inquiryDummy('교재 구매처', '교재는 어디서 구매하나요?', '답변완료', '24.01.15', '24.01.16', 6, false) },
  { id: 13, memberId: '5001.OPQR', homepage: '전시', memberType: '일반회원', name: '류성민', email: 'ryu@hutech.com', phone: '010-3333-4444', country: '한국', joinDate: '24.01.20', lastLogin: '24.01.24', status: '정상', points: 100, grade: 1, memberPrice: 10000, remarks: '-', lastModified: '24.01.20', lastModifiedBy: 'admin', activity: activityDummy(13, '전시 회원권', 15000, '결제완료', '신용카드', '24.01.20', '-', '-', 'Y', '-', 0), inquiry: inquiryDummy('전시 오픈 시간', '평일 오픈 시간이 어떻게 되나요?', '답변완료', '24.01.23', '24.01.24', 11, false) },
  { id: 14, memberId: '5002.STUV', homepage: '전시', memberType: '정회원', name: '배수지', email: 'bae@example.com', phone: '010-4444-5555', country: '한국', joinDate: '23.12.28', lastLogin: '24.01.23', status: '정상', points: 0, grade: 3, memberPrice: 100000, remarks: '-', lastModified: '24.01.23', lastModifiedBy: 'admin', activity: activityDummy(14, '전시 연간 이용권', 80000, '결제완료', '계좌이체', '23.12.28', '-', '-', 'Y', '-', 1), inquiry: inquiryDummy('작품 대여 문의', '일부 작품 대여 가능한가요?', '답변대기', '24.01.22', '', 3, false) },
  { id: 15, memberId: '5003.WXYZ', homepage: '전시', memberType: '준회원', name: '문하늘', email: 'moon@test.com', phone: '010-5555-6666', country: '한국', joinDate: '23.11.12', lastLogin: '24.01.15', status: '휴면', points: 30, grade: 1, memberPrice: 0, remarks: '-', lastModified: '24.01.02', lastModifiedBy: 'admin', activity: activityDummy(15, '전시 입장권', 10000, '결제완료', '신용카드', '23.11.15', '-', '-', 'Y', '4.0', 0), inquiry: inquiryDummy('단체 관람 할인', '10명 이상 단체 할인 있나요?', '답변완료', '23.11.20', '23.11.21', 18, true) },
];

type ServiceTab = '시험' | '번역' | '통독' | '교육' | '전시';
type TabType = '전체' | '회원관리' | '활동관리' | '결제관리' | '1:1문의관리' | '통계';

const SERVICE_TABS: ServiceTab[] = ['시험', '번역', '통독', '교육', '전시'];
const SUB_TABS: TabType[] = ['전체', '회원관리', '활동관리', '결제관리', '1:1문의관리', '통계'];

const SEARCH_BY_OPTIONS = ['이름', '이메일', '주소', '언어', '파일명', '요청 사항', '문의 제목', '문의 내용', '관리자 메모', '마켓 제목', '마켓 내용'] as const;
const PERIOD_BY_OPTIONS = ['가입일', '최근 로그인', '활동일', '완료일', '매칭요청일', '매칭완료일', '완료희망일', '서비스 완료일', '결제일', '정산 예정일', '정산 완료일'] as const;

export default function MembersPage() {
  const [activeService, setActiveService] = useState<ServiceTab>('시험');
  const [activeTab, setActiveTab] = useState<TabType>('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState<string>(SEARCH_BY_OPTIONS[0]);
  const [periodBy, setPeriodBy] = useState<string>(PERIOD_BY_OPTIONS[0]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedFilters, setSelectedFilters] = useState({
    memberType: [] as string[],
    gender: [] as string[],
    subscription: [] as string[],
    notification: [] as string[],
    marketing: [] as string[],
    serviceType: [] as string[],
    purpose: [] as string[],
    urgency: false,
    verification: [] as string[],
    aiUsed: [] as string[],
    editorUsed: [] as string[],
  });
  const [category, setCategory] = useState({ large: '', mid: '', small: '' });
  const [memberTypeQuickFilter, setMemberTypeQuickFilter] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  const filteredMembers = mockMembers.filter((member) => {
    const matchesHomepage = member.homepage === activeService;
    const matchesSearch =
      !searchTerm ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.replace(/-/g, '').includes(searchTerm.replace(/-/g, '')) ||
      member.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMemberType =
      selectedFilters.memberType.length === 0 ||
      selectedFilters.memberType.includes(member.memberType);
    const matchesQuickFilter =
      !memberTypeQuickFilter || memberTypeQuickFilter === '전체' || member.memberType === memberTypeQuickFilter;
    return matchesHomepage && matchesSearch && matchesMemberType && matchesQuickFilter;
  });

  const toggleFilter = (key: keyof typeof selectedFilters, value: string | boolean) => {
    if (key === 'urgency') {
      setSelectedFilters((prev) => ({ ...prev, urgency: !prev.urgency }));
      return;
    }
    const k = key as keyof Omit<typeof selectedFilters, 'urgency'>;
    const current = selectedFilters[k];
    if (!Array.isArray(current)) return;
    const updated = (current as string[]).includes(value as string)
      ? (current as string[]).filter((v) => v !== value)
      : [...(current as string[]), value as string];
    setSelectedFilters((prev) => ({ ...prev, [key]: updated }));
  };

  const toggleFilterAll = (key: keyof typeof selectedFilters, value: string) => {
    if (value === '전체') {
      setSelectedFilters((prev) => ({ ...prev, [key]: [] }));
      return;
    }
    toggleFilter(key, value);
  };

  const resetFilters = () => {
    setSelectedFilters({
      memberType: [],
      gender: [],
      subscription: [],
      notification: [],
      marketing: [],
      serviceType: [],
      purpose: [],
      urgency: false,
      verification: [],
      aiUsed: [],
      editorUsed: [],
    });
    setCategory({ large: '', mid: '', small: '' });
    setSearchBy(SEARCH_BY_OPTIONS[0]);
    setPeriodBy(PERIOD_BY_OPTIONS[0]);
    setDateRange({ start: '', end: '' });
    setSearchTerm('');
    setMemberTypeQuickFilter('');
  };

  const toggleMemberSelection = (id: number) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map((m) => m.id));
    }
  };

  const homepageBadge = (h: Homepage) => {
    const map: Record<Homepage, string> = {
      시험: 'bg-blue-100 text-blue-700',
      번역: 'bg-blue-100 text-blue-700',
      통독: 'bg-blue-100 text-blue-700',
      교육: 'bg-emerald-100 text-emerald-700',
      전시: 'bg-violet-100 text-violet-700',
    };
    return map[h] || 'bg-gray-100 text-gray-700';
  };
  const memberTypeBadge = (t: MemberType) => {
    const map: Record<MemberType, string> = {
      일반회원: 'bg-sky-100 text-sky-700',
      준회원: 'bg-amber-100 text-amber-700',
      정회원: 'bg-green-100 text-green-700',
    };
    return map[t] || 'bg-gray-100 text-gray-700';
  };
  const statusBadge = (s: MemberStatus) => {
    const map: Record<MemberStatus, string> = {
      정상: 'bg-green-100 text-green-700',
      탈퇴: 'bg-red-100 text-red-700',
      휴면: 'bg-gray-100 text-gray-600',
    };
    return map[s] || 'bg-gray-100 text-gray-700';
  };

  const stats = useMemo(() => {
    const m = filteredMembers;
    const total = m.length;
    const dormant = m.filter((x) => x.status === '휴면').length;
    const withdrawn = m.filter((x) => x.status === '탈퇴').length;
    const newCount = m.filter((x) => {
      const [y, mo] = x.joinDate.split('.').map(Number);
      return y === 24 && (mo === 1 || (mo === 12 && false));
    }).length;
    let revenue = 0;
    let membershipFees = 0;
    let contentPurchase = 0;
    let refundAmount = 0;
    m.forEach((x) => {
      membershipFees += x.memberPrice || 0;
      if (x.activity) {
        if (x.activity.productStatus === '결제완료') revenue += x.activity.price;
        if (x.activity.productName?.includes('가입') || x.activity.productName?.includes('연회비')) membershipFees += x.activity.price;
        else contentPurchase += x.activity.productStatus === '결제완료' ? x.activity.price : 0;
        if (x.activity.refundDate) refundAmount += x.activity.price;
      }
    });
    return {
      totalMembers: total,
      newMembers: newCount || Math.max(1, Math.floor(total * 0.2)),
      dormantMembers: dormant,
      withdrawnMembers: withdrawn,
      totalRevenue: revenue || membershipFees + contentPurchase || 1250000,
      membershipFees: membershipFees || 380000,
      contentPurchase: contentPurchase || 620000,
      refundAmount: refundAmount || 250000,
    };
  }, [filteredMembers]);

  const showStatsOnly = activeTab === '통계';
  const showTable = !showStatsOnly;
  const showWideTable = activeTab === '전체';
  const showMemberCols = ['전체', '회원관리', '활동관리', '결제관리', '1:1문의관리'].includes(activeTab);
  const showActivityCols = showWideTable || activeTab === '활동관리';
  const showPaymentCols = showWideTable || activeTab === '결제관리';
  const showInquiryCols = showWideTable || activeTab === '1:1문의관리';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">홈 &gt; 회원관리 &gt; {activeService}</div>
            <h1 className="text-2xl font-bold text-gray-900">회원관리</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              저장
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              검색
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* 홈페이지별 + 설정 탭 (한 카드) */}
        <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
          {/* 1. 시험 · 번역 · 통독 · 교육 · 전시 (한 줄) */}
          <div className="flex flex-nowrap gap-2 overflow-x-auto min-w-0 px-4 pt-4 pb-2">
            {SERVICE_TABS.map((s) => (
              <button
                key={s}
                onClick={() => setActiveService(s)}
                className={`shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeService === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {/* 2. 전체 · 회원관리 · 활동관리 · 결제관리 · 1:1문의관리 · 통계 */}
          <div className="flex flex-nowrap overflow-x-auto min-w-0 border-t border-gray-200">
            {SUB_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 -mb-px'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {!showStatsOnly && (
        <>
        {/* 선택조건 (테이블형) */}
        <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">선택조건</h2>
            <button
              onClick={resetFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              필터 초기화
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {([
              { key: 'memberType' as const, label: '회원유형', options: ['전체', '일반회원', '준회원', '정회원'] },
              { key: 'gender' as const, label: '성별', options: ['전체', '남', '여'] },
              { key: 'subscription' as const, label: '회원 구독 상태', options: ['전체', 'Premium', 'Standard', 'Basic', '없음'] },
              { key: 'notification' as const, label: '알림 설정', options: ['전체', '문자', '이메일', '카카오톡'] },
              { key: 'marketing' as const, label: '마케팅 설정', options: ['전체', '문자', '이메일', '카카오톡', '없음'] },
              { key: 'serviceType' as const, label: '서비스 유형', options: ['전체', 'AI', '문서에디터', '영상편집에디터', '음악편집에디터'] },
              { key: 'purpose' as const, label: '제작 목적', options: ['전체', '판매', '자체사용'] },
              { key: 'verification' as const, label: '검증 상태', options: ['전체', '검증 요청', '수정 요청', '게시 완료', '취소'] },
              { key: 'aiUsed' as const, label: '사용 AI', options: ['전체', '사용 AI 1', '사용 AI 2', '사용 AI 3', '사용 AI 4', '사용 AI 5'] },
              { key: 'editorUsed' as const, label: '사용 에디터', options: ['전체', '편집 에디터(휴텍씨)', '영상 에디터', '문서 생성 에디터', '기타 에디터'] },
            ] as const).map(({ key, label, options }) => (
              <div key={key} className="flex min-h-12">
                <div className="w-40 shrink-0 bg-gray-50 px-4 py-3 flex items-center border-r border-gray-200">
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
                  {options.map((opt) => (
                    <label key={opt} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={opt === '전체' ? selectedFilters[key].length === 0 : (selectedFilters[key] as string[]).includes(opt)}
                        onChange={() => toggleFilterAll(key, opt)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* 긴급 여부 */}
            <div className="flex min-h-12">
              <div className="w-40 shrink-0 bg-gray-50 px-4 py-3 flex items-center border-r border-gray-200">
                <span className="text-sm font-medium text-gray-700">긴급 여부</span>
              </div>
              <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters.urgency}
                    onChange={() => toggleFilter('urgency', true)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span>긴급</span>
                </label>
              </div>
            </div>

            {/* 카테고리 */}
            <div className="flex min-h-12">
              <div className="w-40 shrink-0 bg-gray-50 px-4 py-3 flex items-center border-r border-gray-200">
                <span className="text-sm font-medium text-gray-700">카테고리</span>
              </div>
              <div className="flex-1 flex flex-wrap items-center gap-3 px-4 py-2">
                <select
                  value={category.large}
                  onChange={(e) => setCategory((c) => ({ ...c, large: e.target.value }))}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">카테고리 (대)</option>
                </select>
                <select
                  value={category.mid}
                  onChange={(e) => setCategory((c) => ({ ...c, mid: e.target.value }))}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">카테고리 (중)</option>
                </select>
                <select
                  value={category.small}
                  onChange={(e) => setCategory((c) => ({ ...c, small: e.target.value }))}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">카테고리 (소)</option>
                </select>
              </div>
            </div>

            {/* 검색 */}
            <div className="flex min-h-12">
              <div className="w-40 shrink-0 bg-gray-50 px-4 py-3 flex items-center border-r border-gray-200">
                <span className="text-sm font-medium text-gray-700">검색</span>
              </div>
              <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
                {SEARCH_BY_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="searchBy"
                      checked={searchBy === opt}
                      onChange={() => setSearchBy(opt)}
                      className="border-gray-300 text-blue-600"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="입력해주세요"
                  className="ml-2 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                />
              </div>
            </div>

            {/* 기간 검색 */}
            <div className="flex min-h-12">
              <div className="w-40 shrink-0 bg-gray-50 px-4 py-3 flex items-center border-r border-gray-200">
                <span className="text-sm font-medium text-gray-700">기간 검색</span>
              </div>
              <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
                {PERIOD_BY_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="periodBy"
                      checked={periodBy === opt}
                      onChange={() => setPeriodBy(opt)}
                      className="border-gray-300 text-blue-600"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
                <input
                  type="text"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))}
                  placeholder="YYYY.MM.DD"
                  className="ml-2 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
                />
                <span className="text-gray-400">~</span>
                <input
                  type="text"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
                  placeholder="YYYY.MM.DD"
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 회원유형 전용 필터 (검색조건 밑) */}
        <div className="mb-4">
          <select
            value={memberTypeQuickFilter}
            onChange={(e) => setMemberTypeQuickFilter(e.target.value)}
            className="w-full max-w-xs pl-4 pr-10 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-no-repeat bg-[length:1.25em] bg-[right_0.75rem_center]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
          >
            <option value="">회원유형</option>
            <option value="전체">전체</option>
            <option value="일반회원">일반회원</option>
            <option value="준회원">준회원</option>
            <option value="정회원">정회원</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              엑셀파일생성(간편)
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              엑셀파일생성(상담이력)
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              파일올리기
            </button>
          </div>
          <div className="text-sm text-gray-600">
            총 {filteredMembers.length}명
          </div>
        </div>
        </>
        )}

        {/* 통계 탭: 통계 요약만 */}
        {showStatsOnly && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-base font-semibold text-gray-900">통계 요약</h2>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-xs text-gray-500 mb-0.5">총 회원수</div>
                <div className="text-lg font-semibold text-gray-900">{stats.totalMembers}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-xs text-gray-500 mb-0.5">신규회원</div>
                <div className="text-lg font-semibold text-green-700">{stats.newMembers}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-xs text-gray-500 mb-0.5">휴면회원</div>
                <div className="text-lg font-semibold text-gray-600">{stats.dormantMembers}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-xs text-gray-500 mb-0.5">탈퇴회원</div>
                <div className="text-lg font-semibold text-red-600">{stats.withdrawnMembers}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-xs text-gray-500 mb-0.5">총 매출</div>
                <div className="text-lg font-semibold text-gray-900">{stats.totalRevenue.toLocaleString()}원</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-xs text-gray-500 mb-0.5">회원 가입비</div>
                <div className="text-lg font-semibold text-gray-900">{stats.membershipFees.toLocaleString()}원</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-xs text-gray-500 mb-0.5">콘텐츠 구매</div>
                <div className="text-lg font-semibold text-gray-900">{stats.contentPurchase.toLocaleString()}원</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-xs text-gray-500 mb-0.5">환불 금액</div>
                <div className="text-lg font-semibold text-red-600">{stats.refundAmount.toLocaleString()}원</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-center justify-center">
                <button className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800">
                  <BarChart3 className="w-4 h-4" /> 통계
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 전체 탭: 테이블 위 통계 스트립 */}
        {showTable && showWideTable && (
          <div className="flex flex-wrap gap-3 mb-4 p-3 bg-white border border-gray-200 rounded-lg">
            <span className="text-xs text-gray-500 font-medium">총 회원수 {stats.totalMembers} · 신규 {stats.newMembers} · 휴면 {stats.dormantMembers} · 탈퇴 {stats.withdrawnMembers}</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500 font-medium">총 매출 {stats.totalRevenue.toLocaleString()}원 · 가입비 {stats.membershipFees.toLocaleString()}원 · 콘텐츠 {stats.contentPurchase.toLocaleString()}원 · 환불 {stats.refundAmount.toLocaleString()}원</span>
          </div>
        )}

        {/* 회원정보 / 활동 / 결제 / 문의 테이블 (전체 탭: 가로 스크롤로 모두 표시) */}
        {showTable && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className={`overflow-x-auto ${showWideTable ? 'max-w-full' : ''}`}>
            <table className={`text-sm ${showWideTable ? 'min-w-[2400px]' : 'min-w-full'}`}>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left whitespace-nowrap sticky left-0 bg-gray-50 z-10">
                    <input
                      type="checkbox"
                      checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                      onChange={selectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  {showMemberCols && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">순번</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">회원ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">홈페이지</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">회원유형</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">이름</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">이메일</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">전화번호</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">국가</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">가입일</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">최종접속일</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">상태</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">포인트</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">등급</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">회원가</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">비고</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">회원관리</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">최종수정일</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">최종수정자</th>
                    </>
                  )}
                  {showActivityCols && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-blue-50/50">등록번호</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-blue-50/50">수료번호</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-blue-50/50">등록자</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-blue-50/50">등록일</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-blue-50/50">상품명</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-blue-50/50">가격</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-blue-50/50">상태</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-blue-50/50">총 학습 시간</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-blue-50/50">진도율</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-blue-50/50">수료여부</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-blue-50/50">수료증</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-blue-50/50">강의평가</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-blue-50/50">질문답변</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-blue-50/50">상세</th>
                    </>
                  )}
                  {showPaymentCols && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-amber-50/50">결제수단</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-amber-50/50">결제일</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-amber-50/50">환불일</th>
                    </>
                  )}
                  {showInquiryCols && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-green-50/50">제목</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-green-50/50">내용</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-green-50/50">답변상태</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-green-50/50">문의일</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-green-50/50">답변일</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-green-50/50">조회수</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-green-50/50">첨부</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-green-50/50">수정</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap bg-green-50/50">삭제</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white z-10 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => toggleMemberSelection(member.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    {showMemberCols && (
                      <>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{idx + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link to={`/hutechc-homepage/admin/members/${member.id}`} className="text-blue-600 hover:underline font-medium">
                            {member.memberId}
                          </Link>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${homepageBadge(member.homepage)}`}>
                            {member.homepage}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${memberTypeBadge(member.memberType)}`}>
                            {member.memberType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{member.name}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.email}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.phone}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.country}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.joinDate}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.lastLogin}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${statusBadge(member.status)}`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.points.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.grade}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.memberPrice.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.remarks || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Link to={`/hutechc-homepage/admin/members/${member.id}`} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded hover:text-gray-700" title="수정"><Pencil className="w-4 h-4" /></Link>
                            <Link to={`/hutechc-homepage/admin/members/${member.id}`} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded hover:text-gray-700" title="보기"><Eye className="w-4 h-4" /></Link>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.lastModified}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.lastModifiedBy}</td>
                      </>
                    )}
                    {showActivityCols && member.activity && (
                      <>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.regNo}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.completionNo}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.registrant}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.regDate}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.productName}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.price.toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${member.activity.productStatus === '결제완료' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {member.activity.productStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.studyTime}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.progress}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.completed}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.certificate || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.rating || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.qaCount}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link to={`/hutechc-homepage/admin/members/${member.id}`} className="text-blue-600 hover:underline text-xs">상세보기</Link>
                        </td>
                      </>
                    )}
                    {showActivityCols && !member.activity && (
                      Array.from({ length: 14 }).map((_, i) => <td key={i} className="px-4 py-3 text-gray-400 whitespace-nowrap">-</td>)
                    )}
                    {showPaymentCols && member.activity && (
                      <>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.paymentMethod || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.paymentDate || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.activity.refundDate || '-'}</td>
                      </>
                    )}
                    {showPaymentCols && !member.activity && (
                      Array.from({ length: 3 }).map((_, i) => <td key={i} className="px-4 py-3 text-gray-400 whitespace-nowrap">-</td>)
                    )}
                    {showInquiryCols && member.inquiry && (
                      <>
                        <td className="px-4 py-3 text-gray-900 whitespace-nowrap max-w-[120px] truncate" title={member.inquiry.title}>{member.inquiry.title}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap max-w-[140px] truncate" title={member.inquiry.content}>{member.inquiry.content}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${member.inquiry.answerStatus === '답변완료' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {member.inquiry.answerStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.inquiry.inquiryDate}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.inquiry.answerDate || '-'}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.inquiry.views}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{member.inquiry.hasAttachment ? '📎' : '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link to={`/hutechc-homepage/admin/members/${member.id}`} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="수정"><Pencil className="w-3.5 h-3.5 inline" /></Link>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button type="button" className="p-1 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded" title="삭제"><Trash2 className="w-3.5 h-3.5 inline" /></button>
                        </td>
                      </>
                    )}
                    {showInquiryCols && !member.inquiry && (
                      Array.from({ length: 9 }).map((_, i) => <td key={i} className="px-4 py-3 text-gray-400 whitespace-nowrap">-</td>)
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {showTable && (
        <div className="mt-4 flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">선택항목삭제</button>
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">메일보내기</button>
            <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">SMS전송</button>
          </div>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">파일다운로드</button>
        </div>
        )}
      </main>
    </div>
  );
}
