import { useMemo, useState } from 'react';
import {
  ClipboardCheck, User, Brain, Video, FileSignature,
  GraduationCap, Paperclip, ListChecks, CheckCircle2,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   알바 면접 안내 — 면접_알바.html 이식 (컴팩트/다단/인라인 규칙 적용)
   ══════════════════════════════════════════════════════════════ */

type Phase = 'interview' | 'work1';
type StepKey =
  | 'guide' | 'info' | 'mbti' | 'video'
  | 'contract' | 'edu' | 'docs' | 'manual';

interface StepDef {
  key: StepKey;
  phase: Phase;
  num: number;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

const STEPS: StepDef[] = [
  { key: 'guide',    phase: 'interview', num: 1, label: '면접 과정 안내', icon: ClipboardCheck },
  { key: 'info',     phase: 'interview', num: 2, label: '인적사항',        icon: User },
  { key: 'mbti',     phase: 'interview', num: 3, label: '성격 검사',       icon: Brain },
  { key: 'video',    phase: 'interview', num: 4, label: '영상 시청·요약',  icon: Video },
  { key: 'contract', phase: 'work1',     num: 1, label: '근로계약서',      icon: FileSignature },
  { key: 'edu',      phase: 'work1',     num: 2, label: '출근 후 교육',    icon: GraduationCap },
  { key: 'docs',     phase: 'work1',     num: 3, label: '서류첨부',        icon: Paperclip },
  { key: 'manual',   phase: 'work1',     num: 4, label: '메뉴얼',          icon: ListChecks },
];

/* ── MBTI 40문항 ── */
const MBTI_QS: Record<'EI'|'SN'|'TF'|'JP', { a: string; b: string }[]> = {
  EI: [
    { a: '나는 말하기를 좋아해 실수 할 때가 종종 있다', b: '나는 말이 없어 주변 사람들이 답답해 할 때가 있다' },
    { a: '나는 새로운 사람을 만나도 어색하지 않다', b: '나는 모르는 사람을 만나는 일이 피곤하다' },
    { a: '나는 말하면서 생각하고 대화도중 결심할 때가 있다', b: '나는 의견을 말하기 앞서 신중히 생각하는 편이다' },
    { a: '나는 팀으로 일하는 것이 편하다', b: '나는 혼자 혹은 소수로 일하는 것이 편하다' },
    { a: '나는 나의 견해를 사람들에게 표현하기를 좋아한다', b: '나는 대체로 나의 생각, 견해를 내 안에 간직하는 편이다' },
    { a: '말을 할 때 제스처가 큰 편이다', b: '말을 할 때 제스처를 사용하면 어색한 편이다' },
    { a: '오랜시간 혼자 일하다 보면 외롭고 지루한 편이다', b: '혼자 오랜시간 일을 잘하는 편이다' },
    { a: '일할 때 적막한 것보다는 어느정도의 소리가 도움이 된다', b: '나는 소음이 있는 곳에서 일을 할 때 일하기가 힘들다' },
    { a: '말이 빠른편이다', b: '목소리가 작고 조용하게 천천히 말하는 편이다' },
    { a: '나는 활동적인 편이다', b: '나는 집에 있는 것이 편하다' },
  ],
  SN: [
    { a: '나는 현실적이다', b: '나는 미래지향적이다' },
    { a: '나는 경험으로 판단한다', b: '나는 떠오르는 직관으로 판단한다' },
    { a: '나는 사실적 묘사를 잘한다', b: '나는 추상적 표현을 잘한다' },
    { a: '나는 구체적이다', b: '나는 은유적이다' },
    { a: '나는 상식적이다', b: '나는 창의적이다' },
    { a: '나는 갔던 길로 가는 것이 편하다', b: '나는 새로운 길이 재밌다' },
    { a: '나는 했던 일이 편하다', b: '나는 새로운 일이 흥미있다' },
    { a: '나는 약도를 구체적으로 그린다', b: '나는 약도를 구체적으로 그리기 어렵다' },
    { a: '나는 구체적이다', b: '나는 비약한다' },
    { a: '나는 실제 경험을 좋아한다', b: '나는 공상을 좋아한다' },
  ],
  TF: [
    { a: '나는 분석적이다', b: '나는 감수성이 풍부하다' },
    { a: '나는 객관적이다', b: '나는 공감적이다' },
    { a: '나는 감정에 치우치지 않고 의사결정을 한다', b: '나는 상황을 생각하며 의사결정을 한다' },
    { a: '나는 이성과 논리로 행동한다', b: '나는 가치관과 사람 중심으로 행동한다' },
    { a: '나는 능력있다는 소리 듣기를 좋아한다', b: '나는 따뜻하다는 소리 듣기를 좋아한다' },
    { a: '나는 경쟁한다', b: '나는 양보한다' },
    { a: '나는 직선적인 말이 편하다', b: '나는 배려하는 말이 편하다' },
    { a: '나는 사건의 원인과 결과를 쉽게 파악한다', b: '나는 사람의 기분을 쉽게 파악한다' },
    { a: '사람들이 나를 차갑다고 느끼는 편이다', b: '사람들이 나를 따뜻하다고 하는 편이다' },
    { a: '나는 할말은 한다', b: '나는 좋게 생각하는 편이다' },
  ],
  JP: [
    { a: '나는 결정에 대해서 잘 변경하지 않는 편이다', b: '나는 결정에 대해서 융통성이 있는 편이다' },
    { a: '나는 계획에 의해서 일을 처리하는 편이다', b: '나는 마지막에 임박했을 때에 일을 처리하는 편이다' },
    { a: '나는 계획된 여행이 편하다', b: '나는 갑자기 떠나는 여행이 편하다' },
    { a: '나는 정리정돈을 자주 하는 편이다', b: '나는 날 잡아서 정리하는 편이다' },
    { a: '나는 조직적인 분위기에 일이 잘된다', b: '나는 즐거운 분위기에 일이 잘된다' },
    { a: '나는 계획적이고 조직적이다', b: '나는 나의 순발력을 믿는다' },
    { a: '나는 규범을 좋아한다', b: '나는 자유로운 것을 좋아한다' },
    { a: '나는 일할 때 친해진다', b: '나는 놀 때 친해진다' },
    { a: '내 책상은 정리가 잘 되어있다', b: '내 책상은 편안하게 되어있다' },
    { a: '쇼핑을 갈 때 적어 가는 편이다', b: '쇼핑을 갈 때 적지 않고 그냥 가는 편이다' },
  ],
};

const MBTI_DIMS: { key: 'EI'|'SN'|'TF'|'JP'; a: string; b: string; aLabel: string; bLabel: string }[] = [
  { key: 'EI', a: 'E', b: 'I', aLabel: '외향 E', bLabel: '내향 I' },
  { key: 'SN', a: 'S', b: 'N', aLabel: '감각 S', bLabel: '직관 N' },
  { key: 'TF', a: 'T', b: 'F', aLabel: '사고 T', bLabel: '감정 F' },
  { key: 'JP', a: 'J', b: 'P', aLabel: '판단 J', bLabel: '인식 P' },
];

/* ── 출근 후 교육 테이블 (18행) — 마지막 열 = 비고 ── */
const EDU_ROWS: { title: string; body: string; note: string }[] = [
  { title: '소개', body: '휴텍씨, 국제통역번역협회, 타임스미디어 / 본사는 서초동, 여기는 연구소 개념', note: '' },
  { title: '출퇴근', body: '출근/퇴근 업무일지 기록, 업무 우선순위 및 내용 변경 시 추가 업무·이메일 확인 후 처리, 고정 업무·변경 업무·잔무·기획 업무·공용 업무 구분', note: '' },
  { title: '업무일지', body: '30분 단위 작성, 다음날·다음 주·다음 달 일정 기록, 피드백 하루 2회(모아서 보고), 초기 양 위주 → 이후 질/내용 위주, 1차(잔무·급함·전달·보고) 2차(고정) 3차(새일·연결) 구분', note: '' },
  { title: '업무 프로세싱', body: '맥락·흐름·뉘앙스 이해, 틀·폼·형태 먼저 확인 후 진행, 효율성·가독성·30분 단위 중요', note: '' },
  { title: '업무', body: '진행 내용 캡처 이미지로 보고 후 다운로드 가능, 우선순위 헷갈릴 때 반드시 질문', note: '' },
  { title: '업무 인지', body: 'What/Why/How 함께 설명, A/B 경우 함께 제시, 중간 보고 필수, 마감일 정하고 지시자에게 알리기, 문서 한 달에 한 번씩 정리', note: '' },
  { title: '정리정돈', body: '본인 컴퓨터 위·화면·문서·출력물 정리 요청', note: '' },
  { title: '보고법', body: '보고 대상: 지시한 사람, 중요하거나 긴 업무는 중간 보고 필수, 완료 후 보고 필수, 잔무는 한 마디로 요약 보고', note: '' },
  { title: '업무 체크리스트', body: '각종 업무 체크리스트 활용', note: '와이파이' },
  { title: '이메일', body: '-', note: '구글 메일' },
  { title: 'AI 활용', body: '-', note: 'GPT, 커서(Cursor)' },
  { title: '급여', body: '매월 15일~말일 입금, 업무일지 기록 시 출퇴근 시간 5분 전 출근하여 기록', note: '캔바' },
  { title: '로그인 정보', body: '자료로 제공', note: '' },
  { title: '엑셀', body: '모든 문서 엑셀 1개(시트 20개까지), 줄 긋고 한 장에 50% 이상 프린트 가능하게, 셀 병합 금지, 글자 색·색칠로 보기 쉽게, 시트 20개 넘으면 카테고리별 분류', note: '홈페이지' },
  { title: 'PPT', body: '한 장에 2장 캡처/출력 가로 4장, 이미지 캡처 위주, 40장까지 하나의 파일로 관리', note: '개발 홈피' },
  { title: '피드백·아이디어', body: '종이 출력 내용 위주/캡처하여 내용 삽입', note: '카카오톡' },
  { title: '비품/프린터', body: '개인 물품 필요 시 담당자 요청, 프린터 공용 한 장에 4장 출력', note: '' },
  { title: '보안규정', body: '개인 메일·핸드폰·클라우드 사용 금지, 회사 자료 복사·외부 반출·개인 USB 금지', note: '' },
  { title: '기타', body: '모든 문서 삭제 금지, 삭제 파일 보관. 담당: 노재훈 사장님, 서수연 팀장, 정인수 팀장, 이원진 팀장님, 김성태 팀장님', note: '' },
];

/* ── 메뉴얼 토픽 ── */
type ManualTopic = '회사배경' | '업무방식' | '1차(면접 시)' | '2차(수습)' | '3차(수습통과)';
const MANUAL_TOPICS: ManualTopic[] = ['회사배경', '업무방식', '1차(면접 시)', '2차(수습)', '3차(수습통과)'];

const BG_ROWS = [
  ['한 줄 요약', '자수성가형 사업가, 성과로 증명해 온 리더', '"결과물로 말하는 문화"가 강함'],
  ['성과 경험', '매출 1000억 규모를 만든 경험이 있음', '속도/성과/납기를 중요하게 봄'],
  ['성공 경험', '큰 성공을 2번 해 본 타입', "'될 때까지 해보자' 추진력이 강함"],
  ['리딩 경험', '과거에 200명 규모 조직을 리딩한 경험', '기본(보고/시간/정리)에 기준이 높음'],
  ['현재 환경', '테크기업 운영, 비교적 젊은 팀과 협업 중', '문서/템플릿으로 맞추면 일하기 쉬움'],
  ['의사결정 습관', '빨리 보고 받고 빨리 결정하는 편', '길게 설명보다 "결론 1줄"이 잘 먹힘'],
  ['일하는 기대치', '"지시하면 시작한다"에 가깝다', '시작 신호("지금 시작")가 신뢰를 만든다'],
  ['신뢰 포인트', '늦게 말하는 것보다, 먼저 말하는 걸 더 신뢰함', '막히면 숨기지 말고 빨리 공유해야 함'],
  ['피드백 특징', '결과 중심으로 수정 포인트를 빠르게 준다', "피드백은 '수정 리스트'로 정리하면 편함"],
];

const STYLE_ROWS = [
  ['속도', '빠른 걸 좋아함', '"지금 시작했어?"를 빨리 묻는다', '일 빨리 굴림', '느리면 불안해하고 톤이 세질 수 있음', "받자마자 '시작했습니다' 한 줄 보내기"],
  ['추진력', '밀어붙이는 힘이 큼', '"일단 해봐", "바로 가자"', '실행이 빠름', '방향 확인 없이 밀면 다시 해야 함', '초안 먼저 보여주고 맞추기'],
  ['말투', '직설적임', '"이건 아니야"가 바로 나올 수 있음', '피드백이 빠름', '신입이 상처받고 위축될 수 있음', '관리자는 수정 포인트를 3개로 정리해서 전달'],
  ['설명 스타일', '긴 설명 싫어함', '길게 말하면 끊을 수 있음', '회의가 짧아짐', '배경이 빠져 오해가 생길 수 있음', '배경은 1줄만, 자세한 건 링크/표로'],
  ['결론 선호', '결론부터 듣고 싶어함', '"그래서 결론이 뭐야?"', '결정이 빠름', '과정 설명 길면 답답해함', '보고는 결론 1줄 먼저'],
  ['기준 제시', '기준을 말로 다 안 줄 때가 있음', '"깔끔하게", "센스 있게" 같은 말', '감각적 판단 빠름', '기준이 없어서 헤매기 쉬움', '"직설적으로 기준 주세요: 형식/분량/예시"'],
  ['행동 중심', '말보다 행동을 보여 주는 걸 좋아함', '계획만 있으면 답답해함', '일 진행이 보임', '신입이 "생각 중"으로 멈추면 불리', '일단 시작 → 초안 → 수정 순서'],
  ['질문 방식', '질문을 자주 끊어 먹는 걸 싫어함', '질문이 계속 오면 흐름 끊긴다고 느낌', '속도 유지', '질문 못 하고 혼자 끌면 터짐', '질문은 모아서 한 번에(3개)'],
  ['피드백 방식', '수정 포인트를 바로 찍음', '"이거 바꿔"가 빠름', '개선 속도 빠름', "'왜' 설명이 짧아 납득이 어려울 수 있음", '"수정은 3개만 확정하고 시작"'],
  ['감정/텐션', '텐션이 높고 즉흥적일 수 있음', '분위기 좋을 땐 아이디어가 쏟아짐', '팀 에너지 올림', '텐션 따라 말이 바뀌는 느낌 날 수 있음', '말로 끝내지 말고 한 줄 기록 남기기'],
  ['동시 지시', '한 번에 여러 일을 던질 수 있음', '"이것도 해봐"가 붙는다', '기회/아이디어 많음', '우선순위가 흔들림', 'A/B/C로 정리해서 1순위 확인'],
  ['중간 확인', "완성본보다 '방향'을 먼저 보고 싶어함", '중간에 한 번 보면 마음이 놓임', '갈아엎기 줄어듦', '중간 확인이 없으면 막판에 뒤집힘', '중간에 한 번 보여주기(방향 확인)'],
  ['리스크 반응', '문제 생기면 바로 해결하려 함', '이슈 나오면 즉시 대응 모드', '위기 대응 빠름', '늦게 알리면 신뢰가 확 떨어짐', '문제 생기면 바로 말하기(숨기지 않기)'],
  ['신뢰 기준', '늦게 말하는 걸 제일 싫어함', '"왜 지금 말해?"가 나올 수 있음', '책임감 문화', '보고 회피하면 큰 문제', '늦어질 것 같으면 먼저 말하기'],
  ['결과 기준', '결과물/납기 중심', '"결과물 링크 줘"', '판단 빠름', '과정 설명 늘어지면 싫어함', '제출은 링크 + 한 줄 요약'],
  ['일관성 확보', '구두로 결정나는 경우가 있음', '"내가 말했잖아" 상황 가능', '빠름', '기록 없으면 싸움', '결정은 결정/담당/기한 3줄로 남기기'],
  ['세대/방식 차이', '옛 방식+빠른 방식 섞임', '문서/틀 표준화가 아직 흔들릴 수 있음', '변화 적응 가능', '팀마다 방식이 달라 혼란', '관리자가 템플릿/규칙을 고정해서 통일'],
];

interface PhaseRow {
  div: string;
  core: string;
  easy: string;
  eg: string;
  tags: string;
}

const PHASE1_ROWS: PhaseRow[] = [
  { div: '1. 우리 팀 한 줄', core: '우리는 결과물로 일한다', easy: '말로 끝내지 않고 문서/표/캡쳐 정리를 남긴다', eg: '① "저희는 말로 끝내지 않고, 결과물(문서/표/정리자료)로 남깁니다." ② "회의 끝나면 정리본/표/캡처까지 만들어서 결과로 공유합니다."', tags: '결과물, 문서화, 정리, 캡처, 실행' },
  { div: '2. 회사 성격', core: '연구소 성격 팀이다', easy: '본사(서초동) 소속이고, 실무는 결과물 중심이다', eg: '① "휴텍씨 안에서 연구소 성격으로, 실무도 결과물 중심으로 움직입니다." ② "본사(서초) 소속이고, 리서치 기반으로 실무를 문서로 정리하는 팀입니다."', tags: '연구소, 리서치, 본사, 실무, 결과중심' },
  { div: '3. 일하는 기본', core: '짧게 공유·중간에 보여주기·기록', easy: '일이 커지기 전에 중간에 한 번 보여주고 맞춘다', eg: '① "큰 방향은 빨리 잡고, 중간 공유로 계속 맞추면서 갑니다." ② "일 커지기 전에 초안/중간본을 먼저 보여드리고 조정합니다."', tags: '중간공유, 초안, 기록, 정렬, 싱크' },
  { div: '4. 말하는 방식', core: '보고는 결론부터', easy: '긴 설명보다 한 줄 요약이 먼저다', eg: '① "저는 먼저 결론 한 줄 말씀드리고, 근거를 붙이겠습니다." ② "요약부터 드리면, 지금 필요한 결정은 A입니다."', tags: '결론, 요약, 핵심, 의사결정, 보고' },
  { div: '5. 질문하는 방식', core: '질문은 A/B로', easy: '"어떻게 할까요?" 말고 선택지를 들고 간다', eg: '① "지금은 A안/B안 중에 고르면 될 것 같고, 저는 A가 더 맞다고 봅니다." ② "선택지는 두 개입니다. A로 가면 속도, B로 가면 완성도가 강점입니다."', tags: '선택지, A/B, 비교, 근거, 제안' },
  { div: '6. 막히면', core: '30분 안에 말하기', easy: '혼자 끌면 더 커진다. 빨리 공유가 이득이다', eg: '① "지금 막힌 지 20분 됐고, 10분 더 보고 바로 공유드리겠습니다." ② "혼자 끌기보다 빨리 맞추는 게 낫다고 판단해서 지금 공유드립니다."', tags: '30분룰, 즉시공유, 리스크, 빠른보고, 정리' },
  { div: '7. 속도 문화', core: '늦게 말하면 손해', easy: '늦어질 것 같으면 먼저 말하는 게 정답이다', eg: '① "지연 가능성이 보여서 먼저 말씀드립니다. 오늘 오후까지는 업데이트 드릴게요." ② "늦어질 것 같으면 먼저 공유하는 게 맞아서 사전에 알립니다."', tags: '선공유, 속도, 지연관리, 일정, 선제' },
  { div: '8. 보안(핵심)', core: '개인 메일/폰/클라우드 금지', easy: '회사 자료는 개인 채널로 옮기면 안 됨', eg: '① "회사 자료는 개인 메일/개인 폰/개인 클라우드로 절대 옮기지 않습니다." ② "업무 자료는 회사 채널 안에서만 저장·공유하고 개인 채널은 쓰지 않습니다."', tags: '보안, 개인채널금지, 회사채널, 정보보호, 규정준수' },
  { div: '9. 보안(추가)', core: 'USB/반출 금지', easy: '파일 복사/반출도 금지', eg: '① "업무 파일은 USB 복사/외부 반출 없이 회사 환경에서만 처리합니다." ② "외부로 나가는 형태(USB/메신저/개인 드라이브)는 전부 금지로 이해하고 있습니다."', tags: '반출금지, USB금지, 외부유출방지, 접근통제, 컴플라이언스' },
  { div: '10. 어떤 사람이 맞나', core: '센스보다 기록/공유', easy: '센스 싸움이 아니라 기록과 공유가 기준이다', eg: '① "저희 팀은 센스보다 기록/공유/중간확인을 꾸준히 하는 사람이 잘 맞습니다." ② "아이디어보다 정리해서 남기는 습관이 있는 사람이 성과를 냅니다."', tags: '기록, 공유, 중간확인, 습관, 성과' },
  { div: '11. 다음 단계', core: '합격하면 2차, 수습 통과하면 3차', easy: '필요한 정보는 단계별로 준다', eg: '① "단계별로 필요한 정보가 열리는 구조라 2차에서 프로세스/템플릿, 이후에 더 상세 안내를 받는 흐름으로 이해했습니다." ② "합격 후에는 단계별로 안내를 받으면서 맞춰가면 되는 구조로 알고 있고, 저는 그 방식이 명확해서 좋습니다."', tags: '단계별안내, 프로세스, 템플릿, 온보딩, 유연함' },
];

const PHASE2_ROWS: PhaseRow[] = [
  { div: '1. 시작 세팅', core: '계정/폴더부터 맞춘다', easy: '회사 자료는 회사 폴더에만 둔다. 권한이 없으면 요청한다', eg: '① "폴더/권한 세팅부터 맞추겠습니다." ② "권한이 안 열려서 요청드립니다. 읽기/편집 중 어디까지 주시면 될까요?"', tags: '폴더세팅, 권한요청, 회사폴더, 접근관리, 초기정리' },
  { div: "2. 업무 받는 방식", core: "업무는 '말'이 아니라 '글'로 남긴다", easy: '구두 지시도 짧게 써서 남기고 시작한다', eg: '① "방금 지시 정리해서 남겼습니다: 목적/기한/산출물/기준 확인 부탁드립니다." ② "구두로 받은 내용도 한 줄로 기록하고 시작하겠습니다."', tags: '글로남기기, 지시정리, 확인요청, 기준합의, 기록습관' },
  { div: '3. 일을 바로 시작', core: '지시 받으면 바로 움직인다', easy: '오래 생각하지 말고 초안을 먼저 만든다', eg: '① "지금 바로 착수했고, 오늘 ○시까지 1차 초안 공유드리겠습니다." ② "먼저 거친 초안 만들고 방향 맞춘 뒤 디테일 보완하겠습니다."', tags: '즉시착수, 초안우선, 속도, 추진, 일정약속' },
  { div: '4. 질문하는 타이밍', core: '질문은 모아서 한 번에 한다', easy: '하면서 생긴 질문은 메모해뒀다가 한 번에 묻는다', eg: '① "진행하면서 생긴 질문을 3개로 묶어 한 번에 드리겠습니다." ② "질문은 A/B로 정리했습니다. 저는 A가 더 안전하다고 봅니다."', tags: '질문정리, 한번에질문, A/B, 효율, 판단제시' },
  { div: '5. 하루 루틴(아침)', core: '오늘 할 일을 한 줄로 쓴다', easy: '아침에 "오늘 뭐 할지" 한 줄로 남긴다', eg: '① "오늘 할 일 한 줄 남깁니다: ○○ 정리 / ○○ 업데이트 / 초안 1개." ② "오늘 목표는 3개입니다: 1)○○ 2)○○ 3)○○."', tags: '오늘할일, 아침로그, 우선순위, 목표3개, 계획' },
  { div: '6. 하루 루틴(퇴근 전)', core: '오늘 한 일+링크를 남긴다', easy: '퇴근 전에 결과물 링크를 붙이고 짧게 정리한다', eg: '① "오늘 결과 공유드립니다: 링크/완료/남은 것/내일." ② "퇴근 전 정리 올립니다. 변경사항 요약과 결과물 링크 첨부했습니다."', tags: '퇴근정리, 결과링크, 진행상태, 내일계획, 변경요약' },
  { div: '7. 막힘 처리', core: '막히면 바로 말한다', easy: '혼자 끌지 말고 30분 안에 공유한다', eg: '① "막혔습니다. 원인/시도/필요한 결정을 정리했습니다." ② "30분 안에 공유드립니다. 지금 필요한 건 A 승인입니다."', tags: '30분공유, 막힘보고, 원인정리, 도움요청, 의사결정' },
  { div: '8. 중간 확인', core: '완성 전에 한 번 보여준다', easy: '중간에 보여주면 나중에 갈아엎는 일이 줄어든다', eg: '① "완성 전 중간본 공유드립니다. 방향 OK/수정 부탁드립니다." ② "지금 단계에서 한 번만 맞추면, 뒤에 갈아엎는 리스크 줄일 수 있습니다."', tags: '중간본, 방향확인, 리스크감소, 피드백, 합의' },
  { div: '9. 제출 방식', core: '파일 붙이기보다 링크로 낸다', easy: '찾기 쉽게 링크/경로로 제출한다', eg: '① "파일 대신 링크로 제출드립니다." ② "찾기 쉬우시게 경로+링크 같이 남깁니다."', tags: '링크제출, 경로표기, 찾기쉽게, 공유, 버전관리' },
  { div: '10. 파일 이름', core: '파일명은 규칙대로 쓴다', easy: '날짜_업무_v1처럼 한 방식으로 통일한다', eg: '① "파일명 규칙대로 올렸습니다: 20260302_업무명_v1." ② "같은 규칙로 통일하겠습니다: 날짜_주제_v#."', tags: '파일명규칙, 통일, 날짜포맷, v표기, 검색성' },
  { div: '11. 버전 관리', core: "'최종' 금지, v1/v2로 간다", easy: '최종/최종2 같은 혼란을 막는다', eg: "① \"'최종' 표기 없이 v2로 올렸고, v1은 보관했습니다.\" ② \"수정 이력은 v3에서 반영했고, 변경점은 메모에 남겼습니다.\"", tags: '버전관리, 최종금지, v1v2, 변경이력, 혼선방지' },
  { div: '12. 엑셀 기본', core: '표준 템플릿을 쓴다', easy: '엑셀은 회사 방식대로(예: 셀 합치기 금지)', eg: '① "회사 템플릿 기준으로 정리하겠습니다(예: 셀 병합 금지)." ② "표는 필터/정렬 가능한 형태로 맞춰 올리겠습니다."', tags: '템플릿준수, 셀병합금지, 표준화, 필터가능, 엑셀정리' },
  { div: '13. PPT 기본', core: 'PPT는 설명용이다', easy: '예쁘게보다 결론 1줄 + 캡쳐가 우선', eg: '① "이 페이지 결론 1줄 먼저 말씀드리면 ○○입니다." ② "예쁘게보다 결론+근거 캡처 위주로 구성하겠습니다."', tags: '결론한줄, 근거캡처, 설명용, 메시지, 가독성' },
  { div: '14. 출력물 메모', core: '출력물엔 3가지를 적는다', easy: '날짜/버전/요청사항만 적어도 안 헷갈린다', eg: '① "출력물 상단에 날짜/버전/요청사항 적어두겠습니다." ② "라벨 이렇게 붙이겠습니다: 2026-03-02 / v1 / 수정포인트: ○○."', tags: '날짜표기, 버전표기, 요청사항, 라벨링, 혼선방지' },
  { div: '15. 보안 실수 방지', core: '개인 메일/폰/클라우드로 옮기지 않는다', easy: '회사 밖으로 자료가 나가면 바로 사고다', eg: '① "회사 자료는 개인 메일/개인 폰/개인 클라우드로 절대 이동하지 않겠습니다." ② "공유/저장은 회사 폴더·회사 채널에서만 진행하겠습니다."', tags: '보안, 개인채널금지, 회사폴더, 유출방지, 규정준수' },
  { div: '16. 외부 공유 필요 시', core: '승인 받고 한다', easy: '꼭 필요하면 먼저 승인을 받는다', eg: '① "외부 공유 필요합니다. 대상/자료/기간은 ○○이며 승인 요청드립니다." ② "승인 전까지는 외부 전송하지 않고, 대체 방식으로 진행하겠습니다."', tags: '승인요청, 외부공유, 대상명시, 기간명시, 리스크관리' },
  { div: '17. 삭제 규칙', core: '함부로 지우지 않는다', easy: '삭제는 금지. 필요하면 삭제폴더/기록으로 처리', eg: '① "삭제는 하지 않고 삭제폴더로 이동했습니다(기록 남김)." ② "정리 필요하면 보관/아카이브로 처리하겠습니다."', tags: '삭제금지, 아카이브, 이력보존, 이동처리, 실수방지' },
  { div: '18. 프린터/비품', core: '모르면 바로 물어본다', easy: '프린터 오류/비품은 담당자에게 바로 요청', eg: '① "프린터 오류입니다(사진 첨부). 담당자/요청 경로 알려주시면 바로 진행하겠습니다." ② "비품이 부족합니다. 어디에 요청하면 될까요?"', tags: '즉시요청, 사진첨부, 담당자확인, 비품, 30분룰' },
  { div: '19. 수습 체크', core: '주간으로 점검한다', easy: '매주 "잘한 것/막힌 것/다음주"를 짧게 정리', eg: '① "이번 주 점검 올립니다: 잘한 것 1 / 막힌 것 1 / 다음주 1." ② "수습 체크 공유드립니다. 다음 주는 ○○를 개선 포인트로 잡겠습니다."', tags: '주간점검, 회고, 개선포인트, 다음주계획, 피드백' },
];

const PHASE3_ROWS: PhaseRow[] = [
  { div: '1. 이제부터 역할', core: "'시키는 사람'이 아니라 '운영하는 사람'", easy: '업무를 받기만 하지 말고, 정리해서 굴리는 역할도 한다', eg: '① "이 업무는 제가 운영 흐름으로 정리해서 굴려보겠습니다." ② "받은 일을 처리만 하지 않고, 체크포인트/템플릿까지 만들어서 속도 올리겠습니다."', tags: '운영, 구조화, 프로세스, 템플릿, 개선' },
  { div: '2. 판단 범위', core: '내가 결정해도 되는 것 / 승인 받아야 하는 것', easy: '헷갈리면 바로 물어본다', eg: '① "이건 제가 결정해도 되는 범위일까요, 승인이 필요할까요?" ② "리스크가 있어 보여서 먼저 확인드립니다. 결정권자가 누구일까요?"', tags: '승인, 결정권, 리스크, 권한, 확인' },
  { div: '3. 우선순위 권한', core: "'지금 뭐부터'는 내가 정리해서 올린다", easy: '정식 멤버는 A/B/C를 먼저 잡아주는 사람이다', eg: '① "지금은 A가 최우선이라 A부터 처리하고, B는 내일로 미루겠습니다." ② "긴급/중요 기준으로 정리하면 1)A 2)B 3)C 순서가 맞습니다."', tags: '우선순위, A/B/C, 긴급도, 중요도, 정렬' },
  { div: '4. 결과 기준(KPI)', core: '잘한 기준은 5개로 본다', easy: '속도/정확/소통/납기/기록 이 5개가 기본 점수다', eg: '① "이번 주는 납기 준수/정확도/기록 3가지를 특히 맞췄습니다." ② "KPI 기준으로 보면 속도는 개선, 소통/기록은 유지했습니다."', tags: 'KPI, 납기, 정확도, 소통, 기록' },
  { div: '5. 늦어질 때 규칙', core: '늦어지면 먼저 말하는 사람이 이긴다', easy: '늦게 말하면 신뢰가 확 깎인다', eg: '① "지연 가능성 있어 선공유드립니다." ② "일정이 밀릴 수 있어 먼저 말씀드립니다. 대안은 A/B입니다."', tags: '선공유, 지연관리, 신뢰, 일정, 대안' },
  { div: '6. 반복 실수 처리', core: "실수는 '반성'이 아니라 '막기'", easy: '같은 실수 나오면 체크리스트/템플릿을 고쳐서 막는다', eg: '① "같은 실수 재발 방지로 체크리스트 1줄 추가하겠습니다." ② "원인을 시스템으로 막겠습니다. 템플릿에 검수 항목 넣겠습니다."', tags: '재발방지, 체크리스트, 템플릿수정, 시스템화, 검수' },
  { div: '7. 결정 기록', core: '말로 끝내지 말고 한 줄 남긴다', easy: '결정은 나중에 싸움 나기 쉬움', eg: '① "결정 남깁니다: ○○ / 담당 ○○ / 기한 ○○ / 근거 1줄." ② "이슈 재발 방지 위해 결정 로그로 남겨두겠습니다."', tags: '결정로그, 담당, 기한, 근거, 기록' },
  { div: '8. 회의 운영', core: '회의는 짧게, 끝나면 바로 정리', easy: '회의 길게 하면 아무도 안 읽는다', eg: '① "회의 끝나고 요약 5줄 + 액션아이템 정리해서 올리겠습니다." ② "회의는 20분 안에 끝내고, 결정/담당/기한만 남기겠습니다."', tags: '회의요약, 액션아이템, 타임박스, 결정정리, 공유' },
  { div: '9. 지식 저장소', core: '자료는 한 곳에 모은다', easy: '찾기 쉬워야 팀이 빨라진다', eg: '① "관련 자료는 한 폴더/한 링크로 모아두겠습니다." ② "개인 폴더에 두지 않고 공용 저장소로 이동하겠습니다."', tags: '지식저장소, 공용폴더, 링크정리, 접근성, 검색' },
  { div: '10. 템플릿 관리', core: "템플릿은 '회사 방식'이다", easy: '개인 스타일로 바꾸지 말고, 바꿀 땐 제안→합의→업데이트', eg: '① "템플릿 변경 제안드립니다. 효과/리스크 정리했고, 합의되면 업데이트하겠습니다." ② "개인 스타일로 바꾸지 않고, 제안→확인→반영 순서로 진행하겠습니다."', tags: '템플릿, 표준, 변경제안, 합의, 업데이트' },
  { div: '11. 후배/신입 케어', core: "신입은 '번역'이 필요하다", easy: '대표 말은 빠를 수 있다. 쉬운 말로 바꿔서 전달한다', eg: '① "대표님 말씀은 정리하면 이 3가지만 하면 됩니다." ② "지금은 여기까지가 범위예요."', tags: '번역, 온보딩, 범위정리, 단계화, 케어' },
  { div: '12. 대표 커뮤니케이션', core: '질문은 모아서, 피드백은 묶어서', easy: '자잘한 왕복을 줄이면 대표 만족도가 올라간다', eg: '① "질문 3개로 묶었습니다. 추천은 A이고, 이유는 1줄로 ○○입니다." ② "피드백 반영안 2안 준비했습니다. 선택만 부탁드립니다."', tags: '묶음질문, 선택지, 추천, 왕복감소, 효율' },
  { div: '13. 보안 등급', core: '자료는 밖으로 나가면 끝', easy: '정식 멤버는 보안을 관리하는 사람이다', eg: '① "이 자료는 외부 공유 불가로 처리하겠습니다." ② "보안 이슈라 회사 채널 밖 전송 금지로 진행하겠습니다."', tags: '외부공유금지, 보안등급, 승인필수, 유출방지, 규정' },
  { div: '14. 외부 공유 운영', core: "예외는 '기록하고 승인'", easy: '예외는 무조건 남겨야 나중에 안 터진다', eg: '① "외부 공유 예외 건 기록 남겼습니다: 대상/자료/기간/승인자." ② "공유 전 승인 받았고, 기록 링크도 함께 남깁니다."', tags: '예외관리, 승인기록, 대상, 기간, 추적' },
  { div: '15. 파일/버전(심화)', core: '버전은 한 줄로 정리해서 관리', easy: "'최종' 금지 유지. 바뀐 내용은 한 줄로 남긴다", eg: '① "v3 업데이트했습니다. 변경점 1줄: 표 2개 추가, 문구 3줄 수정." ② "버전은 v로만 관리하고, v2→v3 차이를 로그로 남깁니다."', tags: '버전로그, 변경점, v관리, 비교, 히스토리' },
  { div: '16. 문제 생겼을 때', core: '문제는 숨기지 말고 바로 꺼낸다', easy: '정식 멤버는 문제를 빨리 꺼내서 팀을 살린다', eg: '① "문제 공유드립니다: 이슈/원인/필요한 결정/지금 조치." ② "숨기지 않고 바로 올립니다."', tags: '30분룰, 이슈공유, 원인, 조치, 리스크' },
  { div: '17. 개선 제안 방식', core: '불평 말고 "대안"으로 말한다', easy: '"이거 별로" 말고 "이렇게 바꾸자"가 정답', eg: '① "현재 방식은 시간이 걸립니다. 이렇게 바꾸면 30분 줄어듭니다." ② "불평 대신 대안 드립니다. A안/B안 중 추천은 A입니다."', tags: '대안제시, 개선, 근거, 효과, A/B' },
  { div: '18. 성장 루틴', core: '30/60/90일 목표를 잡는다', easy: '정식 멤버는 성장도 스스로 챙긴다', eg: '① "30/60/90 목표 잡겠습니다. 30일은 ○○를 단독 완주가 목표입니다." ② "이번 달은 혼자 끝낸 결과물 1개 만드는 걸 KPI로 두겠습니다."', tags: '30-60-90, 성장목표, 단독완주, 역량강화, KPI' },
];

/* ══════════════════════════════════════════════════════════════
   공통 UI 빌딩 블록
   ══════════════════════════════════════════════════════════════ */

interface ChipBtnProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  shape?: 'round' | 'square';
}
function ChipBtn({ active, onClick, children, shape = 'square' }: ChipBtnProps) {
  const rounded = shape === 'round' ? 'rounded-full' : 'rounded-md';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${rounded} px-2 py-0.5 text-xs border transition-colors ${
        active
          ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold'
          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
      }`}
    >
      {children}
    </button>
  );
}

interface InlineRadioProps {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}
function InlineRadio({ value, options, onChange }: InlineRadioProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map(opt => (
        <ChipBtn key={opt} active={value === opt} onClick={() => onChange(value === opt ? '' : opt)}>
          {opt}
        </ChipBtn>
      ))}
    </div>
  );
}

interface InlineCheckProps {
  values: string[];
  options: string[];
  onChange: (v: string[]) => void;
}
function InlineCheck({ values, options, onChange }: InlineCheckProps) {
  const toggle = (opt: string) => {
    if (values.includes(opt)) onChange(values.filter(v => v !== opt));
    else onChange([...values, opt]);
  };
  return (
    <div className="flex flex-wrap gap-1">
      {options.map(opt => (
        <ChipBtn key={opt} active={values.includes(opt)} onClick={() => toggle(opt)} shape="round">
          {opt}
        </ChipBtn>
      ))}
    </div>
  );
}

const Field = ({
  label, required, children, span,
}: {
  label: string; required?: boolean; children: React.ReactNode; span?: number;
}) => (
  <div className={`flex flex-col gap-0.5 ${span === 2 ? 'col-span-2' : span === 3 ? 'col-span-3' : span === 4 ? 'col-span-4' : ''}`}>
    <label className="text-xs font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const input =
  'w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-white';

const Card: React.FC<{ title?: string; desc?: string; children: React.ReactNode }> = ({
  title, desc, children,
}) => (
  <div className="bg-white border border-slate-200 rounded-lg p-2 mb-2 shadow-sm">
    {title && <h3 className="text-sm font-semibold text-slate-800 mb-0.5">{title}</h3>}
    {desc && <p className="text-[11px] text-slate-500 mb-1.5">{desc}</p>}
    {children}
  </div>
);

/* ══════════════════════════════════════════════════════════════
   컴포넌트 본체
   ══════════════════════════════════════════════════════════════ */

export default function InterviewAlbaGuide() {
  const [phase, setPhase] = useState<Phase>('interview');
  const [activeStep, setActiveStep] = useState<StepKey>('guide');

  // 인적사항
  const [info, setInfo] = useState({
    name: '',
    interviewDate: new Date().toISOString().slice(0, 10),
    startDate: '',
    availableMonths: '',
    websiteViewed: '',
    applyField: '',
    commuteType: '',
    commuteTime: '',
    birthDate: '',
    age: '',
    experience: '',
    driving: '',
    carOwned: '',
    religion: '',
    pt: '',
    familyLiving: '',
    marriage: '',
    children: '',
    skills: [] as string[],
    english: '',
    mon: '', tue: '', wed: '', thu: '', fri: '',
  });

  // MBTI 답변 q1..q40 → 'a' or 'b'
  const [mbtiAns, setMbtiAns] = useState<Record<number, 'a'|'b'>>({});
  const [showResult, setShowResult] = useState(false);

  // 영상 요약
  const [videoForms, setVideoForms] = useState<{ summary: string; feedback: string }[]>(
    Array.from({ length: 3 }, () => ({ summary: '', feedback: '' }))
  );

  // 계약서
  const [contract, setContract] = useState({
    workerName: '',
    year: '2026', startMonth: '', startDay: '',
    endYear: '2026', endMonth: '', endDay: '',
    months: '',
    workTime1: '', workTime1End: '', workDay1: '',
    workTime2: '', workTime2End: '', workDay2: '',
    workSpecial: '',
    hourlyWage: '',
    resignMonths: '',
    dateYear: '2026', dateMonth: '', dateDay: '',
    address: '', phone: '', emergency: '', birth: '', name: '',
    agrees: ['', '', '', '', ''] as string[],
  });

  // 교육 피드백 (각 행)
  const [eduFbs, setEduFbs] = useState<string[]>(Array(EDU_ROWS.length).fill(''));
  const [eduNotes, setEduNotes] = useState<string[]>(Array(EDU_ROWS.length).fill(''));
  const [eduLarge, setEduLarge] = useState('');
  const [eduMid, setEduMid] = useState('');
  const [eduSmall, setEduSmall] = useState('');
  const [eduContent, setEduContent] = useState('');

  // 서류
  const [docResume, setDocResume] = useState<File[]>([]);
  const [docPort, setDocPort] = useState<File[]>([]);
  const [docEtc, setDocEtc] = useState<File[]>([]);

  // 메뉴얼 선택
  const [selectedTopics, setSelectedTopics] = useState<ManualTopic[]>([]);
  const [phase1Notes, setPhase1Notes] = useState<string[]>(Array(PHASE1_ROWS.length).fill(''));
  const [phase1Fbs, setPhase1Fbs] = useState<string[]>(Array(PHASE1_ROWS.length).fill(''));
  const [phase2Notes, setPhase2Notes] = useState<string[]>(Array(PHASE2_ROWS.length).fill(''));
  const [phase2Fbs, setPhase2Fbs] = useState<string[]>(Array(PHASE2_ROWS.length).fill(''));
  const [phase3Notes, setPhase3Notes] = useState<string[]>(Array(PHASE3_ROWS.length).fill(''));
  const [phase3Fbs, setPhase3Fbs] = useState<string[]>(Array(PHASE3_ROWS.length).fill(''));

  // MBTI 결과 계산
  const mbtiResult = useMemo(() => {
    const dims: Record<'EI'|'SN'|'TF'|'JP', [number, number]> = {
      EI: [0, 0], SN: [0, 0], TF: [0, 0], JP: [0, 0],
    };
    for (let i = 1; i <= 40; i++) {
      const ans = mbtiAns[i];
      if (!ans) continue;
      const dim: 'EI'|'SN'|'TF'|'JP' =
        i <= 10 ? 'EI' : i <= 20 ? 'SN' : i <= 30 ? 'TF' : 'JP';
      if (ans === 'a') dims[dim][0]++;
      else dims[dim][1]++;
    }
    const total = Object.values(dims).reduce((s, [a, b]) => s + a + b, 0);
    const type =
      (dims.EI[0] >= dims.EI[1] ? 'E' : 'I') +
      (dims.SN[0] >= dims.SN[1] ? 'S' : 'N') +
      (dims.TF[0] >= dims.TF[1] ? 'T' : 'F') +
      (dims.JP[0] >= dims.JP[1] ? 'J' : 'P');
    return { dims, total, type };
  }, [mbtiAns]);

  const currentStepList = STEPS.filter(s => s.phase === phase);
  const activeIdx = currentStepList.findIndex(s => s.key === activeStep);
  const progressPct = currentStepList.length
    ? Math.round(((activeIdx + 1) / currentStepList.length) * 100)
    : 0;

  const switchPhase = (p: Phase) => {
    setPhase(p);
    const first = STEPS.find(s => s.phase === p);
    if (first) setActiveStep(first.key);
  };

  const goNext = () => {
    if (activeIdx < currentStepList.length - 1) setActiveStep(currentStepList[activeIdx + 1].key);
    else if (phase === 'interview') switchPhase('work1');
  };
  const goPrev = () => {
    if (activeIdx > 0) setActiveStep(currentStepList[activeIdx - 1].key);
    else if (phase === 'work1') {
      setPhase('interview');
      setActiveStep('video');
    }
  };

  /* ─────────────── STEP 1: 면접 과정 안내 ─────────────── */
  const renderGuide = () => (
    <>
      <Card>
        <p className="text-xs text-slate-700 mb-1">안녕하세요, 면접에 참여해주셔서 감사드립니다.</p>
        <p className="text-xs text-slate-500">아래에 면접 순서와 각 단계별 구체적인 내용을 안내드립니다. 편안한 마음으로 진행해 주시기 바랍니다.</p>
      </Card>

      <Card title="📋 면접 순서">
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-1.5 text-xs text-slate-600">
          <li className="border border-slate-200 rounded px-2 py-1"><b className="text-slate-800">1단계</b> 서류 작성·성향검사 (20분) — 서류 2가지 모두 작성</li>
          <li className="border border-slate-200 rounded px-2 py-1"><b className="text-slate-800">2단계</b> 영상을 통한 회사소개 (10분) — 영상 3개 시청 후 포인트 요약</li>
          <li className="border border-slate-200 rounded px-2 py-1"><b className="text-slate-800">3단계</b> 개별 질문·답변 (10분) — 면접 후 업무를 간단히 진행</li>
        </ul>
        <div className="mt-1.5 px-2 py-1 bg-blue-50 border-l-2 border-blue-400 rounded text-xs text-slate-700">
          <b>업무 진행 시간</b>에 대해 시급 지급(원천징수)으로 지급됩니다.
        </div>
      </Card>

      <Card title="💡 면접 및 업무 스타일">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 text-[11px] text-slate-600">
          <p className="border border-slate-200 rounded px-2 py-1">면접자분이 업무를 하시면서 회사 스타일의 업무를 확인하시는 것에 포인트가 있으니 기분 상하지 말아 주세요.</p>
          <p className="border border-slate-200 rounded px-2 py-1">사람이 중요한 시대, 즐겁게 함께 일할 수 있는 스타일을 서로 확인. 담당자와 이야기해 주시면 됩니다.</p>
          <p className="border border-slate-200 rounded px-2 py-1">업무 스타일은 일하면서 중간중간 담당자들이 이야기해 드립니다. 궁금한 점은 마지막에 인사 담당이 답변.</p>
        </div>
      </Card>

      <Card title="📌 구체적인 업무 내용">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-xs">
          <li className="border border-slate-200 rounded px-2 py-1"><b>1. 잔무</b> 30분 — 자료조사·정리·기획. 질보다 양(30분 10~30개)</li>
          <li className="border border-slate-200 rounded px-2 py-1"><b>2. 기획서 작성/업무진행</b> 30분</li>
          <li className="border border-slate-200 rounded px-2 py-1"><b>3. 피드백 후 다시 진행</b> 30분</li>
          <li className="border border-slate-200 rounded px-2 py-1"><b>4. 제안/문서 작성</b> 30분</li>
        </ul>
        <div className="mt-1.5 px-2 py-1 bg-blue-50 border-l-2 border-blue-400 rounded text-[11px] text-slate-700">
          <b>중요:</b> 30분 단위 진행. 잘하는 것보다 <b>시간 관리</b>가 포인트, 결과물보다 <b>양·스타일</b>을 중요하게 봅니다.
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-1.5">
        <Card title="⚠️ 유의사항">
          <p className="text-[11px] text-slate-600">불편·어려움이 있으면 일단 30분 정도 진행해 보신 후 담당자에게 말씀해 주세요.</p>
        </Card>
        <Card title="📞 면접 후 안내">
          <p className="text-[11px] text-slate-600">면접 후 <b>출근 여부를 문자로 알려 주시면</b> 담당자가 연락드립니다. 추후 질문은 문자로 부탁드립니다.</p>
        </Card>
      </div>
    </>
  );

  /* ─────────────── STEP 2: 인적사항 ─────────────── */
  const renderInfo = () => (
    <>
      <Card title="기본 정보" desc="면접 및 근무 관련 기본 정보를 입력해 주세요.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-1.5">
          <Field label="이름" required>
            <input className={input} value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} placeholder="이름" />
          </Field>
          <Field label="면접 일시">
            <input type="date" className={input} value={info.interviewDate} onChange={e => setInfo({ ...info, interviewDate: e.target.value })} />
          </Field>
          <Field label="근무 시작 희망일">
            <input type="date" className={input} value={info.startDate} onChange={e => setInfo({ ...info, startDate: e.target.value })} />
          </Field>
          <Field label="근무 가능 기간">
            <input className={input} value={info.availableMonths} onChange={e => setInfo({ ...info, availableMonths: e.target.value })} placeholder="예: 6개월" />
          </Field>
          <Field label="홈페이지 확인 여부">
            <InlineRadio value={info.websiteViewed} options={['Y', 'N']} onChange={v => setInfo({ ...info, websiteViewed: v })} />
          </Field>
          <Field label="지원 분야">
            <InlineRadio value={info.applyField} options={['직원', '파트']} onChange={v => setInfo({ ...info, applyField: v })} />
          </Field>
          <Field label="통근 수단">
            <InlineRadio value={info.commuteType} options={['지하철', '버스', '도보', '자차']} onChange={v => setInfo({ ...info, commuteType: v })} />
          </Field>
          <Field label="통근 소요 시간">
            <input className={input} value={info.commuteTime} onChange={e => setInfo({ ...info, commuteTime: e.target.value })} placeholder="예: 40분" />
          </Field>
          <Field label="생년월일">
            <input type="date" className={input} value={info.birthDate} onChange={e => setInfo({ ...info, birthDate: e.target.value })} />
          </Field>
          <Field label="나이">
            <input type="number" className={input} value={info.age} onChange={e => setInfo({ ...info, age: e.target.value })} placeholder="만 나이" />
          </Field>
          <Field label="경력" span={2}>
            <input className={input} value={info.experience} onChange={e => setInfo({ ...info, experience: e.target.value })} placeholder="경력 사항" />
          </Field>
          <Field label="운전 가능">
            <InlineRadio value={info.driving} options={['Y', 'N']} onChange={v => setInfo({ ...info, driving: v })} />
          </Field>
          <Field label="차량 소유">
            <InlineRadio value={info.carOwned} options={['Y', 'N']} onChange={v => setInfo({ ...info, carOwned: v })} />
          </Field>
        </div>
      </Card>

      <Card title="기타 여부">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-2 gap-y-1.5">
          <Field label="종교">
            <InlineRadio value={info.religion} options={['기독교', '불교', '그외']} onChange={v => setInfo({ ...info, religion: v })} />
          </Field>
          <Field label="PT 가능">
            <InlineRadio value={info.pt} options={['Y', 'N']} onChange={v => setInfo({ ...info, pt: v })} />
          </Field>
          <Field label="가족 관계">
            <InlineRadio value={info.familyLiving} options={['동거', '비동거']} onChange={v => setInfo({ ...info, familyLiving: v })} />
          </Field>
          <Field label="결혼 여부">
            <InlineRadio value={info.marriage} options={['미혼', '기혼', '계획 중']} onChange={v => setInfo({ ...info, marriage: v })} />
          </Field>
          <Field label="자녀 수 및 나이">
            <input className={input} value={info.children} onChange={e => setInfo({ ...info, children: e.target.value })} placeholder="예: 1명, 5세" />
          </Field>
        </div>
      </Card>

      <Card title="업무 능력 및 가능 시간" desc="컴퓨터·영어 능력과 요일별 업무 가능 시간을 입력해 주세요.">
        <div className="mb-1.5">
          <label className="text-xs font-medium text-slate-700 block mb-0.5">컴퓨터 능력</label>
          <InlineCheck
            values={info.skills}
            options={['엑셀', '파워포인트', '워드', '포토샵', '일러스트', '동영상 편집', '블로그', '프리미어']}
            onChange={v => setInfo({ ...info, skills: v })}
          />
        </div>
        <div className="mb-1.5">
          <label className="text-xs font-medium text-slate-700 block mb-0.5">영어 능력</label>
          <InlineRadio value={info.english} options={['상', '중', '하']} onChange={v => setInfo({ ...info, english: v })} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-700 block mb-0.5">업무 가능 시간 (요일별)</label>
          <div className="grid grid-cols-5 gap-1">
            {(['mon','tue','wed','thu','fri'] as const).map((d, i) => (
              <input
                key={d}
                className={input}
                value={info[d]}
                onChange={e => setInfo({ ...info, [d]: e.target.value })}
                placeholder={['월','화','수','목','금'][i]}
              />
            ))}
          </div>
        </div>
      </Card>
    </>
  );

  /* ─────────────── STEP 3: MBTI 성격 검사 (4단) ─────────────── */
  const renderMbti = () => (
    <>
      <div className="bg-slate-50 border border-slate-200 rounded px-2 py-1 mb-2 text-[11px] text-slate-600">
        아래 40개 문항에서 a와 b 중 자신에 가까운 것을 선택해 주세요.
      </div>

      {/* 4단 그리드: E/I, S/N, T/F, J/P */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5 mb-2">
        {MBTI_DIMS.map((dim, blockIdx) => {
          const qs = MBTI_QS[dim.key];
          const startQ = blockIdx * 10 + 1;
          return (
            <div key={dim.key} className="bg-white border border-slate-200 rounded-lg p-1.5">
              <h3 className="text-xs font-bold text-blue-600 text-center border-b border-slate-200 pb-1 mb-1">
                {dim.a} / {dim.b}
              </h3>
              <div className="space-y-1">
                {qs.map((q, i) => {
                  const qNum = startQ + i;
                  const selected = mbtiAns[qNum];
                  return (
                    <div key={qNum} className="border border-transparent hover:border-blue-200 rounded px-1 py-0.5">
                      <div className="text-[10px] text-blue-600 font-bold leading-tight">Q{i + 1}</div>
                      <div className="text-[11px] text-slate-700 leading-snug mb-0.5">
                        <span className={selected === 'a' ? 'font-semibold text-blue-700' : ''}>{q.a}</span>
                        <span className="text-slate-400"> / </span>
                        <span className={selected === 'b' ? 'font-semibold text-blue-700' : ''}>{q.b}</span>
                      </div>
                      <div className="flex gap-1">
                        {(['a', 'b'] as const).map(opt => (
                          <ChipBtn
                            key={opt}
                            active={selected === opt}
                            onClick={() => setMbtiAns({ ...mbtiAns, [qNum]: opt })}
                          >
                            {opt}
                          </ChipBtn>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mb-2">
        <div className="text-[11px] text-slate-500 mb-1">
          응답 {mbtiResult.total} / 40
        </div>
        <button
          type="button"
          onClick={() => {
            if (mbtiResult.total < 40) {
              alert('모든 문항(40개)에 답해 주세요.');
              return;
            }
            setShowResult(true);
          }}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded"
        >
          <CheckCircle2 size={12} className="inline mr-1" />
          테스트 완료
        </button>
      </div>

      {showResult && (
        <Card title="성격 유형 결과">
          <div className="text-2xl font-bold text-blue-600 tracking-widest text-center mb-1.5">
            {mbtiResult.type}
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-1.5">
            {MBTI_DIMS.map(dim => {
              const [av, bv] = mbtiResult.dims[dim.key];
              const pct = av + bv ? (av / (av + bv)) * 100 : 50;
              return (
                <div key={dim.key} className="border border-slate-200 rounded px-2 py-1">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                    <span>{dim.aLabel} {av}</span>
                    <span>{bv} {dim.bLabel}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded overflow-hidden">
                    <div className="h-full bg-blue-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 text-center">각 유형의 합은 10, 총합은 40.</p>
        </Card>
      )}
    </>
  );

  /* ─────────────── STEP 4: 영상 시청·요약 ─────────────── */
  const videoUrl = 'https://www.youtube.com/watch?v=9q0kAZJLO_4';
  const videoThumb = 'https://img.youtube.com/vi/9q0kAZJLO_4/hqdefault.jpg';
  const renderVideo = () => (
    <>
      <div className="bg-slate-50 border border-slate-200 rounded px-2 py-1 mb-2 text-[11px] text-slate-600">
        아래 영상 3개를 시청하신 후, 각 영상에 대한 주요 포인트를 요약하여 작성해 주세요.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-1.5">
            <h3 className="text-xs font-semibold mb-1">영상 {i + 1}</h3>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-black rounded overflow-hidden mb-1">
              <img src={videoThumb} alt={`영상 ${i + 1}`} className="w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-8 h-6 bg-red-600/90 rounded flex items-center justify-center">
                  <span className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white ml-0.5" />
                </span>
              </span>
            </a>
            <Field label="주요 포인트 요약">
              <textarea
                className={`${input} min-h-[60px]`}
                value={videoForms[i].summary}
                onChange={e => {
                  const next = [...videoForms];
                  next[i] = { ...next[i], summary: e.target.value };
                  setVideoForms(next);
                }}
                placeholder="주요 내용 요약"
              />
            </Field>
            <div className="mt-1">
              <Field label="피드백">
                <textarea
                  className={`${input} min-h-[40px]`}
                  value={videoForms[i].feedback}
                  onChange={e => {
                    const next = [...videoForms];
                    next[i] = { ...next[i], feedback: e.target.value };
                    setVideoForms(next);
                  }}
                  placeholder="피드백"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  /* ─────────────── STEP 5: 근로계약서 ─────────────── */
  const cinput = 'inline-block min-w-[60px] px-1 border-b border-slate-300 bg-transparent text-xs focus:outline-none focus:border-blue-400';
  const tinput = 'inline-block w-10 px-1 text-center border-b border-slate-300 bg-transparent text-xs focus:outline-none focus:border-blue-400';
  const renderContract = () => (
    <Card>
      <div className="text-sm font-bold text-center mb-2">파트타임 근로계약서</div>
      <p className="text-[11px] text-slate-700 leading-relaxed mb-2">
        ㈜휴텍씨 대표이사 박미진(이하 "사업주"라 함)과{' '}
        <input className={cinput} value={contract.workerName} onChange={e => setContract({ ...contract, workerName: e.target.value })} placeholder="근로자 성명" />
        {' '}(이하 "근로자"라 함)은 사업주가 부여하는 업무에 대하여 성실히 수행할 것에 합의하고 다음과 같이 근로계약을 체결한다.
      </p>

      <div className="mb-2">
        <h4 className="text-xs font-semibold mb-1">제1조【근로계약기간】</h4>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          ① 계약기간은 <input className={tinput} value={contract.year} onChange={e => setContract({ ...contract, year: e.target.value })} /> 년{' '}
          <input className={tinput} value={contract.startMonth} onChange={e => setContract({ ...contract, startMonth: e.target.value })} /> 월{' '}
          <input className={tinput} value={contract.startDay} onChange={e => setContract({ ...contract, startDay: e.target.value })} /> 일부터{' '}
          <input className={tinput} value={contract.endYear} onChange={e => setContract({ ...contract, endYear: e.target.value })} /> 년{' '}
          <input className={tinput} value={contract.endMonth} onChange={e => setContract({ ...contract, endMonth: e.target.value })} /> 월{' '}
          <input className={tinput} value={contract.endDay} onChange={e => setContract({ ...contract, endDay: e.target.value })} /> 일까지(
          <input className={tinput} value={contract.months} onChange={e => setContract({ ...contract, months: e.target.value })} /> 개월)로 한다.
        </p>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          단, 회사는 업무형편상 계약기간 중 계약기간 및 계약내용을 조정하는 것에 동의한다. 동의자 :{' '}
          <input className={cinput} value={contract.agrees[0]} onChange={e => {
            const next = [...contract.agrees]; next[0] = e.target.value; setContract({ ...contract, agrees: next });
          }} placeholder="(인)" /> (인)
        </p>
        <p className="text-[11px] text-slate-600">② ①항의 계약기간이 만료됨에 따라 자동적으로 본 근로계약은 종료된다.</p>
        <p className="text-[11px] text-slate-600">③ 업무수행 능력적부 판정을 위해 계약체결일로부터 1개월까지를 수습기간으로 한다.</p>
      </div>

      <div className="mb-2">
        <h4 className="text-xs font-semibold mb-1">제2조【근무장소 및 업무내용】</h4>
        <p className="text-[11px] text-slate-600">① 근무장소 : ㈜휴텍씨 강남 사무실</p>
        <p className="text-[11px] text-slate-600">② 업무내용 : 사무 보조 업무 및 프로그램 기획</p>
      </div>

      <div className="mb-2">
        <h4 className="text-xs font-semibold mb-1">제3조【근로일·근로시간·휴게시간】</h4>
        <div className="grid grid-cols-2 gap-1 text-[11px]">
          <p>
            ① 근무 시간 : <input className={cinput} value={contract.workTime1} onChange={e => setContract({ ...contract, workTime1: e.target.value })} placeholder="09:00-18:00" />{' '}
            요일 : <input className={cinput} value={contract.workDay1} onChange={e => setContract({ ...contract, workDay1: e.target.value })} placeholder="월~금" />
          </p>
          <p>
            ② 근무 시간 : <input className={cinput} value={contract.workTime2} onChange={e => setContract({ ...contract, workTime2: e.target.value })} />{' '}
            요일 : <input className={cinput} value={contract.workDay2} onChange={e => setContract({ ...contract, workDay2: e.target.value })} />
          </p>
        </div>
        <p className="text-[11px] text-slate-600 mt-1">
          특이사항 : <input className={`${cinput} min-w-[200px]`} value={contract.workSpecial} onChange={e => setContract({ ...contract, workSpecial: e.target.value })} />
        </p>
        <p className="text-[11px] text-slate-600 leading-relaxed">② 근로시간에는 근로기준법 제54조에 의거 휴게시간이 포함되어 있다. 동의자 :{' '}
          <input className={cinput} value={contract.agrees[1]} onChange={e => {
            const next = [...contract.agrees]; next[1] = e.target.value; setContract({ ...contract, agrees: next });
          }} placeholder="(인)" /> (인)
        </p>
        <p className="text-[11px] text-slate-600 leading-relaxed">④ 근로자는 1주간 12시간 한도로 연장 근로에 합의한다. 동의자 :{' '}
          <input className={cinput} value={contract.agrees[2]} onChange={e => {
            const next = [...contract.agrees]; next[2] = e.target.value; setContract({ ...contract, agrees: next });
          }} placeholder="(인)" /> (인)
        </p>
      </div>

      <div className="mb-2">
        <h4 className="text-xs font-semibold mb-1">제4조【급여】</h4>
        <p className="text-[11px] text-slate-600">① 시간당 급여는 <input className={cinput} value={contract.hourlyWage} onChange={e => setContract({ ...contract, hourlyWage: e.target.value })} placeholder="원" /> 원(주휴수당 포함)으로 한다.</p>
        <p className="text-[11px] text-slate-600">② 월 급여 계산기간은 매월 1일부터 말일까지로 하여 익월 15일에 근로자 계좌로 입금한다.</p>
        <p className="text-[11px] text-slate-600 leading-relaxed">⑤ 입사 후 <input className={tinput} value={contract.resignMonths} onChange={e => setContract({ ...contract, resignMonths: e.target.value })} /> 개월 안에 인수인계 없이 퇴사 시 최저시급으로 지급한다. 동의자 :{' '}
          <input className={cinput} value={contract.agrees[3]} onChange={e => {
            const next = [...contract.agrees]; next[3] = e.target.value; setContract({ ...contract, agrees: next });
          }} placeholder="(인)" /> (인)
        </p>
      </div>

      <div className="mb-2">
        <h4 className="text-xs font-semibold mb-1">제5조【시간외근무·근태관리】</h4>
        <p className="text-[11px] text-slate-600">① 시간외근무는 팀장의 승인 사인이 있을 경우에 한하여 인정한다.</p>
        <p className="text-[11px] text-slate-600">② 자발적으로 실시한 시간외근로는 인정하지 않는다.</p>
      </div>

      <div className="mb-2">
        <h4 className="text-xs font-semibold mb-1">제6조【손해배상】</h4>
        <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-0.5">
          <li>퇴사통보 30일 이전, 인수인계가 원활하지 않은 경우</li>
          <li>무단 퇴사하는 경우</li>
          <li>인수인계서 작성 거부·미완료</li>
          <li>본인 업무 인수인계 불이행</li>
          <li>회사 자산의 사적 용도 배포·유출</li>
          <li>회사에 막대한 금전적 손실·이미지 손상</li>
        </ol>
      </div>

      <div className="mb-2">
        <h4 className="text-xs font-semibold mb-1">제7조【비밀유지 준수사항】</h4>
        <p className="text-[11px] text-slate-600 leading-relaxed">본 계약내용 및 금액을 타인에게 누설하지 않는다. 동의자 :{' '}
          <input className={cinput} value={contract.agrees[4]} onChange={e => {
            const next = [...contract.agrees]; next[4] = e.target.value; setContract({ ...contract, agrees: next });
          }} placeholder="(인)" /> (인)
        </p>
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed mb-2">본 계약내용에 대해 이의가 없음을 확인하며 서명날인 후 본 계약서를 각 1부씩 교부하여 보관키로 한다.</p>

      <p className="text-[11px] text-slate-600 mb-2">
        <input className={tinput} value={contract.dateYear} onChange={e => setContract({ ...contract, dateYear: e.target.value })} /> 년{' '}
        <input className={tinput} value={contract.dateMonth} onChange={e => setContract({ ...contract, dateMonth: e.target.value })} /> 월{' '}
        <input className={tinput} value={contract.dateDay} onChange={e => setContract({ ...contract, dateDay: e.target.value })} /> 일
      </p>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 border border-slate-200 rounded p-1.5 text-[11px] text-slate-700 leading-relaxed">
          <b>(사업주)</b> 사업체명 : 주식회사 휴텍씨<br />
          주 소 : 서울특별시 서초구 양재천로19길 26, 6층<br />
          대표 이사 : 박 미 진 (서명 날인)
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded p-1.5 text-[11px] text-slate-700 leading-relaxed">
          <b>(근로자)</b> 주 소 : <input className={cinput} value={contract.address} onChange={e => setContract({ ...contract, address: e.target.value })} /><br />
          연락처 : <input className={cinput} value={contract.phone} onChange={e => setContract({ ...contract, phone: e.target.value })} />{' '}
          비상 : <input className={cinput} value={contract.emergency} onChange={e => setContract({ ...contract, emergency: e.target.value })} /><br />
          생년월일 : <input className={cinput} value={contract.birth} onChange={e => setContract({ ...contract, birth: e.target.value })} /><br />
          성 명 : <input className={cinput} value={contract.name} onChange={e => setContract({ ...contract, name: e.target.value })} /> (서명·날인)
        </div>
      </div>
    </Card>
  );

  /* ─────────────── STEP 6: 출근 후 교육 ─────────────── */
  const LARGE_CATS = ['소개·환경','출퇴근·업무관리','업무처리','보고·소통','시스템·도구','인사·급여','보안·기타'];
  const MID_CATS = ['소개','출퇴근','업무일지','업무 프로세싱','업무','업무 인지','정리정돈','보고법','업무 체크리스트','이메일','AI 활용','급여','로그인 정보','엑셀','PPT','피드백·아이디어','비품/프린터','보안규정','기타'];
  const SMALL_CATS = ['내용 이해도','교육 시간','자료 적절성','추가 필요 사항','개선 제안','기타'];

  const renderEdu = () => (
    <Card>
      <p className="text-[11px] text-slate-500 mb-1.5">출근 후 필요한 교육 내용과 회사 생활 안내입니다.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="text-left px-1.5 py-1 font-semibold w-28">제목</th>
              <th className="text-left px-1.5 py-1 font-semibold">내용</th>
              <th className="text-left px-1.5 py-1 font-semibold w-32">피드백</th>
              <th className="text-left px-1.5 py-1 font-semibold w-28">비고</th>
            </tr>
          </thead>
          <tbody>
            {EDU_ROWS.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-blue-50/30">
                <td className="px-1.5 py-1 font-medium text-slate-700 align-top">{row.title}</td>
                <td className="px-1.5 py-1 text-slate-600 align-top leading-snug">{row.body}</td>
                <td className="px-1.5 py-1 align-top">
                  <input
                    className={input}
                    value={eduFbs[i]}
                    onChange={e => {
                      const next = [...eduFbs]; next[i] = e.target.value; setEduFbs(next);
                    }}
                    placeholder="피드백"
                  />
                </td>
                <td className="px-1.5 py-1 align-top">
                  <input
                    className={input}
                    value={eduNotes[i] || row.note}
                    onChange={e => {
                      const next = [...eduNotes]; next[i] = e.target.value; setEduNotes(next);
                    }}
                    placeholder="비고"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 p-1.5 bg-slate-50 border border-slate-200 rounded">
        <h3 className="text-xs font-semibold mb-1">교육 피드백 작성</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 mb-1.5">
          <Field label="대분류">
            <InlineRadio value={eduLarge} options={LARGE_CATS} onChange={setEduLarge} />
          </Field>
          <Field label="중분류">
            <InlineRadio value={eduMid} options={MID_CATS} onChange={setEduMid} />
          </Field>
          <Field label="소분류">
            <InlineRadio value={eduSmall} options={SMALL_CATS} onChange={setEduSmall} />
          </Field>
        </div>
        <textarea
          className={`${input} min-h-[60px]`}
          value={eduContent}
          onChange={e => setEduContent(e.target.value)}
          placeholder="피드백을 입력해 주세요."
        />
      </div>
    </Card>
  );

  /* ─────────────── STEP 7: 서류첨부 ─────────────── */
  const FileField = ({
    label, files, onChange, accept,
  }: {
    label: string; files: File[]; onChange: (f: File[]) => void; accept: string;
  }) => (
    <div className="bg-white border border-slate-200 rounded p-1.5">
      <label className="text-xs font-medium text-slate-700 block mb-1">{label}</label>
      <input
        type="file"
        multiple
        accept={accept}
        onChange={e => onChange(e.target.files ? Array.from(e.target.files) : [])}
        className="text-[11px] w-full"
      />
      {files.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {files.map((f, i) => (
            <span key={i} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5">
              {f.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const renderDocs = () => (
    <Card>
      <p className="text-[11px] text-slate-500 mb-1.5">필요한 서류를 첨부해 주세요. (PDF, 이미지, 한글/엑셀 등)</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <FileField label="이력서" files={docResume} onChange={setDocResume} accept=".pdf,.hwp,.doc,.docx,.jpg,.jpeg,.png" />
        <FileField label="포트폴리오 / 자격증" files={docPort} onChange={setDocPort} accept=".pdf,.hwp,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
        <FileField label="기타 서류" files={docEtc} onChange={setDocEtc} accept=".pdf,.hwp,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
      </div>
    </Card>
  );

  /* ─────────────── STEP 8: 메뉴얼 ─────────────── */
  const toggleTopic = (t: ManualTopic) => {
    if (selectedTopics.includes(t)) setSelectedTopics(selectedTopics.filter(x => x !== t));
    else setSelectedTopics([...selectedTopics, t]);
  };

  const renderManual = () => (
    <>
      <Card title="체크한 항목 확인" desc="아래 버튼에서 항목을 선택하면 해당 상세 내용이 아래에 펼쳐집니다.">
        <InlineCheck
          values={selectedTopics as string[]}
          options={MANUAL_TOPICS as string[]}
          onChange={v => setSelectedTopics(v as ManualTopic[])}
        />
        {selectedTopics.length > 0 && (
          <div className="mt-1.5 text-[11px] text-slate-600">
            선택: {selectedTopics.join(' · ')}
          </div>
        )}
      </Card>

      {selectedTopics.includes('회사배경') && (
        <Card title="🏢 회사 배경" desc="면접 전에 회사와 대표님 스타일을 간단히 알아두시면 도움이 됩니다.">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="text-left px-1.5 py-1 font-semibold w-28">항목</th>
                  <th className="text-left px-1.5 py-1 font-semibold">내용 (쉬운 말)</th>
                  <th className="text-left px-1.5 py-1 font-semibold">신입이 알아두면 좋은 포인트</th>
                </tr>
              </thead>
              <tbody>
                {BG_ROWS.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-1.5 py-1 font-medium align-top">{r[0]}</td>
                    <td className="px-1.5 py-1 text-slate-600 align-top leading-snug">{r[1]}</td>
                    <td className="px-1.5 py-1 text-slate-600 align-top leading-snug">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {selectedTopics.includes('업무방식') && (
        <Card title="📐 업무 방식 (대표님 스타일)" desc="일할 때 이렇게 맞추면 소통이 수월합니다.">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="text-left px-1.5 py-1 font-semibold w-24">구분</th>
                  <th className="text-left px-1.5 py-1 font-semibold">대표님은 이런 사람</th>
                  <th className="text-left px-1.5 py-1 font-semibold">일할 때 보이는 모습</th>
                  <th className="text-left px-1.5 py-1 font-semibold">강점</th>
                  <th className="text-left px-1.5 py-1 font-semibold">약점/리스크</th>
                  <th className="text-left px-1.5 py-1 font-semibold">신입 지침</th>
                </tr>
              </thead>
              <tbody>
                {STYLE_ROWS.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {r.map((c, j) => (
                      <td key={j} className={`px-1.5 py-1 align-top leading-snug ${j === 0 ? 'font-medium' : 'text-slate-600'}`}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {(['1차(면접 시)','2차(수습)','3차(수습통과)'] as ManualTopic[]).map(topic => {
        if (!selectedTopics.includes(topic)) return null;
        const rows = topic === '1차(면접 시)' ? PHASE1_ROWS : topic === '2차(수습)' ? PHASE2_ROWS : PHASE3_ROWS;
        const notes = topic === '1차(면접 시)' ? phase1Notes : topic === '2차(수습)' ? phase2Notes : phase3Notes;
        const setNotes = topic === '1차(면접 시)' ? setPhase1Notes : topic === '2차(수습)' ? setPhase2Notes : setPhase3Notes;
        const fbs = topic === '1차(면접 시)' ? phase1Fbs : topic === '2차(수습)' ? phase2Fbs : phase3Fbs;
        const setFbs = topic === '1차(면접 시)' ? setPhase1Fbs : topic === '2차(수습)' ? setPhase2Fbs : setPhase3Fbs;
        const title =
          topic === '1차(면접 시)' ? '📌 1차(면접 시) 핵심' :
          topic === '2차(수습)' ? '📌 2차(수습) 핵심' :
          '📌 3차(수습통과) 핵심';
        return (
          <Card key={topic} title={title}>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="text-left px-1.5 py-1 font-semibold w-32">구분</th>
                    <th className="text-left px-1.5 py-1 font-semibold">핵심(한 줄)</th>
                    <th className="text-left px-1.5 py-1 font-semibold">쉽게 풀어서</th>
                    <th className="text-left px-1.5 py-1 font-semibold">예시 문장</th>
                    <th className="text-left px-1.5 py-1 font-semibold w-32">태그</th>
                    <th className="text-left px-1.5 py-1 font-semibold w-28">피드백</th>
                    <th className="text-left px-1.5 py-1 font-semibold w-28">비고</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-1.5 py-1 font-medium align-top leading-snug">{r.div}</td>
                      <td className="px-1.5 py-1 text-slate-600 align-top leading-snug">{r.core}</td>
                      <td className="px-1.5 py-1 text-slate-600 align-top leading-snug">{r.easy}</td>
                      <td className="px-1.5 py-1 text-slate-600 align-top leading-snug">{r.eg}</td>
                      <td className="px-1.5 py-1 text-[10px] text-slate-500 align-top leading-snug">{r.tags}</td>
                      <td className="px-1.5 py-1 align-top">
                        <input
                          className={input}
                          value={fbs[i]}
                          onChange={e => {
                            const next = [...fbs]; next[i] = e.target.value; setFbs(next);
                          }}
                          placeholder="피드백"
                        />
                      </td>
                      <td className="px-1.5 py-1 align-top">
                        <input
                          className={input}
                          value={notes[i]}
                          onChange={e => {
                            const next = [...notes]; next[i] = e.target.value; setNotes(next);
                          }}
                          placeholder="비고"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </>
  );

  /* ─────────────── 메인 렌더 ─────────────── */
  const renderStepContent = () => {
    switch (activeStep) {
      case 'guide':    return renderGuide();
      case 'info':     return renderInfo();
      case 'mbti':     return renderMbti();
      case 'video':    return renderVideo();
      case 'contract': return renderContract();
      case 'edu':      return renderEdu();
      case 'docs':     return renderDocs();
      case 'manual':   return renderManual();
    }
  };

  const handleSubmit = () => {
    console.log('submit', { info, mbtiAns, mbtiResult, videoForms, contract, eduFbs, eduNotes, eduLarge, eduMid, eduSmall, eduContent, selectedTopics });
    alert('제출되었습니다.');
  };

  return (
    <div className="p-2">
      {/* 상단 헤더 — Phase + 진행바 */}
      <div className="bg-white border border-slate-200 rounded-lg p-2 mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-800">알바 면접 안내</h2>
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">알바</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">5단계 프로세스 · 면접 → 업무1차</p>
          </div>
          <div className="flex gap-1">
            {(['interview', 'work1'] as Phase[]).map(p => (
              <ChipBtn key={p} active={phase === p} onClick={() => switchPhase(p)}>
                {p === 'interview' ? '면접' : '업무1차'}
              </ChipBtn>
            ))}
            <button type="button" disabled className="rounded-md px-2 py-0.5 text-xs border bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed">업무2차</button>
            <button type="button" disabled className="rounded-md px-2 py-0.5 text-xs border bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed">업무3차</button>
          </div>
        </div>

        {/* 스텝 네비 */}
        <div className="flex flex-wrap gap-1 mb-1.5">
          {currentStepList.map((s, idx) => {
            const Icon = s.icon;
            const isActive = s.key === activeStep;
            const isDone = idx < activeIdx;
            return (
              <button
                key={s.key}
                onClick={() => setActiveStep(s.key)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
                  isActive
                    ? 'bg-blue-500 text-white border-blue-500'
                    : isDone
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  isActive ? 'bg-white text-blue-500' : isDone ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {s.num}
                </span>
                <Icon size={11} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* 진행바 */}
        <div className="h-1 bg-slate-100 rounded overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* 콘텐츠 */}
      <div>{renderStepContent()}</div>

      {/* 하단 네비 */}
      <div className="flex justify-between items-center gap-1.5 mt-2 pt-2 border-t border-slate-200">
        <button
          onClick={goPrev}
          disabled={phase === 'interview' && activeIdx === 0}
          className="px-3 py-1 text-xs border border-slate-300 bg-white hover:bg-slate-50 rounded disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← 이전
        </button>
        <div className="text-[11px] text-slate-500">
          {phase === 'interview' ? '면접' : '업무1차'} {activeIdx + 1} / {currentStepList.length}
        </div>
        <div className="flex gap-1">
          {activeIdx < currentStepList.length - 1 || phase === 'interview' ? (
            <button onClick={goNext} className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded font-semibold">
              다음 →
            </button>
          ) : (
            <button onClick={handleSubmit} className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded font-semibold">
              제출
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
