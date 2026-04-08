/* 원본: hutechc_hompage_real/app/mypage/exam/author/[examId]/page.tsx */
import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { getDrafts } from '../../../../lib/examDraftStore';

// 문제 단위 타입 (출제자가 만드는 문제은행용)
interface AuthorQuestion {
  id: number;
  type: 'subjective' | 'descriptive' | 'multiple';
  questionType?: string; // A형, B형 등 유형
  title: string; // 문제 제목
  question: string; // 문제 지문/설명
  content?: string; // 원문/추가 자료
  options?: string[]; // 객관식 보기
  correctAnswer?: number; // 정답 인덱스
  difficulty: '상' | '중' | '하'; // 난이도
  majorCategory: string; // 대분류
  middleCategory?: string; // 중분류
  minorCategory?: string; // 소분류
  answerGuide?: string; // 모범답안 / 채점 기준
  image?: string; // 문제 이미지 (base64 또는 URL)
  files?: { name: string; url: string; size: number }[]; // 첨부 파일 목록
}

export default function AuthorDetailPage() {
  const params = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const examId = params.examId;

  const drafts = useMemo(() => getDrafts(), []);
  const exam = drafts.find((d) => d.id === examId);

  const [questionTypes, setQuestionTypes] = useState<string[]>(['A형', 'B형', 'C형']);

  const [questions, setQuestions] = useState<AuthorQuestion[]>(() => {
    // 시험의 총 문항 수에 맞춰 기본 문제 틀을 생성 (간단 mock)
    const count = exam?.questionCount ?? 5;
    const list: AuthorQuestion[] = [];
    const types = ['A형', 'B형', 'C형'];
    for (let i = 0; i < count; i++) {
      const typeIndex = Math.floor((i / count) * types.length);
      list.push({
        id: i + 1,
        type: 'subjective',
        questionType: types[typeIndex] || 'A형',
        title: `문제 ${i + 1}`,
        question: '',
        difficulty: '중',
        majorCategory: exam?.mainCategory ?? '',
      });
    }
    return list;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedQuestionType, setSelectedQuestionType] = useState<string | null>(null);

  const handleAddQuestionType = () => {
    const newType = window.prompt('새로운 형의 이름을 입력하세요 (예: D형)');
    if (!newType || !newType.trim()) return;
    const trimmedType = newType.trim();
    if (questionTypes.includes(trimmedType)) {
      alert('이미 존재하는 형입니다.');
      return;
    }
    setQuestionTypes([...questionTypes, trimmedType]);
  };

  const handleRemoveQuestionType = (typeToRemove: string) => {
    // 해당 형에 속한 문제가 있는지 확인
    const questionsWithType = questions.filter(q => q.questionType === typeToRemove);
    
    if (questionsWithType.length > 0) {
      const confirmMessage = `${typeToRemove}에 속한 문제가 ${questionsWithType.length}개 있습니다. 삭제하시겠습니까? (해당 문제들의 형이 제거됩니다)`;
      if (!window.confirm(confirmMessage)) return;
      
      // 해당 형의 문제들의 형을 제거
      setQuestions(prev => prev.map(q => 
        q.questionType === typeToRemove ? { ...q, questionType: undefined } : q
      ));
    }
    
    // 형 목록에서 제거
    setQuestionTypes(prev => prev.filter(t => t !== typeToRemove));
    
    // 현재 선택된 형이 삭제된 형이면 전체로 변경
    if (selectedQuestionType === typeToRemove) {
      setSelectedQuestionType(null);
    }
  };

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-sm text-gray-600">
        해당 시험 정보를 찾을 수 없습니다.
      </div>
    );
  }

  const current = questions[currentIndex];

  const updateCurrent = (patch: Partial<AuthorQuestion>) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], ...patch };
      return next;
    });
  };

  const handleAddOption = () => {
    if (current.type !== 'multiple') return;
    const options = current.options ?? [];
    updateCurrent({ options: [...options, ''] });
  };

  const handleChangeOption = (idx: number, value: string) => {
    if (current.type !== 'multiple') return;
    const options = [...(current.options ?? [])];
    options[idx] = value;
    updateCurrent({ options });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateCurrent({ image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    updateCurrent({ image: undefined });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
    }));

    updateCurrent({
      files: [...(current.files || []), ...newFiles],
    });
  };

  const handleRemoveFile = (index: number) => {
    const files = [...(current.files || [])];
    if (files[index]?.url.startsWith('blob:')) {
      URL.revokeObjectURL(files[index].url);
    }
    files.splice(index, 1);
    updateCurrent({ files });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSaveMock = () => {
    console.log('author questions (mock)', { examId, questions });
    alert('출제 내용이 (mock)으로 저장되었습니다. 실제 서버 연동은 이후에 추가합니다.');
  };

  const handleSubmitMock = () => {
    console.log('submit author questions (mock)', { examId, questions });
    alert('출제 문제가 (mock) 기준으로 최종 저장되었습니다. 출제중/출제완료 상태는 상위 화면에서 관리합니다.');
    navigate('/hutechc-homepage/mypage/exam/author/in-progress');
  };

  return (
    <div className="flex h-screen bg-gray-50 text-sm">
      {/* 가장 왼쪽: 유형 필터 */}
      <aside className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-2 border-b border-gray-200 flex-1 overflow-y-auto">
          <div className="text-[9px] text-gray-500 mb-2 text-center">유형</div>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setSelectedQuestionType(null)}
              className={`w-full px-1.5 py-2 rounded text-[10px] font-medium transition-colors ${
                selectedQuestionType === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              전체
            </button>
            {questionTypes.map((type) => (
              <div key={type} className="group relative flex items-center">
                <button
                  type="button"
                  onClick={() => setSelectedQuestionType(type)}
                  className={`flex-1 px-1.5 py-2 rounded text-[10px] font-medium transition-colors ${
                    selectedQuestionType === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {type}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveQuestionType(type);
                  }}
                  className="ml-1 w-4 h-4 bg-red-500 text-white rounded text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shrink-0"
                  title={`${type} 삭제`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="p-2 border-t border-gray-200">
          <button
            type="button"
            onClick={handleAddQuestionType}
            className="w-full px-1.5 py-2 rounded text-[10px] font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300 transition-colors"
            title="형 추가"
          >
            + 추가
          </button>
        </div>
      </aside>

      {/* 왼쪽: 문제 리스트 */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 space-y-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 rounded-md text-xs text-gray-600 hover:bg-gray-100"
          >
            ← 출제중인 시험 목록으로
          </button>
          <div>
            <div className="text-[11px] text-gray-500 mb-1">출제 중 시험</div>
            <div className="text-sm font-semibold text-gray-900">{exam.title}</div>
            <div className="text-[11px] text-gray-500 mt-1 flex flex-wrap gap-1">
              <span>{exam.type}</span>
              <span>· {exam.mainCategory}</span>
              {exam.middleCategory && <span>· {exam.middleCategory}</span>}
              {exam.subCategory && <span>· {exam.subCategory}</span>}
              <span>· {exam.questionCount}문항</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3 space-y-2">
          {questions
            .filter((q) => !selectedQuestionType || q.questionType === selectedQuestionType)
            .map((q, index) => {
              const originalIndex = questions.findIndex((origQ) => origQ.id === q.id);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(originalIndex)}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs border transition-colors ${
                    originalIndex === currentIndex
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-semibold truncate">{q.title || `문제 ${q.id}`}</div>
                  <div className="mt-0.5 text-[10px] flex flex-wrap gap-1 opacity-80">
                    {q.questionType && <span className="font-medium">{q.questionType}</span>}
                    <span>{q.type === 'multiple' ? '객관식' : q.type === 'descriptive' ? '서술형' : '주관식'}</span>
                    <span>· {q.difficulty}</span>
                    {q.majorCategory && <span>· {q.majorCategory}</span>}
                    {q.middleCategory && <span>· {q.middleCategory}</span>}
                    {q.minorCategory && <span>· {q.minorCategory}</span>}
                  </div>
                </button>
              );
            })}
          {questions.filter((q) => !selectedQuestionType || q.questionType === selectedQuestionType).length === 0 && (
            <div className="text-center text-xs text-gray-500 py-4">
              {selectedQuestionType ? `${selectedQuestionType}에 해당하는 문제가 없습니다.` : '문제가 없습니다.'}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 space-y-2 text-xs">
          <button
            type="button"
            onClick={handleSaveMock}
            className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            임시 저장
          </button>
          <button
            type="button"
            onClick={handleSubmitMock}
            className="w-full px-3 py-1.5 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            출제 문제 완료 저장
          </button>
        </div>
      </aside>

      {/* 오른쪽: 선택된 문제 상세 편집 */}
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm p-6 space-y-5">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 mb-1">
                문제 {current.id} 상세 출제
              </h1>
              <p className="text-[11px] text-gray-500">
                이 시험의 총 문항 수({exam.questionCount}문항)에 맞게 각 문제의 유형, 난이도, 카테고리(중/소분류)와 실제 지문/답안을 정의합니다.
              </p>
            </div>
            <div className="text-right text-[11px] text-gray-500">
              <div>시험 ID: {exam.id}</div>
              <div>상태: 출제중 (mock)</div>
            </div>
          </header>

          {/* 상단 메타: 문제 타입 / 난이도 / 카테고리 */}
          <section className="grid grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block mb-1 text-[11px] text-gray-500">시험 유형</label>
              <select
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 bg-white"
                value={current.questionType ?? ''}
                onChange={(e) => updateCurrent({ questionType: e.target.value || undefined })}
              >
                <option value="">선택 안함</option>
                {questionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[11px] text-gray-500">문제 유형</label>
              <select
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 bg-white"
                value={current.type}
                onChange={(e) =>
                  updateCurrent({ type: e.target.value as AuthorQuestion['type'] })
                }
              >
                <option value="subjective">주관식</option>
                <option value="descriptive">서술형</option>
                <option value="multiple">객관식</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[11px] text-gray-500">난이도</label>
              <select
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 bg-white"
                value={current.difficulty}
                onChange={(e) =>
                  updateCurrent({ difficulty: e.target.value as AuthorQuestion['difficulty'] })
                }
              >
                <option value="상">상</option>
                <option value="중">중</option>
                <option value="하">하</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[11px] text-gray-500">중분류</label>
              <input
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                placeholder="예: 마케팅/기획"
                value={current.middleCategory ?? ''}
                onChange={(e) => updateCurrent({ middleCategory: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] text-gray-500">소분류</label>
              <input
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                placeholder="예: 제안서 / 계약서 등"
                value={current.minorCategory ?? ''}
                onChange={(e) => updateCurrent({ minorCategory: e.target.value })}
              />
            </div>
          </section>

          {/* 문제 제목 / 지문 */}
          <section className="space-y-3 text-xs">
            <div>
              <label className="block mb-1 text-[11px] text-gray-500">문제 타이틀</label>
              <input
                className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                placeholder="예: 공통 영역 객관식 1번"
                value={current.title}
                onChange={(e) => updateCurrent({ title: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] text-gray-500">문제 이미지</label>
              <div className="space-y-2">
                {current.image ? (
                  <div className="relative">
                    <img
                      src={current.image}
                      alt="문제 이미지"
                      className="max-w-full h-auto max-h-48 rounded-md border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      삭제
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-3 pb-4">
                      <svg
                        className="w-6 h-6 mb-1 text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-1 text-xs text-gray-500">
                        <span className="font-semibold">이미지 업로드</span>
                      </p>
                      <p className="text-[10px] text-gray-500">PNG, JPG, GIF (최대 10MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>
            <div>
              <label className="block mb-1 text-[11px] text-gray-500">문제 설명 / 지문</label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 h-28 resize-none"
                placeholder="수험자에게 보여줄 문제 설명을 작성하세요."
                value={current.question}
                onChange={(e) => updateCurrent({ question: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 text-[11px] text-gray-500">원문 / 참고 자료 (선택)</label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 h-28 resize-none"
                placeholder="번역 지문, 프롬프트 맥락, 윤리 상황 설명 등 원문을 입력합니다."
                value={current.content ?? ''}
                onChange={(e) => updateCurrent({ content: e.target.value })}
              />
            </div>
          </section>

          {/* 유형별 추가 필드 */}
          {current.type === 'multiple' && (
            <section className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <label className="block mb-1 text-[11px] text-gray-500">객관식 보기 및 정답</label>
                <button
                  type="button"
                  className="px-2 py-1 rounded-md border border-gray-300 text-[11px] text-gray-700 hover:bg-gray-50"
                  onClick={handleAddOption}
                >
                  + 보기 추가
                </button>
              </div>
              <div className="space-y-1">
                {(current.options ?? []).map((opt, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="radio"
                      name="correctOption"
                      className="w-3.5 h-3.5 text-indigo-600"
                      checked={current.correctAnswer === idx}
                      onChange={() => updateCurrent({ correctAnswer: idx })}
                    />
                    <input
                      className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-xs"
                      placeholder={`보기 ${idx + 1}`}
                      value={opt}
                      onChange={(e) => handleChangeOption(idx, e.target.value)}
                    />
                  </div>
                ))}
                {(!current.options || current.options.length === 0) && (
                  <p className="text-[11px] text-gray-400">보기를 추가해 주세요.</p>
                )}
              </div>
            </section>
          )}

          {/* 첨부 파일 */}
          <section className="space-y-2 text-xs">
            <label className="block mb-1 text-[11px] text-gray-500">첨부 파일</label>
            <div className="space-y-2">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-3 pb-4">
                  <svg
                    className="w-6 h-6 mb-1 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-1 text-xs text-gray-500">
                    <span className="font-semibold">파일 업로드</span>
                  </p>
                  <p className="text-[10px] text-gray-500">여러 파일 선택 가능</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileUpload}
                />
              </label>
              {current.files && current.files.length > 0 && (
                <div className="space-y-1.5">
                  {current.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <svg
                          className="w-4 h-4 text-gray-400 shrink-0"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 16 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 17h1l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h11m-5 4v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4m-4 0h-4"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-900 truncate">{file.name}</p>
                          <p className="text-[10px] text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="ml-2 px-2 py-1 text-xs text-red-600 hover:text-red-800 shrink-0"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 모범답안 / 채점 기준 */}
          <section className="space-y-2 text-xs">
            <label className="block mb-1 text-[11px] text-gray-500">모범답안 / 채점 기준</label>
            <textarea
              className="w-full border border-gray-300 rounded-md px-2 py-1.5 h-24 resize-none"
              placeholder="이 문제의 모범답안 또는 채점 기준(문장부호수, 수정단어수, 단계, 단어수 등)을 기술합니다."
              value={current.answerGuide ?? ''}
              onChange={(e) => updateCurrent({ answerGuide: e.target.value })}
            />
          </section>

          {/* 하단 네비게이션 */}
          <footer className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
            <div className="text-[11px] text-gray-500">
              문제 {currentIndex + 1} / {questions.length}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← 이전 문제
              </button>
              <button
                type="button"
                disabled={currentIndex === questions.length - 1}
                onClick={() =>
                  setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                }
                className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                다음 문제 →
              </button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
