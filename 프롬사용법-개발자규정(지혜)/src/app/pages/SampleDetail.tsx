import React, { useState } from 'react';
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
import { useParams, Link } from 'react-router';
import { promptSamples } from '../data';
import { toast } from 'sonner';

export function SampleDetail() {
  const { id } = useParams();
  const sample = promptSamples.find(s => s.id === id);

  if (!sample) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
        <h3 className="text-2xl font-bold">Sample not found</h3>
        <Link to="/list" className="text-indigo-600 font-bold">Back to list</Link>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Prompt copied to clipboard');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between"
      >
        <Link 
          to="/list" 
          className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to list
        </Link>
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
      <section className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3"
        >
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wider uppercase rounded-full">
            {sample.category}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <Calendar size={14} /> {sample.date}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <MessageSquare size={14} /> {sample.supplementaryPrompts.length} Iterations
          </span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900"
        >
          {sample.title}
        </motion.h1>
      </section>

      {/* Main Content: Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Prompts Workflow */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
            <Code2 size={20} className="text-indigo-600" />
            <h2 className="text-xl font-bold tracking-tight">Prompt Workflow</h2>
          </div>

          <div className="relative space-y-10 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-100">
            {/* 1st Prompt */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative pl-12"
            >
              <div className="absolute left-0 top-0 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-100 z-10">
                1st
              </div>
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest opacity-40">Primary Prompt</h3>
                   <button onClick={() => handleCopy(sample.primaryPrompt)} className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
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
                className="relative pl-12"
              >
                <div className="absolute left-2.5 top-0 w-5 h-5 bg-neutral-100 border-2 border-white rounded-full flex items-center justify-center text-neutral-400 text-[10px] font-bold z-10 shadow-sm">
                  {idx + 2}
                </div>
                <div className="bg-neutral-50/50 border border-neutral-200 border-dashed rounded-2xl p-6 hover:bg-white transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Iteration {idx + 1}</h3>
                    <button onClick={() => handleCopy(prompt)} className="p-1.5 text-neutral-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
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
              className="relative pl-12"
            >
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 w-fit px-4 py-2 rounded-full border border-emerald-100">
                <CheckCircle2 size={16} /> Final Version Generated
              </div>
            </motion.div>
          </div>
        </section>

        {/* Right Column: Visual Result */}
        <section className="space-y-8 sticky top-24">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
            <ImageIcon size={20} className="text-indigo-600" />
            <h2 className="text-xl font-bold tracking-tight">Final Result Capture</h2>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="group relative bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/5 ring-1 ring-neutral-100"
          >
            <img 
              src={sample.imageUrl} 
              alt="Final Capture" 
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/10 transition-colors pointer-events-none" />
            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="px-4 py-2 bg-white/90 backdrop-blur rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-white transition-all">
                  <Layout size={14} /> Open Full Preview
               </button>
            </div>
          </motion.div>

          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 overflow-hidden relative group">
             {/* Decorative bubbles */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
             <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />

             <div className="relative z-10 space-y-4">
               <h3 className="text-xl font-bold">Try this workflow?</h3>
               <p className="text-indigo-100 text-sm leading-relaxed opacity-90">
                 This sequence of prompts successfully achieved a 4-column responsive dashboard layout with interactive filtering.
               </p>
               <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2">
                 Generate Similar App <ChevronRight size={16} />
               </button>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
