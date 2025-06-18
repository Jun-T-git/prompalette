export interface ParsedSearchQuery {
  quickAccessKey?: string;
  tags: string[];
  textTerms: string[];
  originalQuery: string;
}

export interface SearchResult<T = unknown> {
  item: T;
  score: number;
  matchType: 'quickAccess' | 'tag' | 'title' | 'content' | 'mixed';
  matchedTerms: string[];
}


export interface SearchConfig {
  scores: {
    quickAccessMatch: number;
    exactTagMatch: number;
    titleMatch: number;
    contentMatch: number;
    fuzzyTitleMatch: number;
    fuzzyContentMatch: number;
  };
}