import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LogoutPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    (async () => {
      await logout();
      navigate('/hutechc-homepage/login', { replace: true });
    })();
  }, [navigate, logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-xs text-gray-600">로그아웃 중...</div>
    </div>
  );
}
