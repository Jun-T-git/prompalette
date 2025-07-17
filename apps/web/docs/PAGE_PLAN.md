# PromPalette URL・画面設計書

## 1. URL設計

### 1.1 URL設計方針

#### 1.1.1 基本原則

- **永続性**: 一度公開されたURLは永続的に維持
- **後方互換性**: 機能追加時も既存URLは変更しない
- **SEOフレンドリー**: 検索エンジン最適化を考慮
- **将来拡張性**: 新機能を既存URL構造に自然に追加
- **ユーザビリティ**: 覚えやすく推測しやすいURL

#### 1.1.2 URL永続性戦略

```
❌ 避けるべき変更:
Phase 1: /username/prompt-slug
↓ (URLが変わってしまう - ユーザビリティ悪化)
Phase 2: /username/collection-slug/prompt-slug

✅ 推奨する拡張:
Phase 1: /username/prompt-slug (永続維持)
Phase 2: /username/collection-slug/prompt-slug (新規追加)
       + /username/prompt-slug (既存URL継続サポート)

実装方針:
- 既存URLは永続的にサポート
- 新機能は新しいURL パターンで追加
- 必要に応じてcanonical URL指定
- リダイレクトは最小限に抑制
```

#### 1.1.3 拡張可能なURL設計

```
設計思想: 「追加」による拡張、「変更」は避ける

MVP段階の確定URL:
/username/prompt-slug          ← 永続維持

将来の追加URL（既存と併存）:
/username/collections/collection-slug/prompt-slug
/org/organization-slug/collections/collection-slug/prompt-slug

利点:
- ユーザーの既存ブックマークが無効にならない
- SNSでのシェアURLが永続的に有効
- SEO評価の継続性
- ユーザーの混乱を避ける
```

### 1.2 永続的URL構造（MVP〜全フェーズ共通）

#### 1.2.1 認証関連（変更なし）

```
/auth/signin                    # サインイン画面
/auth/signup                    # サインアップ画面
/auth/forgot-password           # パスワードリセット
/auth/reset-password            # パスワードリセット実行
/auth/callback/google           # OAuth コールバック
/auth/callback/github           # OAuth コールバック
/auth/callback/apple            # OAuth コールバック
```

#### 1.2.2 メイン機能（永続URL）

```
/                              # ホーム（永続）
/explore                       # パブリックプロンプト探索（永続）
/search                        # 検索結果ページ（永続）
/search?q=keyword&tags=tag1,tag2  # 検索クエリ（永続）

/create                        # 新規プロンプト作成（永続）
/settings                      # アカウント設定（永続）
/settings/profile              # プロフィール設定（永続）
/settings/account              # アカウント設定（永続）
/settings/sync                 # デスクトップ同期設定（永続）
```

#### 1.2.3 ユーザー・プロンプト（永続URL）

```
基本構造（MVP〜全フェーズで永続維持）:
/[username]                    # ユーザープロフィール
/[username]/[prompt-slug]      # プロンプト詳細
/[username]/[prompt-slug]/edit # プロンプト編集
/[username]/[prompt-slug]/history # バージョン履歴
/[username]/[prompt-slug]/fork # フォーク作成

例（これらのURLは永続的に維持）:
/tanaka                        # 田中さんのプロフィール
/tanaka/code-review-prompt     # 田中さんのコードレビュープロンプト
/tanaka/code-review-prompt/edit # 編集画面
```

#### 1.2.4 管理・サポート（永続URL）

```
/about                         # サービス説明（永続）
/help                          # ヘルプ・FAQ（永続）
/terms                         # 利用規約（永続）
/privacy                       # プライバシーポリシー（永続）
/contact                       # お問い合わせ（永続）

/download                      # デスクトップアプリダウンロード（永続）
/install                       # インストールガイド（永続）
```

### 1.3 将来機能の追加URL（既存URLと併存）

#### 1.3.1 コレクション機能（Phase 2で追加）

```
新規追加URL（既存URLは維持）:
/[username]/collections                           # コレクション一覧
/[username]/collections/[collection-slug]         # コレクション詳細
/[username]/collections/[collection-slug]/[prompt-slug] # 新しいプロンプト

既存URL維持:
/[username]/[prompt-slug]                         # 既存プロンプトはそのまま

データベース設計での対応:
- プロンプトは「デフォルトコレクション」または「コレクションなし」として扱う
- 既存プロンプトのURLは変更せず、新規作成時のみコレクション選択可能
```

#### 1.3.2 組織機能（Phase 3で追加）

```
新規追加URL:
/org/[org-slug]                                  # 組織プロフィール
/org/[org-slug]/collections/[collection-slug]    # 組織コレクション
/org/[org-slug]/collections/[collection-slug]/[prompt-slug] # 組織プロンプト
/org/[org-slug]/teams/[team-slug]                # チーム
/org/[org-slug]/teams/[team-slug]/collections/[collection-slug] # チームコレクション

個人プロンプトの既存URL:
/[username]/[prompt-slug]                        # 永続維持
```

### 1.4 URL継続性の技術実装

#### 1.4.1 データベース設計での対応例

```sql
-- 既存プロンプトのURL維持
CREATE TABLE prompts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    slug VARCHAR(255) NOT NULL,        -- URL slug
    collection_id UUID,                -- NULL = デフォルト/レガシー
    direct_url_enabled BOOLEAN DEFAULT TRUE, -- /username/slug でのアクセス許可
    UNIQUE(user_id, slug),             -- ユーザー内で一意のslug
    UNIQUE(collection_id, slug)        -- コレクション内で一意（collection_id != NULL時）
);

-- URL解決の優先順位
-- 1. /username/slug （既存プロンプト）
-- 2. /username/collections/collection/slug （新規コレクションプロンプト）
```

#### 1.4.2 URL解決ロジック

```typescript
// URL解決の優先順位（概念例）
async function resolvePromptURL(username: string, slug: string) {
  // 1. 最初に直接URLでの既存プロンプトを検索
  const directPrompt = await findPrompt({
    user: { username },
    slug,
    direct_url_enabled: true,
  });

  if (directPrompt) {
    return directPrompt; // 既存プロンプト
  }

  // 2. コレクション名として解釈を試行
  const collection = await findCollection({
    user: { username },
    slug,
  });

  if (collection) {
    return collection; // コレクション一覧
  }

  // 3. 404
  throw new NotFoundError();
}
```

#### 1.4.3 Canonical URL設定

```html
<!-- 既存プロンプトの場合 -->
<link rel="canonical" href="https://prompalette.com/tanaka/code-review-prompt" />

<!-- 新規コレクションプロンプトでも既存風URLがある場合 -->
<link rel="canonical" href="https://prompalette.com/tanaka/collections/dev-tools/new-prompt" />
```

### 1.7 URL命名規則

#### 1.7.1 スラグ生成ルール

```
プロンプトタイトル → URL slug変換例:
"コードレビュープロンプト" → "code-review-prompt"
"SNS投稿用テンプレート" → "sns-post-template"
"英語学習プロンプト v2" → "english-learning-prompt-v2"

変換ルール:
- 日本語 → ローマ字変換
- スペース → ハイフン
- 特殊文字 → 削除または変換
- 小文字統一
- 重複時は数字追加

重要: slugは作成後変更不可（URL永続性のため）
```

#### 1.7.2 予約語・制限

```
予約済みURL（使用不可のユーザー名）:
- api, www, admin, root, support
- auth, login, signin, signup, logout
- about, help, terms, privacy, contact
- explore, search, create, settings
- org, team, user, app, download
- collections, issues, pulls, insights
```

#### 1.7.3 URL設計まとめ

**✅ 採用する設計（URL永続性重視）**

```
MVP: /username/prompt-slug (永続維持)
Phase 2: + /username/collections/collection/prompt (追加)
Phase 3: + /org/org-name/collections/collection/prompt (追加)

既存URLは絶対に変更しない
新機能は新しいURL名前空間で追加
ユーザーの学習コスト・混乱を最小化
```

**❌ 避ける設計（URL変更リスク）**

```
Phase 1: /username/prompt-slug
↓
Phase 2: /username/collection/prompt-slug (変更)
         ↑ これは絶対に避ける
```

### 1.6 URL永続性の保証

#### 1.6.1 技術的保証

```
HTTP仕様の活用:
- 301 Redirect: 永続的な移転（使用を最小限に）
- 200 OK: 既存URLの継続サポート（推奨）
- Canonical Link: SEO最適化

データベース制約:
- slug の一意性制約維持
- 履歴テーブルでの変更追跡
- soft delete による論理削除（物理削除禁止）

API設計:
- レガシーエンドポイント継続サポート
- バージョニング戦略
- 段階的な新機能導入
```

#### 1.6.2 ユーザーへの明示的約束

```
URL永続性ポリシー（利用規約に明記）:

「PromPaletteは、一度発行されたプロンプトURLの永続性を保証します」

具体的保証:
✅ 公開されたプロンプトのURLは永続的に維持
✅ 機能追加時もURLは変更しない
✅ ブックマーク・共有URLの有効性を保持
✅ 最低5年間のURL継続サポート

例外条項:
- セキュリティ上の重大な問題がある場合
- 法的要請がある場合
- サービス終了の場合（事前通知あり）
```

#### 1.6.3 移行時のユーザーコミュニケーション例

```
機能追加時のお知らせ例:

件名: 【PromPalette】新機能「コレクション」リリースのお知らせ

本文:
いつもPromPaletteをご利用いただき、ありがとうございます。

新機能「コレクション」をリリースいたしました。

【重要】既存プロンプトのURLは変更されません
- 既存のプロンプトURL（/username/prompt-name）はそのまま利用可能
- ブックマークや共有リンクは引き続き有効
- デスクトップアプリとの同期にも影響なし

【新機能について】
- プロンプトをテーマ別にまとめる「コレクション」機能
- 新しいURL: /username/collections/collection-name/prompt-name
- 既存プロンプトのコレクション移動は任意

詳細: https://prompalette.com/help/collections

今後ともPromPaletteをよろしくお願いいたします。
```

## 2. 画面設計

### 2.1 画面設計方針

#### 2.1.1 デザイン原則

- **シンプル・直感的**: 機能が明確で迷わないUI
- **レスポンシブ**: モバイル・タブレット・デスクトップ対応
- **アクセシブル**: WCAG 2.1 AA準拠
- **一貫性**: 統一されたデザインシステム

#### 2.1.2 ターゲットデバイス

```
プライマリ: デスクトップ（1920x1080, 1366x768）
セカンダリ: ラップトップ（1440x900, 1280x800）
サポート: タブレット（768px以上）
サポート: スマートフォン（375px以上）
```

### 2.2 画面構成・レイアウト

#### 2.2.1 共通レイアウト構造

```
┌─────────────────────────────────────────────────────────────┐
│ Header (固定)                                               │
│ ┌─ Logo ─┐  ┌─ Navigation ─┐  ┌─ Search ─┐  ┌─ User ─┐    │
│ │PromPal │  │Home│Explore │  │ [______] │  │Avatar▼ │    │
│ └────────┘  └─────────────┘  └──────────┘  └────────┘    │
├─────────────────────────────────────────────────────────────┤
│ Main Content Area                                           │
│                                                             │
│ ┌─ Sidebar (optional) ─┐  ┌─ Primary Content ─────────────┐ │
│ │                      │  │                               │ │
│ │ - Filter             │  │ Main content goes here        │ │
│ │ - Categories         │  │                               │ │
│ │ - User menu          │  │                               │ │
│ │                      │  │                               │ │
│ └──────────────────────┘  └───────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Footer                                                      │
│ About │ Help │ Terms │ Privacy │ Download │ Contact         │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2.2 レスポンシブ動作

```
Desktop (1200px+):
- サイドバー + メインコンテンツ (3:9 比率)
- ヘッダー全機能表示

Tablet (768px - 1199px):
- サイドバー折りたたみ可能
- 検索バー簡略化

Mobile (< 768px):
- ハンバーガーメニュー
- 縦積みレイアウト
- タッチ操作最適化
```

### 2.3 主要画面設計

#### 2.3.1 ホーム画面（ランディング）

**未ログイン時**

```
┌─────────────────────────────────────────────────────────────┐
│ Header: [Logo] [Home] [Explore] [Download] [Sign In] [Sign Up] │
├─────────────────────────────────────────────────────────────┤
│                   Hero Section                             │
│                                                             │
│         🚀 PromPalette                                      │
│    プロンプト管理の新しいスタンダード                         │
│                                                             │
│   [デスクトップアプリをダウンロード] [Webで始める]            │
│                                                             │
│           ┌─────┐ ┌─────┐ ┌─────┐                        │
│           │ 📝  │ │ 🔄  │ │ 🌍  │                        │
│           │作成 │ │同期 │ │共有 │                        │
│           └─────┘ └─────┘ └─────┘                        │
├─────────────────────────────────────────────────────────────┤
│               Popular Prompts                              │
│                                                             │
│ ┌─ Featured Prompt Card ─┐ ┌─ Featured Prompt Card ─┐      │
│ │ 📄 コードレビュー       │ │ 📄 英語学習アシスタント │      │
│ │ by 田中太郎 ⭐ 45      │ │ by 佐藤花子 ⭐ 38      │      │
│ │ "効果的なコードレビュー…"│ │ "英語学習をサポート…"  │      │
│ └───────────────────────┘ └───────────────────────┘      │
│                                                             │
│                [他の人気プロンプトを見る]                    │
└─────────────────────────────────────────────────────────────┘
```

**ログイン後（ダッシュボード）**

```
┌─────────────────────────────────────────────────────────────┐
│ Header: [Logo] [Home] [Explore] [🔍Search] [📝Create] [👤User] │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Sidebar ─────────┐ ┌─ Main Dashboard ──────────────────┐ │
│ │ 📁 My Prompts (12)│ │ Welcome back, 田中さん!           │ │
│ │ 🌟 Liked (5)      │ │                                   │ │
│ │ 📊 Statistics     │ │ Recent Activity                   │ │
│ │ ⚙️ Settings       │ │ ┌─────────────────────────────────┐ │ │
│ │ 📱 Sync Status    │ │ │ 📄 code-review-prompt           │ │ │
│ │ [✅ Synced 2h ago]│ │ │ Updated 3 hours ago             │ │ │
│ │                   │ │ │ 👀 12 views today              │ │ │
│ │ Quick Actions     │ │ └─────────────────────────────────┘ │ │
│ │ [📝 New Prompt]   │ │                                   │ │
│ │ [🔄 Sync Now]     │ │ Trending in Community             │ │
│ │ [🌍 Explore]      │ │ ┌─────────────────────────────────┐ │ │
│ └───────────────────┘ │ │ 📄 AI画像生成プロンプト         │ │ │
│                       │ │ by 佐藤花子 🔥 Trending         │ │ │
│                       │ └─────────────────────────────────┘ │ │
│                       │                                   │ │
│                       │ [プロンプトを作成] [コミュニティを探索] │ │
│                       └───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 2.3.2 プロンプト詳細画面

```
┌─────────────────────────────────────────────────────────────┐
│ Breadcrumb: [Home] > [tanaka] > [code-review-prompt]        │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Prompt Header ─────────────────────────────────────────┐ │
│ │ 📄 コードレビュープロンプト                              │ │
│ │ by 田中太郎 • 🌍 Public • ⭐ 45 likes • 👁 234 views    │ │
│ │                                                         │ │
│ │ Tags: [coding] [review] [javascript]                    │ │
│ │                                                         │ │
│ │ Actions: [❤️ Like] [🔄 Fork] [📥 Download] [📤 Share]    │ │
│ │ Owner only: [✏️ Edit] [📊 Analytics] [🗑️ Delete]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Content Area ─────────────────────────────────────────┐ │
│ │ ┌─ Prompt Content ─┐ ┌─ Preview ─────────────────────┐ │ │
│ │ │ # コードレビュー  │ │ Rendered Output:              │ │ │
│ │ │                   │ │                               │ │ │
│ │ │ 以下のコードを     │ │ # コードレビュー              │ │ │
│ │ │ レビューして...   │ │                               │ │ │
│ │ │                   │ │ 以下のコードをレビューして... │ │ │
│ │ │ [Raw] [Preview]   │ │                               │ │ │
│ │ └───────────────────┘ └───────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Meta Information ─────────────────────────────────────┐ │
│ │ Created: 2024-01-15 • Updated: 2024-01-20            │ │
│ │ Version: 3 (📋 View History)                          │ │
│ │ Quick Access: "cr" (for desktop app)                  │ │
│ │ Size: 1,250 characters                                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Community Activity (将来) ────────────────────────────┐ │
│ │ 💬 Comments (3) • 🔧 Issues (1) • 🔄 Forks (2)        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 2.3.3 プロンプト作成・編集画面

````
┌─────────────────────────────────────────────────────────────┐
│ Header: [Logo] [🏠 Home] [💾 Save] [👁 Preview] [❌ Cancel]    │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Edit Form ────────────────────────────────────────────┐ │
│ │ Title: [コードレビュープロンプト________________]        │ │
│ │                                                         │ │
│ │ Content: (Split View)                                   │ │
│ │ ┌─ Editor ──────────────┐ ┌─ Live Preview ──────────┐ │ │
│ │ │ # コードレビュー       │ │ # コードレビュー        │ │ │
│ │ │                       │ │                         │ │ │
│ │ │ 以下のコードをレビュー │ │ 以下のコードをレビュー  │ │ │
│ │ │ してください:          │ │ してください:           │ │ │
│ │ │                       │ │                         │ │ │
│ │ │ ```javascript         │ │ ```javascript           │ │ │
│ │ │ // ここにコード       │ │ // ここにコード         │ │ │
│ │ │ ```                   │ │ ```                     │ │ │
│ │ │                       │ │                         │ │ │
│ │ │ [Line: 8, Col: 15]    │ │ [Words: 45, Chars: 234] │ │ │
│ │ └───────────────────────┘ └─────────────────────────┘ │ │
│ │                                                         │ │
│ │ Tags: [coding] [review] [javascript] [+ Add Tag]        │ │
│ │                                                         │ │
│ │ Settings:                                               │ │
│ │ ○ 🔒 Private (Only me)                                 │ │
│ │ ○ 🌍 Public (Everyone can see)                         │ │
│ │                                                         │ │
│ │ Quick Access Key: [cr____] (optional, for desktop)     │ │
│ │                                                         │ │
│ │ [💾 Save Prompt] [📤 Save & Share] [❌ Cancel]          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
````

#### 2.3.4 検索・探索画面

```
┌─────────────────────────────────────────────────────────────┐
│ Header: [Logo] [Navigation] [🔍 Search: "code review"] [User] │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Search Filters ─────┐ ┌─ Search Results ───────────────┐ │
│ │ 🔍 Refine Search     │ │ Found 24 prompts for "code r..." │ │
│ │                      │ │                                 │ │
│ │ Sort by:             │ │ ┌─ Result Item ─────────────────┐ │ │
│ │ ○ Relevance          │ │ │ 📄 コードレビュープロンプト   │ │ │
│ │ ○ Most liked         │ │ │ by 田中太郎 • ⭐ 45 • 👁 234 │ │ │
│ │ ○ Recently updated   │ │ │ "効果的なコードレビューを..." │ │ │
│ │ ○ Recently created   │ │ │ [coding] [review] [javascript] │ │ │
│ │                      │ │ └───────────────────────────────┘ │ │
│ │ Filter by tags:      │ │                                 │ │
│ │ ☑️ coding (12)       │ │ ┌─ Result Item ─────────────────┐ │ │
│ │ ☑️ review (8)        │ │ │ 📄 React Component Review    │ │ │
│ │ ☐ javascript (15)    │ │ │ by 佐藤花子 • ⭐ 23 • 👁 156 │ │ │
│ │ ☐ python (6)         │ │ │ "React コンポーネントの..."   │ │ │
│ │ ☐ testing (4)        │ │ │ [react] [coding] [frontend]   │ │ │
│ │                      │ │ └───────────────────────────────┘ │ │
│ │ Visibility:          │ │                                 │ │
│ │ ☑️ Public only       │ │ [Load more results...]          │ │ │
│ │                      │ │                                 │ │
│ │ [Clear filters]      │ │ Pagination: [1] [2] [3] ... [8] │ │ │
│ └──────────────────────┘ └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 2.3.5 ユーザープロフィール画面

```
┌─────────────────────────────────────────────────────────────┐
│ Breadcrumb: [Home] > [tanaka]                               │
├─────────────────────────────────────────────────────────────┤
│ ┌─ User Profile Header ──────────────────────────────────┐ │
│ │ ┌─ Avatar ─┐ 田中太郎 (@tanaka)                        │ │
│ │ │   🧑‍💻     │ ソフトウェアエンジニア                     │ │
│ │ └──────────┘ Tokyo, Japan                             │ │
│ │                                                         │ │
│ │ 📊 12 prompts • ⭐ 156 total likes • 👥 23 followers    │ │
│ │                                                         │ │
│ │ 自己紹介: プロンプトエンジニアリングが趣味です。          │ │
│ │ 主にコーディング関連のプロンプトを作成しています。        │ │
│ │                                                         │ │
│ │ [Follow] [Message] (他ユーザー時) / [Edit Profile] (本人時) │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Tabs Navigation ──────────────────────────────────────┐ │
│ │ [📄 Prompts (12)] [⭐ Liked (5)] [📊 Stats] [⚙️ Settings] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Prompts Grid ─────────────────────────────────────────┐ │
│ │ ┌─ Prompt Card ─────┐ ┌─ Prompt Card ─────┐           │ │
│ │ │ 📄 コードレビュー   │ │ 📄 API設計プロンプト │         │ │ │
│ │ │ 🌍 Public         │ │ 🔒 Private         │         │ │ │
│ │ │ ⭐ 45 • 👁 234    │ │ ⭐ 8 • 👁 67       │         │ │ │
│ │ │ Updated 2d ago    │ │ Updated 1w ago     │         │ │ │
│ │ └───────────────────┘ └───────────────────┘           │ │
│ │                                                         │ │
│ │ ┌─ Prompt Card ─────┐ ┌─ Prompt Card ─────┐           │ │
│ │ │ 📄 テスト仕様書    │ │ 📄 バグ報告テンプレート │       │ │ │
│ │ │ 🌍 Public         │ │ 🌍 Public          │         │ │ │
│ │ │ ⭐ 23 • 👁 145    │ │ ⭐ 31 • 👁 198      │         │ │ │
│ │ │ Updated 3d ago    │ │ Updated 5d ago     │         │ │ │
│ │ └───────────────────┘ └───────────────────┘           │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 2.3.6 設定画面

```
┌─────────────────────────────────────────────────────────────┐
│ Header: [Logo] [Navigation] [User]                          │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Settings Sidebar ───┐ ┌─ Settings Content ─────────────┐ │
│ │ 👤 Profile            │ │ Profile Settings               │ │
│ │ 🔐 Account            │ │                                │ │
│ │ 📱 Sync               │ │ ┌─ Basic Info ─────────────────┐ │ │
│ │ 🔔 Notifications      │ │ │ Display Name:                │ │ │
│ │ 🎨 Appearance         │ │ │ [田中太郎_______________]     │ │ │
│ │ 🔒 Privacy            │ │ │                              │ │ │
│ │ 📊 Analytics          │ │ │ Username:                    │ │ │
│ │ ❌ Delete Account     │ │ │ [tanaka_________________]     │ │ │
│ │                       │ │ │                              │ │ │
│ │                       │ │ │ Bio:                         │ │ │
│ │                       │ │ │ [プロンプトエンジニアリング...]│ │ │
│ │                       │ │ │ [_________________________] │ │ │
│ │                       │ │ │                              │ │ │
│ │                       │ │ │ Location:                    │ │ │
│ │                       │ │ │ [Tokyo, Japan_______________] │ │ │
│ │                       │ │ │                              │ │ │
│ │                       │ │ │ Website:                     │ │ │
│ │                       │ │ │ [https://example.com________] │ │ │
│ │                       │ │ └──────────────────────────────┘ │ │
│ │                       │ │                                │ │
│ │                       │ │ ┌─ Profile Picture ───────────┐ │ │
│ │                       │ │ │ 🧑‍💻 Current Avatar           │ │ │
│ │                       │ │ │                              │ │ │
│ │                       │ │ │ [📷 Upload New] [🗑️ Remove]  │ │ │
│ │                       │ │ └──────────────────────────────┘ │ │
│ │                       │ │                                │ │
│ │                       │ │ [💾 Save Changes] [Cancel]     │ │
│ └───────────────────────┘ └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 モバイル対応設計

#### 2.4.1 モバイルナビゲーション

```
┌─────────────────────────────┐
│ ☰ PromPalette         🔍 👤 │
├─────────────────────────────┤
│                             │
│ (メインコンテンツ)           │
│                             │
├─────────────────────────────┤
│ ┌─ Bottom Tab Bar ─────────┐ │
│ │ 🏠   🔍   ➕   👤   ⚙️  │ │
│ │Home Explore New  Me  Set │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

#### 2.4.2 モバイル用プロンプト詳細

```
┌─────────────────────────────┐
│ ← コードレビュープロンプト    │
├─────────────────────────────┤
│ by 田中太郎 • 🌍 Public      │
│ ⭐ 45 • 👁 234 views        │
│                             │
│ [❤️ Like] [🔄 Fork] [📤 Share] │
├─────────────────────────────┤
│ # コードレビュー             │
│                             │
│ 以下のコードをレビューして... │
│                             │
│ (content continues...)      │
├─────────────────────────────┤
│ Tags: [coding] [review]     │
│                             │
│ Created: 2024-01-15         │
│ Version: 3                  │
└─────────────────────────────┘
```

### 2.5 状態管理・インタラクション

#### 2.5.1 ローディング状態

```
Loading States:
- スケルトンローディング（プロンプト一覧）
- プログレスバー（ファイルアップロード）
- スピナー（検索・保存処理）
- プレースホルダー（画像読み込み）
```

#### 2.5.2 エラー状態

```
Error States:
- 404 Page Not Found
- 500 Server Error
- Network Error
- Permission Denied
- Form Validation Errors
```

#### 2.5.3 空状態

```
Empty States:
- "まだプロンプトがありません"（初回ユーザー）
- "検索結果が見つかりません"（検索結果）
- "同期するプロンプトがありません"（同期画面）
```

### 2.6 アクセシビリティ考慮

#### 2.6.1 キーボードナビゲーション

- Tab順序の最適化
- Skip Links実装
- フォーカス表示の明確化
- ショートカットキー対応

#### 2.6.2 スクリーンリーダー対応

- 適切なheading構造
- aria-label / aria-describedby
- 意味的なHTML構造
- 代替テキスト提供

#### 2.6.3 色・コントラスト

- WCAG AA準拠のコントラスト比
- 色だけに依存しない情報伝達
- ダークモード対応
- 高コントラストモード対応

### 2.7 将来画面への拡張

#### 2.7.1 コレクション画面（Phase 2）

```
┌─────────────────────────────────────────────────────────────┐
│ [tanaka] > [dev-tools] (Collection)                         │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Collection Header ────────────────────────────────────┐ │
│ │ 📁 Dev Tools Collection                                │ │
│ │ by 田中太郎 • 🔒 Private • 8 prompts                   │ │
│ │                                                         │ │
│ │ 開発業務で使用するプロンプト集                           │ │
│ │                                                         │ │
│ │ [➕ Add Prompt] [⚙️ Settings] [👥 Collaborators]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ (プロンプト一覧...)                                         │
└─────────────────────────────────────────────────────────────┘
```

#### 2.7.2 組織画面（Phase 3）

```
┌─────────────────────────────────────────────────────────────┐
│ [org] > [abc-company] (Organization)                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─ Organization Header ──────────────────────────────────┐ │
│ │ 🏢 ABC Company                                         │ │
│ │ 156 members • 23 collections • 234 prompts            │ │
│ │                                                         │ │
│ │ [📁 Collections] [👥 Teams] [⚙️ Settings]               │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ (コレクション・チーム一覧...)                                │
└─────────────────────────────────────────────────────────────┘
```

この設計により、シンプルなMVPから段階的にGitHubライクな本格的なプラットフォームまで、一貫したユーザー体験を提供できます。
