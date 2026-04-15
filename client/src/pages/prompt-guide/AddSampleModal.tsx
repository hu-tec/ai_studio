import React, { useState } from 'react';
import {
  MessageSquare,
  Calendar,
  X,
  PlusCircle,
  Image as ImageIcon,
  Save,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface AddSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddSampleModal({ isOpen, onClose }: AddSampleModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('UIUX');
  const [primaryPrompt, setPrimaryPrompt] = useState('');
  const [supplementaryPrompts, setSupplementaryPrompts] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1526414026496-4a3e37de63e6?auto=format&fit=crop&q=80&w=800');

  const categories = ['UIUX', 'DB', '홈페이지', '관리자페이지'];

  const handleAddSupplementary = () => {
    setSupplementaryPrompts([...supplementaryPrompts, '']);
  };

  const handleUpdateSupplementary = (index: number, value: string) => {
    const newPrompts = [...supplementaryPrompts];
    newPrompts[index] = value;
    setSupplementaryPrompts(newPrompts);
  };

  const handleRemoveSupplementary = (index: number) => {
    setSupplementaryPrompts(supplementaryPrompts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title || !primaryPrompt) {
      toast.error('제목과 주요 프롬프트를 입력해주세요.');
      return;
    }
    toast.success('새로운 샘플이 등록되었습니다.');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-[#f8f9fa] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/20"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <PlusCircle size={24} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900 tracking-tight">새 샘플 추가</h2>
                  <p className="text-sm text-neutral-400 font-medium">프롬프트 워크플로우와 결과물을 등록하세요.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-3 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-2xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                {/* 왼쪽: 프롬프트 워크플로우 입력 */}
                <section className="space-y-3">
                  <div className="flex items-center gap-3 text-neutral-900">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-neutral-100">
                      <MessageSquare size={20} className="text-neutral-500" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">프롬프트 워크플로우</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] ml-1">업무명 (Title)</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="예: 시험응시자 전용 대시보드 시스템"
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-2xl text-sm focus:ring-4 focus:ring-neutral-100 outline-none transition-all font-bold placeholder:text-neutral-300 shadow-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] ml-1">카테고리</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-2xl text-sm focus:ring-4 focus:ring-neutral-100 outline-none transition-all font-bold text-neutral-700 shadow-sm"
                        >
                          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] ml-1">등록일</label>
                        <div className="w-full px-3 py-2 bg-neutral-100 border border-neutral-100 rounded-2xl text-sm text-neutral-400 flex items-center gap-2 font-bold shadow-inner">
                          <Calendar size={16} /> {new Date().toISOString().split('T')[0]}
                        </div>
                      </div>
                    </div>

                    <div className="relative space-y-3 pt-2 before:absolute before:left-4 before:top-6 before:bottom-6 before:w-[2px] before:bg-neutral-200/50">
                      {/* Primary Prompt */}
                      <div className="relative pl-12">
                        <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[10px] font-bold shadow-xl shadow-neutral-200 z-10">
                          1
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] ml-1">주요 프롬프트 (Primary Prompt)</label>
                          <textarea
                            value={primaryPrompt}
                            onChange={(e) => setPrimaryPrompt(e.target.value)}
                            placeholder="최초에 입력한 프롬프트를 입력하세요..."
                            rows={4}
                            className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-2xl text-sm focus:ring-4 focus:ring-neutral-100 outline-none transition-all leading-relaxed placeholder:text-neutral-300 shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Supplementary Prompts */}
                      {supplementaryPrompts.map((prompt, idx) => (
                        <div key={idx} className="relative pl-12">
                          <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center text-neutral-400 text-[10px] font-bold z-10">
                            {idx + 2}
                          </div>
                          <div className="space-y-2 group">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] ml-1">보완 프롬프트 {idx + 1}</label>
                              <button
                                onClick={() => handleRemoveSupplementary(idx)}
                                className="p-1 text-neutral-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <textarea
                              value={prompt}
                              onChange={(e) => handleUpdateSupplementary(idx, e.target.value)}
                              placeholder="수정/보완 시 입력한 프롬프트를 입력하세요..."
                              rows={2}
                              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm focus:ring-4 focus:ring-neutral-100 outline-none transition-all leading-relaxed italic placeholder:text-neutral-300"
                            />
                          </div>
                        </div>
                      ))}

                      <div className="pl-12">
                        <button
                          onClick={handleAddSupplementary}
                          className="flex items-center gap-2 px-2 py-3.5 bg-white hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900 rounded-2xl text-xs font-bold transition-all border-2 border-dashed border-neutral-200 shadow-sm"
                        >
                          <PlusCircle size={16} /> 보완 단계 추가
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 오른쪽: 최종 결과물 캡처 입력 */}
                <section className="space-y-3">
                  <div className="flex items-center gap-3 text-neutral-900">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-neutral-100">
                      <ImageIcon size={20} className="text-neutral-500" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider">최종 결과물 캡처</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="aspect-[4/3] relative rounded-[32px] overflow-hidden border-2 border-dashed border-neutral-200 bg-white group hover:border-neutral-400 transition-all duration-500 flex flex-col items-center justify-center text-center p-3 shadow-sm">
                      {imageUrl ? (
                        <>
                          <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Preview" />
                          <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                            <button
                              onClick={() => setImageUrl('')}
                              className="px-3 py-3 bg-white text-neutral-900 rounded-2xl text-xs font-bold shadow-2xl hover:bg-neutral-100 transition-colors"
                            >
                              이미지 변경하기
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-neutral-50 rounded-3xl text-neutral-300 mb-2 group-hover:scale-110 transition-transform duration-500 border border-neutral-100">
                            <ImageIcon size={40} />
                          </div>
                          <h4 className="font-bold text-neutral-900 mb-2 text-sm">결과물 이미지 업로드</h4>
                          <p className="text-xs text-neutral-400 leading-relaxed max-w-[260px] font-medium">
                            최종 결과물 캡처 이미지를 드래그하거나 클릭하여 업로드하세요.
                          </p>
                          <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={() => setImageUrl('https://images.unsplash.com/photo-1526414026496-4a3e37de63e6?auto=format&fit=crop&q=80&w=800')}
                          />
                        </>
                      )}
                    </div>

                    <div className="bg-neutral-900 rounded-[32px] p-3 text-white space-y-2 relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-2 blur-3xl" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full -ml-16 -mb-16 blur-3xl" />
                      <div className="relative z-10 space-y-4">
                        <h4 className="text-sm font-bold tracking-tight">등록 안내</h4>
                        <p className="text-neutral-400 text-sm leading-relaxed font-medium">
                          프롬프트 샘플을 등록하면 팀원들이 이 워크플로우를 그대로 복사하여 사용할 수 있습니다. 정확한 기록은 팀의 생산성을 높이는 핵심 자산이 됩니다.
                        </p>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-neutral-300 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 상세한 업무 설명
                          </div>
                          <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-neutral-300 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 모든 프롬프트 기록
                          </div>
                          <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-neutral-300 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 선명한 결과 캡처
                          </div>
                          <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-neutral-300 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 카테고리 분류 필수
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-white border-t border-neutral-100 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-3 py-3 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-3.5 bg-neutral-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-200 active:scale-95"
              >
                <Save size={18} /> 샘플 저장 및 등록
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
