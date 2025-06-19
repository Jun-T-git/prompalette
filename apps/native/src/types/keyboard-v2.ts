/**
 * 新しいキーボードシステムの型定義
 * WCAG 2.1 AA準拠・ユーザビリティ重視設計
 */

// プラットフォーム検出
export type Platform = 'darwin' | 'win32' | 'linux';

// 修飾キー（プラットフォーム統一）
export type ModifierKey = 'primary' | 'secondary' | 'shift' | 'alt';

// キーボードコンテキスト（明確な階層）
export type KeyboardContext = 
  | 'global'           // アプリ全体：基本操作のみ
  | 'list-navigation'  // リスト：ナビゲーション中心
  | 'form-editing'     // フォーム：編集操作中心
  | 'modal-dialog'     // モーダル：限定的な操作
  | 'settings'         // 設定：カスタマイズ操作
  | 'help-overlay';    // ヘルプ：情報表示

// ユーザーレベル（段階的開示）
export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

// ショートカット重要度
export type ShortcutPriority = 'essential' | 'common' | 'advanced';

// キー組み合わせ
export interface KeyCombination {
  key: string;
  modifiers: ModifierKey[];
  platform?: Platform;
}

// ショートカット定義
export interface ShortcutDefinition {
  id: string;
  priority: ShortcutPriority;
  context: KeyboardContext;
  combination: KeyCombination;
  action: string;
  description: string;
  ariaLabel: string;
  userLevel: UserLevel;
  customizable: boolean;
  conflictsWith?: string[];
  note?: string; // 追加の説明・競合回避理由など
  params?: Record<string, unknown>; // アクション実行時のパラメータ
}

// プラットフォーム適応設定
export interface PlatformConfig {
  platform: Platform;
  primaryModifier: 'cmd' | 'ctrl';
  secondaryModifier: 'alt' | 'opt';
  symbols: {
    primary: string;
    secondary: string;
    shift: string;
    alt: string;
  };
}

// アクセシビリティ設定
export interface AccessibilityConfig {
  enableScreenReader: boolean;
  enableKeyboardHints: boolean;
  enableFocusIndicator: boolean;
  announceShortcuts: boolean;
  announceResults: boolean;
  announceContextChanges: boolean;
  focusIndicatorStyle: 'default' | 'high-contrast' | 'custom';
  reducedMotion: boolean;
  enableAudioFeedback?: boolean;
}

// ユーザー設定
export interface UserKeyboardSettings {
  userLevel: UserLevel;
  platform: Platform;
  accessibility: AccessibilityConfig;
  customShortcuts: Record<string, KeyCombination>;
  disabledShortcuts: string[];
  version: string;
  lastUpdated: Date;
}

// ショートカット実行ハンドラー
export type ShortcutHandler = (context: KeyboardContext, params?: Record<string, unknown>) => void | Promise<void>;

// ショートカットアクションマップ
export type ShortcutActionMap = Record<string, ShortcutHandler>;

// キーボードイベント情報
export interface KeyboardEventInfo {
  originalEvent: KeyboardEvent;
  key: string;
  modifiers: ModifierKey[];
  context: KeyboardContext;
  activeElement: Element | null;
  isComposing: boolean;
  platform: Platform;
  timestamp: number;
}

// コンテキスト変更イベント
export interface ContextChangeEvent {
  from: KeyboardContext;
  to: KeyboardContext;
  reason: 'user-action' | 'programmatic' | 'focus-change';
  timestamp: number;
}

// フォーカス管理設定
export interface FocusManagementConfig {
  respectUserIntent: boolean;
  announceChanges: boolean;
  enableFocusTrap: boolean;
  customFocusIndicator: boolean;
  restoreFocusOnClose: boolean;
}

// ショートカット競合情報
export interface ShortcutConflict {
  shortcutId: string;
  conflictingShortcuts: ShortcutDefinition[];
  resolution: 'disable' | 'context-specific' | 'user-choice';
  message: string;
}

// バリデーション結果
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  conflicts: ShortcutConflict[];
}

// キーボードマネージャーの設定
export interface KeyboardManagerConfig {
  platform: Platform;
  userLevel: UserLevel;
  accessibility: AccessibilityConfig;
  focusManagement: FocusManagementConfig;
  shortcuts: ShortcutDefinition[];
  actions: ShortcutActionMap;
  debug: boolean;
}

// ショートカット使用統計
export interface ShortcutUsageStats {
  shortcutId: string;
  usageCount: number;
  lastUsed: Date;
  averageExecutionTime: number;
  errorCount: number;
}

// イベントリスナー型
export type KeyboardEventListener = (event: KeyboardEventInfo) => void;
export type ContextChangeListener = (event: ContextChangeEvent) => void;
export type ShortcutExecutionListener = (shortcutId: string, success: boolean, duration: number) => void;

// プラットフォーム定数
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  darwin: {
    platform: 'darwin',
    primaryModifier: 'cmd',
    secondaryModifier: 'alt',
    symbols: { primary: '⌘', secondary: '⌥', shift: '⇧', alt: '⌥' }
  },
  win32: {
    platform: 'win32',
    primaryModifier: 'ctrl',
    secondaryModifier: 'alt',
    symbols: { primary: 'Ctrl', secondary: 'Alt', shift: 'Shift', alt: 'Alt' }
  },
  linux: {
    platform: 'linux',
    primaryModifier: 'ctrl',
    secondaryModifier: 'alt',
    symbols: { primary: 'Ctrl', secondary: 'Alt', shift: 'Shift', alt: 'Alt' }
  }
};

// デフォルトアクセシビリティ設定
export const DEFAULT_ACCESSIBILITY_CONFIG: AccessibilityConfig = {
  enableScreenReader: true,
  enableKeyboardHints: true,
  enableFocusIndicator: true,
  announceShortcuts: true,
  announceResults: true,
  announceContextChanges: true,
  focusIndicatorStyle: 'default',
  reducedMotion: false,
};

// デフォルトフォーカス管理設定
export const DEFAULT_FOCUS_CONFIG: FocusManagementConfig = {
  respectUserIntent: true,
  announceChanges: true,
  enableFocusTrap: true,
  customFocusIndicator: true,
  restoreFocusOnClose: true,
};