import React from 'react';
import {
  History,
  Star,
  Settings,
  ChevronRight,
  ChevronLeft,
  Clock,
  FileEdit,
  User,
  ExternalLink,
  FileCheck2,
  Send
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

interface RightPanelProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  history: any[];
}

export function RightPanel({ isOpen, setIsOpen, history }: RightPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="h-full bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden relative"
        >
          {/* Panel Header */}
          <div className="p-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-gray-400" />
              <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none">Activity Stream</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
               <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4">

            <SectionHeader label="Directive History" icon={<FileCheck2 className="w-3 h-3 text-blue-500" />} />
            <div className="space-y-3">
              {history.length > 0 ? (
                history.map((item) => (
                  <HistoryItem
                    key={item.id}
                    type="issue"
                    title={item.title}
                    time={item.time}
                    user="관리자 (Admin)"
                    detail={`${item.count}개의 규정이 포함된 지시서가 발행됨`}
                  />
                ))
              ) : (
                <div className="py-2 text-center space-y-2 opacity-30">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">No activity yet</p>
                </div>
              )}
            </div>

            <SectionHeader label="System Logs" icon={<Clock className="w-3 h-3 text-gray-400" />} />
            <div className="space-y-3 opacity-60">
               <HistoryItem
                 type="edit"
                 title="근무시간 조항 수정"
                 time="14:24"
                 user="김철수 책임"
                 detail="A-12 규정의 단락 3 문구 수정"
               />
               <HistoryItem
                 type="add"
                 title="보안 신규 규정 추가"
                 time="어제 17:10"
                 user="이영희 선임"
                 detail="클라우드 자산 관리 지침 신설"
               />
            </div>

            <SectionHeader label="Quick Favorites" icon={<Star className="w-3 h-3 text-amber-500" />} />
            <div className="space-y-1">
               <FavoriteItem label="인공지능 규정집 v2.1" category="기술표준" />
               <FavoriteItem label="근태관리 선택규정" category="인사관리" />
            </div>
          </div>

          {/* User Settings Footer */}
          <div className="p-2 border-t border-gray-100 bg-gray-50/30">
            <button className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-200 group transition-all">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                     <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                     <p className="text-[10px] font-black text-gray-900 leading-none">Admin Settings</p>
                     <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Cloud Integrated</p>
                  </div>
               </div>
               <Settings className="w-4 h-4 text-gray-300 group-hover:rotate-45 transition-transform" />
            </button>
          </div>
        </motion.aside>
      )}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-20 bg-white border border-r-0 border-gray-200 rounded-l-xl flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all z-[50]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
    </AnimatePresence>
  );
}

function SectionHeader({ label, icon }: { label: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-1 mb-2">
       {icon}
       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function FavoriteItem({ label, category }: { label: string, category: string }) {
  return (
    <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-blue-50 group transition-all text-left">
       <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-700 group-hover:text-blue-700">{label}</span>
          <span className="text-[8px] text-gray-400 uppercase font-black">{category}</span>
       </div>
       <ExternalLink className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

function HistoryItem({ type, title, time, user, detail }: { type: 'edit' | 'add' | 'delete' | 'issue', title: string, time: string, user: string, detail: string }) {
  const colors = {
    edit: 'bg-amber-100 text-amber-600',
    add: 'bg-emerald-100 text-emerald-600',
    delete: 'bg-red-100 text-red-600',
    issue: 'bg-blue-600 text-white shadow-md shadow-blue-200'
  };

  const icon = {
    edit: <FileEdit className="w-2.5 h-2.5" />,
    add: <Star className="w-2.5 h-2.5" />,
    delete: <History className="w-2.5 h-2.5" />,
    issue: <Send className="w-2.5 h-2.5" />
  };

  return (
    <div className="flex gap-3 relative group px-1">
       <div className="flex flex-col items-center">
          <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110", colors[type as keyof typeof colors])}>
             {icon[type as keyof typeof icon]}
          </div>
          <div className="w-px h-full bg-gray-100 absolute top-6 left-[13px] last:hidden" />
       </div>
       <div className="flex-1 pb-2">
          <div className="flex items-center justify-between mb-0.5">
             <span className="text-[10px] font-black text-gray-900 leading-none">{title}</span>
             <span className="text-[8px] font-black text-gray-400">{time}</span>
          </div>
          <p className="text-[9px] font-bold text-gray-500 leading-tight mb-1">{detail}</p>
          <div className="flex items-center gap-1.5 opacity-60">
             <div className="w-1 h-1 rounded-full bg-gray-300" />
             <span className="text-[8px] font-black text-gray-400 uppercase">{user}</span>
          </div>
       </div>
    </div>
  );
}
