import { useState, useEffect } from 'react';
import { X, Upload, ImageIcon, ChevronDown, ChevronUp, Plus, Trash2, Edit3, Eye, Settings } from 'lucide-react';
import type { AIDetail, PromptRow } from './data';
import { workTypes, aiToolsList } from './data';

function PromptGrid({ 
  rows, 
  onChange, 
  readOnly 
}: { 
  rows: PromptRow[], 
  onChange: (rows: PromptRow[]) => void, 
  readOnly: boolean 
}) {
  const addRow = () => {
    onChange([...rows, { id: Date.now().toString(), content: '', note: '' }]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 1) return;
    onChange(rows.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof PromptRow, value: string) => {
    onChange(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="flex flex-col h-full border border-border rounded overflow-hidden shadow-sm bg-card">
      <div className="grid grid-cols-[30px,1fr,120px,35px] bg-muted/70 border-b border-border text-[9px] font-bold uppercase text-muted-foreground">
        <div className="p-1.5 text-center border-r border-border">#</div>
        <div className="p-1.5 border-r border-border">프롬프트 구성 (Instruction)</div>
        <div className="p-1.5 border-r border-border">비고</div>
        <div className="p-1.5"></div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 bg-white">
        {rows.map((row, index) => (
          <div key={row.id} className="grid grid-cols-[30px,1fr,120px,35px] border-b border-border/50 last:border-b-0 group hover:bg-accent/10 transition-colors">
            <div className="p-1.5 text-[10px] text-muted-foreground text-center border-r border-border/50 flex items-center justify-center bg-muted/20">
              {index + 1}
            </div>
            <div className="p-0 border-r border-border/50">
              <input
                type="text"
                value={row.content}
                onChange={(e) => updateRow(row.id, 'content', e.target.value)}
                readOnly={readOnly}
                className="w-full h-full px-2 py-1.5 text-xs bg-transparent outline-none focus:bg-white"
                placeholder="내용 입력..."
              />
            </div>
            <div className="p-0 border-r border-border/50">
              <input
                type="text"
                value={row.note}
                onChange={(e) => updateRow(row.id, 'note', e.target.value)}
                readOnly={readOnly}
                className="w-full h-full px-2 py-1.5 text-xs bg-transparent outline-none focus:bg-white"
                placeholder="-"
              />
            </div>
            <div className="flex items-center justify-center">
              {!readOnly && (
                <button
                  onClick={() => removeRow(row.id)}
                  className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {!readOnly && (
        <button
          onClick={addRow}
          className="flex items-center justify-center gap-1.5 p-1.5 bg-muted/30 hover:bg-muted text-[10px] text-muted-foreground transition-colors border-t border-border font-medium"
        >
          <Plus className="w-3.5 h-3.5" /> 새로운 행 추가
        </button>
      )}
    </div>
  );
}

function getDefaultAIDetail(): AIDetail {
  return {
    workTypes: [],
    aiTools: [],
    instructions: '1. \n2. \n3. \n',
    instructionNote: '',
    importantNotes: '',
    promptGrid1: [{ id: '1', content: '', note: '' }],
    promptGrid2: [{ id: '1', content: '', note: '' }],
    beforeImage: null,
    afterImage: null,
    securityPrompt1: '',
    securityPrompt2: '',
    regulations: '',
    semiRegulations: '',
    optionalRegulations: '',
    fieldRegulations: '',
  };
}

interface AIDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeSlot: string;
  initialData?: AIDetail;
  onSave: (data: AIDetail) => void;
  readOnly?: boolean;
}

export function AIDetailModal({ isOpen, onClose, timeSlot, initialData, onSave, readOnly: initialReadOnly = false }: AIDetailModalProps) {
  const [data, setData] = useState<AIDetail>(getDefaultAIDetail());
  const [isMainExpanded, setIsMainExpanded] = useState(true);
  const [isResultExpanded, setIsResultExpanded] = useState(true);
  const [isRegulationExpanded, setIsRegulationExpanded] = useState(true);
  const [mode, setMode] = useState<'write' | 'view' | 'admin'>(initialReadOnly ? 'view' : 'write');

  const readOnly = mode === 'view';

  useEffect(() => {
    if (initialData) {
      setData({
        ...initialData,
        promptGrid1: initialData.promptGrid1 || [{ id: '1', content: '', note: '' }],
        promptGrid2: initialData.promptGrid2 || [{ id: '1', content: '', note: '' }],
      });
    } else {
      setData(getDefaultAIDetail());
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const toggleItem = (field: 'workTypes' | 'aiTools', item: string) => {
    if (readOnly) return;
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item],
    }));
  };

  const handleImageUpload = (field: 'beforeImage' | 'afterImage', file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setData(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-card rounded shadow-2xl w-full max-w-[1400px] h-[90vh] flex flex-col m-3"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 bg-card border-b border-border px-3 py-2 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm font-medium">AI 활용 작성</span>
              <span className="text-[11px] text-muted-foreground ml-2">{timeSlot}</span>
            </div>
            
            {/* Mode Toggle Buttons (1번 수정사항) */}
            <div className="flex bg-muted rounded p-0.5 border border-border">
              <button
                onClick={() => setMode('write')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  mode === 'write' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Edit3 className="w-3 h-3" /> 기입모드
              </button>
              <button
                onClick={() => setMode('view')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  mode === 'view' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Eye className="w-3 h-3" /> 조회모드
              </button>
              <button
                onClick={() => setMode('admin')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  mode === 'admin' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Settings className="w-3 h-3" /> 관리모드
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-3 space-y-3">
          {/* Top Section: Work Types & AI Tools (Fixed height) */}
          <div className="shrink-0 space-y-3">
            {/* Work Types */}
            <div>
              <label className="block mb-1 text-muted-foreground text-xs font-medium uppercase tracking-tight">작업 유형</label>
              <div className="flex flex-wrap gap-1">
                {workTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleItem('workTypes', type)}
                    disabled={readOnly}
                    className={`px-2.5 py-1 rounded border transition-colors text-xs ${
                      data.workTypes.includes(type)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:bg-accent'
                    } ${readOnly ? 'cursor-default' : ''}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Tools */}
            <div>
              <label className="block mb-1 text-muted-foreground text-xs font-medium uppercase tracking-tight">사용 AI</label>
              <div className="flex flex-wrap gap-1">
                {aiToolsList.map(tool => (
                  <button
                    key={tool}
                    onClick={() => toggleItem('aiTools', tool)}
                    disabled={readOnly}
                    className={`px-2.5 py-1 rounded border transition-colors text-xs ${
                      data.aiTools.includes(tool)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-border hover:bg-accent'
                    } ${readOnly ? 'cursor-default' : ''}`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Shared Expansion Area (Sections 1, 2, 3) */}
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            {/* 1. Main Inputs (Prompt & Instructions) - Toggleable */}
            <div className={`transition-all duration-300 flex flex-col overflow-hidden border-t border-border pt-2 ${isMainExpanded ? 'flex-1 min-h-[100px]' : 'shrink-0'}`}>
              <div className="flex items-center justify-between mb-1 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">1. 프롬프트 및 지시사항</span>
                  {!isMainExpanded && (
                    <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-accent/50 rounded">접힘</span>
                  )}
                </div>
                <button
                  onClick={() => setIsMainExpanded(!isMainExpanded)}
                  className="p-1 hover:bg-accent rounded flex items-center gap-1 text-[11px] text-muted-foreground transition-colors"
                >
                  {isMainExpanded ? (
                    <><ChevronUp className="w-3.5 h-3.5" /> 접어보기</>
                  ) : (
                    <><ChevronDown className="w-3.5 h-3.5" /> 펼쳐보기</>
                  )}
                </button>
              </div>

              {isMainExpanded && (
                <div className="grid grid-cols-4 gap-3 flex-1 min-h-0">
                  {/* 1st Column: Instructions & Remarks */}
                  <div className="flex flex-col min-h-0">
                    <label className="block mb-1 text-muted-foreground text-[11px]">업무 지시 사항</label>
                    <textarea
                      value={data.instructions}
                      onChange={e => setData(prev => ({ ...prev, instructions: e.target.value }))}
                      readOnly={readOnly}
                      className="w-full flex-1 border border-border rounded p-2 bg-input-background resize-none text-sm focus:ring-1 focus:ring-primary/20 outline-none"
                      placeholder="1. &#10;2. &#10;3. "
                    />
                    <div className="mt-2 shrink-0">
                      <label className="block mb-0.5 text-muted-foreground text-[11px]">비고</label>
                      <input
                        type="text"
                        value={data.instructionNote}
                        onChange={e => setData(prev => ({ ...prev, instructionNote: e.target.value }))}
                        readOnly={readOnly}
                        className="w-full border border-border rounded p-1.5 bg-input-background text-sm focus:ring-1 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>

                  {/* 2nd Column: Important Matters */}
                  <div className="flex flex-col min-h-0">
                    <label className="block mb-1 text-muted-foreground text-[11px]">중요 사항</label>
                    <textarea
                      value={data.importantNotes}
                      onChange={e => setData(prev => ({ ...prev, importantNotes: e.target.value }))}
                      readOnly={readOnly}
                      className="w-full flex-1 border border-border rounded p-2 bg-input-background resize-none text-sm focus:ring-1 focus:ring-primary/20 outline-none"
                      placeholder="중요 사항을 입력하세요"
                    />
                  </div>

                  {/* 3rd Column: 1차 프롬프트 설정 (Grid) - 3번 수정사항 */}
                  <div className="flex flex-col min-h-0">
                    <label className="block mb-1 text-muted-foreground text-[11px]">1차 프롬프트 설정 (Grid)</label>
                    <PromptGrid
                      rows={data.promptGrid1}
                      onChange={(rows) => setData(prev => ({ ...prev, promptGrid1: rows }))}
                      readOnly={readOnly}
                    />
                  </div>

                  {/* 4th Column: 2차 프롬프트 설정 (Grid) - 3번 수정사항 */}
                  <div className="flex flex-col min-h-0">
                    <label className="block mb-1 text-muted-foreground text-[11px]">2차 프롬프트 설정 (Grid)</label>
                    <PromptGrid
                      rows={data.promptGrid2}
                      onChange={(rows) => setData(prev => ({ ...prev, promptGrid2: rows }))}
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. 결과물 및 보안 섹션 */}
            <div className={`transition-all duration-300 flex flex-col min-h-0 border-t border-border pt-2 overflow-hidden ${isResultExpanded ? 'flex-1 min-h-[100px]' : 'shrink-0'}`}>
              <div className="flex items-center justify-between mb-1 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">2. 결과물 및 보안</span>
                  {!isResultExpanded && (
                    <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-accent/50 rounded">접힘</span>
                  )}
                </div>
                <button
                  onClick={() => setIsResultExpanded(!isResultExpanded)}
                  className="p-1 hover:bg-accent rounded flex items-center gap-1 text-[11px] text-muted-foreground transition-colors"
                >
                  {isResultExpanded ? (
                    <><ChevronUp className="w-3.5 h-3.5" /> 접어보기</>
                  ) : (
                    <><ChevronDown className="w-3.5 h-3.5" /> 펼쳐보기</>
                  )}
                </button>
              </div>

              {isResultExpanded && (
                <div className="grid grid-cols-4 gap-3 flex-1 min-h-0">
                  <div className="border border-border rounded p-2 flex flex-col min-h-[140px]">
                    <p className="mb-1 text-muted-foreground text-[11px] font-medium uppercase tracking-tighter">Before</p>
                    <div className="flex-1 min-h-0">
                      {data.beforeImage ? (
                        <div className="relative h-full">
                          <img src={data.beforeImage} alt="Before" className="w-full h-full object-cover rounded" />
                          {!readOnly && (
                            <button
                              onClick={() => setData(prev => ({ ...prev, beforeImage: null }))}
                              className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <label className={`flex flex-col items-center justify-center h-full border border-dashed border-border rounded bg-muted/20 ${readOnly ? '' : 'cursor-pointer hover:border-primary/50 transition-colors'}`}>
                          {readOnly ? (
                            <div className="text-center text-muted-foreground">
                              <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-20" />
                              <p className="text-[10px]">없음</p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-muted-foreground/50 mb-1" />
                              <p className="text-[10px] text-muted-foreground uppercase">Upload</p>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload('beforeImage', file);
                                }}
                              />
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="border border-border rounded p-2 flex flex-col min-h-[140px]">
                    <p className="mb-1 text-muted-foreground text-[11px] font-medium uppercase tracking-tighter">After</p>
                    <div className="flex-1 min-h-0">
                      {data.afterImage ? (
                        <div className="relative h-full">
                          <img src={data.afterImage} alt="After" className="w-full h-full object-cover rounded" />
                          {!readOnly && (
                            <button
                              onClick={() => setData(prev => ({ ...prev, afterImage: null }))}
                              className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <label className={`flex flex-col items-center justify-center h-full border border-dashed border-border rounded bg-muted/20 ${readOnly ? '' : 'cursor-pointer hover:border-primary/50 transition-colors'}`}>
                          {readOnly ? (
                            <div className="text-center text-muted-foreground">
                              <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-20" />
                              <p className="text-[10px]">없음</p>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-muted-foreground/50 mb-1" />
                              <p className="text-[10px] text-muted-foreground uppercase">Upload</p>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload('afterImage', file);
                                }}
                              />
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col min-h-0">
                    <label className="block mb-1 text-muted-foreground text-[11px]">보안 프롬프트 1차</label>
                    <textarea
                      value={data.securityPrompt1}
                      onChange={e => setData(prev => ({ ...prev, securityPrompt1: e.target.value }))}
                      readOnly={readOnly}
                      className="w-full flex-1 border border-border rounded p-2 bg-input-background resize-none text-sm focus:ring-1 focus:ring-primary/20 outline-none"
                    />
                  </div>

                  <div className="flex flex-col min-h-0">
                    <label className="block mb-1 text-muted-foreground text-[11px]">보안 프롬프트 2차</label>
                    <textarea
                      value={data.securityPrompt2}
                      onChange={e => setData(prev => ({ ...prev, securityPrompt2: e.target.value }))}
                      readOnly={readOnly}
                      className="w-full flex-1 border border-border rounded p-2 bg-input-background resize-none text-sm focus:ring-1 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. 규정 및 가이드라인 섹션 */}
            <div className={`transition-all duration-300 flex flex-col min-h-0 border-t border-border pt-2 overflow-hidden ${isRegulationExpanded ? 'flex-1 min-h-[100px]' : 'shrink-0'}`}>
              <div className="flex items-center justify-between mb-1 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">3. 규정 및 가이드라인</span>
                  {!isRegulationExpanded && (
                    <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-accent/50 rounded">접힘</span>
                  )}
                </div>
                <button
                  onClick={() => setIsRegulationExpanded(!isRegulationExpanded)}
                  className="p-1 hover:bg-accent rounded flex items-center gap-1 text-[11px] text-muted-foreground transition-colors"
                >
                  {isRegulationExpanded ? (
                    <><ChevronUp className="w-3.5 h-3.5" /> 접어보기</>
                  ) : (
                    <><ChevronDown className="w-3.5 h-3.5" /> 펼쳐보기</>
                  )}
                </button>
              </div>

              {isRegulationExpanded && (
                <div className="grid grid-cols-4 gap-3 flex-1 min-h-0">
                  <div className="flex flex-col min-h-0">
                    <label className="block mb-1 text-muted-foreground text-[11px]">규정</label>
                    <textarea
                      value={data.regulations}
                      onChange={e => setData(prev => ({ ...prev, regulations: e.target.value }))}
                      readOnly={readOnly}
                      className="w-full flex-1 border border-border rounded p-2 bg-input-background resize-none text-sm focus:ring-1 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="flex flex-col min-h-0">
                    <label className="block mb-1 text-muted-foreground text-[11px]">준규정</label>
                    <textarea
                      value={data.semiRegulations}
                      onChange={e => setData(prev => ({ ...prev, semiRegulations: e.target.value }))}
                      readOnly={readOnly}
                      className="w-full flex-1 border border-border rounded p-2 bg-input-background resize-none text-sm focus:ring-1 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="flex flex-col min-h-0">
                    <label className="block mb-1 text-muted-foreground text-[11px]">선택규정</label>
                    <textarea
                      value={data.optionalRegulations}
                      onChange={e => setData(prev => ({ ...prev, optionalRegulations: e.target.value }))}
                      readOnly={readOnly}
                      className="w-full flex-1 border border-border rounded p-2 bg-input-background resize-none text-sm focus:ring-1 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="flex flex-col min-h-0">
                    <label className="block mb-1 text-muted-foreground text-[11px]">분야규정</label>
                    <textarea
                      value={data.fieldRegulations}
                      onChange={e => setData(prev => ({ ...prev, fieldRegulations: e.target.value }))}
                      readOnly={readOnly}
                      className="w-full flex-1 border border-border rounded p-2 bg-input-background resize-none text-sm focus:ring-1 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {!readOnly && (
          <div className="shrink-0 bg-card border-t border-border px-3 py-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-2.5 py-1 border border-border rounded hover:bg-accent text-xs"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-2.5 py-1 bg-primary text-primary-foreground rounded hover:opacity-90 text-xs font-medium"
            >
              저장
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
