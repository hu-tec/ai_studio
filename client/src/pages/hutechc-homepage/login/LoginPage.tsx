/* 원본: hutechc_hompage_real/app/login/page.tsx + LoginClient.tsx 통합
   서버 컴포넌트 → 클라이언트 컴포넌트 변환 */
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/hutechc-homepage/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? '로그인에 실패했습니다');
      }

      navigate(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900">관리자 로그인</h1>
        <p className="text-sm text-gray-600 mt-2">
          통합 플랫폼 관리자 화면은 로그인 후 접근할 수 있습니다.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">이메일</label>
            <input
              className="w-full h-11 px-3 rounded-lg border border-gray-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">비밀번호</label>
            <input
              className="w-full h-11 px-3 rounded-lg border border-gray-200"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-black text-white text-sm font-semibold disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="text-xs text-gray-500">
            개발용 기본값(개발 환경): admin@local / admin
          </div>

          <div className="text-sm">
            <Link to="/hutechc-homepage" className="text-gray-600 hover:underline">
              홈으로
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
