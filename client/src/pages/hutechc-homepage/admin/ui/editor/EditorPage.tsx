/* 원본: hutechc_hompage_real/app/(client-layout)/admin/ui/editor/page.tsx */
import { Link } from 'react-router';
import { useState } from 'react';

const AI_MODELS = [
  { id: 'chatgpt', label: 'ChatGPT' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'wrtn', label: 'wrtn.' },
  { id: 'other', label: '다른 AI' },
];

interface EditorSection {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  order: number;
  x: number; // 그리드 x 위치 (1부터 시작)
  y: number; // 그리드 y 위치 (1부터 시작)
  width: number; // 그리드 너비 (칸 수)
  height: number; // 그리드 높이 (칸 수)
}

interface EditorConfig {
  id: string;
  name: string;
  aiModels: string[];
  isActive: boolean;
  sections: EditorSection[];
}

const GRID_COLS = 12; // 그리드 열 수
const GRID_ROWS = 20; // 그리드 행 수

export default function EditorPage() {
  const [editors, setEditors] = useState<EditorConfig[]>([
    {
      id: '1',
      name: '기본 에디터',
      aiModels: ['chatgpt'],
      isActive: true,
      sections: [
        {
          id: '1',
          title: '1. 원문',
          description: 'AI 번역기 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.',
          placeholder: '원문 내용이 여기에 표시됩니다.',
          order: 1,
          x: 1,
          y: 1,
          width: 4,
          height: 4,
        },
        {
          id: '2',
          title: '2. 목적',
          description: 'AI 번역기 내용이 기본적으로 보여진 후, 수정된 내용만 색상으로 표시되는 형식입니다.',
          placeholder: 'This is the area where the example answer is displayed.',
          order: 2,
          x: 5,
          y: 1,
          width: 4,
          height: 4,
        },
      ],
    },
  ]);
  const [selectedEditorId, setSelectedEditorId] = useState<string>('1');
  const [newEditorName, setNewEditorName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const [resizingSectionId, setResizingSectionId] = useState<string | null>(null);

  const selectedEditor = editors.find((e) => e.id === selectedEditorId) || editors[0];

  const handleAddEditor = () => {
    if (!newEditorName.trim()) {
      alert('에디터 이름을 입력해주세요.');
      return;
    }

    const newEditor: EditorConfig = {
      id: Date.now().toString(),
      name: newEditorName,
      aiModels: [],
      isActive: true,
      sections: [
        {
          id: Date.now().toString() + '-1',
          title: '1. 새 섹션',
          description: '섹션 설명을 입력하세요.',
          placeholder: '내용을 입력하세요.',
          order: 1,
          x: 1,
          y: 1,
          width: 4,
          height: 4,
        },
      ],
    };

    setEditors([...editors, newEditor]);
    setSelectedEditorId(newEditor.id);
    setNewEditorName('');
    setShowAddForm(false);
  };

  const handleDeleteEditor = (id: string) => {
    if (editors.length === 1) {
      alert('최소 1개의 에디터는 유지해야 합니다.');
      return;
    }
    if (confirm('이 에디터를 삭제하시겠습니까?')) {
      const newEditors = editors.filter((e) => e.id !== id);
      setEditors(newEditors);
      if (selectedEditorId === id) {
        setSelectedEditorId(newEditors[0].id);
      }
    }
  };

  const handleToggleAIModel = (modelId: string) => {
    setEditors(
      editors.map((editor) => {
        if (editor.id === selectedEditorId) {
          const hasModel = editor.aiModels.includes(modelId);
          return {
            ...editor,
            aiModels: hasModel
              ? editor.aiModels.filter((m) => m !== modelId)
              : [...editor.aiModels, modelId],
          };
        }
        return editor;
      })
    );
  };

  // 충돌 감지 함수 (공백 허용 - 블록이 겹치지만 않으면 됨)
  const checkCollision = (x: number, y: number, width: number, height: number, excludeId?: string): boolean => {
    return selectedEditor.sections.some((s) => {
      if (excludeId && s.id === excludeId) return false;
      // 블록이 겹치는지만 체크 (공백은 허용)
      return !(
        x + width <= s.x ||
        x >= s.x + s.width ||
        y + height <= s.y ||
        y >= s.y + s.height
      );
    });
  };

  const handleAddSection = () => {
    const newOrder = selectedEditor.sections.length + 1;
    // 빈 공간 찾기 - 가로/세로 모두 자유롭게 배치 가능
    let newX = 1;
    let newY = 1;
    let found = false;
    const defaultWidth = 3;
    const defaultHeight = 4;

    // 모든 가능한 위치를 체크 (가로 우선, 그 다음 세로)
    for (let y = 1; y <= GRID_ROWS - defaultHeight + 1; y++) {
      for (let x = 1; x <= GRID_COLS - defaultWidth + 1; x++) {
        if (!checkCollision(x, y, defaultWidth, defaultHeight)) {
          newX = x;
          newY = y;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    // 빈 공간을 찾지 못한 경우, 가장 아래쪽에 배치
    if (!found) {
      // 기존 섹션들의 가장 아래 위치 찾기
      const maxY = selectedEditor.sections.length > 0
        ? Math.max(...selectedEditor.sections.map(s => s.y + s.height))
        : 0;
      newY = Math.min(maxY + 1, GRID_ROWS - defaultHeight + 1);
      newX = 1;
    }

    const newSection: EditorSection = {
      id: Date.now().toString(),
      title: `${newOrder}. 새 섹션`,
      description: '섹션 설명을 입력하세요.',
      placeholder: '내용을 입력하세요.',
      order: newOrder,
      x: newX,
      y: newY,
      width: defaultWidth,
      height: defaultHeight,
    };

    setEditors(
      editors.map((editor) => {
        if (editor.id === selectedEditorId) {
          return {
            ...editor,
            sections: [...editor.sections, newSection],
          };
        }
        return editor;
      })
    );
  };

  const handleDeleteSection = (sectionId: string) => {
    if (selectedEditor.sections.length === 1) {
      alert('최소 1개의 섹션은 유지해야 합니다.');
      return;
    }
    setEditors(
      editors.map((editor) => {
        if (editor.id === selectedEditorId) {
          return {
            ...editor,
            sections: editor.sections.filter((s) => s.id !== sectionId),
          };
        }
        return editor;
      })
    );
  };

  const handleUpdateSection = (sectionId: string, field: keyof EditorSection, value: string | number) => {
    setEditors(
      editors.map((editor) => {
        if (editor.id === selectedEditorId) {
          return {
            ...editor,
            sections: editor.sections.map((section) => {
              if (section.id === sectionId) {
                return { ...section, [field]: value };
              }
              return section;
            }),
          };
        }
        return editor;
      })
    );
  };

  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggingSectionId(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    // 드래그 이미지 투명도 설정
    e.dataTransfer.setData('text/plain', '');
  };

  // 그리드 위치 계산 헬퍼 함수
  const calculateGridPosition = (e: React.DragEvent | React.MouseEvent, gridContainer: HTMLElement) => {
    const rect = gridContainer.getBoundingClientRect();
    const padding = 8;
    const gap = 8;
    
    // 마우스 위치를 그리드 컨테이너 내 상대 위치로 변환
    const relativeX = Math.max(0, e.clientX - rect.left - padding);
    const relativeY = Math.max(0, e.clientY - rect.top - padding);
    
    // 그리드 컨테이너의 실제 사용 가능한 크기
    const containerWidth = rect.width - padding * 2;
    const containerHeight = rect.height - padding * 2;
    
    // 각 셀의 실제 크기 (gap 제외)
    const cellWidth = (containerWidth - gap * (GRID_COLS - 1)) / GRID_COLS;
    const cellHeight = (containerHeight - gap * (GRID_ROWS - 1)) / GRID_ROWS;
    
    // gap을 고려한 그리드 위치 계산
    // 각 셀은 cellWidth 크기이고, 셀 사이에 gap이 있음
    // 간단한 계산: relativeX / (cellWidth + gap)의 정수 부분 + 1
    let gridX = Math.floor(relativeX / (cellWidth + gap)) + 1;
    let gridY = Math.floor(relativeY / (cellHeight + gap)) + 1;
    
    // 경계 체크
    gridX = Math.max(1, Math.min(gridX, GRID_COLS));
    gridY = Math.max(1, Math.min(gridY, GRID_ROWS));
    
    return { gridX, gridY };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!draggingSectionId) return;

    const gridContainer = e.currentTarget as HTMLElement;
    const { gridX, gridY } = calculateGridPosition(e, gridContainer);

    const section = selectedEditor.sections.find((s) => s.id === draggingSectionId);
    if (!section) return;

    // 경계 체크
    const newX = Math.max(1, Math.min(gridX, GRID_COLS - section.width + 1));
    const newY = Math.max(1, Math.min(gridY, GRID_ROWS - section.height + 1));

    // 현재 위치와 동일하면 업데이트하지 않음
    if (newX === section.x && newY === section.y) {
      return;
    }

    // 충돌 방지: 다른 섹션과 겹치지 않도록 조정
    if (checkCollision(newX, newY, section.width, section.height, draggingSectionId)) {
      // 충돌이 발생하면 원래 위치 유지
      return;
    }

    // 위치 업데이트
    handleUpdateSection(draggingSectionId, 'x', newX);
    handleUpdateSection(draggingSectionId, 'y', newY);
  };

  const handleDragEnd = () => {
    setDraggingSectionId(null);
  };

  const handleResize = (sectionId: string, direction: 'width' | 'height', newValue: number) => {
    const section = selectedEditor.sections.find((s) => s.id === sectionId);
    if (!section) return;

    if (direction === 'width') {
      const newWidth = Math.max(2, Math.min(newValue, GRID_COLS - section.x + 1));
      // 충돌 체크 (공백은 허용하므로 겹치지만 않으면 됨)
      if (newWidth !== section.width && !checkCollision(section.x, section.y, newWidth, section.height, sectionId)) {
        handleUpdateSection(sectionId, 'width', newWidth);
      }
    } else {
      const newHeight = Math.max(2, Math.min(newValue, GRID_ROWS - section.y + 1));
      // 충돌 체크
      if (newHeight !== section.height && !checkCollision(section.x, section.y, section.width, newHeight, sectionId)) {
        handleUpdateSection(sectionId, 'height', newHeight);
      }
    }
  };

  const handleSave = () => {
    // localStorage에 저장 (현재 선택된 에디터 저장)
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('editorConfig', JSON.stringify(selectedEditor));
        alert('설정이 저장되었습니다.');
      }
    } catch (e) {
      console.error('Failed to save editor config', e);
      alert('설정 저장에 실패했습니다.');
    }
  };

  const handleApply = () => {
    // 현재 선택된 에디터를 활성화하고 저장
    try {
      if (typeof window !== 'undefined') {
        // 현재 선택된 에디터를 활성화
        const updatedEditors = editors.map((e) => ({
          ...e,
          isActive: e.id === selectedEditorId,
        }));
        setEditors(updatedEditors);
        
        // 활성화된 에디터 저장
        const activeEditor = { ...selectedEditor, isActive: true };
        window.localStorage.setItem('editorConfig', JSON.stringify(activeEditor));
        
        // localStorage 변경 이벤트 발생시키기 (같은 탭에서 감지하기 위해)
        window.dispatchEvent(new Event('storage'));
        
        // 실제 에디터 페이지가 열려있으면 새로고침하도록 알림
        const shouldOpenEditor = confirm('설정이 적용되었습니다.\n실제 에디터 화면을 확인하시겠습니까?');
        if (shouldOpenEditor) {
          window.open('/translate/meta/new/editor?preview=true', '_blank');
        }
      }
    } catch (e) {
      console.error('Failed to apply editor config', e);
      alert('설정 적용에 실패했습니다.');
    }
  };

  const handlePreview = () => {
    // 새 창에서 실제 에디터 화면 열기 (현재 선택된 에디터 사용)
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('editorConfig', JSON.stringify(selectedEditor));
        window.open('/translate/meta/new/editor?preview=true', '_blank');
      }
    } catch (e) {
      console.error('Failed to open preview', e);
      alert('미리보기를 열 수 없습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="text-lg font-bold">에디터 UI 설정</div>
          <Link to="/hutechc-homepage/admin/ui" className="text-xs text-gray-600 hover:text-gray-900">
            ← 사용자 UI관리로 돌아가기
          </Link>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6 flex gap-6">
        {/* 왼쪽 사이드바 - 에디터 목록 */}
        <aside className="w-80 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">에디터 목록</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                + 추가
              </button>
            </div>

            {/* 에디터 추가 폼 */}
            {showAddForm && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                <input
                  type="text"
                  value={newEditorName}
                  onChange={(e) => setNewEditorName(e.target.value)}
                  placeholder="에디터 이름"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddEditor}
                    className="flex-1 px-2 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewEditorName('');
                    }}
                    className="flex-1 px-2 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-gray-50"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 에디터 목록 */}
            <div className="space-y-2">
              {editors.map((editor) => (
                <div
                  key={editor.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedEditorId === editor.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => setSelectedEditorId(editor.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">{editor.name}</h3>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          editor.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {editor.isActive ? '활성' : '비활성'}
                      </span>
                    </div>
                    {editors.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEditor(editor.id);
                        }}
                        className="text-red-600 hover:text-red-700 text-xs"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    섹션 {editor.sections.length}개 · AI {editor.aiModels.length}개
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI 모델 선택 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">사용할 AI 모델</h3>
            <div className="space-y-2">
              {AI_MODELS.map((model) => {
                const isSelected = selectedEditor.aiModels.includes(model.id);
                return (
                  <label
                    key={model.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-2 border-indigo-600'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleAIModel(model.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{model.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        {/* 오른쪽 메인 영역 - 에디터 화면 미리보기 및 편집 */}
        <section className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* 에디터 헤더 */}
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedEditor.name}</h2>
                <p className="text-xs text-gray-500 mt-1">에디터 화면 구성 편집 (드래그하여 이동, 모서리를 드래그하여 크기 조절)</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEditor.isActive}
                    onChange={() =>
                      setEditors(
                        editors.map((e) =>
                          e.id === selectedEditorId ? { ...e, isActive: !e.isActive } : e
                        )
                      )
                    }
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">활성화</span>
                </label>
                <button
                  onClick={handleAddSection}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  + 섹션 추가
                </button>
              </div>
            </div>

            {/* 그리드 기반 에디터 화면 */}
            <div className="p-6">
              <div
                className="relative border-2 border-dashed border-gray-300 rounded-lg"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${GRID_ROWS}, 20px)`,
                    gap: '8px',
                    padding: '8px',
                    minHeight: `${GRID_ROWS * 20 + 16}px`,
                  }}
                onDragOver={handleDragOver}
              >
                {selectedEditor.sections.map((section) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, section.id)}
                    onDragOver={(e) => {
                      // 섹션 블록 위에서도 드래그 이벤트가 발생하도록 처리
                      e.preventDefault();
                      e.stopPropagation();
                      if (!draggingSectionId) return;
                      
                      // 그리드 컨테이너 찾기
                      const gridContainer = (e.currentTarget as HTMLElement).closest('[style*="grid"]') as HTMLElement;
                      if (!gridContainer) return;
                      
                      const { gridX, gridY } = calculateGridPosition(e, gridContainer);
                      const draggingSection = selectedEditor.sections.find((s) => s.id === draggingSectionId);
                      if (!draggingSection) return;

                      // 경계 체크
                      const newX = Math.max(1, Math.min(gridX, GRID_COLS - draggingSection.width + 1));
                      const newY = Math.max(1, Math.min(gridY, GRID_ROWS - draggingSection.height + 1));

                      // 현재 위치와 동일하면 업데이트하지 않음
                      if (newX === draggingSection.x && newY === draggingSection.y) {
                        return;
                      }

                      // 충돌 방지: 다른 섹션과 겹치지 않도록 조정
                      if (checkCollision(newX, newY, draggingSection.width, draggingSection.height, draggingSectionId)) {
                        return;
                      }

                      // 위치 업데이트
                      handleUpdateSection(draggingSectionId, 'x', newX);
                      handleUpdateSection(draggingSectionId, 'y', newY);
                    }}
                    onDragEnd={handleDragEnd}
                    className={`relative border-2 rounded-lg bg-white p-2 cursor-move hover:shadow-lg transition-shadow group overflow-hidden ${
                      draggingSectionId === section.id
                        ? 'border-indigo-600 opacity-50'
                        : 'border-indigo-400'
                    }`}
                    style={{
                      gridColumn: `${section.x} / span ${section.width}`,
                      gridRow: `${section.y} / span ${section.height}`,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                    }}
                  >
                    {editingSectionId === section.id ? (
                      <div className="space-y-1.5 h-full flex flex-col overflow-hidden">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)}
                          className="w-full px-2 py-1 text-xs font-bold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="섹션 제목"
                        />
                        <textarea
                          value={section.description}
                          onChange={(e) => handleUpdateSection(section.id, 'description', e.target.value)}
                          rows={1}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none overflow-hidden"
                          placeholder="섹션 설명"
                        />
                        <input
                          type="text"
                          value={section.placeholder}
                          onChange={(e) => handleUpdateSection(section.id, 'placeholder', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="플레이스홀더"
                        />
                        <div className="flex gap-1 mt-auto">
                          <button
                            onClick={() => setEditingSectionId(null)}
                            className="flex-1 px-2 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingSectionId(null)}
                            className="flex-1 px-2 py-1 border border-gray-300 text-gray-700 rounded text-xs font-semibold hover:bg-gray-50"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-1.5 flex-shrink-0">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-bold text-gray-900 mb-0.5 truncate">{section.title}</h3>
                            <p className="text-xs text-gray-600 line-clamp-1">{section.description}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                              onClick={() => setEditingSectionId(section.id)}
                              className="px-1 py-0.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                              편집
                            </button>
                            {selectedEditor.sections.length > 1 && (
                              <button
                                onClick={() => handleDeleteSection(section.id)}
                                className="px-1 py-0.5 text-xs text-red-600 hover:text-red-700 font-medium"
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        </div>
                        <textarea
                          rows={2}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none resize-none flex-1 min-h-0 overflow-hidden"
                          placeholder={section.placeholder}
                          readOnly
                          style={{ height: '100%' }}
                        />
                      </>
                    )}
                    {/* 크기 조절 핸들 */}
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 bg-indigo-500 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity rounded-tl z-10"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setResizingSectionId(section.id);
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = section.width;
                        const startHeight = section.height;
                        const gridContainer = (e.currentTarget as HTMLElement).closest('[style*="grid"]') as HTMLElement;
                        if (!gridContainer) return;
                        const rect = gridContainer.getBoundingClientRect();
                        const padding = 8;
                        const gap = 8;
                        const availableWidth = rect.width - padding * 2;
                        const availableHeight = rect.height - padding * 2;
                        const cellWidth = availableWidth / GRID_COLS;
                        const cellHeight = availableHeight / GRID_ROWS;

                        let lastDeltaX = 0;
                        let lastDeltaY = 0;

                        const handleMouseMove = (e: MouseEvent) => {
                          const deltaX = Math.round((e.clientX - startX) / cellWidth);
                          const deltaY = Math.round((e.clientY - startY) / cellHeight);
                          
                          // 변화가 있을 때만 업데이트
                          if (deltaX !== lastDeltaX) {
                            const newWidth = startWidth + deltaX;
                            handleResize(section.id, 'width', newWidth);
                            lastDeltaX = deltaX;
                          }
                          
                          if (deltaY !== lastDeltaY) {
                            const newHeight = startHeight + deltaY;
                            handleResize(section.id, 'height', newHeight);
                            lastDeltaY = deltaY;
                          }
                        };

                        const handleMouseUp = () => {
                          setResizingSectionId(null);
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };

                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 저장 및 적용 버튼 */}
            <div className="border-t border-gray-200 p-4 flex justify-end gap-2">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                저장
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                적용하기
              </button>
              <button
                onClick={handlePreview}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                실제 화면 보기
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
