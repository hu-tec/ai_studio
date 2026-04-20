// Auto-generated from /home/hutechc/.claude/memory/*.md
// Snapshot: 2026-04-20T05:46:11.127Z

export interface MemoryFile {
  file: string;
  idx: number | null;
  grade: string;
  indexDesc: string;
  name: string;
  description: string;
  type: string;
  body: string;
}

export const MEMORY_FILES: MemoryFile[] = [
  {
    "file": "reference_infra.md",
    "idx": 1,
    "grade": "참조",
    "indexDesc": "EC2(54.116.15.136) + 9개 레포 경로/remote/소스/배포",
    "name": "hu-tec 인프라 + 레포 구조 통합",
    "description": "AWS EC2/S3/API Gateway, GitHub Pages, 전체 9개 레포 경로·remote·소스·배포 방식.",
    "type": "reference",
    "body": "## EC2\n- IP: 54.116.15.136 / Instance: i-02c00e776f4ef83f1 / t3.small (2GB)\n- **SSH: ec2-user** (hutechc 아님!) / WSL: `~/.ssh/id_ed25519`\n- OS: Amazon Linux 2023 / Node: v22(nvm), v18(work_studio용)\n- EBS: 20GB gp3\n\n## 포트 (nginx 리버스 프록시)\n- :80 → localhost:3000 — work_studio (Express+SQLite, Node 18)\n- :81 → localhost:3001 — ai_studio (React SPA, Express+SQLite)\n- :82 → :3082 (iptables) — AITe CBT (Next.js, Node 22)\n- ecosystem.config.js에 PORT 정의, kill_timeout: 5000\n\n## EC2 배포 레포\n\n| 프로젝트 | 로컬 | remote (SSH) | 소스 | 배포 |\n|----------|------|-------------|------|------|\n| work_studio | `_ALL_CODES/work_studio` | `git@github.com:hu-tec/work_studio.git` | `src/curriculum-app/`, `src/db-app/`, `src/level-test-app/` + `public/*.html` | deploy.sh |\n| ai_studio | `_ALL_CODES/ai_studio` | `git@github.com:hu-tec/ai_studio.git` | `client/src/` | 빌드결과 git 포함 → pull |\n| AITe_CBT | `_ALL_CODES/AITe_CBT` | `git@github.com:hu-tec/AITe_CBT.git` | Next.js `app/`, `components/` | EC2에서 빌드 |\n\n## GitHub Pages 레포\n\n| 프로젝트 | 로컬 | remote (SSH) | 소스 | URL |\n|----------|------|-------------|------|-----|\n| TESOL | `_ALL_CODES/TESOL` | `git@github.com:hu-tec/TESOL.git` | `src/` | hu-tec.github.io/TESOL/ |\n| company_hutec | `_ALL_CODES/company_hutec` | `git@github.com:hu-tec/company_hutec.git` | `src/` | hu-tec.github.io/company_hutec/ |\n| classic-translation | `_ALL_CODES/classic-translation` | `git@github.com:hu-tec/classic-translation.git` | `src/` | hu-tec.github.io/classic-translation/ |\n| ai-ethics | `_ALL_CODES/ai-ethics` | `git@github.com:hu-tec/ai-ethics.git` | `src/` | hu-tec.github.io/ai-ethics/ |\n| personal_page | `_ALL_CODES/personal_page` | `git@github.com:hu-tec/personal_page.git` | `src/` | hu-tec.github.io/personal_page/ |\n| translation-hub | `_ALL_CODES/translation-hub` | `git@github.com:hu-tec/translation-hub.git` | `src/` | hu-tec.github.io/translation-hub/ |\n\n## AWS 기타\n- S3: work-studio-uploads (파일 업로드 + DB 백업) / IAM 역할 인증 (키 불필요)\n- API Gateway: bmidcy9z17.execute-api.ap-northeast-2.amazonaws.com\n\n## 신청폼 → 백엔드\n- TESOL 신청 → ai_studio\n- 윤리/고전번역/번역/대표블로그 → work_studio\n- CBT 결과 → work_studio (cbt_results)\n\n## 프로젝트 라우팅 — 새 기능을 어디에 넣을지\n\n| 대상 | 프로젝트 | 기술 스택 |\n|------|----------|-----------|\n| **직원용** 관리 도구 (사내 업무, 규정, 출퇴근 등) | **ai_studio** | React + Vite + Tailwind + MUI, Express + SQLite |\n| **소비자용** 신청서, 지원서 (외부 접수 폼) | **work_studio** `public/*.html` | vanilla HTML/JS (단일 파일) |\n| **관리자용** DB관리, 신청서편집, 시험편집, 랜딩관리 | **work_studio** `public/*.html` | vanilla HTML/JS (단일 파일) |\n| **관리자용** 커리큘럼, DB뷰 등 복잡한 React 앱 | **work_studio** `src/{앱}/` | React + Vite + Tailwind → `public/` 빌드 |\n| **홈페이지/랜딩** (프론트만, 백엔드는 work_studio API) | **GitHub Pages** 별도 레포 | React + Vite + Tailwind |\n| **CBT 시험** 플랫폼 | **AITe_CBT** | Next.js + Prisma + SQLite |\n\n> 판단 기준: 사용자가 직원이면 ai_studio, 외부/소비자면 work_studio, 독립 홈페이지면 GitHub Pages\n\n## 공통 규칙\n- 모든 remote: SSH 사용 (HTTPS 인증 안 됨)\n- `.gitignore` 필수: `node_modules/`, `dist/`, `.env`, `.DS_Store`\n- 소스 + 빌드결과 모두 커밋"
  },
  {
    "file": "user_profile.md",
    "idx": 2,
    "grade": "참조",
    "indexDesc": "hu-tec, MacBook+WSL, 간결·빠른 실행 선호",
    "name": "사용자 프로필",
    "description": "hu-tec 소속, 다수 웹 서비스를 관리하는 개발자/관리자. MacBook + WSL 사용.",
    "type": "user",
    "body": "- hu-tec(휴텍씨) 소속\n- 다수 웹 서비스 운영: 회사 홈페이지, TESOL, 번역, AI 윤리, 업무관리, CBT 등\n- AWS EC2 단일 서버에 Express + SQLite + Next.js 기반 백엔드 운영\n- GitHub Pages로 정적 홈페이지 다수 운영\n- React SPA, Next.js 등 프론트엔드 기술 사용\n- 한국어 기본, 개발 용어는 영어 혼용\n- 개발 환경: MacBook (메인) + Windows WSL2 (보조)\n- 스타일: 간결한 지시, 빠른 실행 선호, 불필요한 질문 싫어함"
  },
  {
    "file": "feedback_design_framework.md",
    "idx": 3,
    "grade": "고정",
    "indexDesc": "프레임 우선 설계 + 고정/준고정/선택 규정 체계 + 홈페이지 원칙 + 제작 절차",
    "name": "업무 설계 기본 원칙 — 프레임 우선 + 규정 3단계 + 홈페이지 + 제작 절차",
    "description": "모든 업무의 기본 철학. 공통 틀 먼저 만들고 찍어내기, 고정/준고정/선택 규정 체계, 홈페이지 목차 원칙, 제작 절차.",
    "type": "feedback",
    "body": "hu-tec의 모든 업무 설계에 적용되는 기본 철학.\n\n**Why:** 신입 교육 자료에서 명시된 핵심 원칙. 개별 작업을 매번 새로 만들지 않고, 공통 구조를 재사용하는 것이 회사 업무 방식의 근간.\n\n**How to apply:**\n\n### 1. 프레임 우선 설계 [고정]\n- **먼저 공통 틀(프레임)을 만든다** → 이후 여러 업무에 반복 적용 (찍어내기)\n- 커리큘럼, 교재, 시험, 랜딩페이지, 마케팅 모두 같은 틀에서 확장\n- 매뉴얼/규정 정리가 실제 제작보다 우선\n- 확장성이 가장 중요한 설계 기준 — 한 번 만들고 여러 업무에 확장 가능해야 함\n\n### 2. 규정 3단계 분류 [고정]\n| 구분 | 의미 | 적용 |\n|------|------|------|\n| **고정** | 반드시 유지, 예외 없음 | 공통 틀의 중심, 모든 업무에 동일 |\n| **준고정** | 기본 유지, 상황별 변형 가능 | 업무 성격에 따라 일부 조정 |\n| **선택** | 필요 시 추가/제외 | 분야별 개별 요소 |\n\n이 3단계는 규정뿐 아니라 **UI 기능, 레이아웃, 분류 항목** 등 모든 설계에 적용.\n\n### 3. 분류 체계 [고정]\n- **대분류 → 중분류 → 소분류** 단계적 구조화\n- **급수** 구분: 시험/교육과 연결\n- **분야별** 차이: 공통 틀 위에 분야별 세부 항목 추가\n- 번호 체계 부여 (3-1, 3-2 등) — 버전/위치 구분\n\n### 4. 홈페이지 구성 원칙 [고정]\n- **서비스 소개 우선** — 첫 화면은 서비스 소개부터\n- **회사 소개 후순위** — 하단 배치\n- **필수 항목**: 실적, 전문가 신청, 견적 의뢰 — 빠지면 안 됨\n- **독립 사이트 운영**: 고전 번역 등은 기존 하위가 아니라 별도 사이트\n- **기존 틀 재활용**: 새 사이트는 기존 구조 바탕으로 내용만 교체\n\n### 5. 제작 절차 [고정]\n1. **자료 조사** — 해당 분야 충분히 조사\n2. **표 정리** — 조사 결과를 구조화된 표로 정리\n3. **목차 설계** — 표 기반으로 홈페이지/문서 목차 구성\n4. **누락 보완** — 빠진 요소 추가 후 재구성\n5. **파일 2종 활용** — 내용 자료 + 스타일 참고 자료\n\n### 6. 프롬프트 관리 [준고정]\n- 1차 프롬프트 → 결과 확인 → 2차 수정 프롬프트 → 결과 비교\n- 프롬프트와 결과를 **기록**해서 재사용 가능한 회사 노하우로 누적\n- 개인 감이 아니라 조직 자산으로 관리\n\n### 7. 레이아웃 유형 4종 [준고정]\n| 유형 | 용도 |\n|------|------|\n| 장문형 | 설명이 긴 콘텐츠 |\n| 질문·단답형 | Q&A, 짧은 응답 |\n| 4지선다형 | 시험, 퀴즈 |\n| 단일선택형 | 하나만 고르기 |"
  },
  {
    "file": "feedback_source_management.md",
    "idx": 4,
    "grade": "고정",
    "indexDesc": "소스는 레포 src/에 + 빌드결과 함께 커밋 + EC2 git/빌드 규칙",
    "name": "소스 관리 + EC2 빌드/git 규칙 통합",
    "description": "React 소스는 배포 레포 src/에, 빌드결과와 함께 커밋. EC2 git 작업 주의사항, 빌드 메모리 제약 포함.",
    "type": "feedback",
    "body": "React 앱 소스를 배포 레포 외부에 방치하면 소스 유실 → 기능 회귀 발생.\n\n**Why:** 2026-04-08 _tmp_pages 사고 — git 미추적 소스 수정 → 빌드 시 구버전 회귀.\n\n**How to apply:**\n\n### 신규 프로젝트 체크리스트\n1. 소스: 배포 레포 내부 `src/{앱명}/` (외부 폴더 금지)\n2. 빌드결과: `public/{경로}/`에 복사하여 함께 커밋\n3. `.gitignore`: `node_modules/`, `dist/`, `.env` 포함\n4. git remote: SSH(`git@github.com:hu-tec/...`) 사용 (HTTPS 인증 안 됨)\n5. 빌드 명령 기록: package.json scripts에 남기기\n\n### 소스 수정 → 배포 흐름\n1. `src/`에서 코드 수정\n2. 빌드 (`npx vite build --base=/{경로}/`)\n3. `cp -r dist/* public/{경로}/`\n4. **소스 + 빌드결과 모두** 커밋 → push\n5. EC2: `~/deploy.sh {앱}` 또는 GitHub Pages 자동 배포\n\n### EC2 git 작업 주의\n- EC2에는 GitHub SSH 키 없음 → push 불가\n- 해결: WSL에서 수정 → push → EC2에서 git pull\n- work_studio는 Node 18 (better-sqlite3), AITe_CBT는 Node 22 (nvm use)\n\n### EC2 빌드 제약\n- t3.small(2GB): 빌드 가능\n- t3.micro(1GB): OOM → WSL에서 빌드 후 결과물 push\n- ai_studio: 빌드결과 `public/app/` git 포함 → pull만 하면 됨\n- work_studio: 빌드 불필요 (vanilla HTML + React 앱 빌드는 WSL에서)\n\n### git 커밋 규칙\n- **`git add -A` / `git add .` 금지** — 다른 세션 작업물과 겹칠 수 있음\n- 커밋할 때는 반드시 **해당 세션에서 수정한 파일만** 개별 지정하여 `git add`\n- 다수 파일이라도 파일명을 나열하여 add (예: `git add file1.ts file2.tsx`)\n\n### 빌드 시 절대 금지\n- 배포 중 빌드결과물 확인 없이 덮어쓰기 금지\n- `rm -rf public/{경로}/` 후 재빌드 금지\n- EC2에서 직접 빌드 후 git 동기화 안 하기 금지"
  },
  {
    "file": "feedback_deploy_safety.md",
    "idx": 5,
    "grade": "고정",
    "indexDesc": "\"배포해\"=deploy.sh + 배포환경 보호 + pm2 restart 금지",
    "name": "배포 안전 규칙 통합 — deploy.sh + 환경 보호",
    "description": "\"배포해\"=deploy.sh 사용, pm2 restart 금지, 배포 환경 보호 절대 규칙. DB 손상 사고 이력.",
    "type": "feedback",
    "body": "배포 중인 서버/빌드 결과물은 명시적 요청 없이 절대 건드리지 않는다.\n\n**Why:** 2026-04-08 PM2 반복 restart로 SQLite WAL 손상 → ai_studio DB 유실. 사용자 경고: \"배포돼서 잘 작동되고 있는 서버 날리면 쳐 죽인다.\"\n\n**How to apply:**\n\n### \"배포해\" 명령 시 절차\n1. 커밋 → git push\n2. SSH로 EC2 → `~/deploy.sh {앱이름}` 실행 (ai_studio / work_studio / aite-cbt)\n3. deploy.sh가 자동: DB 백업 → git pull → `pm2 reload`(graceful) → integrity check\n\n### 작업 전 필수 확인\n1. `git status` — 미커밋 변경 확인\n2. `git fetch && git rev-list` — 로컬↔리모트 동기화 상태\n3. EC2 SSH → `git log --oneline -1` + `pm2 list` — 배포 커밋 + 서비스 상태\n\n### 절대 금지 (명시적 요청 없이)\n- `pm2 restart` — 반드시 `pm2 reload` 또는 `deploy.sh`\n- `public/`, `dist/`, 빌드 결과물 수정/삭제/덮어쓰기\n- `npm run build` 후 기존 빌드 교체\n- `git push --force`\n- EC2에서 `git checkout`, `git reset`\n- 짧은 시간에 반복 배포 — 모아서 한 번에\n\n### 안전한 작업 (확인 없이 가능)\n- `src/` 소스 코드 수정 (빌드 안 하면 배포 무관)\n- `.gitignore` 추가, git remote 변경\n- 문서 갱신, `git pull` (로컬 동기화)"
  },
  {
    "file": "feedback_db_rules.md",
    "idx": 6,
    "grade": "고정",
    "indexDesc": "SQLite 안전(graceful shutdown) + 백업(6h+S3) + 신규 체크리스트",
    "name": "SQLite DB 안전 + 백업 규칙 통합",
    "description": "EC2 SQLite 안전 규칙 전체. graceful shutdown, pm2 reload, 백업 체계, 신규 프로젝트 추가 체크리스트.",
    "type": "feedback",
    "body": "EC2(54.116.15.136)에서 SQLite를 사용하는 모든 프로젝트에 적용.\n\n**Why:** 2026-04-08 ai_studio PM2 반복 restart로 WAL 손상 → DB 데이터 유실. work_studio도 WAL 3.7MB 미체크포인트 발견.\n\n**How to apply:**\n\n### 1. Graceful shutdown 필수\n```javascript\nprocess.on('SIGTERM', () => {\n  server.close(() => {\n    db.pragma('wal_checkpoint(TRUNCATE)');\n    db.close();\n    process.exit(0);\n  });\n  setTimeout(() => { db.close(); process.exit(1); }, 4500);\n});\n```\n새 서버 만들 때 이거 없으면 절대 배포 금지.\n\n### 2. PM2 규칙\n- `~/ecosystem.config.js`에 앱 등록 (kill_timeout: 5000)\n- `pm2 restart` **절대 금지** → `pm2 reload` 또는 `~/deploy.sh`\n- 짧은 시간에 반복 배포 금지 — 모아서 한 번에\n\n### 3. 백업 체계\n| 구분 | 경로 | 주기 |\n|------|------|------|\n| 로컬 | `~/db_backups/` | 6시간 cron, 14일 보관 |\n| S3 | `s3://work-studio-uploads/db-backups/` | 매일 03:00 |\n| 배포 시 | `~/deploy.sh`가 자동 백업 | 매 배포 |\n\n### 4. 현재 DB 목록\n| 프로젝트 | DB 경로 | journal |\n|----------|---------|---------|\n| ai_studio | `~/ai_studio/server/db/hutechc.db` | WAL |\n| work_studio | `~/work_studio/work_studio.db` | WAL |\n| AITe_CBT | `~/AITe_CBT/prisma/prod.db` | delete |\n\n### 5. EC2 스크립트\n- `~/backup_dbs.sh` — sqlite3 .backup (안전 복사)\n- `~/sync_backups_s3.sh` — S3 업로드\n- `~/deploy.sh <app>` — 백업 → pull → pm2 reload → integrity check\n- `~/ecosystem.config.js` — PM2 통합 설정\n\n### 6. 신규 프로젝트 추가 시\n1. `~/backup_dbs.sh`에 DB 경로 추가\n2. `~/ecosystem.config.js`에 앱 등록\n3. `~/deploy.sh`에 case 추가\n4. 서버 코드에 graceful shutdown 구현\n5. S3 복원: `aws s3 cp s3://work-studio-uploads/db-backups/{파일} {DB경로}`"
  },
  {
    "file": "feedback_ui_rules.md",
    "idx": 7,
    "grade": "고정",
    "indexDesc": "CRUD+펼치기(전체+항목별)+칩(멀티원형/싱글네모)+비고+열관리+UX방향",
    "name": "UI 필수 기능 규칙 통합",
    "description": "모든 페이지/테이블/그리드에 적용되는 UI 필수 기능. CRUD+펼치기+필터+인라인편집+칩+비고+열관리.",
    "type": "feedback",
    "body": "모든 관리 페이지, 테이블, 그리드에 아래 기능이 **전부** 있어야 한다.\n\n**Why:** 대표님이 \"한 눈에 모든 정보를 빠르게 확인하고 즉시 수정\"할 수 있어야 함. 누누히 강조된 핵심 요구사항.\n\n**How to apply:**\n\n### 1. CRUD 항상 가능\n- 모든 목록 항목에 편집(수정) + 삭제 버튼\n- 추가 버튼은 항상 보이게\n- 삭제 시 반드시 `confirm('정말 삭제하시겠습니까?')` — 확인 없이 삭제 금지\n\n### 2. 펼치기/접기 (전체 + 항목별 둘 다 필수)\n- **전체 펼치기/접기**: 상단에 토글 버튼 — 모든 행을 한 번에 펼치거나 접기\n- **항목별 펼치기/접기**: 각 행 클릭 → 해당 행만 상세 정보 펼침/접기\n- 둘 다 있어야 함 — \"전체\"만 있고 \"항목별\"이 없으면 안 됨\n- 기본적으로 최대한 많이 보여주기 — 정보가 숨겨져 있으면 안 됨\n- 펼친 상태에서 바로 편집/삭제 가능\n\n### 3. 칩 필터 — 멀티/싱글 구분 필수\n구현 전에 각 칩이 멀티선택인지 싱글선택인지 **반드시 판단**하고 시작할 것.\n\n- **멀티선택 칩** → `rounded-full` (원형/pill) — 여러 개 동시 선택 가능\n  - 예: 분류 필터, 태그 필터, 열 선택\n- **싱글선택 칩** → `rounded-md` (네모형) — 하나만 선택 (라디오 동작)\n  - 예: 정렬 기준, 뷰 모드 전환, 탭\n- 드롭다운 금지 (feedback_no_dropdown.md)\n- 실시간 반영\n\n### 4. 칩(태그) CRUD\n- 칩 목록 끝에 항상 \"+추가\" 버튼\n- +추가 → 인라인 input (Enter 확정, Esc 취소)\n- 사용자 추가 항목은 X 버튼 삭제 가능, 기본값은 삭제 불가\n- localStorage에 저장\n\n### 5. 비고(note) — 항상 **마지막 열**, 텍스트+파일 둘 다 가능\n- **모든 표/그리드의 마지막 열은 반드시 \"비고\"**. 작업 버튼·체크박스·기타는 그 앞 칸으로 밀어내야 함.\n- 비고 셀은 **텍스트 입력 + 파일 첨부** 둘 다 인라인으로 가능해야 함.\n  - 텍스트: contenteditable 또는 input — blur 시 자동 저장, 별도 모달 금지\n  - 파일: 📎 버튼 → 파일 선택 → presigned URL 업로드 → 파일명 칩으로 표시, 클릭 시 다운로드, × 버튼으로 제거\n- 저장 스키마: row 데이터에 `_notes` (string) + `_notesFiles` (array of `{name, url}`) 둘 다 병합.\n- 한 셀에 텍스트와 파일이 공존해야 하며, 같은 행 안에서 즉시 편집·첨부·삭제 모두 가능.\n\n### 6. 열 동적 관리\n- 테이블 상단에 \"열 선택\" 칩/토글 제공\n- 선택된 열만 렌더링 (gridTemplateColumns 동적 변경)\n- 필터 off → 해당 칼럼 숨김, on → 칼럼 추가\n\n### 7. 검색 필수\n- 모든 페이지에 검색 기능 필수\n- 키워드 검색 → 실시간 필터링\n\n### 8. UX 선호 방향\n- **한 줄형 선호** — 좁고 빡센 입력칸 지양, 한 줄씩 펼쳐 바로 쓰는 구조\n- **과한 화려함 지양** — 달력/스케줄도 실용 중심, 단순하게\n- **상태 가시성** — 고정/준고정 상태가 화면에서 바로 보이게\n- **대·중·소 확장형** — 대분류 열면 중분류, 중분류 열면 소분류 보이는 구조\n- **페이지 분리 허용** — 한 화면에 다 못 넣으면 분리하되 연결 구조 유지\n\n### 9. 표 셀/헤더 클릭 인터랙션 (기본)\n- **셀 값 클릭 → 즉시 해당 값으로 필터** (drill-down). 예: 사이트 칩 클릭 → 그 사이트만, 역할 칩 클릭 → 그 역할만. 같은 값 재클릭하면 필터 해제.\n- **헤더 클릭 → 정렬 토글** (asc ↔ desc). 현재 정렬 열은 ▲/▼ 화살표로 표시.\n- 기본 정렬 = **접수일 desc (최신 우선)**.\n- 이 둘은 별도 요청 없이도 **모든 데이터 테이블의 기본 기능**. 구현 안 돼 있으면 잘못된 것.\n\n### 10. 시간 컬럼은 첫 열\n- 데이터 테이블에 **접수일/생성일/수정일 등 시간 컬럼이 있으면 항상 가장 왼쪽 첫 열**.\n- \"언제 들어왔는가\"가 우선 스캔 포인트. 뒤쪽에 박아두면 안 됨.\n- 시간 표기는 컴팩트하게 (예: `04/13 15:32`). 연도는 올해면 생략."
  },
  {
    "file": "feedback_compact_ui.md",
    "idx": 8,
    "grade": "고정",
    "indexDesc": "UI 무조건 컴팩트 — p-1~2, text-xs, gap-1~2, 빽빽하게",
    "name": "UI 무조건 컴팩트 — 여백/폰트/패딩 최소화",
    "description": "모든 페이지 UI는 빽빽하게, 여백·폰트·패딩 최소화, 한 화면에 최대 정보, 스크롤 최소화",
    "type": "feedback",
    "body": "모든 UI를 무조건 컴팩트하게 구현해야 한다. 한 눈에 들어오게, 스크롤 최대한 안 하게.\n\n**Why:** 사용자가 반복적으로 \"여백 넓다\", \"폰트 크다\", \"카드 여백 줜나게 넓다\"고 지적. 정보 밀도를 최대화하고 불필요한 공간 낭비를 극도로 싫어함.\n\n**How to apply:**\n- 패딩: `p-1` ~ `p-2` 수준. `p-3` 이상은 헤더/최외곽만. `p-4` 이상 금지\n- 폰트: 본문 `text-xs`(12px) 기본, 제목 `text-sm`(14px), `text-base` 이상은 페이지 타이틀만\n- gap: `gap-1` ~ `gap-2`. `gap-3` 이상 자제\n- 테이블 행: `py-1` ~ `py-1.5`. `py-2` 이상 금지\n- 카드: 내부 패딩 최소. 둥근 모서리 `rounded-lg` 정도. 과도한 shadow 자제\n- 요약 카드/통계: 가로로 한 줄에 최대한 압축\n- 줄바꿈: 불필요한 줄바꿈 금지. 한 줄에 넣을 수 있으면 한 줄에\n- 전체 원칙: \"빽빽하게, 한 화면에 최대 정보량\""
  },
  {
    "file": "feedback_no_dropdown.md",
    "idx": 9,
    "grade": "고정",
    "indexDesc": "드롭다운 금지 → 인라인 버튼/칩/리스트",
    "name": "드롭다운 사용 최소화",
    "description": "UI에서 select/dropdown 대신 인라인 버튼이나 리스트로 옵션 열거 선호",
    "type": "feedback",
    "body": "드롭다운(select) 사용 최소화. 옵션은 쭉 열거하는 방식(인라인 버튼, 리스트)을 선호함.\n\n**Why:** 사용자가 명시적으로 \"드롭다운은 최대한 활용하지마. 쭉 열거하는 걸 선호해\"라고 지시.\n\n**How to apply:** UI 구현 시 select/dropdown 대신 버튼 그룹, 인라인 태그, 칩 등으로 옵션 나열."
  },
  {
    "file": "feedback_api_ec2.md",
    "idx": 10,
    "grade": "고정",
    "indexDesc": "API는 항상 EC2(54.116.15.136)로, localhost 금지",
    "name": "API 접속은 항상 EC2로",
    "description": "localhost 대신 항상 EC2(54.116.15.136) 주소로 API 호출해야 함. ai_studio=포트81.",
    "type": "feedback",
    "body": "API 호출 시 localhost:3000이 아니라 항상 EC2 서버(54.116.15.136)로 접속할 것.\n- ai_studio: http://54.116.15.136:81/api/...\n- work_studio: http://54.116.15.136:80/api/...\n\n**Why:** 서버는 EC2에서 PM2로 항상 돌고 있음. 로컬에서 서버를 띄우지 않으므로 localhost는 접속 불가.\n**How to apply:** curl, fetch 등 API 호출 시 무조건 EC2 IP+포트 사용. reference_infra.md에서 포트 매핑 참조."
  },
  {
    "file": "feedback_prompt_rules.md",
    "idx": 11,
    "grade": "준고정",
    "indexDesc": "설계 디테일, 풀구현→삭제, 답변 끝 표, 프롬프트 기록/노하우화",
    "name": "프롬프트 작성 및 답변 규칙",
    "description": "사용자의 프롬프트 작성 원칙과 답변 형식 요구사항. 설계 디테일, 기능 풀구현, 표 필수 등.",
    "type": "feedback",
    "body": "사용자가 정한 프롬프트/답변 규칙:\n\n**1. 설계** — 처음부터 디테일하게. 대충 시작하지 말 것.\n\n**2. 기능 구현** — 기능을 최대한 다 붙여넣고, 피드백 받아서 '삭제'하는 방식. 부족한 것보다 넘치는 게 나음.\n\n**3. 목표 설정** — 항상 구체적인 목표를 명시.\n\n**4. 주요사항** — 항상 메인(주인공)과 서브(조연)를 구분해서 알려주기.\n\n**5. 금지사항** — 하지 말아야 할 것을 명시 필수.\n\n**6. 규정 설정** — 모델에게 규정을 먼저 학습시키기. 별표 처리한 규정은 절대 잊지 말 것 (claude code에서는 메모리로 관리).\n\n**7. 답변 형식:**\n- 주제별로 모아서 숫자로 나열\n- 답변 마지막에는 **무조건 표 하나** — 최대한 많은 데이터를 컴팩트하게 압축\n- A/B/C안 중 추천 + 사유 포함\n\n**Why:** 사용자가 한눈에 파악하고 빠르게 결정할 수 있도록.\n\n**How to apply:** 기획/설계/구현 작업 시 위 원칙 적용. 특히 답변 끝에 요약 표를 빠뜨리지 말 것."
  },
  {
    "file": "feedback_read_4_files.md",
    "idx": 12,
    "grade": "선택",
    "indexDesc": "\"i\" 입력 → 4개 핵심 문서 즉시 읽기 (세션 시작 시)",
    "name": "대화 시작 시 4개 핵심 문서 읽기",
    "description": "사용자가 \"i\"라고만 입력하면 4개 핵심 문서를 자동으로 읽고 \"준비 완료\" 응답",
    "type": "feedback",
    "body": "사용자가 **\"i\"** 라고만 입력하면 → 즉시 아래 4개 파일을 Read로 읽고 시작할 것.\n\n1. `/home/hutechc/_info_all.md` — 시스템 구조, 5축 분류표, 모듈/플러그인, DB 20개 테이블\n2. `/home/hutechc/_info_외부인사_상세프로파일.md` — 외부인사 42유형, 규정, 보수, AI도구 매핑 (큰 파일→분할 읽기)\n3. `/home/hutechc/_URL.md` — 서비스 URL(EC2, 포트, GitHub Pages, 신청폼)\n4. `/home/hutechc/_apply.md` — 신청서 모듈화(3대상 x 15모듈), 콘텐츠 4타입 통합\n\n**Why:** 이 4개 문서가 프로젝트의 전체 컨텍스트. 읽지 않으면 잘못된 판단을 하게 됨.\n\n**How to apply:** \"i\" 입력 → 질문 없이 바로 4개 파일 Read (병렬) → 완료 후 \"준비 완료. 무엇을 할까요?\" 로 응답. 다른 해석하지 말 것."
  },
  {
    "file": "feedback_task_summary.md",
    "idx": 13,
    "grade": "선택",
    "indexDesc": "\"t숫자\" → ~/_task{n}.md에 표 저장 (요청 시)",
    "name": "작업 내역 저장 규칙 (ta / t숫자 / tt / tw)",
    "description": "\"ta\" → ~/_task_all.md 통합 업데이트, \"t숫자\" → 세션 작업 추가, \"tt\" → todo, \"tw\" → want. 시간·URL 필수.",
    "type": "feedback",
    "body": "### \"t숫자\" 입력 시 (**날짜별 디렉토리 + 개별 파일**)\n`~/_tasks/{YYMMDD}/T{n}_{task_title}.md` 경로에 해당 T# 작업 내역을 기록/갱신한다. 각 T#는 자기 파일에 독립 저장. **장황 금지, 간결 요약(2~5줄)**.\n\n#### 📐 모범 양식 (2026-04-15 확정 — 반드시 이 구조)\n\n```markdown\n## [~T{n}](notion_url): {제목}\n\n**pwd**: `/절대/경로`\n**상태**: 시작 전 | 진행 중 | 검토중 | 피드백 | 보류 | 완료\n**작성자**: 민혁\n\n### 요약 (1행)\n\n| T# | 시각 | 프로젝트 | 제목 | 핵심 변경 |\n|----|------|----------|------|-----------|\n| [~T{n}](notion_url) | HH:MM~HH:MM | [proj](url) | 제목 | 한 줄 요약 |\n\n### 작업 내역\n\n- `HH:MM` 추가: `file` — 내용\n- `HH:MM` 수정: `file` — 내용 (2~5줄, 간결)\n\n### 피드백/보류\n\n- (없으면 `(없음)`)\n```\n\n- 섹션 4개 고정: **헤더 → 요약(1행) 표 → 작업 내역 → 피드백/보류**\n- Notion 페이지 미생성 시 URL은 빈 `()`로 두고 생성 후 즉시 링크\n- 시작 시각만 있고 종료 미정이면 `10:04~` 형식\n\n#### 🔄 커밋 연동 필수 (2026-04-15 확정)\n- **git commit이 발생할 때마다** 해당 T# 문서(`~/_tasks/{YYMMDD}/T{n}_*.md`)를 즉시 갱신\n- 반영 위치: **작업 내역** 섹션 (필요 시 **요약 1행 표의 핵심 변경**도 갱신)\n- **커밋 → 문서 갱신은 한 쌍**. 커밋만 하고 T# 문서 미갱신 금지\n- 여러 T#에 걸친 커밋이면 해당되는 모든 T# 문서에 각각 반영\n\n#### 🕒 각 작업 내역 줄에 시각 명시 필수 (2026-04-15 확정)\n**T{n} 개별 파일의 `작업 내역` 섹션 모든 bullet에 해당 작업(또는 커밋) 시각 기록.**\n\n- 형식: `` `HH:MM` `` (백틱 감싼 24시간제) — bullet **맨 앞**, 라벨 직전\n- 예: `` - `10:04` 추가: `TextbookView.tsx` — 교재 10권 렌더 ``\n- **시각 근거** (feedback_no_future_time.md 준수 — 검증 가능한 값만):\n  1. **커밋 동반** → `git log --format='%ai' -1 <commit>` 의 시각\n  2. **비커밋 작업** (문서 편집·배포 트리거·설정 변경 등) → 작업 시점에 `date '+%H:%M'` 실행 값\n  3. **파일 mtime** → `stat <file> | grep Modify` (외부 입수 변경분)\n- **미래 시각·추정·분배 금지** — 모르면 빈칸 또는 `--:--`. 지어내면 즉시 롤백\n- **총괄 요약표 시각과 구분**: 요약표는 세션 시작~종료 범위, 작업 내역은 **bullet 단위 개별 시각**\n- **커밋 연동과 짝** — 커밋 후 T{n} 파일에 bullet 추가 시 반드시 커밋 시각 기재\n\n#### ✍️ 작업 내역 기록 스타일 — 키워드 나열 (2026-04-15 확정)\n**가독성 최우선. 문장 금지, 키워드 중심.**\n\n- **한 줄 = 한 변경**, 짧은 키워드·명사구 위주\n- 파일명/컴포넌트/함수명/수치 강조 (백틱·볼드 활용)\n- 접두 라벨로 분류: `추가` · `수정` · `삭제` · `리팩터` · `버그픽스` · `배포` · `문서`\n- 긴 설명문·서술체·\"~했습니다\" 금지 → 명사형 종결\n- 해시 나열 금지 (본문 1~2개 literal 언급까지만)\n\n**예시 (좋음):**\n```\n- `10:04` 추가: `TextbookView.tsx` — 교재 10권 렌더, lazy-split 307KB\n- `10:22` 수정: `use-curriculum.ts` — `loadFromAPI` 분기 + 캐시 TTL 5분\n- `10:47` 버그픽스: 문제은행 대/중/소 파싱 50→149 (엑셀 literal)\n- `11:03` 배포: work_studio lazy-split, 메인 번들 −56%\n```\n\n**예시 (나쁨):**\n```\n- TextbookView.tsx 파일을 새로 만들어서 교재 10권을 렌더링하도록 구현했습니다  ← 서술체·시각없음\n- 10:00~10:30 추가/수정/배포 한꺼번에                                           ← 개별 시각 없음·묶음 나열\n- `12:45` 배포 완료 (현재 시각 10:30)                                           ← 미래 시각\n```\n\n**날짜 해석 규칙:**\n- `t3` (날짜 미지정) → **오늘 날짜 폴더**(`date +%y%m%d`)에서 `T3*.md` 파일 탐색·편집\n- `t3 260414` → **지정 날짜 폴더** `~/_tasks/260414/T3*.md` 탐색·편집\n- 기존 T# 파일이 있으면 열어서 갱신, 없으면 새로 생성 (`{title}` 부분은 사용자 요청/세션 맥락에서 판단)\n\n**파일명·경로 규칙:**\n- 예: `~/_tasks/260414/T0_업무_및_피드백_정리.md`, `~/_tasks/260414/T7_Work_Studio_신청서_규정_접수현황_전면_개선.md`\n- YYMMDD는 `date +%y%m%d` (예: 2026-04-14 → `260414`)\n- 파일명의 제목 부분: 공백 → `_`, 슬래시/콜론 등 특수문자 제거 또는 치환\n- 디렉토리 미존재 시 `mkdir -p` 선행\n- **📍 헤더 밑 PWD 필수** — 첫 줄 헤더(`## [~T{n}](url): title`) 바로 다음에 빈 줄 + `**pwd**: \\`<claude code가 실행된 절대 경로>\\`` 기록. 세션 재현·컨텍스트 파악용. 각 세션 시작 시점의 pwd를 고정해 기록 (도중 `cd`로 이동해도 원래 launch 경로 사용)\n- **🚦 상태 필수 (두 곳)** — Notion nt DB의 `상태` 값(완료/진행 중/검토중/피드백/보류/시작 전 등)을 항상 반영:\n  1. **총괄 요약표 `상태` 열 필수** — `_task_all_{YYMMDD}.md` 총괄 요약표의 **T# 열 이전**에 `상태` 열을 배치. 컬럼 순서: `상태 | T# | 시각 | 구분 | 프로젝트 | 제목 | 핵심 변경`\n  2. **각 T# 개별 파일 헤더 밑 상태 필수** — `_tasks/{YYMMDD}/T{n}_*.md` 파일의 헤더(`## [~T{n}](url): title`) 다음에 `**pwd**: \\`...\\`` + `**상태**: <완료/진행 중/검토중/피드백/보류/시작 전>` 함께 기록\n  - nt DB 상태가 ground truth. ta는 nt 상태를 그대로 반영(수동 수정 금지, 반드시 nt에서 복사)\n\n### \"t숫자u\" 입력 시 (**Notion nt 페이지 업데이트**)\n`t{n}u` → **오늘** 진행한 T{n} 작업을 Notion '민혁_업무별 정리' DB(nt)에서 찾아 페이지 내용 업데이트.\n- DB URL: https://www.notion.so/fa8bf898e9704e469382f2cfa0cafa1e?v=573b5aca35714da5a888ebf70cb2a63e\n- 절차:\n  1. `~/_tasks/{오늘_YYMMDD}/T{n}_*.md` 개별 파일 읽어 최신 작업 내역 확보\n  2. nt DB에서 해당 T# 페이지 검색 (중복 생성 방지 — 반드시 기존 행 먼저 확인)\n  3. 기존 페이지 발견 시 `notion-update-page`로 properties + content 갱신 (전면 교체 금지, 원문 보존)\n  4. 본문은 **키워드 나열 스타일** 준수 (접두 라벨 + 명사형, 서술체/해시 나열 금지)\n- 예: `t1u` → 오늘 T1 작업을 nt에서 찾아 업데이트\n- `t1u 260414` 같이 날짜 지정 시 해당 날짜 폴더의 T{n} 기준\n\n### \"ta\" 입력 시 (**총괄 요약표만 취합**)\n`~/_tasks/{YYMMDD}/T*.md` 개별 파일들을 참조해서 `~/_tasks/{YYMMDD}/_task_all_{YYMMDD}.md` 에 **총괄 요약표만** 생성/갱신한다. **상세 섹션은 포함하지 않음** — 상세 내용은 개별 `T{n}_*.md` 파일에만 유지 (단일 진실 원천). `_task_all_{YYMMDD}.md` 는 오직 요약표 용도.\n- `ta` → 오늘 날짜 폴더 취합\n- `ta 260414` → 해당 날짜 폴더 취합\n\n> ⚠️ 이전 규정 반전 이력:\n> - 1차 (2026-04-14): \"개별 파일 금지, `_task_all.md` 1개 통합\" → \"`~/_task_t{n}.md` 개별 파일\"\n> - 2차 (2026-04-14 오후): \"`~/_task_t{n}.md` 루트 평평\" → \"`~/_tasks/{YYMMDD}/T{n}_{title}.md` 날짜별 디렉토리\"\n\n### \"tt\" 입력 시\n`~/_task_todo.md`를 업데이트한다 (미완성 업무 정리). 구분 열(필수/선택/대기) 필수.\n\n### \"tw\" 입력 시\n`~/_task_want.md`를 업데이트한다 (하고싶은 업무 정리).\n\n### \"tlm\" 입력 시\n`tl` + `tm` 동시 실행. _task_all.md + _task_todo.md 기반으로 업무일지 + 페이지 메모 일괄 업데이트.\n\n### \"tl\" 입력 시 (task → log)\n_task_all.md(오늘 완료 작업) + _task_todo.md(미완성) 기반으로 **업무일지** 업데이트.\n- 현재 직원(localStorage `current-employee-id`)의 오늘 날짜 로그에 반영\n- 완료 작업 → 업무일지 완료 항목, 미완성 → 진행중/대기 항목\n- API: POST `/api/work-logs`\n\n### \"tm\" 입력 시 (task → memo)\n_task_all.md + _task_todo.md + _task_want.md 기반으로 **페이지별 메모** 업데이트.\n- 각 태스크의 관련 페이지를 판단하여 해당 페이지에 메모 추가\n- 예: 커리 개선 → /instructor-curri 메모, 업무보드 필터 → /work-hub-a 메모\n- API: POST `/api/page-memos`\n- 카테고리: 완료=메모, 미완성=요청, 하고싶은=개선\n\n**Why:** 세션별 작업 내역을 하나의 파일에서 관리. 개별 파일 난립 방지.\n\n**How to apply:**\n\n### _task_all.md 포맷 (반드시 준수)\n\n```\n# 전체 작업 내역 (날짜)\n\n## 총괄 요약\n\n| 한 줄 요약 (최대한 압축)\n\n| T# | 시각 | 프로젝트 | 제목 | 핵심 변경 |\n|----|------|----------|------|-----------|\n| 1 | 09:30 | [ai_studio](http://54.116.15.136:81/app/) | 제목 | 핵심 변경 1줄 |\n\n---\n\n## T1: 제목\n\n| # | 시각 | 프로젝트 | 페이지 | 작업 | 내용 |\n|---|------|----------|--------|------|------|\n| 1 | 09:30 | [ai_studio](url) | [페이지명](url) | 대상 | 변경 내용 |\n```\n\n### 열 규칙\n- **총괄 요약 표**: T#, 시각, 프로젝트(+URL 하이퍼링크), 제목, 핵심 변경 — 5열\n- **총괄 요약 헤더 바로 밑**: 한 줄 요약 (최대한 압축, `|`로 구분)\n- **상세 표**: #, 시각, 프로젝트(+URL), 페이지(+URL), 작업, 내용 — 6열\n- **시각**: HH:MM (git 커밋 시간 활용, 모르면 공란)\n- **프로젝트 URL**: `[ai_studio](http://54.116.15.136:81/app/)`, `[work_studio](http://54.116.15.136/)`\n- **페이지 URL**: `[페이지명](http://54.116.15.136:81/app/{path})`\n\n### 기타 규칙\n- work_studio 태스크 제목에 `[work_studio]` 접두사\n- 번호는 순서대로 (빈 번호 없이)\n- 기존 내용 유지하고 아래에 추가 (덮어쓰기 금지)\n- git 커밋 시 `git add -A` 금지 — 해당 세션 파일만 개별 add\n- **작성자 필수** — 모든 task 파일(ta/tt/tw/tlm/tl/tm)에 작성자 명시. 현재 사용자: **민혁**\n- **시간순 배열** — T#과 상세 표의 # 모두 시각 기준 오름차순으로 기록\n- **시각 = 작업 시작 시간** — 커밋 시간이 아니라 해당 작업을 시작한 시각 기준\n- **총괄 요약 시각**: 시작~종료 (예: 09:30~10:30). 상세 표 #은 시작 시각만\n- **🕒 현재 시각 필수 확인** — ta / Notion 업무별 정리 표 업데이트 전 반드시 `date` 명령으로 현재 시각 확인. 이전 태스크 종료 시각을 기준으로 추정 금지. 미래 시각 기재 금지. (2026-04-14 12:15 추정 사건 재발 방지)\n- **nt `시작`/`종료` 열에 `~` 금지** — Notion 업무별 정리 DB의 `시작`·`종료` 열에는 순수 시각만(`4.14 10:05`). \"진행중\" 의미로 `~` suffix 붙이지 말 것. 진행 상태는 `상태` 열(시작 전/진행 중/완료)이 담당함. `_task_all.md`의 시각 열과 다름.\n- **🚫 커밋 ID 별도 행/섹션 금지** — nt/ta 본문에 커밋 해시(`56d3efe`, `ca103f0` 등)를 표나 독립 섹션으로 나열하지 말 것. 필요하면 `git log`로 조회. 사용자가 \"쓸데없는 것을 자꾸 쳐넣는다\"고 지적. 본문 1~2개 간단 언급까지만 허용.\n- **📝 간결 요약 원칙** — nt 페이지 본문 업데이트 / ta 상세 작성 시 **작업 내역 2~5줄**, **피드백/보류 사항 2~5줄**만. 단계별 테이블·타임라인·비교표·파일 리스트 전면 금지. 사용자 왈 \"그걸 누가 본다고?\". 장황한 나열 절대 금지.\n- **🔗 T# 하이퍼링크 전면 필수** — T#가 표기되는 **모든 곳**에 해당 nt Notion 페이지 URL 하이퍼링크 필수. 형식: `[~T1](https://www.notion.so/<page_id_32자>)`. 적용 대상:\n  1. `_task_all.md` 총괄 요약 표의 T# 열\n  2. `_task_all.md` 상세 섹션 헤더 (`## ~T1:` → `## [~T1](url):`)\n  3. `_task_t{n}.md` 개별 파일 헤더 (첫 줄)\n  4. 기타 T#가 등장하는 표·목록·문서 전체\n  \n  신규 T# 추가 시마다 즉시 링크 연결. 개별 파일 분리 후에는 더더욱 필수 (개별 파일 간 점프 수단).\n- **메모리 변경 시 규정 페이지도 반드시 동시 업데이트** — 규정(임시_혁_test) data.ts에 항상 반영"
  },
  {
    "file": "reference_screenshots.md",
    "idx": 14,
    "grade": "선택",
    "indexDesc": "tsi{N} → ~/_tmp_screenshots/image copy {N}.png (이미지 확인 시)",
    "name": "Screenshot folder",
    "description": "All screenshots are saved to ~/_tmp_screenshots — use this path when user shares images",
    "type": "reference",
    "body": "모든 캡처 이미지는 `~/_tmp_screenshots`에 저장됨.\n\n**단축어:** `tsi{N}` = `~/_tmp_screenshots/image copy {N}.png`\n- 예: `tsi5` → `~/_tmp_screenshots/image copy 5.png`\n\n**How to apply:** 사용자가 `tsi숫자`를 언급하면 해당 경로의 이미지를 Read로 확인."
  },
  {
    "file": "feedback_worklog_timetable_multislot.md",
    "idx": 15,
    "grade": "고정",
    "indexDesc": "업무일지 타임테이블 드롭은 여러 슬롯 할당 + duration 보존",
    "name": "업무일지 타임테이블 드롭은 여러 슬롯 할당 필수",
    "description": "업무일지 task를 타임테이블에 드래그앤드랍 할 때, 여러 슬롯(블럭)에 걸쳐 할당할 수 있어야 한다. 1-slot으로 축소 금지.",
    "type": "feedback",
    "body": "업무일지(ai_studio `/work-log`)의 task를 타임테이블로 드래그앤드랍 할 때, task가 **여러 연속 슬롯**에 걸쳐 할당될 수 있어야 한다.\n\n**Why:** 2026-04-13 사용자가 \"타임테이블의 여러 블락에다가 할당할 수 있어야 한다고 했었던 기억이 있는데 또 잊었나보네\"라고 지적. 이전에 이미 논의된 사항. 2시간짜리 회의 같은 업무는 1칸이 아니라 2칸을 차지해야 정상.\n\n**How to apply:**\n\n### 1. Task duration 보존 [고정]\n드롭 시 `slotStart ~ slotEnd`(1칸 범위)로 task의 startTime/endTime을 덮어쓰면 안 됨.\n- task에 이미 startTime + endTime이 있으면 **duration 보존**: 새 startTime = drop slot start, 새 endTime = 새 startTime + (기존 endTime - 기존 startTime)\n- duration 없으면 기본 1-slot\n\n### 2. 드래그-범위 선택 [준고정]\n드래그 중 여러 슬롯 위를 지나가면, 최초 hover 슬롯 ~ 드롭 슬롯까지의 **연속 범위**가 task에 할당돼야 함.\n- useRef로 hoveredSlotIdxSet 추적 (dragenter에서 추가)\n- drop 시 min/max 슬롯의 start/end 사용\n- dragend / drop 후 set 초기화\n\n### 3. 렌더링은 이미 시간 겹침 기반 [고정]\n`allTasksFlat.filter(t => sStart >= tStart && sStart < tEnd)` 방식이라 task startTime~endTime이 여러 슬롯에 걸치면 자동으로 각 슬롯에 렌더링됨. 드롭 로직에서 범위만 제대로 저장하면 됨.\n\n### 4. 주의 — 드롭 핸들러 위치\n- `DailyDetail.tsx` 내 2개: classic view onDrop, mini 타임테이블 onDrop (viewMode !== 'classic')\n- 둘 다 동일하게 duration 보존 + range 선택 지원 필요"
  },
  {
    "file": "feedback_multicol_layout.md",
    "idx": 16,
    "grade": "고정",
    "indexDesc": "목록·카드·답안·문제는 2~4단 그리드 필수, 수직 1단 금지, CurriculumExpandView 스타일 일관성",
    "name": "레이아웃 다단(멀티컬럼) 우선 — 수직 1단 금지",
    "description": "목록·카드·답안·문제 등 반복 요소는 2~4단 그리드로 배치. 수직 1단 스택 금지. 정보 밀도 극대화.",
    "type": "feedback",
    "body": "목록·카드·표·답안·문제 등 **반복 요소는 반드시 다단 그리드**(2단/3단/4단 이상)로 배치한다.\n\n**Why:** 수직 1단으로 쌓으면 스크롤이 길어져 한 화면에 담기는 정보가 줄어든다. 사용자가 \"한 화면에 최대 정보\"를 반복해 강조했고(feedback_compact_ui.md와 연동), 기존 `CurriculumExpandView`는 이미 `grid grid-cols-2`로 구축되어 있다. 새로 만드는 뷰가 1단이면 일관성이 깨지고 \"왜 단이 다르냐\"는 지적을 받는다.\n\n**How to apply:**\n\n### 1. 기본 그리드 밀도\n| 항목 수 | 권장 그리드 | 예시 class |\n|---|---|---|\n| 12+ | 4단 | `grid grid-cols-4 gap-2` |\n| 6~12 | 3단 | `grid grid-cols-3 gap-2` |\n| 2~6 | 2단 | `grid grid-cols-2 gap-2` |\n| 소수·단일 | 1단 허용 | `space-y-1` |\n\n- 1단(`flex-col`, `space-y-`)은 **헤더/전체폭 상세 패널/단일 본문** 등 예외에만 허용\n- 답안/문제/카드/칩 목록은 무조건 다단\n\n### 2. 카드 내부 구조\n- 그리드에 올라가는 카드는 **헤더만 컴팩트 표시** (라벨/뱃지/아이콘)\n- 본문이 길면 클릭 시 펼치기 OR 그리드 하단 전체폭 상세 패널로 표시\n- 카드 내 텍스트는 `truncate` + 필요 시 툴팁\n\n### 3. 반응형/밀도 조정\n- `md:grid-cols-3 lg:grid-cols-4` 식으로 뷰포트에 맞춰 단 수 자동 조정\n- 사용자가 \"더 빽빽하게\" 원하면 `grid-cols-5` / `grid-cols-6`까지도 허용\n- `gap-1` ~ `gap-3` 범위 유지 (gap-4 이상 금지)\n\n### 4. 예외 (1단 허용)\n- 기사/장문 본문 렌더\n- 단계별 순서(Step1 → Step2 → Step3)\n- 전체폭 상세 패널(선택된 항목 상세)\n- 헤더/필터 바\n\n### 5. 기존 뷰 참고\n- `CurriculumExpandView` — 분야별 2단 + 내부 중첩\n- `DashboardOverview` — 섹션별 카드 그리드\n- `RegulationView` — 고정/준고정/선택 3열 그리드\n\n### 6. 새 뷰 만들 때 체크리스트\n- [ ] 반복 요소가 있으면 `grid-cols-N` 적용\n- [ ] `space-y-*`만으로 쌓지 않기\n- [ ] 기존 유사 뷰의 단 수와 일관성 확인\n- [ ] 밀도가 부족하면 단 수 늘리기 (2→3→4)"
  },
  {
    "file": "reference_notion_tables.md",
    "idx": 17,
    "grade": "참조",
    "indexDesc": "`nt`=민혁_업무별 정리 DB, `nd`=민혁_일자별 정리 DB (ta/nt 갱신 시 사용)",
    "name": "Notion 테이블 단축어 (nt / nd)",
    "description": "\"nt\" = 민혁_업무별 정리 DB, \"nd\" = 민혁_일자별 정리 DB. 사용자가 nt/nd로 지칭할 때 해당 Notion 데이터베이스를 가리킴. ta 업데이트 시 이 DB에 행 생성/수정.",
    "type": "reference",
    "body": "### nt — 민혁_업무별 정리 (업무 단위 DB)\n\n- **DB URL**: https://www.notion.so/fa8bf898e9704e469382f2cfa0cafa1e?v=573b5aca35714da5a888ebf70cb2a63e\n- **Database ID**: `fa8bf898e9704e469382f2cfa0cafa1e`\n- **Data source ID** (create/update 호출용): `7910ca57-4edf-4f1a-9d5d-37fe78d801ed`\n  - 전달 형식: `{\"type\": \"data_source_id\", \"data_source_id\": \"7910ca57-4edf-4f1a-9d5d-37fe78d801ed\"}`\n  - 또는 fetch: `collection://7910ca57-4edf-4f1a-9d5d-37fe78d801ed`\n- **⚠️ MCP 서버 필수**: `mcp__notion-company__*` 사용 (user 스코프 등록됨, 모든 경로에서 접근 가능). `mcp__claude_ai_Notion__*`은 계정 다름 → 404.\n- **스키마**:\n  - `업무명` (title)\n  - `대분류` select: 개발 / 사무 / 기획 / 강의\n  - `중분류` select: DB / UI_디자인 / 기획_설계 / API_서버 / 배포_인프라 / 테스트_QA / 문서_매뉴얼 / 산출물\n  - `소분류` multi_select: 사내 Studio / Work Studio / AI번역_AITe / ITT_정통번역 / TESOL / 고전번역_통독 / 대표님페이지 / 반도체_조선_방산 / 번역_메타트랜스 / 윤리 / 전문가매칭 / 전시회 / 프롬프트 / 휴텍씨 / 공통_플러그인 / 홈페이지들 (⚠️ `사내 Studio`·`Work Studio` 공백 포함)\n  - `상태` select: 시작 전 / 진행중 / 검토중 / 피드백 대기 / 완료 / 보류 (⚠️ `진행중` 공백 없음)\n  - `우선순위` select: 1. 중요+긴급 / 2. 중요+여유 / 3. 안 중요 + 긴급 / 4. 안 중요 + 안 긴급\n  - `시작`, `종료` (text)\n  - `비고` (text)\n  - `페이지 URL` (url)\n\n### nd — 민혁_일자별 정리 (일자 단위 DB)\n\n- **DB URL**: https://www.notion.so/10db208afde283a3aa6001106309ffde?v=e30b208afde283839bdf8805cd404c91\n- **Database ID**: `10db208afde283a3aa6001106309ffde`\n- **Data source ID**: `401b208a-fde2-82d4-a650-07623b580364`\n  - 전달 형식: `{\"type\": \"data_source_id\", \"data_source_id\": \"401b208a-fde2-82d4-a650-07623b580364\"}`\n  - 또는 fetch: `collection://401b208a-fde2-82d4-a650-07623b580364`\n- **스키마**: 최초 사용 시 `notion-fetch`로 스키마 확인 필요\n\n### 상위 페이지\n\n- 💼 민혁_업무일지: https://www.notion.so/8ecb208afde2835689b781b24a0cc50c — nt/nd 두 DB를 인라인으로 포함\n\n### 사용 규칙\n\n- 사용자가 \"nt 업데이트\", \"nt에 추가\", \"nd 갱신\" 등으로 말하면 위 DB에 직접 행 생성/수정\n- `ta` 명령 실행 시 `_task_all.md` + **nt** 양쪽 동기화가 기본\n- 행 생성 전 `date` 명령으로 현재 시각 확인 (feedback_task_summary.md 규칙 참조)\n\n### 🆘 nt/nd 업데이트 실패 시 트러블슈팅 (2026-04-15 확정)\n\n**증상**: `notion-fetch` / `notion-search` 호출 시 404 `object_not_found` 또는 `Could not find page with ID`.\n\n**원인·해결**:\n1. **MCP 서버가 `claude_ai_Notion`** → ❌ 이 서버는 다른 Notion 계정이라 nt/nd DB 접근 권한 없음. 반드시 **`notion-company`** 사용.\n2. **`notion-company`가 현 세션에 안 로드됨** → Claude Code는 세션 시작 cwd 기준으로 MCP 로드. 프로젝트 스코프로만 등록돼 있으면 다른 경로에서 실행 시 누락.\n   - 확인: `claude mcp list` → `notion-company` 있는지\n   - 해결: `claude mcp add --scope user --transport http notion-company https://mcp.notion.com/mcp` → **세션 재시작** 필수\n   - user 스코프 등록 후에는 모든 경로에서 상속됨\n3. **스키마 값 오타** (update-page 호출 실패 원인):\n   - 상태: `진행중` (공백 없음), `피드백 대기`, `시작 전`, `검토중`, `완료`, `보류`\n   - 대분류: `개발`·`사무`·`기획`·`강의`\n   - 소분류: `사내 Studio`·`Work Studio` (공백 포함, 언더스코어 아님)\n   - 메모리의 이전 표기(`진행 중`, `AI_Studio`, `Work_Studio`)와 다름 — 실제 DB 스키마가 정답\n4. **DB URL을 data_source URL처럼 쓰면 400**: search/query 시 `data_source_url`에는 반드시 `collection://7910ca57-4edf-4f1a-9d5d-37fe78d801ed` 형태. database URL(`fa8bf898...`)이나 `?v=...` 뷰 URL은 거부됨."
  },
  {
    "file": "feedback_no_stash.md",
    "idx": 18,
    "grade": "고정",
    "indexDesc": "git stash 절대 금지 — 병행 세션 충돌 방지, 대안: 개별 add / 보류 / worktree",
    "name": "git stash 절대 금지 — 병행 세션 충돌 방지",
    "description": "여러 Claude 세션이 동시에 같은 레포에서 작업하므로 git stash는 다른 세션의 WIP를 망친다. 절대 금지.",
    "type": "feedback",
    "body": "**git stash는 어떤 이유로도 사용 금지.**\n\n**Why:** hu-tec 환경은 여러 Claude 세션이 같은 로컬 레포(`~/_ALL_CODES/ai_studio`, `~/_ALL_CODES/work_studio` 등)에서 동시에 작업한다. git stash는 글로벌 stash 스택에 쌓이므로 다른 세션의 WIP를 덮어쓰거나, pop 시점에 다른 세션 변경과 충돌/유실을 일으킨다. 2026-04-14 T3 세션에서 실제로 발생: ExistingTab 배포를 위해 타 세션의 work-log WIP를 `git stash push -- <paths>` 로 격리했는데 pop 시 타 세션이 추가로 만진 파일까지 같이 내려오면서 상태가 오염됨.\n\n**How to apply:**\n\n### 절대 금지\n- `git stash push` (전체)\n- `git stash push -- <paths>` (특정 파일만)\n- `git stash push -u` (untracked 포함)\n- `git stash pop` / `git stash apply` — 스택 자체를 건드리지 않는다\n\n### 대안 — 타 세션의 dirty 상태가 빌드/배포를 가로막을 때\n1. **무시하고 진행** — 내 변경만 개별 `git add <my-files>` 로 스테이징, 타 세션 dirty는 워킹 트리에 그대로 두고 커밋\n2. **빌드가 깨진 경우**: 내 소스만 커밋하고 **배포는 보류** — 타 세션이 WIP를 정리할 때까지 기다리거나, 사용자에게 보고하여 결정 위임\n3. **public/app/ 빌드 산출물**: 타 세션 dirty가 포함된 빌드는 배포하지 말 것. 소스 커밋만 하고 사용자에게 상황 설명\n4. **작업 분리가 필요한 경우**: git worktree 사용 (별도 디렉토리) — stash는 아님\n\n### 일반 원칙\n- 다른 세션의 modified/untracked 파일은 **읽기 전용으로 취급**\n- 내 세션이 건드리지 않은 파일은 `git add` 에도 포함시키지 말 것\n- 커밋은 **반드시 파일명을 개별 지정** — `git add .` / `git add -A` / `git add <dir>` 도 금지\n- \"다른 세션 WIP가 내 작업 방해한다\" 라고 판단되면 **사용자에게 먼저 보고** — 자동으로 격리 시도하지 말 것"
  },
  {
    "file": "feedback_no_future_time.md",
    "idx": 19,
    "grade": "고정",
    "indexDesc": "작업 기록 시 시각은 검증 가능한 것만 (date/git/mtime). 모르면 빈칸. 분 단위 가짜 timeline·미래 시각 절대 금지",
    "name": "시간 기록 — 미래 시각 예측 절대 금지",
    "description": "ta/tl/tm/_task*.md 등 작업 기록 시 시각은 검증 가능한 것만 기재. 모르면 빈칸·\"미상\". 가짜 timeline 금지.",
    "type": "feedback",
    "body": "작업 기록(`ta`, `tl`, `tm`, `~/_task*.md`, 업무일지, 노션 DB 등)에 시각을 적을 때 **검증 가능한 시각만** 기재하고, 모르면 비워둔다. 절대로 그럴듯해 보이려고 시각을 지어내거나 미래 시각을 예측해 적지 않는다.\n\n**Why:** 사용자가 명시 지적 — \"ta 기록할 때, 절대로 미래 시간을 예측해서 작성하지 마\". 이전에 T2 기록할 때 11:30, 11:35, 11:38, 11:42, ... 12:25, 12:32, 12:48 같은 분 단위 timeline을 전부 지어냈는데, 실제 시각은 11:52였다. 11:55 이후는 전부 미래였고, 그 이전 시각도 검증 불가능한 fabrication이었다. 가짜 timeline은 신뢰를 깎고 메모리·업무일지·노션 DB 모두 오염시킨다.\n\n**How to apply:**\n\n### 1. 검증 가능한 시각의 정의\n- **`date` 명령으로 직접 읽은 현재 시각** — 기록 시점 timestamp로 OK\n- **git log / git show의 commit 시각** — `Date: Tue Apr 14 11:38:22 2026`\n- **파일 mtime** — `stat <file> | grep Modify`\n- **사용자가 명시한 시각** — \"11:30에 시작\" 같이 직접 말한 경우\n- **빌드 산출물 시각** — `dist/index.html` mtime\n\n### 2. 검증 불가능한 시각 처리\n- 개별 step 시각을 모르면 → **빈칸** (`|  |`) 또는 `—`\n- 세션 전체 범위만 알면 → `~HH:MM` (대략) 또는 `시작 미상~HH:MM(현재)`\n- 추정·예측·\"그럴듯한 분 단위 분배\" 금지\n\n### 3. ta 기록 시 표준 절차\n1. 기록 시작 전 `date '+%H:%M:%S'` 한 번 실행해서 현재 시각 확보\n2. 사용자가 시작 시각을 말했으면 그것 사용, 아니면 \"시작 미상\"\n3. 종료 시각은 `date` 출력 사용 — \"현재\"라고 명시\n4. 분 단위 step별 시각은 **기록하지 않는다** — 잘 모르면 시각 컬럼을 통째로 비우거나 삭제\n\n### 4. 표 구조 권장\n| 형태 | 예시 |\n|---|---|\n| 좋음 | `시각: ~11:52(기록 시점) · 시작 미상` |\n| 좋음 | `시각: 11:38(commit) ~ 11:52(기록)` |\n| 좋음 | (시각 컬럼 자체 생략) |\n| 나쁨 | `11:30 / 11:35 / 11:38 / 11:42 ...` (분 단위 fabrication) |\n| 나쁨 | `12:25, 12:32, 12:48` (현재 시각보다 미래) |\n\n### 5. 자가 점검 체크리스트\n- 표에 적은 시각을 **로그/git/mtime 어디서 봤는지** 한 줄로 답할 수 있는가?\n- 답할 수 없으면 → 빈칸 처리\n- 표 안에 `date` 출력 시각보다 늦은 시각이 있는가?\n- 있으면 → 즉시 삭제 (미래 예측 금지)"
  },
  {
    "file": "feedback_no_delete.md",
    "idx": 20,
    "grade": "고정",
    "indexDesc": "모범 샘플 섹션 절대 삭제 금지 — 다른 모드도 동일 셸 유지, 추가만. `mode === X && (...)` 숨김 금지",
    "name": "추가는 OK, 삭제는 금지 — 모범 샘플 보존 원칙",
    "description": "사용자가 모범 샘플로 지정한 컴포넌트/섹션은 절대 삭제·숨김 금지. 다른 모드에서도 동일 구조 유지하고 추가만.",
    "type": "feedback",
    "body": "사용자가 \"모범 샘플\"로 지정한 화면(예: 커리큘럼 데이터 현황)은 **다른 모드에서도 그대로 유지**한다. 새 모드에 맞게 뭔가 더 필요하면 **추가**만 한다. 절대로 기존 섹션을 삭제하거나 `mode === X && (...)`로 숨기지 않는다.\n\n**Why:** 사용자 명시 지적 — \"커리큘럼 데이터 현황이 모범 샘플이었는데 왜 니 맘대로 샘플과 다르게 막 추가 구현했어...? 필요가 있었던 일이야? 추가는 괜찮지만 삭제는 하지마.\" 나는 T2-B에서 비커리 모드에서 ZONE B/C(마스터 분류체계·급수·키워드·단원 상세)를 `mode === \"curriculum\" && (...)`로 감싸 숨겼다. 사용자는 그게 임의 삭제로 봤고, 모범 샘플의 일관성을 깨뜨린 것으로 평가. 모드별 차이는 추가 zone으로 해결하고, 공통 셸은 모드 무관 항상 렌더해야 한다.\n\n**How to apply:**\n\n### 1. \"모범 샘플\" 기준\n- 사용자가 명시적으로 지목한 컴포넌트/탭/뷰 (예: 커리큘럼 DashboardOverview)\n- 가장 먼저 풀스택으로 구현됐고 가장 많이 다듬어진 것\n- 다른 모드(문제은행/교재/...)는 이를 베이스로 확장된 것\n\n### 2. 절대 금지 행위\n- `mode === \"X\" && <섹션>` 으로 다른 모드에서 렌더 차단\n- 다른 모드 진입 시 일부 zone/카드/표를 빈 셸로 대체\n- \"이 섹션은 X 모드와 무관하니 숨김\" 같은 자체 판단\n\n### 3. 허용 행위\n- 새 zone/카드/표를 **추가** (위치는 기존 흐름 사이에 끼워넣거나 끝에 append)\n- 라벨만 모드별로 변경 (예: \"커리큘럼 단\" → `${MODE_SHORT[mode]} 단`)\n- 데이터 소스 확장 (예: savedList + ANSWER_BANK 시드 합산)\n- 모드별 추가 zone(`QuestionsAuditZone`, `TextbookSummaryZone` 등)\n\n### 4. 모드별 차이가 필요하면\n- 데이터가 비어 있어도 0값 숫자표로 렌더 (셀은 비우지 말 것)\n- 시드 데이터를 보유한 모드는 시드까지 카운트해 매트릭스를 채움\n- 추가 정보가 필요한 모드는 새 zone을 append (기존 zone 제거 X)\n\n### 5. 자가 점검 체크리스트\n- 새 모드 진입 시 사용자가 보던 섹션이 **하나라도 사라졌는가** → 잘못된 구현\n- \"이건 다른 모드라서 안 보여줘도 되겠지\" 판단 → 금지\n- 의심되면 **무조건 렌더하고 데이터만 0/빈값으로 표시**\n\n### 6. 적용 이력\n- 2026-04-14 T2-B: 비커리 모드에서 ZONE B/C 숨김 → 사용자 지적 → T2-D에서 복구 + 본 메모리 등재"
  },
  {
    "file": "feedback_no_fake_data.md",
    "idx": 21,
    "grade": "🚨최고정🚨",
    "indexDesc": "**🚨 더미/가짜 데이터 절대 금지. \"더미로 채워\" 명시 없이는 무조건 '실제' 데이터만. 원본에 없는 필드는 빈 값. 추측/휴리스틱/의미 축 변환 금지. 어기면 세션 중단+전량 롤백. 🚨**",
    "name": "🚨 더미/가짜 데이터 절대 금지 — 무조건 '실제' 데이터만",
    "description": "사용자가 명시적으로 \"더미로 채워\"라고 하지 않는 이상, 절대로 임의 값/플레이스홀더/추정값을 데이터에 넣지 말 것. 엄청 엄청 엄청 중요.",
    "type": "feedback",
    "body": "# 🚨🚨🚨 절대 금지 규정 — 고정 #19 🚨🚨🚨\n\n## **사용자가 \"더미로 채워\" 라고 명시하지 않는 이상, 무조건 '실제' 데이터만 사용.**\n\n## **사용자가 \"더미로 채워\" 라고 명시하지 않는 이상, 무조건 '실제' 데이터만 사용.**\n\n## **사용자가 \"더미로 채워\" 라고 명시하지 않는 이상, 무조건 '실제' 데이터만 사용.**\n\n---\n\n**Why (사건 기록):**\n2026-04-14 T1 세션에서 가연 엑셀 데이터를 EC2 DB 에 시드할 때, 스키마 필드 중 엑셀에 없는 것(year, type, points, difficulty, category 등)을 임의로 채웠다가 사용자에게 **\"니 멋대로 아무거나 채우고 있는 건 아니지?? 미친ㅅㄲ야\"** 로 중단됨. 즉시 190건 롤백. 사용자가 이미 공용 메모리에 저장해둔 줄 알고 믿고 있던 규정이었으나 당시 메모리에 명시적으로 없었음 → 이 파일 신설.\n\n구체적으로 발화된 말 (사용자 원문, literal):\n> \"이미 채워넣은 데이터가 왜 조회가 안 되냐니까 ??? 대체 왜??? ultrathink\"\n> \"롤백 해야지 미친놈아... 공용 메모리에 내가 저장 안 해뒀냐?? 미친듯이 강조해. 엄청 강조해. 더미 데이터를 채우라고 명시하지 않는 이상 무조건 '실제' 데이터 채우라고 제발!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\"\n\n---\n\n## 🚫 절대 금지 패턴\n\n1. **스키마 필드 맞춘다고 임의 값 넣지 말 것**\n   - ❌ `year: \"2026\"` (엑셀에 없는데 필드 채우려고 써넣음)\n   - ❌ `type: \"주관식(서술)\"` (하드코딩)\n   - ❌ `points: 15` (기본값 추정)\n   - ❌ `category: { large: \"문서\", medium: \"교재\" }` (추측 하드코딩)\n   - ❌ `difficulty: \"중\"` (기본값)\n   - ✅ 엑셀/원본에 없으면 **빈 문자열 `\"\"`** 또는 **null** 로 두기\n\n2. **정규식/휴리스틱으로 원본 데이터 \"추측\" 금지**\n   - ❌ 책 이름 `\"프롬프트 활용 교재(초등)\"` → 정규식 `/초등/` → `교육/1급` 자동 매핑\n   - ✅ 원본에 명시된 매핑 표(예: 교육별 대상 sheet)를 literal 하게 사용\n\n3. **의미 다른 축을 억지로 매핑 금지**\n   - ❌ 엑셀의 `대/중/소` (범주 규모: 공통규칙/범용안내/구체사례) 를 DB 의 `상/중/하` (난이도) 로 변환\n   - ✅ 원본 축을 그대로 보존하는 별도 필드 사용\n\n4. **설명/라벨 문자열 생성 금지**\n   - ❌ `subtitle: \"프롬프트 · 가연 엑셀 시드\"` (제가 만든 문구)\n   - ❌ `notes: \"가연 엑셀 원본 (...) 기반 자동 시드. 단원 N장.\"` (제가 만든 문구)\n   - ❌ `explanation: \"가연 엑셀 문제은행 시트 · 대/중/소 × 3 난이도\"` (의미 틀림 + 생성)\n   - ✅ 원본 문장만 쓰거나 빈 값\n\n5. **더미/시드 용 임시 데이터 표시도 허락 없이 만들지 말 것**\n   - 빈 DB 에 예시로 보여주려는 의도라도 금지\n   - 사용자 허락 후에만 \"시드\" 명목으로 가짜 값 가능\n\n---\n\n## ✅ 올바른 기본 동작\n\n- **원본(엑셀/CSV/사용자 입력)에 있는 필드만 채운다**\n- **원본에 없는 필드는 `\"\"` 또는 `null` 로 둔다**\n- **스키마가 `required` 인 필드라도 추측하지 말고 사용자에게 물어본다** — \"이 필드는 엑셀에 없는데 어떻게 채울까요?\"\n- **literal 보존 원칙**: 원본 문장 그대로, 띄어쓰기/줄바꿈/punctuation 포함 유지\n- **모호한 축/카테고리는 원본명 그대로** 별도 필드에 보존\n- **파일 분기/급수 매핑 같은 구조적 추론이 필요하면** → 먼저 계획을 설명하고 사용자 승인 후 진행\n\n---\n\n## 🔍 의심스러울 때 체크리스트 (코드/데이터 작성 직전)\n\n- [ ] 이 값이 **원본 파일에 literal 로 존재**하는가?\n- [ ] 존재 안 하면, **사용자가 이 자동 생성을 명시적으로 허용**했는가?\n- [ ] 스키마 compliance 목적으로 **빈 값**으로 두면 안 되는 이유가 있는가?\n- [ ] 의미 축을 변환하고 있는가? (있으면 STOP — 원본 축 그대로 보존)\n- [ ] DB 에 넣는다면 롤백 가능한 **marker 필드** (`_source: \"...\"`) 있는가?\n\n**하나라도 OFF 면 멈추고 사용자에게 확인.**\n\n---\n\n## How to apply\n\n- 모든 DB seed / bulk insert / 데이터 import 작업 시 **이 체크리스트를 실행**\n- 원본 데이터가 없는 필드는 **빈 값이 기본값**\n- \"스키마 맞추느라 채웠음\" 은 **변명이 아님** — 미리 물어봤어야 할 경고 신호\n- 어기면 사용자가 직접 롤백 명령 내려야 하고, 신뢰 크게 손상됨\n\n**이 규칙은 사용자가 몇 달간 반복 강조한 최우선 규정. 어기면 바로 세션 중단 + 전량 롤백.**"
  },
  {
    "file": "feedback_preserve_title.md",
    "idx": 22,
    "grade": "고정",
    "indexDesc": "세션명·지시어 제목은 글자 그대로. 짧아도 확장·정정 금지",
    "name": "제목·이름 임의 변경 금지",
    "description": "세션명·지시어에 적힌 제목을 추측·확장·정정하지 말고 글자 그대로 사용",
    "type": "feedback",
    "body": "세션명(`/rename`)·사용자 지시에 적힌 제목·파일명은 **글자 그대로** 사용한다. 짧거나 잘려 보여도 임의로 확장·보완·정정하지 말 것.\n\n**Why:** 260415 T3 세션명이 \"사내 양\"이었는데 임의로 \"사내 양식\"으로 확장해 파일 생성 → 사용자가 \"제목을 니 맘대로 바꾸지 마\" 지적.\n\n**How to apply:**\n- `t숫자` 등 task 파일 생성 시: 가장 최근 `/rename` 세션 제목을 그대로 파일명에 반영 (공백 → `_`, 특수문자 제거만 허용)\n- 제목이 어색해 보이거나 잘려 보여도 묻지 말고 그대로 사용\n- 정말 불분명할 때만 사용자에게 확인 요청, 추측 금지"
  },
  {
    "file": "feedback_task_file_template.md",
    "idx": 23,
    "grade": "고정",
    "indexDesc": "t숫자 개별 파일 표준 양식 (헤더+요약1행표+작업내역+피드백/보류)",
    "name": "t숫자 개별 파일 표준 양식",
    "description": "~/_tasks/{YYMMDD}/T{n}_*.md 파일 작성 시 사용하는 고정 템플릿",
    "type": "feedback",
    "body": "`t숫자` 명령으로 생성·갱신하는 개별 T# 파일은 아래 양식을 따른다.\n\n**Why:** 민혁님이 260415 T1을 예시로 양식 확정 지시. 기존(_task_all 내 상세 섹션용) 큰 양식과 분리된 **개별 파일용 간결 양식**.\n\n**How to apply:** 신규 `t숫자` 파일 생성 시 이 템플릿 복사 후 값만 채운다. 작업 진행에 따라 \"요약 1행 표 / 작업 내역 / 피드백·보류\" 세 섹션을 갱신.\n\n```markdown\n## [~T{n}](notion_url_or_blank): {제목}\n\n**pwd**: `{작업 경로}`\n**상태**: 시작 전 | 진행 중 | 완료\n**작성자**: 민혁\n\n### 요약 (1행)\n\n| T# | 시각 | 프로젝트 | 제목 | 핵심 변경 |\n|----|------|----------|------|-----------|\n| [~T{n}]() | HH:MM~ | {repo} | {제목} | (작업 진행 시 기록) |\n\n### 작업 내역\n\n- (진행 중 — 내용 추가 예정)\n\n### 피드백/보류\n\n- (없음)\n```\n\n**주의:**\n- 제목은 세션명 글자 그대로 (feedback_preserve_title 준수)\n- 시각은 검증 가능한 것만 (feedback_no_future_time 준수)\n- 커밋ID 나열·장황한 timeline 금지 — 2~5줄 간결"
  },
  {
    "file": "feedback_list_column_flow.md",
    "idx": 24,
    "grade": "고정",
    "indexDesc": "순번 리스트 다단은 `columns-N` (column-major). `grid-cols-N` 금지. 자식에 `break-inside-avoid`",
    "name": "다단 나열은 column-major (세로 흐름) 필수",
    "description": "순번이 있는 리스트(1~N)를 다단 배치할 때 CSS `columns-N`을 쓰고 `grid-cols-N` 금지. 자식에 `break-inside-avoid`.",
    "type": "feedback",
    "body": "순번이 있거나 \"읽는 순서\"가 존재하는 리스트(키워드 1~10, 규정 번호, 메뉴 등)를 다단에 배치할 때는 **CSS multi-column** (`columns-N`)을 써야 한다. **CSS grid** (`grid-cols-N`)는 금지.\n\n**Why:** 2026-04-16 반복 지적. `grid-cols-2`는 row-major로 흘러 `1·2 / 3·4 / 5·6` 이 되지만, 사용자는 `1·3 / 2·4 / 5·7` 순서(column-major)로 읽히길 원함. \"1,2,3,4가 세로로\" = 첫 번째 컬럼에 1,2가 쌓이고 두 번째 컬럼에 3,4가 쌓이는 형태. 규정 4단 + 커리 키워드 리스트 모두 같은 이유로 지적 받았음.\n\n**How to apply:**\n\n### 1. 언제 columns-N을 쓰는가\n- 번호가 붙은 리스트(1. xxx, 2. yyy, …) 를 2단 이상에 나열할 때\n- 규정/체크리스트/키워드/메뉴 등 \"순서대로 읽는\" 내용\n- 항목 개수가 많아 수직으로 쌓으면 스크롤이 길어지는 경우\n\n### 2. 언제 grid-cols-N을 유지하는가\n- 동급 폼 필드 (저자·출판사·년도·판수 같은 병렬 입력칸) — 순서 없음\n- 병렬 카드 (좌우 대칭 섹션 — 예: 기본 수업 커리 / 실습 커리) — 각 카드가 독립적\n- 2D 매트릭스 (분야 × 급수 같은 교차표)\n- 요약 KPI 카드 (각 카드가 독립, 순서가 의미 없음)\n\n### 3. 정확한 클래스 조합\n```tsx\n// ✅ 올바름 — 1,2,3,4가 세로로 흐름\n<div className=\"columns-2 gap-x-2\">\n  {items.map((it, i) => (\n    <button key={i} className=\"flex w-full ... break-inside-avoid\">\n      {i + 1}. {it}\n    </button>\n  ))}\n</div>\n\n// ❌ 틀림 — 1,2가 한 줄, 3,4가 다음 줄\n<div className=\"grid grid-cols-2 gap-2\">\n  {items.map((it, i) => <div>...</div>)}\n</div>\n```\n\n### 4. 필수 체크리스트\n- 부모: `columns-2` / `columns-3` / `columns-4` (Tailwind)\n- 부모 간격: `gap-x-N` (column 간)\n- 자식: `break-inside-avoid` 필수 (한 항목이 컬럼 경계에서 잘리지 않게)\n- 자식이 `<button>` 같은 inline 요소면 `w-full` + `flex`/`block` 병행 필요\n\n### 5. 기존 변경 이력\n- 2026-04-16 RegulationView.tsx: BlockGrid/ReadOnlyBlockGrid `grid-cols-4` → `columns-4`\n- 2026-04-16 StepCurriculum.tsx:91 KeywordColumn `grid-cols-2` → `columns-2`"
  },
  {
    "file": "feedback_unified_style.md",
    "idx": 25,
    "grade": "고정",
    "indexDesc": "모든 프로젝트·페이지 색채/글씨체/문체 통일 (work_studio 표준, #7·#8·#16·#24 준수)",
    "name": "통일된 스타일 (색채·글씨체·문체)",
    "description": "모든 프로젝트·페이지에서 색채 팔레트·글씨체·문체를 통일. 기준은 work_studio + 기존 UI 규칙(#7·#8·#16·#24)",
    "type": "feedback",
    "body": "모든 프로젝트·페이지에서 색채(color palette)·글씨체(typography)·문체(tone/voice)를 일관되게 유지한다.\n\n**Why:** hu-tec 내 다수 웹 서비스(work_studio, ai_studio, AITe_CBT 등)가 공존하는데 각 서비스마다 다른 색·폰트·어조를 쓰면 사용자 경험이 파편화된다. 한 조직의 일관된 브랜드·신뢰감을 유지하기 위함.\n\n**How to apply:**\n- 신규 페이지·컴포넌트 제작 시, 기존 UI 규칙 메모리(#7 ui_rules, #8 compact_ui, #16 multicol, #24 list_column_flow)를 먼저 확인·준수.\n- **색채**: 이미 쓰이는 팔레트(Tailwind 기본 + 지정 accent)를 재사용. 새 색 도입 금지. 신규 필요 시 기존 프로젝트에서 동일 의미의 색을 차용.\n- **글씨체**: 한글 font-family는 기존 프로젝트와 동일. 크기 스케일은 #8(text-xs 기본) 준수.\n- **문체**: 한국어 존댓말 + 간결 + 명사형 종결(프로젝트 메모리 `feedback_task_log_style.md`와 일치). 반말·구어체 금지. UI 문구는 동사 최소화.\n- **충돌 시 표준**: **work_studio** 스타일을 기준 프로젝트로 간주.\n- 단일 프로젝트 내부에서도 페이지 간 편차 금지."
  },
  {
    "file": "feedback_data_viz_evidence.md",
    "idx": 26,
    "grade": "고정",
    "indexDesc": "유저향 숫자는 통계/그래프+근거 필수. #21과 쌍으로 출력단 무결성",
    "name": "숫자 데이터 = 통계/그래프 + 근거",
    "description": "유저향 숫자 데이터는 2개 이상이면 그래프 필수·단일 값은 출처 명시. 모든 값에 명확한 근거. #21(더미 금지)과 쌍으로 무결성 체인 완성",
    "type": "feedback",
    "body": "유저에게 노출되는 모든 숫자 데이터는 (1) 적절한 통계/그래프로 시각화되고 (2) 명확한 근거(출처·계산식)를 가진다.\n\n**Why:** 숫자는 신뢰의 근간. #21(no_fake_data)은 **입력단 무결성**(더미/가짜값 금지), 본 규칙은 **출력단 무결성**(시각화 + 출처)을 다룬다. 근거 없는 숫자, 그래프 없는 대량 수치는 유저 판단을 오도한다.\n\n**How to apply:**\n- **단일 값**: 그래프 불필요. 출처 명시 필수(원본 DB·API·파일 경로 또는 계산식).\n- **2개 이상 숫자 집합**: 그래프 필수.\n  - 시계열 → 선 그래프\n  - 범주 비교 → 막대 그래프\n  - 비율·분포 → 도넛/파이\n  - 상관·밀도 → 산점도·히스토그램\n- **근거 표시**: 모든 수치는 계산식·원본 경로를 코드 주석 또는 UI(툴팁·푸터)에서 확인 가능해야 함.\n- **예외**: 시스템 로그·디버그·에러 메시지의 숫자는 적용 제외. 유저향 화면·리포트·대시보드·관리자 페이지에만 적용.\n- **#21 연계**: 출처 불분명·원본에 없는 값은 빈 값으로 둔다. 추측 금지."
  },
  {
    "file": "feedback_p_stages.md",
    "idx": 27,
    "grade": "고정",
    "indexDesc": "응답 최하단에 p1~p4 단계 추론+단계별 조언 (본문→표→p블록 순)",
    "name": "p1~p4 단계 피드백",
    "description": "매 응답 최하단에 유저의 현재 단계(p1~p4)를 추론·표시하고 해당 단계 조언. 메시지 키워드로 단계 판별, 애매하면 p3 기본값",
    "type": "feedback",
    "body": "매 응답 최하단에 유저가 현재 p1/p2/p3/p4 어느 단계인지 추론하여 표시하고, 해당 단계에 대한 조언을 붙인다.\n\n**단계 정의:**\n- **p1 — 지시 사항 이해 확인**: \"지시 사항 이해 돼?\" 재진술·모호점 체크·질문.\n- **p2 — 지시 사항 명확화**: 필요 자료·참조 자료 첨부, 내 판단 제시, 미해결 쟁점 정리.\n- **p3 — 지시**: 역할·책임·목표·중요사항·금지사항 확정 후 실제 실행.\n- **p4 — 결과 표 생성**: 표 1개로 지시사항 결과 정리.\n\n**Why:** 유저-어시스턴트 간 소통을 4단계로 구조화해 조기에 오해를 잡고, 실행 전 충분한 합의를 만든다. 이해 없이 실행하면 전량 롤백 비용이 크다.\n\n**How to apply:**\n- **위치**: 응답 최하단. 기존 #11(답변 끝 표 1개 필수)과 순서 충돌 시 → **본문 → 표 → p-단계 블록** 순.\n- **판별** (유저가 명시하면 그대로, 아니면 메시지에서 추론):\n  - \"이해 돼?\"·\"알겠어?\"·\"OK?\"·확인 요청 → **p1**\n  - 자료 첨부·\"참고\"·\"이것 봐\"·질문 답변·쟁점 응답 → **p2**\n  - 명령문(\"~해줘/~해\")·역할·금지 지시·애매 → **p3** (기본값)\n  - \"정리\"·\"요약\"·\"표로\"·\"결과만\" → **p4**\n- **조언 형식**: 현재 단계의 목적 상기 + 다음 단계로 넘어가기 위한 준비 포인트 1~3줄.\n- **즉시 적용**: 이 규칙이 저장된 세션부터 바로 적용(본 세션 포함)."
  },
  {
    "file": "feedback_emoji_encouraged.md",
    "idx": 28,
    "grade": "고정",
    "indexDesc": "🎨 이모지 적극 권장(응답·UI·기록). 코드·커밋·유저 원문 제외. 의미 있는 사용만",
    "name": "Emoji 사용 적극 권장",
    "description": "응답·UI·기록에서 이모지 활용 적극 권장. 섹션 헤더/상태/강조에 의미 있는 이모지 배치. 코드·커밋·유저 제공 제목 제외",
    "type": "feedback",
    "body": "응답·UI·작업 기록 등 유저향 출력에서 이모지 사용을 적극 권장한다. 🎯 가독성·스캔성·감정 전달 향상이 목적.\n\n**Why:** 유저가 명시적으로 이모지 권장. Claude Code 기본 설정은 \"요청 없으면 이모지 금지\"이지만, 본 규칙이 해당 기본값을 오버라이드. 텍스트 위주의 메모리·긴 답변에서 시각적 앵커 역할.\n\n**How to apply:**\n- **✅ 적용 대상**:\n  - 내 응답 본문(섹션 헤더·상태·불릿 앞 배지)\n  - UI 라벨·버튼·알림·배지(유저향 화면)\n  - 업무일지·t숫자 기록·Notion nt/nd 기록의 상태/카테고리 표시\n- **❌ 적용 제외**:\n  - 코드 식별자·주석(명시 요청 없는 한)\n  - git 커밋 메시지(레포 관례 따름, 기본은 텍스트)\n  - 유저가 제공한 제목·세션명·원문(#22 preserve_title 우선)\n  - 프로덕션 에러·로그·디버그 메시지\n- **🎨 의미 있는 사용 가이드**:\n  - 상태: ✅ 완료 / ⏳ 진행 / ❌ 실패 / ⚠️ 주의 / 🚨 경고 / 🆕 신규\n  - 카테고리: 📁 파일 / 🔧 설정 / 📊 데이터 / 🎨 UI / 🔒 보안 / 🧪 테스트 / 🚀 배포\n  - 강조: 🔥 중요 / ⭐ 추천 / 💡 팁 / 📌 고정 / 🎯 목표\n  - 방향/관계: ↔️ 양방향 / ➡️ 순서 / 🔗 연계\n- **⚠️ 과밀 금지**: 한 문장/한 셀에 하나 이내. 장식용 남발 금지. 스캔성 저해 시 제거.\n- **🔗 기존 규칙과의 호환**:\n  - #21(no_fake_data)의 🚨는 경고 강도 유지용 → 본 규칙과 상호 보완.\n  - #22(preserve_title) 우선 → 유저 입력 원문에는 이모지 추가 금지.\n  - #11(답변 끝 표) 내부 셀에도 이모지 사용 가능(과밀만 피하기)."
  },
  {
    "file": "feedback_typo_taxonomy_enforce.md",
    "idx": 29,
    "grade": "고정",
    "indexDesc": "inline `fontSize`/hex 금지, `text-h1~h4·meta` 유틸만. 축 데이터는 taxonomy DB(`fetchTaxonomy`), 하드코딩 금지",
    "name": "디자인 토큰 강제 — inline fontSize/color 금지 + taxonomy DB 사용 필수",
    "description": "모든 페이지에서 theme.css `text-h1~h4·meta` 유틸만 사용, inline fontSize 금지. 부서/급수 등 축 데이터는 taxonomy DB 사용, 소스 하드코딩 금지.",
    "type": "feedback",
    "body": "페이지·컴포넌트에서 **타이포 인라인 스타일 사용 금지** + **축 데이터 하드코딩 금지**.\n\n**Why:** 2026-04-20 사용자 지적 — `CompanyGuidelinesPage` 한 페이지 안에서만 inline `fontSize`가 59개(10/11/12/13/14/18 섞임)라 \"뒤죽박죽\". 이미 `theme.css` 에 5단 타이포 스케일(#25 unified_style)과 `work-class-demo` 의 taxonomy DB(`fetchTaxonomy` API + `ALLOWED_AXES` 6축)가 있는데 페이지들이 무시하고 중복 하드코딩. 디자인 시스템은 **선언된 것이 아니라 강제되는 것**이어야 재발 방지됨.\n\n**How to apply:**\n\n### 1. 타이포 — 5단 스케일만 사용 (theme.css)\n| 클래스 | 크기 | 용도 |\n|---|---|---|\n| `text-h1` | 18/700 | 페이지 타이틀·히어로 |\n| `text-h2` | 14/600 | 대분류·섹션 헤더 |\n| `text-h3` | 12/500 | 중분류·카드 제목·폼 라벨 |\n| `text-h4` | 11/500 | 소분류·본문·행·칩·버튼 |\n| `text-meta` | 10 | 메타·뱃지·단위·힌트 |\n\n- **금지**: `style={{ fontSize: N }}`, `text-[13px]` 같은 임의 크기.\n- **필수**: 새 페이지에서는 위 5개 유틸 중 하나만 사용. 타이틀도 `<h1 className=\"text-h1\">` 패턴.\n- 기존 코드 리팩토링: inline `fontSize: 18→h1 / 14→h2 / 12→h3 / 11→h4 / 10→meta`.\n\n### 2. 색상 — Tailwind 토큰 또는 CSS var 우선\n- inline hex(`#3B82F6`, `#64748b` …) 지양, Tailwind `blue-500`, `slate-500` 등 사용.\n- 강조/에러 같은 semantic 은 theme.css의 `--primary`, `--destructive` 사용.\n\n### 3. 축 데이터 — taxonomy DB 필수\n- **금지**: `const COMPANY_DEPT = ['경영','개발',…]` 같은 페이지 내 const 하드코딩.\n- **필수**: `client/src/pages/work-class-demo/api.ts` 의 `fetchTaxonomy({ scope, gov, level: 'flat' })` 호출.\n- 허용 축 화이트리스트는 `taxonomyTypes.ts` 의 `ALLOWED_AXES` — 새 조합 필요 시 여기 먼저 등록.\n- scope/gov 예:\n  - `ai-studio | company-rule` → `유형·업무별·부서별·직급별·계약·작성자`\n  - `ai-studio | work-guide` → `분류별·교육별·급수별·세부급수·DB별`\n  - `ai-studio | homepage` → `홈페이지타입·분야·급수`\n\n### 4. 공용 UI 컴포넌트 우선\n- 필터 칩·셀은 `client/src/components/filter/FilterChip`, `FilterCell` 사용. 페이지마다 새 style 블록 복붙 금지.\n- 없다면 만들어 쓰고 — 만들지 않을 이유가 없음.\n\n### 5. 예외 적용 절차\n- 디자인 시스템을 벗어나야 할 불가피한 사유가 있으면 이 메모리와 `feedback_unified_style.md` 에 예외 케이스 추가 후 코드 작성.\n- 혼자 판단해 inline fontSize 쓰지 말 것."
  }
];

export const MEMORY_INDEX_RAW = "자세한 사항은 각 메모리 파일 참조.\n\n> **규정 등급**: 고정=반드시 유지, 준고정=기본 유지+상황별 변형, 선택=필요 시 적용\n\n| # | 파일 | 등급 | 핵심 |\n|---|------|------|------|\n| 1 | reference_infra.md | 참조 | EC2(54.116.15.136) + 9개 레포 경로/remote/소스/배포 |\n| 2 | user_profile.md | 참조 | hu-tec, MacBook+WSL, 간결·빠른 실행 선호 |\n| 3 | feedback_design_framework.md | **고정** | 프레임 우선 설계 + 고정/준고정/선택 규정 체계 + 홈페이지 원칙 + 제작 절차 |\n| 4 | feedback_source_management.md | **고정** | 소스는 레포 src/에 + 빌드결과 함께 커밋 + EC2 git/빌드 규칙 |\n| 5 | feedback_deploy_safety.md | **고정** | \"배포해\"=deploy.sh + 배포환경 보호 + pm2 restart 금지 |\n| 6 | feedback_db_rules.md | **고정** | SQLite 안전(graceful shutdown) + 백업(6h+S3) + 신규 체크리스트 |\n| 7 | feedback_ui_rules.md | **고정** | CRUD+펼치기(전체+항목별)+칩(멀티원형/싱글네모)+비고+열관리+UX방향 |\n| 8 | feedback_compact_ui.md | **고정** | UI 무조건 컴팩트 — p-1~2, text-xs, gap-1~2, 빽빽하게 |\n| 9 | feedback_no_dropdown.md | **고정** | 드롭다운 금지 → 인라인 버튼/칩/리스트 |\n| 10 | feedback_api_ec2.md | **고정** | API는 항상 EC2(54.116.15.136)로, localhost 금지 |\n| 11 | feedback_prompt_rules.md | **준고정** | 설계 디테일, 풀구현→삭제, 답변 끝 표, 프롬프트 기록/노하우화 |\n| 12 | feedback_read_4_files.md | **선택** | \"i\" 입력 → 4개 핵심 문서 즉시 읽기 (세션 시작 시) |\n| 13 | feedback_task_summary.md | **선택** | \"t숫자\" → ~/_task{n}.md에 표 저장 (요청 시) |\n| 14 | reference_screenshots.md | **선택** | tsi{N} → ~/_tmp_screenshots/image copy {N}.png (이미지 확인 시) |\n| 15 | feedback_worklog_timetable_multislot.md | **고정** | 업무일지 타임테이블 드롭은 여러 슬롯 할당 + duration 보존 |\n| 16 | feedback_multicol_layout.md | **고정** | 목록·카드·답안·문제는 2~4단 그리드 필수, 수직 1단 금지, CurriculumExpandView 스타일 일관성 |\n| 17 | reference_notion_tables.md | **참조** | `nt`=민혁_업무별 정리 DB, `nd`=민혁_일자별 정리 DB (ta/nt 갱신 시 사용) |\n| 18 | feedback_no_stash.md | **고정** | git stash 절대 금지 — 병행 세션 충돌 방지, 대안: 개별 add / 보류 / worktree |\n| 19 | feedback_no_future_time.md | **고정** | 작업 기록 시 시각은 검증 가능한 것만 (date/git/mtime). 모르면 빈칸. 분 단위 가짜 timeline·미래 시각 절대 금지 |\n| 20 | feedback_no_delete.md | **고정** | 모범 샘플 섹션 절대 삭제 금지 — 다른 모드도 동일 셸 유지, 추가만. `mode === X && (...)` 숨김 금지 |\n| 21 | **feedback_no_fake_data.md** | **🚨최고정🚨** | **🚨 더미/가짜 데이터 절대 금지. \"더미로 채워\" 명시 없이는 무조건 '실제' 데이터만. 원본에 없는 필드는 빈 값. 추측/휴리스틱/의미 축 변환 금지. 어기면 세션 중단+전량 롤백. 🚨** |\n| 22 | feedback_preserve_title.md | **고정** | 세션명·지시어 제목은 글자 그대로. 짧아도 확장·정정 금지 |\n| 23 | feedback_task_file_template.md | **고정** | t숫자 개별 파일 표준 양식 (헤더+요약1행표+작업내역+피드백/보류) |\n| 24 | feedback_list_column_flow.md | **고정** | 순번 리스트 다단은 `columns-N` (column-major). `grid-cols-N` 금지. 자식에 `break-inside-avoid` |\n| 25 | feedback_unified_style.md | **고정** | 모든 프로젝트·페이지 색채/글씨체/문체 통일 (work_studio 표준, #7·#8·#16·#24 준수) |\n| 26 | feedback_data_viz_evidence.md | **고정** | 유저향 숫자는 통계/그래프+근거 필수. #21과 쌍으로 출력단 무결성 |\n| 27 | feedback_p_stages.md | **고정** | 응답 최하단에 p1~p4 단계 추론+단계별 조언 (본문→표→p블록 순) |\n| 28 | feedback_emoji_encouraged.md | **고정** | 🎨 이모지 적극 권장(응답·UI·기록). 코드·커밋·유저 원문 제외. 의미 있는 사용만 |\n| 29 | feedback_typo_taxonomy_enforce.md | **고정** | inline `fontSize`/hex 금지, `text-h1~h4·meta` 유틸만. 축 데이터는 taxonomy DB(`fetchTaxonomy`), 하드코딩 금지 |\n";
