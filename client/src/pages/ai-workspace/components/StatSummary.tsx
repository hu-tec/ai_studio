import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const data = [
  { name: "문서", value: 40 },
  { name: "음성", value: 15 },
  { name: "영상/SNS", value: 20 },
  { name: "IT/개발", value: 25 },
  { name: "창의적활동", value: 18 },
  { name: "번역", value: 12 },
];

export function StatSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">분야별 신청 현황</h3>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#64748b" />
              <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#64748b" />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center relative">
        <h3 className="text-lg font-semibold text-slate-800 self-start mb-6">상태별 요약</h3>
        <div className="h-[240px] w-full flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "승인", value: 35 },
                  { name: "대기", value: 50 },
                  { name: "거절", value: 15 },
                ]}
                innerRadius={65}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-slate-800 leading-tight">100</span>
            <span className="text-sm text-slate-500">전체 신청 건수</span>
          </div>
        </div>
      </div>
    </div>
  );
}
