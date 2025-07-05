/*!
 * アップデート設定管理
 * 外部設定ファイルと環境変数からの設定読み込み
 */

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

use crate::environment::Environment;

/// アップデート設定
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateConfiguration {
    /// 更新チェックの有効化
    pub updates_enabled: bool,
    /// 自動チェックの有効化
    pub auto_check_enabled: bool,
    /// 手動承認の必要性
    pub requires_manual_approval: bool,
    /// バックアップの有効化
    pub backup_enabled: bool,
    /// 公開鍵（環境別）
    pub public_keys: HashMap<String, String>,
    /// チェック間隔（分）
    pub check_interval_minutes: u32,
    /// バックアップ保持数
    pub backup_retention_count: u32,
}

impl Default for UpdateConfiguration {
    fn default() -> Self {
        let mut public_keys = HashMap::new();
        
        // デフォルト公開鍵（実際の運用では環境変数から読み込み）
        public_keys.insert("production".to_string(), std::env::var("PROMPALETTE_PROD_PUBLIC_KEY").unwrap_or_default());
        public_keys.insert("staging".to_string(), std::env::var("PROMPALETTE_STAGING_PUBLIC_KEY").unwrap_or_default());
        public_keys.insert("development".to_string(), std::env::var("PROMPALETTE_DEV_PUBLIC_KEY").unwrap_or_default());
        
        Self {
            updates_enabled: true,
            auto_check_enabled: true,
            requires_manual_approval: true,
            backup_enabled: true,
            public_keys,
            check_interval_minutes: 60, // 1時間
            backup_retention_count: 10,
        }
    }
}

impl UpdateConfiguration {
    /// 設定ファイルから読み込み
    pub fn load_from_file(config_path: &PathBuf) -> Result<Self, std::io::Error> {
        if config_path.exists() {
            let content = std::fs::read_to_string(config_path)?;
            let config: Self = serde_json::from_str(&content)
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e))?;
            Ok(config)
        } else {
            // 設定ファイルが存在しない場合はデフォルト設定を使用
            Ok(Self::default())
        }
    }
    
    /// 環境に対応する公開鍵を取得
    pub fn get_public_key_for_environment(&self, env: Environment) -> Option<&String> {
        let env_key = match env {
            Environment::Production => "production",
            Environment::Staging => "staging", 
            Environment::Development => "development",
        };
        
        self.public_keys.get(env_key).filter(|key| !key.is_empty())
    }
    
    /// 環境に適合した設定を生成
    pub fn for_environment(env: Environment) -> Self {
        let mut config = Self::default();
        
        // 環境別の設定調整
        match env {
            Environment::Production => {
                config.auto_check_enabled = true;
                config.requires_manual_approval = true;
            }
            Environment::Staging => {
                config.auto_check_enabled = false; // ステージングでは手動チェック
                config.requires_manual_approval = true;
            }
            Environment::Development => {
                config.auto_check_enabled = false;
                config.requires_manual_approval = false; // 開発環境では自動適用
                config.backup_enabled = true; // 開発環境でもバックアップは重要
            }
        }
        
        config
    }
    
    /// 設定の検証
    pub fn validate(&self) -> Result<(), String> {
        if self.check_interval_minutes == 0 {
            return Err("Check interval must be greater than 0".to_string());
        }
        
        if self.backup_retention_count == 0 {
            return Err("Backup retention count must be greater than 0".to_string());
        }
        
        // 本番環境では公開鍵が必須
        if self.updates_enabled {
            let prod_key = self.public_keys.get("production");
            if prod_key.is_none() || prod_key.unwrap().is_empty() {
                return Err("Production public key is required when updates are enabled".to_string());
            }
        }
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_default_configuration() {
        let config = UpdateConfiguration::default();
        assert!(config.updates_enabled);
        assert!(config.auto_check_enabled);
        assert!(config.requires_manual_approval);
        assert!(config.backup_enabled);
        assert_eq!(config.check_interval_minutes, 60);
        assert_eq!(config.backup_retention_count, 10);
    }

    #[test]
    fn test_environment_specific_config() {
        let prod_config = UpdateConfiguration::for_environment(Environment::Production);
        assert!(prod_config.auto_check_enabled);
        assert!(prod_config.requires_manual_approval);

        let dev_config = UpdateConfiguration::for_environment(Environment::Development);
        assert!(!dev_config.auto_check_enabled);
        assert!(!dev_config.requires_manual_approval);
        assert!(dev_config.backup_enabled);
    }

    #[test]
    fn test_public_key_retrieval() {
        let mut config = UpdateConfiguration::default();
        config.public_keys.insert("production".to_string(), "test-key".to_string());

        let key = config.get_public_key_for_environment(Environment::Production);
        assert_eq!(key, Some(&"test-key".to_string()));

        let empty_key = config.get_public_key_for_environment(Environment::Staging);
        assert!(empty_key.is_none() || empty_key.unwrap().is_empty());
    }

    #[test]
    fn test_configuration_validation() {
        let mut config = UpdateConfiguration::default();
        assert!(config.validate().is_ok());

        config.check_interval_minutes = 0;
        assert!(config.validate().is_err());

        config.check_interval_minutes = 60;
        config.backup_retention_count = 0;
        assert!(config.validate().is_err());
    }
}