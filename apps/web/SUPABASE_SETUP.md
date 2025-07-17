# Supabase セットアップガイド

## 1. Supabaseプロジェクトの作成

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

### デバッグ方法

1. コンソールログを確認
2. Supabaseダッシュボードの「Logs」でリアルタイムログを確認
3. Network タブでAPI呼び出しを確認