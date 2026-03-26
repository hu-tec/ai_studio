import React from "react";

export const WizardSection: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-zinc-200 py-2 px-4 mb-4">
        <h2 className="text-sm font-black text-zinc-700 text-center tracking-tight">사이트추가(마법사)</h2>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-black text-zinc-900 mb-1">새 사이트 생성</h3>
          <p className="text-[10px] text-zinc-400 font-bold mb-5">생성하려는 새 사이트의 정보를 입력해주세요(1분 소요)</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">사이트명 🔖</p>
                <input
                  type="text"
                  placeholder="예: 민택센터"
                  className="w-full px-3 py-2 text-xs font-medium border border-zinc-100 rounded bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-300"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">도메인(또는 서브도메인) 🔗</p>
                <input
                  type="text"
                  placeholder="예: tenant1.local"
                  className="w-full px-3 py-2 text-xs font-medium border border-zinc-100 rounded bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all placeholder:text-zinc-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">기본 언어 🌍</p>
                <select className="w-full px-3 py-2 text-xs font-bold border border-zinc-100 rounded bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer">
                  <option>ko</option>
                  <option>en</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">사이트 타입 🏛️</p>
                <select className="w-full px-3 py-2 text-xs font-bold border border-zinc-100 rounded bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all cursor-pointer text-zinc-400">
                  <option>선택</option>
                  <option>전시형</option>
                  <option>커머스형</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-zinc-400 mb-3 uppercase tracking-widest border-b border-zinc-100 pb-1">모듈 선택(A-E) 📦</label>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {[
              { id: "A", label: "AI Writing Actions", checked: true },
              { id: "B", label: "AI Translation Actions", checked: true },
              { id: "C", label: "Work Order Lite", checked: true },
              { id: "D", label: "Site Contents", checked: true },
              { id: "E", label: "Platform Core", checked: true },
            ].map((m) => (
              <label key={m.id} className="flex items-center gap-2 group cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={m.checked}
                  className="w-3.5 h-3.5 border border-zinc-300 rounded focus:ring-zinc-900 accent-zinc-900"
                />
                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors">
                  <span className="text-zinc-400 mr-1">{m.id}</span> {m.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-zinc-400 mb-3 uppercase tracking-widest border-b border-zinc-100 pb-1">플러그인 선택(F-I) 🔌</label>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {[
              { id: "F", label: "FAQ / 문의", checked: true },
              { id: "G", label: "가격 정책", checked: true },
              { id: "H", label: "워크플로우", checked: true },
              { id: "I", label: "알림", checked: true },
            ].map((p) => (
              <label key={p.id} className="flex items-center gap-2 group cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={p.checked}
                  className="w-3.5 h-3.5 border border-zinc-300 rounded focus:ring-zinc-900 accent-zinc-900"
                />
                <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-900 transition-colors">
                  <span className="text-zinc-400 mr-1">{p.id}</span> {p.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between gap-4 border-t border-zinc-50">
          <button className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">
            취소
          </button>
          <button className="px-8 py-2.5 bg-zinc-900 text-white text-[10px] font-black rounded hover:bg-black transition-all uppercase tracking-widest shadow-lg shadow-zinc-100">
            사이트 생성
          </button>
        </div>
      </div>
    </div>
  );
};
