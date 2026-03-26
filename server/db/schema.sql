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
