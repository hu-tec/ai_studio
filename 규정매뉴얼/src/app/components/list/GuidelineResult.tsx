import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Download, 
  Printer, 
  Clock,
  ArrowLeft,
  ShieldCheck,
  Scale,
  Zap,
  User,
  MessageCircle,
  Briefcase
} from 'lucide-react';
import { Regulation } from '../../data/mockData';

interface GuidelineResultProps {
  selectedRules: Regulation[];
  categoryInfo: {
    large: string;
    medium: string;
    small: string;
  };
  comment: string;
  onBack: () => void;
}

export function GuidelineResult({ selectedRules, categoryInfo, comment, onBack }: GuidelineResultProps) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const groupedRules = {
    fixed: selectedRules.filter(r => r.type === 'fixed'),
    semi: selectedRules.filter(r => r.type === 'semi'),
    optional: selectedRules.filter(r => r.type === 'optional'),
    field: selectedRules.filter(r => r.type === 'field' || r.id.includes('field')), // 분야별 특이규정 대응
  };

  const activeGroups = Object.entries(groupedRules).filter(([_, rules]) => rules.length > 0);
  const showCommentInGrid = activeGroups.length <= 3;

  return (
    <div className="h-full bg-gray-50 overflow-y-auto no-scrollbar p-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between no-print">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-gray-900 transition-all uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Edit
          </button>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-600 flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-all uppercase tracking-wider">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 uppercase tracking-wider">
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
          </div>
        </div>

        {/* Main Document Case */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
        >
          {/* Document Header */}
          <div className="bg-[#0A0F1E] p-10 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/40">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter">업무지시 가이드라인</h1>
                    <p className="text-blue-400/80 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Integrated Business Directives</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 pt-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">분류 정보</span>
                    <p className="text-sm font-bold text-white/90">
                      {categoryInfo.large} <span className="text-white/20 mx-1">/</span> {categoryInfo.medium} <span className="text-white/20 mx-1">/</span> {categoryInfo.small}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">발행 일자</span>
                    <p className="text-sm font-bold text-white/90 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" /> {today}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Serial No: 2026-X842</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Horizontal Layout Grid */}
          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* 1. Fixed Rules */}
              <div className={groupedRules.fixed.length > 0 ? "block" : "hidden opacity-20 pointer-events-none"}>
                <CategoryHeader icon={<ShieldCheck className="w-4 h-4 text-red-500" />} title="1. 필수 규정" subTitle="Fixed Rules" color="red" />
                <div className="space-y-3">
                  {groupedRules.fixed.map((rule) => (
                    <RuleCard key={rule.id} rule={rule} color="red" />
                  ))}
                </div>
              </div>

              {/* 2. Semi Rules */}
              <div className={groupedRules.semi.length > 0 ? "block" : "hidden opacity-20 pointer-events-none"}>
                <CategoryHeader icon={<Scale className="w-4 h-4 text-amber-500" />} title="2. 준규정" subTitle="Conditional" color="amber" />
                <div className="space-y-3">
                  {groupedRules.semi.map((rule) => (
                    <RuleCard key={rule.id} rule={rule} color="amber" />
                  ))}
                </div>
              </div>

              {/* 3. Optional Rules */}
              <div className={groupedRules.optional.length > 0 ? "block" : "hidden opacity-20 pointer-events-none"}>
                <CategoryHeader icon={<Zap className="w-4 h-4 text-blue-500" />} title="3. 선택규정" subTitle="Optional" color="blue" />
                <div className="space-y-3">
                  {groupedRules.optional.map((rule) => (
                    <RuleCard key={rule.id} rule={rule} color="blue" />
                  ))}
                </div>
              </div>

              {/* 4. Special Field Rules OR Comment */}
              {groupedRules.field.length > 0 ? (
                <div>
                  <CategoryHeader icon={<Briefcase className="w-4 h-4 text-emerald-500" />} title="4. 분야규정" subTitle="Field Specific" color="emerald" />
                  <div className="space-y-3">
                    {groupedRules.field.map((rule) => (
                      <RuleCard key={rule.id} rule={rule} color="emerald" />
                    ))}
                  </div>
                </div>
              ) : (
                showCommentInGrid && (
                  <CommentBox comment={comment} />
                )
              )}
            </div>

            {/* Bottom Separate Comment (Only if Field rules exist) */}
            {!showCommentInGrid && (
              <div className="mt-8">
                <CommentBox comment={comment} fullWidth />
              </div>
            )}

            {/* Document Footer */}
            <div className="mt-16 pt-10 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1.5">Authorized Issuer</p>
                  <p className="text-base font-black text-gray-800">관리자 (Administrator)</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                   <div className="w-24 h-24 border-8 border-blue-500 rounded-full flex items-center justify-center text-xl font-black rotate-12">SEAL</div>
                </div>
                <div className="text-right pr-6">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Approved for Delivery</p>
                  <div className="text-2xl font-black text-blue-500 italic tracking-tighter">OFFICIAL</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[1em] pb-12">
          Integrated Policy Database Management System
        </div>
      </div>
    </div>
  );
}

function CategoryHeader({ icon, title, subTitle, color }: { icon: React.ReactNode, title: string, subTitle: string, color: string }) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };

  return (
    <div className="flex flex-col gap-1 mb-6">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg ${colorMap[color]} flex items-center justify-center`}>
          {icon}
        </div>
        <h2 className="text-sm font-black text-gray-900 tracking-tight">{title}</h2>
      </div>
      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-9">{subTitle}</span>
    </div>
  );
}

function RuleCard({ rule, color }: { rule: Regulation, color: string }) {
  const borderMap: Record<string, string> = {
    red: 'border-red-100 bg-red-50/20 hover:border-red-200',
    amber: 'border-amber-100 bg-amber-50/20 hover:border-amber-200',
    blue: 'border-blue-100 bg-blue-50/20 hover:border-blue-200',
    emerald: 'border-emerald-100 bg-emerald-50/20 hover:border-emerald-200'
  };

  const typeColorMap: Record<string, string> = {
    fixed: 'text-red-600 bg-red-50',
    semi: 'text-amber-600 bg-amber-50',
    optional: 'text-emerald-600 bg-emerald-50'
  };

  return (
    <div className={`p-4 rounded-2xl border ${borderMap[color]} transition-all cursor-default group space-y-3`}>
      <div className="space-y-1">
        <h3 className="text-xs font-black text-gray-800 mb-1 leading-tight group-hover:text-blue-600 transition-colors">
          {rule.title}
        </h3>
        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
          {rule.content || '세부 지침이 입력되지 않았습니다.'}
        </p>
      </div>

      {rule.subDirectives && rule.subDirectives.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-gray-100/50">
          {rule.subDirectives.map((sd) => (
            <div key={sd.id} className="flex items-start gap-2">
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter shrink-0 ${typeColorMap[sd.type]}`}>
                {sd.type[0]}
              </span>
              <p className="text-[9px] font-bold text-gray-600 leading-tight">
                {sd.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentBox({ comment, fullWidth }: { comment: string, fullWidth?: boolean }) {
  return (
    <div className={`${fullWidth ? 'w-full' : 'h-full'} min-h-[160px]`}>
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gray-900 text-white flex items-center justify-center">
            <MessageCircle className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-black text-gray-900 tracking-tight">지시 코멘트</h2>
        </div>
        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-9">Admin Comment</span>
      </div>
      <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2rem] h-[calc(100%-60px)] flex flex-col items-center justify-center text-center">
        {comment ? (
          <p className="text-xs font-bold text-gray-600 leading-relaxed max-w-[200px]">
            "{comment}"
          </p>
        ) : (
          <div className="opacity-20 flex flex-col items-center gap-2">
            <MessageCircle className="w-8 h-8" />
            <p className="text-[10px] font-black uppercase tracking-widest">No comment added</p>
          </div>
        )}
      </div>
    </div>
  );
}
