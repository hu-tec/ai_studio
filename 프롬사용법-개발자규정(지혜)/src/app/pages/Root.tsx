import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  List, 
  PlusCircle, 
  Search, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { AddSampleModal } from '../components/AddSampleModal';

export function Root() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState({ name: '홍길동', role: 'Staff', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: '대시보드', path: '/' },
    { icon: List, label: '샘플 리스트', path: '/list' },
    { icon: PlusCircle, label: '샘플 추가', onClick: () => setIsAddModalOpen(true) },
  ];

  const staffList = [
    { name: '홍길동', role: 'Staff', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' },
    { name: '김철수', role: 'Staff', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100' },
    { name: '이영희', role: 'Staff', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
    { name: '관리자', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100' },
  ];

  return (
    <div className="flex h-screen bg-[#f0f0f0] text-neutral-900 font-sans overflow-hidden">
      {/* Main Content (Full Width) */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col relative">
        {/* Header */}
        <header className="flex-shrink-0 z-20 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Plus className="text-white w-5 h-5" />
              </div>
              <span className="font-black text-xl tracking-tighter uppercase italic">
                Prompt Archive
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full border border-neutral-200 hover:bg-neutral-50 transition-all bg-white shadow-sm"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-neutral-900">{currentUser.name}</p>
                  <p className="text-[10px] text-neutral-400">{currentUser.role === 'Admin' ? '전체 관리자' : '일반 직원'}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
                  <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <ChevronRight size={14} className={clsx("text-neutral-400 transition-transform", isUserMenuOpen ? "rotate-90" : "")} />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-2xl shadow-xl z-20 overflow-hidden"
                    >
                      <div className="p-3 border-b border-neutral-100 bg-neutral-50">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2">계정 전환</p>
                      </div>
                      <div className="p-1">
                        {staffList.map((staff) => (
                          <button
                            key={staff.name}
                            onClick={() => {
                              setCurrentUser(staff);
                              setIsUserMenuOpen(false);
                            }}
                            className={clsx(
                              "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm transition-colors",
                              currentUser.name === staff.name ? "bg-neutral-100 font-bold" : "hover:bg-neutral-50"
                            )}
                          >
                            <img src={staff.avatar} className="w-6 h-6 rounded-full border border-neutral-200" alt="" />
                            <div className="flex-1 text-left">
                              <p className="text-xs">{staff.name}</p>
                              <p className="text-[9px] text-neutral-400">{staff.role}</p>
                            </div>
                            {currentUser.name === staff.name && <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />}
                          </button>
                        ))}
                      </div>
                      {currentUser.role === 'Admin' && (
                        <div className="p-2 border-t border-neutral-100">
                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 text-white text-[10px] font-bold">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            전체 직원 데이터 조회 모드 활성
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* View Outlet */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <Outlet context={{ currentUser, setIsAddModalOpen }} />
        </div>
        
        <AddSampleModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      </main>
    </div>
  );
}

