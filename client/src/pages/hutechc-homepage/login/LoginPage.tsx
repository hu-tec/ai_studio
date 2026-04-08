/* 원본: hutechc_hompage_real/app/login/page.tsx */
import LoginClient from './LoginClient';

type LoginPageProps = {
  searchParams?: Promise<{ next?: string } | undefined>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const sp = (await searchParams) ?? {};
  const next = sp.next ?? '/admin/dashboard';
  return <LoginClient next={next} />;
}
