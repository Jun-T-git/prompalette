# PromPalette Vercelネイティブ デプロイメントガイド

## 概要

PromPalette WebアプリケーションはVercelネイティブの自動デプロイメント機能を使用しています。

## Vercelネイティブ自動デプロイメント

### 🚀 本番環境への自動デプロイ

`main` ブランチへのプッシュで自動実行されます：

1. **Vercelによる自動検出**
   - モノレポ構造の自動認識
   - 依存関係の自動解決
   - 共有パッケージの自動ビルド

2. **品質チェック**
   - TypeScript型チェック（ビルド時）
   - Next.js最適化ビルド
   - 静的解析とエラーチェック

3. **本番デプロイ**
   - Edge Network への配信
   - カスタムドメイン設定
   - HTTPSの自動設定

### 🔧 プレビュー環境

プルリクエスト作成時に、Vercelが自動的にプレビュー環境を作成します。

## 手動デプロイメント

### 本番環境

```bash
# Webアプリディレクトリから
cd apps/web
pnpm deploy

# または、Vercel CLIを直接使用
vercel --prod
```

### プレビュー環境

```bash
# Webアプリディレクトリから
cd apps/web
pnpm deploy:preview

# または、Vercel CLIを直接使用
vercel
```

## 環境構成

### 本番環境
- **URL**: https://prompalette.com
- **Vercel**: Production環境
- **Database**: Supabase Production

### プレビュー環境
- **URL**: https://prompalette-preview.vercel.app
- **Vercel**: Preview環境
- **Database**: Supabase Staging（または同じProduction）

## 必要な設定

### Vercel Environment Variables
```bash
# 本番環境
NEXT_PUBLIC_APP_URL=https://prompalette.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXTAUTH_URL=https://prompalette.com
NEXTAUTH_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

## デプロイメントワークフロー

### 1. 開発 → リリース

```bash
# 1. 機能ブランチで開発
git checkout -b feature/new-feature

# 2. 開発とテスト
pnpm dev
pnpm test

# 3. プルリクエスト作成
# → Vercelが自動的にプレビュー環境を作成

# 4. レビュー後、mainブランチにマージ
# → Vercelが自動的に本番環境にデプロイ

# 5. データベースマイグレーション（必要に応じて手動実行）
cd apps/web
pnpm db:migrate:production
```

### 2. 緊急修正

```bash
# 1. hotfixブランチを作成
git checkout -b hotfix/critical-fix

# 2. 修正とテスト
pnpm test

# 3. 直接mainブランチにマージ
# → Vercelが自動的に本番環境にデプロイ
```

## モニタリング

### デプロイメント状況

- **Vercel**: [Vercel Dashboard](https://vercel.com/dashboard)
- **Supabase**: [Supabase Dashboard](https://app.supabase.com)

### パフォーマンス監視

- **Vercel Analytics**: 自動的に有効化
- **Core Web Vitals**: Vercelダッシュボードで確認
- **Real User Monitoring**: Vercel Analyticsで確認

## トラブルシューティング

### デプロイメント失敗

1. **Vercelログを確認**
   - ビルドエラー: 依存関係やビルド設定
   - ランタイムエラー: 環境変数や設定ミス
   - モノレポ構造の問題: パッケージ依存関係

2. **データベースマイグレーション失敗**
   - マイグレーションファイルの構文エラー
   - データベース接続問題
   - 手動実行が必要な場合

### よくある問題と解決方法

#### 1. 環境変数エラー
```bash
# ローカルで確認
cd apps/web
pnpm build

# 環境変数一覧をチェック
env | grep NEXT_PUBLIC
```

#### 2. 依存関係エラー
```bash
# pnpm lockfileを再生成
rm pnpm-lock.yaml
pnpm install
```

#### 3. ビルドエラー
```bash
# 型エラーの確認
pnpm typecheck

# Lintエラーの確認
pnpm lint
```

#### 4. データベース接続エラー
```bash
# Supabase接続確認
cd apps/web
pnpm db:status
```

## セキュリティ

### 本番環境
- HTTPS強制
- セキュリティヘッダー設定
- 適切なCORS設定
- 環境変数の暗号化

### アクセス制御
- GitHub Secretsの適切な管理
- Vercelアクセス制御
- Supabaseアクセス制御

## 参考資料

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [アプリケーション設定ガイド](apps/web/DEPLOYMENT_SETUP.md)
- [データベースマイグレーションガイド](apps/web/MIGRATION_GUIDE.md)