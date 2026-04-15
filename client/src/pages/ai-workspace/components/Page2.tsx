import { useState } from "react";
import {
  ChevronRight, Home, ArrowRight, ArrowLeft,
  Download, Printer, FileText, X, Edit3,
  AlertCircle, CheckCircle2, RefreshCw, MessageSquare
} from "lucide-react";
import { FilterDropdowns } from "./FilterDropdowns";

interface PageProps {
  onNext: () => void;
  onEdit: () => void;
  onBack: () => void;
}

function SectionButtons({ onChat, onEdit }: { onChat: () => void; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-bold text-blue-600 border border-blue-600 rounded-full bg-white hover:bg-blue-50 transition-all active:scale-95">
        <RefreshCw className="w-3.5 h-3.5" /> AI재요청
      </button>
      <button
        onClick={onChat}
        className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-bold text-slate-600 border border-slate-300 rounded-full bg-white hover:bg-slate-50 transition-all active:scale-95"
      >
        <MessageSquare className="w-3.5 h-3.5" /> AI챗봇도움
      </button>
      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
      >
        <Edit3 className="w-3.5 h-3.5" /> 에디터편집
      </button>
    </div>
  );
}

export function Page2({ onNext, onEdit, onBack }: PageProps) {
  const [_activeTab, _setActiveTab] = useState<"edit" | "preview">("edit");

  return (
    <div className="flex flex-col h-full bg-[#F1F5F9]">
      {/* Top Header / Filter Area */}
      <div className="bg-white border-b border-slate-200 px-2 py-1.5">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-1.5">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
              <Home className="w-3.5 h-3.5 cursor-pointer hover:text-blue-600 transition-colors" onClick={onBack} />
              <ChevronRight className="w-3 h-3" />
              <span>창작작업실</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-900 font-medium">문서 초안 분석 및 편집</span>
            </div>
            <h1 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              문서 분석 결과
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <FilterDropdowns />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Editor Section */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
          <div className="max-w-[1000px] mx-auto space-y-2">

            {/* 1. 고소인 인적사항 */}
            <section className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-2 py-1.5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[12px]">1</span>
                  고소인 인적사항
                </h3>
                <div className="flex items-center gap-2">
                  <SectionButtons onChat={onNext} onEdit={onEdit} />
                </div>
              </div>
              <div className="p-2 space-y-1">
                <div className="grid grid-cols-6 gap-1.5 items-center">
                  <label className="col-span-1 text-[13px] font-bold text-slate-500">성명</label>
                  <div className="col-span-5 relative">
                    <input type="text" defaultValue="홍길동(귀하)" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    <X className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 cursor-pointer" />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-1.5 items-center">
                  <label className="col-span-1 text-[13px] font-bold text-slate-500">주민번호</label>
                  <div className="col-span-5 relative">
                    <input type="text" defaultValue="900101-1234567" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none" />
                    <X className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 cursor-pointer" />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-1.5 items-center">
                  <label className="col-span-1 text-[13px] font-bold text-slate-500">주소</label>
                  <div className="col-span-5 relative">
                    <input type="text" defaultValue="서울특별시 종로구 세종대로 123" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none" />
                    <X className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 cursor-pointer" />
                  </div>
                </div>
              </div>
            </section>

            {/* 2. 피고소인 인적사항 */}
            <section className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-2 py-1.5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[12px]">2</span>
                  피고소인 인적사항
                </h3>
                <div className="flex items-center gap-2">
                  <SectionButtons onChat={onNext} onEdit={onEdit} />
                </div>
              </div>
              <div className="p-2 space-y-1">
                <div className="grid grid-cols-6 gap-1.5 items-center">
                  <label className="col-span-1 text-[13px] font-bold text-slate-500">성명</label>
                  <div className="col-span-5 relative">
                    <input type="text" defaultValue="임꺽정(가명)" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none" />
                    <X className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 cursor-pointer" />
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-1.5 items-center">
                  <label className="col-span-1 text-[13px] font-bold text-slate-500">연락처</label>
                  <div className="col-span-5 relative">
                    <input type="text" defaultValue="010-9876-5432" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none" />
                    <X className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 cursor-pointer" />
                  </div>
                </div>
              </div>
            </section>

            {/* 3. 고소취지 */}
            <section className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-2 py-1 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[12px]">3</span>
                  고소취지
                </h3>
                <div className="flex items-center gap-2">
                  <SectionButtons onChat={onNext} onEdit={onEdit} />
                </div>
              </div>
              <div className="p-2">
                <textarea
                  className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-md p-2 text-sm text-slate-700 leading-relaxed outline-none focus:border-blue-300 transition-colors"
                  defaultValue="본 고소인은 피고소인에 대하여 사기죄로 고소하오니 철저히 수사하여 법에 따라 처벌하여 주시기 바랍니다."
                />
              </div>
            </section>

            {/* 4. 범죄사실 */}
            <section className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm border-l-4 border-l-orange-500">
              <div className="bg-slate-50 px-2 py-1 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[12px]">4</span>
                    범죄사실
                  </h3>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black rounded uppercase">보완 필요</span>
                </div>
                <div className="flex items-center gap-2">
                  <SectionButtons onChat={onNext} onEdit={onEdit} />
                </div>
              </div>
              <div className="p-2">
                <textarea
                  className="w-full min-h-[150px] bg-slate-50 border border-slate-200 rounded-md p-2 text-sm text-slate-700 leading-relaxed outline-none focus:border-blue-300 transition-colors"
                  defaultValue="피고소인은 2023년 1월경 고소인에게 사업 투자 명목으로 1,000만 원을 편취한 사실이 있습니다. 당시 피고소인은 수익 배분을 약속하였으나..."
                />
                <div className="mt-1 flex items-center gap-2 text-[11px] text-orange-600 bg-orange-50 p-1 rounded-lg border border-orange-100 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  송금 내역 및 투자 계약서 등의 구체적인 증거 자료를 언급하면 설득력이 높아집니다.
                </div>
              </div>
            </section>

            {/* 5. 고소이유 */}
            <section className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-2 py-1 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[12px]">5</span>
                  고소이유
                </h3>
                <div className="flex items-center gap-2">
                  <SectionButtons onChat={onNext} onEdit={onEdit} />
                </div>
              </div>
              <div className="p-2">
                <textarea
                  className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-md p-2 text-sm text-slate-700 leading-relaxed outline-none focus:border-blue-300 transition-colors"
                  defaultValue="피고소인은 고소인의 정당한 반환 요구에도 불구하고 변제 의사가 전혀 없으며, 이는 명백한 편취 행위로서 엄벌을 원합니다."
                />
              </div>
            </section>
          </div>
        </div>

        {/* Right Side: Document Preview Section */}
        <div className="hidden lg:flex w-[460px] bg-slate-200/50 border-l border-slate-200 flex-col overflow-hidden">
          <div className="p-2 border-b border-slate-200 bg-white flex items-center justify-between">
            <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">실시간 문서 프리뷰</span>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
                <Printer className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {/* Paper Document Representation */}
            <div className="bg-white w-full aspect-[1/1.414] shadow-sm rounded-sm p-2 space-y-2 text-slate-800 origin-top">
              <h2 className="text-sm font-black text-center tracking-[1em] border-b-2 border-slate-900 pb-2">고소장</h2>

              <div className="space-y-2">
                <div className="space-y-2">
                  <h4 className="font-black text-sm">1. 고소인</h4>
                  <div className="grid grid-cols-4 border-t border-slate-200">
                    <div className="col-span-1 bg-slate-50 p-2 text-[11px] font-bold border-r border-b border-slate-200">성명</div>
                    <div className="col-span-3 p-2 text-[11px] border-b border-slate-200">홍길동(귀하)</div>
                    <div className="col-span-1 bg-slate-50 p-2 text-[11px] font-bold border-r border-b border-slate-200">주민번호</div>
                    <div className="col-span-3 p-2 text-[11px] border-b border-slate-200">900101-1234567</div>
                    <div className="col-span-1 bg-slate-50 p-2 text-[11px] font-bold border-r border-b border-slate-200">주소</div>
                    <div className="col-span-3 p-2 text-[11px] border-b border-slate-200">서울특별시 종로구 세종대로 123</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-sm">2. 피고소인</h4>
                  <div className="grid grid-cols-4 border-t border-slate-200">
                    <div className="col-span-1 bg-slate-50 p-2 text-[11px] font-bold border-r border-b border-slate-200">성명</div>
                    <div className="col-span-3 p-2 text-[11px] border-b border-slate-200">임꺽정(가명)</div>
                    <div className="col-span-1 bg-slate-50 p-2 text-[11px] font-bold border-r border-b border-slate-200">연락처</div>
                    <div className="col-span-3 p-2 text-[11px] border-b border-slate-200">010-9876-5432</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-sm">3. 고소취지</h4>
                  <p className="text-[11px] leading-relaxed">본 고소인은 피고소인에 대하여 사기죄로 고소하오니 철저히 수사하여 법에 따라 처벌하여 주시기 바랍니다.</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-sm">4. 범죄사실</h4>
                  <p className="text-[11px] leading-relaxed italic text-slate-400">내용 작성 중...</p>
                </div>
              </div>

              <div className="pt-2 text-center space-y-1">
                <p className="text-sm font-bold">2026년 3월 10일</p>
                <p className="text-sm font-black">고소인 : 홍길동 (인)</p>
                <p className="text-xs font-black mt-2">종로 경찰서 귀중</p>
              </div>
            </div>

            {/* Next Page Preview */}
            <div className="bg-white w-full aspect-[1/1.414] shadow-sm rounded-sm p-2 mt-2 opacity-50">
              <div className="w-full h-full border-2 border-dashed border-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                첨부서류 및 입증방법
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t border-slate-200 p-2 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-2 py-1 bg-slate-100 text-slate-600 font-bold rounded-md hover:bg-slate-200 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            이전으로
          </button>

          <div className="flex items-center gap-1.5">
            <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[12px] font-bold">문서 분석률 84% 완료</span>
            </div>
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-2 py-1 bg-blue-600 text-white font-black rounded-md hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20 active:scale-95"
            >
              다음 단계로
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
}
