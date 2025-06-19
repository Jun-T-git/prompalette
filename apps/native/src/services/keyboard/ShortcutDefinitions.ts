/**
 * ショートカット定義
 * 階層化された重要度別ショートカット設定
 */

import type { 
  ShortcutDefinition, 
  UserLevel, 
  KeyboardContext 
} from '../../types/keyboard-v2';

/**
 * Essential ショートカット（7個）
 * 全ユーザーが知るべき最重要ショートカット
 */
export const ESSENTIAL_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'global-help',
    priority: 'essential',
    context: 'global',
    combination: { key: '?', modifiers: ['primary'] },
    action: 'showHelp',
    description: 'ヘルプを表示',
    ariaLabel: 'ヘルプを表示します。ショートカット: Command ?',
    userLevel: 'beginner',
    customizable: false,
    note: 'macOSでアクセスしやすいヘルプキー'
  },
  {
    id: 'global-settings',
    priority: 'essential',
    context: 'global',
    combination: { key: ',', modifiers: ['primary'] },
    action: 'openSettings',
    description: '設定を開く',
    ariaLabel: '設定画面を開きます。ショートカット: Command カンマ',
    userLevel: 'beginner',
    customizable: false,
    note: 'macOS標準の設定ショートカット'
  },
  {
    id: 'app-new',
    priority: 'essential',
    context: 'global',
    combination: { key: 'n', modifiers: ['primary'] },
    action: 'createNewPrompt',
    description: '新規プロンプト作成',
    ariaLabel: '新しいプロンプトを作成します。ショートカット: Command N',
    userLevel: 'beginner',
    customizable: true
  },
  {
    id: 'app-save',
    priority: 'essential',
    context: 'form-editing',
    combination: { key: 's', modifiers: ['primary'] },
    action: 'savePrompt',
    description: 'プロンプトを保存',
    ariaLabel: 'プロンプトを保存します。ショートカット: Command S',
    userLevel: 'beginner',
    customizable: false
  },
  {
    id: 'dialog-cancel',
    priority: 'essential',
    context: 'global',
    combination: { key: 'Escape', modifiers: [] },
    action: 'closeDialog',
    description: 'ダイアログを閉じる',
    ariaLabel: 'ダイアログやモーダルを閉じます。ショートカット: エスケープ',
    userLevel: 'beginner',
    customizable: false
  },
  {
    id: 'dialog-confirm',
    priority: 'essential',
    context: 'global',
    combination: { key: 'Enter', modifiers: [] },
    action: 'confirmAction',
    description: 'アクションを実行',
    ariaLabel: '選択されたアクションを実行します。ショートカット: エンター',
    userLevel: 'beginner',
    customizable: false
  },
  {
    id: 'search-focus',
    priority: 'essential',
    context: 'global',
    combination: { key: 'f', modifiers: ['primary'] },
    action: 'focusSearch',
    description: '検索にフォーカス',
    ariaLabel: '検索フィールドにフォーカスを移動します。ショートカット: Command F',
    userLevel: 'beginner',
    customizable: true,
    note: 'Web標準の検索ショートカット（preventDefault()で制御）'
  }
];

/**
 * Common ショートカット（8個）
 * 一般的なユーザーが使用する基本操作
 */
export const COMMON_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'edit-copy',
    priority: 'common',
    context: 'global',
    combination: { key: 'c', modifiers: ['primary'] },
    action: 'copyPrompt',
    description: 'プロンプトをコピー',
    ariaLabel: '選択されたプロンプトをクリップボードにコピーします。ショートカット: Command C',
    userLevel: 'intermediate',
    customizable: true,
    conflictsWith: ['form-editing'] // フォーム編集中は無効
  },
  {
    id: 'edit-delete',
    priority: 'common',
    context: 'global',
    combination: { key: 'd', modifiers: ['primary'] },
    action: 'deletePrompt',
    description: 'プロンプトを削除',
    ariaLabel: '選択されたプロンプトを削除します。ショートカット: Command D',
    userLevel: 'intermediate',
    customizable: true,
    conflictsWith: ['form-editing'], // フォーム編集中は無効
    note: 'Web標準の削除ショートカット（preventDefault()で制御）'
  },
  {
    id: 'edit-edit',
    priority: 'common',
    context: 'global',
    combination: { key: 'e', modifiers: ['primary'] },
    action: 'editPrompt',
    description: 'プロンプトを編集',
    ariaLabel: '選択されたプロンプトを編集モードで開きます。ショートカット: Command E',
    userLevel: 'intermediate',
    customizable: true
  },
  {
    id: 'nav-up',
    priority: 'common',
    context: 'global',
    combination: { key: 'ArrowUp', modifiers: [] },
    action: 'selectPrevPrompt',
    description: '前の項目を選択',
    ariaLabel: '前の項目を選択します。ショートカット: 上矢印',
    userLevel: 'beginner',
    customizable: false
  },
  {
    id: 'nav-down',
    priority: 'common',
    context: 'global',
    combination: { key: 'ArrowDown', modifiers: [] },
    action: 'selectNextPrompt',
    description: '次の項目を選択',
    ariaLabel: '次の項目を選択します。ショートカット: 下矢印',
    userLevel: 'beginner',
    customizable: false
  },
  {
    id: 'nav-first',
    priority: 'common',
    context: 'list-navigation',
    combination: { key: 'Home', modifiers: [] },
    action: 'selectFirst',
    description: '最初の項目を選択',
    ariaLabel: '最初の項目を選択します。ショートカット: ホーム',
    userLevel: 'intermediate',
    customizable: true
  },
  {
    id: 'nav-last',
    priority: 'common',
    context: 'list-navigation',
    combination: { key: 'End', modifiers: [] },
    action: 'selectLast',
    description: '最後の項目を選択',
    ariaLabel: '最後の項目を選択します。ショートカット: エンド',
    userLevel: 'intermediate',
    customizable: true
  },
  {
    id: 'form-next-field',
    priority: 'common',
    context: 'form-editing',
    combination: { key: 'Tab', modifiers: [] },
    action: 'focusNextField',
    description: '次のフィールドに移動',
    ariaLabel: '次のフォームフィールドに移動します。ショートカット: タブ',
    userLevel: 'beginner',
    customizable: false
  },
  {
    id: 'quick-access-1',
    priority: 'common',
    context: 'global',
    combination: { key: '1', modifiers: ['primary'] },
    action: 'selectQuickAccess',
    description: 'クイックアクセス 1',
    ariaLabel: 'クイックアクセススロット1のプロンプトを選択します。ショートカット: Command 1',
    userLevel: 'intermediate',
    customizable: true,
    note: 'アプリフォーカス時のみ有効（preventDefault()で制御）',
    params: { slot: 1 }
  },
  {
    id: 'quick-access-2',
    priority: 'common',
    context: 'global',
    combination: { key: '2', modifiers: ['primary'] },
    action: 'selectQuickAccess',
    description: 'クイックアクセス 2',
    ariaLabel: 'クイックアクセススロット2のプロンプトを選択します。ショートカット: Command 2',
    userLevel: 'intermediate',
    customizable: true,
    note: 'アプリフォーカス時のみ有効（preventDefault()で制御）',
    params: { slot: 2 }
  },
  {
    id: 'quick-access-3',
    priority: 'common',
    context: 'global',
    combination: { key: '3', modifiers: ['primary'] },
    action: 'selectQuickAccess',
    description: 'クイックアクセス 3',
    ariaLabel: 'クイックアクセススロット3のプロンプトを選択します。ショートカット: Command 3',
    userLevel: 'intermediate',
    customizable: true,
    note: 'アプリフォーカス時のみ有効（preventDefault()で制御）',
    params: { slot: 3 }
  },
  {
    id: 'quick-access-4',
    priority: 'common',
    context: 'global',
    combination: { key: '4', modifiers: ['primary'] },
    action: 'selectQuickAccess',
    description: 'クイックアクセス 4',
    ariaLabel: 'クイックアクセススロット4のプロンプトを選択します。ショートカット: Command 4',
    userLevel: 'intermediate',
    customizable: true,
    note: 'アプリフォーカス時のみ有効（preventDefault()で制御）',
    params: { slot: 4 }
  },
  {
    id: 'quick-access-5',
    priority: 'common',
    context: 'global',
    combination: { key: '5', modifiers: ['primary'] },
    action: 'selectQuickAccess',
    description: 'クイックアクセス 5',
    ariaLabel: 'クイックアクセススロット5のプロンプトを選択します。ショートカット: Command 5',
    userLevel: 'intermediate',
    customizable: true,
    note: 'アプリフォーカス時のみ有効（preventDefault()で制御）',
    params: { slot: 5 }
  },
  {
    id: 'quick-access-6',
    priority: 'common',
    context: 'global',
    combination: { key: '6', modifiers: ['primary'] },
    action: 'selectQuickAccess',
    description: 'クイックアクセス 6',
    ariaLabel: 'クイックアクセススロット6のプロンプトを選択します。ショートカット: Command 6',
    userLevel: 'intermediate',
    customizable: true,
    note: 'アプリフォーカス時のみ有効（preventDefault()で制御）',
    params: { slot: 6 }
  },
  {
    id: 'quick-access-7',
    priority: 'common',
    context: 'global',
    combination: { key: '7', modifiers: ['primary'] },
    action: 'selectQuickAccess',
    description: 'クイックアクセス 7',
    ariaLabel: 'クイックアクセススロット7のプロンプトを選択します。ショートカット: Command 7',
    userLevel: 'intermediate',
    customizable: true,
    note: 'アプリフォーカス時のみ有効（preventDefault()で制御）',
    params: { slot: 7 }
  },
  {
    id: 'quick-access-8',
    priority: 'common',
    context: 'global',
    combination: { key: '8', modifiers: ['primary'] },
    action: 'selectQuickAccess',
    description: 'クイックアクセス 8',
    ariaLabel: 'クイックアクセススロット8のプロンプトを選択します。ショートカット: Command 8',
    userLevel: 'intermediate',
    customizable: true,
    note: 'アプリフォーカス時のみ有効（preventDefault()で制御）',
    params: { slot: 8 }
  },
  {
    id: 'quick-access-9',
    priority: 'common',
    context: 'global',
    combination: { key: '9', modifiers: ['primary'] },
    action: 'selectQuickAccess',
    description: 'クイックアクセス 9',
    ariaLabel: 'クイックアクセススロット9のプロンプトを選択します。ショートカット: Command 9',
    userLevel: 'intermediate',
    customizable: true,
    note: 'アプリフォーカス時のみ有効（preventDefault()で制御）',
    params: { slot: 9 }
  },
  {
    id: 'quick-access-10',
    priority: 'common',
    context: 'global',
    combination: { key: '0', modifiers: ['primary'] },
    action: 'selectQuickAccess',
    description: 'クイックアクセス 10',
    ariaLabel: 'クイックアクセススロット10のプロンプトを選択します。ショートカット: Command 0',
    userLevel: 'intermediate',
    customizable: true,
    note: 'アプリフォーカス時のみ有効（preventDefault()で制御）',
    params: { slot: 10 }
  }
];

/**
 * Advanced ショートカット（3個）
 * 上級ユーザー向けの効率化ショートカット
 */
export const ADVANCED_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'save-and-close',
    priority: 'advanced',
    context: 'form-editing',
    combination: { key: 'Enter', modifiers: ['primary'] },
    action: 'saveAndClose',
    description: '保存して閉じる',
    ariaLabel: 'プロンプトを保存してフォームを閉じます。ショートカット: Command エンター',
    userLevel: 'intermediate',
    customizable: true
  },
  {
    id: 'expert-mode',
    priority: 'advanced',
    context: 'global',
    combination: { key: 'k', modifiers: ['primary'] },
    action: 'toggleCommandPalette',
    description: 'コマンドパレット',
    ariaLabel: 'コマンドパレットを開きます。ショートカット: Command K',
    userLevel: 'advanced',
    customizable: true,
    note: 'Web標準のコマンドパレット（Slack/Discord/GitHub等で使用）'
  },
  {
    id: 'form-cancel',
    priority: 'advanced',
    context: 'form-editing',
    combination: { key: 'Escape', modifiers: [] },
    action: 'cancelEdit',
    description: '編集をキャンセル',
    ariaLabel: '編集をキャンセルしてフォームを閉じます。ショートカット: エスケープ',
    userLevel: 'intermediate',
    customizable: true,
    note: '標準的なキャンセル操作'
  }
];

/**
 * フォーム編集専用ショートカット
 */
export const FORM_EDITING_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'form-indent',
    priority: 'common',
    context: 'form-editing',
    combination: { key: ']', modifiers: ['primary'] },
    action: 'indentText',
    description: 'テキストをインデント',
    ariaLabel: '選択されたテキストをインデントします。ショートカット: Command 右括弧',
    userLevel: 'intermediate',
    customizable: false
  },
  {
    id: 'form-unindent',
    priority: 'common',
    context: 'form-editing',
    combination: { key: '[', modifiers: ['primary'] },
    action: 'unindentText',
    description: 'テキストの逆インデント',
    ariaLabel: '選択されたテキストの逆インデントを行います。ショートカット: Command 左括弧',
    userLevel: 'intermediate',
    customizable: false
  },
  {
    id: 'form-prev-field',
    priority: 'common',
    context: 'form-editing',
    combination: { key: 'Tab', modifiers: ['shift'] },
    action: 'focusPrevField',
    description: '前のフィールドに移動',
    ariaLabel: '前のフォームフィールドに移動します。ショートカット: Shift タブ',
    userLevel: 'beginner',
    customizable: false
  }
];

/**
 * ユーザーレベル別ショートカット取得
 */
export function getShortcutsForUserLevel(userLevel: UserLevel): ShortcutDefinition[] {
  switch (userLevel) {
    case 'beginner':
      return ESSENTIAL_SHORTCUTS;
    case 'intermediate':
      return [...ESSENTIAL_SHORTCUTS, ...COMMON_SHORTCUTS];
    case 'advanced':
      return [...ESSENTIAL_SHORTCUTS, ...COMMON_SHORTCUTS, ...ADVANCED_SHORTCUTS];
    default:
      return ESSENTIAL_SHORTCUTS;
  }
}

/**
 * コンテキスト別ショートカット取得
 */
export function getShortcutsForContext(context: KeyboardContext, userLevel: UserLevel = 'intermediate'): ShortcutDefinition[] {
  const allShortcuts = getShortcutsForUserLevel(userLevel);
  
  // グローバルコンテキストのショートカットも含める
  return allShortcuts.filter(shortcut => 
    shortcut.context === context || shortcut.context === 'global'
  );
}

/**
 * フォーム編集コンテキスト用ショートカット取得
 */
export function getFormEditingShortcuts(userLevel: UserLevel = 'intermediate'): ShortcutDefinition[] {
  const contextShortcuts = getShortcutsForContext('form-editing', userLevel);
  return [...contextShortcuts, ...FORM_EDITING_SHORTCUTS];
}

/**
 * すべてのショートカット定義を取得
 */
export function getAllShortcuts(): ShortcutDefinition[] {
  return [...ESSENTIAL_SHORTCUTS, ...COMMON_SHORTCUTS, ...ADVANCED_SHORTCUTS, ...FORM_EDITING_SHORTCUTS];
}

/**
 * ショートカットIDから定義を取得
 */
export function getShortcutById(id: string): ShortcutDefinition | undefined {
  return getAllShortcuts().find(shortcut => shortcut.id === id);
}

/**
 * アクションからショートカット定義を取得
 */
export function getShortcutsByAction(action: string): ShortcutDefinition[] {
  return getAllShortcuts().filter(shortcut => shortcut.action === action);
}