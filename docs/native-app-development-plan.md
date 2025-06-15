# 🚀 Native App 開発計画書

## 概要

PromPalette Native Appの段階的開発計画。「プロンプト管理版 GitHub」のビジョンを実現するため、コア機能を高品質・高ユーザビリティで段階的に開発する。

## 1. 将来機能マップ（ミッション・ビジョンから逆算）

### Foundation Layer（基盤機能）
- ✅ プロンプト CRUD 操作
- ✅ ローカルストレージ & 高速検索
- ✅ カテゴリ・タグ管理
- ✅ インポート・エクスポート
- ✅ グローバルホットキー（⌘+⌘）
- ✅ オフライン優先動作

### UX Layer（体験機能）
- ✅ 瞬時起動（<500ms）
- ✅ インクリメンタル検索
- ✅ キーボードショートカット体系
- ⏳ ドラッグ&ドロップ操作
- ⏳ リアルタイムプレビュー

### Collaboration Layer（協業機能）
- ⏳ クラウド同期
- ⏳ チーム・ワークスペース
- ⏳ プロンプト共有・公開
- ⏳ バージョン管理・履歴
- ⏳ コメント・レビューシステム

### Intelligence Layer（AI支援機能）
- 🔮 プロンプト最適化提案
- 🔮 使用頻度・効果分析
- 🔮 AIによる自動タグ付け
- 🔮 類似プロンプト検索
- 🔮 A/Bテスト機能

### Ecosystem Layer（統合機能）
- 🔮 ブラウザ拡張連携
- 🔮 API/CLI統合
- 🔮 外部ツール統合
- 🔮 プラグインシステム

**凡例**: ✅ Phase 1 / ⏳ Phase 2-3 / 🔮 Phase 4+

## 2. Phase別機能分類・優先順位

### 🎯 Phase 1: MVP Core（必須機能）
| 機能 | 重要度 | 理由 |
|------|--------|------|
| プロンプト CRUD | 🔴 必須 | 基本価値提供 |
| ローカルストレージ | 🔴 必須 | 高速・オフライン動作 |
| グローバルホットキー | 🔴 必須 | 差別化の核心 |
| 基本検索 | 🔴 必須 | プロンプト発見性 |
| 瞬時起動 | 🔴 必須 | UX差別化 |

### 🚀 Phase 2-6: 拡張機能
| Phase | 機能群 | 価値提供 |
|-------|--------|----------|
| **Phase 2** | 高度検索、タグ、履歴 | 個人生産性向上 |
| **Phase 3** | クラウド同期、共有 | デバイス間連携 |
| **Phase 4** | チーム機能、レビュー | 組織価値提供 |
| **Phase 5** | AI支援、分析 | インテリジェント化 |
| **Phase 6** | 外部統合、プラグイン | エコシステム構築 |

## 3. アーキテクチャ設計

### 技術スタック
```
┌─────────────────────────────────────┐
│     Presentation Layer (React)      │
├─────────────────────────────────────┤
│    Application Layer (Hooks/Store)  │
├─────────────────────────────────────┤
│      Domain Layer (Models)          │
├─────────────────────────────────────┤
│  Infrastructure Layer (Tauri/API)   │
└─────────────────────────────────────┘
```

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Tauri (Rust) + SQLite
- **State**: Zustand (軽量、拡張性重視)
- **Testing**: Vitest + React Testing Library

### ディレクトリ構成
```
apps/native/
├── src/                          # React Frontend
│   ├── components/               # UI Components
│   │   ├── common/              # 共通コンポーネント
│   │   ├── prompt/              # プロンプト関連
│   │   └── search/              # 検索関連
│   ├── hooks/                   # Custom Hooks
│   ├── stores/                  # Zustand Store
│   ├── services/                # API Client
│   ├── utils/                   # Utilities
│   └── types/                   # TypeScript Types
├── src-tauri/                   # Tauri Backend
│   ├── src/
│   │   ├── commands/            # Tauri Commands
│   │   ├── database/            # SQLite Operations
│   │   ├── global_hotkey/       # ホットキー管理
│   │   └── storage/             # ファイルストレージ
└── tests/                       # E2E Tests
```

### 拡張性設計
**1. モジュラー設計**
```typescript
interface PromptModule {
  create: (prompt: CreatePromptRequest) => Promise<Prompt>
  search: (query: SearchQuery) => Promise<Prompt[]>
  // 将来: optimize, analyze, etc.
}
```

**2. プラグインアーキテクチャ準備**
```rust
trait PromptPlugin {
    fn process(&self, prompt: &Prompt) -> Result<Prompt>;
}
```

## 4. 開発サイクル

### 基本原則
**「小さく完璧に → 段階的拡張」**

```
Phase X.0 (新機能導入) → Phase X.1 (品質向上) → Phase X.2 (体験改善)
     ↓                        ↓                         ↓
   2-3週間                  2-3週間                   2-3週間
```

### 品質ゲート（各フェーズ必須）
| 項目 | 基準 | 確認方法 |
|------|------|----------|
| テストカバレッジ | 90%+ | `pnpm test --coverage` |
| 型安全性 | エラー0 | `pnpm typecheck` |
| コード品質 | 警告0 | `pnpm lint` |
| パフォーマンス | 起動<500ms | パフォーマンステスト |
| ユーザビリティ | タスク完了率95%+ | ユーザーテスト |

## 5. Phase 1.0 実装計画（6週間）

### Week by Week スケジュール

#### Week 1-2: 基盤構築 Foundation
| Week | タスク | 成果物 | 品質指標 |
|------|--------|--------|----------|
| 1 | • Tauri プロジェクト初期化<br/>• 基本React構成<br/>• SQLite設計 | 動作するスケルトン | ビルド成功、テスト実行可能 |
| 2 | • 共通コンポーネント<br/>• 状態管理(Zustand)<br/>• 基本ルーティング | 基本UI画面 | TypeScript エラー0、ESLint通過 |

#### Week 3-4: コア機能実装 Core Features
| Week | タスク | 成果物 | 品質指標 |
|------|--------|--------|----------|
| 3 | • プロンプト CRUD<br/>• SQLite操作層<br/>• 基本フォーム | データ永続化機能 | 単体テスト 90%カバレッジ |
| 4 | • 検索機能<br/>• グローバルホットキー<br/>• UI統合 | MVP機能完成 | 統合テスト通過、起動<1s |

#### Week 5-6: 品質向上 Quality & Polish
| Week | タスク | 成果物 | 品質指標 |
|------|--------|--------|----------|
| 5 | • パフォーマンス最適化<br/>• エラーハンドリング<br/>• E2Eテスト | 安定版 | 起動<500ms、クラッシュ0 |
| 6 | • UI/UX改善<br/>• ドキュメント<br/>• リリース準備 | MVP v1.0 | ユーザビリティテスト合格 |

### 技術実装詳細

#### データモデル設計
```sql
-- prompts.sql
CREATE TABLE prompts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_updated ON prompts(updated_at);
```

#### Tauri Commands
```rust
// src-tauri/src/commands/prompts.rs
#[tauri::command]
pub async fn create_prompt(prompt: CreatePromptRequest) -> Result<Prompt, String>

#[tauri::command] 
pub async fn search_prompts(query: String) -> Result<Vec<Prompt>, String>

#[tauri::command]
pub async fn register_global_hotkey() -> Result<(), String>
```

### テスト戦略

#### 1. 単体テスト（Week 3-4）
```typescript
// __tests__/stores/prompt.test.ts
describe('PromptStore', () => {
  it('should create prompt successfully', () => {
    // テスト実装
  })
})
```

#### 2. 統合テスト（Week 4-5）
```typescript
// __tests__/integration/prompt-flow.test.ts
describe('Prompt Management Flow', () => {
  it('should create, search, and edit prompt', () => {
    // E2Eフロー テスト
  })
})
```

#### 3. パフォーマンステスト（Week 5）
- 起動時間 < 500ms
- 検索レスポンス < 100ms
- メモリ使用量 < 100MB

## 6. リスク管理

| リスク | 影響度 | 対策 |
|--------|--------|------|
| Tauri学習コスト | 中 | Week1で技術検証、早期プロトタイプ |
| パフォーマンス目標未達 | 高 | Week2から継続的ベンチマーク |
| ユーザビリティ問題 | 中 | Week4からユーザーテスト開始 |

## 7. 成功指標

### Phase 1.0 完了時の目標
- ⚡ 起動時間 < 500ms
- 🎯 基本操作完了率 95%+
- 🧪 テストカバレッジ 90%+
- 📊 メモリ使用量 < 100MB
- 🚀 ユーザビリティスコア 4.5+/5.0

## 8. Next Actions

### 即座に着手すべきタスク

1. **環境構築**
   ```bash
   cd apps/native
   npm create tauri-app
   ```

2. **技術検証（Week 1 Priority）**
   - Tauri + React 基本構成確認
   - SQLite 連携テスト  
   - グローバルホットキー実装可能性検証

3. **プロジェクト管理準備**
   - GitHub Issues テンプレート作成
   - CI/CD パイプライン設計
   - テストカバレッジ設定

---

*このドキュメントは Phase 1.0 の実装開始と同時に、継続的に更新されます。*