# PromPalette Native App

macOS向けネイティブデスクトップアプリケーション

## 🏗️ ビルド

### 開発用ビルド
```bash
pnpm dev
```

### プロダクション用ビルド

#### .appバンドルのみ
```bash
pnpm tauri:build
```

#### DMGインストーラー
```bash
# ネイティブアーキテクチャ用
pnpm tauri:build:dmg

# Universal (Intel + Apple Silicon)
pnpm tauri:build:universal
```

## 📦 配布形式

### DMGファイル
- **配布形式**: macOSの標準的なインストーラー
- **サイズ**: ~13MB (Universal)
- **ユーザー体験**: ドラッグ&ドロップでApplicationsフォルダーにインストール
- **対応アーキテクチャ**: Intel + Apple Silicon (Universal)
- **含まれるもの**: アプリケーションバンドル(.app)が内包済み

## 🔧 技術詳細

### DMGビルドについて
CI環境では`CI=true`環境変数により、Finderの操作が必要なGUI要素をスキップしてDMGを作成します。これにより、GitHub Actionsなどの自動化環境でも安定してDMGファイルを生成できます。

### 設定
- **DMGウィンドウサイズ**: 660x400px
- **アプリアイコン位置**: (180, 170)
- **Applicationsフォルダーリンク**: (480, 170)

## 🔐 セキュリティ

本番リリースではApple Developer IDによるコード署名を推奨します。詳細は `/docs/APPLE_CODE_SIGNING.md` を参照してください。