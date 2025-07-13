# PromPalette Native App - アーキテクチャ & シーケンス図

## 📋 概要

PromPalette Native Appは **Tauri + React + SQLite** アーキテクチャを採用したデスクトップアプリケーションです。
このドキュメントでは、アプリケーションの全体構造と主要な処理フローをMermaid記法で可視化しています。

## 🏗️ アーキテクチャ図

```mermaid
graph TB
    %% フロントエンド層
    subgraph "Frontend Layer (React + TypeScript)"
        UI[React UI Components]
        Store[Zustand State Management]
        Hooks[Custom Hooks]
        Services[Frontend Services]
        UI --> Store
        Store --> Hooks
        Hooks --> Services
    end

    %% バックエンド層
    subgraph "Backend Layer (Rust + Tauri)"
        Commands[Tauri Commands]
        Database[SQLite Database]
        Modules[Rust Modules]
        
        subgraph "Modules"
            DB[database.rs]
            SC[shortcuts.rs]
            GH[global_hotkey.rs]
            TR[tray.rs]
            UP[updater.rs]
        end
        
        Commands --> DB
        Commands --> SC
        Commands --> GH
        Commands --> TR
        Commands --> UP
        DB --> Database
    end

    %% システム統合層
    subgraph "System Integration"
        Clipboard[システムクリップボード]
        GlobalShortcuts[グローバルショートカット]
        SystemTray[システムトレイ]
        FileSystem[ファイルシステム]
    end

    %% 通信
    Services -.->|invoke commands| Commands
    Commands -.->|events| Services
    
    %% システム統合
    SC --> GlobalShortcuts
    TR --> SystemTray
    Commands --> Clipboard
    Database --> FileSystem

    %% スタイリング
    classDef frontend fill:#e1f5fe
    classDef backend fill:#fff3e0
    classDef system fill:#f3e5f5
    classDef database fill:#e8f5e8

    class UI,Store,Hooks,Services frontend
    class Commands,Modules,DB,SC,GH,TR,UP backend
    class Clipboard,GlobalShortcuts,SystemTray,FileSystem system
    class Database database
```

### 🔧 技術スタック詳細

| レイヤー | 技術 | 説明 |
|---------|------|------|
| **Frontend** | React 18 + TypeScript | ユーザーインターフェース |
| **State Management** | Zustand | 軽量な状態管理 |
| **Native Shell** | Tauri 2.0 | Rustベースのネイティブフレームワーク |
| **Backend** | Rust | 高性能なバックエンド処理 |
| **Database** | SQLite + sqlx | ローカルデータベース |
| **Build** | Vite | 高速なフロントエンドビルド |
| **Testing** | Vitest + React Testing Library | テストフレームワーク |

## 📋 シーケンス図

### 1. プロンプト作成フロー

```mermaid
sequenceDiagram
    participant User
    participant React_UI
    participant Zustand_Store
    participant Tauri_Commands
    participant SQLite_DB

    User->>React_UI: 新規作成ボタンクリック (⌘N)
    React_UI->>React_UI: フォーム表示
    User->>React_UI: プロンプト情報入力
    User->>React_UI: 保存ボタンクリック
    React_UI->>Zustand_Store: createPrompt()
    Zustand_Store->>Tauri_Commands: invoke('create_prompt', data)
    Tauri_Commands->>Tauri_Commands: 入力値検証
    Tauri_Commands->>SQLite_DB: INSERT INTO prompts
    SQLite_DB-->>Tauri_Commands: プロンプトID返却
    Tauri_Commands-->>Zustand_Store: 作成されたプロンプト
    Zustand_Store->>Zustand_Store: ローカル状態更新
    Zustand_Store-->>React_UI: 更新通知
    React_UI->>React_UI: フォーム閉じる & 成功トースト表示
```

### 2. プロンプト検索・選択・コピーフロー

```mermaid
sequenceDiagram
    participant User
    participant React_UI
    participant Search_Hook
    participant Zustand_Store
    participant Tauri_Commands
    participant System_Clipboard

    User->>React_UI: 検索窓に入力
    React_UI->>Search_Hook: クエリ変更
    Search_Hook->>Search_Hook: フィルタリング実行
    Search_Hook-->>React_UI: 検索結果表示
    User->>React_UI: 矢印キーでナビゲーション
    React_UI->>Zustand_Store: setSelectedPrompt()
    User->>React_UI: Enter キー押下
    React_UI->>React_UI: copyPromptToClipboard()
    React_UI->>System_Clipboard: プロンプトコンテンツ書き込み
    System_Clipboard-->>React_UI: コピー完了
    React_UI->>React_UI: 成功トースト表示
```

### 3. グローバルショートカット起動フロー

```mermaid
sequenceDiagram
    participant User
    participant OS
    participant Global_Hotkey
    participant Tauri_App
    participant React_UI

    User->>OS: グローバルショートカット押下 (⌘⇧P)
    OS->>Global_Hotkey: ホットキーイベント
    Global_Hotkey->>Tauri_App: イベント処理
    Tauri_App->>Tauri_App: ウィンドウ表示/フォーカス
    Tauri_App->>React_UI: 'focus-search' イベント送信
    React_UI->>React_UI: 検索フィールドにフォーカス
    React_UI-->>User: アプリが前面に表示
```

### 4. ピン留めプロンプト操作フロー

```mermaid
sequenceDiagram
    participant User
    participant React_UI
    participant Favorites_Store
    participant Tauri_Commands
    participant SQLite_DB
    participant System_Clipboard

    User->>React_UI: プロンプト選択 + ⌘⇧1
    React_UI->>Favorites_Store: ピン留め操作
    Favorites_Store->>Tauri_Commands: invoke('pin_prompt', {id, position})
    Tauri_Commands->>SQLite_DB: INSERT/UPDATE pinned_prompts
    SQLite_DB-->>Tauri_Commands: 成功
    Tauri_Commands-->>Favorites_Store: 完了通知
    Favorites_Store->>Favorites_Store: ローカル状態更新
    Favorites_Store-->>React_UI: UI更新
    React_UI->>React_UI: ピン留め成功トースト表示

    Note over User, SQLite_DB: 後でピン留めプロンプト使用
    User->>React_UI: ⌘1 押下
    React_UI->>Tauri_Commands: invoke('copy_pinned_prompt', position)
    Tauri_Commands->>SQLite_DB: SELECT pinned content
    SQLite_DB-->>Tauri_Commands: コンテンツ取得
    Tauri_Commands->>System_Clipboard: クリップボードにコピー
    Tauri_Commands-->>React_UI: 完了通知
    React_UI->>React_UI: コピー成功トースト表示
```

## 🎯 設計特徴

### ローカルファーストアプローチ
- **高速検索**: SQLiteによる<5ms検索レスポンス
- **オフライン完結**: ネットワーク接続不要
- **軽量設計**: メモリ使用量<20MB、バイナリサイズ<20MB

### パフォーマンス最適化
- **非同期処理**: Rustの非同期ランタイムによる高速処理
- **効率的な状態管理**: Zustandによる軽量状態管理
- **リアルタイム検索**: フロントエンドでの高速フィルタリング

### システム統合
- **グローバルホットキー**: OS全体からの瞬時アクセス
- **クリップボード統合**: シームレスなコピー&ペースト
- **システムトレイ**: バックグラウンド常駐機能

## 🔗 関連ドキュメント

- [ARCHITECTURE.md](../apps/native/ARCHITECTURE.md) - 詳細なアーキテクチャ決定書
- [README.md](../apps/native/README.md) - セットアップと使用方法
- [Tauri公式ドキュメント](https://tauri.app/) - Tauriフレームワーク詳細

---

**作成日**: 2025-01-13  
**更新者**: Claude Code