import React, { useEffect, useRef, useState } from 'react';

import { HOTKEY_DISPLAY, PALETTE_COLORS } from '../../constants/palette';
import type { PinnedPrompt } from '../../types';

/**
 * PaletteDropdownコンポーネントのProps
 */
interface PaletteDropdownProps {
  /** トリガーボタンの内容 */
  trigger: React.ReactNode;
  /** 現在ピン留めされているプロンプト一覧 */
  pinnedPrompts: (PinnedPrompt | null)[];
  /** 現在選択中のプロンプトID */
  currentPromptId?: string;
  /** 位置選択時のハンドラー */
  onSelectPosition: (position: number) => void;
  /** ピン留め解除時のハンドラー */
  onUnpin: () => void;
  /** ドロップダウンが開いているかどうか */
  isOpen?: boolean;
  /** ドロップダウンの開閉状態変更ハンドラー */
  onToggle?: (isOpen: boolean) => void;
  /** 無効化状態 */
  disabled?: boolean;
  /** 現在のピン留め位置 */
  currentPosition?: number | null;
}

/**
 * ビジュアルなパレット選択ドロップダウン
 */
export function PaletteDropdown({
  trigger,
  pinnedPrompts,
  currentPromptId,
  onSelectPosition,
  onUnpin,
  isOpen: controlledIsOpen,
  onToggle,
  disabled = false,
  currentPosition,
}: PaletteDropdownProps) {
  const [isInternalOpen, setIsInternalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 制御された状態か内部状態かを判定
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : isInternalOpen;

  const handleToggle = () => {
    if (disabled) return;

    const newIsOpen = !isOpen;

    if (isControlled) {
      onToggle?.(newIsOpen);
    } else {
      setIsInternalOpen(newIsOpen);
    }
  };

  const handleClose = () => {
    if (isControlled) {
      onToggle?.(false);
    } else {
      setIsInternalOpen(false);
    }
  };

  const handleSelectPosition = (position: number) => {
    onSelectPosition(position);
    handleClose();
  };

  const handleUnpin = () => {
    onUnpin();
    handleClose();
  };

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  // ESCキーでドロップダウンを閉じる
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
    return undefined;
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* トリガーボタン */}
      <div onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute z-50 top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[280px]">
          {/* タイトル */}
          <div className="text-xs font-medium text-gray-600 mb-3">ピン留め位置を選択</div>

          {/* パレットグリッド */}
          <div className="grid grid-cols-5 gap-2 mb-3">
            {Array.from({ length: 10 }, (_, index) => {
              const position = index + 1;
              const paletteColor = PALETTE_COLORS[index];
              const hotkeyDisplay = HOTKEY_DISPLAY[index];
              const occupiedPrompt = pinnedPrompts[index];
              const isOccupied = occupiedPrompt && occupiedPrompt.id !== currentPromptId;
              const isCurrentPosition = position === currentPosition;

              return (
                <button
                  key={position}
                  onClick={() => handleSelectPosition(position)}
                  disabled={isCurrentPosition}
                  className={`
                    relative w-12 h-12 rounded-lg border-2 transition-all duration-200 
                    flex items-center justify-center group overflow-hidden
                    ${
                      isCurrentPosition
                        ? 'ring-2 ring-offset-2 ring-blue-500 cursor-default'
                        : 'hover:scale-105 hover:shadow-md cursor-pointer'
                    }
                    ${isOccupied || isCurrentPosition ? '' : 'opacity-50 border-dashed !bg-transparent'}
                  `}
                  style={{
                    backgroundColor: paletteColor?.fill,
                    borderColor: paletteColor?.fill,
                  }}
                  title={
                    isCurrentPosition
                      ? '現在の位置'
                      : isOccupied
                        ? `${occupiedPrompt.title} と入れ替える`
                        : `位置 ${position} (⌘${hotkeyDisplay})`
                  }
                >
                  {/* 位置番号 */}
                  <span
                    className={`${isOccupied || isCurrentPosition ? 'text-white' : ''} font-bold text-sm relative z-10`}
                  >
                    {position}
                  </span>

                  {/* 使用中オーバーレイ（ホバー時に表示） */}
                  {isOccupied && !isCurrentPosition && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 使用中プロンプトの情報 */}
          {pinnedPrompts.some((p) => p && p.id !== currentPromptId) && (
            <div className="text-xs text-gray-500 mb-3">
              <svg
                className="inline-block w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              使用中の位置は選択できません
            </div>
          )}

          {/* ピン留め解除ボタン */}
          {currentPosition && (
            <>
              <div className="border-t border-gray-100 pt-3 mt-3">
                <button
                  onClick={handleUnpin}
                  className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  ピン留めを解除
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
