# Vercelネイティブセットアップガイド

## 簡単3ステップでセットアップ

### 1. Vercelプロジェクト作成

1. [Vercel Dashboard](https://vercel.com/dashboard) でGitHubリポジトリを選択
2. プロジェクト名: `prompalette`
3. 「Deploy」をクリック → 自動設定完了

### 2. 環境変数設定

Vercelダッシュボードで以下を設定：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# NextAuth
NEXTAUTH_URL=https://prompalette.com
NEXTAUTH_SECRET=xxx

# OAuth
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

### 3. 自動デプロイ開始

- `main` ブランチプッシュ → 本番デプロイ
- プルリクエスト作成 → プレビューデプロイ

## データベースマイグレーション

マイグレーションが必要な場合のみ手動実行：

```bash
cd apps/web
pnpm db:migrate:production
```

## 完了！

これで以下が自動化されます：
- ✅ モノレポ構造の自動認識
- ✅ 依存関係の自動解決
- ✅ Next.js最適化ビルド
- ✅ 本番・プレビュー環境の自動デプロイ
- ✅ HTTPSとカスタムドメイン設定
- ✅ Analytics とモニタリング

シンプルで強力なVercelネイティブデプロイメントの完成です！