import { HOTKEY_DISPLAY, PALETTE_COLORS } from '../../constants/palette';
import { useFavoritesStore } from '../../stores/favorites';
import type { Prompt } from '../../types';

interface SidebarPromptPaletteProps {
  onPromptSelect: (prompt: Prompt) => void;
  selectedPrompt?: Prompt | null;
}

export function SidebarPromptPalette({
  onPromptSelect,
  selectedPrompt,
}: SidebarPromptPaletteProps) {
  const { pinnedPrompts } = useFavoritesStore();

  const handleSlotClick = (prompt: Prompt | null) => {
    if (prompt) {
      onPromptSelect(prompt);
    }
  };

  const isPromptSelected = (prompt: Prompt | null) => {
    return prompt && selectedPrompt && prompt.id === selectedPrompt.id;
  };

  return (
    <div className="px-3 pb-3">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs text-gray-500 font-medium">パレット</div>
        <div className="text-xs text-gray-400 text-center">⌘+数字でクイック選択</div>
      </div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, index) => {
          const prompt = pinnedPrompts[index] || null;
          const paletteColor = PALETTE_COLORS[index];
          const hotkeyDisplay = HOTKEY_DISPLAY[index];
          const isSelected = isPromptSelected(prompt);

          return (
            <button
              key={index}
              onClick={() => handleSlotClick(prompt)}
              className={`
                relative aspect-square rounded-full border transition-all duration-200 flex items-center justify-center
                ${
                  prompt
                    ? `${paletteColor?.bg || 'bg-gray-500'} ${isSelected ? 'ring-2 ring-blue-300 shadow-md' : ''} cursor-pointer`
                    : `!bg-gray-50 border-dashed cursor-default opacity-50`
                }
                ${prompt && !isSelected ? 'hover:scale-105 hover:shadow-sm' : ''}
              `}
              style={{
                backgroundColor: prompt && paletteColor ? paletteColor.fill : undefined,
                borderColor: paletteColor ? paletteColor.fill : undefined,
              }}
              disabled={!prompt}
              title={
                prompt
                  ? `${prompt.title} (⌘${hotkeyDisplay})`
                  : `位置 ${index + 1} (⌘${hotkeyDisplay})`
              }
            >
              {/* パレット内 */}
              {prompt ? (
                <div className="text-xs font-mono font-bold text-gray-100">{hotkeyDisplay}</div>
              ) : (
                <div className="text-xs text-gray-400">空</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
