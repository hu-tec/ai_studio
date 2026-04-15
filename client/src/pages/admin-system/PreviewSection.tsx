import React from "react";

export const PreviewSection: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-zinc-200 py-1 px-3 mb-2">
        <h2 className="text-sm font-black text-zinc-700 text-center tracking-tight">미리보기</h2>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-2 shadow-sm h-full flex flex-col">
        <div className="mb-3">
          <h3 className="text-sm font-black text-zinc-900 mb-2">필수 항목(화면 고정)</h3>
          <ul className="space-y-1">
            {[
              "1. 기본 정보(사이트명/도메인/언어)",
              "2. 사이트 타입",
              "3. 모듈(A~E)",
              "4. 플러그인(F~I)",
            ].map((item, idx) => (
              <li key={idx} className="text-[11px] font-bold text-zinc-600 tracking-tight">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-2 mb-3">
          <p className="text-[10px] font-bold text-zinc-400 mb-3 uppercase tracking-widest">미리보기</p>
          <div className="space-y-1.5">
            <p className="text-[11px] font-black text-zinc-800 flex items-center gap-2">
              사이트명: <span className="text-zinc-400 font-bold">-</span>
            </p>
            <p className="text-[11px] font-black text-zinc-800 flex items-center gap-2">
              도메인: <span className="text-zinc-400 font-bold">-</span>
            </p>
            <p className="text-[11px] font-black text-zinc-800 flex items-center gap-2">
              타입: <span className="text-zinc-600 font-bold">번역</span>
            </p>
          </div>
        </div>

        <div className="mt-auto border-t border-zinc-100 pt-3">
          <p className="text-[10px] text-zinc-400 leading-relaxed font-bold italic">
            지금은 DB 설계보다, 통합 플랫폼에서 "필수 운영 항목이 보이는 UI"를 먼저 확정합니다.
          </p>
        </div>
      </div>
    </div>
  );
};
