import { PlayCircle, FileText, BarChart3, Code2, Image, Music, Mic, MoreHorizontal } from "lucide-react";

const categories = [
  { icon: PlayCircle, title: "유튜브 영상만들기", desc: "텍스트, 영상, 음성 활용", active: false },
  { icon: FileText, title: "문서 만들기", desc: "문서 에디터, 텍스트 생성 AI", active: true },
  { icon: BarChart3, title: "리서치&분석", desc: "리서치, 분석, 통계 생성", active: false },
  { icon: Code2, title: "프로그래밍", desc: "코드 생성 AI 활용", active: false },
  { icon: Image, title: "이미지, 디자인", desc: "포스터, 로고 디자인", active: false },
  { icon: Music, title: "음악", desc: "배경음악, 효과음 생성", active: false },
  { icon: Mic, title: "음성", desc: "시뮬레이션, 클로닝", active: false },
  { icon: MoreHorizontal, title: "기타", desc: "프로세스, PPT 등", active: false },
];

export function CategoryCards() {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {categories.map((cat, i) => (
        <div
          key={i}
          className={`min-w-[110px] p-3 rounded-xl border cursor-pointer transition-all ${
            cat.active
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
          }`}
        >
          <cat.icon className={`w-5 h-5 mb-3 ${cat.active ? "text-white" : "text-gray-400"}`} />
          <div className={`text-[13px] mb-1 ${cat.active ? "text-white" : "text-gray-900"}`}>
            {cat.title}
          </div>
          <div className={`text-[11px] ${cat.active ? "text-blue-100" : "text-gray-400"}`}>
            {cat.desc}
          </div>
        </div>
      ))}
    </div>
  );
}
