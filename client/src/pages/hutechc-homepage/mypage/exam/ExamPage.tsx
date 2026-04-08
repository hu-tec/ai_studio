/* 원본: hutechc_hompage_real/app/mypage/exam/page.tsx */
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

// 구 경로(/mypage/exam)로 접근 시 새 시험 메인(/exam)으로 리다이렉트
export default function ExamPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/hutechc-homepage/exam', { replace: true });
  }, [navigate]);

  return null;
}
