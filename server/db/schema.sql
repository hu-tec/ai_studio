CREATE TABLE IF NOT EXISTS interviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  form_type TEXT NOT NULL,
  name TEXT,
  interview_date TEXT,
  start_date TEXT,
  available_months TEXT,
  website_viewed TEXT,
  support_field TEXT,
  work_type TEXT,
  commute_method TEXT,
  commute_time TEXT,
  birth_date TEXT,
  age TEXT,
  experience TEXT,
  driving TEXT,
  car_owned TEXT,
  religion TEXT,
  pt TEXT,
  family TEXT,
  marriage TEXT,
  children TEXT,
  skills TEXT,
  english TEXT,
  schedule_mon TEXT,
  schedule_tue TEXT,
  schedule_wed TEXT,
  schedule_thu TEXT,
  schedule_fri TEXT,
  mbti TEXT,
  mbti_scores TEXT,
  personality_answers TEXT,
  summary1 TEXT,
  summary2 TEXT,
  summary3 TEXT,
  edu_feedback TEXT,
  contract_data TEXT,
  submitted_html TEXT,
  lecture_type TEXT,
  lecture_availability TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS interview_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  interview_id INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  original_name TEXT,
  s3_key TEXT,
  s3_url TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (interview_id) REFERENCES interviews(id)
);

CREATE TABLE IF NOT EXISTS work_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  log_key TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tesol_applicants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  applicant_id TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  applied_at TEXT,
  rejection_reason TEXT,
  basic TEXT NOT NULL,
  application TEXT,
  extra TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 레벨테스트 결과
CREATE TABLE IF NOT EXISTS level_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_id TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 서약서 제출
CREATE TABLE IF NOT EXISTS pledges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pledge_id TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 레슨플랜
CREATE TABLE IF NOT EXISTS lesson_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 출퇴근 기록
CREATE TABLE IF NOT EXISTS attendance_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  record_key TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 미팅
CREATE TABLE IF NOT EXISTS meetings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meeting_id TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 거래처 아웃콜
CREATE TABLE IF NOT EXISTS outbound_calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  call_id TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 사진/문서
CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  photo_id TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 강의시간표
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  schedule_id TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 규정 데이터
CREATE TABLE IF NOT EXISTS rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_id TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 평가기준
CREATE TABLE IF NOT EXISTS eval_criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  criteria_id TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS work_log_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  log_key TEXT NOT NULL,
  file_type TEXT NOT NULL,
  original_name TEXT,
  s3_key TEXT,
  s3_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 업무 자료 공유
CREATE TABLE IF NOT EXISTS work_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  material_id TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS company_guidelines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guideline_id TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 업무 총괄 (Slack형 업무 허브)
CREATE TABLE IF NOT EXISTS work_hub (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS work_hub_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id TEXT NOT NULL UNIQUE,
  post_id TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 앱 설정 (localStorage → DB 이관)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 페이지별 메모
CREATE TABLE IF NOT EXISTS page_memos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  memo_id TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 4-tier 사용자 계정 (T3-3)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK(tier IN ('admin','manager','user','external')),
  status TEXT DEFAULT 'active',
  last_login_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);

-- 로그인 세션 (httpOnly 쿠키 토큰 → DB 조회)
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
