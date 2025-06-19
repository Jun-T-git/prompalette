/**
 * アクセシビリティ管理サービス
 * WCAG 2.1 AA準拠のアクセシビリティ機能を提供
 */

import type { 
  AccessibilityConfig, 
  FocusManagementConfig,
  ShortcutDefinition
} from '../../types/keyboard-v2';

import { PlatformAdapter } from './PlatformAdapter';

export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private config: AccessibilityConfig;
  private focusConfig: FocusManagementConfig;
  private platformAdapter: PlatformAdapter;
  private announcer: HTMLElement | null = null;
  private focusHistory: Element[] = [];
  private currentFocusIndicator: HTMLElement | null = null;

  private constructor(
    config: AccessibilityConfig, 
    focusConfig: FocusManagementConfig
  ) {
    this.config = config;
    this.focusConfig = focusConfig;
    this.platformAdapter = PlatformAdapter.getInstance();
    this.initializeAnnouncer();
    this.setupFocusIndicator();
  }

  public static getInstance(
    config?: AccessibilityConfig, 
    focusConfig?: FocusManagementConfig
  ): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      if (!config || !focusConfig) {
        throw new Error('AccessibilityConfig and FocusManagementConfig are required for first initialization');
      }
      AccessibilityManager.instance = new AccessibilityManager(config, focusConfig);
    }
    return AccessibilityManager.instance;
  }

  /**
   * 設定を更新
   */
  public updateConfig(config: AccessibilityConfig, focusConfig?: FocusManagementConfig): void {
    this.config = config;
    if (focusConfig) {
      this.focusConfig = focusConfig;
    }
    this.setupFocusIndicator();
  }

  /**
   * スクリーンリーダー用アナウンサーを初期化
   */
  private initializeAnnouncer(): void {
    if (!this.config.enableScreenReader) {
      return;
    }

    this.announcer = document.getElementById('accessibility-announcer');
    
    if (!this.announcer) {
      this.announcer = document.createElement('div');
      this.announcer.id = 'accessibility-announcer';
      this.announcer.setAttribute('aria-live', 'polite');
      this.announcer.setAttribute('aria-atomic', 'true');
      this.announcer.className = 'sr-only';
      
      // スクリーンリーダー専用スタイル
      Object.assign(this.announcer.style, {
        position: 'absolute',
        left: '-10000px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      });
      
      document.body.appendChild(this.announcer);
    }
  }

  /**
   * メッセージをスクリーンリーダーにアナウンス
   */
  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.config.enableScreenReader || !this.announcer) {
      return;
    }

    // 優先度に応じてaria-liveを変更
    this.announcer.setAttribute('aria-live', priority);
    
    // 一度クリアしてからメッセージを設定（確実に読み上げさせるため）
    this.announcer.textContent = '';
    
    // 少し遅延させてメッセージを設定
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = message;
      }
    }, 10);
    
    // メッセージをクリア
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = '';
      }
    }, 1000);
  }

  /**
   * ショートカット実行をアナウンス
   */
  public announceShortcut(shortcut: ShortcutDefinition): void {
    if (!this.config.announceShortcuts) {
      return;
    }

    const keyCombo = this.platformAdapter.formatKeyCombo(shortcut.combination);
    const message = `${shortcut.description}を実行しました。ショートカット: ${keyCombo}`;
    
    this.announce(message);
  }

  /**
   * 操作結果をアナウンス
   */
  public announceResult(action: string, success: boolean, details?: string): void {
    if (!this.config.announceResults) {
      return;
    }

    let message = success ? `${action}が完了しました` : `${action}に失敗しました`;
    
    if (details) {
      message += `。${details}`;
    }
    
    this.announce(message, success ? 'polite' : 'assertive');
  }

  /**
   * フォーカスインジケーターを設定
   */
  private setupFocusIndicator(): void {
    if (!this.config.enableFocusIndicator) {
      return;
    }

    // 既存のスタイルを削除
    const existingStyle = document.getElementById('accessibility-focus-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    // フォーカスインジケーターのスタイルを追加
    const style = document.createElement('style');
    style.id = 'accessibility-focus-style';
    
    const focusStyles = this.getFocusIndicatorStyles();
    style.textContent = focusStyles;
    
    document.head.appendChild(style);
  }

  /**
   * フォーカスインジケーターのスタイルを取得
   */
  private getFocusIndicatorStyles(): string {
    const { focusIndicatorStyle } = this.config;
    
    const baseStyles = `
      *:focus {
        outline: none;
      }
    `;
    
    switch (focusIndicatorStyle) {
      case 'high-contrast':
        return baseStyles + `
          *:focus {
            outline: 3px solid #0066cc !important;
            outline-offset: 2px !important;
            box-shadow: 0 0 0 1px #ffffff, 0 0 0 4px #0066cc !important;
          }
          
          button:focus,
          input:focus,
          textarea:focus,
          select:focus,
          [role="button"]:focus,
          [tabindex]:focus {
            background-color: #e6f3ff !important;
            border-color: #0066cc !important;
          }
        `;
        
      case 'custom':
        return baseStyles + `
          *:focus {
            outline: 2px solid #4285f4 !important;
            outline-offset: 1px !important;
            border-radius: 4px !important;
            box-shadow: 0 0 8px rgba(66, 133, 244, 0.3) !important;
          }
          
          .keyboard-focus-indicator {
            position: absolute;
            pointer-events: none;
            border: 2px solid #4285f4;
            border-radius: 4px;
            background: rgba(66, 133, 244, 0.1);
            transition: all 0.15s ease-in-out;
            z-index: 9999;
          }
        `;
        
      default: // 'default'
        return baseStyles + `
          *:focus {
            outline: 2px solid #005fcc !important;
            outline-offset: 1px !important;
          }
        `;
    }
  }

  /**
   * カスタムフォーカスインジケーターを表示
   */
  public showFocusIndicator(element: Element): void {
    if (!this.config.enableFocusIndicator || this.config.focusIndicatorStyle !== 'custom') {
      return;
    }

    this.hideFocusIndicator();

    const rect = element.getBoundingClientRect();
    
    this.currentFocusIndicator = document.createElement('div');
    this.currentFocusIndicator.className = 'keyboard-focus-indicator';
    
    Object.assign(this.currentFocusIndicator.style, {
      position: 'fixed',
      left: `${rect.left - 2}px`,
      top: `${rect.top - 2}px`,
      width: `${rect.width + 4}px`,
      height: `${rect.height + 4}px`,
      pointerEvents: 'none',
      zIndex: '9999'
    });
    
    document.body.appendChild(this.currentFocusIndicator);
  }

  /**
   * カスタムフォーカスインジケーターを非表示
   */
  public hideFocusIndicator(): void {
    if (this.currentFocusIndicator) {
      this.currentFocusIndicator.remove();
      this.currentFocusIndicator = null;
    }
  }

  /**
   * フォーカス管理：要素にフォーカスを移動
   */
  public setFocus(element: HTMLElement, announce: boolean = true): void {
    if (!this.focusConfig.respectUserIntent && document.activeElement !== element) {
      // ユーザーの意図を尊重する設定の場合、強制的なフォーカス移動は行わない
      return;
    }

    // フォーカス履歴に追加
    if (document.activeElement && document.activeElement !== element) {
      this.focusHistory.push(document.activeElement);
      
      // 履歴の上限を設定（メモリリーク防止）
      if (this.focusHistory.length > 10) {
        this.focusHistory.shift();
      }
    }

    element.focus();

    if (announce && this.focusConfig.announceChanges) {
      const elementDescription = this.getElementDescription(element);
      this.announce(`${elementDescription}にフォーカスしました`);
    }

    if (this.config.enableFocusIndicator) {
      this.showFocusIndicator(element);
    }
  }

  /**
   * フォーカス管理：前のフォーカス位置に戻る
   */
  public restoreFocus(): boolean {
    if (!this.focusConfig.restoreFocusOnClose || this.focusHistory.length === 0) {
      return false;
    }

    const previousElement = this.focusHistory.pop();
    if (previousElement && previousElement instanceof HTMLElement) {
      this.setFocus(previousElement, true);
      return true;
    }

    return false;
  }

  /**
   * フォーカストラップ：コンテナ内にフォーカスを制限
   */
  public trapFocus(container: HTMLElement): () => void {
    if (!this.focusConfig.enableFocusTrap) {
      return () => {}; // 何もしない関数を返す
    }

    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) {
      return () => {};
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (!firstElement || !lastElement) {
      return () => {};
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      if (event.shiftKey) {
        // Shift + Tab（逆方向）
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab（順方向）
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // 最初の要素にフォーカスを移動
    this.setFocus(firstElement, false);

    // クリーンアップ関数を返す
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  /**
   * フォーカス可能な要素を取得
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])'
    ].join(', ');

    const elements = container.querySelectorAll(focusableSelectors);
    return Array.from(elements) as HTMLElement[];
  }

  /**
   * 要素の説明を取得（スクリーンリーダー用）
   */
  private getElementDescription(element: Element): string {
    // aria-label を優先
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      return ariaLabel;
    }

    // aria-labelledby を参照
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) {
        return labelElement.textContent || '';
      }
    }

    // 要素のテキストコンテンツ
    const textContent = element.textContent?.trim();
    if (textContent) {
      return textContent;
    }

    // フォーム要素のlabel
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) {
        return label.textContent || '';
      }
    }

    // フォールバック
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    if (role) {
      return `${role}要素`;
    }
    
    return `${tagName}要素`;
  }

  /**
   * ショートカットヒントを生成
   */
  public generateShortcutHint(shortcut: ShortcutDefinition): HTMLElement {
    const hint = document.createElement('span');
    hint.className = 'keyboard-shortcut-hint';
    hint.setAttribute('aria-hidden', 'true'); // スクリーンリーダーからは隠す
    
    const keyCombo = this.platformAdapter.formatKeyCombo(shortcut.combination);
    hint.textContent = keyCombo;
    
    // ヒント用のスタイル
    Object.assign(hint.style, {
      fontSize: '0.75rem',
      color: '#666',
      fontFamily: 'monospace',
      marginLeft: '0.5rem',
      opacity: this.config.enableKeyboardHints ? '1' : '0'
    });
    
    return hint;
  }

  /**
   * aria属性を要素に設定
   */
  public setAriaAttributes(element: HTMLElement, shortcut: ShortcutDefinition): void {
    element.setAttribute('aria-label', shortcut.ariaLabel);
    
    const keyCombo = this.platformAdapter.formatKeyCombo(shortcut.combination);
    element.setAttribute('aria-keyshortcuts', keyCombo);
    
    if (shortcut.description) {
      element.setAttribute('aria-description', shortcut.description);
    }
  }

  /**
   * 音声フィードバック（ビープ音など）
   */
  public playAudioFeedback(type: 'success' | 'error' | 'warning' | 'info'): void {
    if (!this.config.enableAudioFeedback) {
      return;
    }

    // Web Audio API を使用してビープ音を生成
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 音の種類に応じて周波数を変更
      const frequencies = {
        success: 800,
        error: 300,
        warning: 600,
        info: 500
      };

      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      oscillator.type = 'sine';

      // 音量とエンベロープ
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Audio feedback not available:', error);
    }
  }

  /**
   * デバッグ情報を取得
   */
  public getDebugInfo(): {
    config: AccessibilityConfig;
    focusConfig: FocusManagementConfig;
    announcerExists: boolean;
    focusHistoryLength: number;
  } {
    return {
      config: this.config,
      focusConfig: this.focusConfig,
      announcerExists: !!this.announcer,
      focusHistoryLength: this.focusHistory.length
    };
  }
}