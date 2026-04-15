import React, { useState } from "react";
import { useRules } from "./RulesContext";

export function FeedbackSection() {
  const { feedbacks, addFeedback } = useRules();
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (author.trim() && text.trim()) {
      addFeedback(author.trim(), text.trim());
      setAuthor("");
      setText("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    }
  };

  return (
    <section className="border border-[#ddd] rounded bg-white overflow-hidden">
      {/* Header */}
      <div className="px-2 py-1 border-b border-[#e8e8e8] bg-[#fafafa]">
        <h2 className="text-[12px] text-[#111] font-semibold">💬 피드백 / 건의사항</h2>
      </div>

      <div className="p-1.5 space-y-1.5">
        {/* Existing Feedbacks — grid 2-col */}
        {feedbacks.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="border border-[#eee] rounded p-1.5 bg-[#fafafa]">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-[#444] font-semibold truncate">💭 {fb.author}</span>
                  <span className="text-[9px] text-[#bbb]">{fb.date}</span>
                </div>
                <p className="text-[10px] text-[#555] leading-snug">{fb.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* New Feedback Form */}
        <div className="border border-[#e0e0e0] rounded p-1.5 bg-[#fdfdfd]">
          <div className="flex items-center gap-1 mb-1">
            <label className="text-[10px] text-[#666] shrink-0 font-medium">✍️ 작성자</label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="이름 (부서)"
              className="flex-1 text-[11px] border border-[#ddd] rounded px-1.5 py-0.5 outline-none focus:border-[#999] bg-white"
            />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="규정에 대한 피드백이나 건의사항…"
            rows={2}
            className="w-full text-[11px] border border-[#ddd] rounded px-1.5 py-1 outline-none focus:border-[#999] bg-white resize-none"
            style={{ lineHeight: 1.5 }}
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px] text-[#4caf50] font-medium">
              {submitted ? "✅ 피드백이 제출되었습니다!" : ""}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!author.trim() || !text.trim()}
              className={`text-[10px] px-2 py-0.5 rounded transition-colors font-medium ${
                author.trim() && text.trim()
                  ? "bg-[#333] text-white hover:bg-[#555]"
                  : "bg-[#e8e8e8] text-[#bbb] cursor-not-allowed"
              }`}
            >
              📨 제출
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
