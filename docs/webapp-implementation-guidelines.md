# PromPalette Web App - 実装ガイドライン

**📅 策定日**: 2025-01-15  
**🎯 対象**: PromPalette Web App MVP開発チーム  
**📋 目的**: 一貫性のある高品質な実装を保証するための開発指針

---

## 🎨 デザイン原則

### **1. Desktop体験完全統一**
- Visual hierarchy 100%一致
- インタラクションパターンの統一
- 同一UI/UXコンポーネントライブラリ使用
- レスポンシブでもDesktop感覚を維持

### **2. 公開ファースト設計**
- プロンプトはデフォルト公開
- 発見しやすさを最優先
- 共有・コピーを前面に配置
- コミュニティ感を重視

### **3. パフォーマンス最優先**
- 検索レスポンス < 300ms
- ページロード < 2秒
- コンポーネント遅延読み込み
- 画像最適化必須

### **4. アクセシビリティ標準**
- WCAG 2.1 AA準拠
- キーボード操作対応
- スクリーンリーダー対応
- セマンティックHTML使用

---

## 🏗️ アーキテクチャ設計

### **Desktop-Web共通リソース管理**

```typescript
// ==========================================
// 共通パッケージ戦略
// ==========================================

// 1. 共通型定義パッケージ
@prompalette/types/
├── src/
│   ├── user.ts              # User, UserStats等
│   ├── prompt.ts            # Prompt, CreatePromptRequest等
│   ├── auth.ts              # AuthSession, AuthProvider等
│   ├── sync.ts              # SyncSession, SyncData等
│   ├── api.ts               # ApiResponse, ApiError等
│   └── index.ts             # 全てをexport
├── package.json
└── tsconfig.json

// 2. 共通ユーティリティパッケージ
@prompalette/utils/
├── src/
│   ├── validation/          # バリデーション関数
│   │   ├── prompt.ts        # プロンプト検証
│   │   ├── user.ts          # ユーザー検証
│   │   └── auth.ts          # 認証検証
│   ├── format/              # フォーマット関数
│   │   ├── date.ts          # 日時フォーマット
│   │   ├── text.ts          # テキスト処理
│   │   └── slug.ts          # スラッグ生成
│   ├── constants/           # 共通定数
│   │   ├── limits.ts        # 文字数制限等
│   │   ├── regex.ts         # 正規表現
│   │   └── config.ts        # 設定値
│   └── index.ts
├── package.json
└── tsconfig.json

// 3. 共通ビジネスロジックパッケージ
@prompalette/core/
├── src/
│   ├── prompt/              # プロンプト関連ロジック
│   │   ├── search.ts        # 検索ロジック
│   │   ├── filter.ts        # フィルタリング
│   │   └── transform.ts     # データ変換
│   ├── sync/                # 同期ロジック
│   │   ├── conflict.ts      # 競合解決
│   │   ├── merge.ts         # データマージ
│   │   └── diff.ts          # 差分検出
│   ├── auth/                # 認証ロジック
│   │   ├── session.ts       # セッション管理
│   │   └── permissions.ts   # 権限チェック
│   └── index.ts
├── package.json
└── tsconfig.json

// ==========================================
// プロジェクト構造での利用
// ==========================================

// WebApp側でのインポート
import { User, Prompt, CreatePromptRequest } from '@prompalette/types';
import { validatePrompt, formatDate, slugify } from '@prompalette/utils';
import { searchPrompts, resolveConflict } from '@prompalette/core';

// Desktop側でも同じインポート
import { User, Prompt } from '@prompalette/types';
import { validatePrompt, formatDate } from '@prompalette/utils';
import { searchPrompts } from '@prompalette/core';
```

### **技術スタック (確定)**

```typescript
// Core Framework
Next.js 14+ (App Router)
React 18+
TypeScript 5+

// Styling & UI
Tailwind CSS 3.4+
Headless UI / Radix UI
CSS Modules (必要時のみ)

// State Management
React Context + useReducer (グローバル状態)
SWR (サーバー状態管理)
useState + useEffect (ローカル状態)

// Database & API
Supabase (PostgreSQL + Auth)
NextAuth.js v5 (認証)
tRPC (型安全API) - 検討中

// Development
ESLint + Prettier
Husky + lint-staged
Jest + Testing Library
Playwright (E2E)
```

### **アーキテクチャパターン**

```
prompt-palette-webapp/
├── src/
│   ├── app/                     # Next.js App Router
│   ├── components/             # UIコンポーネント
│   ├── hooks/                  # カスタムフック
│   ├── lib/                    # Web固有ユーティリティ
│   └── styles/                 # スタイル関連
├── packages/                   # 共通パッケージ (monorepo)
│   ├── types/                  # @prompalette/types
│   ├── utils/                  # @prompalette/utils  
│   └── core/                   # @prompalette/core
├── package.json
├── tsconfig.json
└── ...

// 共通パッケージの管理方針
1. monorepo構成でDesktop-Web間でパッケージ共有
2. 型定義・ユーティリティ・ビジネスロジックを分離
3. Web固有の実装のみsrc/以下に配置
4. 段階的にパッケージ化（初期は単一リポジトリでもOK）
```

### **関数コンポーネント原則**

```typescript
// ==========================================
// 🚫 クラスコンポーネント禁止
// ==========================================

// ❌ 使用禁止: クラスコンポーネント
class PromptCard extends Component<PromptCardProps> {
  render() {
    return <div>...</div>;
  }
}

// ❌ 使用禁止: Error Boundary以外でのクラス
class DataFetcher extends Component { }

// ==========================================
// ✅ 関数コンポーネント必須
// ==========================================

// ✅ 基本的な関数コンポーネント
const PromptCard: React.FC<PromptCardProps> = ({ prompt, onCopy }) => {
  return (
    <div className="prompt-card">
      {/* JSX */}
    </div>
  );
};

// ✅ フック活用でstate管理
const PromptList: React.FC<PromptListProps> = ({ prompts }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // 副作用処理
  }, []);
  
  return <div>{/* JSX */}</div>;
};

// ✅ カスタムフックでロジック分離
const usePromptOperations = (prompt: Prompt) => {
  const [copying, setCopying] = useState(false);
  
  const copyToClipboard = useCallback(async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(prompt.content);
    } finally {
      setCopying(false);
    }
  }, [prompt.content]);
  
  return { copying, copyToClipboard };
};

// ✅ Error Boundaryのみクラスコンポーネント例外
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ==========================================
// ✅ 推奨パターン
// ==========================================

// 1. React.FC使用で型安全性確保
const Component: React.FC<Props> = (props) => { };

// 2. 関数宣言でもOK
function Component(props: Props) { }

// 3. constアロー関数（推奨）
const Component = (props: Props) => { };

// 4. propsの分割代入推奨
const Component = ({ title, content, onAction }: Props) => { };

// 5. defaultProps代わりのデフォルト引数
const Component = ({ 
  title = 'Default Title', 
  variant = 'primary' 
}: Props) => { };
```

---

## 📦 コンポーネント分割方針

### **1. Atomic Design適用**

```typescript
// 1. Atoms (最小要素)
// Button, Input, Icon, Badge, Avatar
<Button variant="primary" size="md">
  保存
</Button>

// 2. Molecules (原子の組み合わせ)  
// SearchBar, PromptCard, UserInfo
<SearchBar 
  placeholder="プロンプトを検索..."
  onSearch={handleSearch}
/>

// 3. Organisms (分子の組み合わせ)
// Header, PromptList, UserProfile
<PromptList 
  prompts={prompts}
  loading={loading}
  onPromptClick={handlePromptClick}
/>

// 4. Templates (ページレイアウト)
// DashboardTemplate, ProfileTemplate
<DashboardTemplate>
  <PromptList />
</DashboardTemplate>

// 5. Pages (完成ページ)
// /dashboard, /[username]/prompts
```

### **2. Feature-based分割**

```typescript
components/
├── ui/                     # 汎用UIコンポーネント
│   ├── Button/
│   ├── Input/
│   ├── Modal/
│   └── ...
├── features/               # 機能別コンポーネント
│   ├── auth/
│   │   ├── LoginForm/
│   │   ├── SignupForm/
│   │   └── OAuthButton/
│   ├── prompts/
│   │   ├── PromptCard/
│   │   ├── PromptEditor/
│   │   ├── PromptSearch/
│   │   └── PromptList/
│   ├── profile/
│   │   ├── UserAvatar/
│   │   ├── UserStats/
│   │   └── ProfileHeader/
│   └── explore/
│       ├── TrendingPrompts/
│       ├── PopularTags/
│       └── UserDiscover/
└── layouts/                # レイアウト
    ├── AppLayout/
    ├── AuthLayout/
    └── ProfileLayout/
```

### **3. コンポーネント設計ルール**

```typescript
// ✅ Good: 単一責任原則
interface PromptCardProps {
  prompt: Prompt;
  variant?: 'default' | 'compact' | 'detailed';
  onCopy?: (content: string) => void;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

// ❌ Bad: 責任が多すぎる
interface PromptManagementProps {
  prompts: Prompt[];
  users: User[];
  searchQuery: string;
  sortOrder: string;
  filters: FilterState;
  onSearch: (query: string) => void;
  onSort: (order: string) => void;
  onFilter: (filters: FilterState) => void;
  onPromptCreate: (prompt: CreatePromptData) => void;
  onPromptUpdate: (id: string, data: UpdatePromptData) => void;
  onPromptDelete: (id: string) => void;
}
```

---

## 📝 コーディング規約

### **1. TypeScript規約**

```typescript
// ✅ 型定義は明示的に
interface User {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly createdAt: Date;
}

// ✅ Unionタイプで状態管理
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ✅ Genericsで再利用性向上
interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    hasNext: boolean;
  };
}

// ❌ any禁止
const fetchData = async (): Promise<any> => { }  // NG

// ✅ 適切な型指定
const fetchPrompts = async (): Promise<ApiResponse<Prompt[]>> => { }
```

### **2. コンポーネント規約**

```typescript
// ✅ 関数コンポーネント + TypeScript
interface PromptCardProps {
  prompt: Prompt;
  onCopy?: (content: string) => void;
  className?: string;
}

export const PromptCard: React.FC<PromptCardProps> = ({ 
  prompt, 
  onCopy,
  className 
}) => {
  // ✅ フック使用順序統一
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ useEffectは機能別に分離
  useEffect(() => {
    // 初期化処理
  }, []);
  
  useEffect(() => {
    // プロンプト変更時の処理
  }, [prompt.id]);
  
  // ✅ イベントハンドラーは handle* プレフィックス
  const handleCopyClick = useCallback(async () => {
    setIsLoading(true);
    try {
      await navigator.clipboard.writeText(prompt.content);
      onCopy?.(prompt.content);
    } catch (err) {
      setError('コピーに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [prompt.content, onCopy]);
  
  return (
    <div className={cn('prompt-card', className)}>
      {/* JSX */}
    </div>
  );
};
```

### **3. ファイル命名規約**

```typescript
// ✅ ファイル名規約
components/
├── ui/
│   ├── Button/
│   │   ├── index.ts          // export文のみ
│   │   ├── Button.tsx        // メインコンポーネント
│   │   ├── Button.test.tsx   // テストファイル
│   │   ├── Button.stories.tsx // Storybookファイル
│   │   └── Button.module.css // CSS Modules (必要時)
│   └── ...
├── features/
│   ├── prompts/
│   │   ├── PromptCard/
│   │   │   ├── index.ts
│   │   │   ├── PromptCard.tsx
│   │   │   └── PromptCard.test.tsx
│   │   └── ...
└── ...

// ✅ インポート順序
import React from 'react';                    // 1. React
import { NextPage } from 'next';              // 2. Next.js
import { useRouter } from 'next/router';      // 3. Next.js hooks
import { useState, useEffect } from 'react';  // 4. React hooks
import { cn } from '@/lib/utils';             // 5. 内部ライブラリ
import { Button } from '@/components/ui';     // 6. 内部コンポーネント
import { Prompt } from '@/types';             // 7. 型定義
import './Component.css';                     // 8. CSS (最後)
```

---

## 🔧 型定義ルール

### **1. Desktop-Web共通型定義戦略**

```typescript
// ==========================================
// 共通型パッケージ (@prompalette/types)
// ==========================================

// packages/types/src/user.ts
export interface User {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UserStats {
  readonly promptCount: number;
  readonly totalViews: number;
  readonly totalCopies: number;
  readonly joinedAt: Date;
}

// packages/types/src/prompt.ts
export interface Prompt {
  readonly id: string;
  readonly userId: string;
  readonly title: string | null;
  readonly content: string;
  readonly tags: readonly string[];
  readonly quickAccessKey: string | null;
  readonly isPublic: boolean;
  readonly visibility: 'public' | 'private' | 'unlisted';
  readonly viewCount: number;
  readonly copyCount: number;
  readonly publishedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  // リレーション (Web側のみ)
  readonly user?: User;
}

// packages/types/src/api.ts - 共通API型
export interface CreatePromptRequest {
  title?: string;
  content: string;
  tags?: string[];
  quickAccessKey?: string;
  isPublic?: boolean;
  visibility?: 'public' | 'private' | 'unlisted';
}

export interface UpdatePromptRequest extends Partial<CreatePromptRequest> {
  readonly id: string;
}

export interface ApiResponse<T = any> {
  data: T;
  meta?: {
    total: number;
    page: number;
    hasNext: boolean;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

// packages/types/src/sync.ts - Desktop-Web同期型
export interface SyncData {
  prompts: Prompt[];
  lastSyncAt: Date;
  conflictCount: number;
}

export interface SyncSession {
  readonly id: string;
  readonly userId: string;
  readonly deviceType: 'desktop' | 'web';
  readonly lastSync: Date;
  readonly syncCount: number;
}

// ==========================================
// Web固有型定義 (src/types/)
// ==========================================

// src/types/components.ts - コンポーネント固有型
export interface PromptCardProps {
  prompt: Prompt;                    // 共通型を利用
  variant?: 'default' | 'compact';
  onCopy?: (content: string) => void;
  onEdit?: (prompt: Prompt) => void;
  className?: string;
}

export interface SearchFilters {
  scope: 'all' | 'mine' | 'public';
  tags: string[];
  sortBy: 'relevance' | 'created_at' | 'popularity';
}

// src/types/hooks.ts - フック専用型
export interface UsePromptsState {
  prompts: Prompt[];               // 共通型を利用
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    total: number;
    hasNext: boolean;
  };
}

// ==========================================
// 型の使い分けルール
// ==========================================

/**
 * 1. 共通型 (@prompalette/types)
 *    - Desktop-Web間で共有するデータモデル
 *    - API リクエスト/レスポンス型
 *    - ビジネスロジック型
 *    - 同期関連型
 * 
 * 2. Web固有型 (src/types/)
 *    - UIコンポーネントのProps型
 *    - フック専用型
 *    - Web固有の状態管理型
 *    - ブラウザAPI関連型
 * 
 * 3. インポート規約
 *    - 共通型: import { User, Prompt } from '@prompalette/types';
 *    - Web固有型: import { PromptCardProps } from '@/types';
 */
```

### **2. 型定義ベストプラクティス**

### **2. 状態管理型定義**

```typescript
// hooks/usePrompts.ts
interface PromptsState {
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    total: number;
    hasNext: boolean;
  };
}

type PromptsAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { prompts: Prompt[]; pagination: any } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_PROMPT'; payload: Prompt }
  | { type: 'UPDATE_PROMPT'; payload: Prompt }
  | { type: 'DELETE_PROMPT'; payload: string };

// フォーム型定義
interface PromptFormData {
  title: string;
  content: string;
  tags: string[];
  quickAccessKey: string;
  isPublic: boolean;
}

interface PromptFormErrors {
  title?: string;
  content?: string;
  tags?: string;
  quickAccessKey?: string;
}
```

### **3. API型定義**

```typescript
// types/api.ts
export interface ApiResponse<T = any> {
  data: T;
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

// 検索API型定義
export interface SearchPromptsParams {
  q?: string;
  scope?: 'all' | 'mine' | 'public';
  type?: 'title' | 'content' | 'tags' | 'user';
  tags?: string[];
  sort?: 'relevance' | 'created_at' | 'updated_at' | 'popularity';
  page?: number;
  limit?: number;
}

export interface SearchPromptsResponse {
  prompts: Prompt[];
  users: User[];
  tags: Array<{ tag: string; count: number }>;
  pagination: {
    page: number;
    total: number;
    hasNext: boolean;
  };
}
```

---

## 📁 ディレクトリ構成

### **完全なディレクトリ構造**

```
prompt-palette-webapp/
├── README.md
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── .env.local.example
├── .env.local
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── jest.config.js
├── playwright.config.ts
├── public/
│   ├── icons/
│   ├── images/
│   └── favicon.ico
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # 認証グループ
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/             # メインアプリグループ
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── search/
│   │   │   │   └── page.tsx
│   │   │   ├── explore/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── trending/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── tags/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [tag]/
│   │   │   │           └── page.tsx
│   │   │   ├── prompts/
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   └── profile/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── [username]/              # ユーザーページ
│   │   │   ├── page.tsx             # プロフィール概要
│   │   │   ├── prompts/
│   │   │   │   ├── page.tsx         # プロンプト一覧
│   │   │   │   └── [slug]/
│   │   │   │       ├── page.tsx     # プロンプト詳細
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx # プロンプト編集
│   │   │   └── layout.tsx
│   │   ├── api/                     # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── session/
│   │   │   │       └── route.ts
│   │   │   ├── prompts/
│   │   │   │   ├── route.ts         # GET, POST /api/prompts
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── route.ts     # GET, PUT, DELETE /api/prompts/[id]
│   │   │   │   │   ├── copy/
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── view/
│   │   │   │   │       └── route.ts
│   │   │   │   └── search/
│   │   │   │       └── route.ts
│   │   │   ├── explore/
│   │   │   │   ├── trending/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── popular/
│   │   │   │   │   └── route.ts
│   │   │   │   └── tags/
│   │   │   │       └── route.ts
│   │   │   ├── users/
│   │   │   │   └── [username]/
│   │   │   │       └── route.ts
│   │   │   └── sync/
│   │   │       ├── upload/
│   │   │       │   └── route.ts
│   │   │       └── download/
│   │   │           └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx               # ルートレイアウト
│   │   ├── loading.tsx              # グローバルローディング
│   │   ├── error.tsx                # グローバルエラー
│   │   ├── not-found.tsx            # 404ページ
│   │   └── page.tsx                 # ホームページ
│   ├── components/                  # UIコンポーネント
│   │   ├── ui/                      # 基本UIコンポーネント
│   │   │   ├── Button/
│   │   │   │   ├── index.ts
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Button.test.tsx
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   ├── Badge/
│   │   │   ├── Avatar/
│   │   │   ├── Dropdown/
│   │   │   ├── Tooltip/
│   │   │   ├── Toast/
│   │   │   └── index.ts             # すべてをexport
│   │   ├── features/                # 機能別コンポーネント
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm/
│   │   │   │   ├── SignupForm/
│   │   │   │   ├── OAuthButton/
│   │   │   │   └── index.ts
│   │   │   ├── prompts/
│   │   │   │   ├── PromptCard/
│   │   │   │   ├── PromptEditor/
│   │   │   │   ├── PromptSearch/
│   │   │   │   ├── PromptList/
│   │   │   │   ├── PromptFilters/
│   │   │   │   └── index.ts
│   │   │   ├── profile/
│   │   │   │   ├── UserAvatar/
│   │   │   │   ├── UserStats/
│   │   │   │   ├── ProfileHeader/
│   │   │   │   └── index.ts
│   │   │   ├── explore/
│   │   │   │   ├── TrendingPrompts/
│   │   │   │   ├── PopularTags/
│   │   │   │   ├── UserDiscover/
│   │   │   │   └── index.ts
│   │   │   └── navigation/
│   │   │       ├── Header/
│   │   │       ├── Sidebar/
│   │   │       ├── Breadcrumb/
│   │   │       └── index.ts
│   │   ├── layouts/                 # レイアウトコンポーネント
│   │   │   ├── AppLayout/
│   │   │   ├── AuthLayout/
│   │   │   ├── ProfileLayout/
│   │   │   └── index.ts
│   │   └── providers/               # コンテキストプロバイダー
│   │       ├── AuthProvider/
│   │       ├── ThemeProvider/
│   │       ├── ToastProvider/
│   │       └── index.ts
│   ├── hooks/                       # カスタムフック
│   │   ├── useAuth.ts
│   │   ├── usePrompts.ts
│   │   ├── useSearch.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePagination.ts
│   │   └── index.ts
│   ├── lib/                         # ライブラリ・ユーティリティ
│   │   ├── auth/
│   │   │   ├── config.ts
│   │   │   ├── providers.ts
│   │   │   └── utils.ts
│   │   ├── database/
│   │   │   ├── supabase.ts
│   │   │   ├── queries.ts
│   │   │   └── types.ts
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── endpoints.ts
│   │   │   └── types.ts
│   │   ├── utils/
│   │   │   ├── cn.ts                # classname utility
│   │   │   ├── format.ts            # フォーマット関数
│   │   │   ├── validation.ts        # バリデーション
│   │   │   ├── slugify.ts           # スラッグ生成
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   ├── routes.ts
│   │   │   ├── api.ts
│   │   │   ├── config.ts
│   │   │   └── index.ts
│   │   └── validations/             # スキーマバリデーション
│   │       ├── auth.ts
│   │       ├── prompt.ts
│   │       └── index.ts
│   ├── types/                       # 型定義
│   │   ├── index.ts                 # メイン型定義
│   │   ├── api.ts                   # API型定義
│   │   ├── auth.ts                  # 認証型定義
│   │   ├── database.ts              # DB型定義
│   │   └── components.ts            # コンポーネント型定義
│   ├── styles/                      # スタイル
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── utilities.css
│   └── __tests__/                   # テスト
│       ├── __mocks__/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── setup.ts
├── docs/                            # ドキュメント
│   ├── api.md
│   ├── components.md
│   ├── deployment.md
│   └── contributing.md
├── e2e/                             # E2Eテスト
│   ├── auth.spec.ts
│   ├── prompts.spec.ts
│   ├── search.spec.ts
│   └── fixtures/
└── .github/                         # GitHub設定
    ├── workflows/
    │   ├── ci.yml
    │   ├── deploy.yml
    │   └── test.yml
    └── PULL_REQUEST_TEMPLATE.md
```

---

## 🎯 品質基準

### **1. コード品質**

```typescript
// ✅ 必須品質基準
- TypeScript Strict Mode有効
- ESLint/Prettier設定準拠
- 単体テストカバレッジ > 80%
- E2Eテスト主要フロー100%
- Lighthouse Performance > 90
- アクセシビリティスコア > 95

// ✅ コードレビュー基準
- 1つのPRは1つの機能に集中
- テストコードを含む
- 型定義が完全
- ドキュメント更新済み
- 2名以上のレビュー必須
```

### **2. パフォーマンス基準**

```typescript
// ✅ パフォーマンス目標
const PERFORMANCE_TARGETS = {
  // Core Web Vitals
  LCP: '< 2.5s',      // Largest Contentful Paint
  FID: '< 100ms',     // First Input Delay
  CLS: '< 0.1',       // Cumulative Layout Shift
  
  // カスタム指標
  searchResponse: '< 300ms',
  pageLoad: '< 2s',
  apiResponse: '< 500ms',
  
  // Bundle Size
  mainBundle: '< 200KB',
  chunkSize: '< 100KB'
} as const;

// ✅ 最適化手法
- Next.js Image最適化
- 動的import使用
- SWRでキャッシュ活用
- Gzip/Brotli圧縮
- CDN活用
```

### **3. セキュリティ基準**

```typescript
// ✅ セキュリティチェックリスト
const SECURITY_CHECKLIST = [
  // 認証・認可
  '✅ NextAuth.js設定適切',
  '✅ JWT設定セキュア',
  '✅ CSRF対策実装',
  '✅ XSS対策実装',
  
  // データ保護
  '✅ 入力値サニタイズ',
  '✅ SQLインジェクション対策',
  '✅ 秘密情報環境変数化',
  '✅ HTTPS強制',
  
  // API セキュリティ
  '✅ Rate Limiting実装',
  '✅ 適切な権限チェック',
  '✅ 機密データ暗号化',
  '✅ ログ記録適切'
] as const;
```

---

## 🧪 テスト戦略

### **1. テスト分類**

```typescript
// 1. Unit Tests (Jest + Testing Library)
// components/__tests__/PromptCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptCard } from '../PromptCard';

describe('PromptCard', () => {
  const mockPrompt = {
    id: '1',
    title: 'Test Prompt',
    content: 'Test content',
    // ...
  };

  it('should display prompt title and content', () => {
    render(<PromptCard prompt={mockPrompt} />);
    
    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should call onCopy when copy button clicked', async () => {
    const mockOnCopy = jest.fn();
    render(<PromptCard prompt={mockPrompt} onCopy={mockOnCopy} />);
    
    fireEvent.click(screen.getByRole('button', { name: /copy/i }));
    
    expect(mockOnCopy).toHaveBeenCalledWith('Test content');
  });
});

// 2. Integration Tests
// __tests__/api/prompts.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../../app/api/prompts/route';

describe('/api/prompts', () => {
  it('should return prompts list', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('prompts');
  });
});

// 3. E2E Tests (Playwright)
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can login with GitHub', async ({ page }) => {
  await page.goto('/login');
  await page.click('[data-testid="github-login"]');
  
  // GitHub OAuth flow...
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});
```

### **2. テストユーティリティ**

```typescript
// __tests__/utils/test-utils.tsx
import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';

export const TestProvider = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider session={mockSession}>
    <SWRConfig value={{ provider: () => new Map() }}>
      {children}
    </SWRConfig>
  </SessionProvider>
);

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestProvider });
};

// モックデータ
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockPrompt = {
  id: 'prompt-1',
  userId: 'user-1',
  title: 'Test Prompt',
  content: 'This is a test prompt',
  tags: ['test', 'example'],
  quickAccessKey: 'test',
  isPublic: true,
  visibility: 'public' as const,
  viewCount: 0,
  copyCount: 0,
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
};
```

---

## 🚀 開発ワークフロー

### **1. Git ワークフロー**

```bash
# ✅ ブランチ戦略
main              # 本番環境
├── develop       # 開発統合ブランチ
├── feature/*     # 機能開発 (feature/auth-login)
├── bugfix/*      # バグ修正 (bugfix/search-error)
├── hotfix/*      # 緊急修正 (hotfix/security-patch)
└── release/*     # リリース準備 (release/v1.0.0)

# ✅ コミットメッセージ規約
feat: add user authentication with NextAuth.js
fix: resolve search API timeout issue
docs: update API documentation
style: format code with prettier
refactor: extract search logic to custom hook
test: add unit tests for PromptCard component
chore: update dependencies

# ✅ PR テンプレート
## 概要
- 実装した機能の概要

## 変更内容
- [ ] 新機能追加
- [ ] バグ修正
- [ ] リファクタリング
- [ ] ドキュメント更新

## テスト
- [ ] 単体テスト追加/更新
- [ ] E2Eテスト追加/更新
- [ ] 手動テスト完了

## チェックリスト
- [ ] TypeScript エラーなし
- [ ] ESLint/Prettier通過
- [ ] テストカバレッジ維持
- [ ] ドキュメント更新
```

### **2. 開発環境セットアップ**

```bash
# ✅ 必須ツール
Node.js 20+
npm 10+
Git
VSCode (推奨)

# ✅ VSCode拡張機能
- TypeScript Hero
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
- Thunder Client (API testing)

# ✅ 環境構築手順
1. git clone <repository>
2. npm install
3. cp .env.local.example .env.local
4. npm run dev
5. npm run test
```

### **3. リリースフロー**

```bash
# ✅ リリース手順
1. feature/* → develop (PR)
2. develop → release/* (PR)
3. QA・動作確認
4. release/* → main (PR)
5. main → develop (merge back)
6. タグ作成・リリースノート
7. Vercel自動デプロイ

# ✅ 品質ゲート
- すべてのテスト通過
- Lighthouse スコア確認
- セキュリティスキャン通過
- ステークホルダー承認
```

---

## 📚 ドキュメント要件

### **1. コンポーネントドキュメント**

```typescript
/**
 * プロンプトカードコンポーネント
 * 
 * @description プロンプトの情報を表示し、コピー・編集・削除などのアクションを提供
 * @example
 * ```tsx
 * <PromptCard 
 *   prompt={prompt}
 *   onCopy={handleCopy}
 *   onEdit={handleEdit}
 * />
 * ```
 */
interface PromptCardProps {
  /** 表示するプロンプトデータ */
  prompt: Prompt;
  /** 表示バリアント */
  variant?: 'default' | 'compact' | 'detailed';
  /** コピー時のコールバック */
  onCopy?: (content: string) => void;
  /** 編集時のコールバック */
  onEdit?: (prompt: Prompt) => void;
  /** 削除時のコールバック */
  onDelete?: (id: string) => void;
  /** 追加のCSSクラス */
  className?: string;
}
```

### **2. API ドキュメント**

```typescript
/**
 * GET /api/prompts
 * 
 * @description プロンプト一覧を取得
 * @param {SearchPromptsParams} query 検索パラメータ
 * @returns {ApiResponse<Prompt[]>} プロンプト一覧
 * 
 * @example
 * ```ts
 * const response = await fetch('/api/prompts?q=javascript&limit=20');
 * const { data: prompts } = await response.json();
 * ```
 */
```

---

## ⚡ 開発Tips & ベストプラクティス

### **1. パフォーマンス最適化**

```typescript
// ✅ メモ化でレンダリング最適化
const PromptCard = memo<PromptCardProps>(({ prompt, onCopy }) => {
  // コンポーネント実装
});

// ✅ 動的インポートで初期バンドルサイズ削減
const PromptEditor = dynamic(() => import('./PromptEditor'), {
  loading: () => <EditorSkeleton />
});

// ✅ useMemoで重い計算をキャッシュ
const filteredPrompts = useMemo(() => {
  return prompts.filter(prompt => 
    prompt.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [prompts, searchQuery]);

// ✅ useCallbackでイベントハンドラー最適化
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query);
}, []);
```

### **2. エラーハンドリング**

```typescript
// ✅ Error Boundary
export class PromptErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Prompt Error:', error, errorInfo);
    // エラーログ送信
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

// ✅ API エラーハンドリング
const useApiRequest = <T>(fetcher: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  return { data, error, loading, execute };
};
```

### **3. 状態管理ベストプラクティス**

```typescript
// ✅ Context + useReducer パターン
interface AppState {
  user: User | null;
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_PROMPTS'; payload: Prompt[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_PROMPTS':
      return { ...state, prompts: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// ✅ カスタムフックで状態管理を抽象化
export const useAppState = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  const setUser = useCallback((user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);
  
  const setPrompts = useCallback((prompts: Prompt[]) => {
    dispatch({ type: 'SET_PROMPTS', payload: prompts });
  }, []);
  
  return {
    ...state,
    setUser,
    setPrompts,
  };
};
```

---

## 🎯 実装優先順位

### **Phase 1: 基盤実装 (Week 1-2)**
1. ✅ プロジェクトセットアップ・環境構築
2. ✅ 認証システム (NextAuth.js + Supabase)
3. ✅ 基本UIコンポーネント (Button, Input, Card等)
4. ✅ レイアウトシステム (Header, Layout等)

### **Phase 2: コア機能 (Week 3-4)**
1. ✅ プロンプトCRUD機能
2. ✅ 検索システム (@username, #tag対応)
3. ✅ プロフィールページ・プロンプト一覧
4. ✅ 公開プロンプト探索機能

### **Phase 3: 高度機能 (Week 5-6)**
1. ✅ Desktop同期機能
2. ✅ 統計・アナリティクス
3. ✅ パフォーマンス最適化
4. ✅ E2Eテスト整備

### **Phase 4: 品質・リリース (Week 7)**
1. ✅ セキュリティ監査
2. ✅ アクセシビリティ対応
3. ✅ ドキュメント整備
4. ✅ 本番デプロイ・監視設定

---

**📋 チェックリスト**
- [ ] 全開発者がガイドライン理解
- [ ] 開発環境統一完了
- [ ] コード品質ツール設定完了
- [ ] テスト環境構築完了
- [ ] CI/CD パイプライン設定完了

**🎯 成功の鍵**
1. **一貫性**: すべての実装でガイドライン遵守
2. **品質**: テスト・レビューを怠らない
3. **協力**: チーム間のコミュニケーション重視
4. **柔軟性**: 必要に応じてガイドライン改善

**📅 策定日**: 2025-01-15  
**👥 対象**: PromPalette Web App MVP開発チーム全員  
**🔄 更新**: 実装進捗に応じて随時更新