# AI Studio — 실행 계획

> 기반 지식: `_final_info.md` (HutechC 시스템 & 분류 통합 가이드) 참조

## 이 프로젝트의 역할

**직원 전용 내부 업무 도구** — 출퇴근, 업무일지, 면접, 규정, 평가 등 사내 직원이 사용하는 관리 시스템. 소비자/외부인 데이터는 다루지 않는다.

---

## 현재 상태 (2026-04)

### 기술 스택
- **프론트**: React 18 + TypeScript + Vite 6 + Tailwind CSS 4 + shadcn/ui + MUI 7
- **백엔드**: Express 4 + SQLite (better-sqlite3)
- **배포**: EC2, PM2 (포트 3001, nginx :81)

### 페이지 현황 (18개)

| 분류 | 페이지 | 상태 | 비고 |
|------|--------|------|------|
| **유지** | attendance (출퇴근) | ✅ | 직원 데이터 |
| **유지** | work-log (업무일지) | ✅ | 직원 데이터 |
| **유지** | interview (면접관리) | ✅ | 내부 프로세스 |
| **유지** | meetings (미팅관리) | ✅ | 내부 프로세스 |
| **유지** | outbound-calls (거래처 아웃콜) | ✅ | 내부 영업 관리 |
| **유지** | schedule (강의시간표) | ✅ | 내부 일정 |
| **유지** | eval-criteria (평가기준) | ✅ | 내부 규정 |
| **유지** | guidelines (업무지침) | ✅ | 내부 규정 |
| **유지** | rules-editor (규정편집) | ✅ | 내부 규정 |
| **유지** | rules-mgmt (규정관리) | ✅ | 내부 규정 |
| **유지** | pledge (서약서) | ✅ | 내부 문서 |
| **유지** | photo-dashboard (사진대시보드) | ✅ | 내부 관리 |
| **유지** | lesson-plan (레슨플랜) | ✅ | 내부 교육 관리 |
| **유지** | admin-system (관리자시스템) | ✅ | 내부 관리 |
| **유지** | ComingSoon | — | 미구현 스텁 |
| **이관→work_studio** | tesol | ⚠️ | 소비자 신청 데이터 → work_studio |
| **이관→work_studio** | level-test | ⚠️ | 소비자 시험 데이터 → work_studio |
| **삭제 가능** | work-log-old | 🗑️ | 구버전 |

### 백엔드 라우트

| 파일 | 용도 | 이관 여부 |
|------|------|----------|
| `generic.js` | 범용 CRUD (11+ 리소스) | 유지 |
| `interviews.js` | 면접 전용 API | 유지 |
| `worklogs.js` | 업무일지 전용 API | 유지 |
| `uploads.js` | 파일 업로드 (S3) | 유지 |
| `tesol.js` | TESOL 신청 전용 API | **이관 → work_studio** |

---

## Phase 1: 이관 (ai_studio → work_studio)

### 원칙
> "데이터 주체가 소비자/외부인이면 Work Studio" (핵심 규칙 #1)

### 제거할 항목

| 항목 | 현재 위치 | work_studio 대체 | 작업 |
|------|----------|-----------------|------|
| `pages/tesol/` | 6파일 (62KB) | `tesol-apply.html` + `/api/tesol_expert_applications` | 라우트 제거, 폴더 삭제 |
| `pages/level-test/` | 7파일 (59KB) | `level-test.html` + `/api/level_test_submissions` | 라우트 제거, 폴더 삭제 |
| `routes/tesol.js` | TESOL API | work_studio 범용 CRUD가 대체 | 파일 삭제 |
| 23개 ComingSoon 라우트 | routes.tsx 스텁 | work_studio에서 관리 | 라우트 항목 제거 |

### 작업 순서

1. work_studio에 TESOL/레벨테스트 데이터 이관 확인 (✅ 완료)
2. ai_studio routes.tsx에서 tesol, level-test 라우트 제거
3. `pages/tesol/`, `pages/level-test/` 폴더 삭제
4. `routes/tesol.js` 삭제
5. 23개 ComingSoon 라우트 정리 (work_studio 관할 항목 제거)
6. 빌드 후 배포

---

## Phase 2: 내부 도구 고도화

이관 완료 후 ai_studio는 순수 직원 도구에 집중.

### 회의 결정사항 반영 (업무 0-3 회의)

| 기능 | 변경 내용 | 우선순위 |
|------|----------|----------|
| 출퇴근 관리 | 최대 압축 | 중간 |
| 미팅 관리 | 최대 압축 | 중간 |
| 거래처 아웃콜 | 한눈에 여러 요소, 부서별 구분 (좌: 마케팅, 우: 상담) | 중간 |
| 대시보드 | 3단 → 4단 | 높음 |
| 면접 안내 | 과정 안내 여백 제거, 4단 | 중간 |
| 업무지침/규정 | 불필요한 펼치기 UI 제거 | 낮음 |
| 계약서 | 면접→강사→업무 1차 흐름 참고 | 낮음 |

### 기존 페이지 개선

| 페이지 | 개선 사항 |
|--------|----------|
| work-log | 30분 단위, 프롬프트 작성 가능 |
| attendance | UI 압축 |
| meetings | UI 압축 |
| outbound-calls | 섹션별 부서 구분 레이아웃 |
| eval-criteria | 정밀설정 강화 |

---

## Phase 3: work_studio API 연동

ai_studio가 직접 관리하지 않지만 **조회가 필요한 소비자 데이터**는 work_studio API를 호출해서 표시.

### 연동 시나리오

| 상황 | ai_studio 동작 | work_studio API |
|------|----------------|-----------------|
| 면접관이 지원자 신청서 확인 | `fetch('work_studio_host/api/tesol_expert_applications')` | GET `/api/tesol_expert_applications` |
| 강사가 레벨테스트 결과 확인 | `fetch('work_studio_host/api/level_test_submissions')` | GET `/api/level_test_submissions` |
| 평가기준에 문제은행 참조 | `fetch('work_studio_host/api/questions')` | GET `/api/questions` |

### 구현

- `client/src/lib/workStudioApi.ts` — work_studio API 클라이언트 모듈
- 환경변수 `WORK_STUDIO_API_URL` 추가
- ai_studio는 **읽기 전용** (조회만, 수정은 work_studio admin에서)

---

## Phase 4: RBAC 준비

work_studio의 RBAC가 구현되면:
- ai_studio 로그인도 같은 사용자 DB 사용 (work_studio users 테이블)
- 또는 SSO(Single Sign-On) 방식으로 한번 로그인이면 양쪽 접근
- ai_studio는 E역할 중 **내부 역할만** 접근 허용 (알바, 신입, 강사, 팀장, 개발, 임원, 대표)
- 외부 역할은 ai_studio 접근 불가

---

## 건드리면 안 되는 것

| 항목 | 이유 |
|------|------|
| `server/db/hutechc.db` | 직원 데이터. work_studio DB와 별개 |
| `routes/interviews.js` | 면접 전용 로직. 범용화 불가 |
| `routes/worklogs.js` | 업무일지 전용 로직 |
| 14개 유지 페이지 | 모두 내부 업무용. 이관 대상 아님 |

---

## 우선순위 요약

| 순서 | Phase | 핵심 산출물 | 의존성 |
|------|-------|-----------|--------|
| 1 | 이관 | tesol/level-test 제거, 라우트 정리 | work_studio 이관 완료 (✅) |
| 2 | 내부 도구 고도화 | 대시보드 4단, UI 압축, 아웃콜 개선 | Phase 1 |
| 3 | work_studio 연동 | API 클라이언트, 읽기전용 조회 | work_studio API 안정화 |
| 4 | RBAC | SSO 또는 공유 사용자 DB | work_studio RBAC 구현 |
