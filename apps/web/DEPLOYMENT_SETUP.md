# Vercelネイティブ デプロイメント設定ガイド

このガイドでは、PromPalette WebアプリケーションのVercelネイティブ自動デプロイを設定する手順を説明します。

## 前提条件

- Vercelアカウントが作成済み
- Supabaseプロジェクトが作成済み
- GitHubリポジトリが設定済み

## 1. Vercelプロジェクトの設定

### 1.1 Vercelプロジェクトの作成

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. 「New Project」をクリック
3. GitHubリポジトリ `prompalette` を選択
4. 以下の設定を入力：
   - **Project Name**: `prompalette`
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./` (プロジェクトルート)
   - **Build Command**: 自動検出（vercel.jsonで設定）
   - **Output Directory**: 自動検出（vercel.jsonで設定）
   - **Install Command**: 自動検出（vercel.jsonで設定）

### 1.2 Vercelの自動設定

Vercelは以下を自動的に設定します：
- **Build Command**: `cd apps/web && pnpm run --filter '../../packages/**' build && pnpm build`
- **Output Directory**: `apps/web/.next`
- **Install Command**: `pnpm install --frozen-lockfile`
- **Git Integration**: mainブランチへのプッシュで自動デプロイ
- **Preview Deployments**: プルリクエストで自動プレビュー

### 1.2 環境変数の設定

Vercelダッシュボードの「Settings」→「Environment Variables」で以下を設定：

#### 本番環境 (Production)
```bash
# アプリケーション設定
NEXT_PUBLIC_APP_URL=https://prompalette.com
NODE_ENV=production

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth設定
NEXTAUTH_URL=https://prompalette.com
NEXTAUTH_SECRET=your-nextauth-secret

# OAuth設定
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### プレビュー環境 (Preview)
```bash
# アプリケーション設定
NEXT_PUBLIC_APP_URL=https://prompalette-preview.vercel.app
NODE_ENV=production

# Supabase設定（同じもの、または別の開発用プロジェクト）
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key

# NextAuth設定
NEXTAUTH_URL=https://prompalette-preview.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret

# OAuth設定（プレビュー用）
GITHUB_CLIENT_ID=your-github-preview-client-id
GITHUB_CLIENT_SECRET=your-github-preview-client-secret
GOOGLE_CLIENT_ID=your-google-preview-client-id
GOOGLE_CLIENT_SECRET=your-google-preview-client-secret
```

## 2. GitHub Secretsの設定

GitHub リポジトリの「Settings」→「Secrets and variables」→「Actions」で以下を設定：

### 2.1 Vercel関連
```bash
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

### 2.2 Supabase関連
```bash
SUPABASE_ACCESS_TOKEN=your-supabase-access-token
SUPABASE_PROJECT_REF=your-project-ref
```

## 3. Vercel Tokenの取得

1. [Vercel Account Settings](https://vercel.com/account/tokens) にアクセス
2. 「Create Token」をクリック
3. Token名を入力（例：`prompalette-github-actions`）
4. 適切なスコープを選択
5. 生成されたトークンを `VERCEL_TOKEN` として設定

## 4. Vercel Project IDの取得

```bash
# プロジェクトルートで実行
npx vercel link

# プロジェクト情報を確認
cat .vercel/project.json
```

## 5. Supabase Access Tokenの取得

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. 「Account Settings」→「Access Tokens」を開く
3. 「Generate new token」をクリック
4. Token名を入力（例：`prompalette-github-actions`）
5. 生成されたトークンを `SUPABASE_ACCESS_TOKEN` として設定

## 6. OAuth設定の更新

### 6.1 GitHub OAuth App
本番環境とプレビュー環境用にそれぞれ作成：

**本番環境用**
- **Authorization callback URL**: `https://prompalette.com/api/auth/callback/github`

**プレビュー環境用**
- **Authorization callback URL**: `https://prompalette-preview.vercel.app/api/auth/callback/github`

### 6.2 Google OAuth App
**Authorized redirect URIs**に以下を追加：
- `https://prompalette.com/api/auth/callback/google`
- `https://prompalette-preview.vercel.app/api/auth/callback/google`

## 7. デプロイメントの動作確認

### 7.1 手動デプロイ

```bash
# リポジトリをクローン
git clone https://github.com/your-username/prompalette.git
cd prompalette

# 依存関係のインストール
pnpm install

# Webアプリのビルド
cd apps/web
pnpm build

# Vercelへのデプロイ
vercel --prod
```

### 7.2 自動デプロイ

1. `main` ブランチに変更をプッシュ
2. GitHub Actions が自動実行される
3. CI チェック（TypeScript、ESLint、テスト）が実行される
4. Vercelへのデプロイが実行される
5. Supabaseマイグレーションが実行される

## 8. トラブルシューティング

### 8.1 ビルドエラー

```bash
# ローカルでビルドを確認
cd apps/web
pnpm build

# 型エラーの確認
pnpm typecheck

# Lintエラーの確認
pnpm lint
```

### 8.2 環境変数エラー

- Vercelダッシュボードで環境変数が正しく設定されているか確認
- `NEXT_PUBLIC_` プレフィックスがついているか確認
- スペースや改行文字が含まれていないか確認

### 8.3 Supabaseマイグレーションエラー

```bash
# ローカルでマイグレーションを確認
cd apps/web
pnpm db:validate

# Supabase CLI での接続確認
supabase projects list
```

### 8.4 OAuth認証エラー

- コールバックURLが正しく設定されているか確認
- Client IDとClient Secretが正しく設定されているか確認
- 環境（本番/プレビュー）に応じた設定になっているか確認

## 9. 監視とメンテナンス

### 9.1 デプロイメントログの確認

- Vercelダッシュボードの「Deployments」タブでログを確認
- GitHub Actionsの「Actions」タブでワークフローを確認

### 9.2 パフォーマンス監視

- Vercel Analyticsを有効化
- Core Web Vitalsの監視
- エラーログの定期確認

### 9.3 定期メンテナンス

- 依存関係の更新
- セキュリティパッチの適用
- 環境変数の定期的な更新

## 10. セキュリティ考慮事項

### 10.1 本番環境のセキュリティ

- 強力な `NEXTAUTH_SECRET` を設定
- 適切なCORSポリシーの設定
- HTTPSの強制
- セキュリティヘッダーの設定

### 10.2 シークレット管理

- GitHub Secretsの定期的な更新
- 最小権限の原則に従ったアクセス制御
- 不要になったトークンの削除

このガイドに従って設定することで、`main` ブランチへのマージで自動的にVercelにデプロイされるCI/CDパイプラインが構築されます。