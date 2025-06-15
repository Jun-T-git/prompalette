import type { Prompt, CreatePromptRequest, UpdatePromptRequest, SearchQuery, SearchResult } from '../types'
import { logger } from '../utils'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_KEY = import.meta.env.VITE_API_KEY

if (!API_KEY) {
  throw new Error('VITE_API_KEY environment variable is required')
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = new ApiError(response.status, `API Error: ${response.statusText}`)
    logger.error('API request failed:', { url, status: response.status, statusText: response.statusText })
    throw error
  }

  return response.json()
}

export const promptsApi = {
  async getAll(): Promise<Prompt[]> {
    return apiRequest<Prompt[]>('/api/prompts')
  },

  async getById(id: string): Promise<Prompt> {
    return apiRequest<Prompt>(`/api/prompts/${id}`)
  },

  async create(request: CreatePromptRequest): Promise<Prompt> {
    return apiRequest<Prompt>('/api/prompts', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  async update(request: UpdatePromptRequest): Promise<Prompt> {
    return apiRequest<Prompt>(`/api/prompts/${request.id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    })
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/prompts/${id}`, {
      method: 'DELETE',
    })
  },

  async search(query: SearchQuery): Promise<SearchResult> {
    const params = new URLSearchParams()
    if (query.q) params.append('q', query.q)
    if (query.category) params.append('category', query.category)
    if (query.tags?.length) params.append('tags', query.tags.join(','))
    if (query.limit) params.append('limit', query.limit.toString())
    if (query.offset) params.append('offset', query.offset.toString())

    const endpoint = params.toString() 
      ? `/api/prompts/search?${params.toString()}`
      : '/api/prompts/search'
    
    return apiRequest<SearchResult>(endpoint)
  },
}

export const healthApi = {
  async check(): Promise<{ status: string; timestamp: string }> {
    return apiRequest('/health')
  },
}