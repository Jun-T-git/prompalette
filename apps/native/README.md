# PromPalette Native App

Tauri + React + TypeScript で構築されたネイティブデスクトップアプリケーション

## 🚀 起動方法

### 推奨：Tauriアプリとして実行

```bash
# Tauri開発サーバーを起動（推奨）
pnpm dev
```

これにより、TauriのネイティブウィンドウでReactアプリが起動し、データベース機能や他のネイティブ機能が利用できます。

### 代替：ブラウザでのテスト

```bash
# Webブラウザでの開発・テスト（機能制限あり）
pnpm dev:web
```

この方法では、TauriのネイティブAPIが利用できないため、環境エラー画面が表示されます。UI/UXのテストには利用できます。

## 📦 ビルド

```bash
# フロントエンドのビルド
pnpm build

# ネイティブアプリのビルド（配布用）
pnpm tauri:build
```

## 🧪 テスト・品質チェック

```bash
# TypeScript型チェック
pnpm typecheck

# ESLintによるコード品質チェック
pnpm lint

# 単体テスト実行
pnpm test

# テストカバレッジ付きテスト
pnpm test:coverage
```

## 🏗️ アーキテクチャ

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **State Management**: Zustand
- **Native Backend**: Tauri (Rust)
- **Database**: SQLite with sqlx
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

## 🔧 開発時の注意点

### 1. 環境の違い

- `pnpm dev`: Tauriネイティブ環境（全機能利用可能）
- `pnpm dev:web`: ブラウザ環境（UI確認のみ、API機能制限あり）

### 2. データベース

アプリケーション初回起動時に自動的にSQLiteデータベースが初期化されます。

### 3. エラーハンドリング

環境エラーが発生した場合、専用のエラー画面で適切な解決方法が表示されます。

## 📁 プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── common/         # 共通コンポーネント
│   ├── prompt/         # プロンプト関連コンポーネント
│   └── search/         # 検索機能コンポーネント
├── services/           # API・外部サービス
├── stores/             # Zustand状態管理
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ関数
└── App.tsx            # メインアプリケーション

src-tauri/
├── src/
│   ├── commands.rs     # Tauriコマンド定義
│   ├── database.rs     # データベース操作
│   └── lib.rs          # メイン設定
└── tauri.conf.json     # Tauri設定
```

## 🔐 セキュリティ

- Content Security Policy (CSP) 設定済み
- 入力値検証
- 環境変数による設定管理
- SQLインジェクション対策

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
