import { useState } from "react";

export interface GuidelineItem {
  id: string;
  text: string;
}

interface GuidelineGridProps {
  regulations: GuidelineItem[];
  semiRegulations: GuidelineItem[];
  optionals: GuidelineItem[];
  onAdd: (column: "reg" | "semi" | "opt") => void;
  onDelete: (column: "reg" | "semi" | "opt", id: string) => void;
}

function GuidelineList({
  items,
  columnType,
  onAdd,
  onDelete,
}: {
  items: GuidelineItem[];
  columnType: "reg" | "semi" | "opt";
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start justify-between border-b border-gray-200 py-1 px-2 gap-2"
        >
          <span className="text-gray-800 break-words min-w-0 flex-1">
            {item.text}
          </span>
          <button
            onClick={() => onDelete(item.id)}
            className="text-gray-400 hover:text-gray-700 shrink-0 cursor-pointer"
          >
            [삭제]
          </button>
        </div>
      ))}
      <div className="px-2 py-1">
        <button
          onClick={onAdd}
          className="text-gray-500 hover:text-black cursor-pointer"
        >
          [+추가]
        </button>
      </div>
    </div>
  );
}

export function GuidelineGrid({
  regulations,
  semiRegulations,
  optionals,
  onAdd,
  onDelete,
}: GuidelineGridProps) {
  return (
    <div className="grid grid-cols-3 border border-gray-300">
      {/* Column Headers */}
      <div className="bg-gray-800 text-white px-2 py-1 border-r border-gray-300">
        <div>[규정] 고정 (변경금지)</div>
      </div>
      <div className="bg-gray-400 text-black px-2 py-1 border-r border-gray-300">
        <div>[준규정] 준고정 (조건부변경가능)</div>
      </div>
      <div className="bg-gray-200 text-black px-2 py-1 border border-gray-400 border-t-0 border-b-0 border-r-0">
        <div>[선택사항] 선택고정 (언제든변경가능)</div>
      </div>

      {/* Column Bodies */}
      <div className="border-r border-gray-300 bg-white">
        <GuidelineList
          items={regulations}
          columnType="reg"
          onAdd={() => onAdd("reg")}
          onDelete={(id) => onDelete("reg", id)}
        />
      </div>
      <div className="border-r border-gray-300 bg-white">
        <GuidelineList
          items={semiRegulations}
          columnType="semi"
          onAdd={() => onAdd("semi")}
          onDelete={(id) => onDelete("semi", id)}
        />
      </div>
      <div className="bg-white">
        <GuidelineList
          items={optionals}
          columnType="opt"
          onAdd={() => onAdd("opt")}
          onDelete={(id) => onDelete("opt", id)}
        />
      </div>
    </div>
  );
}
