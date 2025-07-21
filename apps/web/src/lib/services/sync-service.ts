/**
 * 同期管理サービス
 */

export interface SyncStatus {
  last_sync_at: string | null;
  total_prompts: number;
  pending_conflicts: number;
  last_session_id: string | null;
  sync_enabled: boolean;
  desktop_connected: boolean;
}

export interface SyncSession {
  session_id: string;
  started_at: string;
  completed_at: string | null;
  uploaded: number;
  updated: number;
  conflicts: number;
  status: 'in_progress' | 'completed' | 'failed' | 'completed_with_conflicts';
}

export interface SyncService {
  getSyncStatus(userId: string): Promise<SyncStatus>;
  getSessionHistory(userId: string, limit: number): Promise<SyncSession[]>;
  createSession(userId: string, sessionId: string): Promise<void>;
  updateSession(sessionId: string, updates: Partial<SyncSession>): Promise<void>;
}

export interface SyncRepository {
  findSyncStatus(userId: string): Promise<SyncStatus | null>;
  findSessionHistory(userId: string, limit: number): Promise<SyncSession[]>;
  createSession(session: Omit<SyncSession, 'completed_at'>): Promise<void>;
  updateSession(sessionId: string, updates: Partial<SyncSession>): Promise<void>;
}

// SyncService実装
class SyncServiceImpl implements SyncService {
  constructor(private repository: SyncRepository) {}

  async getSyncStatus(userId: string): Promise<SyncStatus> {
    const status = await this.repository.findSyncStatus(userId);
    
    if (!status) {
      // デフォルト値を返す
      return {
        last_sync_at: null,
        total_prompts: 0,
        pending_conflicts: 0,
        last_session_id: null,
        sync_enabled: true,
        desktop_connected: false
      };
    }
    
    return status;
  }

  async getSessionHistory(userId: string, limit: number): Promise<SyncSession[]> {
    return this.repository.findSessionHistory(userId, limit);
  }

  async createSession(_userId: string, sessionId: string): Promise<void> {
    const session: Omit<SyncSession, 'completed_at'> = {
      session_id: sessionId,
      started_at: new Date().toISOString(),
      uploaded: 0,
      updated: 0,
      conflicts: 0,
      status: 'in_progress'
    };
    
    return this.repository.createSession(session);
  }

  async updateSession(sessionId: string, updates: Partial<SyncSession>): Promise<void> {
    return this.repository.updateSession(sessionId, updates);
  }
}

// ファクトリ関数
export function createSyncService(repository: SyncRepository): SyncService {
  return new SyncServiceImpl(repository);
}