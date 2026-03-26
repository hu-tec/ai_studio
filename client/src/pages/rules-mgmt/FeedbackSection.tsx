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
    <section className="border border-[#ddd] rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#e8e8e8] bg-[#fafafa]">
        <h2 className="text-[16px] text-[#111]" style={{ fontWeight: 700 }}>
          💬 피드백 / 건의사항
        </h2>
        <p className="text-[11px] text-[#aaa] mt-0.5" style={{ fontWeight: 400 }}>
          규정에 대한 의견이나 개선 요청을 남겨주세요
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Existing Feedbacks */}
        {feedbacks.length > 0 && (
          <div className="space-y-2">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="border border-[#eee] rounded-md p-3 bg-[#fafafa]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-[#444]" style={{ fontWeight: 600 }}>
                    💭 {fb.author}
                  </span>
                  <span className="text-[10px] text-[#bbb]" style={{ fontWeight: 400 }}>
                    {fb.date}
                  </span>
                </div>
                <p className="text-[12px] text-[#555]" style={{ fontWeight: 400, lineHeight: 1.6 }}>
                  {fb.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* New Feedback Form */}
        <div className="border border-[#e0e0e0] rounded-md p-4 bg-[#fdfdfd]">
          <div className="flex items-center gap-3 mb-3">
            <label className="text-[12px] text-[#666] shrink-0" style={{ fontWeight: 500 }}>
              ✍️ 작성자
            </label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="이름 (부서)"
              className="flex-1 text-[12px] border border-[#ddd] rounded-md px-3 py-1.5 outline-none focus:border-[#999] bg-white"
              style={{ fontWeight: 400 }}
            />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="규정에 대한 피드백이나 건의사항을 입력해주세요..."
            rows={3}
            className="w-full text-[12px] border border-[#ddd] rounded-md px-3 py-2 outline-none focus:border-[#999] bg-white resize-none"
            style={{ fontWeight: 400, lineHeight: 1.6 }}
          />
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[10px] text-[#ccc]" style={{ fontWeight: 400 }}>
              {submitted ? "✅ 피드백이 제출되었습니다!" : ""}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!author.trim() || !text.trim()}
              className={`text-[12px] px-4 py-1.5 rounded-md transition-colors ${
                author.trim() && text.trim()
                  ? "bg-[#333] text-white hover:bg-[#555]"
                  : "bg-[#e8e8e8] text-[#bbb] cursor-not-allowed"
              }`}
              style={{ fontWeight: 500 }}
            >
              📨 제출
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
