import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth-utils';
import { isLocalDevelopment, STUB_USER_SESSION } from '@/lib/auth-stub';

export default async function HomePage() {
  // ローカル開発環境では認証をスキップしてダッシュボードを表示
  if (isLocalDevelopment) {
    redirect(`/${STUB_USER_SESSION.user.username}`);
  }
  
  const currentUser = await getUserFromSession();
  
  if (currentUser?.username) {
    redirect(`/${currentUser.username}`);
  }
  
  // 本番環境でセッションがない場合はログインページを表示
  redirect('/login');
}