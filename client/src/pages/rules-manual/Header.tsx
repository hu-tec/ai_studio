import React from 'react';
import {
  LayoutDashboard,
  List,
  Settings2,
  Plus,
  Trash2,
  Edit3,
  Eye,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Circle,
  FolderOpen,
  MoreVertical
} from 'lucide-react';
import { clsx } from 'clsx';

interface HeaderProps {
  viewMode: 'dashboard' | 'list';
  setViewMode: (mode: 'dashboard' | 'list') => void;
  actionMode: 'view' | 'edit' | 'add' | 'delete';
  setActionMode: (mode: 'view' | 'edit' | 'add' | 'delete') => void;
  allSelected: boolean;
  onToggleAll: () => void;
  onToggleRightPanel: () => void;
}

export function Header({
  viewMode,
  setViewMode,
  actionMode,
  setActionMode,
  allSelected,
  onToggleAll,
  onToggleRightPanel
}: HeaderProps) {

  const handleDownload = (type: string) => {
    alert(`${type} 다운로드를 시작합니다.`);
  };

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-2 sticky top-0 z-50">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Left: Title & Dashboard Toggle */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-gray-900 leading-none tracking-tight">INTEGRATED POLICY DB</h1>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Enterprise System v2.0</span>
            </div>
          </div>

          <div className="flex p-0.5 bg-gray-100 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('dashboard')}
              className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black transition-all uppercase tracking-wider",
                viewMode === 'dashboard' ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black transition-all uppercase tracking-wider",
                viewMode === 'list' ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <List className="w-3.5 h-3.5" />
              Unified List
            </button>
          </div>
        </div>

        {/* Center: Action Mode & Selection */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAll}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all uppercase tracking-wider",
              allSelected ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
            )}
          >
            {allSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
            {allSelected ? "Deselect All" : "Select All"}
          </button>

          <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <ModeToggle active={actionMode === 'view'} onClick={() => setActionMode('view')} icon={<Eye className="w-3 h-3" />} label="Read" />
            <ModeToggle active={actionMode === 'edit'} onClick={() => setActionMode('edit')} icon={<Edit3 className="w-3 h-3" />} label="Edit" />
            <ModeToggle active={actionMode === 'add'} onClick={() => setActionMode('add')} icon={<Plus className="w-3 h-3" />} label="Add" />
            <ModeToggle active={actionMode === 'delete'} onClick={() => setActionMode('delete')} icon={<Trash2 className="w-3 h-3" />} label="Delete" />
          </div>
        </div>

        {/* Right: Export Buttons & Settings */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <ExportButton
              label="엑셀 다운받기"
              icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
              onClick={() => handleDownload('Excel')}
              className="bg-[#E7F9F0] text-[#008A4D] border-[#CDEBDC] hover:bg-[#D4F2E4]"
            />
            <ExportButton
              label="워드 다운받기"
              icon={<FileText className="w-3.5 h-3.5" />}
              onClick={() => handleDownload('Word')}
              className="bg-[#F0F4FF] text-[#0055FB] border-[#DCE4FF] hover:bg-[#E3E9FF]"
            />
            <ExportButton
              label="이미지 저장"
              icon={<ImageIcon className="w-3.5 h-3.5" />}
              onClick={() => handleDownload('Image')}
              className="bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
            />
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1" />

          <button
            onClick={onToggleRightPanel}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Toggle Right Panel"
          >
            <HistoryIcon className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function ModeToggle({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black transition-all uppercase tracking-wider",
        active ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ExportButton({ label, icon, onClick, className }: { label: string, icon: React.ReactNode, onClick: () => void, className: string }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95",
        className
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
