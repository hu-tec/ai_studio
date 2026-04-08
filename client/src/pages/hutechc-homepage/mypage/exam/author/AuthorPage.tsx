/* 원본: hutechc_hompage_real/app/mypage/exam/author/page.tsx */
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function AuthorPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/hutechc-homepage/mypage/exam/author/requests', { replace: true });
  }, [navigate]);

  return null;
}
