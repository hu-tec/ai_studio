import type { CoursePlan, ComparisonRow, AxisChip } from './types';

export const COMMON_AXES: AxisChip[] = [
  { group: '기능 (5대)', items: ['텍스트 T-T', '이미지 T-T', '음성 TTS', '영상 S-T', '동시통역 S-S'] },
  { group: '도구 (5대)', items: ['GPT', '제미나이', '구글', 'MS', '나노바나나'] },
  { group: '비기능', items: ['프롬프트', '윤리', '검증', '저작권'] },
  { group: '포맷', items: ['실습 70%', '강의 30%', '미니 프로젝트', '발표회'] },
];

export const PLAN_A: CoursePlan = {
  id: 'A',
  name: '기능별 순차',
  axis: 'Linear · 입문 표준',
  audience: ['AI 입문자', '비전공자·일반 직장인', '강의처 무관 공용 베이스'],
  concept: '5대 기능을 하나씩 누적식으로 마스터. 텍스트 → 이미지 → 음성 → 영상 → 통역 → 통합',
  strengths: ['가장 안전한 진도', '입문 표준 커리큘럼', '진도 추적 명확'],
  modules40h: [
    { num: 1, title: 'OT + AI 기능 지형도', subtitle: '5대 기능·5대 도구 한눈에' },
    { num: 2, title: '텍스트 T-T 기초', subtitle: '프롬프트 5원칙 + 업무 문서화' },
    { num: 3, title: '텍스트 T-T 응용', subtitle: '자동화·요약·번역 워크플로우' },
    { num: 4, title: '이미지 T-T', subtitle: '생성·편집·합성·누끼' },
    { num: 5, title: '음성 TTS', subtitle: '더빙·내레이션·다국어 음성' },
    { num: 6, title: '영상 S-T', subtitle: '자막·요약·편집 보조' },
    { num: 7, title: '동시통역 S-S', subtitle: '다국어 미팅·라이브' },
    { num: 8, title: '멀티모달 통합', subtitle: '5 기능 한 흐름으로 1편 제작' },
    { num: 9, title: '윤리·검증·저작권', subtitle: '할루시·민감정보·라이선스' },
    { num: 10, title: '발표회', subtitle: '본인 업무 적용 결과 공유' },
  ],
  modules10h: [
    { num: 1, title: 'AI 지형도 + 프롬프트 기초', subtitle: '도구 비교 + 5원칙' },
    { num: 2, title: '텍스트·이미지 통합', subtitle: '문서 + 시각 자료' },
    { num: 3, title: '음성·영상 자동화', subtitle: 'TTS + 자막 + 편집' },
    { num: 4, title: '동시통역·멀티모달', subtitle: '다국어 + 통합 1편' },
    { num: 5, title: '윤리 + 미니 프로젝트', subtitle: '검증 + 본인 업무 적용' },
  ],
};

export const PLAN_B: CoursePlan = {
  id: 'B',
  name: '도구별 마스터',
  axis: 'Matrix · 중급·비교 학습',
  audience: ['중급 사용자', '도구 선택 결정자·기획자', '여러 도구 비교 필요한 팀 리더'],
  concept: '도구 하나씩 안에서 5 기능 모두 마스터. 도구 간 우위 매트릭스 체득',
  strengths: ['도구 선택 안목', '"어느 도구가 어느 기능에 강한가" 직관', '구독·계정 의사결정 근거'],
  modules40h: [
    { num: 1, title: 'OT + 도구 지형도', subtitle: '5 도구 강점·요금·계정 한눈에' },
    { num: 2, title: 'GPT 마스터', subtitle: '5 기능 전부 + GPTs·코드 인터프리터' },
    { num: 3, title: '제미나이 마스터', subtitle: '5 기능 + 구글 생태계 통합' },
    { num: 4, title: '구글 (Workspace + Notebook LM)', subtitle: '문서·이메일·시트·노트북' },
    { num: 5, title: 'MS Copilot', subtitle: 'Word·Excel·Teams·Outlook 통합' },
    { num: 6, title: '나노바나나', subtitle: '이미지·디자인 특화 기능' },
    { num: 7, title: '도구 매트릭스 + 윤리', subtitle: '기능별 도구 우위·할루시 비교' },
    { num: 8, title: '본인 업무 도구 조합 발표', subtitle: '최적 조합 설계·시연' },
  ],
  modules10h: [
    { num: 1, title: '도구 지형도 + GPT 핵심', subtitle: '5 도구 비교 + GPT 5 기능' },
    { num: 2, title: '제미나이 + 구글 생태계', subtitle: 'Workspace 통합 활용' },
    { num: 3, title: 'MS Copilot 업무 통합', subtitle: 'Office 365 + Teams' },
    { num: 4, title: '나노바나나 이미지 특화', subtitle: '디자인·포스터·썸네일' },
    { num: 5, title: '도구 조합 + 미니 프로젝트', subtitle: '본인 업무 최적 조합' },
  ],
};

export const PLAN_C: CoursePlan = {
  id: 'C',
  name: '산출물 프로젝트',
  axis: 'Project-Based · 실전 즉시 적용',
  audience: ['실전 즉시 적용 필요', '시간 없는 직장인', '결과물 빨리 보고 싶은 학습자'],
  concept: '결과물 1개 만들면서 필요 기능을 그때그때 익힘. 매 모듈 = 산출물 1개 완성',
  strengths: ['실습 비중 최대', '즉시 포트폴리오화', '동기부여 강함·이탈률 낮음'],
  modules40h: [
    { num: 1, title: 'OT + 환경 셋업', subtitle: 'AI 지형도 + 계정·도구 준비' },
    { num: 2, title: '보고서·문서 1건', subtitle: '텍스트 T-T로 업무 문서 완성' },
    { num: 3, title: '발표 슬라이드 1세트', subtitle: '텍스트 + 이미지 통합' },
    { num: 4, title: '홍보 포스터·썸네일', subtitle: '이미지 T-T 디자인 산출물' },
    { num: 5, title: '내레이션 음성 트랙', subtitle: '음성 TTS로 더빙 1편' },
    { num: 6, title: '짧은 영상 1편', subtitle: '영상 S-T + 자막 자동화' },
    { num: 7, title: '다국어 매뉴얼', subtitle: '번역 + 동시통역 활용' },
    { num: 8, title: '통합 콘텐츠 1편', subtitle: '5 기능 모두 사용한 1편' },
    { num: 9, title: '윤리 체크리스트', subtitle: '검증·저작권·민감정보 워크플로우' },
    { num: 10, title: '본인 업무 자동화 발표', subtitle: '실제 업무 1개 자동화 시연' },
  ],
  modules10h: [
    { num: 1, title: '문서·슬라이드 1세트', subtitle: '텍스트 + 이미지' },
    { num: 2, title: '이미지·포스터', subtitle: '디자인 산출물' },
    { num: 3, title: '음성·영상 1편', subtitle: 'TTS + 자막' },
    { num: 4, title: '다국어 매뉴얼', subtitle: '번역 + 통역' },
    { num: 5, title: '본인 업무 자동화 발표', subtitle: '실제 업무 1개' },
  ],
};

export const PLANS: CoursePlan[] = [PLAN_A, PLAN_B, PLAN_C];

export const COMPARISON_ROWS: ComparisonRow[] = [
  { label: '구조', A: 'Linear (누적)', B: 'Matrix (도구별)', C: 'Project-Based' },
  { label: '대상', A: '입문자·비전공자', B: '중급·결정자', C: '실전 즉시 적용' },
  { label: '학습 곡선', A: '완만', B: '중간', C: '가파름 (실습량 多)' },
  { label: '진도 명확성', A: '매우 높음', B: '높음', C: '보통' },
  { label: '동기부여', A: '보통', B: '보통', C: '매우 높음' },
  { label: '강의처 적합', A: '사내 입문·B2C 입문반', B: '도구 기획·결정자 워크샵', C: '단기 부트캠프·기업 실전반' },
  { label: '40h 모듈 수', A: '10', B: '8', C: '10' },
  { label: '10h 모듈 수', A: '5', B: '5', C: '5' },
  { label: '추천', A: '⭐ 베이스', B: '도구 비교 필요 시', C: '시간 부족 시', highlight: 'A' },
];
