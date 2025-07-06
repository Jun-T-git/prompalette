import { Prompt } from '../types/prompt';

/**
 * プロンプト表示に関する設定定数
 */
const DISPLAY_CONFIG = {
  /** フォールバック表示時の最大文字数 */
  PREVIEW_MAX_LENGTH: 50,
  /** デフォルトタイトル */
  DEFAULT_TITLE: '無題のプロンプト',
  /** プレビュー末尾の省略記号 */
  ELLIPSIS: '...',
} as const;

/**
 * プロンプトの表示用タイトルを取得する
 * 
 * @param prompt - 表示対象のプロンプト
 * @returns 表示用タイトル文字列
 * 
 * 表示優先度:
 * 1. タイトル（トリム後に文字がある場合）
 * 2. コンテンツの最初の行（50文字まで + "..."）
 * 3. デフォルトタイトル "無題のプロンプト"
 */
export function getDisplayTitle(prompt: Prompt): string {
  // タイトルが設定されており、有効な文字列の場合
  if (prompt.title && typeof prompt.title === 'string') {
    const trimmed = prompt.title.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  
  // プロンプト内容からプレビューを生成
  if (prompt.content && typeof prompt.content === 'string') {
    const firstLine = prompt.content.split('\n')[0];
    if (firstLine) {
      const preview = firstLine.trim();
      if (preview.length > 0) {
        return preview.length > DISPLAY_CONFIG.PREVIEW_MAX_LENGTH
          ? `${preview.slice(0, DISPLAY_CONFIG.PREVIEW_MAX_LENGTH)}${DISPLAY_CONFIG.ELLIPSIS}`
          : `${preview}${DISPLAY_CONFIG.ELLIPSIS}`;
      }
    }
  }
  
  // フォールバック
  return DISPLAY_CONFIG.DEFAULT_TITLE;
}

/**
 * プロンプトのタイトルが設定されているかチェック
 * 
 * @param prompt - チェック対象のプロンプト
 * @returns タイトルが有効な場合true
 */
export function hasValidTitle(prompt: Prompt): boolean {
  return !!(prompt.title && typeof prompt.title === 'string' && prompt.title.trim().length > 0);
}

/**
 * 削除確認用の安全なタイトル取得
 * 
 * @param prompt - 対象のプロンプト
 * @returns 削除確認ダイアログで使用する安全なタイトル
 */
export function getSafeTitle(prompt: Prompt): string {
  if (hasValidTitle(prompt)) {
    return (prompt.title as string).trim();
  }
  return DISPLAY_CONFIG.DEFAULT_TITLE;
}

/**
 * ツールチップ用のタイトル取得（より詳細な情報を含む）
 * 
 * @param prompt - 対象のプロンプト
 * @returns ツールチップ表示用の文字列
 */
export function getTooltipTitle(prompt: Prompt): string {
  if (hasValidTitle(prompt)) {
    return prompt.title!.trim();
  }
  
  // タイトルがない場合はより長いプレビューを表示
  if (prompt.content && typeof prompt.content === 'string') {
    const preview = prompt.content.trim().slice(0, 100);
    return preview.length > 0 ? preview : DISPLAY_CONFIG.DEFAULT_TITLE;
  }
  
  return DISPLAY_CONFIG.DEFAULT_TITLE;
}