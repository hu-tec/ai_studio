import { useState } from "react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  children,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-gray-300 bg-white">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-100 border-b border-gray-300">
        <h1 className="text-black">{title}</h1>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-600 hover:text-black cursor-pointer"
        >
          {expanded ? "🔽 접기" : "▶️ 펼치기"}
        </button>
      </div>
      {expanded && <div className="p-4">{children}</div>}
    </div>
  );
}
