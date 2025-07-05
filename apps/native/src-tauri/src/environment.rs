/*!
 * 環境設定モジュール
 * 開発・ステージング・本番環境の分離を管理
 */

use std::env;
use std::path::PathBuf;
use std::fmt;

/// アプリケーション環境
#[derive(Debug, Clone, PartialEq)]
pub enum Environment {
    Development,
    Staging,
    Production,
}

impl Environment {
    /// 環境変数から現在の環境を取得
    pub fn current() -> Self {
        match env::var("APP_ENV").as_deref() {
            Ok("development") => Environment::Development,
            Ok("staging") => Environment::Staging,
            Ok("production") => Environment::Production,
            _ => {
                // デフォルトは開発環境
                if cfg!(debug_assertions) {
                    Environment::Development
                } else {
                    Environment::Production
                }
            }
        }
    }

    /// 環境固有のアプリケーション識別子を取得
    pub fn app_identifier(&self) -> &'static str {
        match self {
            Environment::Development => "com.prompalette.app.dev",
            Environment::Staging => "com.prompalette.app.staging",
            Environment::Production => "com.prompalette.app",
        }
    }

    /// 環境固有のアプリケーション名を取得
    pub fn app_name(&self) -> &'static str {
        match self {
            Environment::Development => "PromPalette Dev",
            Environment::Staging => "PromPalette Staging",
            Environment::Production => "PromPalette",
        }
    }

    /// 環境固有のデータディレクトリパスを取得
    pub fn data_dir(&self) -> Result<PathBuf, Box<dyn std::error::Error>> {
        let base_dir = if cfg!(target_os = "macos") {
            env::var("HOME")
                .map(|home| PathBuf::from(home).join("Library/Application Support"))
                .map_err(|_| "Cannot find HOME directory on macOS")?
        } else if cfg!(target_os = "windows") {
            env::var("APPDATA")
                .map(PathBuf::from)
                .map_err(|_| "Cannot find APPDATA directory on Windows")?
        } else {
            env::var("HOME")
                .map(|home| PathBuf::from(home).join(".config"))
                .map_err(|_| "Cannot find HOME directory on Linux")?
        };

        let app_dir = match self {
            Environment::Development => base_dir.join("PromPalette-Dev"),
            Environment::Staging => base_dir.join("PromPalette-Staging"),
            Environment::Production => base_dir.join("PromPalette"),
        };

        Ok(app_dir)
    }

    /// 環境固有のデータベースファイル名を取得
    pub fn database_filename(&self) -> &'static str {
        match self {
            Environment::Development => "prompalette-dev.db",
            Environment::Staging => "prompalette-staging.db",
            Environment::Production => "prompalette.db",
        }
    }

    /// 環境固有のウィンドウタイトルを取得
    pub fn window_title(&self) -> &'static str {
        match self {
            Environment::Development => "PromPalette [DEV]",
            Environment::Staging => "PromPalette [STAGING]",
            Environment::Production => "PromPalette",
        }
    }

    /// 環境固有のアイコンサフィックスを取得
    #[allow(dead_code)]
    pub fn icon_suffix(&self) -> &'static str {
        match self {
            Environment::Development => "-dev",
            Environment::Staging => "-staging",
            Environment::Production => "",
        }
    }

    /// 本番環境かどうかを判定
    pub fn is_production(&self) -> bool {
        matches!(self, Environment::Production)
    }

    /// 環境名を文字列で取得
    pub fn name(&self) -> &'static str {
        match self {
            Environment::Development => "development",
            Environment::Staging => "staging",
            Environment::Production => "production",
        }
    }
}

impl fmt::Display for Environment {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.name())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_environment_from_env_var() {
        // 開発環境
        env::set_var("APP_ENV", "development");
        assert_eq!(Environment::current(), Environment::Development);

        // ステージング環境
        env::set_var("APP_ENV", "staging");
        assert_eq!(Environment::current(), Environment::Staging);

        // 本番環境
        env::set_var("APP_ENV", "production");
        assert_eq!(Environment::current(), Environment::Production);

        // 環境変数をクリア
        env::remove_var("APP_ENV");
    }

    #[test]
    fn test_app_identifier() {
        assert_eq!(Environment::Development.app_identifier(), "com.prompalette.app.dev");
        assert_eq!(Environment::Staging.app_identifier(), "com.prompalette.app.staging");
        assert_eq!(Environment::Production.app_identifier(), "com.prompalette.app");
    }

    #[test]
    fn test_app_name() {
        assert_eq!(Environment::Development.app_name(), "PromPalette Dev");
        assert_eq!(Environment::Staging.app_name(), "PromPalette Staging");
        assert_eq!(Environment::Production.app_name(), "PromPalette");
    }

    #[test]
    fn test_database_filename() {
        assert_eq!(Environment::Development.database_filename(), "prompalette-dev.db");
        assert_eq!(Environment::Staging.database_filename(), "prompalette-staging.db");
        assert_eq!(Environment::Production.database_filename(), "prompalette.db");
    }

    #[test]
    fn test_window_title() {
        assert_eq!(Environment::Development.window_title(), "PromPalette [DEV]");
        assert_eq!(Environment::Staging.window_title(), "PromPalette [STAGING]");
        assert_eq!(Environment::Production.window_title(), "PromPalette");
    }

    #[test]
    fn test_data_dir_structure() {
        // 各環境でディレクトリが異なることを確認
        let dev_dir = Environment::Development.data_dir().unwrap();
        let staging_dir = Environment::Staging.data_dir().unwrap();
        let prod_dir = Environment::Production.data_dir().unwrap();

        assert!(dev_dir.to_string_lossy().contains("PromPalette-Dev"));
        assert!(staging_dir.to_string_lossy().contains("PromPalette-Staging"));
        assert!(prod_dir.to_string_lossy().contains("PromPalette"));

        // 各環境のディレクトリが異なることを確認
        assert_ne!(dev_dir, staging_dir);
        assert_ne!(staging_dir, prod_dir);
        assert_ne!(dev_dir, prod_dir);
    }
}