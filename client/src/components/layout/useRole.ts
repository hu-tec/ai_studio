import { useState, useEffect, useSyncExternalStore } from 'react';

export type ViewRole = 'all' | 'guest' | 'staff' | 'admin';

/* localStorage + custom event 기반 역할 상태 공유 */
let listeners: (() => void)[] = [];

function subscribe(cb: () => void) {
  listeners.push(cb);
  // master-nav.js에서 발행하는 커스텀 이벤트 수신
  const handler = () => cb();
  window.addEventListener('hutechc-role-change', handler);
  return () => {
    listeners = listeners.filter(l => l !== cb);
    window.removeEventListener('hutechc-role-change', handler);
  };
}

function getSnapshot(): ViewRole {
  return (localStorage.getItem('hutechc_role') as ViewRole) || 'all';
}

/** 현재 선택된 뷰 역할 (master-nav.js와 동기화) */
export function useRole(): ViewRole {
  return useSyncExternalStore(subscribe, getSnapshot);
}
