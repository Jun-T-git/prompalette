/*!
 * Tauri設定管理モジュール
 * ビルド時に埋め込まれた設定を管理
 */

/// アップデーター用の公開鍵（ビルド時に設定）
pub const UPDATER_PUBKEY: Option<&str> = option_env!("PROMPALETTE_UPDATER_PUBKEY");

/// アップデーターの有効/無効（ビルド時に設定）
pub fn is_updater_active() -> bool {
    option_env!("PROMPALETTE_UPDATER_ACTIVE")
        .map(|v| v == "true")
        .unwrap_or(false)
}

/// 現在の環境を取得
pub fn current_environment() -> &'static str {
    option_env!("APP_ENV").unwrap_or("production")
}

/// アップデートエンドポイントURLを取得
pub fn get_update_endpoint() -> &'static str {
    match current_environment() {
        "development" => "https://github.com/Jun-T-git/prompalette/releases/download/latest-dev.json",
        "staging" => "https://github.com/Jun-T-git/prompalette/releases/download/latest-staging.json",
        _ => "https://github.com/Jun-T-git/prompalette/releases/latest/download/latest.json",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_updater_config() {
        // ビルド時の設定を確認
        println!("Updater active: {}", is_updater_active());
        println!("Updater pubkey: {:?}", UPDATER_PUBKEY);
        println!("Environment: {}", current_environment());
        println!("Update endpoint: {}", get_update_endpoint());
    }
}