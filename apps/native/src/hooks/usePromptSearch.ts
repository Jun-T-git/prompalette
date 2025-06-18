import { useMemo } from 'react';

import { parseSearchQuery, scoreSearchResults } from '../lib/search';
import type { SearchResult, ParsedSearchQuery } from '../lib/search/types';
import type { Prompt } from '../types/prompt';

export interface UsePromptSearchResult {
  results: SearchResult<Prompt>[];
  parsedQuery: ParsedSearchQuery;
}

/**
 * Enhanced prompt search custom hook
 * Supports quick access keys (/key), tag search (#tag), and text search with advanced ranking
 */
export function usePromptSearch(prompts: Prompt[], searchQuery: string): UsePromptSearchResult {
  const parsedQuery = useMemo(() => parseSearchQuery(searchQuery), [searchQuery]);
  
  const results = useMemo(() => {
    // If no search query, return all prompts as simple results
    if (!searchQuery || (!parsedQuery.quickAccessKey && parsedQuery.tags.length === 0 && parsedQuery.textTerms.length === 0)) {
      return prompts.map(prompt => ({
        item: prompt,
        score: 0,
        matchType: 'content' as const,
        matchedTerms: [],
      }));
    }
    
    return scoreSearchResults(prompts, parsedQuery);
  }, [prompts, searchQuery, parsedQuery]);
  
  return useMemo(() => ({
    results,
    parsedQuery,
  }), [results, parsedQuery]);
}