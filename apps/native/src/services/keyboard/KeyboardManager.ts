/**
 * 統一キーボード管理サービス
 * 全てのキーボード操作を一元管理
 */

import type { 
  KeyboardManagerConfig,
  KeyboardEventInfo,
  KeyboardContext,
  ShortcutDefinition,
  UserLevel,
  KeyboardEventListener,
  ContextChangeListener,
  ContextChangeEvent,
  ShortcutExecutionListener,
  ValidationResult
} from '../../types/keyboard-v2';

import { AccessibilityManager } from './AccessibilityManager';
import { ContextManager } from './ContextManager';
import { PlatformAdapter } from './PlatformAdapter';
import { getShortcutsForContext, getFormEditingShortcuts } from './ShortcutDefinitions';

export class KeyboardManager {
  private static instance: KeyboardManager;
  private config: KeyboardManagerConfig;
  private platformAdapter: PlatformAdapter;
  private contextManager: ContextManager;
  private accessibilityManager: AccessibilityManager;
  
  private shortcutMap: Map<string, ShortcutDefinition> = new Map();
  private isEnabled: boolean = true;
  private isInitialized: boolean = false;
  
  // イベントリスナー
  private keydownListener: ((event: KeyboardEvent) => void) | null = null;
  private focusListener: ((event: FocusEvent) => void) | null = null;
  
  // カスタムイベントリスナー
  private eventListeners: KeyboardEventListener[] = [];
  private contextChangeListeners: ContextChangeListener[] = [];
  private shortcutExecutionListeners: ShortcutExecutionListener[] = [];

  private constructor(config: KeyboardManagerConfig) {
    this.config = config;
    this.platformAdapter = PlatformAdapter.getInstance();
    this.contextManager = ContextManager.getInstance(config.accessibility);
    this.accessibilityManager = AccessibilityManager.getInstance(
      config.accessibility, 
      config.focusManagement
    );
    
    this.buildShortcutMap();
    this.setupEventListeners();
  }

  public static getInstance(config?: KeyboardManagerConfig): KeyboardManager {
    if (!KeyboardManager.instance) {
      if (!config) {
        throw new Error('KeyboardManagerConfig is required for first initialization');
      }
      KeyboardManager.instance = new KeyboardManager(config);
    }
    return KeyboardManager.instance;
  }

  /**
   * キーボードマネージャーを初期化
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 設定の検証
      const validation = this.validateConfig();
      if (!validation.isValid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }

      // イベントリスナーを登録
      this.attachEventListeners();
      
      // 初期コンテキストを設定
      this.contextManager.setContext('global');
      
      this.isInitialized = true;
      
      if (this.config.debug) {
        console.log('KeyboardManager initialized successfully');
        console.log('Registered shortcuts:', this.shortcutMap.size);
        console.log('Platform:', this.platformAdapter.getPlatform());
        console.log('User level:', this.config.userLevel);
      }
    } catch (error) {
      console.error('Failed to initialize KeyboardManager:', error);
      throw error;
    }
  }

  /**
   * キーボードマネージャーを破棄
   */
  public destroy(): void {
    this.detachEventListeners();
    this.clearAllListeners();
    this.isInitialized = false;
    this.isEnabled = false;
    
    if (this.config.debug) {
      console.log('KeyboardManager destroyed');
    }
  }

  /**
   * ショートカットマップを構築
   */
  private buildShortcutMap(): void {
    this.shortcutMap.clear();
    
    // 基本ショートカット
    const shortcuts = getShortcutsForContext('global', this.config.userLevel);
    
    shortcuts.forEach(shortcut => {
      const key = this.createShortcutKey(shortcut);
      this.shortcutMap.set(key, shortcut);
    });

    if (this.config.debug) {
      console.log(`Built shortcut map with ${this.shortcutMap.size} shortcuts`);
      console.log('Shortcut map entries:');
      this.shortcutMap.forEach((shortcut, key) => {
        console.log(`  ${key} => ${shortcut.action} (${shortcut.description})`);
      });
    }
  }

  /**
   * ショートカットキーを生成
   */
  private createShortcutKey(shortcut: ShortcutDefinition): string {
    const { key, modifiers } = shortcut.combination;
    const context = shortcut.context;
    
    const modifierString = modifiers.sort().join('+');
    return `${context}:${modifierString}:${key.toLowerCase()}`;
  }

  /**
   * イベントリスナーを設定
   */
  private setupEventListeners(): void {
    // キーダウンイベントハンドラー
    this.keydownListener = (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    };

    // フォーカスイベントハンドラー（コンテキスト自動切り替え）
    this.focusListener = (event: FocusEvent) => {
      this.handleFocusChange(event);
    };

    // コンテキスト変更リスナー
    this.contextManager.addListener((contextEvent) => {
      this.handleContextChange(contextEvent);
    });
  }

  /**
   * イベントリスナーをDOMに登録
   */
  private attachEventListeners(): void {
    if (this.keydownListener) {
      document.addEventListener('keydown', this.keydownListener, true);
    }
    
    if (this.focusListener) {
      document.addEventListener('focusin', this.focusListener, true);
    }
  }

  /**
   * イベントリスナーをDOMから削除
   */
  private detachEventListeners(): void {
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener, true);
    }
    
    if (this.focusListener) {
      document.removeEventListener('focusin', this.focusListener, true);
    }
  }

  /**
   * キーダウンイベントの処理
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled || !this.isInitialized) {
      if (this.config.debug) {
        console.log('KeyboardManager: Not enabled or not initialized', { enabled: this.isEnabled, initialized: this.isInitialized });
      }
      return;
    }

    // IME入力中は無視
    if (event.isComposing) {
      return;
    }

    const eventInfo = this.createKeyboardEventInfo(event);
    
    if (this.config.debug) {
      console.log('KeyboardManager: Key event received', {
        key: eventInfo.key,
        modifiers: eventInfo.modifiers,
        context: eventInfo.context
      });
    }
    
    // カスタムリスナーに通知
    this.notifyEventListeners(eventInfo);

    // ショートカットの処理
    const shortcut = this.findMatchingShortcut(eventInfo);
    
    if (this.config.debug) {
      console.log('KeyboardManager: Shortcut found?', shortcut ? shortcut.id : 'none');
    }
    
    if (shortcut) {
      // 競合チェック
      if (this.shouldBlockShortcut(shortcut, eventInfo)) {
        if (this.config.debug) {
          console.log('Shortcut blocked:', shortcut.id, 'context:', eventInfo.context);
        }
        return;
      }

      // ショートカットを実行
      this.executeShortcut(shortcut, eventInfo);
    }
  }

  /**
   * フォーカス変更の処理
   */
  private handleFocusChange(event: FocusEvent): void {
    const target = event.target as Element;
    const newContext = this.contextManager.inferContextFromFocus(target);
    
    if (newContext !== this.contextManager.getCurrentContext()) {
      this.contextManager.setContext(newContext, 'focus-change');
    }
  }

  /**
   * コンテキスト変更の処理
   */
  private handleContextChange(contextEvent: { from: KeyboardContext; to: KeyboardContext; reason?: string }): void {
    // コンテキストに応じてショートカットマップを再構築
    this.rebuildShortcutMapForContext(contextEvent.to);
    
    // カスタムリスナーに通知
    this.notifyContextChangeListeners(contextEvent);
  }

  /**
   * コンテキスト用ショートカットマップを再構築
   */
  private rebuildShortcutMapForContext(context: KeyboardContext): void {
    // 現在のコンテキストに関連するショートカットのみ追加
    let contextShortcuts: ShortcutDefinition[] = [];
    
    if (context === 'form-editing') {
      contextShortcuts = getFormEditingShortcuts(this.config.userLevel);
    } else {
      contextShortcuts = getShortcutsForContext(context, this.config.userLevel);
    }

    // コンテキスト固有のショートカットを追加
    contextShortcuts.forEach(shortcut => {
      if (shortcut.context === context) {
        const key = this.createShortcutKey(shortcut);
        this.shortcutMap.set(key, shortcut);
      }
    });

    if (this.config.debug) {
      console.log(`Rebuilt shortcut map for context: ${context}, total shortcuts: ${this.shortcutMap.size}`);
    }
  }

  /**
   * キーボードイベント情報を作成
   */
  private createKeyboardEventInfo(event: KeyboardEvent): KeyboardEventInfo {
    return {
      originalEvent: event,
      key: event.key.toLowerCase(),
      modifiers: this.platformAdapter.parseModifiers(event),
      context: this.contextManager.getCurrentContext(),
      activeElement: document.activeElement,
      isComposing: event.isComposing,
      platform: this.platformAdapter.getPlatform(),
      timestamp: Date.now()
    };
  }

  /**
   * マッチするショートカットを検索
   */
  private findMatchingShortcut(eventInfo: KeyboardEventInfo): ShortcutDefinition | null {
    const { key, modifiers, context } = eventInfo;
    
    // 現在のコンテキスト用のキーを試行
    const contextKey = `${context}:${modifiers.sort().join('+')}:${key}`;
    let shortcut = this.shortcutMap.get(contextKey);
    
    if (shortcut) {
      return shortcut;
    }
    
    // グローバルコンテキストのキーを試行
    const globalKey = `global:${modifiers.sort().join('+')}:${key}`;
    shortcut = this.shortcutMap.get(globalKey);
    
    return shortcut || null;
  }

  /**
   * ショートカットをブロックするかチェック
   */
  private shouldBlockShortcut(shortcut: ShortcutDefinition, eventInfo: KeyboardEventInfo): boolean {
    // フォーム編集中の競合チェック
    if (eventInfo.context === 'form-editing' && shortcut.conflictsWith?.includes('form-editing')) {
      return true;
    }

    // 入力要素にフォーカスがある場合の制限
    if (this.isInputElement(eventInfo.activeElement)) {
      // エッセンシャルショートカットは常に有効
      if (shortcut.priority === 'essential') {
        return false;
      }
      
      // ナビゲーション系ショートカット（上下キー）は常に有効
      if (shortcut.action === 'selectNextPrompt' || shortcut.action === 'selectPrevPrompt') {
        return false;
      }
      
      // 修飾キーがないショートカットはブロック
      if (shortcut.combination.modifiers.length === 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * 入力要素かどうかチェック
   */
  private isInputElement(element: Element | null): boolean {
    if (!element) return false;
    
    const tagName = element.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];
    
    if (inputTypes.includes(tagName)) return true;
    
    // contenteditable要素もチェック
    if (element.getAttribute('contenteditable') === 'true') return true;
    
    return false;
  }

  /**
   * ショートカットを実行
   */
  private async executeShortcut(shortcut: ShortcutDefinition, eventInfo: KeyboardEventInfo): Promise<void> {
    const startTime = performance.now();
    let success = false;

    try {
      // デフォルト動作を防ぐ
      eventInfo.originalEvent.preventDefault();
      eventInfo.originalEvent.stopPropagation();

      // アクセシビリティ：ショートカット実行をアナウンス
      this.accessibilityManager.announceShortcut(shortcut);

      // アクションを実行
      const actionHandler = this.config.actions[shortcut.action];
      if (actionHandler) {
        await actionHandler(eventInfo.context, shortcut.params);
        success = true;
        
        // アクセシビリティ：成功をアナウンス
        this.accessibilityManager.announceResult(shortcut.description, true);
        this.accessibilityManager.playAudioFeedback('success');
      } else {
        throw new Error(`Action handler not found: ${shortcut.action}`);
      }
    } catch (error) {
      success = false;
      console.error(`Failed to execute shortcut ${shortcut.id}:`, error);
      
      // アクセシビリティ：エラーをアナウンス
      this.accessibilityManager.announceResult(shortcut.description, false);
      this.accessibilityManager.playAudioFeedback('error');
    } finally {
      const duration = performance.now() - startTime;
      
      // 実行リスナーに通知
      this.notifyShortcutExecutionListeners(shortcut.id, success, duration);
      
      if (this.config.debug) {
        console.log(`Executed shortcut: ${shortcut.id} (${shortcut.action}) - Success: ${success}, Duration: ${duration.toFixed(2)}ms`);
      }
    }
  }

  /**
   * 設定を検証
   */
  private validateConfig(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 必須設定のチェック
    if (!this.config.platform) {
      errors.push('Platform is required');
    }

    if (!this.config.userLevel) {
      errors.push('User level is required');
    }

    if (!this.config.actions || Object.keys(this.config.actions).length === 0) {
      errors.push('Actions map is required');
    }

    // ショートカット競合のチェック
    const conflicts = this.checkShortcutConflicts();
    if (conflicts.length > 0) {
      warnings.push(`${conflicts.length} shortcut conflicts detected`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      conflicts: []
    };
  }

  /**
   * ショートカット競合をチェック
   */
  private checkShortcutConflicts(): Array<{ shortcut1: ShortcutDefinition; shortcut2: ShortcutDefinition }> {
    const conflicts: Array<{ shortcut1: ShortcutDefinition; shortcut2: ShortcutDefinition }> = [];
    const shortcuts = Array.from(this.shortcutMap.values());

    for (let i = 0; i < shortcuts.length; i++) {
      for (let j = i + 1; j < shortcuts.length; j++) {
        const shortcut1 = shortcuts[i];
        const shortcut2 = shortcuts[j];

        if (shortcut1 && shortcut2 && this.areShortcutsConflicting(shortcut1, shortcut2)) {
          conflicts.push({ shortcut1, shortcut2 });
        }
      }
    }

    return conflicts;
  }

  /**
   * 2つのショートカットが競合するかチェック
   */
  private areShortcutsConflicting(shortcut1: ShortcutDefinition, shortcut2: ShortcutDefinition): boolean {
    // 異なるコンテキストは競合しない
    if (shortcut1.context !== shortcut2.context && 
        shortcut1.context !== 'global' && 
        shortcut2.context !== 'global') {
      return false;
    }

    // キー組み合わせが同じかチェック
    return this.platformAdapter.matchesKeyCombo(
      { key: shortcut1.combination.key } as KeyboardEvent,
      shortcut2.combination
    );
  }

  // パブリックAPI

  /**
   * キーボード管理を有効/無効化
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (this.config.debug) {
      console.log(`KeyboardManager ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * 現在のコンテキストを取得
   */
  public getCurrentContext(): KeyboardContext {
    return this.contextManager.getCurrentContext();
  }

  /**
   * コンテキストを変更
   */
  public setContext(context: KeyboardContext): void {
    this.contextManager.setContext(context, 'programmatic');
  }

  /**
   * ユーザーレベルを変更
   */
  public setUserLevel(userLevel: UserLevel): void {
    this.config.userLevel = userLevel;
    this.buildShortcutMap();
    
    if (this.config.debug) {
      console.log(`User level changed to: ${userLevel}`);
    }
  }

  /**
   * ショートカットを手動実行
   */
  public executeShortcutById(shortcutId: string): void {
    const shortcut = Array.from(this.shortcutMap.values()).find(s => s.id === shortcutId);
    if (!shortcut) {
      return;
    }
    const mockEvent = new KeyboardEvent('keydown', {
      key: shortcut.combination.key,
      ctrlKey: shortcut.combination.modifiers.includes('primary') && this.platformAdapter.getPlatform() !== 'darwin',
      metaKey: shortcut.combination.modifiers.includes('primary') && this.platformAdapter.getPlatform() === 'darwin',
      shiftKey: shortcut.combination.modifiers.includes('shift'),
      altKey: shortcut.combination.modifiers.includes('secondary')
    });

    const eventInfo = this.createKeyboardEventInfo(mockEvent);
    this.executeShortcut(shortcut, eventInfo);
  }

  // イベントリスナー管理

  /**
   * キーボードイベントリスナーを追加
   */
  public addEventListener(listener: KeyboardEventListener): void {
    this.eventListeners.push(listener);
  }

  /**
   * キーボードイベントリスナーを削除
   */
  public removeEventListener(listener: KeyboardEventListener): void {
    const index = this.eventListeners.indexOf(listener);
    if (index !== -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * コンテキスト変更リスナーを追加
   */
  public addContextChangeListener(listener: ContextChangeListener): void {
    this.contextChangeListeners.push(listener);
  }

  /**
   * ショートカット実行リスナーを追加
   */
  public addShortcutExecutionListener(listener: ShortcutExecutionListener): void {
    this.shortcutExecutionListeners.push(listener);
  }

  /**
   * 全リスナーをクリア
   */
  private clearAllListeners(): void {
    this.eventListeners = [];
    this.contextChangeListeners = [];
    this.shortcutExecutionListeners = [];
  }

  /**
   * イベントリスナーに通知
   */
  private notifyEventListeners(eventInfo: KeyboardEventInfo): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(eventInfo);
      } catch (error) {
        console.error('Event listener error:', error);
      }
    });
  }

  /**
   * コンテキスト変更リスナーに通知
   */
  private notifyContextChangeListeners(contextEvent: { from: KeyboardContext; to: KeyboardContext; reason?: string }): void {
    const fullEvent = {
      ...contextEvent,
      reason: (contextEvent.reason || 'programmatic') as ContextChangeEvent['reason'],
      timestamp: Date.now()
    };
    
    this.contextChangeListeners.forEach(listener => {
      try {
        listener(fullEvent);
      } catch (error) {
        console.error('Context change listener error:', error);
      }
    });
  }

  /**
   * ショートカット実行リスナーに通知
   */
  private notifyShortcutExecutionListeners(shortcutId: string, success: boolean, duration: number): void {
    this.shortcutExecutionListeners.forEach(listener => {
      try {
        listener(shortcutId, success, duration);
      } catch (error) {
        console.error('Shortcut execution listener error:', error);
      }
    });
  }

  /**
   * デバッグ情報を取得
   */
  public getDebugInfo(): {
    isInitialized: boolean;
    isEnabled: boolean;
    shortcutCount: number;
    currentContext: KeyboardContext;
    userLevel: UserLevel;
    platform: string;
  } {
    return {
      isInitialized: this.isInitialized,
      isEnabled: this.isEnabled,
      shortcutCount: this.shortcutMap.size,
      currentContext: this.contextManager.getCurrentContext(),
      userLevel: this.config.userLevel,
      platform: this.platformAdapter.getPlatform()
    };
  }
}