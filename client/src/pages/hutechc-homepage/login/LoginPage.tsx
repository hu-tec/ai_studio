import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

const DEV_ACCOUNTS: Array<{ tier: string; label: string; email: string; password: string; color: string }> = [
  { tier: 'admin',    label: '관리자(개발자/수연)', email: 'admin@hutechc.local',   password: 'admin123!',   color: 'bg-amber-50 border-amber-300 text-amber-900' },
  { tier: 'manager',  label: '팀장(가연)',           email: 'manager@hutechc.local', password: 'manager123!', color: 'bg-purple-50 border-purple-300 text-purple-900' },
  { tier: 'user',     label: '내부 사용자',          email: 'user@hutechc.local',    password: 'user123!',    color: 'bg-blue-50 border-blue-300 text-blue-900' },
  { tier: 'external', label: '외부인',               email: 'guest@hutechc.local',   password: 'guest123!',   color: 'bg-emerald-50 border-emerald-300 text-emerald-900' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/hutechc-homepage/admin';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다');
    } finally {
      setLoading(false);
    }
  }

  function fill(acc: { email: string; password: string }) {
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2 py-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-4">
        <h1 className="text-lg font-bold text-gray-900">통합 로그인</h1>
        <p className="text-xs text-gray-600 mt-1">4-tier 권한 기반 로그인. 개발 환경에서는 아래 시드 계정 클릭.</p>

        <form onSubmit={onSubmit} className="mt-3 space-y-2">
          <div>
            <label className="block text-xs text-gray-700 mb-0.5">이메일</label>
            <input
              className="w-full h-9 px-2 rounded border border-gray-300 text-xs"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-700 mb-0.5">비밀번호</label>
            <input
              className="w-full h-9 px-2 rounded border border-gray-300 text-xs"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error ? <div className="text-xs text-red-600">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-9 rounded bg-black text-white text-xs font-semibold disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="pt-2">
            <div className="text-[10px] text-gray-500 mb-1">개발용 시드 계정 (클릭 시 자동 입력)</div>
            <div className="grid grid-cols-2 gap-1">
              {DEV_ACCOUNTS.map((a) => (
                <button
                  key={a.tier}
                  type="button"
                  onClick={() => fill(a)}
                  className={`border rounded p-1 text-left text-[10px] leading-tight hover:brightness-95 ${a.color}`}
                >
                  <div className="font-semibold">{a.label}</div>
                  <div className="font-mono">{a.email}</div>
                  <div className="font-mono opacity-70">{a.password}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs pt-1">
            <Link to="/hutechc-homepage" className="text-gray-600 hover:underline">홈으로</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
