# アップデート設定ガイド

## 概要

PromPaletteの自動アップデート機能は、環境ごとに異なる署名キーを使用してセキュアなアップデートを提供します。

## 環境変数の設定

### 開発環境 (Development)

```bash
export PROMPALETTE_DEVELOPMENT_PUBLIC_KEY="<base64-encoded-public-key>"
export PROMPALETTE_DEVELOPMENT_PRIVATE_KEY="<base64-encoded-private-key>"
export PROMPALETTE_DEVELOPMENT_KEY_PASSWORD="<key-password>"
```

### ステージング環境 (Staging)

```bash
export PROMPALETTE_STAGING_PUBLIC_KEY="<base64-encoded-public-key>"
export PROMPALETTE_STAGING_PRIVATE_KEY="<base64-encoded-private-key>"
export PROMPALETTE_STAGING_KEY_PASSWORD="<key-password>"
```

### 本番環境 (Production)

```bash
export PROMPALETTE_PRODUCTION_PUBLIC_KEY="<base64-encoded-public-key>"
export PROMPALETTE_PRODUCTION_PRIVATE_KEY="<base64-encoded-private-key>"
export PROMPALETTE_PRODUCTION_KEY_PASSWORD="<key-password>"
```

## キーペアの生成

新しいキーペアを生成する場合：

```bash
# Tauri CLIを使用してキーペアを生成
pnpm tauri signer generate -w <key-password>

# 出力される公開鍵と秘密鍵を環境変数に設定
```

## ビルド時の挙動

- **CI環境**: 公開鍵が設定されていない場合、ビルドはエラーになります
- **ローカル開発**: 公開鍵が設定されていない場合、警告が表示されアップデート機能は無効化されます

## 設定ファイルの構造

ビルド時に以下の設定が自動的に生成されます：

```json
{
  "updater": {
    "active": true,  // 公開鍵がある場合のみtrue
    "dialog": true,
    "pubkey": "<実際の公開鍵>",
    "endpoints": [
      "https://github.com/Jun-T-git/prompalette/releases/latest/download/latest.json"
    ]
  }
}
```

## セキュリティに関する注意事項

1. **秘密鍵の管理**: 秘密鍵は絶対にリポジトリにコミットしないでください
2. **環境の分離**: 各環境で異なるキーペアを使用してください
3. **キーローテーション**: 定期的にキーを更新することを推奨します

## アーキテクチャ

### 署名検証フロー

```
1. ビルド時: 公開鍵を検証・埋め込み
2. 実行時: UpdateSecurity::verify_signature()
3. 検証成功: アップデート実行
4. 検証失敗: エラー表示・アップデート中止
```

### バックアップ戦略

- **自動バックアップ**: アップデート前に自動実行
- **手動バックアップ**: ユーザーが任意のタイミングで実行
- **復元機能**: バックアップから簡単復元

## トラブルシューティング

### アップデートが機能しない

1. 環境変数が正しく設定されているか確認
2. ビルドログで公開鍵の検証エラーがないか確認
3. `latest.json`が正しく生成されているか確認

### 署名検証エラー

1. 公開鍵と秘密鍵のペアが一致しているか確認
2. Base64エンコーディングが正しいか確認
3. 環境名（development/staging/production）が一致しているか確認

## 開発者向けガイド

### テスト実行

```bash
# 単体テスト
cargo test

# 統合テスト
cargo test integration_tests

# フロントエンドテスト
pnpm test
```

### デバッグ

```bash
# ログレベル設定
export RUST_LOG=debug

# テスト環境での実行
APP_ENV=development pnpm tauri dev
```