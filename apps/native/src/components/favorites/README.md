# PromptPalette UI/UX Redesign

## 概要

PromptPaletteの包括的なUI/UXリデザインを実装し、使いやすさと視覚的な美しさのバランスを取りました。

## 実装されたコンポーネント

### 1. CompactPromptPalette
ヘッダーに最適化されたコンパクトなPromptPalette

**特徴:**
- **インジケーターモード**: ピン留め数を表示し、クリックで全パレットを展開
- **コンパクトモード**: 指定された数のスロットのみを表示
- レスポンシブデザイン対応
- 外部クリックで自動的に折りたたみ

**使用例:**
```tsx
// インジケーターモード（デスクトップヘッダー用）
<CompactPromptPalette mode="indicator" />

// コンパクトモード（タブレット/モバイル用）
<CompactPromptPalette mode="compact" maxVisible={3} />
```

### 2. SidebarPromptPalette
サイドバーに最適化された縦型レイアウト

**特徴:**
- 縦型レイアウトでスペース効率的
- 折りたたみ可能
- 詳細な情報表示（タイトル、内容、タグ）
- プロンプト数の表示

**使用例:**
```tsx
<SidebarPromptPalette 
  vertical={true}
  condensed={false}
  onSlotClick={handleSlotClick}
/>
```

### 3. ModalPromptPalette
モーダル表示での美しいパレット

**特徴:**
- 全画面オーバーレイ表示
- 大きなスロットサイズで視認性向上
- ESCキーで閉じる
- コピー後の自動クローズ

**使用例:**
```tsx
<ModalPromptPalette
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="プロンプトパレット"
/>
```

### 4. FloatingPromptPalette
ドラッグ可能なフローティングパレット

**特徴:**
- ドラッグ&ドロップで位置調整
- 最小化機能
- 自動非表示タイマー
- カスタマイズ可能な初期位置

**使用例:**
```tsx
<FloatingPromptPalette
  draggable={true}
  initialPosition={{ x: 100, y: 100 }}
  autoHideDelay={10000}
/>
```

### 5. PromptPaletteShowcase
全バリエーションのデモンストレーション

**特徴:**
- すべてのパレットタイプを一覧表示
- インタラクティブなデモ
- デザインガイドライン

## レスポンシブデザイン

### ブレークポイント戦略

| 画面サイズ | 表示モード | 説明 |
|-----------|-----------|------|
| xl+ (1280px+) | インジケーター | ピン留め数のみ表示、クリックで展開 |
| md-xl (768-1279px) | コンパクト(3スロット) | 最初の3スロットを表示 |
| -md (767px以下) | コンパクト(2スロット) | 最初の2スロットを表示 |

### CSS実装

```css
/* デスクトップ: インジケーターモード */
.hidden.xl\\:block.palette-indicator {
  /* 表示 */
}

/* タブレット: コンパクトモード */
.hidden.md\\:block.xl\\:hidden {
  /* 表示 */
}

/* モバイル: 最小コンパクトモード */
.block.md\\:hidden {
  /* 表示 */
}
```

## 視覚デザインの改善

### カラースキーム統一
- アプリケーション全体との一貫性
- 過度なグラデーションの削除
- 落ち着いた色合いでプロフェッショナルな印象

### インタラクション改善
- ホバーエフェクトの統一
- トランジションアニメーションの最適化
- アクセシビリティの向上

## UX改善点

### 1. プログレッシブディスクロージャー
- 必要最小限の情報から開始
- ユーザーの需要に応じて詳細を展開
- 認知負荷の軽減

### 2. コンテキスト対応
- ヘッダー、サイドバー、モーダルなど用途に応じた最適化
- 各レイアウトでの操作性向上

### 3. アクセシビリティ
- キーボードナビゲーション対応
- 適切なARIAラベル
- スクリーンリーダー対応

## 技術仕様

### Props Interface

```typescript
interface CompactPromptPaletteProps {
  className?: string
  onSlotClick?: (position: number, prompt: PinnedPrompt | null) => void
  mode?: 'indicator' | 'compact' | 'expanded'
  maxVisible?: number
}
```

### 状態管理
- useFavoritesStore との統合
- ローディング状態の適切な表示
- エラーハンドリング

### パフォーマンス
- 不要な再レンダリングの防止
- メモ化の適切な使用
- 軽量なコンポーネント設計

## テスト

### カバレッジ
- 全モードでの動作テスト
- インタラクションテスト
- エラーハンドリングテスト
- アクセシビリティテスト

### テスト実行
```bash
pnpm test CompactPromptPalette
```

## 統合方法

### App.tsx での使用例

```tsx
// レスポンシブヘッダー統合
<div className="flex items-center space-x-2 md:space-x-4">
  {/* デスクトップ: インジケーターモード */}
  <div className="hidden xl:block palette-indicator">
    <CompactPromptPalette mode="indicator" />
  </div>
  {/* タブレット: コンパクトモード */}
  <div className="hidden md:block xl:hidden">
    <CompactPromptPalette mode="compact" maxVisible={3} />
  </div>
  {/* モバイル: 最小コンパクトモード */}
  <div className="block md:hidden">
    <CompactPromptPalette mode="compact" maxVisible={2} />
  </div>
</div>
```

## 今後の拡張可能性

### 予定されている機能
- ドラッグ&ドロップでのスロット並び替え
- カスタムテーマサポート
- ホットキー設定のカスタマイズ
- プロンプトのプレビュー機能

### アーキテクチャの拡張性
- プラグイン式のレイアウト追加
- カスタムレンダラーのサポート
- サードパーティ統合API

## まとめ

このリデザインにより、PromptPaletteは以下の価値を提供します：

1. **使いやすさ**: 直感的で効率的な操作
2. **美しさ**: 洗練されたビジュアルデザイン
3. **適応性**: 様々なコンテキストでの最適な表示
4. **アクセシビリティ**: すべてのユーザーに配慮した設計
5. **拡張性**: 将来の機能追加に対応する柔軟なアーキテクチャ