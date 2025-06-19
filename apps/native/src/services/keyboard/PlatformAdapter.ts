/**
 * プラットフォーム適応サービス
 * OS固有のキーボード処理を抽象化
 */

import type { 
  Platform, 
  ModifierKey, 
  KeyCombination, 
  PlatformConfig
} from '../../types/keyboard-v2';
import { PLATFORM_CONFIGS } from '../../types/keyboard-v2';

export class PlatformAdapter {
  private static instance: PlatformAdapter;
  private platform: Platform;
  private config: PlatformConfig;

  private constructor() {
    this.platform = this.detectPlatform();
    this.config = PLATFORM_CONFIGS[this.platform];
  }

  public static getInstance(): PlatformAdapter {
    if (!PlatformAdapter.instance) {
      PlatformAdapter.instance = new PlatformAdapter();
    }
    return PlatformAdapter.instance;
  }

  /**
   * プラットフォームを検出
   */
  private detectPlatform(): Platform {
    if (typeof navigator !== 'undefined') {
      const platform = navigator.platform.toLowerCase();
      if (platform.includes('mac')) return 'darwin';
      if (platform.includes('win')) return 'win32';
      return 'linux';
    }
    
    // Node.js環境（Tauri）
    if (typeof process !== 'undefined') {
      return process.platform as Platform;
    }
    
    // フォールバック
    return 'linux';
  }

  /**
   * 現在のプラットフォームを取得
   */
  public getPlatform(): Platform {
    return this.platform;
  }

  /**
   * プラットフォーム設定を取得
   */
  public getConfig(): PlatformConfig {
    return this.config;
  }

  /**
   * 修飾キーを実際のキーにマッピング
   */
  public mapModifierKey(modifier: ModifierKey): string {
    switch (modifier) {
      case 'primary':
        return this.config.primaryModifier;
      case 'secondary':
        return this.config.secondaryModifier;
      case 'shift':
        return 'shift';
      case 'alt':
        return this.platform === 'darwin' ? 'alt' : 'alt';
      default:
        return modifier;
    }
  }

  /**
   * キーイベントから修飾キーを解析
   */
  public parseModifiers(event: KeyboardEvent): ModifierKey[] {
    const modifiers: ModifierKey[] = [];
    
    if (this.isPrimaryModifierPressed(event)) {
      modifiers.push('primary');
    }
    
    if (event.altKey && !this.isPrimaryModifierPressed(event)) {
      modifiers.push('secondary');
    }
    
    if (event.shiftKey) {
      modifiers.push('shift');
    }
    
    return modifiers;
  }

  /**
   * プライマリ修飾キー（Cmd/Ctrl）が押されているかチェック
   */
  public isPrimaryModifierPressed(event: KeyboardEvent): boolean {
    return this.platform === 'darwin' ? event.metaKey : event.ctrlKey;
  }

  /**
   * キー組み合わせを文字列に変換（表示用）
   */
  public formatKeyCombo(combination: KeyCombination): string {
    const { key, modifiers } = combination;
    const symbols = this.config.symbols;
    
    const modifierStrings = modifiers.map(modifier => {
      switch (modifier) {
        case 'primary':
          return symbols.primary;
        case 'secondary':
          return symbols.secondary;
        case 'shift':
          return symbols.shift;
        case 'alt':
          return symbols.alt;
        default:
          return modifier;
      }
    });
    
    return [...modifierStrings, this.formatKey(key)].join(this.platform === 'darwin' ? '' : '+');
  }

  /**
   * キー名を表示用にフォーマット
   */
  private formatKey(key: string): string {
    const keyMap: Record<string, string> = {
      'arrowup': '↑',
      'arrowdown': '↓',
      'arrowleft': '←',
      'arrowright': '→',
      'enter': '⏎',
      'escape': 'Esc',
      'backspace': '⌫',
      'delete': '⌦',
      'tab': '⇥',
      'space': '␣'
    };
    
    return keyMap[key.toLowerCase()] || key.toUpperCase();
  }

  /**
   * アクセシビリティ用のaria-label生成
   */
  public generateAriaLabel(combination: KeyCombination, description: string): string {
    const { key, modifiers } = combination;
    
    const modifierNames = modifiers.map(modifier => {
      switch (modifier) {
        case 'primary':
          return this.platform === 'darwin' ? 'Command' : 'Control';
        case 'secondary':
          return 'Alt';
        case 'shift':
          return 'Shift';
        case 'alt':
          return 'Alt';
        default:
          return modifier;
      }
    });
    
    const keyName = this.getKeyDisplayName(key);
    const shortcutText = [...modifierNames, keyName].join(' ');
    
    return `${description}。ショートカット: ${shortcutText}`;
  }

  /**
   * キー名の音声読み上げ用表示名を取得
   */
  private getKeyDisplayName(key: string): string {
    const keyNameMap: Record<string, string> = {
      'arrowup': '上矢印',
      'arrowdown': '下矢印',
      'arrowleft': '左矢印',
      'arrowright': '右矢印',
      'enter': 'エンター',
      'escape': 'エスケープ',
      'backspace': 'バックスペース',
      'delete': 'デリート',
      'tab': 'タブ',
      'space': 'スペース',
      'home': 'ホーム',
      'end': 'エンド',
      'pageup': 'ページアップ',
      'pagedown': 'ページダウン',
      'f1': 'F1',
      'f2': 'F2',
      'f3': 'F3',
      'f4': 'F4',
      'f5': 'F5',
      'f6': 'F6',
      'f7': 'F7',
      'f8': 'F8',
      'f9': 'F9',
      'f10': 'F10',
      'f11': 'F11',
      'f12': 'F12'
    };
    
    return keyNameMap[key.toLowerCase()] || key.toUpperCase();
  }

  /**
   * キー組み合わせを正規化（プラットフォーム固有の調整）
   */
  public normalizeKeyCombo(combination: KeyCombination): KeyCombination {
    const normalized = { ...combination };
    
    // プラットフォーム固有のキーマッピング
    if (this.platform === 'darwin') {
      // macOSではAltキーは特殊文字入力に使用されることが多い
      if (normalized.key === 'alt') {
        normalized.key = 'option';
      }
    }
    
    return normalized;
  }

  /**
   * キーイベントがショートカットにマッチするかチェック
   */
  public matchesKeyCombo(event: KeyboardEvent, combination: KeyCombination): boolean {
    const eventModifiers = this.parseModifiers(event);
    const eventKey = event.key.toLowerCase();
    
    // キーの比較
    if (eventKey !== combination.key.toLowerCase()) {
      return false;
    }
    
    // 修飾キーの比較
    if (eventModifiers.length !== combination.modifiers.length) {
      return false;
    }
    
    return combination.modifiers.every(modifier => 
      eventModifiers.includes(modifier)
    );
  }

  /**
   * ショートカットキーの競合をチェック
   */
  public checkConflicts(combinations: KeyCombination[]): Array<{ combo1: KeyCombination; combo2: KeyCombination }> {
    const conflicts: Array<{ combo1: KeyCombination; combo2: KeyCombination }> = [];
    
    for (let i = 0; i < combinations.length; i++) {
      for (let j = i + 1; j < combinations.length; j++) {
        const combo1 = combinations[i];
        const combo2 = combinations[j];
        if (combo1 && combo2 && this.areEquivalent(combo1, combo2)) {
          conflicts.push({ combo1, combo2 });
        }
      }
    }
    
    return conflicts;
  }

  /**
   * 2つのキー組み合わせが等価かチェック
   */
  private areEquivalent(combo1: KeyCombination, combo2: KeyCombination): boolean {
    if (combo1.key.toLowerCase() !== combo2.key.toLowerCase()) {
      return false;
    }
    
    const mods1 = [...combo1.modifiers].sort();
    const mods2 = [...combo2.modifiers].sort();
    
    if (mods1.length !== mods2.length) {
      return false;
    }
    
    return mods1.every((mod, index) => mod === mods2[index]);
  }
}