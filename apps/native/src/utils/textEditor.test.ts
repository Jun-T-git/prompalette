import { describe, it, expect } from 'vitest';

import { indentText, outdentText, createFormSubmitEvent, type TextSelection } from './textEditor';

describe('textEditor', () => {
  describe('indentText', () => {
    it('single line selection - adds tab at beginning', () => {
      const text = 'Hello world';
      const selection: TextSelection = { start: 6, end: 11 };
      
      const result = indentText(text, selection);
      
      expect(result.text).toBe('\tHello world');
      expect(result.selection.start).toBe(7); // start + 1
      expect(result.selection.end).toBe(12); // end + 1
    });

    it('multi-line selection - adds tab to each line', () => {
      const text = 'Line 1\nLine 2\nLine 3';
      const selection: TextSelection = { start: 0, end: 19 };
      
      const result = indentText(text, selection);
      
      expect(result.text).toBe('\tLine 1\n\tLine 2\n\tLine 3');
      expect(result.selection.start).toBe(1); // start + 1
      expect(result.selection.end).toBe(22); // end + 3 tabs
    });

    it('partial line selection - affects entire lines', () => {
      const text = 'Line 1\nLine 2\nLine 3';
      const selection: TextSelection = { start: 3, end: 10 }; // mid of line 1 to mid of line 2
      
      const result = indentText(text, selection);
      
      expect(result.text).toBe('\tLine 1\n\tLine 2\nLine 3');
      expect(result.selection.start).toBe(4); // start + 1
      expect(result.selection.end).toBe(12); // end + 2 tabs
    });

    it('empty text - no change', () => {
      const text = '';
      const selection: TextSelection = { start: 0, end: 0 };
      
      const result = indentText(text, selection);
      
      expect(result.text).toBe('\t');
      expect(result.selection.start).toBe(1);
      expect(result.selection.end).toBe(1);
    });
  });

  describe('outdentText', () => {
    it('single line with tab - removes tab', () => {
      const text = '\tHello world';
      const selection: TextSelection = { start: 1, end: 6 };
      
      const result = outdentText(text, selection);
      
      expect(result.text).toBe('Hello world');
      expect(result.selection.start).toBe(0); // adjusted for removed tab
      expect(result.selection.end).toBe(5); // adjusted for removed tab
    });

    it('single line with spaces - removes up to 4 spaces', () => {
      const text = '    Hello world';
      const selection: TextSelection = { start: 4, end: 9 };
      
      const result = outdentText(text, selection);
      
      expect(result.text).toBe('Hello world');
      expect(result.selection.start).toBe(0);
      expect(result.selection.end).toBe(5);
    });

    it('line with 2 spaces - removes only 2 spaces', () => {
      const text = '  Hello world';
      const selection: TextSelection = { start: 2, end: 7 };
      
      const result = outdentText(text, selection);
      
      expect(result.text).toBe('Hello world');
      expect(result.selection.start).toBe(0);
      expect(result.selection.end).toBe(5);
    });

    it('multi-line with mixed indentation', () => {
      const text = '\tLine 1\n    Line 2\n  Line 3\nLine 4';
      const selection: TextSelection = { start: 0, end: 30 };
      
      const result = outdentText(text, selection);
      
      expect(result.text).toBe('Line 1\nLine 2\nLine 3\nLine 4');
      expect(result.selection.start).toBe(0);
      expect(result.selection.end).toBe(23); // removed 1+4+2 = 7 chars
    });

    it('line without indentation - no change', () => {
      const text = 'Hello world\nNo indent';
      const selection: TextSelection = { start: 0, end: 21 };
      
      const result = outdentText(text, selection);
      
      expect(result.text).toBe('Hello world\nNo indent');
      expect(result.selection.start).toBe(0);
      expect(result.selection.end).toBe(21);
    });

    it('preserves cursor position at line start', () => {
      const text = '\tHello';
      const selection: TextSelection = { start: 0, end: 0 };
      
      const result = outdentText(text, selection);
      
      expect(result.text).toBe('Hello');
      expect(result.selection.start).toBe(0);
      expect(result.selection.end).toBe(0);
    });
  });

  describe('createFormSubmitEvent', () => {
    it('creates a valid form submit event', () => {
      const event = createFormSubmitEvent();
      
      expect(event.type).toBe('submit');
      expect(event.cancelable).toBe(true);
      expect(event.bubbles).toBe(true);
      expect(typeof event.preventDefault).toBe('function');
    });

    it('preventDefault is callable without errors', () => {
      const event = createFormSubmitEvent();
      
      expect(() => event.preventDefault()).not.toThrow();
    });
  });

  describe('input validation', () => {
    it('should throw error for negative start position', () => {
      const text = 'Hello world';
      const selection: TextSelection = { start: -1, end: 5 };
      
      expect(() => indentText(text, selection)).toThrow('Selection start cannot be negative');
      expect(() => outdentText(text, selection)).toThrow('Selection start cannot be negative');
    });

    it('should throw error when end is before start', () => {
      const text = 'Hello world';
      const selection: TextSelection = { start: 5, end: 2 };
      
      expect(() => indentText(text, selection)).toThrow('Selection end cannot be before start');
      expect(() => outdentText(text, selection)).toThrow('Selection end cannot be before start');
    });

    it('should throw error when end exceeds text length', () => {
      const text = 'Hello world';
      const selection: TextSelection = { start: 0, end: 15 };
      
      expect(() => indentText(text, selection)).toThrow('Selection end cannot exceed text length');
      expect(() => outdentText(text, selection)).toThrow('Selection end cannot exceed text length');
    });

    it('should accept valid selection at text boundaries', () => {
      const text = 'Hello world';
      const selection: TextSelection = { start: 0, end: 11 };
      
      expect(() => indentText(text, selection)).not.toThrow();
      expect(() => outdentText(text, selection)).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('indentText - handles text ending with newline', () => {
      const text = 'Line 1\nLine 2\n';
      const selection: TextSelection = { start: 0, end: 14 };
      
      const result = indentText(text, selection);
      
      expect(result.text).toBe('\tLine 1\n\tLine 2\n');
    });

    it('outdentText - handles selection at very end', () => {
      const text = '\tHello\n\tWorld';
      const selection: TextSelection = { start: 12, end: 12 };
      
      const result = outdentText(text, selection);
      
      expect(result.text).toBe('\tHello\nWorld');
    });

    it('indentText - single character at start', () => {
      const text = 'a';
      const selection: TextSelection = { start: 0, end: 1 };
      
      const result = indentText(text, selection);
      
      expect(result.text).toBe('\ta');
      expect(result.selection.start).toBe(1);
      expect(result.selection.end).toBe(2);
    });
  });
});