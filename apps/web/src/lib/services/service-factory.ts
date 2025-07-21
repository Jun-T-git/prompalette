/**
 * サービスファクトリー
 * 依存性注入パターンによるサービス管理
 */

import { appConfig, type AppConfig } from '@/lib/config';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { createPromptService, type PromptService } from './prompt-service';
import { SupabasePromptRepository } from '@/lib/repositories/supabase-prompt-repository';
import { StubPromptRepository } from '@/lib/repositories/stub-prompt-repository';
import { createSyncService, type SyncService } from './sync-service';
import { SupabaseSyncRepository } from '@/lib/repositories/supabase-sync-repository';
import { StubSyncRepository } from '@/lib/repositories/stub-sync-repository';

// サービスコンテナ
export interface ServiceContainer {
  promptService: PromptService;
  syncService: SyncService;
}

// サービスファクトリー
export class ServiceFactory {
  private static instance: ServiceFactory | undefined;
  private container: ServiceContainer | null = null;

  private constructor(private config: AppConfig) {}

  static getInstance(config: AppConfig = appConfig): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory(config);
    }
    return ServiceFactory.instance;
  }

  // テスト用のインスタンスリセット（開発環境のみ）
  static resetInstance(): void {
    if (process.env.NODE_ENV !== 'production') {
      delete ServiceFactory.instance;
    }
  }

  getServices(): ServiceContainer {
    if (!this.container) {
      this.container = this.createServices();
    }
    return this.container;
  }

  private createServices(): ServiceContainer {
    // 環境に応じてプロンプトサービスを構築
    const promptService = this.createPromptService();
    const syncService = this.createSyncService();

    return {
      promptService,
      syncService,
    };
  }

  private createPromptService(): PromptService {
    if (this.config.isLocalDevelopment) {
      // ローカル開発環境: スタブレポジトリを使用
      const repository = new StubPromptRepository();
      return createPromptService(repository);
    } else {
      // 本番環境: クライアントサイドではスタブを返す（APIルート経由での利用を想定）
      // サーバーサイドでのみSupabaseレポジトリを使用
      if (typeof window !== 'undefined') {
        // クライアントサイドでは基本的な操作のみサポートするスタブを返す
        const repository = new StubPromptRepository();
        return createPromptService(repository);
      }
      
      if (!this.config.supabase.enabled) {
        // Supabaseが設定されていない場合（CI環境など）はスタブを使用
        const repository = new StubPromptRepository();
        return createPromptService(repository);
      }
      
      const supabase = getSupabaseServiceClient();
      const repository = new SupabasePromptRepository(supabase);
      return createPromptService(repository);
    }
  }

  private createSyncService(): SyncService {
    if (this.config.isLocalDevelopment) {
      // ローカル開発環境: スタブレポジトリを使用
      const repository = new StubSyncRepository();
      return createSyncService(repository);
    } else {
      // 本番環境: クライアントサイドではスタブを返す（APIルート経由での利用を想定）
      // サーバーサイドでのみSupabaseレポジトリを使用
      if (typeof window !== 'undefined') {
        // クライアントサイドでは基本的な操作のみサポートするスタブを返す
        const repository = new StubSyncRepository();
        return createSyncService(repository);
      }
      
      if (!this.config.supabase.enabled) {
        // Supabaseが設定されていない場合（CI環境など）はスタブを使用
        const repository = new StubSyncRepository();
        return createSyncService(repository);
      }
      
      const supabase = getSupabaseServiceClient();
      const repository = new SupabaseSyncRepository(supabase);
      return createSyncService(repository);
    }
  }

  // テスト用のリセット機能
  reset(): void {
    this.container = null;
  }
}

// デフォルトサービス取得
export function getServices(): ServiceContainer {
  const factory = ServiceFactory.getInstance();
  return factory.getServices();
}

// 個別サービス取得（新しいページで使用）
export function getPromptService(): PromptService {
  const factory = ServiceFactory.getInstance();
  return factory.getServices().promptService;
}

export function getSyncService(): SyncService {
  const factory = ServiceFactory.getInstance();
  return factory.getServices().syncService;
}

// テスト用のサービス取得（開発環境のみ）
export function getServicesForTesting(): ServiceContainer {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Test utilities are not available in production');
  }
  
  const factory = ServiceFactory.getInstance();
  return factory.getServices();
}