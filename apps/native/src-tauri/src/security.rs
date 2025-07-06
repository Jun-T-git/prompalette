/*!
 * セキュリティ関連機能
 * アップデートの署名検証とバージョン管理
 */

use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use semver::Version;
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use base64::{Engine as _, engine::general_purpose};

use crate::environment::Environment;

/// 署名検証エラー
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SignatureError {
    InvalidPublicKey(String),
    InvalidSignature(String),
    InvalidData(String),
    VerificationFailed(String),
}

impl std::fmt::Display for SignatureError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SignatureError::InvalidPublicKey(detail) => write!(f, "Invalid public key format: {}", detail),
            SignatureError::InvalidSignature(detail) => write!(f, "Invalid signature format: {}", detail),
            SignatureError::InvalidData(detail) => write!(f, "Invalid data to verify: {}", detail),
            SignatureError::VerificationFailed(detail) => write!(f, "Signature verification failed: {}", detail),
        }
    }
}

impl std::error::Error for SignatureError {}

/// バージョン判定エラー
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VersionError {
    InvalidFormat,
    EnvironmentMismatch,
}

impl std::fmt::Display for VersionError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            VersionError::InvalidFormat => write!(f, "Invalid version format"),
            VersionError::EnvironmentMismatch => write!(f, "Version does not match environment"),
        }
    }
}

impl std::error::Error for VersionError {}

/// アップデートセキュリティ検証
pub struct UpdateSecurity;

impl UpdateSecurity {
    /// アップデートファイルの署名を検証
    /// 
    /// # Arguments
    /// * `data` - 検証対象のデータ
    /// * `signature_base64` - Base64エンコードされた署名
    /// * `public_key_base64` - Base64エンコードされた公開鍵
    /// 
    /// # Returns
    /// 検証成功時は`Ok(true)`、失敗時は対応するエラー
    pub fn verify_signature(
        data: &[u8],
        signature_base64: &str,
        public_key_base64: &str,
    ) -> Result<bool, SignatureError> {
        // 入力パラメータの基本検証
        if data.is_empty() {
            return Err(SignatureError::InvalidData("Empty data provided".to_string()));
        }
        
        if signature_base64.trim().is_empty() {
            return Err(SignatureError::InvalidSignature("Empty signature provided".to_string()));
        }
        
        if public_key_base64.trim().is_empty() {
            return Err(SignatureError::InvalidPublicKey("Empty public key provided".to_string()));
        }
        // Base64デコード
        let public_key_bytes = general_purpose::STANDARD.decode(public_key_base64)
            .map_err(|e| SignatureError::InvalidPublicKey(format!("Base64 decode error: {}", e)))?;
        
        let signature_bytes = general_purpose::STANDARD.decode(signature_base64)
            .map_err(|e| SignatureError::InvalidSignature(format!("Base64 decode error: {}", e)))?;

        // 公開鍵の復元
        let public_key_len = public_key_bytes.len();
        let public_key_array: [u8; 32] = public_key_bytes.try_into()
            .map_err(|_| SignatureError::InvalidPublicKey(
                format!("Expected 32 bytes, got {}", public_key_len)
            ))?;
        
        let public_key = VerifyingKey::from_bytes(&public_key_array)
            .map_err(|e| SignatureError::InvalidPublicKey(format!("Key parsing error: {}", e)))?;

        // 署名の復元
        let signature_len = signature_bytes.len();
        let signature_array: [u8; 64] = signature_bytes.try_into()
            .map_err(|_| SignatureError::InvalidSignature(
                format!("Expected 64 bytes, got {}", signature_len)
            ))?;
        
        let signature = Signature::from_bytes(&signature_array);

        // 署名検証
        public_key
            .verify(data, &signature)
            .map(|_| true)
            .map_err(|e| SignatureError::VerificationFailed(format!("Verification error: {}", e)))
    }

    /// バージョンが環境に適合するかチェック
    /// 
    /// # Arguments
    /// * `version_str` - バージョン文字列
    /// * `environment` - 現在の環境
    /// 
    /// # Returns
    /// 適合時は`Ok(true)`、不適合時は対応するエラー
    pub fn validate_version_for_environment(
        version_str: &str,
        environment: Environment,
    ) -> Result<bool, VersionError> {
        // セマンティックバージョニングでパース
        let version = Version::from_str(version_str)
            .map_err(|_| VersionError::InvalidFormat)?;

        // プレリリース識別子による環境判定
        let is_valid = match environment {
            Environment::Production => {
                // 本番環境: プレリリース識別子なし
                version.pre.is_empty()
            }
            Environment::Staging => {
                // ステージング環境: "staging" を含む
                version.pre.as_str().contains("staging")
            }
            Environment::Development => {
                // 開発環境: "dev" または "staging" を含む
                let pre_str = version.pre.as_str();
                pre_str.contains("dev") || pre_str.contains("staging") || !version.pre.is_empty()
            }
        };

        if is_valid {
            Ok(true)
        } else {
            Err(VersionError::EnvironmentMismatch)
        }
    }

    /// アップデート情報の包括的セキュリティ検証
    /// 
    /// # Arguments
    /// * `version` - バージョン文字列
    /// * `data` - アップデートファイルデータ
    /// * `signature` - 署名（Base64）
    /// * `public_key` - 公開鍵（Base64）
    /// * `environment` - 現在の環境
    /// 
    /// # Returns
    /// 全ての検証をパスした場合のみ`Ok(true)`
    pub fn validate_update(
        version: &str,
        data: &[u8],
        signature: &str,
        public_key: &str,
        environment: Environment,
    ) -> Result<bool, Box<dyn std::error::Error>> {
        // バージョン検証
        Self::validate_version_for_environment(version, environment)?;

        // 署名検証
        Self::verify_signature(data, signature, public_key)?;

        Ok(true)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_version_validation_production() {
        // 本番環境では正式バージョンのみ許可
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0", Environment::Production).is_ok());
        assert!(UpdateSecurity::validate_version_for_environment("2.1.3", Environment::Production).is_ok());
        
        // プレリリースは拒否
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-staging", Environment::Production).is_err());
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-dev", Environment::Production).is_err());
    }

    #[test]
    fn test_version_validation_staging() {
        // ステージング環境では"staging"を含むバージョンのみ許可
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-staging", Environment::Staging).is_ok());
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-staging.1", Environment::Staging).is_ok());
        
        // 本番バージョンは拒否
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0", Environment::Staging).is_err());
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-dev", Environment::Staging).is_err());
    }

    #[test]
    fn test_version_validation_development() {
        // 開発環境では"dev"、"staging"、その他プレリリースを許可
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-dev", Environment::Development).is_ok());
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-staging", Environment::Development).is_ok());
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-alpha", Environment::Development).is_ok());
        
        // 本番バージョンは拒否
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0", Environment::Development).is_err());
    }

    #[test]
    fn test_invalid_version_format() {
        assert!(UpdateSecurity::validate_version_for_environment("invalid", Environment::Production).is_err());
        assert!(UpdateSecurity::validate_version_for_environment("1.0", Environment::Production).is_err());
    }
    
    #[test]
    fn test_empty_data_verification() {
        let result = UpdateSecurity::verify_signature(
            &[],
            "dummy_signature",
            "dummy_public_key"
        );
        assert!(matches!(result, Err(SignatureError::InvalidData(_))));
    }
    
    #[test]
    fn test_empty_signature_verification() {
        let result = UpdateSecurity::verify_signature(
            b"test data",
            "",
            "dummy_public_key"
        );
        assert!(matches!(result, Err(SignatureError::InvalidSignature(_))));
    }
    
    #[test]
    fn test_empty_public_key_verification() {
        let result = UpdateSecurity::verify_signature(
            b"test data",
            "dummy_signature",
            ""
        );
        assert!(matches!(result, Err(SignatureError::InvalidPublicKey(_))));
    }
    
    #[test]
    fn test_invalid_base64_public_key() {
        let result = UpdateSecurity::verify_signature(
            b"test data",
            "dummy_signature",
            "invalid!!!base64"
        );
        assert!(matches!(result, Err(SignatureError::InvalidPublicKey(_))));
    }
    
    #[test]
    fn test_invalid_base64_signature() {
        // Valid 32-byte public key in base64
        let valid_public_key_base64 = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
        let result = UpdateSecurity::verify_signature(
            b"test data",
            "invalid!!!base64",
            valid_public_key_base64
        );
        assert!(matches!(result, Err(SignatureError::InvalidSignature(_))));
    }
}