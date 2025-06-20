/**
 * Keyboard shortcut constants
 */

/**
 * Input element tag names that are considered as text input fields
 */
export const INPUT_ELEMENTS = ['INPUT', 'TEXTAREA', 'SELECT'] as const;

export type InputElement = typeof INPUT_ELEMENTS[number];

/**
 * Type guard to check if a tag name is an input element
 */
export function isInputElementTag(tagName: string): tagName is InputElement {
  return (INPUT_ELEMENTS as readonly string[]).includes(tagName);
}