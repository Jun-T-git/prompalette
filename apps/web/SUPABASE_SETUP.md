# Supabase Setup Guide

## Overview

PromPalette supports both local and cloud Supabase for development and production. This guide covers both setups.

## Local Development Setup (Recommended)

### Prerequisites

- Docker Desktop must be installed and running
- Supabase CLI must be installed (`brew install supabase/tap/supabase`)

### Quick Start

1. **Start Docker Desktop**
   ```bash
   open /Applications/Docker.app
   ```

2. **Start Local Supabase**
   ```bash
   supabase start
   ```

3. **Enable Local Supabase in Environment**
   
   Set the following in your `.env.local`:
   ```env
   NEXT_PUBLIC_USE_LOCAL_SUPABASE=true
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

### Local Supabase URLs

When running locally, Supabase provides these services:

- **API URL**: http://127.0.0.1:54321
- **Studio URL**: http://127.0.0.1:54323 (Database management UI)
- **Inbucket URL**: http://127.0.0.1:54324 (Email testing)
- **Database URL**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

### Local Development Commands

```bash
# Start all services
supabase start

# Stop all services
supabase stop

# Check status
supabase status

# Apply migrations
supabase db push

# Reset database (WARNING: destroys all data)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > src/lib/database.types.ts
```

### Environment Configuration

The application automatically switches between local and cloud Supabase based on the `NEXT_PUBLIC_USE_LOCAL_SUPABASE` environment variable:

- **Local Supabase** (when `NEXT_PUBLIC_USE_LOCAL_SUPABASE=true`):
  - URL: `http://localhost:54321`
  - Uses local Supabase default keys
  - Requires `supabase start` to be running

- **Cloud Supabase** (when `NEXT_PUBLIC_USE_LOCAL_SUPABASE=false` or unset):
  - Uses environment variables from `.env.local`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Database Schema

The local Supabase instance automatically applies these migrations on startup:

1. **Initial Schema** (`20250718204626_initial_schema.sql`):
   - Users and prompts tables
   - Basic RLS policies
   - Search functions

2. **MVP Features** (`20250719120000_mvp_features.sql`):
   - Desktop sync support
   - Advanced search optimization
   - Full-text search capabilities

### Troubleshooting Local Setup

#### Port Conflicts

If you get port conflicts:

```bash
# Stop all Supabase projects
supabase stop

# Check what's using the port
lsof -i :54321
lsof -i :54322

# Start again
supabase start
```

#### Docker Issues

```bash
# Check Docker is running
docker info

# Start Docker Desktop if needed
open /Applications/Docker.app
```

#### Reset Everything

```bash
# Stop Supabase
supabase stop

# Remove Docker volumes
docker volume prune

# Start fresh
supabase start
```

## Cloud Supabase Setup

### 1. Supabaseプロジェクトの作成

### 1.1 アカウント作成
1. [Supabase](https://supabase.com)にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインアップ（推奨）

### 1.2 新しいプロジェクト作成
1. 「New project」をクリック
2. 以下の情報を入力：
   - **Name**: `prompalette`
   - **Database Password**: 強力なパスワードを設定（保存しておく）
   - **Region**: `Northeast Asia (Tokyo)`（推奨）
   - **Pricing Plan**: `Free`（開発用）

3. 「Create new project」をクリック
4. プロジェクトの初期化を待つ（数分かかります）

## 2. データベースの設定

### 2.1 SQLエディタでスキーマを作成
1. Supabaseダッシュボードで「SQL Editor」を開く
2. 「New query」をクリック
3. `/supabase/schema.sql`の内容をコピー&ペースト
4. 「Run」をクリックしてスキーマを実行

### 2.2 データベース接続情報の確認
1. 「Settings」→「Database」を開く
2. 以下の情報を確認：
   - **Host**: `xxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: 作成時に設定したパスワード

## 3. 環境変数の設定

### 3.1 API設定の確認
1. 「Settings」→「API」を開く
2. 以下の情報をコピー：
   - **URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3.2 .env.localファイルの更新
`.env.local`ファイルを以下のように更新：

```bash
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration Mode
DATABASE_MODE=development

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## 4. 認証プロバイダーの設定

### 4.1 GitHub OAuth設定
1. [GitHub Developer Settings](https://github.com/settings/developers)を開く
2. 「New OAuth App」をクリック
3. 以下の情報を入力：
   - **Application name**: `PromPalette Local`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. 「Register application」をクリック
5. **Client ID**と**Client Secret**をコピー

### 4.2 Google OAuth設定
1. [Google Cloud Console](https://console.cloud.google.com)を開く
2. 新しいプロジェクトを作成または選択
3. 「APIs & Services」→「Credentials」を開く
4. 「+ CREATE CREDENTIALS」→「OAuth client ID」をクリック
5. 以下の情報を入力：
   - **Application type**: `Web application`
   - **Name**: `PromPalette Local`
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
6. **Client ID**と**Client Secret**をコピー

### 4.3 Supabaseで認証プロバイダーを有効化
1. Supabaseダッシュボードで「Authentication」→「Providers」を開く
2. **GitHub**を設定：
   - 「Enable sign in with GitHub」をオン
   - **Client ID**と**Client Secret**を入力
3. **Google**を設定：
   - 「Enable sign in with Google」をオン
   - **Client ID**と**Client Secret**を入力

### 4.4 .env.localに認証情報を追加
```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 5. NextAuth Secretの生成

```bash
# ランダムな32文字の文字列を生成
openssl rand -base64 32
```

生成された文字列を`NEXTAUTH_SECRET`に設定してください。

## 6. 動作確認

1. 開発サーバーを再起動：
   ```bash
   npm run dev
   ```

2. ブラウザで`http://localhost:3000`にアクセス

3. ログイン機能をテスト：
   - `http://localhost:3000/login`でGitHub/Googleログインを試行
   - ログイン後、`http://localhost:3000/dashboard`でダッシュボードを確認

## 7. マイグレーションシステムの利用

### 7.1 マイグレーションファイルの確認
```bash
# マイグレーションファイルの検証
pnpm db:validate

# マイグレーションファイルの一覧表示
ls -la supabase/migrations/
```

### 7.2 ローカル開発環境でのマイグレーション
```bash
# Supabaseローカル環境を開始
pnpm db:start

# データベースをリセット（マイグレーション適用）
pnpm db:reset

# 型定義を生成
pnpm db:generate-types
```

### 7.3 本番環境へのデプロイ
```bash
# プロジェクトをリンク（初回のみ）
supabase link --project-ref your-project-id

# 本番環境にマイグレーションを適用
supabase db push --linked
```

詳細な手順については `MIGRATION_GUIDE.md` を参照してください。

## トラブルシューティング

### よくある問題

1. **認証エラー**
   - `NEXTAUTH_URL`が正しく設定されているか確認
   - OAuth設定のコールバックURLが正しいか確認

2. **データベース接続エラー**
   - Supabaseの環境変数が正しく設定されているか確認
   - プロジェクトが正常に作成されているか確認

3. **RLSエラー**
   - SQLエディタでスキーマが正しく実行されているか確認
   - Row Level Securityポリシーが正しく設定されているか確認

4. **マイグレーションエラー**
   - `pnpm db:validate`でマイグレーションファイルを検証
   - Dockerが起動しているか確認
   - `pnpm db:reset`でローカルDBをリセット

### デバッグ方法

1. コンソールログを確認
2. Supabaseダッシュボードの「Logs」でリアルタイムログを確認
3. Network タブでAPI呼び出しを確認
4. `pnpm db:status`でSupabaseサービスの状態を確認