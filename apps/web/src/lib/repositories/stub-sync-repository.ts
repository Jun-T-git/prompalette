/**
 * Sync Repository Stub実装
 * テスト・開発環境用
 */

import { 
  SyncRepository, 
  SyncStatus, 
  SyncSession 
} from '@/lib/services/sync-service';

export class StubSyncRepository implements SyncRepository {
  private syncStatuses: Map<string, SyncStatus> = new Map();
  private sessionHistory: Map<string, SyncSession[]> = new Map();

  async findSyncStatus(userId: string): Promise<SyncStatus | null> {
    return this.syncStatuses.get(userId) || null;
  }

  async findSessionHistory(userId: string, limit: number): Promise<SyncSession[]> {
    const history = this.sessionHistory.get(userId) || [];
    return history.slice(0, limit);
  }

  async createSession(session: Omit<SyncSession, 'completed_at'>): Promise<void> {
    // セッション履歴に追加
    const userId = 'stub-user'; // スタブ実装では固定値
    const currentHistory = this.sessionHistory.get(userId) || [];
    const newSession: SyncSession = {
      ...session,
      completed_at: null
    };
    
    currentHistory.unshift(newSession); // 最新を先頭に
    this.sessionHistory.set(userId, currentHistory);
  }

  async updateSession(sessionId: string, updates: Partial<SyncSession>): Promise<void> {
    // 全ユーザーのセッション履歴から該当セッションを検索・更新
    for (const [userId, history] of this.sessionHistory.entries()) {
      const sessionIndex = history.findIndex(s => s.session_id === sessionId);
      if (sessionIndex !== -1) {
        history[sessionIndex] = { ...history[sessionIndex], ...updates };
        this.sessionHistory.set(userId, history);
        break;
      }
    }
  }

  // テスト用のヘルパーメソッド
  setSyncStatus(userId: string, status: SyncStatus): void {
    this.syncStatuses.set(userId, status);
  }

  addSessionToHistory(userId: string, session: SyncSession): void {
    const currentHistory = this.sessionHistory.get(userId) || [];
    currentHistory.unshift(session);
    this.sessionHistory.set(userId, currentHistory);
  }

  clear(): void {
    this.syncStatuses.clear();
    this.sessionHistory.clear();
  }
}