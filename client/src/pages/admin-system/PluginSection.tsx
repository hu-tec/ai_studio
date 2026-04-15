import React from "react";

interface PluginCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: string;
}

const PluginCard: React.FC<PluginCardProps> = ({ id, title, description, icon, status }) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-1 shadow-sm hover:border-zinc-400 transition-all group flex-1 min-w-[200px]">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded tracking-tighter">P-{id}</span>
        </div>
        <span className="text-[9px] font-bold text-zinc-500 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded-full uppercase tracking-widest italic">
          {status === "PENDING" ? "연동 대기" : status}
        </span>
      </div>
      <h3 className="text-xs font-bold text-zinc-900 mb-1 group-hover:text-black truncate">{title}</h3>
      <p className="text-[10px] text-zinc-500 leading-normal line-clamp-1">{description}</p>
    </div>
  );
};

export const PluginSection: React.FC = () => {
  const plugins = [
    { id: "F", icon: "💬", title: "FAQ / 문의", description: "고객 문의 처리 및 FAQ 게시판 관리" },
    { id: "G", icon: "💲", title: "가격 정책", description: "유료/할인/쿠폰 등의 과금 체계 설정" },
    { id: "H", icon: "⛓️", title: "워크플로우", description: "승인/검토 등의 운영 절차 자동화" },
    { id: "I", icon: "🔔", title: "알림", description: "이메일/문자/앱푸시 통합 발송 시스템" },
  ];

  return (
    <div className="flex flex-col">
      <div className="bg-zinc-200 py-1 px-2 mb-1">
        <h2 className="text-sm font-black text-zinc-700 text-center tracking-tight">플러그인 관리</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {plugins.map((p) => (
          <PluginCard key={p.id} {...p} status="PENDING" />
        ))}
      </div>
    </div>
  );
};
