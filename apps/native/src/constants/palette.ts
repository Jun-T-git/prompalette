/**
 * パレットの色定義
 * アプリケーション全体で使用されるピン留めパレットの色
 */

export const PALETTE_COLORS = [
  { bg: 'bg-red-500', text: 'text-red-500', fill: '#ef4444' },      // 位置 1
  { bg: 'bg-blue-500', text: 'text-blue-500', fill: '#3b82f6' },    // 位置 2
  { bg: 'bg-green-500', text: 'text-green-500', fill: '#10b981' },  // 位置 3
  { bg: 'bg-yellow-500', text: 'text-yellow-500', fill: '#f59e0b' }, // 位置 4
  { bg: 'bg-purple-500', text: 'text-purple-500', fill: '#8b5cf6' }, // 位置 5
  { bg: 'bg-pink-500', text: 'text-pink-500', fill: '#ec4899' },    // 位置 6
  { bg: 'bg-indigo-500', text: 'text-indigo-500', fill: '#6366f1' }, // 位置 7
  { bg: 'bg-orange-500', text: 'text-orange-500', fill: '#f97316' }, // 位置 8
  { bg: 'bg-teal-500', text: 'text-teal-500', fill: '#14b8a6' },    // 位置 9
  { bg: 'bg-cyan-500', text: 'text-cyan-500', fill: '#06b6d4' },    // 位置 10
] as const;

/**
 * パレットの色を取得する
 * @param position 1-10の位置
 * @returns パレットの色オブジェクト、範囲外の場合はnull
 */
export function getPaletteColor(position: number) {
  if (position < 1 || position > 10) {
    return null;
  }
  return PALETTE_COLORS[position - 1];
}

/**
 * パレット位置のホットキー表示
 */
export const HOTKEY_DISPLAY = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const;