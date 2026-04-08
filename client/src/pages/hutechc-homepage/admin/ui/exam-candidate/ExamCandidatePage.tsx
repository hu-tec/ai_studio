/* 원본: hutechc_hompage_real/app/(client-layout)/admin/ui/exam-candidate/page.tsx */
import { Link } from 'react-router';
import { useExamUiConfig, PanelWidgetType, PanelRowConfig } from '../../../lib/examUiConfig';

const QUICK_MENUS = [
  { id: 'expert-matching', label: '전문가 매칭' },
  { id: 'search-history', label: '검색 내역' },
  { id: 'favorite-menu', label: '바로가기 메뉴' },
  { id: 'back-to-default', label: '기본으로 돌아가는 메뉴' },
  { id: 'chatbot', label: '챗봇' },
];

const UPLOAD_OPTIONS = [
  { id: 'category', label: '카테고리 설정' },
  { id: 'use-editor', label: '에디터 사용 여부' },
  { id: 'use-ai', label: 'AI 사용' },
  { id: 'summary', label: '요약 기능' },
  { id: 'split', label: '분리 기능' },
  { id: 'file-type', label: '파일 형식 선택' },
];

const RIGHT_MENU_FEATURES = [
  { id: 'none', label: '선택 안 함' },
  { id: 'memo', label: '메모 보기' },
  { id: 'stats', label: '통계 보기' },
  { id: 'help', label: '도움말' },
];

const PANEL_WIDGET_OPTIONS: { id: PanelWidgetType; label: string }[] = [
  { id: '영상 보기', label: '영상 보기' },
  { id: '요약 보기', label: '요약 보기' },
  { id: '목차 만들기', label: '목차 만들기' },
  { id: '문단 보기', label: '문단 보기' },
  { id: 'AI 도우미', label: 'AI 도우미' },
  { id: '하이라이트', label: '하이라이트' },
  { id: '옵션 없음', label: '옵션 없음' },
];

function createRow(idPrefix: string): PanelRowConfig {
  return {
    id: `${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    col1: '영상 보기',
    col2: '요약 보기',
    col3: '옵션 없음',
    enableTooltip: true,
    enableAiSummary: true,
  };
}

export default function ExamCandidatePage() {
  const { config, update, reset } = useExamUiConfig('candidate');

  const toggleQuickMenu = (id: string) => {
    const current = config.quickMenuEnabledIds || [];
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    update({ quickMenuEnabledIds: next });
  };

  const toggleUploadOption = (id: string) => {
    const current = config.uploadOptionEnabledIds || [];
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    update({ uploadOptionEnabledIds: next });
  };

  const updateRightMenu = (key: 'menu1' | 'menu2' | 'menu3' | 'menu4', value: string) => {
    update({ rightMenuTabs: { ...config.rightMenuTabs, [key]: value } });
  };

  const updatePanelRows = (
    panelKey: 'originalPanelRows' | 'aiPanelRows' | 'comparePanelRows' | 'editorPanelRows',
    rows: PanelRowConfig[],
  ) => {
    update({ [panelKey]: rows } as Partial<typeof config>);
  };

  const renderPanelRows = (
    panelKey: 'originalPanelRows' | 'aiPanelRows' | 'comparePanelRows' | 'editorPanelRows',
    title: string,
  ) => {
    const rows = config[panelKey] || [];

    const handleChange = (rowId: string, field: keyof PanelRowConfig, value: PanelWidgetType | boolean) => {
      const next = rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]: value,
            }
          : row,
      );
      updatePanelRows(panelKey, next);
    };

    const addRow = () => {
      updatePanelRows(panelKey, [...rows, createRow(panelKey)]);
    };

    const removeRow = (rowId: string) => {
      updatePanelRows(panelKey, rows.filter((row) => row.id !== rowId));
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2 flex flex-col h-full">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold text-gray-900 truncate">{title}</h3>
          <button
            type="button"
            onClick={addRow}
            className="text-[11px] text-indigo-600 hover:underline flex-shrink-0"
          >
            + 설정 추가
          </button>
        </div>
        <div className="space-y-2 text-xs overflow-y-auto">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid md:grid-cols-[1.3fr,1.3fr,1.3fr,auto] gap-2 items-center border rounded-md p-2 bg-gray-50"
            >
              {["col1", "col2", "col3"].map((colKey) => (
                <select
                  // eslint-disable-next-line react/no-array-index-key
                  key={colKey + row.id}
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                  value={row[colKey as keyof PanelRowConfig] as PanelWidgetType}
                  onChange={(e) =>
                    handleChange(row.id, colKey as keyof PanelRowConfig, e.target.value as PanelWidgetType)
                  }
                >
                  {PANEL_WIDGET_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ))}

              <div className="flex flex-col gap-1 text-[11px]">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={row.enableTooltip}
                    onChange={(e) => handleChange(row.id, 'enableTooltip', e.target.checked)}
                  />
                  <span>툴팁</span>
                </label>
                <label className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={row.enableAiSummary}
                    onChange={(e) => handleChange(row.id, 'enableAiSummary', e.target.checked)}
                  />
                  <span>AI 요약</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="mt-1 text-[11px] text-gray-500 hover:text-red-500 self-start"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="text-[11px] text-gray-500 border border-dashed border-gray-300 rounded-md p-3 text-center">
              아직 설정이 없습니다. &quot;설정 추가&quot; 버튼을 눌러 행을 추가하세요.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="text-lg font-bold">시험 응시자 UI 설정</div>
          <Link to="/hutechc-homepage/admin/ui" className="text-xs text-gray-600 hover:text-gray-900">
            ← 사용자 UI관리로 돌아가기
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6 text-sm">
        {/* 왼쪽 바로가기(사이드바) 설정 */}
        <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">바로가기 설정 (왼쪽 메뉴바)</h2>
          <p className="text-[11px] text-gray-600">
            응시 화면 왼쪽 사이드바에 어떤 바로가기 메뉴를 노출할지 선택합니다.
          </p>
          <div className="grid md:grid-cols-2 gap-2 text-xs">
            {QUICK_MENUS.map((item) => (
              <label key={item.id} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.quickMenuEnabledIds?.includes(item.id)}
                  onChange={() => toggleQuickMenu(item.id)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* 업로드 화면 구성 */}
        <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">업로드 화면 구성</h2>
          <p className="text-[11px] text-gray-600">
            파일 업로드/입력 화면에서 사용할 기능을 선택합니다.
          </p>
          <div className="grid md:grid-cols-2 gap-2 text-xs">
            {UPLOAD_OPTIONS.map((opt) => (
              <label key={opt.id} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.uploadOptionEnabledIds?.includes(opt.id)}
                  onChange={() => toggleUploadOption(opt.id)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* 오른쪽 메뉴 탭 설정 */}
        <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">화면편의기능 (오른쪽 메뉴바)</h2>
          <p className="text-[11px] text-gray-600">
            응시 화면 오른쪽 탭 메뉴(메뉴 1~3)에 어떤 기능을 배치할지 설정합니다.
          </p>
          <div className="grid md:grid-cols-3 gap-3 text-xs">
            {(['menu1', 'menu2', 'menu3'] as const).map((key, index) => (
              <div key={key}>
                <label className="block mb-1 text-gray-600">메뉴 {index + 1}</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                  value={config.rightMenuTabs?.[key] ?? 'none'}
                  onChange={(e) => updateRightMenu(key, e.target.value)}
                >
                  {RIGHT_MENU_FEATURES.map((feature) => (
                    <option key={feature.id} value={feature.id}>
                      {feature.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* 패널 표시 여부 및 순서 */}
        <section className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="text-base font-semibold text-gray-900">패널 표시 및 순서</h2>
          <p className="text-[11px] text-gray-600">
            원문 / AI / 비교 / 에디터 패널의 사용 여부와 가로 순서를 지정합니다.
          </p>
          <div className="grid md:grid-cols-4 gap-3 text-xs">
            <div className="border rounded-md p-2">
              <label className="inline-flex items-center gap-1 mb-2">
                <input
                  type="checkbox"
                  checked={config.showOriginalPanel}
                  onChange={(e) => update({ showOriginalPanel: e.target.checked })}
                />
                <span className="font-semibold text-gray-800">원문 패널</span>
              </label>
              <div className="mt-1">
                <span className="block mb-1 text-gray-600">표시 순서</span>
                <input
                  type="number"
                  min={1}
                  max={4}
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                  value={config.originalOrder}
                  onChange={(e) => update({ originalOrder: Number(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="border rounded-md p-2">
              <label className="inline-flex items-center gap-1 mb-2">
                <input
                  type="checkbox"
                  checked={config.showAiPanel}
                  onChange={(e) => update({ showAiPanel: e.target.checked })}
                />
                <span className="font-semibold text-gray-800">AI 패널</span>
              </label>
              <div className="mt-1">
                <span className="block mb-1 text-gray-600">표시 순서</span>
                <input
                  type="number"
                  min={1}
                  max={4}
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                  value={config.aiOrder}
                  onChange={(e) => update({ aiOrder: Number(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="border rounded-md p-2">
              <label className="inline-flex items-center gap-1 mb-2">
                <input
                  type="checkbox"
                  checked={config.showComparePanel}
                  onChange={(e) => update({ showComparePanel: e.target.checked })}
                />
                <span className="font-semibold text-gray-800">비교 패널</span>
              </label>
              <div className="mt-1">
                <span className="block mb-1 text-gray-600">표시 순서</span>
                <input
                  type="number"
                  min={1}
                  max={4}
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                  value={config.compareOrder}
                  onChange={(e) => update({ compareOrder: Number(e.target.value) || 1 })}
                />
              </div>
            </div>

            <div className="border rounded-md p-2">
              <label className="inline-flex items-center gap-1 mb-2">
                <input
                  type="checkbox"
                  checked={config.showEditorPanel}
                  onChange={(e) => update({ showEditorPanel: e.target.checked })}
                />
                <span className="font-semibold text-gray-800">에디터 패널</span>
              </label>
              <div className="mt-1">
                <span className="block mb-1 text-gray-600">표시 순서</span>
                <input
                  type="number"
                  min={1}
                  max={4}
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5"
                  value={config.editorOrder}
                  onChange={(e) => update({ editorOrder: Number(e.target.value) || 1 })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 패널별 상세 구성 */}
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900">패널별 상세 구성</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {renderPanelRows('originalPanelRows', '원문 화면 구성')}
            {renderPanelRows('aiPanelRows', 'AI 화면 구성')}
            {renderPanelRows('comparePanelRows', '비교화면 구성')}
            {renderPanelRows('editorPanelRows', '에디터 구성')}
          </div>
        </section>

        <div className="flex items-center justify-between text-xs">
          <div className="text-indigo-600">
            미리보기:{' '}
            <Link to="/hutechc-homepage/mypage/exam/test" className="underline">
              /mypage/exam/test
            </Link>
          </div>
          <div className="space-x-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              기본값으로 초기화
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
