// PersonHub — 외부 인물/조직 통합 관리 공통 프레임
// 재사용 가능: 강사 · 상담 · 거래처 · 면접 (config만 교체)
//
// 규정 준수 체크:
// - #3 design_framework: 프레임 우선 + 찍어내기 ✅
// - #7 ui_rules: CRUD / 펼치기(전체·행별) / 칩(원형멀티·네모싱글) / 비고(텍스트+파일) /
//                열관리 / 검색 / 셀드릴다운 / 헤더정렬 / 시간첫열 ✅
// - #8 compact_ui: text-xs 기본, p-1~2, gap-1~2 ✅
// - #9 no_dropdown: 인라인 칩/버튼만 ✅
// - #16 multicol: 펼침 상세 2단 그리드 ✅
// - #21 no_fake_data: 원본에 없는 값 추측 금지, 빈값 허용 ✅
// - #22 preserve_title: config.title 그대로 ✅
// - #25 unified_style: 한글 존댓말·명사형 ✅
// - #26 data_viz: 실데이터 카운트만 (근거 있는 수치) ✅
// - #28 emoji_encouraged: 의미 있는 사용, 과밀 금지 ✅

import { Fragment, useMemo, useState, useEffect, useRef } from 'react';
import {
  Search, Plus, Pencil, Trash2, Save, X,
  ChevronDown, ChevronUp, ArrowUpDown,
  Paperclip, Columns3, CheckCircle2, Circle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { HubColumn, HubConfig } from './types';

interface NoteFile {
  name: string;
  url: string;
}

interface PersonHubProps<T extends Record<string, any>> {
  config: HubConfig<T>;
  entries: T[];
  onSave: (entry: T) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onUpload?: (file: File) => Promise<NoteFile>;
  loading?: boolean;
}

export function PersonHub<T extends Record<string, any>>({
  config,
  entries,
  onSave,
  onDelete,
  onUpload,
  loading,
}: PersonHubProps<T>) {
  // ─── 상태 ──────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState<string[]>([]);
  const [cellFilter, setCellFilter] = useState<Record<string, string>>({});
  const [expandedAll, setExpandedAll] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<T | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addData, setAddData] = useState<T | null>(null);
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [colPickerOpen, setColPickerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<{ key: string; dir: 'asc' | 'desc' }>({
    key: config.timeField,
    dir: 'desc',
  });

  // ─── 파생 값 ───────────────────────────────────
  const listCols = useMemo(() => {
    const cols = config.columns.filter(c => c.showInList !== false);
    const time = cols.find(c => c.key === config.timeField);
    const note = cols.find(c => c.key === config.noteField);
    const rest = cols.filter(c => c.key !== config.timeField && c.key !== config.noteField);
    return [time, ...rest, note].filter(Boolean) as HubColumn[];
  }, [config]);

  const detailCols = useMemo(
    () => config.columns.filter(c => c.showInDetail !== false && c.key !== config.noteField),
    [config]
  );

  const visibleCols = listCols.filter(c => !hiddenCols.has(c.key));

  const filtered = useMemo(() => {
    const needle = searchTerm.trim();
    let rows = entries.filter(e => {
      if (needle) {
        const hit = config.columns.some(c => String(e[c.key] ?? '').includes(needle));
        if (!hit) return false;
      }
      if (config.fieldKey && fieldFilter.length > 0) {
        if (!fieldFilter.includes(String(e[config.fieldKey] ?? ''))) return false;
      }
      for (const [k, v] of Object.entries(cellFilter)) {
        if (String(e[k] ?? '') !== v) return false;
      }
      return true;
    });
    const sortCol = config.columns.find(c => c.key === sortBy.key);
    rows = [...rows].sort((a, b) => {
      const av = sortCol?.sortValue ? sortCol.sortValue(a) : a[sortBy.key];
      const bv = sortCol?.sortValue ? sortCol.sortValue(b) : b[sortBy.key];
      let cmp = 0;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'ko', { numeric: true });
      }
      return sortBy.dir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [entries, searchTerm, fieldFilter, cellFilter, sortBy, config]);

  const stats = useMemo(() => {
    const groupBy = config.statsGroupBy;
    const groups: Record<string, number> = {};
    if (groupBy) {
      for (const e of filtered) {
        const k = String(e[groupBy] ?? '').trim() || '(미분류)';
        groups[k] = (groups[k] || 0) + 1;
      }
    }
    return { total: filtered.length, groups };
  }, [filtered, config.statsGroupBy]);

  // ─── 핸들러 ────────────────────────────────────
  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedIds(next);
  };
  const toggleAllExpand = () => {
    if (expandedAll) {
      setExpandedAll(false);
      setExpandedIds(new Set());
    } else {
      setExpandedAll(true);
    }
  };
  const toggleFieldFilter = (v: string) => {
    setFieldFilter(prev => (prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]));
  };
  const toggleColHidden = (key: string) => {
    const next = new Set(hiddenCols);
    next.has(key) ? next.delete(key) : next.add(key);
    setHiddenCols(next);
  };
  const toggleCellFilter = (key: string, val: string) => {
    setCellFilter(prev => {
      const next = { ...prev };
      if (next[key] === val) delete next[key];
      else next[key] = val;
      return next;
    });
  };
  const headerSort = (key: string) => {
    setSortBy(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  const startEdit = (entry: T) => {
    setEditingId(entry[config.idField]);
    setEditData({ ...entry });
    const next = new Set(expandedIds);
    next.add(entry[config.idField]);
    setExpandedIds(next);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };
  const commitEdit = async () => {
    if (!editData || !editingId) return;
    await onSave(editData);
    toast.success('저장되었습니다.');
    cancelEdit();
  };
  const doDelete = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await onDelete(id);
    toast.success('삭제되었습니다.');
  };
  const startAdd = () => {
    setAddData(config.createEmpty());
    setIsAdding(true);
  };
  const commitAdd = async () => {
    if (!addData) return;
    await onSave(addData);
    toast.success('추가되었습니다.');
    setIsAdding(false);
    setAddData(null);
  };
  const cancelAdd = () => {
    setIsAdding(false);
    setAddData(null);
  };

  // ─── 편집 필드 업데이트 헬퍼 ───────────────────
  const updateEdit = (k: string, v: any) =>
    setEditData(prev => (prev ? ({ ...prev, [k]: v } as T) : prev));
  const updateAdd = (k: string, v: any) =>
    setAddData(prev => (prev ? ({ ...prev, [k]: v } as T) : prev));

  // ─── 비고 파일 첨부 ────────────────────────────
  const attachFile = async (entry: T, f: File) => {
    if (!onUpload) return;
    try {
      const uploaded = await onUpload(f);
      const files: NoteFile[] = Array.isArray(entry._notesFiles) ? entry._notesFiles : [];
      const updated: T = { ...entry, _notesFiles: [...files, uploaded] };
      await onSave(updated);
      toast.success(`📎 ${uploaded.name} 첨부됨`);
    } catch (e: any) {
      toast.error(`업로드 실패: ${e?.message || e}`);
    }
  };
  const removeFile = async (entry: T, idx: number) => {
    const files: NoteFile[] = Array.isArray(entry._notesFiles) ? entry._notesFiles : [];
    const updated: T = { ...entry, _notesFiles: files.filter((_, i) => i !== idx) };
    await onSave(updated);
  };

  // ─── 렌더 헬퍼 ─────────────────────────────────
  const renderCell = (col: HubColumn, entry: T) => {
    const raw = entry[col.key];
    const text = col.format ? col.format(raw, entry) : (raw == null ? '' : String(raw));
    const titleAttr = col.tooltip ? col.tooltip(entry) : undefined;
    if (col.type === 'chip' && text) {
      const filterVal = raw == null ? '' : String(raw);
      return (
        <button
          title={titleAttr}
          onClick={(e) => {
            e.stopPropagation();
            if (col.drilldown) toggleCellFilter(col.key, filterVal);
          }}
          className={`px-1.5 py-0.5 rounded-full border text-[10px] ${chipClassByKey(col.key, text)} ${
            col.drilldown ? 'cursor-pointer hover:border-slate-500' : 'cursor-default'
          } ${cellFilter[col.key] === filterVal ? 'ring-1 ring-slate-800' : ''}`}
        >
          {text}
        </button>
      );
    }
    if (col.drilldown && text) {
      const filterVal = raw == null ? '' : String(raw);
      return (
        <button
          title={titleAttr}
          onClick={(e) => {
            e.stopPropagation();
            toggleCellFilter(col.key, filterVal);
          }}
          className={`hover:underline text-left truncate ${
            cellFilter[col.key] === filterVal ? 'font-bold text-slate-900' : ''
          }`}
        >
          {text}
        </button>
      );
    }
    return <span className="truncate block" title={titleAttr}>{text}</span>;
  };

  const renderEditInput = (col: HubColumn, data: T, update: (k: string, v: any) => void) => {
    const val = data[col.key] ?? '';
    if (col.type === 'chip' && col.options) {
      return (
        <div className="flex flex-wrap gap-1">
          {col.options.map(o => (
            <button
              key={o}
              type="button"
              onClick={() => update(col.key, o)}
              className={`px-1.5 py-0.5 rounded-full border text-[10px] ${
                val === o
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {o}
            </button>
          ))}
          {val && !col.options.includes(val) && (
            <span className="px-1.5 py-0.5 rounded-full border border-slate-200 bg-amber-50 text-[10px]">
              {val}
            </span>
          )}
        </div>
      );
    }
    if (col.type === 'multiline') {
      return (
        <textarea
          value={val}
          onChange={(e) => update(col.key, e.target.value)}
          placeholder={col.placeholder || col.label}
          className="w-full px-1.5 py-1 bg-white border border-slate-200 rounded-md text-xs resize-y min-h-[48px] focus:outline-none focus:border-slate-500"
        />
      );
    }
    return (
      <input
        type={col.type === 'number' ? 'number' : 'text'}
        value={val}
        onChange={(e) => update(col.key, col.type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={col.placeholder || col.label}
        className="w-full px-1.5 py-1 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:border-slate-500"
      />
    );
  };

  // ─── 렌더 ──────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 text-xs overflow-hidden">
      {/* 헤더 */}
      <header className="px-2 py-1.5 bg-white border-b border-slate-200 flex items-center gap-2 shrink-0">
        {config.emoji && <span className="text-sm leading-none">{config.emoji}</span>}
        <h1 className="text-sm font-bold text-slate-800 truncate">{config.title}</h1>
        {config.subtitle && (
          <span className="text-[10px] text-slate-400 truncate">· {config.subtitle}</span>
        )}
        <span className="ml-auto text-[11px] text-slate-500">
          총 <b className="text-slate-800">{stats.total}</b>건
        </span>
        <button
          onClick={startAdd}
          className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> 추가
        </button>
      </header>

      {/* 툴바 */}
      <div className="px-2 py-1 bg-white border-b border-slate-200 flex items-center gap-2 flex-wrap shrink-0">
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="실시간 검색..."
            className="pl-6 pr-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-md w-44 focus:outline-none focus:border-slate-500"
          />
        </div>

        {config.fieldOptions && config.fieldOptions.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-slate-400">분야:</span>
            {config.fieldOptions.map(opt => (
              <button
                key={opt}
                onClick={() => toggleFieldFilter(opt)}
                className={`px-1.5 py-0.5 rounded-full border text-[10px] ${
                  fieldFilter.includes(opt)
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {opt}
              </button>
            ))}
            {fieldFilter.length > 0 && (
              <button
                onClick={() => setFieldFilter([])}
                className="px-1.5 py-0.5 rounded-full text-[10px] text-slate-500 hover:bg-slate-100"
                title="분야 필터 해제"
              >
                <X className="w-3 h-3 inline" />
              </button>
            )}
          </div>
        )}

        {Object.keys(cellFilter).length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-slate-400">셀필터:</span>
            {Object.entries(cellFilter).map(([k, v]) => (
              <button
                key={k}
                onClick={() => toggleCellFilter(k, v)}
                className="px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] hover:bg-amber-100 flex items-center gap-1"
              >
                {columnLabel(config, k)}={v} <X className="w-2.5 h-2.5" />
              </button>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={toggleAllExpand}
            className="px-2 py-1 rounded-md border border-slate-200 bg-white text-[10px] font-bold flex items-center gap-1 hover:border-slate-400"
          >
            {expandedAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expandedAll ? '전체접기' : '전체펼치기'}
          </button>
          <button
            onClick={() => setColPickerOpen(!colPickerOpen)}
            className={`px-2 py-1 rounded-md border text-[10px] font-bold flex items-center gap-1 ${
              colPickerOpen
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            <Columns3 className="w-3 h-3" /> 열 선택
          </button>
        </div>
      </div>

      {/* 열 선택 패널 */}
      {colPickerOpen && (
        <div className="px-2 py-1 bg-slate-100 border-b border-slate-200 flex flex-wrap gap-1 shrink-0">
          {listCols.map(c => (
            <button
              key={c.key}
              onClick={() => !c.required && toggleColHidden(c.key)}
              disabled={c.required}
              className={`px-1.5 py-0.5 rounded-full border text-[10px] ${
                !hiddenCols.has(c.key)
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-500 border-slate-200'
              } disabled:opacity-60`}
            >
              {c.required && '🔒 '}
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* 통계 바 — 실데이터 카운트만 (#26 근거) */}
      {config.statsGroupBy && (
        <div className="px-2 py-0.5 bg-white border-b border-slate-100 flex items-center gap-1 text-[10px] flex-wrap shrink-0">
          <span className="text-slate-400">📊 분야별:</span>
          {Object.entries(stats.groups)
            .sort(([, a], [, b]) => b - a)
            .map(([k, v]) => (
              <button
                key={k}
                onClick={() => config.fieldKey && toggleFieldFilter(k)}
                className={`px-1.5 py-0.5 rounded-full border text-[10px] ${
                  fieldFilter.includes(k)
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-slate-300'
                }`}
              >
                {k} <b>{v}</b>
              </button>
            ))}
        </div>
      )}

      {/* 메인 테이블 */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 bg-white border-b border-slate-200 z-10 shadow-sm">
            <tr>
              <th className="w-6 px-1 py-1"></th>
              {visibleCols.map(col => (
                <th
                  key={col.key}
                  onClick={() => headerSort(col.key)}
                  className={`px-2 py-1 text-left text-[10px] font-bold text-slate-500 cursor-pointer hover:bg-slate-50 ${col.width || ''}`}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    {sortBy.key === col.key ? (
                      sortBy.dir === 'asc' ? <ChevronUp className="w-3 h-3 text-slate-800" /> : <ChevronDown className="w-3 h-3 text-slate-800" />
                    ) : (
                      <ArrowUpDown className="w-2.5 h-2.5 text-slate-300" />
                    )}
                  </div>
                </th>
              ))}
              <th className="w-20 px-1 py-1 text-right text-[10px] font-bold text-slate-400">작업</th>
            </tr>
          </thead>
          <tbody>
            {/* 추가 행 (인라인) */}
            {isAdding && addData && (
              <>
                <tr className="bg-emerald-50/50 border-b border-emerald-100">
                  <td className="px-1 py-1 text-center">
                    <span className="text-emerald-600 text-[10px]">🆕</span>
                  </td>
                  <td colSpan={visibleCols.length} className="px-2 py-1 text-[11px] text-emerald-700 font-bold">
                    신규 항목 — 아래 펼친 영역에서 입력 후 저장하세요
                  </td>
                  <td className="px-1 py-1 text-right">
                    <button onClick={commitAdd} className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] mr-1 inline-flex items-center gap-1">
                      <Save className="w-2.5 h-2.5" /> 저장
                    </button>
                    <button onClick={cancelAdd} className="px-1.5 py-0.5 rounded bg-white border text-slate-500 text-[10px]">
                      취소
                    </button>
                  </td>
                </tr>
                <tr className="bg-emerald-50/30 border-b border-emerald-100">
                  <td colSpan={visibleCols.length + 2} className="p-2">
                    <DetailForm
                      config={config}
                      detailCols={detailCols}
                      data={addData}
                      update={updateAdd}
                      renderEditInput={renderEditInput}
                    />
                  </td>
                </tr>
              </>
            )}

            {filtered.map((entry) => {
              const id = String(entry[config.idField]);
              const isExpanded = expandedAll || expandedIds.has(id);
              const isEditing = editingId === id;
              const activeData = isEditing && editData ? editData : entry;
              return (
                <Fragment key={id}>
                  <tr
                    onClick={() => toggleExpand(id)}
                    className={`border-b border-slate-100 hover:bg-slate-50/70 cursor-pointer ${
                      isExpanded ? 'bg-slate-50' : ''
                    }`}
                  >
                    <td className="px-1 py-1 text-center">
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3 text-slate-400 inline" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-300 inline" />
                      )}
                    </td>
                    {visibleCols.map(col => (
                      <td key={col.key} className={`px-2 py-1 text-[11px] text-slate-700 ${col.width || ''}`}>
                        {renderCell(col, entry)}
                      </td>
                    ))}
                    <td className="px-1 py-1 text-right" onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <>
                          <button
                            onClick={commitEdit}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-white text-[10px] mr-1 inline-flex items-center gap-1"
                          >
                            <Save className="w-2.5 h-2.5" /> 저장
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 text-[10px]"
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(entry)}
                            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                            title="편집"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => doDelete(id)}
                            className="p-1 rounded hover:bg-rose-100 text-slate-300 hover:text-rose-600"
                            title="삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-slate-50/40 border-b border-slate-100">
                      <td colSpan={visibleCols.length + 2} className="p-2">
                        <DetailView
                          entry={activeData}
                          config={config}
                          detailCols={detailCols}
                          isEditing={isEditing}
                          updateEdit={updateEdit}
                          renderEditInput={renderEditInput}
                          attachFile={onUpload ? (f) => attachFile(entry, f) : undefined}
                          removeFile={(i) => removeFile(entry, i)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}

            {filtered.length === 0 && !isAdding && (
              <tr>
                <td colSpan={visibleCols.length + 2} className="p-6 text-center text-slate-400">
                  {loading ? '로딩 중...' : '조건에 맞는 항목이 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 하단 안내 */}
      <div className="px-2 py-1 bg-slate-100 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between shrink-0">
        <span>💡 행 클릭 = 펼치기 · 분야/상태 셀 클릭 = 필터 · 헤더 클릭 = 정렬</span>
        <span>공통 프레임 · 강사·상담·거래처·면접 재사용</span>
      </div>
    </div>
  );
}

// ─── 펼침 상세 (조회/편집 통합) ──────────────────
function DetailView<T extends Record<string, any>>({
  entry,
  config,
  detailCols,
  isEditing,
  updateEdit,
  renderEditInput,
  attachFile,
  removeFile,
}: {
  entry: T;
  config: HubConfig<T>;
  detailCols: HubColumn[];
  isEditing: boolean;
  updateEdit: (k: string, v: any) => void;
  renderEditInput: (col: HubColumn, data: T, update: (k: string, v: any) => void) => any;
  attachFile?: (f: File) => Promise<void>;
  removeFile: (idx: number) => Promise<void>;
}) {
  const noteCol = config.columns.find(c => c.key === config.noteField);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const files: NoteFile[] = Array.isArray(entry._notesFiles) ? entry._notesFiles : [];

  return (
    <div className="space-y-2">
      {/* 상세 필드 — 2단 그리드 (#16) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1 p-2 bg-white border border-slate-200 rounded-md">
        {detailCols.map(col => {
          const val = entry[col.key];
          const span = col.colSpan === 2 ? 'col-span-2' : col.colSpan === 3 ? 'col-span-3' : 'col-span-1';
          return (
            <div key={col.key} className={`${span} space-y-0.5`}>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                {col.label}
              </label>
              {isEditing ? (
                renderEditInput(col, entry, updateEdit)
              ) : (
                <div className="text-[11px] text-slate-700 whitespace-pre-wrap min-h-[16px]">
                  {val ? String(val) : <span className="text-slate-300">—</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 비고 — 마지막, 텍스트+파일 (#7-5) */}
      {noteCol && (
        <div className="p-2 bg-amber-50/40 border border-amber-200 rounded-md space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[9px] font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1">
              📎 비고 (텍스트 + 파일)
            </label>
            {attachFile && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) attachFile(f);
                    e.target.value = '';
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-1.5 py-0.5 rounded-full border border-amber-300 bg-white text-amber-700 text-[10px] hover:bg-amber-100 flex items-center gap-1"
                >
                  <Paperclip className="w-3 h-3" /> 파일
                </button>
              </>
            )}
          </div>
          {isEditing ? (
            <textarea
              value={entry[config.noteField] ?? ''}
              onChange={(e) => updateEdit(config.noteField, e.target.value)}
              placeholder="비고 텍스트..."
              className="w-full px-1.5 py-1 bg-white border border-amber-200 rounded text-xs resize-y min-h-[40px] focus:outline-none focus:border-amber-500"
            />
          ) : (
            <div className="text-[11px] text-slate-700 whitespace-pre-wrap min-h-[16px]">
              {entry[config.noteField] ? (
                String(entry[config.noteField])
              ) : (
                <span className="text-slate-300">비고 없음</span>
              )}
            </div>
          )}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {files.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white border border-amber-300 text-[10px] text-amber-800"
                >
                  <a href={f.url} target="_blank" rel="noreferrer" className="hover:underline">
                    {f.name}
                  </a>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-amber-400 hover:text-rose-500"
                    title="첨부 제거"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 추가 행 상세 입력 (edit 모드 고정) ──────────
function DetailForm<T extends Record<string, any>>({
  config,
  detailCols,
  data,
  update,
  renderEditInput,
}: {
  config: HubConfig<T>;
  detailCols: HubColumn[];
  data: T;
  update: (k: string, v: any) => void;
  renderEditInput: (col: HubColumn, data: T, update: (k: string, v: any) => void) => any;
}) {
  const noteCol = config.columns.find(c => c.key === config.noteField);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1 p-2 bg-white border border-emerald-200 rounded-md">
        {detailCols.map(col => {
          const span = col.colSpan === 2 ? 'col-span-2' : col.colSpan === 3 ? 'col-span-3' : 'col-span-1';
          return (
            <div key={col.key} className={`${span} space-y-0.5`}>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                {col.label}
              </label>
              {renderEditInput(col, data, update)}
            </div>
          );
        })}
      </div>
      {noteCol && (
        <div className="p-2 bg-amber-50/40 border border-amber-200 rounded-md">
          <label className="text-[9px] font-bold text-amber-700 uppercase tracking-wide">📎 비고</label>
          <textarea
            value={data[config.noteField] ?? ''}
            onChange={(e) => update(config.noteField, e.target.value)}
            placeholder="비고 텍스트..."
            className="w-full mt-1 px-1.5 py-1 bg-white border border-amber-200 rounded text-xs resize-y min-h-[40px] focus:outline-none focus:border-amber-500"
          />
        </div>
      )}
    </div>
  );
}

// ─── 헬퍼 ──────────────────────────────────────
function columnLabel<T>(config: HubConfig<T>, key: string) {
  return config.columns.find(c => c.key === key)?.label || key;
}

function chipClassByKey(key: string, val: string) {
  // 상태/분야 값별 기본 색
  if (key === 'status') {
    switch (val) {
      case '완료':
      case '처리완료':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '진행중':
      case '재통화필요':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '보류':
      case '부재중':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case '거절':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  }
  return 'bg-slate-50 text-slate-700 border-slate-200';
}
