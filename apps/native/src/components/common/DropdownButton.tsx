import React, { useState, useRef, useEffect } from 'react'

/**
 * DropdownButtonコンポーネントのProps
 */
interface DropdownButtonProps {
  /** トリガーボタンの内容 */
  trigger: React.ReactNode
  /** ドロップダウンメニューの項目 */
  items: DropdownItem[]
  /** ドロップダウンが開いているかどうか */
  isOpen?: boolean
  /** ドロップダウンの開閉状態変更ハンドラー */
  onToggle?: (isOpen: boolean) => void
  /** ドロップダウンの位置 */
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  /** 無効化状態 */
  disabled?: boolean
  /** カスタムクラス名 */
  className?: string
}

/**
 * DropdownMenuの項目
 */
export interface DropdownItem {
  /** 項目のラベル */
  label: string
  /** クリック時のハンドラー */
  onClick: () => void
  /** 項目が無効化されているかどうか */
  disabled?: boolean
  /** 項目のアイコン */
  icon?: React.ReactNode
  /** 項目のバリアント（見た目） */
  variant?: 'default' | 'danger'
}

/**
 * DropdownButtonコンポーネント
 * トリガーボタンをクリックすることでドロップダウンメニューを表示
 * 
 * @param trigger - トリガーボタンの内容
 * @param items - ドロップダウンメニューの項目
 * @param isOpen - ドロップダウンが開いているかどうか
 * @param onToggle - ドロップダウンの開閉状態変更ハンドラー
 * @param position - ドロップダウンの位置
 * @param disabled - 無効化状態
 * @param className - カスタムクラス名
 * 
 * @example
 * ```tsx
 * const items = [
 *   { label: 'Edit', onClick: () => console.log('Edit') },
 *   { label: 'Delete', onClick: () => console.log('Delete'), variant: 'danger' },
 * ]
 * 
 * <DropdownButton
 *   trigger={<button>Menu</button>}
 *   items={items}
 * />
 * ```
 */
export function DropdownButton({
  trigger,
  items,
  isOpen: controlledIsOpen,
  onToggle,
  position = 'bottom-left',
  disabled = false,
  className = '',
}: DropdownButtonProps) {
  const [isInternalOpen, setIsInternalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 制御された状態か内部状態かを判定
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : isInternalOpen

  /**
   * ドロップダウンの開閉状態を切り替え
   */
  const handleToggle = () => {
    if (disabled) return
    
    const newIsOpen = !isOpen
    
    if (isControlled) {
      onToggle?.(newIsOpen)
    } else {
      setIsInternalOpen(newIsOpen)
    }
  }

  /**
   * ドロップダウンを閉じる
   */
  const handleClose = () => {
    if (isControlled) {
      onToggle?.(false)
    } else {
      setIsInternalOpen(false)
    }
  }

  /**
   * 項目をクリックした時の処理
   */
  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return
    
    item.onClick()
    handleClose()
  }

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    return undefined
  }, [isOpen])

  // ESCキーでドロップダウンを閉じる
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => document.removeEventListener('keydown', handleEscapeKey)
    }
    return undefined
  }, [isOpen])

  // 位置別のクラス名
  const positionClasses = {
    'bottom-left': 'top-full left-0 mt-1',
    'bottom-right': 'top-full right-0 mt-1',
    'top-left': 'bottom-full left-0 mb-1',
    'top-right': 'bottom-full right-0 mb-1',
  }

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* トリガーボタン */}
      <div onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div
          className={`
            absolute z-50 min-w-32 bg-white border border-gray-200 rounded-md shadow-lg
            ${positionClasses[position]}
          `}
        >
          <div className="py-1">
            {items.map((item, index) => {
              const itemVariantClasses = {
                default: 'text-gray-700 hover:bg-gray-100',
                danger: 'text-red-700 hover:bg-red-50',
              }

              return (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`
                    w-full text-left px-4 py-2 text-sm flex items-center space-x-2
                    transition-colors duration-150
                    ${item.disabled 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : itemVariantClasses[item.variant || 'default']
                    }
                  `}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}