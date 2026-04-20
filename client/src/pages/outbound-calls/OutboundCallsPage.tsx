// C2 거래처 아웃콜 — 기본은 개선된 v2(PersonHub 공통 프레임)
// 우측 상단 작은 토글로 구버전(Legacy) 복귀 가능. 선택은 localStorage 저장.
//
// 별도 메뉴 분리 대신 C2 안에서 UI 세대 전환 — 사용자 피드백 반영.

import { useState } from 'react';
import OutboundCallsV2Page from '../outbound-calls-v2/OutboundCallsV2Page';
import { OutboundCallsLegacyView } from './OutboundCallsLegacyView';

const STORAGE_KEY = 'oc_ui_mode';

export function OutboundCallsPage() {
  const [useLegacy, setUseLegacy] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'legacy'; }
    catch { return false; }
  });

  const toggle = () => {
    const next = !useLegacy;
    setUseLegacy(next);
    try { localStorage.setItem(STORAGE_KEY, next ? 'legacy' : 'v2'); } catch {}
  };

  return (
    <div className="relative h-full w-full">
      <button
        onClick={toggle}
        className="absolute top-1.5 right-1.5 z-[60] px-2 py-0.5 rounded-full border border-slate-300 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-500"
        title={useLegacy ? '개선된 공통 프레임으로 전환' : '구버전(레거시) UI로 전환'}
      >
        {useLegacy ? '🆕 개선뷰' : '🗄 구버전'}
      </button>
      {useLegacy ? <OutboundCallsLegacyView /> : <OutboundCallsV2Page />}
    </div>
  );
}

export default OutboundCallsPage;
