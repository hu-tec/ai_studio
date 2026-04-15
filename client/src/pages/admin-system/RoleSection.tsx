import React from "react";

export const RoleSection: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-zinc-200 py-1 px-3 mb-2">
        <h2 className="text-sm font-black text-zinc-700 text-center tracking-tight">권한/역할(관리자)</h2>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-2 shadow-sm space-y-2 h-full">
        <div>
          <label className="block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-widest border-b border-zinc-100 pb-1">역할 템플릿 👤</label>
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-zinc-50/50 p-2 border border-zinc-200 rounded-lg hover:border-zinc-900 transition-colors group">
              <h4 className="text-[11px] font-black text-zinc-900 mb-2 flex items-center justify-between">
                <span>시스템 관리자 🛡️</span>
                <span className="text-[8px] bg-zinc-900 text-white px-2 py-0.5 rounded uppercase tracking-tighter shadow-sm">전체</span>
              </h4>
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-600 transition-colors">
                모듈/플러그인/정책 관리 등 시스템의 모든 권한을 보유합니다.
              </p>
            </div>
            <div className="bg-zinc-50/50 p-2 border border-zinc-200 rounded-lg hover:border-zinc-900 transition-colors group">
              <h4 className="text-[11px] font-black text-zinc-900 mb-2 flex items-center justify-between">
                <span>테넌트 운영자 👤</span>
                <span className="text-[8px] bg-zinc-400 text-white px-2 py-0.5 rounded uppercase tracking-tighter shadow-sm">제한</span>
              </h4>
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-600 transition-colors">
                개별 사이트의 메뉴/사용자/페이지/콘텐츠 관리 권한을 보유합니다.
              </p>
            </div>
            <div className="bg-zinc-50/30 p-2 border border-zinc-100 rounded-lg opacity-40 grayscale">
              <h4 className="text-[11px] font-black text-zinc-400 mb-2 flex items-center justify-between">
                <span>외부 협력사 🤝</span>
                <span className="text-[8px] bg-zinc-200 text-zinc-400 px-2 py-0.5 rounded uppercase tracking-tighter">예정</span>
              </h4>
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed italic">
                특정 콘텐츠 및 데이터 조회에 특화된 접근 권한입니다.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-zinc-400 mb-2 uppercase tracking-widest border-b border-zinc-100 pb-1">권한 가이드 🔐</label>
          <div className="space-y-3">
            {[
              { title: "접근 제어", desc: "사용자 로그인 및 세션 유지 관리", role: "관리" },
              { title: "시스템 설정", desc: "데이터베이스 및 네트워크 접근 통제", role: "시스템" },
              { title: "감사 로그", desc: "주요 작업에 대한 히스토리 기록 추적", role: "감사" },
            ].map((role) => (
              <div key={role.title} className="flex justify-between items-center p-2 bg-white border border-zinc-100 rounded-lg hover:border-zinc-200 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-200 group-hover:bg-zinc-900 transition-colors"></div>
                  <div>
                    <h5 className="text-[11px] font-black text-zinc-800 tracking-tight">{role.title}</h5>
                    <p className="text-[9px] text-zinc-400 font-medium">{role.desc}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-zinc-50 text-zinc-500 text-[8px] rounded-full font-black uppercase tracking-widest border border-zinc-100">{role.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
