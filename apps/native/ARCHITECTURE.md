# Native App アーキテクチャ決定書 (ADR)

## 🎯 アーキテクチャ概要

PromPalette Native Appは **Tauri + SQLite** アーキテクチャを採用しています。

## 📋 アーキテクチャ決定

### **選択されたアーキテクチャ: Tauri + ローカルSQLite**

```
Frontend (React + TypeScript)
    ↓ Tauri invoke commands
Backend (Rust)
    ↓ sqlx
SQLite Database (ローカル)
```

### **技術スタック**

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **State Management**: Zustand
- **Native Shell**: Tauri 2.0
- **Backend**: Rust
- **Database**: SQLite + sqlx
- **Build**: Vite
- **Testing**: Vitest + React Testing Library

## 🎯 設計原則

### **1. ローカルファーストアプローチ**

**決定理由**: 仕様変更後のP0機能要件
- ワークスペース管理（ローカルディレクトリ）
- ファイル自動インデックス（ローカルファイル監視）
- 一意識別子システム（高速ローカル検索）

### **2. パフォーマンス重視**

**パフォーマンス目標**:
- 識別子完全一致検索: <5ms
- アプリ全体メモリ使用量: <20MB
- バイナリサイズ: <20MB
- 起動時間: <2秒

### **3. 段階的機能追加**

```
Phase 1.0: 基本CRUD + コピー機能 ✅
Phase 1.1: ワークスペース管理
Phase 1.2: ファイルインデックス + 識別子システム
Phase 2.0: 高度検索 + グローバルホットキー
```

## 🔄 将来の拡張性

### **クラウド統合への対応**

現在のローカルアーキテクチャは、将来のクラウド機能と共存可能:

```rust
// 将来の拡張例
pub enum DataSource {
    Local(SqlitePool),      // 現在の実装
    Remote(ApiClient),      // 将来の拡張
    Hybrid(SqlitePool, ApiClient), // オフライン対応
}
```

### **チーム機能への対応**

- ローカルデータベース: 個人用高速アクセス
- 同期機能: チーム共有（将来実装）
- オフライン対応: ローカル優先、バックグラウンド同期

## 🚫 却下されたアーキテクチャ

### **Web API統合アプローチ**

**却下理由**:
1. **P0要件との不整合**: ファイル監視、ローカル検索が不可能
2. **パフォーマンス目標未達**: ネットワーク遅延で<5ms検索不可能
3. **オフライン機能**: 要求されているローカルファイルアクセス不可

### **純粋Webアプローチ**

**却下理由**:
1. **ファイルシステムアクセス制限**
2. **グローバルホットキー不可**
3. **ネイティブ統合不可**

## 📊 品質保証

### **テスト戦略**

- **Unit Tests**: 各機能の単体テスト
- **Integration Tests**: Tauriコマンドの統合テスト
- **E2E Tests**: ユーザーワークフローのテスト

### **パフォーマンステスト**

- **起動時間**: 2秒以内
- **検索応答**: 5ms以内（識別子検索）
- **メモリ使用量**: 20MB以内

### **品質メトリクス**

- **テスト成功率**: 100%
- **コードカバレッジ**: >90%
- **TypeScript**: strict mode
- **Lint**: 警告0件

## 🔧 開発ガイドライン

### **コード品質**

```typescript
// ✅ 推奨: 型安全な実装
const result = await invoke<PromptResponse>('get_prompt', { id })

// ❌ 禁止: any型の使用
const result = await invoke('get_prompt', { id }) as any
```

### **エラーハンドリング**

```rust
// ✅ 推奨: 構造化エラー
#[derive(Debug, serde::Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub code: Option<u32>,
}

// ❌ 禁止: 文字列エラー
return Err("Something went wrong".to_string());
```

### **パフォーマンス**

```rust
// ✅ 推奨: 非同期処理
#[tauri::command]
pub async fn search_prompts(query: String) -> Result<Vec<Prompt>, ErrorResponse>

// ❌ 禁止: 同期ブロッキング
#[tauri::command]
pub fn search_prompts_sync(query: String) -> Vec<Prompt>
```

## 🎉 まとめ

PromPalette Native Appは、**ローカルファースト**の思想に基づく**Tauri + SQLite**アーキテクチャにより：

1. **高速な検索体験** (<5ms)
2. **堅牢なオフライン機能**
3. **将来のクラウド統合への拡張性**

を実現しています。このアーキテクチャは仕様変更後のP0要件に完全に合致し、PromPaletteの差別化要因である「瞬時アクセス」を技術的に支えています。