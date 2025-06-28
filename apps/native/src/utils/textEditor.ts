/**
 * テキストエディタ機能のユーティリティ
 * インデント/アウトデント処理を純粋関数として実装
 */

// Constants for text editing
const MAX_SPACES_TO_REMOVE = 4;
const INDENT_CHARACTER = '\t';

export interface TextSelection {
  start: number;
  end: number;
}

export interface TextEditResult {
  text: string;
  selection: TextSelection;
}

/**
 * 選択範囲の妥当性を検証する
 */
function validateSelection(text: string, selection: TextSelection): void {
  const { start, end } = selection;
  
  if (start < 0) {
    throw new Error('Selection start cannot be negative');
  }
  
  if (end < start) {
    throw new Error('Selection end cannot be before start');
  }
  
  if (end > text.length) {
    throw new Error('Selection end cannot exceed text length');
  }
}

/**
 * テキストのインデント処理
 */
export function indentText(text: string, selection: TextSelection): TextEditResult {
  validateSelection(text, selection);
  const { start, end } = selection;
  
  // 選択範囲の開始行を探す
  let lineStart = start;
  while (lineStart > 0 && text[lineStart - 1] !== '\n') {
    lineStart--;
  }
  
  // 選択範囲に含まれる全ての行の開始位置を取得
  const lineStarts: number[] = [lineStart];
  for (let i = lineStart; i < end; i++) {
    if (text[i] === '\n' && i + 1 < text.length) {
      lineStarts.push(i + 1);
    }
  }
  
  // 各行の先頭にタブを追加
  let newText = text;
  let offset = 0;
  
  for (const pos of lineStarts) {
    newText = newText.slice(0, pos + offset) + INDENT_CHARACTER + newText.slice(pos + offset);
    offset += 1;
  }
  
  return {
    text: newText,
    selection: {
      start: start + 1,
      end: end + lineStarts.length,
    },
  };
}

/**
 * テキストのアウトデント処理
 */
export function outdentText(text: string, selection: TextSelection): TextEditResult {
  validateSelection(text, selection);
  const { start, end } = selection;
  
  // 選択範囲の開始行を探す
  let lineStart = start;
  while (lineStart > 0 && text[lineStart - 1] !== '\n') {
    lineStart--;
  }
  
  // 選択範囲に含まれる全ての行の開始位置を取得
  const lineStarts: number[] = [lineStart];
  for (let i = lineStart; i < end; i++) {
    if (text[i] === '\n' && i + 1 < text.length) {
      lineStarts.push(i + 1);
    }
  }
  
  // 各行の先頭のタブまたはスペースを削除
  let newText = text;
  let totalRemoved = 0;
  let removedBeforeStart = 0;
  
  for (const pos of lineStarts) {
    const adjustedPos = pos - totalRemoved;
    
    if (newText[adjustedPos] === INDENT_CHARACTER) {
      // タブを削除
      newText = newText.slice(0, adjustedPos) + newText.slice(adjustedPos + 1);
      totalRemoved += 1;
      if (pos <= start) {
        removedBeforeStart += 1;
      }
    } else {
      // 最大4つのスペースを削除
      let spacesToRemove = 0;
      for (let i = 0; i < MAX_SPACES_TO_REMOVE && newText[adjustedPos + i] === ' '; i++) {
        spacesToRemove++;
      }
      if (spacesToRemove > 0) {
        newText = newText.slice(0, adjustedPos) + newText.slice(adjustedPos + spacesToRemove);
        totalRemoved += spacesToRemove;
        if (pos <= start) {
          removedBeforeStart += spacesToRemove;
        }
      }
    }
  }
  
  return {
    text: newText,
    selection: {
      start: Math.max(lineStart, start - removedBeforeStart),
      end: Math.max(lineStart, end - totalRemoved),
    },
  };
}

/**
 * フォーム送信イベントを作成するヘルパー
 * React.FormEventに準拠した安全な実装
 */
export function createFormSubmitEvent(): React.FormEvent<HTMLFormElement> {
  // Create a mock form element for target
  const mockForm = document.createElement('form');
  
  // Create base event
  const nativeEvent = new Event('submit', { cancelable: true, bubbles: true });
  
  // Create React synthetic event structure
  const syntheticEvent: React.FormEvent<HTMLFormElement> = {
    nativeEvent,
    currentTarget: mockForm,
    target: mockForm,
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: Event.AT_TARGET,
    isTrusted: false,
    timeStamp: Date.now(),
    type: 'submit',
    preventDefault: () => {
      // Mock preventDefault - does nothing in this context
    },
    isDefaultPrevented: () => false,
    stopPropagation: () => {
      // Mock stopPropagation
    },
    isPropagationStopped: () => false,
    persist: () => {
      // Mock persist
    },
  };
  
  return syntheticEvent;
}