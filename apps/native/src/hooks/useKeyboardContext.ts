import { useState, useRef, useCallback } from 'react';

import type { ContextId, KeyboardContext } from '../types/keyboard.types';

const CONTEXT_PRIORITIES: Record<ContextId, number> = {
  global: 1,
  search: 2,
  list: 2,
  form: 3,
  modal: 4,
};

export const useKeyboardContext = () => {
  const [activeContext, setActiveContext] = useState<ContextId>('global');
  const contextStack = useRef<ContextId[]>([]);

  const pushContext = useCallback((context: ContextId) => {
    // Only push if context is actually changing
    if (context !== activeContext) {
      contextStack.current.push(activeContext);
      setActiveContext(context);
    }
  }, [activeContext]);

  const popContext = useCallback(() => {
    const previous = contextStack.current.pop();
    if (previous) {
      setActiveContext(previous);
    }
  }, []);

  const resetContext = useCallback(() => {
    contextStack.current = [];
    setActiveContext('global');
  }, []);

  const getContextInfo = useCallback((): KeyboardContext => {
    return {
      id: activeContext,
      priority: CONTEXT_PRIORITIES[activeContext],
    };
  }, [activeContext]);

  const isContextActive = useCallback((context: ContextId): boolean => {
    return activeContext === context;
  }, [activeContext]);

  return {
    activeContext,
    pushContext,
    popContext,
    resetContext,
    getContextInfo,
    isContextActive,
  };
};