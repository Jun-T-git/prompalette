/**
 * Mock API for E2E testing
 * Provides in-memory data for testing UI components
 */

import type { 
  Prompt, 
  CreatePromptRequest, 
  UpdatePromptRequest, 
  SearchQuery,
  PinnedPrompt,
  PinPromptRequest,
  UnpinPromptRequest,
  CopyPinnedPromptRequest
} from '../types'

// Mock data for testing
const mockPrompts: Prompt[] = [
  {
    id: '1',
    title: 'Test Prompt 1',
    content: 'This is a test prompt for E2E testing.',
    tags: ['test', 'e2e'],
    quickAccessKey: 'test1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Test Prompt 2',
    content: 'Another test prompt for keyboard navigation testing.',
    tags: ['test', 'navigation'],
    quickAccessKey: 'test2',
    created_at: '2024-01-01T01:00:00Z',
    updated_at: '2024-01-01T01:00:00Z',
  },
  {
    id: '3',
    title: 'Sample Code Review',
    content: 'Please review this code for best practices and potential improvements.',
    tags: ['code', 'review'],
    quickAccessKey: 'review',
    created_at: '2024-01-01T02:00:00Z',
    updated_at: '2024-01-01T02:00:00Z',
  },
  {
    id: '4',
    title: 'ブログ記事作成',
    content: '以下のトピックについて、SEOに最適化されたブログ記事を1000文字程度で作成してください。読者が興味を持つような導入部と具体的な例を含めてください。',
    tags: ['ブログ', 'SEO', 'ライティング'],
    quickAccessKey: 'blog',
    created_at: '2024-01-01T03:00:00Z',
    updated_at: '2024-01-01T03:00:00Z',
  },
  {
    id: '5',
    title: 'コードリファクタリング',
    content: '以下のコードをよりクリーンで保守しやすい形にリファクタリングしてください。具体的な改善点も説明してください。',
    tags: ['リファクタリング', 'コード改善', 'プログラミング'],
    quickAccessKey: 'refactor',
    created_at: '2024-01-01T04:00:00Z',
    updated_at: '2024-01-01T04:00:00Z',
  },
  {
    id: '6',
    title: 'メール返信テンプレート',
    content: '以下の内容について、丁寧で簡潔なビジネスメールの返信を作成してください。相手の気持ちを配慮した内容にしてください。',
    tags: ['メール', 'ビジネス', 'コミュニケーション'],
    quickAccessKey: 'mail',
    created_at: '2024-01-01T05:00:00Z',
    updated_at: '2024-01-01T05:00:00Z',
  },
  {
    id: '7',
    title: 'プレゼン資料作成',
    content: '以下のテーマについて、15分のプレゼンテーション用のスライド構成を作成してください。各スライドのタイトルと要点を含めてください。',
    tags: ['プレゼン', '資料作成', 'スライド'],
    quickAccessKey: 'slide',
    created_at: '2024-01-01T06:00:00Z',
    updated_at: '2024-01-01T06:00:00Z',
  },
  {
    id: '8',
    title: 'データ分析レポート',
    content: '以下のデータセットを分析し、主要な傾向と洞察をまとめたレポートを作成してください。グラフや表を使って視覚的に分かりやすく説明してください。',
    tags: ['データ分析', 'レポート', '統計'],
    quickAccessKey: 'data',
    created_at: '2024-01-01T07:00:00Z',
    updated_at: '2024-01-01T07:00:00Z',
  },
  {
    id: '9',
    title: '英語翻訳',
    content: '以下の日本語の文章を自然で正確な英語に翻訳してください。ビジネス文書として適切な表現を使用してください。',
    tags: ['翻訳', '英語', 'ビジネス'],
    quickAccessKey: 'trans',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T08:00:00Z',
  },
  {
    id: '10',
    title: 'SNS投稿文作成',
    content: '以下の商品・サービスについて、Twitter/X用の魅力的な投稿文を作成してください。ハッシュタグも含めて280文字以内でお願いします。',
    tags: ['SNS', 'マーケティング', 'Twitter'],
    quickAccessKey: 'sns',
    created_at: '2024-01-01T09:00:00Z',
    updated_at: '2024-01-01T09:00:00Z',
  },
  {
    id: '11',
    title: 'SQL クエリ最適化',
    content: '以下のSQLクエリのパフォーマンスを改善してください。インデックスの提案や構造の改善点も説明してください。',
    tags: ['SQL', 'データベース', '最適化'],
    quickAccessKey: 'sql',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '12',
    title: 'APIドキュメント作成',
    content: '以下のAPIエンドポイントについて、開発者向けの詳細なドキュメントを作成してください。リクエスト例とレスポンス例も含めてください。',
    tags: ['API', 'ドキュメント', '開発'],
    quickAccessKey: 'api',
    created_at: '2024-01-01T11:00:00Z',
    updated_at: '2024-01-01T11:00:00Z',
  },
  {
    id: '13',
    title: 'ユーザーストーリー作成',
    content: '以下の機能について、アジャイル開発で使用するユーザーストーリーを作成してください。受け入れ条件も含めて詳細に記述してください。',
    tags: ['アジャイル', 'ユーザーストーリー', '開発'],
    quickAccessKey: 'story',
    created_at: '2024-01-01T12:00:00Z',
    updated_at: '2024-01-01T12:00:00Z',
  },
  {
    id: '14',
    title: 'React コンポーネント設計',
    content: '以下の要件を満たすReactコンポーネントを設計してください。TypeScriptを使用し、適切なpropsとstateの設計も含めてください。',
    tags: ['React', 'TypeScript', 'フロントエンド'],
    quickAccessKey: 'react',
    created_at: '2024-01-01T13:00:00Z',
    updated_at: '2024-01-01T13:00:00Z',
  },
  {
    id: '15',
    title: 'テストケース作成',
    content: '以下の機能について、包括的なテストケースを作成してください。正常系、異常系、境界値テストを含めてください。',
    tags: ['テスト', 'QA', '品質管理'],
    quickAccessKey: 'test',
    created_at: '2024-01-01T14:00:00Z',
    updated_at: '2024-01-01T14:00:00Z',
  },
  {
    id: '16',
    title: 'UI/UXデザイン提案',
    content: '以下のウェブページ/アプリの画面について、ユーザビリティを向上させるデザイン改善案を提案してください。具体的な理由も説明してください。',
    tags: ['UI', 'UX', 'デザイン'],
    quickAccessKey: 'design',
    created_at: '2024-01-01T15:00:00Z',
    updated_at: '2024-01-01T15:00:00Z',
  },
  {
    id: '17',
    title: 'セキュリティ監査',
    content: '以下のシステム/コードについて、セキュリティの観点から潜在的な脆弱性を分析し、対策案を提示してください。',
    tags: ['セキュリティ', '監査', '脆弱性'],
    quickAccessKey: 'sec',
    created_at: '2024-01-01T16:00:00Z',
    updated_at: '2024-01-01T16:00:00Z',
  },
  {
    id: '18',
    title: '会議議事録作成',
    content: '以下の会議内容から、分かりやすい議事録を作成してください。決定事項、アクションアイテム、次回までの宿題を整理してください。',
    tags: ['議事録', '会議', 'ビジネス'],
    quickAccessKey: 'minutes',
    created_at: '2024-01-01T17:00:00Z',
    updated_at: '2024-01-01T17:00:00Z',
  },
  {
    id: '19',
    title: 'パフォーマンス分析',
    content: '以下のWebサイト/アプリケーションのパフォーマンス問題を分析し、改善提案を行ってください。具体的な数値目標も含めてください。',
    tags: ['パフォーマンス', '最適化', 'Web'],
    quickAccessKey: 'perf',
    created_at: '2024-01-01T18:00:00Z',
    updated_at: '2024-01-01T18:00:00Z',
  },
  {
    id: '20',
    title: 'プロジェクト計画書',
    content: '以下のプロジェクトについて、詳細な計画書を作成してください。スケジュール、リソース、リスク分析を含めてください。',
    tags: ['プロジェクト管理', '計画', 'スケジュール'],
    quickAccessKey: 'plan',
    created_at: '2024-01-01T19:00:00Z',
    updated_at: '2024-01-01T19:00:00Z',
  },
  {
    id: '21',
    title: '顧客サポート対応',
    content: '以下の顧客からの問い合わせに対して、親切で分かりやすい回答を作成してください。問題解決に向けた具体的な手順も含めてください。',
    tags: ['カスタマーサポート', '問い合わせ', '顧客対応'],
    quickAccessKey: 'support',
    created_at: '2024-01-01T20:00:00Z',
    updated_at: '2024-01-01T20:00:00Z',
  },
  {
    id: '22',
    title: '技術調査レポート',
    content: '以下の技術/ツールについて、導入の是非を判断するための調査レポートを作成してください。メリット、デメリット、コストを含めてください。',
    tags: ['技術調査', 'レポート', '評価'],
    quickAccessKey: 'research',
    created_at: '2024-01-01T21:00:00Z',
    updated_at: '2024-01-01T21:00:00Z',
  },
  {
    id: '23',
    title: 'マーケティング戦略',
    content: '以下の商品/サービスについて、ターゲット顧客に効果的にリーチするマーケティング戦略を提案してください。チャネルと予算も考慮してください。',
    tags: ['マーケティング', '戦略', 'ターゲティング'],
    quickAccessKey: 'marketing',
    created_at: '2024-01-01T22:00:00Z',
    updated_at: '2024-01-01T22:00:00Z',
  },
  {
    id: '24',
    title: 'コードレビューチェックリスト',
    content: '以下のプログラミング言語/フレームワークでのコードレビュー時にチェックすべき項目のリストを作成してください。具体的な例も含めてください。',
    tags: ['コードレビュー', 'チェックリスト', 'ベストプラクティス'],
    quickAccessKey: 'checklist',
    created_at: '2024-01-01T23:00:00Z',
    updated_at: '2024-01-01T23:00:00Z',
  },
  {
    id: '25',
    title: '学習計画作成',
    content: '以下のスキル/技術を習得するための効率的な学習計画を作成してください。目標設定、学習リソース、進捗確認方法を含めてください。',
    tags: ['学習', 'スキルアップ', '計画'],
    quickAccessKey: 'learn',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  }
]

let mockPinnedPrompts: PinnedPrompt[] = [
  {
    id: mockPrompts[0]!.id,
    title: mockPrompts[0]!.title,
    content: mockPrompts[0]!.content,
    tags: mockPrompts[0]!.tags,
    quickAccessKey: mockPrompts[0]!.quickAccessKey,
    created_at: mockPrompts[0]!.created_at,
    updated_at: mockPrompts[0]!.updated_at,
    position: 1,
    pinned_at: '2024-01-01T00:00:00Z',
  }
]

export const mockPromptsApi = {
  async getAll(): Promise<Prompt[]> {
    await new Promise(resolve => setTimeout(resolve, 100)) // Simulate API delay
    return [...mockPrompts]
  },

  async getById(id: string): Promise<Prompt | null> {
    await new Promise(resolve => setTimeout(resolve, 50))
    return mockPrompts.find(p => p.id === id) || null
  },

  async create(request: CreatePromptRequest): Promise<Prompt> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      title: request.title ?? null,
      content: request.content,
      tags: request.tags,
      quickAccessKey: request.quickAccessKey,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockPrompts.push(newPrompt)
    return newPrompt
  },

  async update(request: UpdatePromptRequest): Promise<Prompt | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = mockPrompts.findIndex(p => p.id === request.id)
    if (index === -1) return null
    
    const updatedPrompt: Prompt = {
      ...mockPrompts[index]!,
      title: request.title!,
      content: request.content!,
      tags: request.tags,
      quickAccessKey: request.quickAccessKey,
      updated_at: new Date().toISOString(),
    }
    mockPrompts[index] = updatedPrompt
    return updatedPrompt
  },

  async delete(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const index = mockPrompts.findIndex(p => p.id === id)
    if (index === -1) return false
    
    mockPrompts.splice(index, 1)
    // Also remove from pinned if it was pinned
    mockPinnedPrompts = mockPinnedPrompts.filter(p => p.id !== id)
    return true
  },

  async search(query: SearchQuery): Promise<Prompt[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    if (!query.q) return [...mockPrompts]
    
    const searchTerm = query.q.toLowerCase()
    return mockPrompts.filter(prompt => 
      (prompt.title?.toLowerCase().includes(searchTerm)) ||
      prompt.content.toLowerCase().includes(searchTerm) ||
      prompt.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      (prompt.quickAccessKey && searchTerm.startsWith('/') && 
        prompt.quickAccessKey.toLowerCase().includes(searchTerm.slice(1)))
    )
  },
}

export const mockPinnedPromptsApi = {
  async pin(request: PinPromptRequest): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const prompt = mockPrompts.find(p => p.id === request.prompt_id)
    if (!prompt) throw new Error('Prompt not found')
    
    // Remove from current position if already pinned
    mockPinnedPrompts = mockPinnedPrompts.filter(p => p.id !== request.prompt_id)
    
    // Add to new position
    const pinnedPrompt: PinnedPrompt = {
      ...prompt,
      position: request.position,
      pinned_at: new Date().toISOString(),
    }
    mockPinnedPrompts.push(pinnedPrompt)
    
    return 'Prompt pinned successfully'
  },

  async unpin(request: UnpinPromptRequest): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100))
    mockPinnedPrompts = mockPinnedPrompts.filter(p => p.position !== request.position)
    return 'Prompt unpinned successfully'
  },

  async getAll(): Promise<PinnedPrompt[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return [...mockPinnedPrompts].sort((a, b) => a.position - b.position)
  },

  async copyToClipboard(request: CopyPinnedPromptRequest): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 50))
    const pinnedPrompt = mockPinnedPrompts.find(p => p.position === request.position)
    if (!pinnedPrompt) throw new Error('Pinned prompt not found')
    
    // Mock clipboard operation
    return `Copied "${pinnedPrompt.title}" to clipboard`
  },
}

export const mockHealthApi = {
  async getAppInfo(): Promise<{ name: string; version: string; description: string }> {
    await new Promise(resolve => setTimeout(resolve, 50))
    return {
      name: 'PromPalette (E2E Test Mode)',
      version: '0.1.0-e2e',
      description: 'Mock API for E2E testing'
    }
  },

  async initDatabase(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return 'Mock database initialized'
  },
}