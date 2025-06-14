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
  
  // テスト用ユーザーを作成
  const user = await authService.createUser(
    `test-${randomSuffix}@example.com`,
    `Test User ${randomSuffix}`,
    ['wsp_demo'],
    permissions
  );

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