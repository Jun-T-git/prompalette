/**
 * アクセシブルなショートカット表示コンポーネント
 * WCAG 2.1 AA準拠
 */

import React, { useMemo } from 'react';

import { PlatformAdapter } from '../../services/keyboard/PlatformAdapter';
import type { ShortcutDefinition, KeyCombination } from '../../types/keyboard-v2';

interface ShortcutDisplayProps {
  shortcut?: ShortcutDefinition;
  combination?: KeyCombination;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'detailed';
  showDescription?: boolean;
  className?: string;
}

/**
 * ショートカット表示コンポーネント
 */
export const ShortcutDisplay: React.FC<ShortcutDisplayProps> = ({
  shortcut,
  combination,
  description,
  size = 'md',
  variant = 'default',
  showDescription = false,
  className = ''
}) => {
  const platformAdapter = useMemo(() => PlatformAdapter.getInstance(), []);

  // ショートカット情報を正規化
  const normalizedShortcut = useMemo(() => {
    if (shortcut) {
      return {
        combination: shortcut.combination,
        description: shortcut.description,
        ariaLabel: shortcut.ariaLabel
      };
    }
    
    if (combination) {
      return {
        combination,
        description: description || '',
        ariaLabel: platformAdapter.generateAriaLabel(combination, description || '')
      };
    }
    
    return null;
  }, [shortcut, combination, description, platformAdapter]);

  if (!normalizedShortcut) {
    return null;
  }

  // キー表示文字列を生成
  const keyDisplay = useMemo(() => {
    return platformAdapter.formatKeyCombo(normalizedShortcut.combination);
  }, [normalizedShortcut.combination, platformAdapter]);

  // サイズ別スタイル
  const sizeClasses = {
    sm: 'text-xs px-1 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  // バリアント別スタイル
  const variantClasses = {
    default: 'bg-gray-100 border border-gray-300 rounded',
    minimal: 'bg-transparent',
    detailed: 'bg-gray-50 border border-gray-200 rounded-md shadow-sm'
  };

  const baseClasses = `
    inline-flex items-center font-mono
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  if (variant === 'minimal') {
    return (
      <span 
        className={baseClasses}
        aria-label={normalizedShortcut.ariaLabel}
        title={normalizedShortcut.ariaLabel}
      >
        {keyDisplay}
      </span>
    );
  }

  if (variant === 'detailed') {
    return (
      <div 
        className={`${baseClasses} flex-col items-start space-y-1`}
        aria-label={normalizedShortcut.ariaLabel}
      >
        <span className="font-mono font-medium">
          {keyDisplay}
        </span>
        {(showDescription || normalizedShortcut.description) && (
          <span className="text-xs text-gray-600 font-normal">
            {normalizedShortcut.description}
          </span>
        )}
      </div>
    );
  }

  // default variant
  return (
    <span 
      className={baseClasses}
      aria-label={normalizedShortcut.ariaLabel}
      title={normalizedShortcut.ariaLabel}
    >
      {keyDisplay}
      {showDescription && normalizedShortcut.description && (
        <span className="ml-2 font-normal text-gray-600">
          {normalizedShortcut.description}
        </span>
      )}
    </span>
  );
};

/**
 * ショートカットリスト表示コンポーネント
 */
interface ShortcutListProps {
  shortcuts: ShortcutDefinition[];
  title?: string;
  groupBy?: 'priority' | 'context' | 'none';
  showDescriptions?: boolean;
  className?: string;
}

export const ShortcutList: React.FC<ShortcutListProps> = ({
  shortcuts,
  title,
  groupBy = 'priority',
  showDescriptions = true,
  className = ''
}) => {
  // ショートカットをグループ化
  const groupedShortcuts = useMemo(() => {
    if (groupBy === 'none') {
      return { '': shortcuts };
    }

    const groups: Record<string, ShortcutDefinition[]> = {};
    
    shortcuts.forEach(shortcut => {
      const key = groupBy === 'priority' ? shortcut.priority : shortcut.context;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(shortcut);
    });

    return groups;
  }, [shortcuts, groupBy]);

  // グループ名の表示名マッピング
  const groupDisplayNames: Record<string, string> = {
    // Priority
    essential: '必須操作',
    common: '一般操作',
    advanced: '上級操作',
    
    // Context
    global: 'グローバル',
    'list-navigation': 'リスト操作',
    'form-editing': 'フォーム編集',
    'modal-dialog': 'モーダル',
    settings: '設定',
    'help-overlay': 'ヘルプ'
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900">
          {title}
        </h3>
      )}
      
      {Object.entries(groupedShortcuts).map(([groupKey, groupShortcuts]) => (
        <div key={groupKey} className="space-y-3">
          {groupKey && (
            <h4 className="text-md font-medium text-gray-700 border-b border-gray-200 pb-1">
              {groupDisplayNames[groupKey] || groupKey}
            </h4>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupShortcuts.map(shortcut => (
              <div 
                key={shortcut.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {shortcut.description}
                  </div>
                  {showDescriptions && shortcut.ariaLabel !== shortcut.description && (
                    <div className="text-sm text-gray-600 mt-1">
                      {shortcut.ariaLabel}
                    </div>
                  )}
                </div>
                
                <ShortcutDisplay 
                  shortcut={shortcut}
                  size="md"
                  variant="default"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * インラインショートカットヒント
 */
interface ShortcutHintProps {
  shortcut: ShortcutDefinition;
  show?: boolean;
  position?: 'right' | 'bottom';
  className?: string;
}

export const ShortcutHint: React.FC<ShortcutHintProps> = ({
  shortcut,
  show = true,
  position = 'right',
  className = ''
}) => {
  if (!show) {
    return null;
  }

  const positionClasses = {
    right: 'ml-2',
    bottom: 'mt-1 block'
  };

  return (
    <ShortcutDisplay
      shortcut={shortcut}
      size="sm"
      variant="minimal"
      className={`text-gray-400 opacity-70 ${positionClasses[position]} ${className}`}
    />
  );
};

/**
 * ボタンにショートカットを表示
 */
interface ButtonWithShortcutProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shortcut?: ShortcutDefinition;
  children: React.ReactNode;
  showHint?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const ButtonWithShortcut: React.FC<ButtonWithShortcutProps> = ({
  shortcut,
  children,
  showHint = true,
  variant = 'primary',
  className = '',
  ...buttonProps
}) => {
  const platformAdapter = useMemo(() => PlatformAdapter.getInstance(), []);

  // バリアント別スタイル
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700'
  };

  const baseClasses = `
    inline-flex items-center px-4 py-2 rounded-md font-medium
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${className}
  `.trim();

  // アクセシビリティ属性
  const accessibilityProps = shortcut ? {
    'aria-label': shortcut.ariaLabel,
    'aria-keyshortcuts': platformAdapter.formatKeyCombo(shortcut.combination),
    title: shortcut.ariaLabel
  } : {};

  return (
    <button 
      className={baseClasses}
      {...accessibilityProps}
      {...buttonProps}
    >
      <span className="flex-1">
        {children}
      </span>
      
      {shortcut && showHint && (
        <ShortcutHint 
          shortcut={shortcut}
          position="right"
          className="text-current opacity-60"
        />
      )}
    </button>
  );
};