import React from "react";

export const DashboardHeader: React.FC = () => {
  return (
    <header className="mb-1 flex justify-between items-end pb-2 border-b border-zinc-200">
      <div>
        <h1 className="text-xs font-black text-zinc-900 flex items-center gap-1 tracking-tighter uppercase leading-none">
          <span className="text-xs transform -rotate-12 hover:rotate-0 transition-transform cursor-pointer">🛸</span>
          관리자 통합 시스템
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] font-black text-white bg-zinc-900 px-2 py-0.5 rounded uppercase tracking-widest">버전 1.0.4</span>
          <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-200 animate-pulse"></span>
            시스템 정상 작동 중 🌐
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2 overflow-hidden">
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-zinc-200 shadow-sm"></div>
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-zinc-300 shadow-sm"></div>
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-zinc-400 shadow-sm flex items-center justify-center text-[10px] text-white font-black">+3</div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-black text-zinc-900 tracking-tight leading-none">최고_관리자_01</p>
            <p className="text-[9px] text-zinc-400 font-bold tracking-tighter uppercase leading-none mt-1">보안 세션 활성화 🔒</p>
          </div>
        </div>
        <button className="text-[9px] font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest border-b border-transparent hover:border-zinc-900">
          시스템 종료 🔌
        </button>
      </div>
    </header>
  );
};
