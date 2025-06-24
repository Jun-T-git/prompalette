import { useState, useCallback, useRef, useEffect } from 'react';

const GRACE_PERIOD_MS = 150;

export interface IMECompositionState {
  isComposing: boolean;
  isShortcutsBlocked: boolean;
  compositionData: string;
}

export interface CompositionEventHandlers {
  onCompositionStart: (event: React.CompositionEvent) => void;
  onCompositionUpdate: (event: React.CompositionEvent) => void;
  onCompositionEnd: (event: React.CompositionEvent) => void;
}

export const useIMEComposition = () => {
  const [isComposing, setIsComposing] = useState(false);
  const [isShortcutsBlocked, setIsShortcutsBlocked] = useState(false);
  const [compositionData, setCompositionData] = useState('');
  
  const graceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (graceTimeoutRef.current) {
        clearTimeout(graceTimeoutRef.current);
      }
    };
  }, []);

  const handleCompositionStart = useCallback((_event: React.CompositionEvent) => {
    // Clear any existing grace period timeout
    if (graceTimeoutRef.current) {
      clearTimeout(graceTimeoutRef.current);
      graceTimeoutRef.current = null;
    }

    setIsComposing(true);
    setIsShortcutsBlocked(true);
    setCompositionData('');
  }, []);

  const handleCompositionUpdate = useCallback((event: React.CompositionEvent) => {
    setCompositionData(event.data || '');
  }, []);

  const handleCompositionEnd = useCallback((event: React.CompositionEvent) => {
    setIsComposing(false);
    setCompositionData(event.data || '');

    // Start grace period - keep shortcuts blocked for a short time
    // to prevent accidental shortcut triggers immediately after composition
    graceTimeoutRef.current = setTimeout(() => {
      setIsShortcutsBlocked(false);
      graceTimeoutRef.current = null;
    }, GRACE_PERIOD_MS);
  }, []);

  const reset = useCallback(() => {
    if (graceTimeoutRef.current) {
      clearTimeout(graceTimeoutRef.current);
      graceTimeoutRef.current = null;
    }
    
    setIsComposing(false);
    setIsShortcutsBlocked(false);
    setCompositionData('');
  }, []);

  const getCompositionProps = useCallback((): CompositionEventHandlers => ({
    onCompositionStart: handleCompositionStart,
    onCompositionUpdate: handleCompositionUpdate,
    onCompositionEnd: handleCompositionEnd,
  }), [handleCompositionStart, handleCompositionUpdate, handleCompositionEnd]);

  return {
    isComposing,
    isShortcutsBlocked,
    compositionData,
    handleCompositionStart,
    handleCompositionUpdate,
    handleCompositionEnd,
    getCompositionProps,
    reset,
  };
};