import React from "react";

interface ModuleCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  status?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ id, title, description, icon, status }) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-1 shadow-sm hover:border-zinc-400 transition-all group flex-1 min-w-[200px]">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded tracking-tighter">M-{id}</span>
        </div>
        {status && (
          <span className="text-[9px] font-bold text-zinc-500 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
            {status === "ACTIVE" ? "활성" : "대기"}
          </span>
        )}
      </div>
      <h3 className="text-sm font-bold text-zinc-900 mb-1 group-hover:text-black truncate">{title}</h3>
      <p className="text-[10px] text-zinc-500 leading-normal line-clamp-1">{description}</p>
    </div>
  );
};

export const ModuleSection: React.FC = () => {
  const modules = [
    { id: "A", icon: "✍️", title: "AI Writing Actions", description: "제품 상세 설명 자동 생성 및 키워드 추출 서비스" },
    { id: "B", icon: "🌐", title: "AI Translation Actions", description: "번역 자동 연동 및 실시간 현지화 지원" },
    { id: "C", icon: "📋", title: "Work Order (Lite)", description: "워크플로우 기반 간편 발주서 관리 시스템" },
    { id: "D", icon: "📄", title: "Site Contents", description: "사이트 구성 및 메인 컨텐츠 관리 기능" },
    { id: "E", icon: "🔑", title: "Platform Core", description: "회원 보안 인증 및 공통 데이터 서비스" },
  ];

  return (
    <div className="flex flex-col">
      <div className="bg-zinc-200 py-1 px-2 mb-1">
        <h2 className="text-sm font-black text-zinc-700 text-center tracking-tight">모듈관리</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {modules.map((m) => (
          <ModuleCard key={m.id} {...m} status={m.id === "E" ? "ACTIVE" : "READY"} />
        ))}
      </div>
    </div>
  );
};
