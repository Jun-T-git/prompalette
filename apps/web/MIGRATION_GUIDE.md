# Supabase マイグレーションガイド

## 概要

このガイドでは、PromPalette WebアプリケーションのSupabaseデータベースマイグレーションの手順を説明します。

## 前提条件

- Supabase CLIがインストールされている
- Supabaseプロジェクトが作成済み
- `.env.local`ファイルが適切に設定されている

## マイグレーション手順

### 1. Supabaseローカル環境の開始

```bash
# Supabaseローカル環境を起動
pnpm db:start

# 初回起動時は時間がかかることがあります
# Docker イメージのダウンロードが完了するまで待機
```

### 2. データベースの初期化

```bash
# データベースをリセット（初期化）
pnpm db:reset

# これにより migrations/ フォルダ内のすべてのマイグレーションが実行されます
```

### 3. マイグレーションの適用

```bash
# ローカルデータベースに変更を適用
pnpm db:migrate

# 本番環境にデプロイする場合
supabase db push --linked
```

### 4. TypeScript型の生成

```bash
# データベーススキーマからTypeScript型を生成
pnpm db:generate-types
```

### 5. 状態確認

```bash
# Supabaseサービスの状態を確認
pnpm db:status
```

## マイグレーションファイルの構成

```
supabase/
├── config.toml                    # Supabase設定
├── migrations/                    # マイグレーションファイル
│   └── 20250718204626_initial_schema.sql
├── schema.sql                     # スキーマ定義（参考用）
└── seed.sql                       # シードデータ（存在する場合）
```

## 新しいマイグレーションの作成

### 1. マイグレーションファイルの作成

```bash
# 新しいマイグレーションファイルを作成
# ファイル名: YYYYMMDDHHMMSS_description.sql
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_add_new_feature.sql
```

### 2. マイグレーションの内容を記述

```sql
-- 例: 新しいテーブルの追加
CREATE TABLE IF NOT EXISTS new_table (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスの追加
CREATE INDEX IF NOT EXISTS idx_new_table_name ON new_table(name);

-- RLSポリシーの追加
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON new_table FOR SELECT USING (true);
```

### 3. マイグレーションの適用

```bash
# ローカル環境で実行
pnpm db:migrate

# 型定義を更新
pnpm db:generate-types
```

## 本番環境への適用

### 1. Supabaseプロジェクトのリンク

```bash
# プロジェクトをリンク（初回のみ）
supabase link --project-ref your-project-id
```

### 2. 本番環境へのデプロイ

```bash
# 本番環境にマイグレーションを適用
supabase db push --linked

# 確認
supabase db diff --linked
```

## トラブルシューティング

### よくある問題と解決方法

1. **マイグレーションが失敗する**
   ```bash
   # ローカルDBをリセット
   pnpm db:reset
   
   # 問題のあるマイグレーションファイルを確認・修正
   # 再度マイグレーションを実行
   pnpm db:migrate
   ```

2. **Dockerエラー**
   ```bash
   # Docker環境をクリーンアップ
   docker system prune -a
   
   # Supabaseを再起動
   supabase stop
   supabase start
   ```

3. **型定義が更新されない**
   ```bash
   # 型定義を強制的に再生成
   pnpm db:generate-types
   
   # TypeScriptサーバーを再起動
   # VSCodeの場合: Cmd+Shift+P → "TypeScript: Restart TS Server"
   ```

## 注意事項

- **本番環境での実行前に必ずローカルでテストしてください**
- **データベースの重要な変更前にはバックアップを取ってください**
- **RLSポリシーの変更は慎重に行ってください**
- **マイグレーションファイルは一度適用した後は変更しないでください**

## 開発ワークフロー

1. ローカルでスキーマ変更を開発
2. マイグレーションファイルを作成
3. ローカルで動作確認
4. 型定義を更新
5. アプリケーションコードを更新
6. テストを実行
7. 本番環境にデプロイ

## 参考コマンド

```bash
# 現在のマイグレーション状況を確認
supabase migration list

# 特定のマイグレーションまで適用
supabase db reset --to 20250718204626

# データベースの差分を確認
supabase db diff

# ローカルDBをリセット
supabase db reset

# すべてのSupabaseサービスを停止
supabase stop --no-backup
```

このガイドに従って、安全にデータベースマイグレーションを実行してください。