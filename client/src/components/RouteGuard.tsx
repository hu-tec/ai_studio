import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth, type UserTier } from '@/contexts/AuthContext';

interface Props {
  tiers?: UserTier[];
  children: ReactNode;
}

export default function RouteGuard({ tiers, children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-2 text-xs text-gray-500">
        인증 확인 중...
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/hutechc-homepage/login?next=${next}`} replace />;
  }

  if (tiers && !tiers.includes(user.tier)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-2 gap-1 text-xs">
        <div className="text-red-600 font-semibold">접근 권한이 없습니다</div>
        <div className="text-gray-600">현재 등급: {user.tier} / 필요: {tiers.join(', ')}</div>
        <a href="/app/" className="text-blue-600 underline">홈으로</a>
      </div>
    );
  }

  return <>{children}</>;
}
