/* 원본: hutechc_hompage_real/app/(client-layout)/admin/grading/page.tsx */
import { Link } from 'react-router';
import { useState, useEffect } from 'react';

type GradingSheetData = {
  id: string;
  name: string;
  majorCategories: MajorCategory[];
  detailItems: Record<string, DetailItem[]>; // categoryId -> DetailItem[]
  createdAt: string;
  updatedAt: string;
};

type GradingSheet = {
  id: string;
  name: string;
  examName: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
};

type MajorCategory = {
  id: string;
  name: string;
  score: number;
  definition: string;
  assumptionFactor: string;
  deductionFactor: string;
  solution: string;
  detailedDefinition: string;
  factors: string;
};

type DetailItem = {
  id: string;
  name: string;
  definition: string;
  detailedDefinition: string;
  factors: string;
};

const DUMMY_GRADING_SHEETS: GradingSheet[] = [
  {
    id: '1',
    name: '번역 시험 채점표 v1',
    examName: '번역 전문가 자격시험',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    status: 'active',
  },
  {
    id: '2',
    name: '프롬프트 시험 채점표',
    examName: '프롬프트 엔지니어 자격시험',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    status: 'active',
  },
  {
    id: '3',
    name: '통번역 시험 채점표',
    examName: 'AI 통번역 전문가 시험',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-12',
    status: 'inactive',
  },
];

export default function GradingPage() {
  const [activeTab, setActiveTab] = useState<'sheets' | 'criteria'>('sheets');
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isAddingDetails, setIsAddingDetails] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [savedSheets, setSavedSheets] = useState<GradingSheetData[]>([]);
  
  // 채점표 만들기 상태
  const [sheetName, setSheetName] = useState('');
  const [majorCategories, setMajorCategories] = useState<MajorCategory[]>([
    {
      id: 'cat-1',
      name: '정보성 / 정확도',
      score: 30,
      definition: '사실 기반의 정확한 정보로 구성된',
      assumptionFactor: '정확한 정보 제공',
      deductionFactor: '오류·부정확 정보',
      solution: '신뢰 가능한 정보 사용',
      detailedDefinition: '제공된 정보가 검증 가능한 사실에 기반하며, 오류·왜곡·허위 내용 없이 신뢰 가능한 논리 구조로 구성되어 있는지를 평가한다.',
      factors: '명확하고 구체적임 / 일부 모호함 / 모호하고 개방적임',
    },
  ]);
  
  // 세부 채점 상태
  const [detailItems, setDetailItems] = useState<DetailItem[]>([]);
  const [allDetailItems, setAllDetailItems] = useState<Record<string, DetailItem[]>>({});
  
  // 채점 상태
  const [gradingScores, setGradingScores] = useState<Record<string, number>>({});
  const [gradingNotes, setGradingNotes] = useState<Record<string, string>>({});
  const [detailGradingScores, setDetailGradingScores] = useState<Record<string, Record<string, number>>>({}); // categoryId -> detailId -> score
  const [detailGradingNotes, setDetailGradingNotes] = useState<Record<string, Record<string, string>>>({}); // categoryId -> detailId -> notes
  const [candidateAnswer, setCandidateAnswer] = useState('');

  // localStorage에서 채점표 불러오기
  useEffect(() => {
    const stored = localStorage.getItem('grading-sheets');
    if (stored) {
      try {
        setSavedSheets(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load grading sheets:', e);
      }
    }
  }, []);

  // 채점표 저장
  const saveGradingSheet = () => {
    if (!sheetName.trim()) {
      alert('채점표 이름을 입력하세요.');
      return;
    }
    if (majorCategories.length === 0) {
      alert('최소 하나의 대분류를 추가하세요.');
      return;
    }

    const newSheet: GradingSheetData = {
      id: `sheet-${Date.now()}`,
      name: sheetName,
      majorCategories,
      detailItems: allDetailItems,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const updated = [...savedSheets, newSheet];
    setSavedSheets(updated);
    localStorage.setItem('grading-sheets', JSON.stringify(updated));
    
    alert('채점표가 저장되었습니다.');
    setIsCreatingSheet(false);
    setSheetName('');
    setMajorCategories([{
      id: 'cat-1',
      name: '정보성 / 정확도',
      score: 30,
      definition: '사실 기반의 정확한 정보로 구성된',
      assumptionFactor: '정확한 정보 제공',
      deductionFactor: '오류·부정확 정보',
      solution: '신뢰 가능한 정보 사용',
      detailedDefinition: '제공된 정보가 검증 가능한 사실에 기반하며, 오류·왜곡·허위 내용 없이 신뢰 가능한 논리 구조로 구성되어 있는지를 평가한다.',
      factors: '명확하고 구체적임 / 일부 모호함 / 모호하고 개방적임',
    }]);
    setAllDetailItems({});
  };

  // 채점표 불러오기
  const loadGradingSheet = (sheetId: string) => {
    const sheet = savedSheets.find(s => s.id === sheetId);
    if (sheet) {
      setMajorCategories(sheet.majorCategories);
      setAllDetailItems(sheet.detailItems);
      setSelectedSheetId(sheetId);
      setIsGrading(true);
      // 채점 점수 초기화
      const initialScores: Record<string, number> = {};
      sheet.majorCategories.forEach(cat => {
        initialScores[cat.id] = 0;
      });
      setGradingScores(initialScores);
      setGradingNotes({});
      setDetailGradingScores({});
      setDetailGradingNotes({});
      setCandidateAnswer('응시자가 작성한 답안이 여기에 표시됩니다.\n\n예시 답안:\n이 문제에 대한 답변을 작성합니다. 여러 문장으로 구성된 답안을 제공합니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">채점관리</div>
            <div className="text-xs text-gray-500">시험 채점 현황 및 채점자 관리</div>
          </div>
          <Link to="/hutechc-homepage/admin/dashboard" className="text-sm text-gray-600 hover:underline">
            대시보드
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* 왼쪽 사이드바 */}
          <aside className="w-40 min-w-40 max-w-40 flex-shrink-0 bg-white border border-gray-200 rounded-lg p-3 h-fit">
            <h2 className="text-xs font-semibold text-gray-700 mb-2">채점관리</h2>
            <nav>
              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('sheets');
                      setIsCreatingSheet(false);
                      setIsGrading(false);
                      setSelectedSheetId(null);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors ${
                      activeTab === 'sheets' && !isCreatingSheet && !isGrading
                        ? 'bg-purple-50 text-purple-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    채점표 리스트
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('criteria');
                      setIsCreatingSheet(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors ${
                      activeTab === 'criteria'
                        ? 'bg-purple-50 text-purple-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    시험별 채점 기준
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* 오른쪽 컨텐츠 */}
          <div className="flex-1">
            {isGrading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsGrading(false);
                      setSelectedSheetId(null);
                      setGradingScores({});
                      setGradingNotes({});
                      setDetailGradingScores({});
                      setDetailGradingNotes({});
                      setCandidateAnswer('');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 mb-4"
                  >
                    ← 채점표 리스트로 돌아가기
                  </button>
                  <h2 className="text-xl font-bold text-gray-900">
                    {savedSheets.find(s => s.id === selectedSheetId)?.name || '채점표'} - 채점 화면
                  </h2>
                </div>

                {/* 응시자 답안 - 가로로 길게 */}
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">응시자 답안</h3>
                  <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                    <textarea
                      value={candidateAnswer}
                      onChange={(e) => setCandidateAnswer(e.target.value)}
                      placeholder="응시자 답안을 입력하거나 붙여넣으세요"
                      className="w-full border-0 bg-transparent resize-none text-sm text-gray-800 focus:outline-none"
                      rows={4}
                    />
                  </div>
                </div>

                {/* 전체 채점표 및 채점 입력 - 이미지 구조에 맞게 */}
                <div className="space-y-6">
                  {majorCategories.map((cat) => {
                    const categoryDetails = allDetailItems[cat.id] || [];
                    const maxScore = cat.score;
                    const currentScore = gradingScores[cat.id] || 0;
                    
                    return (
                      <div key={cat.id} className="border border-gray-200 rounded-md overflow-hidden">
                        {/* 대분류 헤더 */}
                        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {cat.name} ({cat.score}%)
                            </h4>
                            <div className="flex items-center gap-4">
                              {/* 전체 점수 입력 (1~5점) */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">전체 점수:</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((score) => (
                                    <button
                                      key={score}
                                      type="button"
                                      onClick={() => {
                                        const calculatedScore = Math.round((score / 5) * maxScore);
                                        setGradingScores({ ...gradingScores, [cat.id]: calculatedScore });
                                      }}
                                      className={`w-8 h-8 rounded border text-xs ${
                                        Math.round((currentScore / maxScore) * 5) === score
                                          ? 'bg-indigo-600 text-white border-indigo-600'
                                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                      }`}
                                    >
                                      {score}
                                    </button>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-600 ml-2">
                                  ({currentScore}점 / {maxScore}점)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 채점 입력 영역 - 전체 채점표와 같은 너비 */}
                        <div className="p-4">
                          <div className="grid grid-cols-[1fr,1fr,1fr] gap-4 mb-4">
                            {/* 감점요인과 해결안 */}
                            <div className="col-span-1">
                              <label className="block text-xs font-semibold text-gray-700 mb-2">
                                감점요인과 해결안
                              </label>
                              <textarea
                                value={gradingNotes[`${cat.id}_deduction`] || ''}
                                onChange={(e) => {
                                  setGradingNotes({ ...gradingNotes, [`${cat.id}_deduction`]: e.target.value });
                                }}
                                placeholder="감점요인과 해결안을 입력하세요"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs min-h-[100px]"
                              />
                            </div>
                            
                            {/* 가점요인 */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-2">
                                가점요인
                              </label>
                              <textarea
                                value={gradingNotes[`${cat.id}_bonus`] || ''}
                                onChange={(e) => {
                                  setGradingNotes({ ...gradingNotes, [`${cat.id}_bonus`]: e.target.value });
                                }}
                                placeholder="가점요인을 입력하세요"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs min-h-[100px]"
                              />
                            </div>
                            
                            {/* 특이사항 */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-2">
                                특이사항
                              </label>
                              <textarea
                                value={gradingNotes[`${cat.id}_remarks`] || ''}
                                onChange={(e) => {
                                  setGradingNotes({ ...gradingNotes, [`${cat.id}_remarks`]: e.target.value });
                                }}
                                placeholder="특이사항을 입력하세요"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs min-h-[100px]"
                              />
                            </div>
                          </div>

                          {/* 세부 항목별 점수 입력 (세부사항이 있는 경우) */}
                          {categoryDetails.length > 0 && (
                            <div className="mt-4 border-t border-gray-200 pt-4">
                              <h5 className="text-xs font-semibold text-gray-700 mb-3">세부 항목별 점수</h5>
                              <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200 text-xs">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 py-2 border border-gray-200 text-left font-semibold text-gray-700 w-32">
                                        평가 항목
                                      </th>
                                      <th className="px-3 py-2 border border-gray-200 text-center font-semibold text-gray-700">
                                        1점
                                      </th>
                                      <th className="px-3 py-2 border border-gray-200 text-center font-semibold text-gray-700">
                                        2점
                                      </th>
                                      <th className="px-3 py-2 border border-gray-200 text-center font-semibold text-gray-700">
                                        3점
                                      </th>
                                      <th className="px-3 py-2 border border-gray-200 text-center font-semibold text-gray-700">
                                        4점
                                      </th>
                                      <th className="px-3 py-2 border border-gray-200 text-center font-semibold text-gray-700">
                                        5점
                                      </th>
                                      <th className="px-3 py-2 border border-gray-200 text-left font-semibold text-gray-700">
                                        비고
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {categoryDetails.map((detail) => {
                                      const detailScore = detailGradingScores[cat.id]?.[detail.id] || 0;
                                      return (
                                        <tr key={detail.id}>
                                          <td className="px-3 py-2 border border-gray-200 font-medium text-gray-900">
                                            {detail.name || `세부 항목 ${categoryDetails.indexOf(detail) + 1}`}
                                          </td>
                                          {[1, 2, 3, 4, 5].map((score) => (
                                            <td key={score} className="px-3 py-2 border border-gray-200 text-center">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const updated = {
                                                    ...detailGradingScores,
                                                    [cat.id]: {
                                                      ...(detailGradingScores[cat.id] || {}),
                                                      [detail.id]: score,
                                                    },
                                                  };
                                                  setDetailGradingScores(updated);
                                                }}
                                                className={`w-full py-1 rounded text-xs ${
                                                  detailScore === score
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                }`}
                                              >
                                                {detailScore === score ? '✓' : ''}
                                              </button>
                                            </td>
                                          ))}
                                          <td className="px-3 py-2 border border-gray-200">
                                            <input
                                              type="text"
                                              value={detailGradingNotes[cat.id]?.[detail.id] || ''}
                                              onChange={(e) => {
                                                const updated = {
                                                  ...detailGradingNotes,
                                                  [cat.id]: {
                                                    ...(detailGradingNotes[cat.id] || {}),
                                                    [detail.id]: e.target.value,
                                                  },
                                                };
                                                setDetailGradingNotes(updated);
                                              }}
                                              placeholder="비고"
                                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                            />
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* 총점 표시 */}
                  <div className="border-t-2 border-gray-300 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">총점</span>
                      <span className="text-lg font-bold text-indigo-600">
                        {Object.values(gradingScores).reduce((sum, score) => sum + (score || 0), 0)}점 / {majorCategories.reduce((sum, cat) => sum + cat.score, 0)}점
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : isAddingDetails ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingDetails(false);
                      setSelectedCategoryId(null);
                      // 현재 대분류의 세부 사항 저장
                      if (selectedCategoryId) {
                        setAllDetailItems({ ...allDetailItems, [selectedCategoryId]: detailItems });
                      }
                      setDetailItems([]);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 mb-4"
                  >
                    ← 전체 채점표로 돌아가기
                  </button>
                  <h2 className="text-xl font-bold text-gray-900">세부 채점표</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCategoryId && majorCategories.find(c => c.id === selectedCategoryId)?.name}에 대한 세부 사항을 설정합니다.
                  </p>
                </div>

                {/* 대분류 선택 */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">대분류 선택</label>
                  <select
                    value={selectedCategoryId || ''}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value);
                      setDetailItems([]);
                    }}
                    className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">대분류를 선택하세요</option>
                    {majorCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.score}%)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCategoryId && (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        세부 사항 관리
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newId = `detail-${Date.now()}`;
                          setDetailItems([...detailItems, {
                            id: newId,
                            name: '',
                            definition: '',
                            detailedDefinition: '',
                            factors: '',
                          }]);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700"
                      >
                        + 세부 사항 추가
                      </button>
                    </div>

                    {detailItems.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 border border-gray-200 text-left text-xs font-semibold text-gray-700 w-32">세부 사항</th>
                              {detailItems.map((item) => (
                                <th key={item.id} className="px-3 py-2 border border-gray-200 text-center text-xs font-semibold text-gray-700 min-w-[200px]">
                                  <div className="flex items-center justify-between mb-2">
                                    <span>세부 사항 {detailItems.indexOf(item) + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => setDetailItems(detailItems.filter(d => d.id !== item.id))}
                                      className="text-red-600 hover:text-red-800 text-xs"
                                    >
                                      삭제
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="세부 사항 이름"
                                    value={item.name}
                                    onChange={(e) => {
                                      const updated = detailItems.map(d => 
                                        d.id === item.id ? { ...d, name: e.target.value } : d
                                      );
                                      setDetailItems(updated);
                                    }}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                  />
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-3 py-2 border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">정의</td>
                              {detailItems.map((item) => (
                                <td key={item.id} className="px-3 py-2 border border-gray-200">
                                  <textarea
                                    value={item.definition}
                                    onChange={(e) => {
                                      const updated = detailItems.map(d => 
                                        d.id === item.id ? { ...d, definition: e.target.value } : d
                                      );
                                      setDetailItems(updated);
                                    }}
                                    placeholder="정의를 입력하세요"
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs min-h-[60px]"
                                  />
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="px-3 py-2 border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">세부정의</td>
                              {detailItems.map((item) => (
                                <td key={item.id} className="px-3 py-2 border border-gray-200">
                                  <textarea
                                    value={item.detailedDefinition}
                                    onChange={(e) => {
                                      const updated = detailItems.map(d => 
                                        d.id === item.id ? { ...d, detailedDefinition: e.target.value } : d
                                      );
                                      setDetailItems(updated);
                                    }}
                                    placeholder="세부정의를 입력하세요"
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs min-h-[80px]"
                                  />
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="px-3 py-2 border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">요인</td>
                              {detailItems.map((item) => (
                                <td key={item.id} className="px-3 py-2 border border-gray-200">
                                  <input
                                    type="text"
                                    value={item.factors}
                                    onChange={(e) => {
                                      const updated = detailItems.map(d => 
                                        d.id === item.id ? { ...d, factors: e.target.value } : d
                                      );
                                      setDetailItems(updated);
                                    }}
                                    placeholder="예: 명확하고 구체적임 / 일부 모호함 / 모호하고 개방적임"
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                  />
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        세부 사항이 없습니다. &quot;+ 세부 사항 추가&quot; 버튼을 클릭하여 추가하세요.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : isCreatingSheet ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingSheet(false);
                      setSheetName('');
                      setMajorCategories([{
                        id: 'cat-1',
                        name: '정보성 / 정확도',
                        score: 30,
                        definition: '사실 기반의 정확한 정보로 구성된',
                        assumptionFactor: '정확한 정보 제공',
                        deductionFactor: '오류·부정확 정보',
                        solution: '신뢰 가능한 정보 사용',
                        detailedDefinition: '제공된 정보가 검증 가능한 사실에 기반하며, 오류·왜곡·허위 내용 없이 신뢰 가능한 논리 구조로 구성되어 있는지를 평가한다.',
                        factors: '명확하고 구체적임 / 일부 모호함 / 모호하고 개방적임',
                      }]);
                      setAllDetailItems({});
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 mb-4"
                  >
                    ← 채점표 리스트로 돌아가기
                  </button>
                  <h2 className="text-xl font-bold text-gray-900">새 채점표 만들기</h2>
                </div>

                {/* 채점표 이름 */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">채점표 이름</label>
                  <input
                    type="text"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="채점표 이름을 입력하세요"
                    className="w-full max-w-md border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>

                {/* 전체 채점표 테이블 */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">전체 채점표</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `cat-${Date.now()}`;
                        setMajorCategories([...majorCategories, {
                          id: newId,
                          name: '',
                          score: 0,
                          definition: '',
                          assumptionFactor: '',
                          deductionFactor: '',
                          solution: '',
                          detailedDefinition: '',
                          factors: '',
                        }]);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700"
                    >
                      + 대분류 추가
                    </button>
                  </div>

                  {majorCategories.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 border border-gray-200 text-left text-xs font-semibold text-gray-700 w-32">항목</th>
                            {majorCategories.map((cat) => (
                              <th key={cat.id} className="px-3 py-2 border border-gray-200 text-center text-xs font-semibold text-gray-700 min-w-[200px]">
                                <div className="flex items-center justify-between mb-2">
                                  <span>대분류 {majorCategories.indexOf(cat) + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => setMajorCategories(majorCategories.filter(c => c.id !== cat.id))}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                  >
                                    삭제
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  placeholder="대분류 이름"
                                  value={cat.name}
                                  onChange={(e) => {
                                    const updated = majorCategories.map(c => 
                                      c.id === cat.id ? { ...c, name: e.target.value } : c
                                    );
                                    setMajorCategories(updated);
                                  }}
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-3 py-2 border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">배점(%)</td>
                            {majorCategories.map((cat) => (
                              <td key={cat.id} className="px-3 py-2 border border-gray-200">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={cat.score}
                                  onChange={(e) => {
                                    const updated = majorCategories.map(c => 
                                      c.id === cat.id ? { ...c, score: Number(e.target.value) || 0 } : c
                                    );
                                    setMajorCategories(updated);
                                  }}
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-3 py-2 border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">정의</td>
                            {majorCategories.map((cat) => (
                              <td key={cat.id} className="px-3 py-2 border border-gray-200">
                                <textarea
                                  value={cat.definition}
                                  onChange={(e) => {
                                    const updated = majorCategories.map(c => 
                                      c.id === cat.id ? { ...c, definition: e.target.value } : c
                                    );
                                    setMajorCategories(updated);
                                  }}
                                  placeholder="정의를 입력하세요"
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs min-h-[60px]"
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-3 py-2 border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">1. 가정요인</td>
                            {majorCategories.map((cat) => (
                              <td key={cat.id} className="px-3 py-2 border border-gray-200">
                                <input
                                  type="text"
                                  value={cat.assumptionFactor}
                                  onChange={(e) => {
                                    const updated = majorCategories.map(c => 
                                      c.id === cat.id ? { ...c, assumptionFactor: e.target.value } : c
                                    );
                                    setMajorCategories(updated);
                                  }}
                                  placeholder="가정요인을 입력하세요"
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-3 py-2 border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">2. 감점요인</td>
                            {majorCategories.map((cat) => (
                              <td key={cat.id} className="px-3 py-2 border border-gray-200">
                                <input
                                  type="text"
                                  value={cat.deductionFactor}
                                  onChange={(e) => {
                                    const updated = majorCategories.map(c => 
                                      c.id === cat.id ? { ...c, deductionFactor: e.target.value } : c
                                    );
                                    setMajorCategories(updated);
                                  }}
                                  placeholder="감점요인을 입력하세요"
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-3 py-2 border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">3. 해결안</td>
                            {majorCategories.map((cat) => (
                              <td key={cat.id} className="px-3 py-2 border border-gray-200">
                                <input
                                  type="text"
                                  value={cat.solution}
                                  onChange={(e) => {
                                    const updated = majorCategories.map(c => 
                                      c.id === cat.id ? { ...c, solution: e.target.value } : c
                                    );
                                    setMajorCategories(updated);
                                  }}
                                  placeholder="해결안을 입력하세요"
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-3 py-2 border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">세부정의</td>
                            {majorCategories.map((cat) => (
                              <td key={cat.id} className="px-3 py-2 border border-gray-200">
                                <textarea
                                  value={cat.detailedDefinition}
                                  onChange={(e) => {
                                    const updated = majorCategories.map(c => 
                                      c.id === cat.id ? { ...c, detailedDefinition: e.target.value } : c
                                    );
                                    setMajorCategories(updated);
                                  }}
                                  placeholder="세부정의를 입력하세요"
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs min-h-[80px]"
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="px-3 py-2 border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">요인</td>
                            {majorCategories.map((cat) => (
                              <td key={cat.id} className="px-3 py-2 border border-gray-200">
                                <input
                                  type="text"
                                  value={cat.factors}
                                  onChange={(e) => {
                                    const updated = majorCategories.map(c => 
                                      c.id === cat.id ? { ...c, factors: e.target.value } : c
                                    );
                                    setMajorCategories(updated);
                                  }}
                                  placeholder="예: 명확하고 구체적임 / 일부 모호함 / 모호하고 개방적임"
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                />
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      대분류가 없습니다. &quot;+ 대분류 추가&quot; 버튼을 클릭하여 추가하세요.
                    </div>
                  )}
                </div>

                {/* 저장 및 세부 채점 추가하기 버튼 */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (majorCategories.length > 0) {
                        // 현재 대분류의 세부 사항 저장
                        if (selectedCategoryId && detailItems.length > 0) {
                          setAllDetailItems({ ...allDetailItems, [selectedCategoryId]: detailItems });
                        }
                        setSelectedCategoryId(majorCategories[0].id);
                        setIsAddingDetails(true);
                        // 현재 대분류의 세부 사항 불러오기
                        if (allDetailItems[majorCategories[0].id]) {
                          setDetailItems(allDetailItems[majorCategories[0].id]);
                        } else {
                          setDetailItems([]);
                        }
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-semibold hover:bg-purple-700"
                  >
                    세부 채점 추가하기
                  </button>
                  <button
                    type="button"
                    onClick={saveGradingSheet}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700"
                  >
                    채점표 저장하기
                  </button>
                </div>
              </div>
            ) : activeTab === 'sheets' ? (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">채점표 리스트</h1>
                    <p className="text-sm text-gray-600">생성된 채점표 목록을 확인하고 관리합니다.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreatingSheet(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700"
                  >
                    + 채점표 추가하기
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">채점표 이름</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">시험명</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">세부사항</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">생성일</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">수정일</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">상태</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">작업</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[...DUMMY_GRADING_SHEETS, ...savedSheets.map(s => ({
                        id: s.id,
                        name: s.name,
                        examName: '관리자 채점표',
                        createdAt: s.createdAt,
                        updatedAt: s.updatedAt,
                        status: 'active' as const,
                        hasDetails: Object.keys(s.detailItems).length > 0 && Object.values(s.detailItems).some(details => details.length > 0),
                      }))].map((sheet) => {
                        const savedSheet = savedSheets.find(s => s.id === sheet.id);
                        const hasDetails = savedSheet 
                          ? Object.keys(savedSheet.detailItems).length > 0 && Object.values(savedSheet.detailItems).some(details => details.length > 0)
                          : false;
                        
                        return (
                          <tr key={sheet.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              <button
                                type="button"
                                onClick={() => {
                                  if (savedSheets.find(s => s.id === sheet.id)) {
                                    loadGradingSheet(sheet.id);
                                  } else {
                                    alert('저장된 채점표가 아닙니다. 먼저 채점표를 생성하고 저장하세요.');
                                  }
                                }}
                                className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                              >
                                {sheet.name}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">{sheet.examName}</td>
                            <td className="px-4 py-3 text-sm">
                              {savedSheet ? (
                                hasDetails ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    <span>✓</span>
                                    <span>있음</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                    <span>없음</span>
                                  </span>
                                )
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{sheet.createdAt}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{sheet.updatedAt}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  sheet.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {sheet.status === 'active' ? '활성' : '비활성'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {savedSheets.find(s => s.id === sheet.id) && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const foundSheet = savedSheets.find(s => s.id === sheet.id);
                                        if (foundSheet) {
                                          setSheetName(foundSheet.name);
                                          setMajorCategories(foundSheet.majorCategories);
                                          setAllDetailItems(foundSheet.detailItems);
                                          setIsCreatingSheet(true);
                                        }
                                      }}
                                      className="text-xs text-indigo-600 hover:text-indigo-800"
                                    >
                                      수정
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm('정말 삭제하시겠습니까?')) {
                                          const updated = savedSheets.filter(s => s.id !== sheet.id);
                                          setSavedSheets(updated);
                                          localStorage.setItem('grading-sheets', JSON.stringify(updated));
                                        }
                                      }}
                                      className="text-xs text-red-600 hover:text-red-800"
                                    >
                                      삭제
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">시험별 채점 기준</h1>
                  <p className="text-sm text-gray-600">시험별 채점 기준을 확인하고 관리합니다.</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-600">시험별 채점 기준 내용을 여기에 추가하세요.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
