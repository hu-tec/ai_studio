/* 원본: hutechc_hompage_real/app/(client-layout)/payment-guide/page.tsx
   Next.js → React Router 변환 */
import { useState } from 'react';

const LANG_PAIRS = [
  { from: '한국어', to: '영어', rate: 40 },
  { from: '한국어', to: '일본어', rate: 45 },
  { from: '한국어', to: '중국어', rate: 45 },
  { from: '영어', to: '한국어', rate: 45 },
  { from: '일본어', to: '한국어', rate: 50 },
  { from: '기타 언어', to: '기타', rate: 55 },
];

const SERVICE_TYPES = [
  { name: 'AI 번역 (기본)', multiplier: 1.0, desc: 'AI 자동 번역만 제공' },
  { name: 'AI + 휴먼 감수', multiplier: 1.8, desc: 'AI 번역 후 전문 번역가 검수' },
  { name: '휴먼 번역', multiplier: 2.5, desc: '전문 번역가가 직접 번역' },
  { name: '공증 번역', multiplier: 3.5, desc: '번역 + 공증 포함' },
];

export default function PaymentGuidePage() {
  const [charCount, setCharCount] = useState(1000);
  const [selectedLang, setSelectedLang] = useState(0);
  const [selectedService, setSelectedService] = useState(0);

  const baseRate = LANG_PAIRS[selectedLang].rate;
  const multiplier = SERVICE_TYPES[selectedService].multiplier;
  const total = Math.round(charCount * baseRate * multiplier);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">결제 시스템 안내</h1>
        <p className="text-gray-600">번역 서비스 요금 산정 방식을 확인하세요</p>
      </div>

      {/* 언어쌍별 기본 요율 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">언어쌍별 기본 요율</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-4 py-2 text-left">출발어</th>
                <th className="border px-4 py-2 text-left">도착어</th>
                <th className="border px-4 py-2 text-right">글자당 요율 (원)</th>
              </tr>
            </thead>
            <tbody>
              {LANG_PAIRS.map((lp, i) => (
                <tr key={i} className={selectedLang === i ? 'bg-blue-50' : ''}>
                  <td className="border px-4 py-2">{lp.from}</td>
                  <td className="border px-4 py-2">{lp.to}</td>
                  <td className="border px-4 py-2 text-right font-mono">{lp.rate}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 서비스 유형별 배율 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">서비스 유형별 배율</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICE_TYPES.map((st, i) => (
            <div key={i} className={`border rounded-xl p-4 cursor-pointer transition ${selectedService === i ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'}`}
              onClick={() => setSelectedService(i)}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-900">{st.name}</span>
                <span className="text-sm font-mono text-blue-600">×{st.multiplier}</span>
              </div>
              <p className="text-xs text-gray-600">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 간이 계산기 */}
      <section className="space-y-4 bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900">간이 요금 계산기</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">언어쌍</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={selectedLang} onChange={e => setSelectedLang(Number(e.target.value))}>
              {LANG_PAIRS.map((lp, i) => (
                <option key={i} value={i}>{lp.from} → {lp.to}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">서비스 유형</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={selectedService} onChange={e => setSelectedService(Number(e.target.value))}>
              {SERVICE_TYPES.map((st, i) => (
                <option key={i} value={i}>{st.name} (×{st.multiplier})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">글자 수</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" value={charCount} onChange={e => setCharCount(Number(e.target.value))} min={0} />
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
          <div className="text-sm text-gray-600">예상 금액</div>
          <div className="text-3xl font-bold text-gray-900">{total.toLocaleString()}원</div>
          <div className="text-xs text-gray-500 mt-1">
            {charCount.toLocaleString()}자 × {baseRate}원 × {multiplier} = {total.toLocaleString()}원
          </div>
        </div>
      </section>
    </div>
  );
}
