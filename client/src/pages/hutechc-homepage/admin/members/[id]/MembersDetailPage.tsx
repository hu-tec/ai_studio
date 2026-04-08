/* 원본: hutechc_hompage_real/app/(client-layout)/admin/members/[id]/page.tsx */
import { Link, useParams } from 'react-router';
import { useState } from 'react';

// Mock 회원 상세 데이터
const mockMemberDetail = {
  id: 1,
  memberNo: 'UI240110002',
  siteType: '메타시험',
  memberType: '정식회원',
  subscription: 'Premium',
  name: '홍길동',
  age: 30,
  birthDate: '1994.01.01',
  gender: '남',
  phone: '01012345678',
  emergencyPhone: '01012345678',
  email: 'abcd@gmail.com',
  nationality: '대한민국',
  address: '서울시 무슨구 무슨동',
  detailAddress: '0000빌딩 000호',
  groupStatus: true,
  groupName: '삼성',
  joinDate: '2024.10.30',
  joinChannel: '카카오',
  firstDevice: '모바일',
  lastLogin: '2024.12.20 14:30:00',
  stayTime: '',
  photo: '',
  notification: {
    general: ['문자', '카카오톡', '이메일'],
    marketing: ['문자', '카카오톡', '이메일'],
  },
  creativeWork: {
    id: '자동생성',
    price: 100000,
    sales: 0,
    views: 0,
    verificationStatus: '검증요청',
    salePrice: 100000,
    ai: ['사용 AI 1', '사용 AI 2', '사용 AI 3'],
    editor: '문서에디터',
    content: '',
  },
  matching: {
    id: '자동생성',
    expertNames: ['홍길동', '김전문', '김길동'],
    expertLevel: '특수존문거',
    requestDate: '24.12.20.월',
    completeDate: '24.12.20.월',
    method: '매칭요청',
    status: '요청',
    serviceType: '설문',
    serviceMethod: '채팅',
    activityTime: ['평일', '주말'],
    urgent: true,
    requestDetails: '',
  },
  activity: {
    id: '자동생성',
    serviceType: '메타시험',
    region: '대한민국 서울',
    examDate: '2024.01.10',
    startTime: '10:00',
    endTime: '16:00',
    type: '정시',
    round: '25년 1차',
    examItem: 'AlTe 번역 전문가',
    examGrade: '전문 1급',
    subjects: ['검정과목', '분야', '영역', '검정과목', '검정과목', '검정과목'],
    examName: '시험명이 나오는 부분입니다.',
    sourceLang: '한국어',
    targetLang: 'English',
    examType: '시험유형',
    applicationPeriod: '24.01.10-24.01.30',
    applicationStatus: '접수 완료',
    examStatus: '시험 완료',
    examResultStatus: '응시 완료',
    resultDate: '24.10.10.월',
    resultTime: '10:00',
    autoScore: 60,
    score: 70,
    examResult: '불합격',
    certificates: ['', '', '', ''],
  },
  payment: {
    id: '자동생성',
    date: '24.12.20.월',
    content: '시험응시',
    amount: 100000,
    benefit: '이벤트 할인',
    benefitAmount: -10000,
    finalAmount: 90000,
    points: 12000,
    method: '카드결제 OO카드',
    paymentInfo: 'XXXXXX-XXXXXX-XXXXXXXXX',
  },
  refund: {
    id: '자동생성',
    requestDate: '24.12.20.월',
    status: '환불 요청',
    requestAmount: 100000,
    refundAmount: 90000,
    method: '계좌 입금',
    accountInfo: 'OO은행 XXXXXX-XXX-XXXXXX 홍길동',
  },
  inquiry: {
    id: '자동생성',
    consultDate: '24.12.20.월',
    completeDate: '2024.12.20.월',
    status: '답변 완료',
    inquiryType: '결제',
    answerType: '결제',
    answerer: '관리자',
    title: '문의 내용 표시',
    content: '',
    attachments: ['filename.gif', 'filename.gif', 'filename.gif'],
    answerTitle: '',
    answerContent: '',
  },
};

export default function MembersDetailPage() {
  const { id } = useParams();
  const [inquiryAnswer, setInquiryAnswer] = useState({
    title: '',
    content: '',
  });
  const [adminMemo, setAdminMemo] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);

  const member = mockMemberDetail;

  return (
    <div className="min-h-screen bg-gray-50" data-member-id={id}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/hutechc-homepage/admin/members" className="text-sm text-gray-500 hover:text-gray-700">
              홈 &gt; 회원관리 &gt; 화면관리 상세
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">관리자</div>
            <button className="text-sm text-gray-600 hover:text-gray-900">로그아웃</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              저장
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* 회원 기본 정보 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">회원 기본 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">회원 관리 번호</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.memberNo}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">사이트 구분</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.siteType}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">회원 유형</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.memberType}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">구독 상태</label>
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">
                    {member.subscription}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                  <input
                    type="text"
                    defaultValue={member.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">나이</label>
                  <input
                    type="number"
                    defaultValue={member.age}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
                  <input
                    type="text"
                    defaultValue={member.birthDate}
                    placeholder="YYYY.MM.DD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="gender"
                        value="남"
                        defaultChecked={member.gender === '남'}
                        className="border-gray-300"
                      />
                      <span className="text-sm">남</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="gender"
                        value="여"
                        defaultChecked={member.gender === '여'}
                        className="border-gray-300"
                      />
                      <span className="text-sm">여</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">휴대폰</label>
                  <input
                    type="text"
                    defaultValue={member.phone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">비상 연락처</label>
                  <input
                    type="text"
                    defaultValue={member.emergencyPhone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input
                    type="email"
                    defaultValue={member.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">국적</label>
                  <input
                    type="text"
                    defaultValue={member.nationality}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                  <input
                    type="text"
                    defaultValue={member.address}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">상세주소</label>
                  <input
                    type="text"
                    defaultValue={member.detailAddress}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">그룹여부</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={member.groupStatus}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">그룹</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">그룹명</label>
                  <input
                    type="text"
                    defaultValue={member.groupName || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">가입일</label>
                  <input
                    type="text"
                    defaultValue={member.joinDate}
                    placeholder="YYYY.MM.DD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">가입채널</label>
                  <input
                    type="text"
                    defaultValue={member.joinChannel}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">최초접근기기</label>
                  <input
                    type="text"
                    defaultValue={member.firstDevice}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">최근 로그인</label>
                  <input
                    type="text"
                    defaultValue={member.lastLogin}
                    placeholder="YYYY.MM.DD hh:mm:ss"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">알림 설정</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="text-sm text-gray-600">일반:</span>
                      {member.notification.general.map((notif) => (
                        <span key={notif} className="text-sm text-gray-700">{notif}</span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <span className="text-sm text-gray-600">마케팅:</span>
                      {member.notification.marketing.map((notif) => (
                        <span key={notif} className="text-sm text-gray-700">{notif}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 창작물 정보 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">창작물 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">창작물 관리 번호</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.creativeWork.id}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">판매 희망금액</label>
                  <input
                    type="number"
                    defaultValue={member.creativeWork.price}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">판매수</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.creativeWork.sales || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">조회수</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.creativeWork.views || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">검증상태</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>검증요청</option>
                    <option>검증완료</option>
                    <option>검증거부</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">판매 금액</label>
                  <input
                    type="number"
                    defaultValue={member.creativeWork.salePrice}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">사용 AI</label>
                  <div className="flex flex-wrap gap-2">
                    {member.creativeWork.ai.map((ai, idx) => (
                      <button
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
                      >
                        {ai}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">사용 에디터</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.creativeWork.editor}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">창작물이 보여지는 영역</label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="창작물 내용을 입력하세요..."
                />
              </div>
            </div>

            {/* 활동 정보 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">활동 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">활동 관리 번호</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.activity.id}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">서비스 유형</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.activity.serviceType}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">지역</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.activity.region}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시험일</label>
                  <input
                    type="text"
                    defaultValue={member.activity.examDate}
                    placeholder="YYYY.MM.DD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                  <input
                    type="text"
                    defaultValue={member.activity.startTime}
                    placeholder="hh:mm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
                  <input
                    type="text"
                    defaultValue={member.activity.endTime}
                    placeholder="hh:mm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">구분</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.activity.type}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">차수</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.activity.round}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시험 종목</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.activity.examItem}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시험 등급</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.activity.examGrade}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">검정과목</label>
                  <div className="flex flex-wrap gap-2">
                    {member.activity.subjects.map((subject, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">시험명</label>
                  <textarea
                    rows={2}
                    defaultValue={member.activity.examName}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">출발어</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.activity.sourceLang}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">도착어</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.activity.targetLang}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시험유형</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.activity.examType}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">접수기간</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.activity.applicationPeriod}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">접수상태</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>접수 완료</option>
                    <option>접수 전</option>
                    <option>접수 취소</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시험 상태</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.activity.examStatus}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">응시 상태</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.activity.examResultStatus}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">성적 발표일</label>
                  <input
                    type="text"
                    defaultValue={member.activity.resultDate}
                    placeholder="YY.MM.DD.DOW"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">발표 시간</label>
                  <input
                    type="text"
                    defaultValue={member.activity.resultTime}
                    placeholder="hh:mm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">자동 채점 점수</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.activity.autoScore}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">채점 점수</label>
                  <input
                    type="number"
                    defaultValue={member.activity.score}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시험 결과</label>
                  <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                    member.activity.examResult === '합격' ? 'bg-green-100 text-green-700' :
                    member.activity.examResult === '불합격' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {member.activity.examResult}
                  </div>
                </div>
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 정보</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">결제 관리 번호</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">결제일</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">결제 내용</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">이용 금액</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">혜택</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">혜택 금액</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">결제 금액</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">보유 포인트</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">결제 방법</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">결제 정보</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-gray-600">{member.payment.id}</td>
                      <td className="px-4 py-3 text-gray-600">{member.payment.date}</td>
                      <td className="px-4 py-3 text-gray-600">{member.payment.content}</td>
                      <td className="px-4 py-3 text-gray-600">{member.payment.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{member.payment.benefit}</td>
                      <td className="px-4 py-3 text-gray-600">{member.payment.benefitAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{member.payment.finalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{member.payment.points.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{member.payment.method}</td>
                      <td className="px-4 py-3 text-gray-600">{member.payment.paymentInfo}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 환불 정보 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">환불 정보</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">환불 관리 번호</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">환불 요청일</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">환불 상태</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">환불 요청 금액</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">환불 금액</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">환불 방법</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">환불 계좌 정보</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-gray-600">{member.refund.id}</td>
                      <td className="px-4 py-3 text-gray-600">{member.refund.requestDate}</td>
                      <td className="px-4 py-3">
                        <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                          <option>환불 요청</option>
                          <option>환불 완료</option>
                          <option>환불 거부</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{member.refund.requestAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{member.refund.refundAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{member.refund.method}</td>
                      <td className="px-4 py-3 text-gray-600">{member.refund.accountInfo}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 1:1 문의 정보 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">1:1 문의 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">문의 관리 번호</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.inquiry.id}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상담일</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.inquiry.consultDate}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상담 완료일</label>
                  <input
                    type="text"
                    defaultValue={member.inquiry.completeDate}
                    placeholder="YYYY.MM.DD.DOW"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상담 상태</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>답변 완료</option>
                    <option>답변 대기</option>
                    <option>답변 보류</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">문의 분류</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>결제</option>
                    <option>시험</option>
                    <option>계정</option>
                    <option>기타</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">답변 분류</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>결제</option>
                    <option>시험</option>
                    <option>계정</option>
                    <option>기타</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">답변자</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.inquiry.answerer}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">문의 제목</label>
                  <input
                    type="text"
                    defaultValue={member.inquiry.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">문의 내용</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="문의 내용을 입력하세요..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">첨부파일</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {member.inquiry.attachments.map((file, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                        {file} <button className="text-red-600 ml-2">×</button>
                      </span>
                    ))}
                  </div>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                    파일 올리기
                  </button>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">답변 제목</label>
                  <input
                    type="text"
                    value={inquiryAnswer.title}
                    onChange={(e) => setInquiryAnswer((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">답변 내용</label>
                  <textarea
                    rows={6}
                    value={inquiryAnswer.content}
                    onChange={(e) => setInquiryAnswer((prev) => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="답변 내용을 입력하세요..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* 매칭 정보 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">매칭 정보</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">매칭 관리 번호</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.matching.id}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전문가명</label>
                  <div className="flex flex-wrap gap-2">
                    {member.matching.expertNames.map((name, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전문가 레벨</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm">
                    {member.matching.expertLevel}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">매칭요청일</label>
                  <input
                    type="text"
                    defaultValue={member.matching.requestDate}
                    placeholder="YY.MM.DD.DOW"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">매칭완료일</label>
                  <input
                    type="text"
                    defaultValue={member.matching.completeDate}
                    placeholder="YY.MM.DD.DOW"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">매칭 방법</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="matchingMethod"
                        value="매칭요청"
                        defaultChecked={member.matching.method === '매칭요청'}
                        className="border-gray-300"
                      />
                      <span className="text-sm">매칭요청</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">매칭 상태</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>요청</option>
                    <option>매칭중</option>
                    <option>완료</option>
                    <option>취소</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">서비스 유형</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>설문</option>
                    <option>번역</option>
                    <option>기타</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">서비스 방법</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>채팅</option>
                    <option>파일</option>
                    <option>화상</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">활동 요청 시간</label>
                  <div className="flex flex-wrap gap-2">
                    {['상관없음', '평일 오전', '평일 오후', '주말'].map((time) => (
                      <label key={time} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          defaultChecked={member.matching.activityTime.includes(time) || time === '상관없음'}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{time}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">긴급 여부</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={member.matching.urgent}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">긴급</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">요청사항</label>
                  <textarea
                    rows={4}
                    defaultValue={member.matching.requestDetails}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="요청사항을 입력하세요..."
                  />
                </div>
              </div>
            </div>

            {/* 전문가 찾기 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">전문가 찾기</h2>
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-3 gap-2">
                  <select className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>대</option>
                  </select>
                  <select className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>중</option>
                  </select>
                  <select className="px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>소</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전문가 레벨</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>특수 전문가</option>
                    <option>1급</option>
                    <option>2급</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">서비스 유형</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>설문</option>
                    <option>번역</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">서비스 방법</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>파일</option>
                    <option>채팅</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">활동 요청 시간</label>
                  <div className="flex flex-wrap gap-2">
                    {['상관없음', '평일 오전', '평일 오후', '주말'].map((time) => (
                      <label key={time} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          defaultChecked={time === '상관없음'}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{time}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">완료 희망일</label>
                  <input
                    type="text"
                    placeholder="YYYY.MM.DD.DOW"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">긴급 여부</span>
                  </label>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  찾기
                </button>
                <div className="flex gap-2">
                  <select className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>평점 높은 순</option>
                    <option>경력 많은 순</option>
                  </select>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                    선택
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                {[
                  { name: '김전문', email: 'abcde@gmail.com', company: 'XXXXXXX회사', position: 'CEO', experience: 'YY년 00개월', rating: 3.5 },
                  { name: '이전문', email: 'fghij@gmail.com', company: 'YYYYYYY회사', position: 'CTO', experience: 'ZZ년 00개월', rating: 4.2 },
                  { name: '박전문', email: 'klmno@gmail.com', company: 'ZZZZZZZ회사', position: '팀장', experience: 'AA년 00개월', rating: 4.8 },
                ].map((expert, idx) => (
                  <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-sm text-gray-900">{expert.name}</div>
                        <div className="text-xs text-gray-600">{expert.email}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedExpert === expert.name}
                        onChange={() => setSelectedExpert(expert.name)}
                        className="rounded border-gray-300"
                      />
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>{expert.experience}</div>
                      <div>{expert.company} {expert.position}</div>
                      <div className="flex items-center gap-1">
                        <span>활동횟수 100</span>
                        <span className="text-yellow-600">★ {expert.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 관리자 메모 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">관리자 메모</h2>
              <textarea
                rows={8}
                value={adminMemo}
                onChange={(e) => setAdminMemo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="메모를 입력하세요..."
              />
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Link to="/hutechc-homepage/admin/members"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
