/**
 * Keyboard shortcut constants
 */

/**
 * Essential shortcuts that work even in input fields
 * These shortcuts take precedence over normal text input behavior
 */
export const ESSENTIAL_SHORTCUTS = [
  'search_focus',
  'show_help',
  'show_settings',
  'cancel',
  'navigate_up',
  'navigate_down',
  'confirm'
] as const;

export type EssentialShortcut = typeof ESSENTIAL_SHORTCUTS[number];

/**
 * Input element tag names that are considered as text input fields
 */
export const INPUT_ELEMENTS = ['INPUT', 'TEXTAREA', 'SELECT'] as const;

export type InputElement = typeof INPUT_ELEMENTS[number];

/**
 * Type guard to check if a string is an essential shortcut
 */
export function isEssentialShortcut(id: string): id is EssentialShortcut {
  return (ESSENTIAL_SHORTCUTS as readonly string[]).includes(id);
}

/**
 * Type guard to check if a tag name is an input element
 */
export function isInputElementTag(tagName: string): tagName is InputElement {
  return (INPUT_ELEMENTS as readonly string[]).includes(tagName);
}