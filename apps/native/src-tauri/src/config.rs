/*!
 * アプリケーション設定モジュール
 * 
 * 将来の拡張を考慮した最小限の設定構造
 * YAGNI原則に従い、現時点では定数定義のみ
 */

pub mod update_config;

/// ショートカットキー設定
pub mod shortcuts {
    /// クイックランチャーのデフォルトショートカット
    /// 
    /// プラットフォーム依存:
    /// - Windows/Linux: Ctrl+Shift+P
    /// - macOS: Cmd+Shift+P
    pub const QUICK_LAUNCHER: &str = "CommandOrControl+Shift+P";
}

/// 検索設定
pub mod search {
    /// リアルタイム検索のデバウンス時間（ミリ秒）
    #[allow(dead_code)]
    pub const DEBOUNCE_MS: u64 = 150;
    
    /// 検索結果の最大表示件数
    #[allow(dead_code)]
    pub const MAX_RESULTS: i32 = 20;
}

// 将来的な拡張例（コメントアウト）
// 
// #[derive(Debug, serde::Serialize, serde::Deserialize)]
// pub struct AppConfig {
//     pub shortcuts: ShortcutConfig,
//     pub search: SearchConfig,
// }
// 
// impl AppConfig {
//     pub fn load() -> Result<Self, Box<dyn std::error::Error>> {
//         // 設定ファイルからの読み込み
//     }
//     
//     pub fn save(&self) -> Result<(), Box<dyn std::error::Error>> {
//         // 設定ファイルへの保存
//     }
// }