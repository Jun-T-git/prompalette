import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { isLocalDevelopment } from '@/lib/auth-stub';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  
  // ローカル開発環境では認証をスキップしてダッシュボードを表示
  if (isLocalDevelopment || session) {
    redirect('/dashboard');
  }
  
  // 本番環境でセッションがない場合はドキュメントページを表示
  redirect('/docs');
}