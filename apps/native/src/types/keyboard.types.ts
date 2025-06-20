export type ContextId = 'global' | 'search' | 'list' | 'form' | 'modal';
export type Modifier = 'cmd' | 'shift' | 'option' | 'ctrl';

export type ActionType =
  | 'ACTIVATE_APP'
  | 'COPY_PROMPT'
  | 'DELETE_PROMPT'
  | 'EDIT_PROMPT'
  | 'NEW_PROMPT'
  | 'SEARCH_FOCUS'
  | 'SHOW_HELP'
  | 'SHOW_SETTINGS'
  | 'QUICK_ACCESS'
  | 'PASTE_PROMPT'
  | 'NAVIGATE_UP'
  | 'NAVIGATE_DOWN'
  | 'SELECT_FIRST'
  | 'SELECT_LAST'
  | 'CONFIRM'
  | 'CANCEL'
  | 'SAVE'
  | 'SAVE_AND_CLOSE';

export interface KeyboardContext {
  id: ContextId;
  priority: number;
  parent?: ContextId;
}

export interface KeyboardShortcut {
  id: string;
  key: string;
  modifiers: Modifier[];
  context: ContextId;
  action: ActionType;
  customizable: boolean;
  globalHotkey?: boolean;
}

export interface CommandResult {
  success: boolean;
  data?: any;
  error?: string;
}