import { useState } from "react";
import { ChevronRight, Home, ChevronDown, Play } from "lucide-react";
import { CategoryCards } from "./CategoryCards";
import { FilterDropdowns } from "./FilterDropdowns";

const tabs = [
  { label: "보유한 양식에 텍스트 입력", active: false },
  { label: "나만의 양식 만들기", active: false },
  { label: "양식 생성 후 내용 작성", active: true },
  { label: "양식 만들기", active: false },
  { label: "내용 작성 후 검수 받기", active: false },
  { label: "관련 서비스 표시 영역", active: false },
];

const aiModels = [
  { label: "ChatGPT", value: "chatgpt" },
  { label: "Claude 3.5", value: "claude", disabled: true },
  { label: "Gemini Pro", value: "gemini", disabled: true },
  { label: "wrtn.", value: "wrtn", disabled: true },
];

interface WorkspaceContentProps {
  onGenerate: () => void;
}

export function WorkspaceContent({ onGenerate }: WorkspaceContentProps) {
  const [selectedAI, setSelectedAI] = useState("chatgpt");

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-[900px] mx-auto py-6 px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[13px] text-gray-500 mb-4">
          <Home className="w-4 h-4" />
          <ChevronRight className="w-3.5 h-3.5" />
          <span>창작작업실</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-800">문서 만들기</span>
        </div>

        {/* Title */}
        <h1 className="mb-5">창작작업실</h1>

        {/* Category Cards */}
        <CategoryCards />

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 mb-5">
          {tabs.map((tab, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded-full text-[13px] border transition-all ${
                tab.active
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Row */}
        <div className="flex items-center justify-between mb-4">
          <FilterDropdowns />
          <button className="flex items-center gap-1 text-[13px] text-gray-600 hover:text-gray-800">
            문서 설정
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Content Card: AI Selection + Textarea + File Upload */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          {/* AI Model Selection */}
          <div className="flex items-center gap-4 mb-5">
            <span className="text-[13px] text-gray-500">사용 AI</span>
            <div className="flex items-center gap-5">
              {aiModels.map((model) => (
                <label
                  key={model.value}
                  className={`flex items-center gap-1.5 text-[13px] cursor-pointer ${
                    model.disabled ? "text-gray-300 cursor-not-allowed" : "text-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="ai-model"
                    value={model.value}
                    checked={selectedAI === model.value}
                    onChange={() => !model.disabled && setSelectedAI(model.value)}
                    disabled={model.disabled}
                    className="w-4 h-4 accent-blue-600"
                  />
                  {model.label}
                </label>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="relative border border-gray-200 rounded-xl min-h-[260px]">
            <textarea
              placeholder="입력하세요"
              className="w-full h-full min-h-[260px] p-5 bg-transparent resize-none text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none rounded-xl"
            />
            <div className="absolute bottom-4 right-4">
              <button className="px-4 py-1.5 text-[13px] text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
                파일 올리기
              </button>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={onGenerate}
            className="flex items-center gap-2.5 px-14 py-3.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
          >
            <Play className="w-4 h-4 fill-white" />
            <span className="text-[15px]">문서 생성</span>
          </button>
        </div>
      </div>
    </div>
  );
}
