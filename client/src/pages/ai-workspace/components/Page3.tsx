import { useState } from "react";
import {
  X, Send, MessageSquare, Bot, Sparkles
} from "lucide-react";
import { motion } from "motion/react";

interface PageProps {
  onNext: () => void;
  onBack: () => void;
}

export function Page3({ onNext, onBack }: PageProps) {
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", text: input }]);
    setInput("");

    // Simple mock response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "ai",
        text: "제시해주신 내용을 바탕으로 고소취지를 더 법률적으로 다듬어 보았습니다. '피고소인의 기망 행위로 인한 금원 편취 사실을 명확히 적시'하는 방향으로 수정하는 것이 좋습니다. 적용하시겠습니까?"
      }]);
    }, 1000);
  };

  return (
    <div className="relative flex flex-col h-full bg-[#F1F5F9] overflow-hidden">
      {/* Background Page 2 (Blurred) */}
      <div className="absolute inset-0 filter blur-md pointer-events-none opacity-50">
        <Page2Background />
      </div>

      {/* Modal Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white w-full max-w-[560px] rounded-[32px] shadow-2xl overflow-hidden border border-white/20"
        >
          {/* Header */}
          <div className="bg-blue-600 px-8 py-5 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-[16px] font-black leading-tight">고소취지 작성 도우미</h3>
                <p className="text-[12px] text-blue-100 font-medium">AI와 대화하여 내용을 작성하세요</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="h-[480px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold text-lg">고소취지에 대해<br />무엇이든 물어보세요!</p>
                    <p className="text-slate-400 text-sm mt-1">AI가 판례를 분석하여 작성을 도와드립니다.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 pt-0">
              <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-1 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                <div className="flex items-center gap-2 px-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 bg-transparent py-4 text-sm outline-none text-slate-700"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all disabled:bg-slate-300 disabled:shadow-none active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-[11px] text-slate-400 font-medium">실시간 AI 법률 가이드 활성화 중</span>
                </div>
                <button
                  onClick={onNext}
                  className="text-[12px] font-bold text-blue-600 hover:underline"
                >
                  수정사항 반영하고 다음으로
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}

function Page2Background() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between">
        <div className="w-48 h-8 bg-slate-100 rounded-lg"></div>
        <div className="w-64 h-8 bg-slate-100 rounded-lg"></div>
      </div>
      <div className="flex-1 flex p-6 gap-6">
        <div className="flex-1 space-y-6">
          <div className="h-40 bg-white rounded-2xl border border-slate-200"></div>
          <div className="h-40 bg-white rounded-2xl border border-slate-200"></div>
          <div className="h-40 bg-white rounded-2xl border border-slate-200"></div>
        </div>
        <div className="w-[460px] bg-white rounded-2xl border border-slate-200"></div>
      </div>
    </div>
  );
}
