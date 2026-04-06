export type RegulationType = 'fixed' | 'semi' | 'optional';

export interface RegulationOption {
  id: string;
  label: string;
  value: boolean | string;
  type: 'toggle' | 'select' | 'input';
  options?: string[]; // for select type
}

export interface Regulation {
  id: string;
  title: string;
  content: string;
  type: RegulationType;
  lastUpdated: string;
  options?: RegulationOption[];
  subDirectives?: {
    id: string;
    type: RegulationType;
    content: string;
  }[];
}

export interface SmallCategory {
  id: string;
  name: string;
  emoji: string;
  regulations: Regulation[];
}

export interface MediumCategory {
  id: string;
  name: string;
  emoji: string;
  smallCategories: SmallCategory[];
}

export interface LargeCategory {
  id: string;
  name: string;
  emoji: string;
  mediumCategories: MediumCategory[];
}

export const MOCK_DATA: Record<string, LargeCategory[]> = {
  'A_FIELD': [
    {
      id: 'a1',
      name: '문서',
      emoji: '📄',
      mediumCategories: [
        {
          id: 'a1-m1',
          name: '비즈니스',
          emoji: '💼',
          smallCategories: [
            { id: 'a1-m1-s1', name: '사업계획서', emoji: '📝', regulations: [
              {
                id: 'r1',
                title: '보안 등급 및 기본 규정',
                content: '대외비 유지 필수. 외부 유출 시 즉각 보고.',
                type: 'fixed',
                lastUpdated: '2024-03-01',
                options: [
                  { id: 'o1', label: '보안 워터마크', value: true, type: 'toggle' },
                  { id: 'o2', label: '대외비 표시', value: '상단 우측', type: 'select', options: ['상단 우측', '중앙 하단', '미사용'] }
                ],
                subDirectives: [
                  { id: 'sd1', type: 'fixed', content: '접속 IP 화이트리스트 등록 필수' },
                  { id: 'sd2', type: 'semi', content: '2단계 인증(OTP) 활성화 권장' },
                  { id: 'sd3', type: 'optional', content: '출력물 워터마크 커스텀 가능' }
                ]
              },
              {
                id: 'r2',
                title: '글꼴 및 타이포그래피',
                content: 'Pretendard Bold 24px 이상 사용 권장.',
                type: 'semi',
                lastUpdated: '2024-03-05',
                options: [
                  { id: 'o3', label: '자막 사용', value: true, type: 'toggle' },
                  { id: 'o4', label: '인코딩 방식', value: 'UTF-8', type: 'select', options: ['UTF-8', 'EUC-KR', 'ASCII'] },
                  { id: 'o5', label: '줄 간격', value: '1.5배', type: 'select', options: ['1.0배', '1.5배', '2.0배'] }
                ]
              }
            ] },
            { id: 'a1-m1-s2', name: '회사소개', emoji: '🏢', regulations: [{ id: 'r2', title: '톤앤매너', content: '전문적이고 신뢰감 있는 말투', type: 'semi', lastUpdated: '2024-03-05' }] },
            { id: 'a1-m1-s3', name: 'PPT/기획서', emoji: '📊', regulations: [{ id: 'r3', title: '글꼴 규정', content: 'Pretendard 사용 권장', type: 'optional', lastUpdated: '2024-03-10' }] },
          ]
        },
        {
          id: 'a1-m2',
          name: '법률',
          emoji: '⚖️',
          smallCategories: [
            { id: 'a1-m2-s1', name: '소송장', emoji: '📂', regulations: [{ id: 'r4', title: '법률 용어', content: '표준 법률 용어 준수', type: 'fixed', lastUpdated: '2024-02-15' }] },
            { id: 'a1-m2-s2', name: '형사/민사', emoji: '📁', regulations: [{ id: 'r5', title: '개인정보 보호', content: '비식별화 필수', type: 'fixed', lastUpdated: '2024-02-20' }] },
          ]
        }
      ]
    },
    {
      id: 'a2',
      name: '영상/SNS',
      emoji: '🎬',
      mediumCategories: [
        {
          id: 'a2-m1',
          name: '미디어/장르',
          emoji: '🎥',
          smallCategories: [
            { id: 'a2-m1-s1', name: '유튜브', emoji: '🔴', regulations: [{ id: 'r6', title: '자막 규칙', content: '하단 중앙 배치', type: 'semi', lastUpdated: '2024-03-08' }] },
            { id: 'a2-m1-s2', name: '다큐멘터리', emoji: '🌍', regulations: [{ id: 'r7', title: '나레이션', content: '차분한 톤 유지', type: 'optional', lastUpdated: '2024-03-11' }] },
          ]
        }
      ]
    },
    {
      id: 'a3',
      name: 'IT/개발',
      emoji: '💻',
      mediumCategories: [
        {
          id: 'a3-m1',
          name: '개발/보안',
          emoji: '🛡️',
          smallCategories: [
            { id: 'a3-m1-s1', name: 'AI/에이전트', emoji: '🤖', regulations: [{ id: 'r8', title: 'API 호출', content: '초당 10회 제한', type: 'fixed', lastUpdated: '2024-03-01' }] },
            { id: 'a3-m1-s2', name: '프론트/백엔드', emoji: '⛓️', regulations: [{ id: 'r9', title: '코드 스타일', content: 'ESLint 준수', type: 'semi', lastUpdated: '2024-03-02' }] },
          ]
        }
      ]
    }
  ],
  'B_LEVEL': [
    {
      id: 'b1',
      name: '교육',
      emoji: '🎓',
      mediumCategories: [
        {
          id: 'b1-m1',
          name: '일반교육',
          emoji: '📚',
          smallCategories: [
            { id: 'b1-m1-s1', name: '1급~3급', emoji: '🥇', regulations: [{ id: 'r10', title: '심사 기준', content: '출석률 90% 이상', type: 'fixed', lastUpdated: '2024-01-10' }] },
          ]
        }
      ]
    }
  ],
  'C_HOMEPAGE': [
    {
      id: 'c1',
      name: '교육 홈페이지',
      emoji: '🎓',
      mediumCategories: [
        {
          id: 'c1-m1',
          name: '메인 영역',
          emoji: '🖥️',
          smallCategories: [
            { id: 'c1-m1-s1', name: '헤더 디자인', emoji: '🎨', regulations: [{ id: 'rc1', title: '로고 배치', content: '상단 좌측 고정', type: 'fixed', lastUpdated: '2024-01-20' }] },
          ]
        }
      ]
    }
  ],
  'D_DEPT': [
    {
      id: 'd1',
      name: '기획부서',
      emoji: '📝',
      mediumCategories: [
        {
          id: 'd1-m1',
          name: '운영팀',
          emoji: '⚙️',
          smallCategories: [
            { id: 'd1-m1-s1', name: '강사팀', emoji: '👨‍🏫', regulations: [{ id: 'r11', title: '근무 시간', content: '09:00 - 18:00', type: 'fixed', lastUpdated: '2024-01-01' }] },
          ]
        }
      ]
    },
    {
      id: 'd2',
      name: '영업부서',
      emoji: '💰',
      mediumCategories: [
        {
          id: 'd2-m1',
          name: '국내영업',
          emoji: '🇰🇷',
          smallCategories: [
            { id: 'd2-m1-s1', name: 'B2B 영업', emoji: '🤝', regulations: [{ id: 'r12', title: '계약 양식', content: '표준 계약서 v2.0 사용', type: 'fixed', lastUpdated: '2024-02-01' }] },
          ]
        }
      ]
    }
  ],
  'E_POSITION': [
    {
      id: 'e1',
      name: '임원/대표',
      emoji: '👑',
      mediumCategories: [
        {
          id: 'e1-m1',
          name: '의사결정',
          emoji: '📢',
          smallCategories: [
            { id: 'e1-m1-s1', name: '결재 라인', emoji: '✍️', regulations: [{ id: 're1', title: '최종 승인권', content: '대표이사 전결 필수', type: 'fixed', lastUpdated: '2024-03-01' }] },
          ]
        }
      ]
    }
  ]
};

export const CATEGORY_TYPES = [
  { id: 'A_FIELD', name: 'A. 분야', emoji: '📁' },
  { id: 'B_LEVEL', name: 'B. 급수', emoji: '🏆' },
  { id: 'C_HOMEPAGE', name: 'C. 홈페이지', emoji: '🏠' },
  { id: 'D_DEPT', name: 'D. 부서', emoji: '🏢' },
  { id: 'E_POSITION', name: 'E. 직급', emoji: '👤' },
];
