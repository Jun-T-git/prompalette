/**
 * キーボードコンテキスト管理サービス
 * コンテキストの切り替えとイベント通知を管理
 */

import type { 
  KeyboardContext, 
  ContextChangeEvent, 
  ContextChangeListener,
  AccessibilityConfig 
} from '../../types/keyboard-v2';

export class ContextManager {
  private static instance: ContextManager;
  private currentContext: KeyboardContext = 'global';
  private contextStack: KeyboardContext[] = [];
  private listeners: ContextChangeListener[] = [];
  private accessibility: AccessibilityConfig;

  private constructor(accessibility: AccessibilityConfig) {
    this.accessibility = accessibility;
  }

  public static getInstance(accessibility?: AccessibilityConfig): ContextManager {
    if (!ContextManager.instance) {
      if (!accessibility) {
        throw new Error('AccessibilityConfig is required for first initialization');
      }
      ContextManager.instance = new ContextManager(accessibility);
    }
    return ContextManager.instance;
  }

  /**
   * 現在のコンテキストを取得
   */
  public getCurrentContext(): KeyboardContext {
    return this.currentContext;
  }

  /**
   * コンテキストを変更
   */
  public setContext(newContext: KeyboardContext, reason: 'user-action' | 'programmatic' | 'focus-change' = 'programmatic'): void {
    const previousContext = this.currentContext;
    
    if (previousContext === newContext) {
      return; // 変更なし
    }

    this.currentContext = newContext;
    
    const changeEvent: ContextChangeEvent = {
      from: previousContext,
      to: newContext,
      reason,
      timestamp: Date.now()
    };

    // アクセシビリティ：コンテキスト変更をアナウンス
    if (this.accessibility.announceContextChanges) {
      this.announceContextChange(changeEvent);
    }

    // リスナーに通知
    this.notifyListeners(changeEvent);
  }

  /**
   * コンテキストをスタックにプッシュ
   */
  public pushContext(newContext: KeyboardContext, reason: 'user-action' | 'programmatic' | 'focus-change' = 'programmatic'): void {
    this.contextStack.push(this.currentContext);
    this.setContext(newContext, reason);
  }

  /**
   * コンテキストをスタックからポップ
   */
  public popContext(reason: 'user-action' | 'programmatic' | 'focus-change' = 'programmatic'): KeyboardContext | undefined {
    const previousContext = this.contextStack.pop();
    
    if (previousContext) {
      this.setContext(previousContext, reason);
    }
    
    return previousContext;
  }

  /**
   * スタックをクリア
   */
  public clearStack(): void {
    this.contextStack = [];
  }

  /**
   * コンテキスト変更リスナーを追加
   */
  public addListener(listener: ContextChangeListener): void {
    this.listeners.push(listener);
  }

  /**
   * コンテキスト変更リスナーを削除
   */
  public removeListener(listener: ContextChangeListener): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 全リスナーに通知
   */
  private notifyListeners(event: ContextChangeEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Context change listener error:', error);
      }
    });
  }

  /**
   * フォーカス要素からコンテキストを自動推定
   */
  public inferContextFromFocus(activeElement: Element | null): KeyboardContext {
    if (!activeElement) {
      return 'global';
    }

    const tagName = activeElement.tagName.toLowerCase();
    const role = activeElement.getAttribute('role');
    const className = activeElement.className;

    // モーダルダイアログの検出
    if (role === 'dialog' || className.includes('modal')) {
      return 'modal-dialog';
    }

    // フォーム要素の検出
    if (['input', 'textarea', 'select'].includes(tagName) || 
        activeElement.getAttribute('contenteditable') === 'true') {
      return 'form-editing';
    }

    // リストナビゲーションの検出
    if (role === 'listbox' || role === 'list' || 
        className.includes('list') || className.includes('menu')) {
      return 'list-navigation';
    }

    // 設定画面の検出
    if (className.includes('settings') || className.includes('preferences')) {
      return 'settings';
    }

    // ヘルプオーバーレイの検出
    if (className.includes('help') || className.includes('tooltip') || 
        role === 'tooltip') {
      return 'help-overlay';
    }

    return 'global';
  }

  /**
   * コンテキスト変更をスクリーンリーダー用にアナウンス
   */
  private announceContextChange(event: ContextChangeEvent): void {
    if (!this.accessibility.enableScreenReader) {
      return;
    }

    const contextNames: Record<KeyboardContext, string> = {
      'global': 'メイン画面',
      'list-navigation': 'リスト選択',
      'form-editing': 'フォーム編集',
      'modal-dialog': 'ダイアログ',
      'settings': '設定画面',
      'help-overlay': 'ヘルプ表示'
    };

    const fromName = contextNames[event.from];
    const toName = contextNames[event.to];
    
    const message = `${fromName}から${toName}に移動しました`;
    
    this.announceToScreenReader(message);
  }

  /**
   * スクリーンリーダーにメッセージをアナウンス
   */
  private announceToScreenReader(message: string): void {
    // aria-live リージョンを使用してアナウンス
    const announcer = this.getOrCreateAnnouncer();
    
    // 一時的にメッセージを設定
    announcer.textContent = message;
    
    // 短時間後にクリア（スクリーンリーダーが読み上げた後）
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }

  /**
   * スクリーンリーダー用のアナウンサー要素を取得または作成
   */
  private getOrCreateAnnouncer(): HTMLElement {
    let announcer = document.getElementById('keyboard-context-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'keyboard-context-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      
      document.body.appendChild(announcer);
    }
    
    return announcer;
  }

  /**
   * コンテキストの優先順位を取得（高いほど優先）
   */
  public getContextPriority(context: KeyboardContext): number {
    const priorities: Record<KeyboardContext, number> = {
      'help-overlay': 100,    // 最高優先
      'modal-dialog': 90,     // モーダルは他を上書き
      'settings': 80,         // 設定画面
      'form-editing': 70,     // フォーム編集
      'list-navigation': 60,  // リストナビゲーション
      'global': 50           // グローバル（最低優先）
    };
    
    return priorities[context] || 0;
  }

  /**
   * 現在のコンテキストで有効なショートカットカテゴリを取得
   */
  public getAllowedShortcutCategories(context: KeyboardContext): string[] {
    const allowedCategories: Record<KeyboardContext, string[]> = {
      'global': ['essential', 'navigation', 'application'],
      'list-navigation': ['essential', 'navigation', 'selection'],
      'form-editing': ['essential', 'editing', 'formatting'],
      'modal-dialog': ['essential', 'dialog'],
      'settings': ['essential', 'settings', 'navigation'],
      'help-overlay': ['essential', 'help']
    };
    
    return allowedCategories[context] || ['essential'];
  }

  /**
   * デバッグ情報を取得
   */
  public getDebugInfo(): {
    currentContext: KeyboardContext;
    stackDepth: number;
    listenerCount: number;
  } {
    return {
      currentContext: this.currentContext,
      stackDepth: this.contextStack.length,
      listenerCount: this.listeners.length
    };
  }

  /**
   * 設定を更新
   */
  public updateAccessibilityConfig(config: AccessibilityConfig): void {
    this.accessibility = config;
  }
}