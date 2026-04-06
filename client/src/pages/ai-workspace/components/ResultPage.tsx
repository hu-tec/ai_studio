import { useState } from "react";
import {
  ChevronRight, Home, ArrowRight,
  FileSearch, TrendingUp, BookOpen, Search,
  Gavel, BarChart3,
  Edit3, RefreshCw, MessageSquare, CheckCircle2,
  ShieldAlert, History, Landmark, Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ResultPageProps {
  onBack: () => void;
}

const questionBreakdown = [
  { label: "사건 기초 배경", percent: 88, detail: "사건의 시간적·장소적 배경, 당사자 관계 및 경위가 명확하게 기술되었습니다." },
  { label: "법적 기초 수립", percent: 76, detail: "형법 제347조(사기죄) 적용 근거가 확인되었으나, 추가 조항 보강이 권장됩니다." },
  { label: "문제 포인트 (커넥트)", percent: 68, detail: "핵심 쟁점 3건 중 2건 연결 완료. 금전 반환 청구 관련 논점 보강이 필요합니다." },
  { label: "증거 자료 충분성", percent: 82, detail: "송금 내역, 계약서 등 주요 증거가 확보되었습니다." },
  { label: "청구 취지 완성도", percent: 91, detail: "고소 취지가 법적 요건에 부합하며, 처벌 범위 기술이 정확합니다." },
  { label: "법률 조항 인용 정확도", percent: 73, detail: "인용된 조항 중 횡령죄 조항 번호 재확인이 필요합니다." },
  { label: "상대방 반론 예측", percent: 64, detail: "예상 반론 시나리오 3건 도출. 대응 논리 보강이 권장됩니다." },
  { label: "판례 적합도", percent: 85, detail: "유사 판례 128건 분석 완료. 최근 3년 이내 판례 적합도가 높습니다." },
];

export function ResultPage({ onBack }: ResultPageProps) {
  const [showStats, setShowStats] = useState(true);
  const [analysisLevel, setAnalysisLevel] = useState<1 | 2 | 3>(2);

  const levels = [
    { id: 1, label: "기본분석", desc: "핵심 요약" },
    { id: 2, label: "심층분석", desc: "상세 데이터" },
    { id: 3, label: "전문자문용", desc: "법률 전문가용" }
  ];

  const SectionHeader = ({ title, icon: Icon }: { title: string; icon: React.ElementType }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-blue-50 rounded-lg shrink-0">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-[15px] font-black text-slate-900 tracking-tight truncate">{title}</h3>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button title="AI재요청" className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-all">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button title="AI챗봇도움" className="p-2 bg-blue-50 border border-blue-100 text-blue-400 rounded-lg hover:text-blue-600 hover:bg-blue-100 transition-all">
          <MessageSquare className="w-3.5 h-3.5" />
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-black rounded-lg hover:bg-slate-800 transition-all shadow-md">
          <Edit3 className="w-3 h-3" />
          에디터 편집
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
      <div className="max-w-[1700px] mx-auto py-6 px-6 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[13px] text-slate-400">
              <Home className="w-4 h-4 cursor-pointer hover:text-blue-600 transition-colors" onClick={onBack} />
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="cursor-pointer hover:text-blue-600 transition-colors" onClick={onBack}>창작작업실</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-900 font-medium">AI분석결과</span>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-900">AI 분석 결과 리포트</h1>
              <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm ml-2">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setAnalysisLevel(level.id as 1 | 2 | 3)}
                    className={`px-6 py-2 rounded-xl transition-all flex flex-col items-center leading-tight min-w-[100px] ${
                      analysisLevel === level.id
                        ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <span className="text-[13px] font-black">{level.label}</span>
                    <span className="text-[10px] opacity-60 font-medium">{level.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                showStats
                  ? "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {showStats ? "통계 숨기기" : "통계 보기"}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={analysisLevel}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Stats Overview Dashboard */}
            {showStats && (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 mb-8 shadow-sm">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-2">
                    <div className="text-[12px] font-black text-slate-400 uppercase tracking-wider">AI 분석 정확도</div>
                    <div className="text-[32px] font-black text-blue-600">{analysisLevel === 1 ? "92.4" : analysisLevel === 2 ? "94.8" : "98.2"}%</div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${analysisLevel === 1 ? 92.4 : analysisLevel === 2 ? 94.8 : 98.2}%` }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[12px] font-black text-slate-400 uppercase tracking-wider">유사 판례 검색</div>
                    <div className="text-[32px] font-black text-slate-900">{analysisLevel === 1 ? "42" : analysisLevel === 2 ? "128" : "2,450"}건</div>
                    <p className="text-[12px] text-slate-400 font-medium">실시간 데이터 연동</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[12px] font-black text-slate-400 uppercase tracking-wider">리스크 관리 지수</div>
                    <div className="text-[32px] font-black text-amber-500">{analysisLevel === 1 ? "보통" : analysisLevel === 2 ? "주의" : "심층검토"}</div>
                    <p className="text-[12px] text-slate-400 font-medium">증거 보완 권장</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[12px] font-black text-slate-400 uppercase tracking-wider">리포트 등급</div>
                    <div className="text-[32px] font-black text-emerald-500">{analysisLevel === 1 ? "Basic" : analysisLevel === 2 ? "Expert" : "Advise"}</div>
                    <p className="text-[12px] text-slate-400 font-medium">데이터 분석 등급</p>
                  </div>
                </div>

                {/* Donut Graphs visible from Level 2 */}
                {analysisLevel >= 2 && (
                  <div className="mt-10 pt-10 border-t border-slate-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
                      {questionBreakdown.map((item, i) => (
                        <DonutChart key={i} item={item} index={i} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 items-stretch">
              {/* Card 1 */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[750px]">
                <SectionHeader title="1. 사건 요약 및 사실관계" icon={FileSearch} />
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                  {analysisLevel === 1 ? (
                    <div className="space-y-5">
                      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                        <h4 className="text-[13px] font-black text-blue-900 mb-2">사건 요약</h4>
                        <p className="text-[14px] text-slate-600 leading-relaxed font-medium">
                          피고소인 '을'이 IT 사업 투자 명목으로 5,000만 원을 편취한 뒤 사업을 이행하지 않고 잠적한 전형적인 투자 사기 의심 사건입니다.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h4 className="text-[13px] font-black text-slate-900 flex items-center gap-2">
                          <History className="w-4 h-4 text-blue-500" /> 심층 타임라인
                        </h4>
                        <div className="space-y-5 relative pl-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
                          {[
                            { d: "2023.11.15", t: "투자 약정서 체결", s: "2,000만 원 선입금" },
                            { d: "2024.01.05", t: "2차 중도금 입금", s: "3,000만 원 송금" },
                            { d: "2024.02.20", t: "연락 두절 발생", s: "사업장 폐쇄 확인" }
                          ].map((step, i) => (
                            <div key={i} className="relative pl-4">
                              <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white" />
                              <p className="text-[11px] font-black text-slate-400">{step.d}</p>
                              <p className="text-[13px] font-bold text-slate-700">{step.t}</p>
                              <p className="text-[11px] text-slate-500">{step.s}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[750px]">
                <SectionHeader title="2. 법리적 검토 및 적용 조항" icon={Gavel} />
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                  {analysisLevel === 1 ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <h4 className="text-[13px] font-black text-emerald-900 mb-1">형법 제347조 (사기)</h4>
                      <p className="text-[12px] text-emerald-700">기망을 통한 재물 교부 행위 성립 가능성 높음.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h4 className="text-[13px] font-black text-slate-900">범죄 구성 요건 정밀 분석</h4>
                      <div className="space-y-4">
                        {[
                          { l: "기망의 의사", s: 85, c: "bg-blue-500" },
                          { l: "재산상 처분", s: 100, c: "bg-emerald-500" },
                          { l: "인과관계", s: 62, c: "bg-amber-500" }
                        ].map((item, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-end">
                              <span className="text-[12px] font-bold text-slate-700">{item.l}</span>
                              <span className="text-[10px] font-black text-slate-400">{item.s}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${item.c} rounded-full transition-all`} style={{ width: `${item.s}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[750px]">
                <SectionHeader title="3. 증거력 분석 및 리스크 점검" icon={ShieldAlert} />
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                  <div className="space-y-3">
                    <h4 className="text-[13px] font-black text-slate-900">확보된 증거</h4>
                    {["투자 약정서", "이체 내역"].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-[13px] text-emerald-600 font-bold">
                        <CheckCircle2 className="w-4 h-4" /> {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[750px]">
                <SectionHeader title="4. 향후 대응 전략 및 전문가 제언" icon={TrendingUp} />
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                  <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-2xl relative overflow-hidden">
                    <h4 className="text-[13px] font-black mb-4 text-blue-400">AI 추천 대응</h4>
                    <p className="text-[12px] opacity-80 leading-tight">1. 내용증명 발송을 통한 최종 변제 기회 부여</p>
                    <p className="text-[12px] opacity-80 leading-tight mt-2">2. 피고소인 명의 부동산 가압류 신청</p>
                  </div>
                  <button className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 text-[14px]">
                    변호사와 상담 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2 (Visible from Level 2) */}
              {analysisLevel >= 2 && (
                <>
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[750px]">
                    <SectionHeader title="5. 관련 판례 정밀 매칭" icon={BookOpen} />
                    <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <h4 className="text-[13px] font-black text-slate-900 mb-2">유사 판례 검색</h4>
                          <div className="space-y-3">
                            {[{ t: "2023다12345", m: "98%" }, { t: "2022고합789", m: "94%" }].map((item, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-50 rounded-xl">
                                <p className="text-[12px] font-black text-blue-600">{item.t}</p>
                                <span className="text-[12px] font-black text-emerald-600">{item.m}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[750px]">
                    <SectionHeader title="6. 법률 키워드 분석" icon={Search} />
                    <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                      <div className="flex flex-wrap gap-2">
                        {["용도기망", "미필적고의", "자본잠식", "편취의사"].map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[750px]">
                    <SectionHeader title="7. 예상 합의금 및 손해액 산정" icon={Landmark} />
                    <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl mb-4">
                        <p className="text-[11px] font-black text-emerald-600">피해 산정액</p>
                        <p className="text-2xl font-black text-emerald-900">50,000,000원</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[750px]">
                    <SectionHeader title="8. 전문 변호사 전략 제언" icon={Briefcase} />
                    <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                      <div className="p-5 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden mb-4">
                        <h4 className="text-[13px] font-black text-blue-400 mb-3">Killer Strategy</h4>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                          피고소인의 법인 자금 세탁 정황을 집중 추적하여 특경법 위반 소지를 검토해야 합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom CTA */}
            <div className="bg-slate-900 rounded-[40px] p-12 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden mt-12">
              <div className="flex items-center gap-10 relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-[32px] flex items-center justify-center text-5xl shadow-2xl shadow-blue-500/40">
                  <span role="img" aria-label="scales">&#x2696;&#xFE0F;</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-3xl font-black text-white tracking-tight">AI 법률 분석이 완료되었습니다.</h4>
                </div>
              </div>
              <button className="w-full lg:w-auto px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-2xl flex items-center justify-center gap-3 text-[17px]">
                전문가 매칭 시작 <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
}

function DonutChart({ item, index }: { item: typeof questionBreakdown[number]; index: number }) {
  const getStrokeColor = () => {
    if (item.percent >= 90) return "#10b981";
    if (item.percent >= 80) return "#3b82f6";
    if (item.percent >= 70) return "#f59e0b";
    return "#f97316";
  };
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (item.percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, delay: index * 0.1 }}
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={getStrokeColor()} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-900 leading-none">{item.percent}<span className="text-[12px] opacity-40">%</span></span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[13px] font-black text-slate-700 leading-tight">{item.label}</p>
        <p className="text-[10px] text-slate-400 font-medium mt-1 max-w-[100px] leading-tight mx-auto">{item.detail}</p>
      </div>
    </div>
  );
}
