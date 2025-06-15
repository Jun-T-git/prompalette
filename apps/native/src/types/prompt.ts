export interface Prompt {
  id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreatePromptRequest {
  title: string
  content: string
  category?: string
  tags?: string[]
}

export interface UpdatePromptRequest extends Partial<CreatePromptRequest> {
  id: string
}

export interface SearchQuery {
  q?: string
  category?: string
  tags?: string[]
  limit?: number
  offset?: number
}

export interface SearchResult {
  prompts: Prompt[]
  total: number
  hasMore: boolean
}