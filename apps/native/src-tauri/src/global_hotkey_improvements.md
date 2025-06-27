# グローバルホットキー実装の改善提案

## 1. セキュリティ面の強化

### 現状の問題点
- プロンプトの内容がログに出力される可能性がある
- イベント通知でプロンプト全文が送信されている

### 改善案
```rust
// イベント通知では機密情報を除外
if let Err(e) = app_handle.emit("palette-pasted", serde_json::json!({
    "position": position,
    "success": true,
    "timestamp": chrono::Utc::now().to_rfc3339()
})) {
    // プロンプト内容は送信しない
}
```

## 2. キー設定のカスタマイズ機能

### 現状の問題点
- ハードコードされたキー設定 (Cmd+Ctrl+数字)
- ユーザーによる変更不可

### 改善案
```rust
// 設定ファイルからホットキーを読み込む
pub struct HotkeyConfig {
    pub modifier1: String, // "CommandOrControl"
    pub modifier2: String, // "Control"
    pub enabled: bool,
}

// ユーザー設定を反映
fn load_palette_hotkeys() -> Vec<(u8, String)> {
    // 設定ファイルから読み込み
}
```

## 3. エラーハンドリングの改善

### 現状の問題点
- AppleScriptエラー時の詳細情報不足
- アクセシビリティ権限エラーの検出不足

### 改善案
```rust
fn check_accessibility_permission() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        // macOSのアクセシビリティ権限確認
        use cocoa::appkit::NSApplication;
        // 実装...
    }
    Ok(true)
}
```

## 4. ホットキー衝突検出

### 現状の問題点
- 他アプリとのキー衝突検出なし
- システムショートカットとの競合チェックなし

### 改善案
```rust
pub async fn detect_hotkey_conflicts(hotkey: &str) -> Vec<ConflictInfo> {
    // システムショートカットとの衝突検出
    // 既知のアプリケーションとの衝突検出
}
```

## 5. パフォーマンス最適化

### 現状の問題点
- 毎回プロンプト全件を取得している
- キャッシュ機構なし

### 改善案
```rust
// メモリキャッシュの実装
static PINNED_PROMPTS_CACHE: OnceLock<Mutex<HashMap<u8, String>>> = OnceLock::new();

async fn get_cached_prompt(position: u8) -> Option<String> {
    // キャッシュから取得
}
```

## 6. テスト戦略の強化

### 必要なテスト
- キーイベントのモック化
- クリップボード操作のテスト
- 権限エラー時の動作確認

### 実装例
```rust
#[cfg(test)]
mod integration_tests {
    #[test]
    async fn test_hotkey_paste_flow() {
        // モックセットアップ
        // ホットキー押下シミュレーション
        // クリップボード確認
    }
}
```

## 7. アクセシビリティ対応

### 改善案
- スクリーンリーダー対応の通知
- キーボードのみでの設定変更
- 視覚的フィードバック（成功/失敗の表示）

## 8. 将来の拡張性

### Windows/Linux対応準備
```rust
trait PlatformHotkey {
    async fn register_hotkey(&self, key: &str) -> Result<(), Error>;
    async fn send_paste(&self) -> Result<(), Error>;
}

// プラットフォーム別実装
struct MacOSHotkey;
struct WindowsHotkey;
struct LinuxHotkey;
```