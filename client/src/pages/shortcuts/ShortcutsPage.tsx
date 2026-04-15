import { useState, useMemo } from "react";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Settings,
  Check,
  MoveHorizontal,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";

// ─── 분류체계 데이터 ───────────────────────────────────────────
const CATEGORY_TREE = {
  문서: {
    비즈니스: null,
    사업계획서: null,
    회사소개: null,
    PPT: null,
    엑셀: null,
    기획서: null,
    법률: ["소송장", "준비서면", "형사", "민사"],
    의료: null,
    특허: null,
    노무: null,
    교재: null,
    논문: null,
    기사: null,
    고전: null,
    그외: null,
  },
  음성: {
    아나운서: null,
    관광가이드: null,
    큐레이터: null,
    "안내 방송": null,
    "교육 강의": null,
    실시간: null,
    화상수업: null,
  },
  영상: {
    SNS: null,
    유튜브: null,
    다큐멘터리: null,
    영화: null,
    드라마: null,
    예능: null,
  },
  개발: {
    보안: null,
    AI: null,
    에이전트: null,
    "디자인-웹/모바일": null,
    "기획-웹": null,
    웹기획: null,
    "홈페이지 UIUX": null,
    "디비(DB)": null,
    빅데이터: null,
    컨텐츠: null,
    백엔드: null,
    프론트: null,
    프로그램: null,
  },
  창의적활동: {
    드라마: null,
    웹툰소설: null,
    소설: null,
    시: null,
    음악: null,
    미술: null,
  },
  번역추가: {
    순차통역: null,
    동시통역: null,
    음성번역: null,
    자가선택: null,
  },
  프롬프트추가: {},
  확장영역: {
    암: null,
    요리: null,
    재무: null,
    주식: null,
    부동산: null,
    자녀: null,
    연애: null,
    입시: null,
    사주: null,
    결혼: null,
    영어: null,
    직장찾기: null,
    운동: null,
    사업: null,
  },
};

// ─── 급수 데이터 ───────────────────────────────────────────────
const GRADE_FIELD_OPTIONS = ["프롬", "번역", "윤리"];
const GRADE_MID_OPTIONS = ["교육", "일반", "전문"];
const GRADE_LEVELS: Record<string, string[]> = {
  교육: ["1급", "2급", "3급", "4급", "5급", "6급", "7급", "8급"],
  일반: ["1급", "2급", "3급"],
  전문: ["1급", "2급"],
};

const GRADE_TARGETS: Record<string, Record<string, string[]>> = {
  교육: {
    "1급": ["초등"],
    "2급": ["초등"],
    "3급": ["중등"],
    "4급": ["중등"],
    "5급": ["고등"],
    "6급": ["고등"],
    "7급": ["고3+대학신입"],
    "8급": ["고3+대학신입"],
  },
  일반: {
    "1급": ["대학생"],
    "2급": ["대학생", "실무자"],
    "3급": ["실무자"],
  },
  전문: {
    "1급": [],
    "2급": [],
  },
};

// ─── Types ─────────────────────────────────────────────────────
interface PageLink {
  title: string;
  emoji: string;
  figmaMakeUrl?: string;
  isDb?: boolean;
  categoryName?: string;
  updatedAt?: string;
}

interface Category {
  name: string;
  emoji: string;
  letter: string;
  pages: PageLink[];
}

// ─── Initial data ──────────────────────────────────────────────
const topCategories: Category[] = [
  {
    name: "데이터",
    emoji: "📊",
    letter: "A",
    pages: [
      {
        title: "감사 처리",
        emoji: "🎓",
        updatedAt: "03.14",
        figmaMakeUrl:
          "https://www.figma.com/make/60eyAaz66uEvV18k3WWbNS/%EA%B0%95%EC%82%AC-%EC%BB%A4%EB%A6%AC-%ED%8E%98%EC%9D%B4%EC%A7%80?t=ozMzQKZy6o2iawUK-1",
      },
      {
        title: "교재",
        emoji: "📚",
        updatedAt: "03.15",
        figmaMakeUrl:
          "https://www.figma.com/make/Tvkp0caVoCt1lHp5iUOqaB/%EA%B5%90%EC%9E%AC-%ED%8E%98%EC%9D%B4%EC%A7%80?t=DeyG8DDNxlkdSI3Y-1",
      },
      {
        title: "마케팅",
        emoji: "📢",
        updatedAt: "03.10",
        figmaMakeUrl:
          "https://www.figma.com/make/rKsKUorM8F7DDmVHvCaOqc/%EB%A7%88%EC%BC%80%ED%8C%85-%EA%B4%80%EB%A6%AC-%ED%8E%98%EC%9D%B4%EC%A7%80?p=f&t=SwXLX30V2UHepijd-0",
      },
      {
        title: "문제은행 사이트",
        emoji: "❓",
        updatedAt: "03.11",
        figmaMakeUrl:
          "https://www.figma.com/make/cRwrhKVBI5U9iSTopaS1DB/%EB%AC%B8%EC%A0%9C%EC%9D%80%ED%96%89-%EC%82%AC%EC%9D%B4%ED%8A%B8?t=9ncXY9LOJWnfmjQw-1",
      },
      {
        title: "DB",
        emoji: "🗄️",
        updatedAt: "03.12",
        isDb: true,
        figmaMakeUrl:
          "https://www.figma.com/make/Vxx6ETPoYGEr5R6Ue754Qa/DB-%ED%8E%98%EC%9D%B4%EC%A7%80?t=AG4orOXLxUQwzx77-1",
      },
      {
        title: "DB v2",
        emoji: "💾",
        updatedAt: "03.16",
        isDb: true,
        figmaMakeUrl:
          "https://www.figma.com/make/uGCONfLFy7YzzZEbu1yiQQ/DB-%ED%8E%98%EC%9D%B4%EC%A7%80-v2?t=rMB637As1GXKw0Oy-1",
      },
    ],
  },
  {
    name: "관리자",
    emoji: "🔐",
    letter: "B",
    pages: [
      {
        title: "신청서 관리",
        emoji: "📋",
        updatedAt: "03.01",
        figmaMakeUrl:
          "https://www.figma.com/make/ity5waanbLT9oPRRExZKvb/%EC%8B%A0%EC%B2%AD%EC%84%9C-%EA%B4%80%EB%A6%AC-%ED%8E%98%EC%9D%B4%EC%A7%80?t=b1x3dZMhaMJJ33vU-1",
      },
      {
        title: "신청서 관리 v2",
        emoji: "📋",
        updatedAt: "03.05",
        figmaMakeUrl:
          "https://www.figma.com/make/wBm9HdOhHnS2qPECVAjZR8/%EC%8B%A0%EC%B2%AD%EC%84%9C-%EA%B4%80%EB%A6%AC-%ED%8E%98%EC%9D%B4%EC%A7%80-v2?t=cdI4dcv3T5v4cHmL-1",
      },
      {
        title: "바로가기 페이지",
        emoji: "🔗",
        updatedAt: "03.16",
        figmaMakeUrl:
          "https://www.figma.com/make/eHP8SI0rLMYd5IUmZgHiHa/Create-Hyperlink-Page?t=c2dQf7GgH9bn3Tv7-1",
      },
      {
        title: "랜딩페이지 관리",
        emoji: "🖥️",
        updatedAt: "03.12",
        figmaMakeUrl:
          "https://www.figma.com/make/Fn89JyeeaizgKWgdZgKnvg/%EB%9E%9C%EB%94%A9%ED%8E%98%EC%9D%B4%EC%A7%80-%EA%B4%80%EB%A6%AC-%ED%8E%98%EC%9D%B4%EC%A7%80?t=1AjFKkHNszriEWaB-1",
      },
    ],
  },
  {
    name: "사용자",
    emoji: "👤",
    letter: "C",
    pages: [
      {
        title: "원페이지",
        emoji: "📄",
        figmaMakeUrl:
          "https://www.figma.com/make/iof9l7wW8Z0C9qOl5qbnsf/%EC%9B%90%ED%8E%98%EC%9D%B4%EC%A7%80?t=B4xxHkO9QaqxXWyG-1",
      },
      {
        title: "대표님 브랜딩",
        emoji: "✨",
        figmaMakeUrl:
          "https://www.figma.com/make/s4NzrfoNsGb8iUrzOrOHte/Jinny-Park-%EA%B0%9C%EC%9D%B8-%EC%82%AC%EC%9D%B4%ED%8A%B8-%EC%A0%9C%EC%9E%91?t=C2nllkUqvMGeMiwN-1",
      },
      {
        title: "대표님 브랜딩 V2",
        emoji: "💎",
        figmaMakeUrl:
          "https://www.figma.com/make/R7OHhpRkfYjPOFvy1vSW8g/%EB%8C%80%ED%91%9C%EB%8B%98-%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80-V2?t=oBgb6DIuWj7RpYM1-1",
      },
      {
        title: "HUTECH 홈페이지",
        emoji: "🏠",
        figmaMakeUrl:
          "https://www.figma.com/make/c1RFhsKK1j8TN4aLGaboES/HUTECH-%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80-%EC%A0%9C%EC%9E%91?t=N7v8UlrV97689gUn-1",
      },
      {
        title: "휴텍씨 서비스 소개",
        emoji: "🌟",
        figmaMakeUrl:
          "https://www.figma.com/make/0nGaGvepD5B0K70TAj4NUd/%ED%9C%B4%ED%85%8D%EC%94%A8-%EC%84%9C%EB%B9%84%EC%8A%A4-%EC%86%8C%EA%B0%9C-%EC%9B%B9%EC%82%AC%EC%9D%B4%ED%8A%B8?t=zONIOC8Kh7VRzf6x-1",
      },
    ],
  },
  {
    name: "전문가",
    emoji: "👨‍🏫",
    letter: "D",
    pages: [
      {
        title: "전문가 신청 1단계",
        emoji: "✍️",
        figmaMakeUrl:
          "https://www.figma.com/make/gHkjoPMMFmD4WcNmr5DvAg/%EC%A0%84%EB%AC%B8%EA%B0%80-%EC%8B%A0%EC%B2%AD-1%EB%8B%A8%EA%B3%84-%ED%8E%98%EC%9D%B4%EC%A7%80?t=6W5ssPFgzj8UfQzb-0",
      },
    ],
  },
  {
    name: "개별페이지",
    emoji: "📄",
    letter: "E",
    pages: [
      {
        title: "반도체/조선/방산",
        emoji: "🏭",
        figmaMakeUrl:
          "https://www.figma.com/make/LPtNYUdip137Y9nR8lKIt9/%ED%9C%B4%ED%85%8D%EC%94%A8-%EB%B0%98%EB%8F%84%EC%B2%B4-%EC%A1%B0%EC%84%A0-%EB%B0%A9%EC%82%B0-%ED%8E%98%EC%9D%B4%EC%A7%80?t=X6TdYgm1pZeVvsUJ-1",
      },
      {
        title: "피지컬",
        emoji: "💪",
        figmaMakeUrl:
          "https://www.figma.com/make/IYMoNGvNPwDKknlxmKE52S/%ED%9C%B4%ED%85%8D%EC%94%A8-%ED%94%BC%EC%A7%80%EC%BB%AC-%ED%8E%98%EC%9D%B4%EC%A7%80?t=9CDVY9ICoLxzRaYM-1",
      },
      {
        title: "고전번역",
        emoji: "📜",
        figmaMakeUrl:
          "https://www.figma.com/make/Io5vr1qbMIyZ16PpwsOtGL/%ED%9C%B4%ED%85%8D%EC%94%A8-%EA%B3%A0%EC%A0%84%EB%B2%88%EC%97%AD?t=RVdTkzvD7llDSJJy-1",
      },
    ],
  },
  {
    name: "UIUX",
    emoji: "🎨",
    letter: "F",
    pages: [
      {
        title: "이사님",
        emoji: "🌐",
        figmaMakeUrl:
          "https://www.figma.com/make/kWloAMfn7fpvjGuP8HexYe/TESOL-%EA%B5%90%EC%9C%A1-%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80-%EC%A0%9C%EC%9E%91?t=nf5TjLg0B1SGWcYF-1",
      },
    ],
  },
  {
    name: "매뉴얼",
    emoji: "📖",
    letter: "G",
    pages: [
      {
        title: "매뉴얼 리스트",
        emoji: "📖",
        figmaMakeUrl:
          "https://www.figma.com/make/KI4I6C2gW90ox9gF2GCpW9/%EB%A7%A4%EB%89%B4%EC%96%BC-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%ED%8E%98%EC%9D%B4%EC%A7%80?t=nNo06AGHLIuvwZb4-1",
      },
      {
        title: "규정관리",
        emoji: "📜",
        figmaMakeUrl:
          "https://www.figma.com/make/huQZzxU7XBHTQgW057Sejx/%EA%B7%9C%EC%A0%95%EA%B4%80%EB%A6%AC-%ED%8E%98%EC%9D%B4%EC%A7%80?t=yMPiLQcZmVKk78b6-1",
      },
    ],
  },
  {
    name: "그외",
    emoji: "🧩",
    letter: "H",
    pages: [
      {
        title: "업무일지",
        emoji: "📓",
        figmaMakeUrl:
          "https://www.figma.com/make/AaTBV4kZ3hTTaSfvwJJyZl/%EC%97%85%EB%AC%B4%EC%9D%BC%EC%A7%80-%EC%9B%B9%EC%82%AC%EC%9D%B4%ED%8A%B8?t=SLuiU2VstPp9gx0b-1",
      },
      {
        title: "레벨테스트",
        emoji: "🧪",
        figmaMakeUrl:
          "https://www.figma.com/make/ySCF7q7vGNEmwJzWXEucKR/%EB%A0%88%EB%B2%A8%ED%85%8C%EC%8A%A4%ED%8A%B8-%ED%8E%98%EC%9D%B4%EC%A7%80?t=cYkzz8m12JAh5OyI-1",
      },
      {
        title: "레슨플랜",
        emoji: "📝",
        figmaMakeUrl:
          "https://www.figma.com/make/06sEVqoowsAdlhMcrlkgq6/%EB%A0%88%EC%8A%A8%ED%94%8C%EB%9E%9C-%EC%9B%B9%EC%82%AC%EC%9D%B4%ED%8A%B8?t=8uNsQR44Z7ZFV5II-1",
      },
    ],
  },
];

const bottomCategories: Category[] = [
  {
    name: "개별홈페이지",
    emoji: "📊",
    letter: "A",
    pages: [
      {
        title: "대표님홈페이지",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/UitESewEV8DEcjURgkVKxX/A.-%EB%8C%80%ED%91%9C%EB%8B%98-%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80-v3-%EC%9B%90%EB%B3%B5-%ED%9B%84-%EB%8B%A4%EC%8B%9C%EC%8B%9C%EB%8F%84---Copy-?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "휴텍씨홈페이지",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/SOZJUzzTnX6RtPnfCQaxcb/A.-%ED%9C%B4%ED%85%8D%EC%94%A8-%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80-v4?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "번역전체",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/0nGaGvepD5B0K70TAj4NUd/A.-%EB%28%EB%84%AD%EC%A0%84%EC%B2%B4?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "번역사이트_고전",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/22oZmCgsA0nQk0YNizokPS/A.-%EA%B3%A0%EC%A0%84%EB%AC%B8%EC%84%9C-%EB%B2%88%EC%97%AD-%EC%84%9C%EB%B9%84%EC%8A%A4-%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "TESOL 홈페이지",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/TjnmN0iVLDVrCQ6qqo2Dmn/A.-TESOL-%EA%B5%90%EC%9C%A1-%ED%99%88%ED%8E%98%EC%9D%B4%EC%A7%80-%EC%A0%9C%EC%9E%91--%EC%B0%A8%EC%A7%80%EC%98%88%EC%88%98%EC%A0%95-?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "IITA협회",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/QjixZHU8IpzxvN3DGwbZ80/IITA%ED%98%91%ED%9A%8C?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "AITE",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/ziRs8LdTN0OQi3u6wJsujd/AITE?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "번역사이트_아랍어",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/bCylC0wkVJptWB7pcAXp5W/A.%EB%B2%88%EC%97%AD%EC%82%AC%EC%9D%B4%ED%8A%B8_%EC%95%84%EB%9E%8D?t=3M7hFZDgYkSYohrm-1",
        updatedAt: "03.19",
      },
      {
        title: "통독_전체_v2",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/akUxACaLlCP9OvFCxl4Soi/A.-%ED%86%B5%EB%8F%85---%EC%A0%84%EC%B2%B4v2?t=36rWfRWk7k2QywSh-1&preview-route=%2Fabout",
        updatedAt: "03.19",
      },
    ],
  },
  {
    name: "데이터",
    emoji: "🔐",
    letter: "B",
    pages: [
      {
        title: "AI STUDIO",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/cT4lO1pvdmRev3J9EwSnxZ/A.-AI-STUDIO.V3?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "신청서관리",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/BaLDHmzgYewuB67ix69efj/B.-%EC%8B%A0%EC%B2%AD%EC%84%9C-%EA%B4%80%EB%A6%AC-%ED%8E%98%EC%9D%B4%EC%A7%80-v3?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "강의시간표",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/m2bQEhHLuobcGWtAM6IM4G/B.-%EA%B0%95%EC%9D%98%EC%8B%9C%EA%B0%84%ED%91%9C_%EC%8B%A0%EC%B2%AD?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "프롬프트샘플",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/e4pRets7H5qOfYaZwZiwaU/%ED%94%84%EB%A1%AC%ED%94%84%ED%8A%B8_%EC%83%98%ED%94%8C?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "면접플로우",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/NrnXzR1Fkab1qJiuSXcS9w/A.-%EB%A9%B4%EC%A0%91%ED%94%8C%EB%A1%9C%EC%9A%B0?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "업무일지",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/PWBXhOKfRhCpe1PCN4Zvbf/B.-%EC%97%85%EB%AC%BC%EC%9D%BC%EC%A7%80-%EC%9B%B9%EC%82%AC%EC%9D%B4%ED%8A%B8-v3--0311-?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "규정_레이아웃공통",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/6D0LzlrDhSN4qkHGyluFlz/%EA%B7%9C%EC%A0%95_%EB%A0%88%EC%9D%B4%EC%95%84%EC%9B%83%EA%B3%B5%ED%86%B5?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "규정매뉴얼",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/ys5GQ3XYIN1bsWXcxoqBxC/%EA%B7%9C%EC%A0%95%EB%A7%A4%EB%89%B4%EC%96%BC?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "시험지_응시자용",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/d5MXqC3PtvFI7Ye03lSMCx/A.%EC%8B%9C%ED%97%98%EC%A7%80_%EC%9D%91%EC%8B%9C%EC%9E%90%EC%9A%A9?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "상담관리시스템",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/gP07Sq3qQGcMJRMk3oKt9p/B.-%EC%83%81%EB%8B%B4%EA%B4%80%EB%A6%AC%EC%8B%9C%EC%8A%A4%ED%85%9C-V3?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "사진모음",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/d8wm1SkBtFMdXHkDvgXZA5/B.-%EC%82%AC%EC%A7%84%EB%AA%A8%EC%9D%8C%EB%8C%80%EC%8B%9C%EB%B3%B4%EB%93%9C-V3?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "미팅신청폼",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/RNBVN2MX8sO8K1CCUuzFp7/%EB%AF%B8%ED%8C%85%EC%8B%A0%EC%B2%AD%ED%8F%BC?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "실적_거래처_아웃콜",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/SSWXLtj7Y3Qv1kqXMfKPI5/B.-%EA%B1%B0%EB%9E%98%EC%B2%98_%EC%95%84%EC%9B%83%EC%BD%9C_%EC%9D%B4%EB%A0%A5?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "미수금관리",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/7C5JNg2oE9bAj8KnkRA9Al/B.-%EB%AF%B8%EC%88%98%EA%B8%88%EA%B4%80%EB%A6%AC?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "관리자통합시스템",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/kowZcVk9PeKVCrnGd3AG2Y/B.-%EA%B4%80%EB%A6%AC%EC%9E%90%ED%86%B5%ED%95%A9%EC%8B%9C%EC%8A%A4%ED%85%9C-V3?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "업무및보안준수_서약서",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/G8KgWb7BpmxtGNbUhAP1gQ/A.-%EC%97%85%EB%AC%B4%EB%B0%8F%EB%B3%B4%EC%95%88%EC%A4%80%EC%88%98_%EC%84%9C%EC%95%BD%EC%84%9C?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "출퇴근관리시스템",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/SwVqROPmC9bwqY7ZawKODO/B.-%EC%B6%9C%ED%87%B4%EA%B7%BC%EA%B4%80%EB%A6%AC%EC%8B%9C%EC%8A%A4%ED%85%9C?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "평가기준설정",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/hwQ9CKSdzmuTZQtIDgI737/B.-%ED%8F%89%EA%B0%80%EA%B8%B0%EC%A4%80%EC%A0%95%EB%B0%80%EC%84%A4%EC%A0%95?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "사내업무지침",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/zNW5hljdQR9ERzmtIxOuyc/B.-%EC%82%AC%EB%82%B4%EC%97%85%EB%AC%B4%EC%A7%80%EC%B9%A8-V1?t=IfaSmkTYx6EAf4ZU-1",
      },
    ],
  },
  {
    name: "개별",
    emoji: "👤",
    letter: "C",
    pages: [
      {
        title: "출력용_면접관리",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/LRPaDtZ0fQPWMEcMcg9pUM/A.-4.-%EB%A9%B4%EC%A0%91%EA%B4%80%EB%A6%AC-v4--%EC%B6%9C%EB%A0%A5%EC%9A%A9-?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "출력용_강사지원자",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/IMQ5j738rY41AXhUc8om55/A.-%EA%B0%95%EC%82%AC_%EC%A7%80%EC%9B%90%EC%9E%90%EC%9A%A9-v2-%EC%B6%9C%EB%A0%A5%EC%9A%A9-?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "출력용_전문가지원",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/W6ualQ72O2HrqWORKZqZfq/A.-%EC%A0%84%EB%AC%B8%EA%B0%80_%EC%A7%80%EC%9B%90%EC%9E%90%EC%9A%A9-v2-%EC%B6%9C%EB%A0%A5%EC%9A%A9-?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "출력용_번역가지원",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/P2DFSE1YZS42rcbVXucbS1/A.-%EB%B2%88%EC%97%AD%EA%B0%80_%EC%A7%80%EC%9B%90%EC%9E%90%EC%9A%A9-v2-%EC%B6%9C%EB%A0%A5%EC%9A%A9-?t=IfaSmkTYx6EAf4ZU-1",
      },
      {
        title: "출력용_강사면접플로우",
        emoji: "🔗",
        figmaMakeUrl:
          "https://www.figma.com/make/VyYeBtOudiFDJewI5hjL0B/%EA%B0%95%EC%82%AC%EB%A9%B4%EC%A0%91%ED%94%8C%EB%A1%9C%EC%9A%B0_%EC%B6%9C%EB%A0%A5%EC%9A%A9%ED%99%94%EB%A9%B4?t=IfaSmkTYx6EAf4ZU-1",
      },
    ],
  },
  {
    name: "타이틀",
    emoji: "👨‍🏫",
    letter: "D",
    pages: [],
  },
  {
    name: "타이틀",
    emoji: "📄",
    letter: "E",
    pages: [],
  },
  {
    name: "타이틀",
    emoji: "🎨",
    letter: "F",
    pages: [],
  },
  {
    name: "타이틀",
    emoji: "📖",
    letter: "G",
    pages: [],
  },
  {
    name: "타이틀",
    emoji: "🧩",
    letter: "H",
    pages: [],
  },
];

const historyCategories: Category[] = [
  { name: "휴지통", emoji: "🕰️", letter: "A", pages: [] },
  { name: "이전버전관리", emoji: "🕰️", letter: "B", pages: [] },
  { name: "타이틀", emoji: "🕰️", letter: "C", pages: [] },
  { name: "타이틀", emoji: "📁", letter: "D", pages: [] },
  { name: "타이틀", emoji: "✅", letter: "E", pages: [] },
  { name: "타이틀", emoji: "⏸️", letter: "F", pages: [] },
  { name: "타이틀", emoji: "📚", letter: "G", pages: [] },
  { name: "타이틀", emoji: "📜", letter: "H", pages: [] },
];

// ─── DbFilters sub-component ──────────────────────────────────
function DbFilters({
  onClose: _onClose,
  mainUrl,
}: {
  onClose: () => void;
  mainUrl?: string;
}) {
  const [catMajor, setCatMajor] = useState<string>("");
  const [catMid, setCatMid] = useState<string>("");
  const [catMinor, setCatMinor] = useState<string>("");

  const [gradeField, setGradeField] = useState<string>("");
  const [gradeMid, setGradeMid] = useState<string>("");
  const [gradeLevel, setGradeLevel] = useState<string>("");
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);

  const handleMajorChange = (value: string) => {
    setCatMajor(value);
    setCatMid("");
    setCatMinor("");
  };

  const handleMidChange = (value: string) => {
    setCatMid(value);
    setCatMinor("");
  };

  const midOptions = catMajor
    ? Object.keys(
        CATEGORY_TREE[catMajor as keyof typeof CATEGORY_TREE] || {}
      )
    : [];

  const minorOptions =
    catMajor && catMid
      ? (CATEGORY_TREE[catMajor as keyof typeof CATEGORY_TREE] as Record<
          string,
          string[] | null
        >)?.[catMid] || []
      : [];

  const hasMinor = Array.isArray(minorOptions) && minorOptions.length > 0;

  const handleFieldChange = (value: string) => {
    setGradeField(value);
    setGradeMid("");
    setGradeLevel("");
    setSelectedTargets([]);
  };

  const handleMidGradeChange = (value: string) => {
    setGradeMid(value);
    setGradeLevel("");
    setSelectedTargets([]);
  };

  const handleLevelChange = (value: string) => {
    setGradeLevel(value);
    setSelectedTargets([]);
  };

  const levelOptions = gradeMid ? GRADE_LEVELS[gradeMid] || [] : [];
  const targetOptions =
    gradeMid && gradeLevel
      ? GRADE_TARGETS[gradeMid]?.[gradeLevel] || []
      : [];

  const toggleTarget = (target: string) => {
    setSelectedTargets((prev) =>
      prev.includes(target)
        ? prev.filter((t) => t !== target)
        : [...prev, target]
    );
  };

  const canSaveCat = catMajor && catMid && (!hasMinor || catMinor);
  const canSaveGrade = gradeField && gradeMid && gradeLevel;

  // Suppress unused variable warning
  void _onClose;

  return (
    <div className="p-1 space-y-1.5">
      {mainUrl && (
        <a
          href={mainUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md bg-neutral-800 text-white hover:bg-neutral-700 transition-colors group"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-[12px]">🗄️</span>
            <span className="text-[11px]">전체 DB</span>
          </span>
          <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
        </a>
      )}

      {/* 분류체계 Section */}
      <div className="border border-neutral-200 rounded-md bg-neutral-50 overflow-hidden">
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-neutral-700 text-white">
          <span className="text-[12px]">📂</span>
          <span className="text-[11px]">분류체계</span>
          {canSaveCat && (
            <span className="ml-auto text-[10px] text-green-400">✓</span>
          )}
        </div>
        <div className="p-2 space-y-1.5">
          <div className="grid grid-cols-3 gap-1.5">
            <div>
              <label className="text-[10px] text-neutral-500 mb-0.5 block">
                대분류
              </label>
              <div className="relative">
                <select
                  value={catMajor}
                  onChange={(e) => handleMajorChange(e.target.value)}
                  className="w-full px-2 py-1.5 text-[11px] border border-neutral-200 rounded bg-white appearance-none pr-2 cursor-pointer hover:border-neutral-300"
                >
                  <option value="">선택</option>
                  {Object.keys(CATEGORY_TREE).map((major) => (
                    <option key={major} value={major}>
                      {major}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-neutral-500 mb-0.5 block">
                중분류
              </label>
              <div className="relative">
                <select
                  value={catMid}
                  onChange={(e) => handleMidChange(e.target.value)}
                  disabled={!catMajor}
                  className="w-full px-2 py-1.5 text-[11px] border border-neutral-200 rounded bg-white appearance-none pr-2 cursor-pointer hover:border-neutral-300 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                >
                  <option value="">선택</option>
                  {midOptions.map((mid) => (
                    <option key={mid} value={mid}>
                      {mid}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-neutral-500 mb-0.5 block">
                소분류
              </label>
              <div className="relative">
                <select
                  value={catMinor}
                  onChange={(e) => setCatMinor(e.target.value)}
                  disabled={!catMid || !hasMinor}
                  className="w-full px-2 py-1.5 text-[11px] border border-neutral-200 rounded bg-white appearance-none pr-2 cursor-pointer hover:border-neutral-300 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                >
                  <option value="">선택</option>
                  {(minorOptions as string[]).map((minor: string) => (
                    <option key={minor} value={minor}>
                      {minor}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {catMajor && (
            <div className="p-1.5 bg-white rounded border border-neutral-200">
              <div className="text-[10px] text-neutral-800">
                {catMajor}
                {catMid && ` → ${catMid}`}
                {catMinor && ` → ${catMinor}`}
              </div>
            </div>
          )}

          {canSaveCat && (
            <div className="pt-1 space-y-1">
              <div className="text-[10px] text-neutral-500 mb-1">DB 링크</div>
              <div className="grid grid-cols-2 gap-1">
                {[1, 2, 3, 4].map((idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="flex items-center justify-between gap-1 px-1.5 py-1 border border-neutral-200 rounded hover:bg-white transition-colors group text-[10px] text-neutral-700"
                  >
                    <span className="truncate">
                      {catMajor.slice(0, 2)} DB {idx}
                    </span>
                    <ExternalLink className="w-2.5 h-2.5 text-neutral-300 group-hover:text-neutral-500 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 급수 Section */}
      <div className="border border-neutral-200 rounded-md bg-neutral-50 overflow-hidden">
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-neutral-700 text-white">
          <span className="text-[12px]">🎖️</span>
          <span className="text-[11px]">급수</span>
          {canSaveGrade && (
            <span className="ml-auto text-[10px] text-green-400">✓</span>
          )}
        </div>
        <div className="p-2 space-y-1.5">
          <div className="grid grid-cols-3 gap-1.5">
            <div>
              <label className="text-[10px] text-neutral-500 mb-0.5 block">
                분야
              </label>
              <div className="relative">
                <select
                  value={gradeField}
                  onChange={(e) => handleFieldChange(e.target.value)}
                  className="w-full px-2 py-1.5 text-[11px] border border-neutral-200 rounded bg-white appearance-none pr-2 cursor-pointer hover:border-neutral-300"
                >
                  <option value="">선택</option>
                  {GRADE_FIELD_OPTIONS.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-neutral-500 mb-0.5 block">
                중
              </label>
              <div className="relative">
                <select
                  value={gradeMid}
                  onChange={(e) => handleMidGradeChange(e.target.value)}
                  disabled={!gradeField}
                  className="w-full px-2 py-1.5 text-[11px] border border-neutral-200 rounded bg-white appearance-none pr-2 cursor-pointer hover:border-neutral-300 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                >
                  <option value="">선택</option>
                  {GRADE_MID_OPTIONS.map((mid) => (
                    <option key={mid} value={mid}>
                      {mid}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-neutral-500 mb-0.5 block">
                급수
              </label>
              <div className="relative">
                <select
                  value={gradeLevel}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  disabled={!gradeMid}
                  className="w-full px-2 py-1.5 text-[11px] border border-neutral-200 rounded bg-white appearance-none pr-2 cursor-pointer hover:border-neutral-300 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                >
                  <option value="">선택</option>
                  {levelOptions.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {targetOptions.length > 0 && (
            <div>
              <label className="text-[10px] text-neutral-500 mb-0.5 block">
                대상
              </label>
              <div className="flex flex-wrap gap-1">
                {targetOptions.map((target) => (
                  <label
                    key={target}
                    className="flex items-center gap-1 px-1.5 py-0.5 border border-neutral-200 rounded cursor-pointer hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTargets.includes(target)}
                      onChange={() => toggleTarget(target)}
                      className="w-3 h-3 cursor-pointer"
                    />
                    <span className="text-[10px] text-neutral-700">
                      {target}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {gradeField && (
            <div className="p-1.5 bg-white rounded border border-neutral-200">
              <div className="text-[10px] text-neutral-800">
                {gradeField}
                {gradeMid && ` → ${gradeMid}`}
                {gradeLevel && ` → ${gradeLevel}`}
                {selectedTargets.length > 0 &&
                  ` (${selectedTargets.join(", ")})`}
              </div>
            </div>
          )}

          {canSaveGrade && (
            <div className="pt-1 space-y-1">
              <div className="text-[10px] text-neutral-500 mb-1">DB 링크</div>
              <div className="grid grid-cols-2 gap-1">
                {[1, 2, 3, 4].map((idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="flex items-center justify-between gap-1 px-1.5 py-1 border border-neutral-200 rounded hover:bg-white transition-colors group text-[10px] text-neutral-700"
                  >
                    <span className="truncate">
                      {gradeField} {gradeLevel} {idx}
                    </span>
                    <ExternalLink className="w-2.5 h-2.5 text-neutral-300 group-hover:text-neutral-500 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PageRow sub-component ─────────────────────────────────────
function PageRow({
  page,
  onDelete,
  onUpdate,
  onMove,
  prefix,
  isEditMode,
  allCategories,
}: {
  page: PageLink;
  onDelete: () => void;
  onUpdate: (updates: Partial<PageLink>) => void;
  onMove: (newCategoryName: string) => void;
  prefix: string;
  isEditMode: boolean;
  allCategories: {
    label: string;
    categories: { name: string; emoji: string }[];
  }[];
}) {
  if (isEditMode) {
    return (
      <div className="p-1.5 border-b border-neutral-100 last:border-0 space-y-2 bg-neutral-50/50">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-neutral-400 font-mono shrink-0 w-8">
            {prefix}
          </span>
          <input
            className="flex-1 text-[11px] px-1 py-0.5 border border-neutral-200 rounded outline-none focus:border-blue-400"
            value={page.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="제목"
          />
          <input
            className="w-10 text-[11px] px-1 py-0.5 border border-neutral-200 rounded outline-none text-center"
            value={page.emoji}
            onChange={(e) => onUpdate({ emoji: e.target.value })}
            placeholder="🗂️"
          />
          <button
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex-1 relative">
            <LinkIcon className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-neutral-400" />
            <input
              className="w-full pl-2 pr-1 py-0.5 text-[10px] border border-neutral-200 rounded outline-none focus:border-blue-400 text-neutral-500"
              value={page.figmaMakeUrl || ""}
              onChange={(e) => onUpdate({ figmaMakeUrl: e.target.value })}
              placeholder="Figma URL"
            />
          </div>
          <div className="w-16 relative">
            <Calendar className="absolute left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-neutral-400" />
            <input
              className="w-full pl-2 pr-1 py-0.5 text-[10px] border border-neutral-200 rounded outline-none focus:border-blue-400 text-center text-neutral-500"
              value={page.updatedAt || ""}
              onChange={(e) => onUpdate({ updatedAt: e.target.value })}
              placeholder="MM.DD"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <MoveHorizontal className="w-2.5 h-2.5 text-neutral-400" />
          <select
            className="flex-1 text-[10px] px-1 py-0.5 border border-neutral-200 rounded bg-white outline-none cursor-pointer"
            onChange={(e) => onMove(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              섹션 이동...
            </option>
            {allCategories.map((group, gIdx) => (
              <optgroup
                key={`${group.label}-${gIdx}`}
                label={group.label}
                className="text-[9px] font-bold bg-neutral-100"
              >
                {group.categories.map((cat, cIdx) => (
                  <option
                    key={`${group.label}-${cat.name}-${cIdx}`}
                    value={cat.name}
                    className="bg-white"
                  >
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
    );
  }

  const content = (
    <div className="flex items-center gap-1 group/row">
      <a
        href={page.figmaMakeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-neutral-100 transition-colors group cursor-pointer min-w-0"
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-[11px] text-neutral-400 shrink-0 font-mono">
            {prefix}
          </span>
          <span className="text-[12px] shrink-0">{page.emoji}</span>
          <span className="text-[11px] text-neutral-800 truncate flex-1">
            {page.title}
          </span>
          {page.updatedAt && (
            <span className="text-[9px] text-neutral-400 font-mono shrink-0 px-1 border border-neutral-100 rounded bg-neutral-50">
              {page.updatedAt}
            </span>
          )}
        </div>
        <ExternalLink className="w-2.5 h-2.5 text-neutral-300 group-hover:text-neutral-500 shrink-0 transition-colors" />
      </a>
    </div>
  );

  if (page.isDb) {
    return (
      <div className="border-b border-neutral-100 last:border-0 pb-1 mb-1">
        {content}
        <DbFilters onClose={() => {}} mainUrl={page.figmaMakeUrl} />
      </div>
    );
  }

  return (
    <div className="border-b border-neutral-50 last:border-0">{content}</div>
  );
}

// ─── CategoryBox sub-component ─────────────────────────────────
function CategoryBox({
  category,
  onDeletePage,
  onUpdatePage,
  onMovePage,
  isEditMode,
  allCategories,
  onAddPage,
  onUpdateCategory,
}: {
  category: Category;
  onDeletePage: (categoryName: string, pageTitle: string) => void;
  onUpdatePage: (
    categoryName: string,
    pageTitle: string,
    updates: Partial<PageLink>
  ) => void;
  onMovePage: (
    oldCategoryName: string,
    pageTitle: string,
    newCategoryName: string
  ) => void;
  allCategories: {
    label: string;
    categories: { name: string; emoji: string }[];
  }[];
  onAddPage: (
    categoryName: string,
    title: string,
    url: string,
    date?: string
  ) => void;
  onUpdateCategory: (oldName: string, newName: string) => void;
  isEditMode: boolean;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDate, setNewDate] = useState("");

  const handleAddSubmit = () => {
    if (newTitle && newUrl) {
      onAddPage(category.name, newTitle, newUrl, newDate);
      setNewTitle("");
      setNewUrl("");
      setNewDate("");
      setIsAdding(false);
    }
  };

  return (
    <div className="border border-neutral-200 rounded-sm bg-white overflow-hidden flex flex-col h-fit">
      <div className="flex items-center gap-1 px-1.5 py-1 bg-neutral-900 text-white shrink-0 h-6">
        <span className="text-[10px] font-bold shrink-0">
          {category.letter}.
        </span>
        {isEditMode ? (
          <input
            className="bg-transparent text-[10px] font-medium outline-none border-b border-white/20 focus:border-white/60 flex-1 min-w-0 px-0.5 transition-colors"
            value={category.name}
            onChange={(e) => onUpdateCategory(category.name, e.target.value)}
          />
        ) : (
          <span className="text-[10px] font-medium truncate">
            {category.name}
          </span>
        )}
        <span className="text-[9px] text-neutral-400 ml-auto font-mono">
          {category.pages.length}
        </span>
      </div>
      <div className="p-0.5 flex-1 min-h-[30px]">
        {category.pages.map((page, idx) => (
          <PageRow
            key={`${category.name}-${page.title}-${idx}`}
            page={page}
            prefix={`${category.letter}-${idx + 1}`}
            isEditMode={isEditMode}
            allCategories={allCategories}
            onDelete={() => onDeletePage(category.name, page.title)}
            onUpdate={(updates) =>
              onUpdatePage(category.name, page.title, updates)
            }
            onMove={(newCat) =>
              onMovePage(category.name, page.title, newCat)
            }
          />
        ))}
        {category.pages.length === 0 && !isAdding && (
          <div className="py-1 text-center text-[9px] text-neutral-300 italic">
            Empty
          </div>
        )}

        {isEditMode && (
          <div className="mt-0.5 border-t border-neutral-50 pt-0.5">
            {isAdding ? (
              <div className="p-1.5 bg-blue-50 rounded-sm space-y-1.5 border border-blue-100">
                <input
                  className="w-full text-[10px] px-1.5 py-1 border border-neutral-200 rounded bg-white outline-none focus:border-blue-400"
                  placeholder="(1) 바로가기명"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
                <input
                  className="w-full text-[10px] px-1.5 py-1 border border-neutral-200 rounded bg-white outline-none focus:border-blue-400"
                  placeholder="(2) 링크삽입 (Figma URL)"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
                <input
                  className="w-full text-[10px] px-1.5 py-1 border border-neutral-200 rounded bg-white outline-none focus:border-blue-400"
                  placeholder="(3) 날짜 (MM.DD)"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleAddSubmit}
                    className="flex-1 py-1 bg-blue-500 text-white text-[10px] rounded font-bold hover:bg-blue-600 transition-colors"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="px-2 py-1 bg-neutral-200 text-neutral-600 text-[10px] rounded hover:bg-neutral-300 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full py-1 text-[10px] text-blue-500 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1 font-medium"
              >
                <span>+</span> 링크 추가
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────
export default function ShortcutsPage() {
  const [topCats, setTopCats] = useState(bottomCategories);
  const [bottomCats, setBottomCats] = useState(topCategories);
  const [historyCats, setHistoryCats] = useState(historyCategories);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isHwangExpanded, setIsHwangExpanded] = useState(true);

  const handleAddPage = (
    catName: string,
    title: string,
    url: string,
    date?: string
  ) => {
    const today = new Date();
    const formattedDate =
      date ||
      `${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

    const newPage: PageLink = {
      title,
      figmaMakeUrl: url,
      emoji: "🔗",
      updatedAt: formattedDate,
    };

    const updater = (prev: Category[]) =>
      prev.map((cat) => {
        if (cat.name === catName) {
          return { ...cat, pages: [...cat.pages, newPage] };
        }
        return cat;
      });

    setTopCats(updater);
    setBottomCats(updater);
    setHistoryCats(updater);
  };

  const [deletedPages, setDeletedPages] = useState<
    Array<
      PageLink & {
        categoryName: string;
        categoryEmoji: string;
        categoryLetter: string;
      }
    >
  >([]);

  const groupedCategories = useMemo(() => {
    return [
      {
        label: "PROJECTS (차지예)",
        categories: topCats.map((c) => ({ name: c.name, emoji: c.emoji })),
      },
      {
        label: "PROJECTS (황준걸)",
        categories: bottomCats.map((c) => ({ name: c.name, emoji: c.emoji })),
      },
      {
        label: "PROJECTS (history)",
        categories: historyCats.map((c) => ({ name: c.name, emoji: c.emoji })),
      },
    ];
  }, [topCats, bottomCats, historyCats]);

  const handleUpdatePage = (
    catName: string,
    title: string,
    updates: Partial<PageLink>
  ) => {
    const updater = (prev: Category[]) =>
      prev.map((cat) => {
        if (cat.name === catName) {
          return {
            ...cat,
            pages: cat.pages.map((p, idx) => {
              const isTarget =
                p.title === title ||
                (cat.letter === "A" && idx === 3 && title === "고전문서번역");
              return isTarget ? { ...p, ...updates } : p;
            }),
          };
        }
        return cat;
      });

    setTopCats(updater);
    setBottomCats(updater);
    setHistoryCats(updater);
  };

  const handleUpdateCategory = (oldName: string, newName: string) => {
    const updater = (prev: Category[]) =>
      prev.map((cat) =>
        cat.name === oldName ? { ...cat, name: newName } : cat
      );
    setTopCats(updater);
    setBottomCats(updater);
    setHistoryCats(updater);
  };

  const handleMovePage = (
    oldCatName: string,
    title: string,
    newCatName: string
  ) => {
    let pageToMove: PageLink | null = null;

    const findAndRemove = (prev: Category[]) =>
      prev.map((cat) => {
        if (cat.name === oldCatName) {
          const pIdx = cat.pages.findIndex((p) => p.title === title);
          if (pIdx > -1) {
            pageToMove = cat.pages[pIdx];
            const newPages = [...cat.pages];
            newPages.splice(pIdx, 1);
            return { ...cat, pages: newPages };
          }
        }
        return cat;
      });

    setTopCats(findAndRemove);
    setBottomCats(findAndRemove);
    setHistoryCats(findAndRemove);

    setTimeout(() => {
      if (pageToMove) {
        const addToTarget = (prev: Category[]) =>
          prev.map((cat) => {
            if (cat.name === newCatName) {
              return { ...cat, pages: [...cat.pages, pageToMove!] };
            }
            return cat;
          });

        setTopCats(addToTarget);
        setBottomCats(addToTarget);
        setHistoryCats(addToTarget);
      }
    }, 0);
  };

  const handleDeletePageTop = (categoryName: string, pageTitle: string) => {
    setTopCats((prev) =>
      prev.map((cat) => {
        if (cat.name === categoryName) {
          const deletedPage = cat.pages.find((p) => p.title === pageTitle);
          if (deletedPage) {
            setDeletedPages((d) => [
              ...d,
              {
                ...deletedPage,
                categoryName: cat.name,
                categoryEmoji: cat.emoji,
                categoryLetter: cat.letter,
              },
            ]);
          }
          return {
            ...cat,
            pages: cat.pages.filter((p) => p.title !== pageTitle),
          };
        }
        return cat;
      })
    );
  };

  const handleDeletePageBottom = (categoryName: string, pageTitle: string) => {
    setBottomCats((prev) =>
      prev.map((cat) => {
        if (cat.name === categoryName) {
          const deletedPage = cat.pages.find((p) => p.title === pageTitle);
          if (deletedPage) {
            setDeletedPages((d) => [
              ...d,
              {
                ...deletedPage,
                categoryName: cat.name,
                categoryEmoji: cat.emoji,
                categoryLetter: cat.letter,
              },
            ]);
          }
          return {
            ...cat,
            pages: cat.pages.filter((p) => p.title !== pageTitle),
          };
        }
        return cat;
      })
    );
  };

  const handleDeletePageHistory = (
    categoryName: string,
    pageTitle: string
  ) => {
    setHistoryCats((prev) =>
      prev.map((cat) => {
        if (cat.name === categoryName) {
          const deletedPage = cat.pages.find((p) => p.title === pageTitle);
          if (deletedPage) {
            setDeletedPages((d) => [
              ...d,
              {
                ...deletedPage,
                categoryName: cat.name,
                categoryEmoji: cat.emoji,
                categoryLetter: cat.letter,
              },
            ]);
          }
          return {
            ...cat,
            pages: cat.pages.filter((p) => p.title !== pageTitle),
          };
        }
        return cat;
      })
    );
  };

  const topTotal = topCats.reduce((acc, cat) => acc + cat.pages.length, 0);
  const bottomTotal = bottomCats.reduce(
    (acc, cat) => acc + cat.pages.length,
    0
  );
  const historyTotal = historyCats.reduce(
    (acc, cat) => acc + cat.pages.length,
    0
  );
  const total = topTotal + bottomTotal + historyTotal;

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
        <div className="flex items-center gap-1">
          <div className="bg-neutral-900 text-white px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1">
            <span className="text-blue-400">◆</span> PROJECT MANAGER : 차지예 /
            황준걸
          </div>
          <span className="text-[11px] text-neutral-500 font-mono">
            TOTAL: {total} PAGES
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all text-[11px] font-medium ${
              isEditMode
                ? "bg-blue-500 border-blue-600 text-white"
                : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400"
            }`}
          >
            {isEditMode ? (
              <>
                <Check className="w-3.5 h-3.5" />
                완료 모드
              </>
            ) : (
              <>
                <Settings className="w-3.5 h-3.5" />
                수정 모드
              </>
            )}
          </button>
          <span className="text-[10px] text-neutral-300 font-mono italic">
            v2.4 Hyperlink Hub (Editor Edition)
          </span>
        </div>
      </div>

      {/* 1. PROJECTS (차지예) */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
          <h2 className="text-[13px] font-bold text-neutral-800 flex items-center gap-2">
            PROJECTS (차지예)
            <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
              {topTotal}
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-4 xl:grid-cols-8 gap-1.5">
          {topCats.map((cat) => (
            <CategoryBox
              key={`top-${cat.letter}`}
              category={cat}
              isEditMode={isEditMode}
              allCategories={groupedCategories}
              onDeletePage={handleDeletePageTop}
              onUpdatePage={handleUpdatePage}
              onMovePage={handleMovePage}
              onAddPage={handleAddPage}
              onUpdateCategory={handleUpdateCategory}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-neutral-200"></div>

      {/* 2. PROJECTS (황준걸) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <h2 className="text-[13px] font-bold text-neutral-800 flex items-center gap-2">
              PROJECTS (황준걸)
              <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
                {bottomTotal}
              </span>
            </h2>
          </div>
          <button
            onClick={() => setIsHwangExpanded(!isHwangExpanded)}
            className="flex items-center gap-1 px-2 py-1 text-[10px] text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors border border-neutral-200"
          >
            {isHwangExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                접어두기
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                펼쳐보기
              </>
            )}
          </button>
        </div>

        {isHwangExpanded && (
          <div className="grid grid-cols-4 xl:grid-cols-8 gap-1.5">
            {bottomCats.map((cat, idx) => (
              <CategoryBox
                key={`bottom-${cat.letter}-${idx}`}
                category={cat}
                isEditMode={isEditMode}
                allCategories={groupedCategories}
                onDeletePage={handleDeletePageBottom}
                onUpdatePage={handleUpdatePage}
                onMovePage={handleMovePage}
                onAddPage={handleAddPage}
                onUpdateCategory={handleUpdateCategory}
              />
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t-2 border-neutral-200"></div>

      {/* 3. PROJECTS (history) */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></div>
          <h2 className="text-[13px] font-bold text-neutral-800 flex items-center gap-2">
            PROJECTS (history)
            <span className="bg-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
              {historyTotal}
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-4 xl:grid-cols-8 gap-1.5">
          {historyCats.map((cat, idx) => (
            <CategoryBox
              key={`history-${cat.letter}-${idx}`}
              category={cat}
              isEditMode={isEditMode}
              allCategories={groupedCategories}
              onDeletePage={handleDeletePageHistory}
              onUpdatePage={handleUpdatePage}
              onMovePage={handleMovePage}
              onAddPage={handleAddPage}
              onUpdateCategory={handleUpdateCategory}
            />
          ))}
        </div>
      </div>

      {/* 삭제된 페이지 (Recycle Bin) */}
      <div className="bg-neutral-100 rounded-md p-1 border border-neutral-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-neutral-700 text-[12px] font-bold">
            RECYCLE BIN
          </span>
          <span className="text-[10px] text-neutral-400 ml-auto font-mono">
            {deletedPages.length} ITEMS
          </span>
        </div>
        {deletedPages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {deletedPages.map((page, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-2 py-1.5 bg-white border border-neutral-200 rounded text-[10px]"
              >
                <span className="text-neutral-400 font-mono">
                  {page.categoryLetter}
                </span>
                <span>{page.emoji}</span>
                <span className="text-neutral-700 truncate flex-1">
                  {page.title}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-1.5 text-[11px] text-neutral-400 italic">
            비어 있음
          </div>
        )}
      </div>
    </div>
  );
}
