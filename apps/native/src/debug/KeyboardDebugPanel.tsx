import React, { useState, useEffect } from 'react';

import { useKeyboard } from '../providers/KeyboardProvider';
import type { Modifier } from '../types/keyboard.types';
import { DEBUG_ENABLED } from '../utils/buildTimeEnvironment';

// Debug panel to show real-time keyboard system status
// Only compiled in development builds - removed entirely in production
export const KeyboardDebugPanel: React.FC = () => {
  // Build-time check - this entire component will be tree-shaken in production
  if (!DEBUG_ENABLED) {
    return null;
  }
  const [isVisible, setIsVisible] = useState(false);
  const [lastKeyEvent, setLastKeyEvent] = useState<string>('None');
  const { activeContext, registry } = useKeyboard();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const modifiers = [];
      if (event.metaKey) modifiers.push('cmd');
      if (event.ctrlKey) modifiers.push('ctrl');
      if (event.shiftKey) modifiers.push('shift');
      if (event.altKey) modifiers.push('option');
      
      const keyDesc = `${event.key}${modifiers.length ? `+${modifiers.join('+')}` : ''}`;
      setLastKeyEvent(keyDesc);
      
      // Check if shortcut exists
      const shortcut = registry.findShortcutByKey(event.key, modifiers as Modifier[], activeContext);
      console.log('🔧 Keyboard Debug:', {
        key: event.key,
        modifiers,
        activeContext,
        shortcutFound: shortcut?.id || 'NONE',
        target: (event.target as HTMLElement)?.tagName
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeContext, registry]);

  // Toggle debug panel with Ctrl+Shift+D
  useEffect(() => {
    const handleToggle = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        setIsVisible(prev => !prev);
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleToggle);
    return () => window.removeEventListener('keydown', handleToggle);
  }, []);

  if (!isVisible) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999,
          fontFamily: 'monospace'
        }}
      >
        Ctrl+Shift+D for keyboard debug
      </div>
    );
  }

  const testShortcuts = [
    { key: 'Escape', modifiers: [], expected: 'cancel' },
    { key: '?', modifiers: ['cmd'], expected: 'show_help' },
    { key: 'N', modifiers: ['cmd'], expected: 'new_prompt' },
    { key: 'ArrowDown', modifiers: [], expected: 'navigate_down' },
    { key: 'ArrowUp', modifiers: [], expected: 'navigate_up' },
  ];

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'white',
        border: '2px solid #333',
        borderRadius: '8px',
        padding: '16px',
        minWidth: '300px',
        zIndex: 9999,
        fontFamily: 'monospace',
        fontSize: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>🔧 Keyboard Debug</h3>
        <button 
          onClick={() => setIsVisible(false)}
          style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <strong>Active Context:</strong> <span style={{ color: 'blue' }}>{activeContext}</span>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <strong>Last Key:</strong> <span style={{ color: 'green' }}>{lastKeyEvent}</span>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <strong>Shortcut Registry Test:</strong>
        <div style={{ fontSize: '11px', marginTop: '4px' }}>
          {testShortcuts.map(({ key, modifiers, expected }) => {
            const found = registry.findShortcutByKey(key, modifiers as Modifier[], activeContext);
            const status = found?.id === expected ? '✅' : '❌';
            return (
              <div key={`${key}-${modifiers.join('+')}`} style={{ 
                color: found?.id === expected ? 'green' : 'red',
                margin: '2px 0'
              }}>
                {status} {key}{modifiers.length ? `+${modifiers.join('+')}` : ''} → {found?.id || 'NONE'}
              </div>
            );
          })}
        </div>
      </div>
      
      <div style={{ fontSize: '11px', color: '#666' }}>
        Press Ctrl+Shift+D to close
      </div>
    </div>
  );
};