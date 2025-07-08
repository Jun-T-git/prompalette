# Tauri自動更新署名の設定ガイド

## 概要

Tauriの自動更新機能では、アプリの更新ファイルの真正性を確認するために署名検証を使用します。

## 手順

### 1. 署名鍵の生成

```bash
# プロジェクトルートで実行
./generate-tauri-keys.sh
```

### 2. パスワードの設定

任意の強力なパスワードを決めてください（例: `MyS3cur3P@ssw0rd!`）

### 3. GitHub Secretsに追加

#### TAURI_PRIVATE_KEY
```bash
# 秘密鍵の内容を取得
cat ~/.tauri/prompalette.key
```

出力例：
```
dW50cnVzdGVkIGNvbW1lbnQ6IHJzaWduIGVuY3J5cHRlZCBzZWNyZXQga2V5
...（複数行の文字列）...
```

この**全内容**をGitHub Secretsの`TAURI_PRIVATE_KEY`に設定。

#### TAURI_KEY_PASSWORD

ステップ2で決めたパスワードを`TAURI_KEY_PASSWORD`に設定。

### 4. 公開鍵をtauri.conf.jsonに追加

```bash
# 公開鍵を取得
cat ~/.tauri/prompalette.key.pub
```

出力例：
```
dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXkgRjdGMTI5MTZGMEY3NDEK...
```

`apps/native/src-tauri/tauri.conf.json`を編集：

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://api.github.com/repos/Jun-T-git/prompalette/releases/latest"
      ],
      "dialog": true,
      "pubkey": "ここに公開鍵を貼り付け"
    }
  }
}
```

## セキュリティ注意事項

1. **秘密鍵は絶対にコミットしない**
2. **パスワードは強力なものを使用**
3. **秘密鍵のバックアップを安全に保管**

## トラブルシューティング

### 署名検証エラーが出る場合

1. 公開鍵が正しく設定されているか確認
2. CI/CDで秘密鍵とパスワードが正しく渡されているか確認
3. 更新ファイルのURLが正しいか確認

### 鍵を紛失した場合

新しい鍵ペアを生成し、アプリの新バージョンをリリースする必要があります。