/**
 * 新しいキーボードシステム用React Hook
 * WCAG 2.1 AA準拠・ユーザビリティ重視の設計
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';

import { AccessibilityManager } from '../services/keyboard/AccessibilityManager';
import { KeyboardManager } from '../services/keyboard/KeyboardManager';
import { PlatformAdapter } from '../services/keyboard/PlatformAdapter';
import type { 
  KeyboardManagerConfig,
  UserLevel,
  KeyboardContext,
  AccessibilityConfig,
  FocusManagementConfig,
  ShortcutActionMap,
  Platform
} from '../types/keyboard-v2';
import { DEFAULT_ACCESSIBILITY_CONFIG, DEFAULT_FOCUS_CONFIG } from '../types/keyboard-v2';

interface UseKeyboardManagerOptions {
  userLevel?: UserLevel;
  context?: KeyboardContext;
  actions: ShortcutActionMap;
  accessibility?: Partial<AccessibilityConfig>;
  focusManagement?: Partial<FocusManagementConfig>;
  enabled?: boolean;
  debug?: boolean;
}

interface UseKeyboardManagerReturn {
  // 状態
  isReady: boolean;
  currentContext: KeyboardContext;
  userLevel: UserLevel;
  platform: Platform;
  
  // アクション
  setContext: (context: KeyboardContext) => void;
  setUserLevel: (level: UserLevel) => void;
  setEnabled: (enabled: boolean) => void;
  executeShortcut: (shortcutId: string) => void;
  
  // アクセシビリティ
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  setFocus: (element: HTMLElement, announce?: boolean) => void;
  trapFocus: (container: HTMLElement) => () => void;
  
  // デバッグ
  getDebugInfo: () => unknown;
}

/**
 * 新しいキーボードシステム用Hook
 */
export const useKeyboardManagerV2 = (options: UseKeyboardManagerOptions): UseKeyboardManagerReturn => {
  const {
    userLevel = 'intermediate',
    context = 'global',
    actions,
    accessibility = {},
    focusManagement = {},
    enabled = true,
    debug = false
  } = options;

  const [isReady, setIsReady] = useState(false);
  const [currentContext, setCurrentContext] = useState<KeyboardContext>(context);
  const [currentUserLevel, setCurrentUserLevel] = useState<UserLevel>(userLevel);

  const keyboardManagerRef = useRef<KeyboardManager | null>(null);
  const platformAdapterRef = useRef<PlatformAdapter | null>(null);
  const accessibilityManagerRef = useRef<AccessibilityManager | null>(null);

  // プラットフォーム情報
  const platform = useMemo(() => {
    if (!platformAdapterRef.current) {
      platformAdapterRef.current = PlatformAdapter.getInstance();
    }
    return platformAdapterRef.current.getPlatform();
  }, []);

  // 設定をマージ
  const mergedAccessibilityConfig = useMemo((): AccessibilityConfig => ({
    ...DEFAULT_ACCESSIBILITY_CONFIG,
    ...accessibility
  }), [accessibility]);

  const mergedFocusConfig = useMemo((): FocusManagementConfig => ({
    ...DEFAULT_FOCUS_CONFIG,
    ...focusManagement
  }), [focusManagement]);

  // キーボードマネージャーの設定
  const config = useMemo((): KeyboardManagerConfig => ({
    platform,
    userLevel: currentUserLevel,
    accessibility: mergedAccessibilityConfig,
    focusManagement: mergedFocusConfig,
    shortcuts: [], // ShortcutDefinitionsから自動取得
    actions,
    debug
  }), [platform, currentUserLevel, mergedAccessibilityConfig, mergedFocusConfig, actions, debug]);

  // 初期化
  useEffect(() => {
    let isMounted = true;

    const initializeKeyboardManager = async () => {
      try {
        // KeyboardManagerを取得または作成
        const manager = KeyboardManager.getInstance(config);
        keyboardManagerRef.current = manager;

        // AccessibilityManagerを取得
        const accessibilityManager = AccessibilityManager.getInstance(
          mergedAccessibilityConfig,
          mergedFocusConfig
        );
        accessibilityManagerRef.current = accessibilityManager;

        // 初期化
        await manager.initialize();

        // 初期コンテキストを設定
        manager.setContext(context);

        // コンテキスト変更リスナーを追加
        manager.addContextChangeListener((contextEvent) => {
          if (isMounted) {
            setCurrentContext(contextEvent.to);
          }
        });

        if (isMounted) {
          setIsReady(true);
        }

        if (debug) {
          console.log('useKeyboardManagerV2: Initialized successfully');
        }
      } catch (error) {
        console.error('useKeyboardManagerV2: Initialization failed:', error);
      }
    };

    initializeKeyboardManager();

    return () => {
      isMounted = false;
      // クリーンアップはKeyboardManagerの責任
    };
  }, [config, context, mergedAccessibilityConfig, mergedFocusConfig, debug]);

  // 有効/無効の制御
  useEffect(() => {
    if (keyboardManagerRef.current) {
      keyboardManagerRef.current.setEnabled(enabled);
    }
  }, [enabled]);

  // コンテキスト変更
  const setContext = useCallback((newContext: KeyboardContext) => {
    if (keyboardManagerRef.current) {
      keyboardManagerRef.current.setContext(newContext);
    }
  }, []);

  // ユーザーレベル変更
  const setUserLevel = useCallback((level: UserLevel) => {
    if (keyboardManagerRef.current) {
      keyboardManagerRef.current.setUserLevel(level);
      setCurrentUserLevel(level);
    }
  }, []);

  // 有効/無効の切り替え
  const setEnabled = useCallback((isEnabled: boolean) => {
    if (keyboardManagerRef.current) {
      keyboardManagerRef.current.setEnabled(isEnabled);
    }
  }, []);

  // ショートカット手動実行
  const executeShortcut = useCallback((shortcutId: string) => {
    if (keyboardManagerRef.current) {
      keyboardManagerRef.current.executeShortcutById(shortcutId);
    }
  }, []);

  // アクセシビリティ機能

  // スクリーンリーダーへのアナウンス
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (accessibilityManagerRef.current) {
      accessibilityManagerRef.current.announce(message, priority);
    }
  }, []);

  // フォーカス管理
  const setFocus = useCallback((element: HTMLElement, announceChange: boolean = true) => {
    if (accessibilityManagerRef.current) {
      accessibilityManagerRef.current.setFocus(element, announceChange);
    }
  }, []);

  // フォーカストラップ
  const trapFocus = useCallback((container: HTMLElement) => {
    if (accessibilityManagerRef.current) {
      return accessibilityManagerRef.current.trapFocus(container);
    }
    return () => {}; // 何もしない関数を返す
  }, []);

  // デバッグ情報
  const getDebugInfo = useCallback(() => {
    if (!keyboardManagerRef.current || !accessibilityManagerRef.current) {
      return null;
    }

    return {
      keyboard: keyboardManagerRef.current.getDebugInfo(),
      accessibility: accessibilityManagerRef.current.getDebugInfo(),
      platform: platformAdapterRef.current?.getPlatform()
    };
  }, []);

  return {
    // 状態
    isReady,
    currentContext,
    userLevel: currentUserLevel,
    platform,
    
    // アクション
    setContext,
    setUserLevel,
    setEnabled,
    executeShortcut,
    
    // アクセシビリティ
    announce,
    setFocus,
    trapFocus,
    
    // デバッグ
    getDebugInfo
  };
};

/**
 * 簡易版Hook - 基本的な機能のみ
 */
export const useSimpleKeyboard = (actions: ShortcutActionMap, enabled: boolean = true) => {
  return useKeyboardManagerV2({
    userLevel: 'intermediate', // パレット選択を含むため中級者レベルに変更
    context: 'global',
    actions,
    enabled,
    debug: true // デバッグを有効にする
  });
};

/**
 * フォーム編集用Hook
 */
export const useFormKeyboard = (
  actions: ShortcutActionMap, 
  options?: {
    userLevel?: UserLevel;
    enabled?: boolean;
    debug?: boolean;
  }
) => {
  const { userLevel = 'intermediate', enabled = true, debug = false } = options || {};
  
  return useKeyboardManagerV2({
    userLevel,
    context: 'form-editing',
    actions,
    enabled,
    debug,
    accessibility: {
      enableScreenReader: true,
      enableKeyboardHints: true,
      announceShortcuts: true,
      announceResults: true
    },
    focusManagement: {
      respectUserIntent: true,
      announceChanges: true,
      enableFocusTrap: true
    }
  });
};

/**
 * モーダル用Hook
 */
export const useModalKeyboard = (
  actions: ShortcutActionMap,
  options?: {
    trapFocus?: boolean;
    enabled?: boolean;
  }
) => {
  const { trapFocus: shouldTrapFocus = true, enabled = true } = options || {};
  
  return useKeyboardManagerV2({
    userLevel: 'beginner', // モーダルは基本操作のみ
    context: 'modal-dialog',
    actions,
    enabled,
    focusManagement: {
      respectUserIntent: false, // モーダルでは強制的にフォーカス管理
      enableFocusTrap: shouldTrapFocus,
      restoreFocusOnClose: true
    }
  });
};

export default useKeyboardManagerV2;