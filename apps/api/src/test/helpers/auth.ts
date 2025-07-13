import crypto from 'node:crypto';

import { authService } from '../../services/auth.js';

export interface TestAuth {
  apiKey: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
    workspaces: string[];
    permissions: string[];
  };
}

/**
 * テスト用のユーザーとAPI キーを動的に生成
 */
export async function createTestAuth(permissions: string[] = ['read', 'write']): Promise<TestAuth> {
  const randomSuffix = crypto.randomBytes(8).toString('hex');
  
  try {
    // テスト用ユーザーを作成
    const user = await authService.createUser(
      `test-${randomSuffix}@example.com`,
      `Test User ${randomSuffix}`,
      ['wsp_demo'],
      permissions
    );

    // ユーザー作成後に少し待機（CI環境対応）
    await new Promise(resolve => setTimeout(resolve, 5));

    // テスト用API キーを作成
    const { key: apiKey } = await authService.createApiKey(
      user.id,
      `Test API Key ${randomSuffix}`,
      permissions
    );

    return {
      apiKey,
      userId: user.id,
      user
    };
  } catch (error) {
    console.error('Failed to create test auth:', error);
    throw new Error(`Test authentication setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * テスト用のAuthorizationヘッダーを生成
 */
export function createAuthHeaders(apiKey: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
}