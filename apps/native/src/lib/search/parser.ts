import type { ParsedSearchQuery } from './types';

export function parseSearchQuery(query: string): ParsedSearchQuery {
  if (!query || typeof query !== 'string') {
    return {
      quickAccessKey: undefined,
      tags: [],
      textTerms: [],
      originalQuery: query || ''
    };
  }

  let remainingQuery = query.trim();
  let quickAccessKey: string | undefined;
  const tags: string[] = [];
  
  // Parse quick access key (only the first one found)
  const quickAccessPattern = /\/([a-zA-Z0-9]+)\b/;
  const quickAccessMatch = remainingQuery.match(quickAccessPattern);
  if (quickAccessMatch && quickAccessMatch[1]) {
    quickAccessKey = quickAccessMatch[1];
    remainingQuery = remainingQuery.replace(quickAccessMatch[0], '').trim();
  }
  
  // Parse all tags
  const tagPattern = /#([a-zA-Z0-9_\-\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)/g;
  let tagMatch;
  while ((tagMatch = tagPattern.exec(remainingQuery)) !== null) {
    if (tagMatch[1] && tagMatch[1].length > 0) {
      tags.push(tagMatch[1]);
    }
  }
  
  // Remove all tag patterns from remaining query
  remainingQuery = remainingQuery.replace(/#([a-zA-Z0-9_\-\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)/g, '').trim();
  
  // Parse remaining text terms
  const textTerms = remainingQuery
    .split(/\s+/)
    .filter(term => term.length > 0);
  
  return {
    quickAccessKey,
    tags,
    textTerms,
    originalQuery: query
  };
}