import { useState } from "react";
import {
  X, ChevronDown, Bot, FileText, Edit3,
  RotateCcw, Save, Trash2, Maximize2,
  Bold, Italic, Underline, Link, Image as ImageIcon,
  List, AlignLeft, AlignCenter, AlignRight
} from "lucide-react";
import { motion } from "motion/react";

interface PageProps {
  onNext: () => void;
  onBack: () => void;
}

export function Page4({ onNext, onBack }: PageProps) {
  const [showOriginal, setShowOriginal] = useState(true);
  const [showAI, setShowAI] = useState(true);
  const [showEditor, setShowEditor] = useState(true);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showOriginal}
                onChange={() => setShowOriginal(!showOriginal)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">원문</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showAI}
                onChange={() => setShowAI(!showAI)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">AI 프롬프트</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showEditor}
                onChange={() => setShowEditor(!showEditor)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">에디터</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNext}
            className="px-6 py-2 bg-blue-600 text-white font-black text-sm rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            적용
          </button>
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Column Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* 1. Original Source Column */}
        {showOriginal && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 border-r border-slate-200 flex flex-col bg-slate-50/50"
          >
            <div className="px-4 py-3 bg-[#FFFDF5] border-b border-slate-200 flex items-center justify-between">
              <span className="text-[12px] font-black text-slate-800">원문</span>
              <Maximize2 className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <FileText className="w-4 h-4" />
                  <span className="text-[13px] font-bold">첨부 파일 내용 (1개)</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-slate-900 leading-tight">업무 준수 서약서 및 실적 체크 - 자체.docx</p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">Document - 12.5 KB</p>
                    </div>
                  </div>
                  <div className="text-[12px] text-slate-500 leading-relaxed italic bg-slate-50 p-3 rounded-lg">
                    (내용 없음)
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. AI Prompt Column */}
        {showAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 border-r border-slate-200 flex flex-col bg-white"
          >
            <div className="px-4 py-3 bg-[#FFFDF5] border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-black text-slate-800">AI 프롬프트</span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5">
                  <span className="text-[10px] font-bold text-slate-600">고소취지</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>
              <Maximize2 className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </div>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <Bot className="w-4 h-4" />
                  <span className="text-[13px] font-bold">@ChatGPT</span>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 leading-relaxed">
                  <p className="text-[13px] text-slate-700 font-medium">
                    [AI 재작성 모의 데이터] 고소인은 피고소인을 엄벌에 처해주시기 바랍니다.
                  </p>
                  <div className="mt-4 pt-4 border-t border-blue-100 flex items-center justify-between">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">AI Suggestion</span>
                    <button className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" /> 다시 생성
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. Editor Column */}
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-[1.2] flex flex-col bg-white"
          >
            <div className="px-4 py-3 bg-[#FFFDF5] border-b border-slate-200 flex items-center justify-between">
              <span className="text-[12px] font-black text-slate-800">에디터</span>
              <Maximize2 className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </div>

            {/* Rich Editor Toolbar */}
            <div className="px-4 py-2 border-b border-slate-100 flex items-center flex-wrap gap-1 bg-slate-50/30">
              <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1 mr-1">
                <button className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-600 transition-all"><RotateCcw className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-600 transition-all rotate-180"><RotateCcw className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1 mr-1">
                <div className="flex items-center gap-1 px-2 py-1 hover:bg-white rounded hover:shadow-sm cursor-pointer border border-transparent hover:border-slate-100">
                  <span className="text-[12px] font-bold text-slate-600">기본</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>
              <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1 mr-1">
                <button className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-900 font-bold transition-all"><Bold className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-600 transition-all"><Italic className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-600 transition-all"><Underline className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1 mr-1">
                <button className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-600 transition-all"><AlignLeft className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-600 transition-all"><AlignCenter className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-600 transition-all"><AlignRight className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-0.5 pr-1">
                <button className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-600 transition-all"><Link className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-600 transition-all"><ImageIcon className="w-4 h-4" /></button>
                <button className="p-1.5 hover:bg-white rounded hover:shadow-sm text-slate-600 transition-all"><List className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              <textarea
                className="w-full h-full text-[13px] text-slate-800 leading-relaxed outline-none resize-none placeholder-slate-300 font-medium"
                defaultValue="[AI 재작성 모의 데이터] 고소인은 피고소인을 엄벌에 처해주시기 바랍니다."
                placeholder="내용을 직접 수정하거나 편집하세요..."
              />
            </div>

            {/* Editor Footer Actions */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
              <div className="flex items-center gap-4">
                <span className="text-[11px] text-slate-400 font-medium">공백 포함 38자</span>
                <span className="text-[11px] text-slate-400 font-medium">공백 제외 32자</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}
