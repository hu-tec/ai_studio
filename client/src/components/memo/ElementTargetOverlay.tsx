import { useEffect, useRef, useState, useCallback } from 'react';
import type { MemoTarget } from './memoTypes';

interface Props {
  onSelect: (target: MemoTarget) => void;
  onCancel: () => void;
}

function getLabel(el: Element): string {
  const text = (el as HTMLElement).innerText?.trim() || '';
  if (text) return text.slice(0, 50);
  const aria = el.getAttribute('aria-label');
  if (aria) return aria.slice(0, 50);
  const title = el.getAttribute('title');
  if (title) return title.slice(0, 50);
  return el.tagName.toLowerCase();
}

function getSelector(el: Element): string {
  // 1) data-memo-target 우선
  const memoTarget = el.getAttribute('data-memo-target');
  if (memoTarget) return `[data-memo-target="${memoTarget}"]`;

  // 2) id
  if (el.id) return `#${CSS.escape(el.id)}`;

  // 3) 최대 3단계 nth-child 경로
  const parts: string[] = [];
  let current: Element | null = el;
  for (let i = 0; i < 3 && current && current !== document.body; i++) {
    const parent: Element | null = current.parentElement;
    if (!parent) break;
    const children = Array.from(parent.children);
    const idx = children.indexOf(current) + 1;
    const tag = current.tagName.toLowerCase();
    parts.unshift(`${tag}:nth-child(${idx})`);
    current = parent;
  }
  return parts.join(' > ');
}

function getDescription(el: Element): string {
  // 가장 가까운 heading 텍스트
  const heading = el.closest('[data-memo-target]')
    || el.closest('section')
    || el.closest('[class*="card"]')
    || el.closest('table');
  if (heading) {
    const h = heading.querySelector('h1,h2,h3,h4,h5,h6,[class*="title"],[class*="header"]');
    if (h) return (h as HTMLElement).innerText?.trim().slice(0, 60) || '';
  }
  return '';
}

// 메모 관련 요소 제외 (Sheet, 메모 버튼, 사이드바)
function isExcluded(el: Element): boolean {
  return !!(
    el.closest('[data-slot="sheet-content"]') ||
    el.closest('[data-slot="sheet-overlay"]') ||
    el.closest('[data-memo-panel]') ||
    el.closest('aside') ||
    el.closest('[data-target-overlay]')
  );
}

export function ElementTargetOverlay({ onSelect, onCancel }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState<DOMRect | null>(null);
  const [tooltipText, setTooltipText] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    const overlay = overlayRef.current;
    if (!overlay) return;

    // 오버레이 투명화 후 하단 엘리먼트 감지
    overlay.style.pointerEvents = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = 'auto';

    if (!el || isExcluded(el)) {
      setHighlight(null);
      setTooltipText('');
      return;
    }

    const rect = el.getBoundingClientRect();
    setHighlight(rect);
    setTooltipText(getLabel(el));
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const overlay = overlayRef.current;
    if (!overlay) return;

    overlay.style.pointerEvents = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = 'auto';

    if (!el || isExcluded(el)) return;

    onSelect({
      label: getLabel(el),
      selector: getSelector(el),
      description: getDescription(el),
    });
  }, [onSelect]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
  }, [onCancel]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMouseMove, handleKeyDown]);

  return (
    <div
      ref={overlayRef}
      data-target-overlay
      onClick={(e) => handleClick(e.nativeEvent)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        cursor: 'crosshair',
        background: 'rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* 안내 배너 */}
      <div
        style={{
          position: 'fixed',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e293b',
          color: '#fff',
          padding: '8px 20px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          zIndex: 10000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        대상 엘리먼트를 클릭하세요
        <button
          onClick={(e) => { e.stopPropagation(); onCancel(); }}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#fff',
            padding: '2px 10px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          ESC 취소
        </button>
      </div>

      {/* 하이라이트 */}
      {highlight && (
        <div
          style={{
            position: 'fixed',
            top: highlight.top - 2,
            left: highlight.left - 2,
            width: highlight.width + 4,
            height: highlight.height + 4,
            border: '2px solid #3b82f6',
            borderRadius: 4,
            background: 'rgba(59, 130, 246, 0.08)',
            pointerEvents: 'none',
            transition: 'all 0.1s ease',
          }}
        />
      )}

      {/* 툴팁 */}
      {tooltipText && (
        <div
          style={{
            position: 'fixed',
            top: mousePos.y + 16,
            left: mousePos.x + 12,
            background: '#1e293b',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 4,
            fontSize: 12,
            maxWidth: 240,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 10001,
          }}
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
}
