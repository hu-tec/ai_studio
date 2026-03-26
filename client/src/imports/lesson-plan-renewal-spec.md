📝 레슨플랜(Lesson Plan) 관리 시스템 리뉴얼 개발 명세서
1. 개요
목적: 기존 레슨플랜 관리 시스템의 노후화된 UI를 개선하고, 동적 폼(Dynamic Form) 입력 방식의 편의성을 높여 강사 및 관리자의 업무 효율성을 증대시킴.

원칙: 기존 작성된 데이터(DB)와의 100% 하위 호환성 유지. 기존의 모든 입력 필드와 리스트 항목 보존.

2. 주요 UI/UX 개선 방향 제안
용어 및 오타 정정 제안: * 제목(Topic) -> 학습 영역(Subject) (실제 라벨은 제목이나 내용은 Reading, Writing 등이므로)

Cateria -> Categories 또는 Lesson Elements로 변경 권장.

동적 폼 제어: 체크박스 선택 시 하단에 입력 폼(텍스트 영역)이 즉각적으로 생성/삭제되도록 프론트엔드 상태 관리(React, Vue 등) 적용.

첨부파일 UI: 기존의 단순 파일 첨부 버튼에서 Drag & Drop이 가능한 영역으로 개선.

3. 상세 기능 명세
3.1. 레슨플랜 목록 페이지 (List Page)
기존 게시판 형태를 유지하되 검색과 필터링을 강화합니다.

검색 영역 (Search Bar)

조건 검색: Title(제목), Comment(내용), Name(작성자) 체크박스 제공 (다중 선택 가능 여부 확인 필요).

검색어 입력: 텍스트 입력 필드.

버튼: [Search] 검색 버튼, [WRITE] 등록 페이지 이동 버튼 (상/하단 배치).

리스트 출력 항목 (Data Grid / Table)

컬럼 정보: 번호, 센터, 분류(통번역, 테솔 등), 과정명, 기수, 태그, 제목(Topic), 작성자, 레벨, 학생수, 시간, 작성일, 조회수, 첨부파일(아이콘 표시).

참고사항: 센터, 분류, 과정명은 레슨플랜 작성 시 선택하는 기수에 종속되어 DB에서 Join 하여 가져오는 데이터로 추정됨.

목록 제어:

10개/20개 단위 페이징(Pagination) 처리.

행(Row) 클릭 시 해당 레슨플랜의 상세 보기 및 수정 페이지로 이동.

3.2. 레슨플랜 등록 및 수정 페이지 (Write/Edit Page)
입력 폼은 크게 1. 기본 정보, 2. 범주형 상세 내용(Cateria), 3. 단계별 활동 내용(Step1), 4. 첨부파일 영역으로 나뉩니다.

[1] 기본 정보 입력 (Basic Information)
태그: 텍스트 입력란. (쉼표로 구분되는 태그 시스템 도입 권장)

작성자: 텍스트 입력란. (로그인 세션 기반 자동 입력 기능 권장)

비밀번호: 비밀번호 타입 입력란. (비회원/강사 개별 수정 권한용으로 추정)

기수: Select Dropdown. 등록된 과정 기수 목록 불러오기.

Instructor Name: 텍스트 입력란. (실제 수업 진행 강사명)

제목(Topic) / 학습 영역: Radio Button 선택.

옵션: Reading, Writing, Listening, Speaking, Vocabulary, Grammar

Date 기간: Date Picker 적용 (시작일 ~ 종료일 선택).

Gender: 텍스트 입력란. (기존 유지)

Level: 다중 Select Dropdown (대분류 선택 시 중/소분류 로드).

Group (학생수): Radio Button 선택.

옵션: 개인, 5명이하, 6-10명, 11-20명, 21명이상, 100명이상

Time Length (총 수업 시간): Radio Button 선택 및 직접 입력.

옵션: 30분, 31-59분, 1시간-2시간, 2시간이상, 직접입력(선택 시 텍스트 필드 활성화).

[2] 범주형 상세 내용 (현재 'Cateria' 영역)
사용자가 체크박스를 선택하면, 하단에 해당 항목의 데이터를 입력할 수 있는 폼이 동적으로 렌더링 됩니다.

선택 항목 (Checkboxes): * Materials, Aims, Language Skills, Language Systems, Assumptions, Anticipated Errors and solutions, Reference, 직접입력(선택 시 텍스트 입력란 활성화 + 추가 버튼).

동적 생성 폼 구조 (List/Grid 형식):

Title: (Read-only) 선택한 체크박스 이름이 자동 기입됨. 삭제 버튼 제공.

Contents(내용): Textarea (다중 줄 입력 가능).

Remark(비고): Textarea.

Time Length 분: 텍스트 입력란.

[3] 단계별 활동 내용 (현재 'Step1' 영역)
실제 수업의 흐름을 기입하는 영역입니다.

선택 항목 (Checkboxes): * Lead-in, Pre-Activity, Main-Activity, Presentation, Practice, Production, 직접입력(+ 추가 버튼).

동적 생성 폼 구조 (List/Grid 형식):

Title: (Read-only) 선택한 체크박스 이름. 삭제 버튼 제공.

Time: 텍스트 입력란.

Set Up: Textarea.

Description of Activities: Textarea (가장 넓은 면적 할당 필요).

Remark(비고): Textarea.

[4] 첨부파일 (Attachments)
기능: 최대 4개의 파일 업로드 가능.

UI 개선 제안: * 기존의 고정된 4개 <input type="file"> 방식 대신, 하나의 영역에 파일을 끌어다 놓거나(Drag & Drop), 클릭하여 다중 선택할 수 있는 모던 UI 적용 권장.

제약사항 안내 문구 노출: "Please be named the file in English. 레슨플랜에 들어가는 모든 첨부파일."

4. 데이터베이스 및 백엔드 유의사항 (개발자 전달용)
동적 데이터 처리: Cateria와 Step1에서 생성되는 데이터는 1:N 구조이므로, 메인 레슨플랜 테이블(Master)과 각 상세 항목 테이블(Detail 1, Detail 2)로 정규화되어 저장 및 호출되어야 합니다. (기존 DB 구조를 반드시 확인하여 맵핑할 것)

직접 입력 항목 처리: 사용자가 '직접입력'으로 추가한 항목은 정해진 코드가 없으므로 Title 값 자체를 문자열로 DB에 적재할 수 있도록 예외 처리가 필요합니다.

비밀번호 검증: 리스트 페이지에서 게시글 수정/삭제 시 작성될 당시 기입한 비밀번호를 통해 권한을 체크하는 로직이 유지되어야 합니다.