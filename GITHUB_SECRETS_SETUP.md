# GitHub Secrets設定ガイド

## 必要なSecrets

### 1. APPLE_CERTIFICATE_BASE64
- **内容**: Developer ID Application証明書のbase64エンコード
- **取得方法**: 
  ```bash
  base64 -i ~/Desktop/Certificates.p12
  ```
- **設定**: 出力された文字列全体をコピー

### 2. APPLE_CERTIFICATE_PASSWORD
- **内容**: .p12ファイルのエクスポート時に設定したパスワード
- **例**: `MySecurePassword123`

### 3. KEYCHAIN_PASSWORD
- **内容**: CI環境で使用する一時的なキーチェーンパスワード
- **例**: `temporary-keychain-password` (任意の文字列でOK)

### 4. APPLE_TEAM_ID (オプション、Notarization用)
- **内容**: Apple Developer Team ID (10文字)
- **取得方法**:
  ```bash
  security find-identity -v -p codesigning | grep 'Developer ID Application'
  ```
  括弧内の10文字（例: ABCDE12345）

### 5. APPLE_ID (Notarization用、将来的に必要)
- **内容**: Apple Developer アカウントのメールアドレス
- **例**: `your-email@example.com`

### 6. APPLE_PASSWORD (Notarization用、将来的に必要)
- **内容**: App用パスワード（Apple IDの2要素認証用）
- **取得方法**: https://appleid.apple.com でApp用パスワードを生成

## 設定手順

1. GitHubリポジトリを開く
2. Settings → Secrets and variables → Actions
3. 「New repository secret」をクリック
4. 各Secretを追加：
   - Name: `APPLE_CERTIFICATE_BASE64`
   - Secret: (base64エンコードされた証明書)
5. 同様に他のSecretsも追加

## 確認方法

設定後、以下を確認：
- [ ] APPLE_CERTIFICATE_BASE64 ✓
- [ ] APPLE_CERTIFICATE_PASSWORD ✓
- [ ] KEYCHAIN_PASSWORD ✓

## トラブルシューティング

### 証明書が認識されない場合
```bash
# ローカルで証明書を確認
security find-identity -v -p codesigning

# 期待される出力:
# 1) XXXXXXXXXX "Developer ID Application: Your Name (TEAMID)"
```

### base64が長すぎる場合
GitHubのSecret値は65536文字まで。通常は問題ないが、複数の証明書が含まれている場合は該当の証明書のみエクスポート。