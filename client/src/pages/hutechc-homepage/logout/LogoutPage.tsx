/* 원본: hutechc_hompage_real/app/logout/page.tsx */
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      navigate('/hutechc-homepage/');
      window.location.reload();
    })();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-sm text-gray-600">로그아웃 중...</div>
    </div>
  );
}
