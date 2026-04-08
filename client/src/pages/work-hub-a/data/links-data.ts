/* ── 바로가기 링크 데이터 (ShortcutsPage 원본 + 라이브 서비스) ── */

export interface LinkItem { name: string; url: string; date?: string; }
export interface LinkGroup { code: string; title: string; count: number; links: LinkItem[]; }
export interface LinkSection { person: string; count: number; color: string; bg: string; groups: LinkGroup[]; }

export const LIVE_LINKS = [
  { title: '핵심시스템', emoji: '🖥️', color: '#3B82F6', bg: '#EFF6FF', links: [
    { name: 'AI Studio (직원)', url: 'http://54.116.15.136:81/app' },
    { name: 'Work Studio (관리)', url: 'http://54.116.15.136:80' },
    { name: 'AITe CBT (시험)', url: 'http://54.116.15.136:82' },
  ]},
  { title: '홈페이지', emoji: '🌐', color: '#10B981', bg: '#F0FDF4', links: [
    { name: 'TESOL', url: 'https://hu-tec.github.io/TESOL/' },
    { name: '번역허브', url: 'https://hu-tec.github.io/translation-hub/' },
    { name: 'AI윤리', url: 'https://hu-tec.github.io/ai-ethics/' },
    { name: '고전번역', url: 'https://hu-tec.github.io/classic-translation/' },
    { name: '휴텍씨', url: 'https://hu-tec.github.io/company_hutec/' },
    { name: '대표블로그', url: 'https://hu-tec.github.io/personal_page/' },
  ]},
  { title: 'GitHub', emoji: '📦', color: '#1e293b', bg: '#F8FAFC', links: [
    { name: 'ai_studio', url: 'https://github.com/hu-tec/ai_studio' },
    { name: 'work_studio', url: 'https://github.com/hu-tec/work_studio' },
    { name: 'AITe_CBT', url: 'https://github.com/hu-tec/AITe_CBT' },
  ]},
];

export const SHORTCUT_SECTIONS: LinkSection[] = [
  { person: '차지예', count: 33, color: '#7C3AED', bg: '#F5F3FF', groups: [
    { code: 'A', title: '개별홈페이지', count: 9, links: [
      { name: '대표님홈페이지', url: 'https://www.figma.com/make/UitESewEV8DEcjURgkVKxX/' },
      { name: '휴텍씨홈페이지', url: 'https://www.figma.com/make/SOZJUzzTnX6RtPnfCQaxcb/' },
      { name: '번역전체', url: 'https://www.figma.com/make/0nGaGvepD5B0K70TAj4NUd/' },
      { name: '번역사이트_고전', url: 'https://www.figma.com/make/22oZmCgsA0nQk0YNizokPS/' },
      { name: 'TESOL 홈페이지', url: 'https://www.figma.com/make/TjnmN0iVLDVrCQ6qqo2Dmn/' },
      { name: 'IITA협회', url: 'https://www.figma.com/make/QjixZHU8IpzxvN3DGwbZ80/' },
      { name: 'AITE', url: 'https://www.figma.com/make/ziRs8LdTN0OQi3u6wJsujd/' },
      { name: '번역사이트_아랍어', url: 'https://www.figma.com/make/bCylC0wkVJptWB7pcAXp5W/', date: '03.19' },
      { name: '통독_전체_v2', url: 'https://www.figma.com/make/akUxACaLlCP9OvFCxl4Soi/', date: '03.19' },
    ]},
    { code: 'B', title: '데이터', count: 19, links: [
      { name: 'AI STUDIO', url: 'https://www.figma.com/make/cT4lO1pvdmRev3J9EwSnxZ/' },
      { name: '신청서관리', url: 'https://www.figma.com/make/BaLDHmzgYewuB67ix69efj/' },
      { name: '강의시간표', url: 'https://www.figma.com/make/m2bQEhHLuobcGWtAM6IM4G/' },
      { name: '프롬프트샘플', url: 'https://www.figma.com/make/e4pRets7H5qOfYaZwZiwaU/' },
      { name: '면접플로우', url: 'https://www.figma.com/make/NrnXzR1Fkab1qJiuSXcS9w/' },
      { name: '업무일지', url: 'https://www.figma.com/make/PWBXhOKfRhCpe1PCN4Zvbf/' },
      { name: '규정_레이아웃공통', url: 'https://www.figma.com/make/6D0LzlrDhSN4qkHGyluFlz/' },
      { name: '규정매뉴얼', url: 'https://www.figma.com/make/ys5GQ3XYIN1bsWXcxoqBxC/' },
      { name: '시험지_응시자용', url: 'https://www.figma.com/make/d5MXqC3PtvFI7Ye03lSMCx/' },
      { name: '상담관리시스템', url: 'https://www.figma.com/make/gP07Sq3qQGcMJRMk3oKt9p/' },
      { name: '사진모음', url: 'https://www.figma.com/make/d8wm1SkBtFMdXHkDvgXZA5/' },
      { name: '미팅신청폼', url: 'https://www.figma.com/make/RNBVN2MX8sO8K1CCUuzFp7/' },
      { name: '실적_거래처_아웃콜', url: 'https://www.figma.com/make/SSWXLtj7Y3Qv1kqXMfKPI5/' },
      { name: '미수금관리', url: 'https://www.figma.com/make/7C5JNg2oE9bAj8KnkRA9Al/' },
      { name: '관리자통합시스템', url: 'https://www.figma.com/make/kowZcVk9PeKVCrnGd3AG2Y/' },
      { name: '업무및보안준수_서약서', url: 'https://www.figma.com/make/G8KgWb7BpmxtGNbUhAP1gQ/' },
      { name: '출퇴근관리시스템', url: 'https://www.figma.com/make/SwVqROPmC9bwqY7ZawKODO/' },
      { name: '평가기준설정', url: 'https://www.figma.com/make/hwQ9CKSdzmuTZQtIDgI737/' },
      { name: '사내업무지침', url: 'https://www.figma.com/make/zNW5hljdQR9ERzmtIxOuyc/' },
    ]},
    { code: 'C', title: '개별(출력용)', count: 5, links: [
      { name: '출력용_면접관리', url: 'https://www.figma.com/make/LRPaDtZ0fQPWMEcMcg9pUM/' },
      { name: '출력용_강사지원자', url: 'https://www.figma.com/make/IMQ5j738rY41AXhUc8om55/' },
      { name: '출력용_전문가지원', url: 'https://www.figma.com/make/W6ualQ72O2HrqWORKZqZfq/' },
      { name: '출력용_번역가지원', url: 'https://www.figma.com/make/P2DFSE1YZS42rcbVXucbS1/' },
      { name: '출력용_강사면접플로우', url: 'https://www.figma.com/make/VyYeBtOudiFDJewI5hjL0B/' },
    ]},
  ]},
  { person: '황준걸', count: 25, color: '#0EA5E9', bg: '#F0F9FF', groups: [
    { code: 'A', title: '데이터', count: 6, links: [
      { name: '감사 처리', url: 'https://www.figma.com/make/60eyAaz66uEvV18k3WWbNS/', date: '03.14' },
      { name: '교재', url: 'https://www.figma.com/make/Tvkp0caVoCt1lHp5iUOqaB/', date: '03.15' },
      { name: '마케팅', url: 'https://www.figma.com/make/rKsKUorM8F7DDmVHvCaOqc/', date: '03.10' },
      { name: '문제은행 사이트', url: 'https://www.figma.com/make/cRwrhKVBI5U9iSTopaS1DB/', date: '03.11' },
      { name: 'DB', url: 'https://www.figma.com/make/Vxx6ETPoYGEr5R6Ue754Qa/', date: '03.12' },
      { name: 'DB v2', url: 'https://www.figma.com/make/uGCONfLFy7YzzZEbu1yiQQ/', date: '03.16' },
    ]},
    { code: 'B', title: '관리자', count: 4, links: [
      { name: '신청서 관리', url: 'https://www.figma.com/make/ity5waanbLT9oPRRExZKvb/', date: '03.01' },
      { name: '신청서 관리 v2', url: 'https://www.figma.com/make/wBm9HdOhHnS2qPECVAjZR8/', date: '03.05' },
      { name: '바로가기 페이지', url: 'https://www.figma.com/make/eHP8SI0rLMYd5IUmZgHiHa/', date: '03.16' },
      { name: '랜딩페이지 관리', url: 'https://www.figma.com/make/Fn89JyeeaizgKWgdZgKnvg/', date: '03.12' },
    ]},
    { code: 'C', title: '사용자', count: 5, links: [
      { name: '원페이지', url: 'https://www.figma.com/make/iof9l7wW8Z0C9qOl5qbnsf/' },
      { name: '대표님 브랜딩', url: 'https://www.figma.com/make/s4NzrfoNsGb8iUrzOrOHte/' },
      { name: '대표님 브랜딩 V2', url: 'https://www.figma.com/make/R7OHhpRkfYjPOFvy1vSW8g/' },
      { name: 'HUTECH 홈페이지', url: 'https://www.figma.com/make/c1RFhsKK1j8TN4aLGaboES/' },
      { name: '휴텍씨 서비스 소개', url: 'https://www.figma.com/make/0nGaGvepD5B0K70TAj4NUd/' },
    ]},
    { code: 'D', title: '전문가', count: 1, links: [{ name: '전문가 신청 1단계', url: 'https://www.figma.com/make/gHkjoPMMFmD4WcNmr5DvAg/' }] },
    { code: 'E', title: '개별페이지', count: 3, links: [
      { name: '반도체/조선/방산', url: 'https://www.figma.com/make/LPtNYUdip137Y9nR8lKIt9/' },
      { name: '피지컬', url: 'https://www.figma.com/make/IYMoNGvNPwDKknlxmKE52S/' },
      { name: '고전번역', url: 'https://www.figma.com/make/Io5vr1qbMIyZ16PpwsOtGL/' },
    ]},
    { code: 'F', title: 'UIUX', count: 1, links: [{ name: '이사님(TESOL)', url: 'https://www.figma.com/make/kWloAMfn7fpvjGuP8HexYe/' }] },
    { code: 'G', title: '매뉴얼', count: 2, links: [
      { name: '매뉴얼 리스트', url: 'https://www.figma.com/make/KI4I6C2gW90ox9gF2GCpW9/' },
      { name: '규정관리', url: 'https://www.figma.com/make/huQZzxU7XBHTQgW057Sejx/' },
    ]},
    { code: 'H', title: '그외', count: 3, links: [
      { name: '업무일지', url: 'https://www.figma.com/make/AaTBV4kZ3hTTaSfvwJJyZl/' },
      { name: '레벨테스트', url: 'https://www.figma.com/make/ySCF7q7vGNEmwJzWXEucKR/' },
      { name: '레슨플랜', url: 'https://www.figma.com/make/06sEVqoowsAdlhMcrlkgq6/' },
    ]},
  ]},
];
