/*!
 * アップデートURL設定モジュール
 * 環境別のアップデートエンドポイントを管理
 */

use crate::environment::Environment;
use serde::{Deserialize, Serialize};

/// アップデートURL設定
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateUrls {
    pub production: String,
    pub staging: String,
    pub development: String,
}

impl Default for UpdateUrls {
    fn default() -> Self {
        Self {
            // デフォルト値は環境変数でオーバーライド可能
            production: std::env::var("PROMPALETTE_UPDATE_URL_PRODUCTION")
                .unwrap_or_else(|_| "https://api.github.com/repos/Jun-T-git/prompalette/releases/latest".to_string()),
            staging: std::env::var("PROMPALETTE_UPDATE_URL_STAGING")
                .unwrap_or_else(|_| "https://api.github.com/repos/Jun-T-git/prompalette/releases".to_string()),
            development: std::env::var("PROMPALETTE_UPDATE_URL_DEVELOPMENT")
                .unwrap_or_else(|_| "https://api.github.com/repos/Jun-T-git/prompalette/releases".to_string()),
        }
    }
}

impl UpdateUrls {
    /// 環境に対応するURLを取得
    pub fn get_url_for_environment(&self, env: &Environment) -> &str {
        match env {
            Environment::Production => &self.production,
            Environment::Staging => &self.staging,
            Environment::Development => &self.development,
        }
    }

    /// 設定ファイルから読み込み
    pub fn load_from_file(path: &std::path::Path) -> Result<Self, Box<dyn std::error::Error>> {
        if path.exists() {
            let config_str = std::fs::read_to_string(path)?;
            let urls: Self = serde_json::from_str(&config_str)?;
            Ok(urls)
        } else {
            Ok(Self::default())
        }
    }

    /// 設定をマージ（環境変数 > 設定ファイル > デフォルト）
    pub fn merge_with_env(mut self) -> Self {
        if let Ok(url) = std::env::var("PROMPALETTE_UPDATE_URL_PRODUCTION") {
            self.production = url;
        }
        if let Ok(url) = std::env::var("PROMPALETTE_UPDATE_URL_STAGING") {
            self.staging = url;
        }
        if let Ok(url) = std::env::var("PROMPALETTE_UPDATE_URL_DEVELOPMENT") {
            self.development = url;
        }
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_urls() {
        let urls = UpdateUrls::default();
        assert!(urls.production.contains("releases/latest"));
        assert!(urls.staging.contains("releases"));
        assert!(urls.development.contains("releases"));
    }

    #[test]
    fn test_get_url_for_environment() {
        let urls = UpdateUrls {
            production: "https://prod.example.com".to_string(),
            staging: "https://staging.example.com".to_string(),
            development: "https://dev.example.com".to_string(),
        };

        assert_eq!(urls.get_url_for_environment(&Environment::Production), "https://prod.example.com");
        assert_eq!(urls.get_url_for_environment(&Environment::Staging), "https://staging.example.com");
        assert_eq!(urls.get_url_for_environment(&Environment::Development), "https://dev.example.com");
    }
}