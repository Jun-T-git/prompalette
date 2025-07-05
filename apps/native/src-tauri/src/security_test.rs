#[cfg(test)]
mod security_tests {
    use crate::security::{UpdateSecurity, SignatureError, VersionError};
    use crate::environment::Environment;
    use ed25519_dalek::{SigningKey, Signer};
    use rand::{rngs::OsRng, RngCore};
    use base64::{Engine as _, engine::general_purpose};

    #[test]
    fn test_signature_verification_success() {
        // キーペア生成（暗号学的に安全な乱数生成器を使用）
        let mut csprng = OsRng;
        let mut secret_key_bytes = [0u8; 32];
        csprng.fill_bytes(&mut secret_key_bytes);
        let signing_key = SigningKey::from_bytes(&secret_key_bytes);
        let verifying_key = signing_key.verifying_key();
        
        // テストデータ
        let data = b"test update data";
        
        // 署名生成
        let signature = signing_key.sign(data);
        
        // Base64エンコード
        let signature_b64 = general_purpose::STANDARD.encode(signature.to_bytes());
        let public_key_b64 = general_purpose::STANDARD.encode(verifying_key.to_bytes());
        
        // 検証
        let result = UpdateSecurity::verify_signature(data, &signature_b64, &public_key_b64);
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[test]
    fn test_signature_verification_invalid_signature() {
        // キーペア生成（暗号学的に安全な乱数生成器を使用）
        let mut csprng = OsRng;
        let mut secret_key_bytes = [0u8; 32];
        csprng.fill_bytes(&mut secret_key_bytes);
        let signing_key = SigningKey::from_bytes(&secret_key_bytes);
        let verifying_key = signing_key.verifying_key();
        
        // テストデータ
        let data = b"test update data";
        let wrong_data = b"wrong data";
        
        // 間違ったデータで署名生成
        let signature = signing_key.sign(wrong_data);
        
        // Base64エンコード
        let signature_b64 = general_purpose::STANDARD.encode(signature.to_bytes());
        let public_key_b64 = general_purpose::STANDARD.encode(verifying_key.to_bytes());
        
        // 検証（失敗するはず）
        let result = UpdateSecurity::verify_signature(data, &signature_b64, &public_key_b64);
        assert!(result.is_err());
        match result.unwrap_err() {
            SignatureError::VerificationFailed(msg) => assert!(msg.contains("Verification error")),
            _ => panic!("Expected VerificationFailed error"),
        }
    }

    #[test]
    fn test_signature_verification_invalid_base64() {
        let data = b"test data";
        let invalid_b64 = "invalid base64!!!";
        let valid_key = "dGVzdCBrZXk="; // "test key" in base64
        
        let result = UpdateSecurity::verify_signature(data, invalid_b64, valid_key);
        assert!(result.is_err());
        match result.unwrap_err() {
            SignatureError::InvalidSignature(msg) => assert!(msg.contains("Base64 decode error")),
            _ => panic!("Expected InvalidSignature error"),
        }
    }

    #[test]
    fn test_signature_verification_empty_data() {
        // エッジケース: 空のデータ
        let mut csprng = OsRng;
        let mut secret_key_bytes = [0u8; 32];
        csprng.fill_bytes(&mut secret_key_bytes);
        let signing_key = SigningKey::from_bytes(&secret_key_bytes);
        let verifying_key = signing_key.verifying_key();
        
        let data = b"";
        let signature = signing_key.sign(data);
        
        let signature_b64 = general_purpose::STANDARD.encode(signature.to_bytes());
        let public_key_b64 = general_purpose::STANDARD.encode(verifying_key.to_bytes());
        
        let result = UpdateSecurity::verify_signature(data, &signature_b64, &public_key_b64);
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[test]
    fn test_signature_verification_large_data() {
        // エッジケース: 大きなデータ（1MB）
        let mut csprng = OsRng;
        let mut secret_key_bytes = [0u8; 32];
        csprng.fill_bytes(&mut secret_key_bytes);
        let signing_key = SigningKey::from_bytes(&secret_key_bytes);
        let verifying_key = signing_key.verifying_key();
        
        let data: Vec<u8> = vec![0xAB; 1024 * 1024]; // 1MB
        let signature = signing_key.sign(&data);
        
        let signature_b64 = general_purpose::STANDARD.encode(signature.to_bytes());
        let public_key_b64 = general_purpose::STANDARD.encode(verifying_key.to_bytes());
        
        let result = UpdateSecurity::verify_signature(&data, &signature_b64, &public_key_b64);
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[test]
    fn test_signature_verification_wrong_key_size() {
        // エッジケース: 間違った鍵サイズ
        let data = b"test data";
        let wrong_size_key = general_purpose::STANDARD.encode(&[0u8; 16]); // 16 bytes instead of 32
        let valid_signature = general_purpose::STANDARD.encode(&[0u8; 64]);
        
        let result = UpdateSecurity::verify_signature(data, &valid_signature, &wrong_size_key);
        assert!(result.is_err());
        match result.unwrap_err() {
            SignatureError::InvalidPublicKey(msg) => assert!(msg.contains("Expected 32 bytes")),
            _ => panic!("Expected InvalidPublicKey error"),
        }
    }

    #[test]
    fn test_signature_verification_wrong_signature_size() {
        // エッジケース: 間違った署名サイズ
        let data = b"test data";
        let valid_key = general_purpose::STANDARD.encode(&[0u8; 32]);
        let wrong_size_sig = general_purpose::STANDARD.encode(&[0u8; 32]); // 32 bytes instead of 64
        
        let result = UpdateSecurity::verify_signature(data, &wrong_size_sig, &valid_key);
        assert!(result.is_err());
        match result.unwrap_err() {
            SignatureError::InvalidSignature(msg) => assert!(msg.contains("Expected 64 bytes")),
            _ => panic!("Expected InvalidSignature error"),
        }
    }

    #[test]
    fn test_version_validation_production() {
        // 有効な本番バージョン
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0", Environment::Production).is_ok());
        assert!(UpdateSecurity::validate_version_for_environment("2.1.3", Environment::Production).is_ok());
        
        // 無効な本番バージョン（プレリリース）
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-staging", Environment::Production).is_err());
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-dev", Environment::Production).is_err());
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-alpha", Environment::Production).is_err());
    }

    #[test]
    fn test_version_validation_staging() {
        // 有効なステージングバージョン
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-staging", Environment::Staging).is_ok());
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-staging.1", Environment::Staging).is_ok());
        
        // 無効なステージングバージョン
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0", Environment::Staging).is_err());
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-dev", Environment::Staging).is_err());
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-alpha", Environment::Staging).is_err());
    }

    #[test]
    fn test_version_validation_development() {
        // 有効な開発バージョン
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-dev", Environment::Development).is_ok());
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-staging", Environment::Development).is_ok());
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0-alpha", Environment::Development).is_ok());
        
        // 無効な開発バージョン（本番）
        assert!(UpdateSecurity::validate_version_for_environment("1.0.0", Environment::Development).is_err());
    }

    #[test]
    fn test_version_validation_invalid_format() {
        let invalid_versions = vec![
            "invalid",
            "1.0",
            "v1.0.0", // v prefix not allowed in semver
            "1.0.0.0", // four parts not allowed
            "",
        ];
        
        for version in invalid_versions {
            let result = UpdateSecurity::validate_version_for_environment(version, Environment::Production);
            assert!(result.is_err());
            assert!(matches!(result.unwrap_err(), VersionError::InvalidFormat));
        }
    }

    #[test]
    fn test_comprehensive_update_validation() {
        // キーペア生成（暗号学的に安全な乱数生成器を使用）
        let mut csprng = OsRng;
        let mut secret_key_bytes = [0u8; 32];
        csprng.fill_bytes(&mut secret_key_bytes);
        let signing_key = SigningKey::from_bytes(&secret_key_bytes);
        let verifying_key = signing_key.verifying_key();
        
        // テストデータ
        let data = b"valid update data";
        let version = "1.0.0";
        let environment = Environment::Production;
        
        // 署名生成
        let signature = signing_key.sign(data);
        let signature_b64 = general_purpose::STANDARD.encode(signature.to_bytes());
        let public_key_b64 = general_purpose::STANDARD.encode(verifying_key.to_bytes());
        
        // 包括的検証（成功ケース）
        let result = UpdateSecurity::validate_update(
            version,
            data,
            &signature_b64,
            &public_key_b64,
            environment,
        );
        assert!(result.is_ok());
        assert!(result.unwrap());
    }

    #[test]
    fn test_comprehensive_update_validation_version_mismatch() {
        // キーペア生成（暗号学的に安全な乱数生成器を使用）
        let mut csprng = OsRng;
        let mut secret_key_bytes = [0u8; 32];
        csprng.fill_bytes(&mut secret_key_bytes);
        let signing_key = SigningKey::from_bytes(&secret_key_bytes);
        let verifying_key = signing_key.verifying_key();
        
        // テストデータ
        let data = b"valid update data";
        let invalid_version = "1.0.0-staging"; // 本番環境にステージングバージョン
        let environment = Environment::Production;
        
        // 署名生成
        let signature = signing_key.sign(data);
        let signature_b64 = general_purpose::STANDARD.encode(signature.to_bytes());
        let public_key_b64 = general_purpose::STANDARD.encode(verifying_key.to_bytes());
        
        // 包括的検証（バージョン不整合で失敗）
        let result = UpdateSecurity::validate_update(
            invalid_version,
            data,
            &signature_b64,
            &public_key_b64,
            environment,
        );
        assert!(result.is_err());
    }

    #[test]
    fn test_comprehensive_update_validation_signature_failure() {
        // キーペア生成（暗号学的に安全な乱数生成器を使用）
        let mut csprng = OsRng;
        let mut secret_key_bytes = [0u8; 32];
        csprng.fill_bytes(&mut secret_key_bytes);
        let signing_key = SigningKey::from_bytes(&secret_key_bytes);
        let verifying_key = signing_key.verifying_key();
        
        // テストデータ
        let data = b"valid update data";
        let wrong_data = b"tampered data";
        let version = "1.0.0";
        let environment = Environment::Production;
        
        // 間違ったデータで署名生成
        let signature = signing_key.sign(wrong_data);
        let signature_b64 = general_purpose::STANDARD.encode(signature.to_bytes());
        let public_key_b64 = general_purpose::STANDARD.encode(verifying_key.to_bytes());
        
        // 包括的検証（署名検証で失敗）
        let result = UpdateSecurity::validate_update(
            version,
            data, // 正しいデータだが署名は間違ったデータで生成
            &signature_b64,
            &public_key_b64,
            environment,
        );
        assert!(result.is_err());
    }
}

