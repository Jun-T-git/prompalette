# 技術的負債の解決提案

## 1. 公開鍵管理の改善

### 現状の問題
- ハードコーディングされた公開鍵
- 複数ファイルでの重複管理

### 解決策
```bash
# 1. 共通設定ファイル作成
apps/native/src-tauri/keys/public.key

# 2. ビルド時読み込み
{
  "pubkey": "{{TAURI_PUBLIC_KEY}}"
}

# 3. ビルドスクリプトで置換
sed -i 's/{{TAURI_PUBLIC_KEY}}/'$(cat keys/public.key)'/g' tauri.conf.json
```

## 2. CI/CDワークフローの簡素化

### 環境別設定の統一
```yaml
# 環境マトリックス使用
strategy:
  matrix:
    environment: [staging, production]
    include:
      - environment: staging
        signing_required: false
      - environment: production  
        signing_required: true
```

## 3. アクションの改善

### エラーハンドリングの統一
```yaml
# 共通エラーハンドリング関数
- name: Handle signing errors
  if: failure()
  run: |
    echo "::error::Signature generation failed"
    echo "::notice::Check TAURI_PRIVATE_KEY configuration"
```

## 4. セキュリティの強化

### 秘密情報のログ出力防止
```bash
# マスク処理
echo "::add-mask::$TAURI_KEY_PASSWORD"
```

## 5. テスタビリティの向上

### 単体テスト可能な設計
```bash
# 署名検証スクリプト
scripts/verify-signature.sh
scripts/test-keys.sh
```