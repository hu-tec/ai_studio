/* 원본: hutechc_hompage_real/app/(client-layout)/admin/sites/new/page.tsx */
import { Link } from 'react-router';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

type Option = { key: string; label: string };

const SITE_TYPES: Option[] = [
  { key: '번역', label: '번역' },
  { key: '시험', label: '시험' },
  { key: '전시', label: '전시/가이드' },
  { key: '스토리', label: '스토리' },
];

const MODULES: Option[] = [
  { key: 'A', label: 'A (AI Writing Actions)' },
  { key: 'B', label: 'B (AI Translation Actions)' },
  { key: 'C', label: 'C (Work Order Lite)' },
  { key: 'D', label: 'D (Site Contents)' },
  { key: 'E', label: 'E (Platform Core)' },
];

const PLUGINS: Option[] = [
  { key: 'F', label: 'F (FAQ/문의)' },
  { key: 'G', label: 'G (가격정책)' },
  { key: 'H', label: 'H (워크플로우)' },
  { key: 'I', label: 'I (알림)' },
];

function presetForSiteType(siteType: string) {
  switch (siteType) {
    case '번역':
      return { modules: ['B', 'D', 'E'], plugins: ['G', 'I'] };
    case '시험':
      return { modules: ['D', 'E'], plugins: ['I'] };
    case '전시':
      return { modules: ['D', 'E'], plugins: ['I'] };
    case '스토리':
      return { modules: ['A', 'D', 'E'], plugins: ['I'] };
    default:
      return { modules: [], plugins: [] };
  }
}

function ToggleGroup({
  title,
  options,
  values,
  onChange,
}: {
  title: string;
  options: Option[];
  values: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-gray-900 mb-2">{title}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {options.map((o) => {
          const checked = values.includes(o.key);
          return (
            <label
              key={o.key}
              className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 bg-white"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  if (e.target.checked) onChange(Array.from(new Set([...values, o.key])));
                  else onChange(values.filter((v) => v !== o.key));
                }}
              />
              <span className="text-sm text-gray-800">{o.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function NewPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [language, setLanguage] = useState('ko');
  const [siteType, setSiteType] = useState('번역');

  const [modules, setModules] = useState<string[]>(() => presetForSiteType('번역').modules);
  const [plugins, setPlugins] = useState<string[]>(() => presetForSiteType('번역').plugins);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const stepSummary = useMemo(
    () => ({ name: name.trim() || '-', domain: domain.trim() || '-', siteType }),
    [name, domain, siteType],
  );

  async function create() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, domain, language, siteType, modules, plugins }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? '사이트 생성 실패');
      }

      navigate('/hutechc-homepage/admin/sites');
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : '사이트 생성 실패');
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(nextSiteType: string) {
    const preset = presetForSiteType(nextSiteType);
    setModules(preset.modules);
    setPlugins(preset.plugins);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">사이트 추가 (마법사)</div>
            <div className="text-xs text-gray-500">생성 즉시 /admin/sites 에 반영됩니다</div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/hutechc-homepage/admin/sites" className="text-sm text-gray-600 hover:underline">
              사이트 목록
            </Link>
            <Link to="/hutechc-homepage/admin/dashboard" className="text-sm text-gray-600 hover:underline">
              대시보드
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm font-semibold text-gray-900 mb-3">필수 항목(화면 고정)</div>
            <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
              <li>기본 정보(사이트명/도메인/언어)</li>
              <li>사이트 타입</li>
              <li>모듈(A~E)</li>
              <li>플러그인(F~I)</li>
            </ol>

            <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-xs text-gray-500">미리보기</div>
              <div className="text-sm text-gray-800 mt-2">
                <div>사이트명: {stepSummary.name}</div>
                <div>도메인: {stepSummary.domain}</div>
                <div>타입: {stepSummary.siteType}</div>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              지금은 DB 설계보다, 통합 플랫폼에서 &quot;필수 운영 항목이 보이는 UI&quot;를 먼저 확정합니다.
            </p>
          </aside>

          <section className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-gray-900">새 사이트 생성</h1>
              <p className="text-sm text-gray-600 mt-1">
                생성하면 바로 사이트 목록에 추가됩니다(로컬 파일 저장).
              </p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">사이트명</label>
                  <input
                    className="w-full h-11 px-3 rounded-lg border border-gray-200"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예) 번역센터"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">도메인(또는 서브도메인)</label>
                  <input
                    className="w-full h-11 px-3 rounded-lg border border-gray-200"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="예) tenant1.local"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">기본 언어</label>
                  <input
                    className="w-full h-11 px-3 rounded-lg border border-gray-200"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="ko"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">사이트 타입</label>
                  <select
                    className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-white"
                    value={siteType}
                    onChange={(e) => {
                      const nextType = e.target.value;
                      setSiteType(nextType);
                      applyPreset(nextType);
                    }}
                  >
                    {SITE_TYPES.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2">
                    <button
                      type="button"
                      className="text-xs px-3 py-1 rounded-full bg-gray-100 border border-gray-200"
                      onClick={() => applyPreset(siteType)}
                    >
                      권장 프리셋 다시 적용
                    </button>
                  </div>
                </div>
              </div>

              <ToggleGroup title="모듈 선택(A~E)" options={MODULES} values={modules} onChange={setModules} />
              <ToggleGroup title="플러그인 선택(F~I)" options={PLUGINS} values={plugins} onChange={setPlugins} />

              {error ? <div className="text-sm text-red-600">{error}</div> : null}

              <div className="pt-2 flex items-center justify-between">
                <Link to="/hutechc-homepage/admin/sites" className="text-sm text-gray-600 hover:underline">
                  취소
                </Link>
                <button
                  className="px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50"
                  type="button"
                  disabled={loading}
                  onClick={create}
                >
                  {loading ? '생성 중...' : '사이트 생성'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
