import type { Prompt } from '../../types/prompt';

import type { SearchResult, SearchConfig, ParsedSearchQuery } from './types';

const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  scores: {
    quickAccessMatch: 1000,
    exactTagMatch: 100,
    titleMatch: 50,
    contentMatch: 10,
    fuzzyTitleMatch: 25,
    fuzzyContentMatch: 5,
  },
};

export function scoreSearchResults(
  prompts: Prompt[],
  query: ParsedSearchQuery,
  config: SearchConfig = DEFAULT_SEARCH_CONFIG
): SearchResult<Prompt>[] {
  if (!query.quickAccessKey && query.tags.length === 0 && query.textTerms.length === 0) {
    return [];
  }

  const results: SearchResult<Prompt>[] = [];

  for (const prompt of prompts) {
    const matchResult = scorePromptMatch(prompt, query, config);
    if (matchResult) {
      results.push(matchResult);
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function scorePromptMatch(
  prompt: Prompt,
  query: ParsedSearchQuery,
  config: SearchConfig
): SearchResult<Prompt> | null {
  let totalScore = 0;
  const matchedTerms: string[] = [];
  let primaryMatchType: SearchResult<Prompt>['matchType'] = 'content';
  let hasQuickAccessMatch = false;
  let hasTagMatch = false;
  let hasTextMatch = false;

  // Quick access key matching (highest priority)
  if (query.quickAccessKey) {
    if (prompt.quickAccessKey?.toLowerCase() === query.quickAccessKey.toLowerCase()) {
      totalScore += config.scores.quickAccessMatch;
      matchedTerms.push(query.quickAccessKey);
      primaryMatchType = 'quickAccess';
      hasQuickAccessMatch = true;
    } else {
      // If quick access key is specified but doesn't match, this prompt doesn't qualify
      return null;
    }
  }

  // Tag matching
  if (query.tags.length > 0) {
    const promptTags = (prompt.tags || []).map(tag => tag.toLowerCase());
    const queryTags = query.tags.map(tag => tag.toLowerCase());
    
    // All tags must match (AND logic)
    let tagMatches = 0;
    for (const queryTag of queryTags) {
      if (promptTags.includes(queryTag)) {
        totalScore += config.scores.exactTagMatch;
        const originalTag = query.tags[queryTags.indexOf(queryTag)];
        if (originalTag) {
          matchedTerms.push(originalTag);
        }
        tagMatches++;
      }
    }
    
    if (tagMatches === queryTags.length) {
      hasTagMatch = true;
      if (!hasQuickAccessMatch) {
        primaryMatchType = 'tag';
      }
    } else {
      // If not all tags match, this prompt doesn't qualify (strict AND logic)
      return null;
    }
  }

  // Text term matching
  if (query.textTerms.length > 0) {
    let textMatches = 0;
    let hasTitleMatch = false;
    
    for (const term of query.textTerms) {
      const termLower = term.toLowerCase();
      const titleLower = prompt.title?.toLowerCase() ?? '';
      const contentLower = prompt.content.toLowerCase();
      const quickAccessKeyLower = prompt.quickAccessKey?.toLowerCase() || '';
      const tagsLower = (prompt.tags || []).map(tag => tag.toLowerCase());
      
      let termMatched = false;
      
      // Check quick access key match (highest priority for text search)
      if (quickAccessKeyLower.includes(termLower)) {
        totalScore += config.scores.titleMatch; // Same priority as title
        matchedTerms.push(term);
        termMatched = true;
        hasTitleMatch = true; // Treat as high priority match
      }
      // Check tag match
      else if (tagsLower.some(tag => tag.includes(termLower))) {
        totalScore += config.scores.titleMatch; // Same priority as title
        matchedTerms.push(term);
        termMatched = true;
        hasTitleMatch = true; // Treat as high priority match
      }
      // Check title match (only if title exists)
      else if (prompt.title && titleLower.includes(termLower)) {
        totalScore += config.scores.titleMatch;
        matchedTerms.push(term);
        termMatched = true;
        hasTitleMatch = true;
      }
      // Check content match (lowest priority)
      else if (contentLower.includes(termLower)) {
        totalScore += config.scores.contentMatch;
        matchedTerms.push(term);
        termMatched = true;
      }
      
      if (termMatched) {
        textMatches++;
      }
    }
    
    if (textMatches === query.textTerms.length) {
      hasTextMatch = true;
      if (!hasQuickAccessMatch && !hasTagMatch) {
        primaryMatchType = hasTitleMatch ? 'title' : 'content';
      }
    } else {
      // If not all text terms match, this prompt doesn't qualify (strict AND logic)
      return null;
    }
  }

  // Only return results if there's at least one match
  if (totalScore === 0) {
    return null;
  }

  // Determine final match type
  let finalMatchType: SearchResult<Prompt>['matchType'] = primaryMatchType;
  if (hasQuickAccessMatch && (hasTagMatch || hasTextMatch)) {
    finalMatchType = 'mixed';
  } else if (hasTagMatch && hasTextMatch && !hasQuickAccessMatch) {
    finalMatchType = 'mixed';
  }

  return {
    item: prompt,
    score: totalScore,
    matchType: finalMatchType,
    matchedTerms: [...new Set(matchedTerms)], // Remove duplicates
  };
}