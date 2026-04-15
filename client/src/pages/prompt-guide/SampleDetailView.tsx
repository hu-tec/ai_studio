import React from 'react';
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  Share2,
  Download,
  ChevronRight,
  Layout,
  Code2,
  Image as ImageIcon,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import type { PromptSample } from './data';

interface SampleDetailViewProps {
  sample: PromptSample;
  onBack: () => void;
}

export function SampleDetailView({ sample, onBack }: SampleDetailViewProps) {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('프롬프트가 클립보드에 복사되었습니다.');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-1 pb-2 p-1">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 목록으로 돌아가기
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
            <Share2 size={18} />
          </button>
          <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
            <Download size={18} />
          </button>
        </div>
      </motion.nav>

      {/* Header Info */}
      <section className="space-y-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-1"
        >
          <span className="px-2 py-1 bg-neutral-100 text-neutral-800 text-xs font-bold tracking-wider uppercase rounded-full">
            {sample.category}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <Calendar size={14} /> {sample.date}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <MessageSquare size={14} /> {sample.supplementaryPrompts.length} 반복
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm md:text-xs font-bold tracking-tight text-neutral-900"
        >
          {sample.title}
        </motion.h1>
      </section>

      {/* Main Content: Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 items-start">

        {/* Left Column: Prompts Workflow */}
        <section className="space-y-1">
          <div className="flex items-center gap-1 border-b border-neutral-100 pb-2">
            <Code2 size={20} className="text-neutral-600" />
            <h2 className="text-sm font-bold tracking-tight">프롬프트 워크플로우</h2>
          </div>

          <div className="relative space-y-1 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-100">
            {/* 1st Prompt */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative pl-2"
            >
              <div className="absolute left-0 top-0 w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-neutral-200 z-10">
                1차
              </div>
              <div className="bg-white border border-neutral-200 rounded-md p-2 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest opacity-40">주요 프롬프트</h3>
                  <button onClick={() => handleCopy(sample.primaryPrompt)} className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors">
                    <Copy size={16} />
                  </button>
                </div>
                <p className="text-neutral-700 leading-relaxed text-sm whitespace-pre-wrap">
                  {sample.primaryPrompt}
                </p>
              </div>
            </motion.div>

            {/* Iterations */}
            {sample.supplementaryPrompts.map((prompt, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="relative pl-2"
              >
                <div className="absolute left-2.5 top-0 w-5 h-5 bg-neutral-100 border-2 border-white rounded-full flex items-center justify-center text-neutral-400 text-[10px] font-bold z-10 shadow-sm">
                  {idx + 2}
                </div>
                <div className="bg-neutral-50/50 border border-neutral-200 border-dashed rounded-md p-2 hover:bg-white transition-all group">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">보완 {idx + 1}</h3>
                    <button onClick={() => handleCopy(prompt)} className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-neutral-600 text-sm italic leading-relaxed whitespace-pre-wrap">
                    "{prompt}"
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Completed Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="relative pl-2"
            >
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 w-fit px-2 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 size={16} /> 최종 버전 생성 완료
              </div>
            </motion.div>
          </div>
        </section>

        {/* Right Column: Visual Result */}
        <section className="space-y-1 sticky top-24">
          <div className="flex items-center gap-1 border-b border-neutral-100 pb-2">
            <ImageIcon size={20} className="text-neutral-600" />
            <h2 className="text-sm font-bold tracking-tight">최종 결과물 캡처</h2>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="group relative bg-white border border-neutral-200 rounded-md overflow-hidden shadow-sm shadow-neutral-900/5 ring-1 ring-neutral-100"
          >
            <img
              src={sample.imageUrl}
              alt="최종 결과물"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/10 transition-colors pointer-events-none" />
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="px-2 py-1 bg-white/90 backdrop-blur rounded-md text-xs font-bold shadow-sm flex items-center gap-2 hover:bg-white transition-all">
                <Layout size={14} /> 전체 미리보기
              </button>
            </div>
          </motion.div>

          <div className="bg-neutral-900 rounded-md p-1 text-white shadow-sm shadow-neutral-200 overflow-hidden relative group">
            {/* Decorative bubbles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-neutral-400/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />

            <div className="relative z-10 space-y-1">
              <h3 className="text-sm font-bold">이 워크플로우를 적용할까요?</h3>
              <p className="text-neutral-400 text-sm leading-relaxed opacity-90">
                이 프롬프트 시퀀스를 활용하면 4단 반응형 대시보드 레이아웃과 인터랙티브 필터링을 구현할 수 있습니다.
              </p>
              <button className="px-2 py-1 bg-white text-neutral-900 rounded-md text-sm font-bold shadow-sm hover:bg-neutral-50 transition-colors flex items-center gap-2">
                유사한 앱 생성하기 <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
