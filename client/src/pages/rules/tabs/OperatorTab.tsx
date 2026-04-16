import { useMemo, useState } from 'react';
import { List, Grid3x3, LayoutGrid, Bell, Star, ShieldAlert } from 'lucide-react';
import { DesignRulesTab, ClaudeRulesTab, HRRulesTab } from '../../claude-rules/ClaudeRulesPage';
import {
  CLAUDE_RULES, DESIGN_RULES, HR_SEED_COMPANY, HR_SEED_RANKS,
} from '../../claude-rules/data';
import type { RuleLevel } from '../../claude-rules/data';
import { useAuth } from '@/contexts/AuthContext';

type SubTab = 'design' | 'claude' | 'hr' | 'my';
type ViewMode = 'list' | 'franklin' | 'mandalart';

const SUBTABS: { id: SubTab; label: string }[] = [
  { id: 'design', label: '업무 설계' },
  { id: 'claude', label: 'Claude 작업' },
  { id: 'hr',     label: '인사(가연 xlsx)' },
  { id: 'my',     label: '내 업무(tier)' },
];

const VIEWS: { id: ViewMode; label: string; Icon: typeof List }[] = [
  { id: 'list',      label: '리스트',   Icon: List },
  { id: 'franklin',  label: '프랭클린', Icon: Grid3x3 },
  { id: 'mandalart', label: '만다라트', Icon: LayoutGrid },
];

/* ── 상단 카드 공통 ── */
function Card({ title, icon, color, children }: {
  title: string; icon: React.ReactNode; color: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 border-b border-gray-200">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] font-bold" style={{ color }}>{title}</span>
      </div>
      <div className="p-1.5 text-[10px] text-gray-700">{children}</div>
    </div>
  );
}

export function OperatorTab() {
  const [sub, setSub] = useState<SubTab>('design');
  const [view, setView] = useState<ViewMode>('list');
  const { user } = useAuth();

  const top5Fixed = useMemo(
    () => CLAUDE_RULES.filter((r) => r.level === '고정').slice(0, 5),
    []
  );

  const tierCount = useMemo(() => {
    const design = DESIGN_RULES.reduce((s, r) => s + r.midCategories.reduce((s2, mc) => s2 + mc.items.length, 0), 0);
    const claudeFixed = CLAUDE_RULES.filter((r) => r.level === '고정').length;
    const claudeSemi = CLAUDE_RULES.filter((r) => r.level === '준고정').length;
    const claudeOpt = CLAUDE_RULES.filter((r) => r.level === '선택').length;
    return { design, claudeFixed, claudeSemi, claudeOpt };
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      {/* 상단 3열 요약 카드 (마커 카드 제거 — 마커는 규정과 무관) */}
      <div className="grid grid-cols-3 gap-1.5">
        <Card title="오늘 핵심 고정 규정 TOP 5" icon={<ShieldAlert size={11} />} color="#dc2626">
          <ol className="list-decimal pl-3 space-y-0.5">
            {top5Fixed.map((r) => (
              <li key={r.id} className="truncate" title={r.title}>
                <span className="font-semibold">{r.title}</span>
              </li>
            ))}
            {top5Fixed.length === 0 && <li className="text-gray-400">데이터 없음</li>}
          </ol>
        </Card>

        <Card title={`내 tier: ${user?.tier ?? '(로그인 필요)'}`} icon={<Star size={11} />} color="#2563eb">
          <div className="grid grid-cols-2 gap-0.5">
            <div className="flex justify-between"><span className="text-gray-500">업무 설계</span><b>{tierCount.design}</b></div>
            <div className="flex justify-between"><span className="text-red-500">고정</span><b>{tierCount.claudeFixed}</b></div>
            <div className="flex justify-between"><span className="text-amber-500">준고정</span><b>{tierCount.claudeSemi}</b></div>
            <div className="flex justify-between"><span className="text-sky-500">선택</span><b>{tierCount.claudeOpt}</b></div>
          </div>
          <div className="mt-1 text-[9px] text-gray-400 truncate">
            { user?.name ?? '—' } / { user?.email ?? '미로그인' }
          </div>
        </Card>

        <Card title="최근 변경(3일)" icon={<Bell size={11} />} color="#059669">
          <div className="text-gray-400 text-[10px]">
            변경 이력 API 미연결 — 추후 `/api/rules/history` 로 표시.
          </div>
        </Card>
      </div>

      {/* 뷰 토글 + 서브탭 — 한 줄에 함께 배치 */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-0.5 rounded border border-gray-300 bg-white p-0.5">
          {VIEWS.map((v) => {
            const Icon = v.Icon;
            const active = view === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                  active ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={10} />
                {v.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1">
          {SUBTABS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSub(s.id)}
              className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                sub === s.id
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 본문 — 뷰 × 서브탭 */}
      <div>
        {view === 'list' && <ListView sub={sub} tier={user?.tier} />}
        {view === 'franklin' && <FranklinView sub={sub} />}
        {view === 'mandalart' && <MandalartView sub={sub} />}
      </div>
    </div>
  );
}

/* ══════════════ 1) 리스트 뷰 — D3 3 서브탭 재사용 (4단 개선판) ══════════════ */
function ListView({ sub, tier }: { sub: SubTab; tier: string | undefined }) {
  if (sub === 'design') return <DesignRulesTab />;
  if (sub === 'claude') return <ClaudeRulesTab />;
  if (sub === 'hr') return <HRRulesTab />;
  return <MyWorkList tier={tier} />;
}

function MyWorkList({ tier }: { tier: string | undefined }) {
  const match = tier && HR_SEED_RANKS[tier] ? HR_SEED_RANKS[tier] : null;
  const company = HR_SEED_COMPANY;

  if (!tier) {
    return (
      <div className="rounded border border-amber-200 bg-amber-50 p-2 text-[10px] text-amber-700">
        로그인 후 tier에 해당하는 규정을 표시합니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-1.5">
      <div className="rounded border border-gray-200 bg-white p-1.5">
        <div className="text-[10px] font-bold text-gray-700 mb-1">직급 공통 (전원)</div>
        <div className="space-y-0.5 text-[10px]">
          <div><b className="text-red-500">고정</b> {company.fixed.length}</div>
          <div><b className="text-amber-500">준고정</b> {company.semi.length}</div>
          <div><b className="text-sky-500">선택</b> {company.opt.length}</div>
        </div>
      </div>
      {match ? (
        <>
          <MyRuleCol title="고정" color="red" items={match.fixed} />
          <MyRuleCol title="준고정" color="amber" items={match.semi} />
          <MyRuleCol title="선택" color="sky" items={match.opt} />
        </>
      ) : (
        <div className="col-span-3 rounded border border-gray-200 bg-white p-1.5 text-[10px] text-gray-500">
          tier "{tier}" 에 해당하는 가연 xlsx 시드 없음. 매핑 기획 필요.
        </div>
      )}
    </div>
  );
}

function MyRuleCol({ title, color, items }: { title: string; color: 'red' | 'amber' | 'sky'; items: string[] }) {
  const cls = {
    red:   'border-red-200 bg-red-50 text-red-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    sky:   'border-sky-200 bg-sky-50 text-sky-700',
  }[color];
  return (
    <div className={`rounded border ${cls} p-1`}>
      <div className="text-[10px] font-bold mb-0.5">{title} ({items.length})</div>
      <ul className="space-y-0.5 text-[9px] text-gray-700 leading-tight">
        {items.map((s, i) => <li key={i}>• {s}</li>)}
      </ul>
    </div>
  );
}

/* ══════════════ 2) 프랭클린 뷰 — 4사분면 (A·B·C·D) ══════════════ */
function FranklinView({ sub }: { sub: SubTab }) {
  // level → quadrant 매핑: 고정→A(즉시), 준고정→B(계획), 선택→C(위임). D(보류)는 빈 상태.
  const items = useMemo(() => {
    if (sub === 'design') {
      // 대분류 전체를 item 으로 — 기본 quadrant = B(준고정)
      return DESIGN_RULES.flatMap((r) =>
        r.midCategories.flatMap((mc) =>
          mc.items.map((it) => ({ id: `${r.id}-${mc.mid}-${it.title}`, title: it.title, body: it.content, level: '준고정' as RuleLevel, color: r.color }))
        )
      );
    }
    if (sub === 'claude') {
      return CLAUDE_RULES.flatMap((r) =>
        r.rules.map((ru, i) => ({ id: `${r.id}-${i}`, title: r.title, body: ru, level: r.level, color: r.level === '고정' ? '#dc2626' : r.level === '준고정' ? '#d97706' : '#0284c7' }))
      );
    }
    if (sub === 'hr') {
      const build = (rs: { fixed: string[]; semi: string[]; opt: string[] }, group: string) => [
        ...rs.fixed.map((s, i) => ({ id: `${group}-f${i}`, title: group, body: s, level: '고정' as RuleLevel, color: '#dc2626' })),
        ...rs.semi.map((s, i) => ({ id: `${group}-s${i}`, title: group, body: s, level: '준고정' as RuleLevel, color: '#d97706' })),
        ...rs.opt.map((s, i) => ({ id: `${group}-o${i}`, title: group, body: s, level: '선택' as RuleLevel, color: '#0284c7' })),
      ];
      return build(HR_SEED_COMPANY, '직급 공통');
    }
    return [];
  }, [sub]);

  const buckets = useMemo(() => {
    const A = items.filter((it) => it.level === '고정');
    const B = items.filter((it) => it.level === '준고정');
    const C = items.filter((it) => it.level === '선택');
    const D: typeof items = [];
    return { A, B, C, D };
  }, [items]);

  const QUADRANTS: { key: 'A' | 'B' | 'C' | 'D'; label: string; desc: string; color: string; bg: string }[] = [
    { key: 'A', label: 'A 즉시 실행',     desc: '고정',   color: '#dc2626', bg: '#fef2f2' },
    { key: 'B', label: 'B 계획/예약',     desc: '준고정', color: '#d97706', bg: '#fffbeb' },
    { key: 'C', label: 'C 위임',         desc: '선택',   color: '#0284c7', bg: '#f0f9ff' },
    { key: 'D', label: 'D 보류/제거',     desc: '미분류', color: '#6b7280', bg: '#f9fafb' },
  ];

  return (
    <div className="grid grid-cols-4 gap-1">
      {QUADRANTS.map((q) => {
        const list = buckets[q.key];
        return (
          <div key={q.key} className="rounded-md border overflow-hidden" style={{ borderColor: q.color + '40', background: q.bg }}>
            <div className="flex items-center gap-1 px-1.5 py-0.5 border-b" style={{ borderColor: q.color + '33' }}>
              <span className="text-[11px] font-bold" style={{ color: q.color }}>{q.label}</span>
              <span className="text-[9px] text-gray-500">({q.desc})</span>
              <span className="ml-auto text-[10px] font-bold" style={{ color: q.color }}>{list.length}</span>
            </div>
            <ul className="p-1 space-y-0.5 max-h-[60vh] overflow-y-auto">
              {list.length === 0 ? (
                <li className="text-[10px] text-gray-400 text-center py-1">항목 없음</li>
              ) : (
                list.map((it) => (
                  <li key={it.id} className="rounded bg-white border border-gray-200 px-1 py-0.5">
                    <div className="text-[9px] font-bold text-gray-800 truncate" title={it.title}>{it.title}</div>
                    <div className="text-[9px] text-gray-600 leading-tight">{it.body}</div>
                  </li>
                ))
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════ 3) 만다라트 뷰 — 3×3 매트릭스 (중앙 대분류 + 주변 중분류 8칸) ══════════════ */
function MandalartView({ sub }: { sub: SubTab }) {
  // 대분류 카루셀로 선택 → 3×3 매트릭스에 중분류 배치
  const cells = useMemo(() => {
    if (sub === 'design') {
      return DESIGN_RULES.map((r) => ({
        id: r.id,
        center: r.major,
        color: r.color,
        bg: r.bg,
        around: r.midCategories.slice(0, 8).map((mc) => ({
          title: mc.mid,
          details: mc.items.map((i) => i.title),
        })),
      }));
    }
    if (sub === 'claude') {
      const cats = [...new Set(CLAUDE_RULES.map((r) => r.category))];
      return cats.map((cat) => {
        const rules = CLAUDE_RULES.filter((r) => r.category === cat);
        return {
          id: cat,
          center: cat,
          color: '#2563eb',
          bg: '#eff6ff',
          around: rules.slice(0, 8).map((r) => ({
            title: r.title,
            details: r.rules.slice(0, 3),
          })),
        };
      });
    }
    if (sub === 'hr') {
      // 공통 + 주요 직급을 대분류 카드로 배치
      const g = HR_SEED_COMPANY;
      return [{
        id: 'company',
        center: '직급 공통',
        color: '#4f46e5',
        bg: '#eef2ff',
        around: [
          ...g.fixed.slice(0, 3).map((s) => ({ title: '고정', details: [s] })),
          ...g.semi.slice(0, 3).map((s) => ({ title: '준고정', details: [s] })),
          ...g.opt.slice(0, 2).map((s) => ({ title: '선택', details: [s] })),
        ],
      }];
    }
    return [];
  }, [sub]);

  if (cells.length === 0) {
    return <div className="rounded border border-gray-200 bg-white p-2 text-[10px] text-gray-500">표시할 대분류 없음.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {cells.map((cell) => (
        <div key={cell.id} className="rounded border overflow-hidden" style={{ borderColor: cell.color + '40' }}>
          <div className="px-1.5 py-0.5 border-b text-[10px] font-bold truncate" style={{ color: cell.color, background: cell.bg, borderColor: cell.color + '33' }}>
            🎯 {cell.center}
          </div>
          <div className="grid grid-cols-3 gap-0.5 p-0.5" style={{ background: cell.bg + '30' }}>
            {Array.from({ length: 9 }).map((_, i) => {
              const isCenter = i === 4;
              if (isCenter) {
                return (
                  <div key={i} className="aspect-square rounded flex items-center justify-center text-center p-1" style={{ background: cell.color, color: '#fff' }}>
                    <span className="text-[10px] font-bold leading-tight">{cell.center}</span>
                  </div>
                );
              }
              const idx = i < 4 ? i : i - 1; // 0..7 주변
              const item = cell.around[idx];
              if (!item) {
                return <div key={i} className="aspect-square rounded border border-dashed border-gray-300 bg-white/50" />;
              }
              return (
                <div key={i} className="aspect-square rounded border border-gray-200 bg-white p-0.5 overflow-hidden">
                  <div className="text-[9px] font-bold text-gray-800 leading-tight truncate" title={item.title}>{item.title}</div>
                  <ul className="mt-0.5 space-y-px">
                    {item.details.slice(0, 3).map((d, di) => (
                      <li key={di} className="text-[8px] text-gray-500 leading-tight truncate" title={d}>• {d}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
