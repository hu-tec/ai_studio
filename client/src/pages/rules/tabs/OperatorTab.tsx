import { useMemo, useState } from 'react';
import { NavLink } from 'react-router';
import { Star, Bell, Bookmark, ShieldAlert } from 'lucide-react';
import { DesignRulesTab, ClaudeRulesTab, HRRulesTab } from '../../claude-rules/ClaudeRulesPage';
import { CLAUDE_RULES, DESIGN_RULES, HR_SEED_COMPANY, HR_SEED_RANKS, HR_SEED_DEPTS, HR_SEED_SERVICES } from '../../claude-rules/data';
import { useAuth } from '@/contexts/AuthContext';
import { MARKER_COLORS, useSidebarMarkers } from '@/components/layout/sidebarMarkers';
import { ALL_NAV_ITEMS } from '@/components/layout/navData';

type SubTab = 'design' | 'claude' | 'hr' | 'my';

const SUBTABS: { id: SubTab; label: string }[] = [
  { id: 'design', label: '업무 설계' },
  { id: 'claude', label: 'Claude 작업' },
  { id: 'hr',     label: '인사(가연 xlsx)' },
  { id: 'my',     label: '내 업무(tier)' },
];

/* ── 카드 공통 ── */
function Card({ title, icon, children, color = '#64748b' }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; color?: string;
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
  const { user } = useAuth();
  const { markers } = useSidebarMarkers();

  // 오늘 핵심 고정 규정 (Claude 고정 5개)
  const top5Fixed = useMemo(
    () => CLAUDE_RULES.filter((r) => r.level === '고정').slice(0, 5),
    []
  );

  // tier별 카운트
  const tierCount = useMemo(() => {
    const design = DESIGN_RULES.reduce((s, r) => s + r.midCategories.reduce((s2, mc) => s2 + mc.items.length, 0), 0);
    const claudeFixed = CLAUDE_RULES.filter((r) => r.level === '고정').length;
    const claudeSemi = CLAUDE_RULES.filter((r) => r.level === '준고정').length;
    const claudeOpt = CLAUDE_RULES.filter((r) => r.level === '선택').length;
    return { design, claudeFixed, claudeSemi, claudeOpt };
  }, []);

  // 마커 찍은 페이지
  const markedPages = useMemo(() => {
    return ALL_NAV_ITEMS.filter((it) => markers[it.code]).map((it) => ({ ...it, marker: markers[it.code] }));
  }, [markers]);

  return (
    <div className="flex flex-col gap-1.5">
      {/* 상단 1단: 가로 4열 요약 카드 */}
      <div className="grid grid-cols-4 gap-1.5">
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
          <div className="mt-1 text-[9px] text-gray-400">
            { user?.name ?? '—' } / { user?.email ?? '미로그인' }
          </div>
        </Card>

        <Card title="최근 변경(3일)" icon={<Bell size={11} />} color="#059669">
          <div className="text-gray-400 text-[10px]">
            변경 이력 API 미연결 — 추후 `/api/rules/history`로 표시.
          </div>
        </Card>

        <Card title="내 마커 바로가기" icon={<Bookmark size={11} />} color="#7c3aed">
          {markedPages.length === 0 ? (
            <div className="text-gray-400 text-[10px]">사이드바에서 `·` 버튼 클릭 → #/$ 지정 시 표시</div>
          ) : (
            <div className="flex flex-col gap-0.5 max-h-20 overflow-y-auto">
              {markedPages.map((p) => {
                const mc = MARKER_COLORS[p.marker!];
                return (
                  <NavLink
                    key={p.code}
                    to={p.to}
                    className="flex items-center gap-1 rounded px-1 py-0.5 hover:bg-gray-50"
                    style={{ border: `1px solid ${mc.border}`, background: mc.bg }}
                  >
                    <span className="font-bold text-[9px]" style={{ color: mc.text }}>{p.marker}</span>
                    <span className="text-[9px] text-gray-500">{p.code}</span>
                    <span className="text-[10px] text-gray-800 truncate">{p.label}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* 하단 2단: 4 서브탭 + 본문 */}
      <div className="flex items-center gap-1">
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

      <div>
        {sub === 'design' && <DesignRulesTab />}
        {sub === 'claude' && <ClaudeRulesTab />}
        {sub === 'hr' && <HRRulesTab />}
        {sub === 'my' && <MyWorkSubTab tier={user?.tier} />}
      </div>
    </div>
  );
}

/* ── 내 업무 서브탭 — 로그인 tier별로 관련 규정 필터 ── */
function MyWorkSubTab({ tier }: { tier: string | undefined }) {
  // HR seed에서 tier(직급)에 해당하는 규정만 추출
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
      <div className="col-span-1 rounded border border-gray-200 bg-white p-1.5">
        <div className="text-[10px] font-bold text-gray-700 mb-1">직급 공통 (전 임직원)</div>
        <div className="space-y-0.5 text-[10px] text-gray-600">
          <div><b className="text-red-500">고정</b> {company.fixed.length}</div>
          <div><b className="text-amber-500">준고정</b> {company.semi.length}</div>
          <div><b className="text-sky-500">선택</b> {company.opt.length}</div>
        </div>
      </div>
      <div className="col-span-3 rounded border border-gray-200 bg-white p-1.5">
        <div className="text-[10px] font-bold text-gray-700 mb-1">
          내 tier({tier}) 해당 규정
        </div>
        {match ? (
          <div className="grid grid-cols-3 gap-1">
            <RuleCol title="고정" color="red" items={match.fixed} />
            <RuleCol title="준고정" color="amber" items={match.semi} />
            <RuleCol title="선택" color="sky" items={match.opt} />
          </div>
        ) : (
          <div className="text-[10px] text-gray-400">
            해당 tier "{tier}" 에 대한 가연 xlsx 시드 데이터가 없습니다. (매핑: admin/manager/user/external → 가연 xlsx 직급명)
          </div>
        )}
      </div>
      <div className="col-span-4 rounded border border-dashed border-gray-300 bg-gray-50 p-1.5 text-[10px] text-gray-500">
        💡 부서별/서비스별 규정은 관리자 탭에서 부서 필터를 선택하면 직접 편집 가능. 부서 데이터: {Object.keys(HR_SEED_DEPTS).length}개 부서 · {Object.keys(HR_SEED_SERVICES).length}개 서비스.
      </div>
    </div>
  );
}

function RuleCol({ title, color, items }: { title: string; color: 'red' | 'amber' | 'sky'; items: string[] }) {
  const cls = {
    red:   'border-red-200 bg-red-50 text-red-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    sky:   'border-sky-200 bg-sky-50 text-sky-700',
  }[color];
  return (
    <div className={`rounded border ${cls} p-1`}>
      <div className="text-[10px] font-bold mb-0.5">{title} ({items.length})</div>
      <ul className="space-y-0.5 text-[10px] text-gray-700 leading-tight">
        {items.map((s, i) => <li key={i}>• {s}</li>)}
      </ul>
    </div>
  );
}
