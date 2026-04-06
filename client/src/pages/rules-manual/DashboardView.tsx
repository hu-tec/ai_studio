import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { LargeCategory, CATEGORY_TYPES } from './mockData';
import {
  Activity,
  Zap,
  ShieldCheck,
  LayoutGrid
} from 'lucide-react';

interface DashboardViewProps {
  data: Record<string, LargeCategory[]>;
}

export function DashboardView({ data }: DashboardViewProps) {
  // Aggregate stats across ALL categories
  const allLarge = Object.values(data).flat();
  const totalLarge = allLarge.length;
  const totalMedium = allLarge.reduce((acc, l) => acc + l.mediumCategories.length, 0);
  const totalSmall = allLarge.reduce((acc, l) =>
    acc + l.mediumCategories.reduce((acc2, m) => acc2 + m.smallCategories.length, 0), 0);

  const allRegs = allLarge.flatMap(l =>
    l.mediumCategories.flatMap(m =>
      m.smallCategories.flatMap(s => s.regulations)));

  const typeCounts = {
    fixed: allRegs.filter(r => r.type === 'fixed').length,
    semi: allRegs.filter(r => r.type === 'semi').length,
    optional: allRegs.filter(r => r.type === 'optional').length,
  };

  const chartData = [
    { name: '규정 (고정)', value: typeCounts.fixed, color: '#EF4444' },
    { name: '준규정 (조건부)', value: typeCounts.semi, color: '#F59E0B' },
    { name: '선택규정 (자율)', value: typeCounts.optional, color: '#10B981' },
  ];

  const barChartId = 'bar-chart-regulation';
  const pieChartId = 'pie-chart-regulation';

  // Distribution by Category Type
  const categoryDistribution = CATEGORY_TYPES.map(type => ({
    name: type.name.split('.')[1],
    count: (data[type.id] || []).length
  }));

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Integrated Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="전체 대분류" value={totalLarge} icon={<LayoutGrid className="text-blue-600" />} color="bg-blue-50" border="border-blue-100" />
        <StatCard title="전체 중분류" value={totalMedium} icon={<Activity className="text-indigo-600" />} color="bg-indigo-50" border="border-indigo-100" />
        <StatCard title="전체 소분류" value={totalSmall} icon={<Zap className="text-amber-600" />} color="bg-amber-50" border="border-amber-100" />
        <StatCard title="전체 규정 수" value={allRegs.length} icon={<ShieldCheck className="text-emerald-600" />} color="bg-emerald-50" border="border-emerald-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regulation Type Distribution */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">📊</div>
              전체 규정 유형별 실시간 통계
            </h3>
            <div className="flex gap-2">
              <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-red-100">Live DB</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 h-[350px]">
            <div className="relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart syncId={barChartId} data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip
                    cursor={{ fill: '#F9FAFB' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart id={pieChartId}>
                  <Pie
                    data={chartData}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Distribution Sidebar */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col">
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">📑</div>
            분류별 비중
          </h3>
          <div className="flex-1 space-y-6">
            {categoryDistribution.map((cat, idx) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm font-bold text-gray-700">{CATEGORY_TYPES[idx].emoji} {cat.name}</span>
                  <span className="text-xs font-black text-blue-600">{cat.count} Large</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.count / totalLarge) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-50">
            <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200">
              전체 보고서 다운로드
            </button>
          </div>
        </div>
      </div>

      {/* Recent Updates Horizontal Scroll */}
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <h3 className="text-xl font-black text-gray-800 flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">⚡</div>
          최근 업데이트 기록
        </h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {allRegs.slice(0, 10).map((reg, i) => (
            <div key={`${reg.id}-${i}`} className="min-w-[280px] p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all group">
              <div className="flex items-center gap-2 mb-3">
                <span className={clsx(
                  "w-2 h-2 rounded-full",
                  reg.type === 'fixed' ? "bg-red-500" : reg.type === 'semi' ? "bg-amber-500" : "bg-emerald-500"
                )} />
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">{reg.type} RULE</span>
              </div>
              <h4 className="text-sm font-bold text-gray-800 truncate mb-1">{reg.title}</h4>
              <p className="text-[10px] text-gray-400 font-medium mb-4">Last Updated: {reg.lastUpdated}</p>
              <div className="flex justify-end">
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">View Details →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, border }: { title: string, value: number, icon: React.ReactNode, color: string, border: string }) {
  return (
    <div className={clsx("p-8 rounded-[2.5rem] border shadow-2xl shadow-gray-200/20 flex items-center justify-between transition-all hover:-translate-y-1 hover:shadow-gray-300/50 bg-white", border)}>
      <div className="space-y-1">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <h4 className="text-3xl font-black text-gray-900">{value.toLocaleString()}</h4>
      </div>
      <div className={clsx("w-16 h-16 rounded-[1.25rem] flex items-center justify-center", color)}>
        {icon}
      </div>
    </div>
  );
}
