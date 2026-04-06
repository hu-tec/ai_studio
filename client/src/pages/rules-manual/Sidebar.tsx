import React from 'react';
import { clsx } from 'clsx';
import { CATEGORY_TYPES } from './mockData';
import {
  BarChart3,
  LayoutList,
  FileCheck2,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

export function Sidebar({ activeCategory, setActiveCategory }: SidebarProps) {
  return (
    <aside className="w-[200px] h-full bg-[#F8F9FA] flex flex-col border-r border-gray-200 shrink-0">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
          DB
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none">Master Policy</span>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Control Center</span>
        </div>
      </div>

      {/* Categories (A-E) */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-1 px-2">
        <div className="px-3 mb-2">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">업무 분류 체계</span>
        </div>
        {CATEGORY_TYPES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={clsx(
              "w-full px-3 py-2.5 flex items-center gap-3 transition-all rounded-lg group relative",
              activeCategory === cat.id
                ? "bg-white text-blue-600 shadow-sm border border-gray-100"
                : "text-gray-500 hover:bg-white hover:text-gray-900"
            )}
          >
            <span className={clsx(
              "text-base transition-transform group-hover:scale-110",
              activeCategory === cat.id ? "grayscale-0" : "grayscale opacity-60"
            )}>
              {cat.emoji}
            </span>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[11px] font-black tracking-tighter">{cat.name.split('. ')[1]}</span>
              <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">{cat.id.split('_')[0]} Scope</span>
            </div>
            {activeCategory === cat.id && (
               <div className="ml-auto w-1 h-3 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-gray-200 bg-white/50 space-y-1">
        <SidebarAction icon={<BarChart3 className="w-3.5 h-3.5" />} label="분석 통계" />
        <SidebarAction icon={<LayoutList className="w-3.5 h-3.5" />} label="통합 리스트" />
        <SidebarAction icon={<FileCheck2 className="w-3.5 h-3.5" />} label="승인 현황" />
        <SidebarAction icon={<Settings className="w-3.5 h-3.5" />} label="시스템 설정" />
      </div>
    </aside>
  );
}

function SidebarAction({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all group">
      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-transparent group-hover:border-blue-100">
        {icon}
      </div>
      <span className="text-[10px] font-bold tracking-tight">{label}</span>
    </button>
  );
}
