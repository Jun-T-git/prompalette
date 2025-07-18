import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';

import { authOptions } from '@/lib/auth';
import { logError } from '@/lib/logger';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export interface AuthValidationResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

/**
 * セキュアな認証検証
 * セッション情報とJWTトークンの両方を検証
 */
export async function validateAuthentication(
  request: NextRequest
): Promise<AuthValidationResult> {
  try {
    // 1. セッション検証
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'No valid session found'
      };
    }

    // 2. JWT トークン検証
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return {
        success: false,
        error: 'No valid JWT token found'
      };
    }

    // 3. セッションとトークンの一致性確認
    if (session.user.id !== token.sub) {
      return {
        success: false,
        error: 'Session and token user ID mismatch'
      };
    }

    // 4. トークンの有効期限確認
    const now = Math.floor(Date.now() / 1000);
    if (token.exp && typeof token.exp === 'number' && token.exp < now) {
      return {
        success: false,
        error: 'Token expired'
      };
    }

    return {
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
      }
    };
  } catch (error) {
    logError('Authentication validation error', {
      error: error instanceof Error ? error.message : String(error)
    });
    return {
      success: false,
      error: 'Authentication validation failed'
    };
  }
}

/**
 * 簡単な認証チェック（既存のコードとの互換性のため）
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const result = await validateAuthentication(request);
  
  if (!result.success || !result.user) {
    throw new Error(result.error || 'Authentication failed');
  }
  
  return result.user;
}

/**
 * ユーザーIDの検証
 * SQLインジェクションやIDの改ざんを防ぐ
 */
export function validateUserId(userId: string): boolean {
  // UUIDフォーマットの検証
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId);
}

/**
 * 権限チェック
 * リソースへのアクセス権限を確認
 */
export function checkResourceAccess(
  requestingUserId: string,
  resourceUserId: string,
  isPublicResource: boolean = false
): boolean {
  // 公開リソースの場合は常にアクセス可能
  if (isPublicResource) {
    return true;
  }
  
  // 自身のリソースの場合のみアクセス可能
  return requestingUserId === resourceUserId;
}