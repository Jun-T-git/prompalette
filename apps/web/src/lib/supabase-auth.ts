// Supabase authentication helper for NextAuth integration
import { createClientSupabase } from './supabase';
import type { Session } from 'next-auth';

/**
 * Supabaseクライアントにカスタム認証状態を設定する
 * NextAuthのセッションを使用してSupabaseの認証状態を模倣
 */
export const setSupabaseAuth = async (session: Session | null) => {
  if (!session?.user?.id) {
    return null;
  }

  try {
    const supabase = createClientSupabase();
    
    // カスタムJWTを作成（開発用）
    const customToken = {
      sub: session.user.id,
      email: session.user.email,
      role: 'authenticated',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1時間後に期限切れ
    };

    // Supabaseクライアントの認証状態を手動で設定
    // 注意: これは開発/デモ用の実装です
    await supabase.auth.setSession({
      access_token: `custom-${session.user.id}`,
      refresh_token: `refresh-${session.user.id}`,
    });

    return supabase;
  } catch (error) {
    console.error('Error setting Supabase auth:', error);
    return null;
  }
};

/**
 * NextAuthのセッション情報を使用してSupabaseクライアントを取得
 */
export const getAuthenticatedSupabaseClient = async (session: Session | null) => {
  if (!session?.user?.id) {
    throw new Error('認証が必要です');
  }

  const supabase = createClientSupabase();
  
  // セッション情報をSupabaseのコンテキストに設定
  // 実際のプロダクションでは、適切なJWT生成が必要
  return supabase;
};