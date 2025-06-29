import { useMemo } from 'react';

import { PALETTE_COLORS } from '../../constants/palette';
import { useFavoritesStore } from '../../stores/favorites';
import type { Prompt } from '../../types';
import { getDisplayTitle } from '../../utils/promptDisplay';

interface PromptCardProps {
  prompt: Prompt;
  isSelected?: boolean;
  onClick?: () => void;
  onCopy?: () => void;
}

export function PromptCard({ prompt, isSelected = false, onClick, onCopy }: PromptCardProps) {
  const { pinnedPrompts } = useFavoritesStore();

  // ピン留め状態をメモ化して確実に更新されるようにする
  const pinStatus = useMemo(() => {
    const currentPinnedPosition = pinnedPrompts.findIndex(
      (pinnedPrompt) => pinnedPrompt?.id === prompt.id,
    );
    const isPinned = currentPinnedPosition !== -1;
    const pinnedPosition = isPinned ? currentPinnedPosition + 1 : null;
    const paletteColor = isPinned ? PALETTE_COLORS[currentPinnedPosition] : null;
    
    return { isPinned, pinnedPosition, paletteColor };
  }, [pinnedPrompts, prompt.id]);

  const { isPinned, pinnedPosition, paletteColor } = pinStatus;
  const cardClasses = [
    'p-2 rounded border cursor-pointer transition-all duration-200 h-12 flex items-center justify-between relative overflow-hidden',
    isSelected
      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
  ].join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* ピン留めバッジ (右上) */}
      {isPinned && paletteColor && (
        <div
          className="absolute top-0 right-0 w-2 h-2 rounded-full border border-white flex items-center justify-center z-10"
          style={{ backgroundColor: paletteColor.fill }}
          title={`ピン留め位置 ${pinnedPosition}`}
        />
      )}

      {/* 左側: タイトル */}
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {getDisplayTitle(prompt)}
        </h3>
      </div>

      {/* 右側: コピーボタンのみ */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        {onCopy && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            className="p-0.5 text-gray-400 hover:text-blue-600 rounded"
            title="コピー"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
