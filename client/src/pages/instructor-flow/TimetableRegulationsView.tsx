import { CalendarClock, Construction } from "lucide-react";

export function TimetableRegulationsView() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-2">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-sm shadow-blue-100/50">
        <CalendarClock size={48} />
      </div>
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-gray-900 tracking-tight">
          강사 시간표 규정
        </h2>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
          채용 후 강사에게 적용되는 시간표 기준 및 규정 안내 페이지입니다. 현재
          콘텐츠 준비 중입니다.
        </p>
      </div>
      <div className="flex items-center gap-2 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-100 text-sm font-bold">
        <Construction size={16} />
        페이지 준비 중
      </div>
    </div>
  );
}
