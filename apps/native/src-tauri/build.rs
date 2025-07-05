use std::env;
use base64::{Engine as _, engine::general_purpose};

fn main() {
    // 環境変数から現在の環境を取得
    let app_env = std::env::var("APP_ENV").unwrap_or_else(|_| "production".to_string());
    
    // 環境に基づいて Tauri のビルド設定を調整
    match app_env.as_str() {
        "development" => {
            println!("cargo:rustc-env=APP_NAME=PromPalette Dev");
            println!("cargo:rustc-env=APP_IDENTIFIER=com.prompalette.app.dev");
        },
        "staging" => {
            println!("cargo:rustc-env=APP_NAME=PromPalette Staging");
            println!("cargo:rustc-env=APP_IDENTIFIER=com.prompalette.app.staging");
        },
        _ => {
            println!("cargo:rustc-env=APP_NAME=PromPalette");
            println!("cargo:rustc-env=APP_IDENTIFIER=com.prompalette.app");
        }
    }
    
    // 公開鍵の埋め込み処理
    configure_updater_public_key(&app_env);
    
    // デフォルトの Tauri ビルド処理
    tauri_build::build()
}

/// アップデーター用の公開鍵を設定に埋め込む
fn configure_updater_public_key(env_name: &str) {
    // 公開鍵を環境変数から取得
    let public_key_env = format!("PROMPALETTE_{}_PUBLIC_KEY", env_name.to_uppercase());
    let public_key = env::var(&public_key_env).unwrap_or_else(|_| {
        // CI環境では警告、ローカル開発では情報レベル
        if env::var("CI").is_ok() {
            panic!("Public key must be set in CI environment: {}", public_key_env);
        } else {
            eprintln!("Warning: {} not set. Updater will be disabled.", public_key_env);
            // 空の公開鍵（アップデーターは無効化される）
            String::new()
        }
    });
    
    // 公開鍵の基本的な検証
    if !public_key.is_empty() {
        // Base64形式の検証
        match general_purpose::STANDARD.decode(&public_key) {
            Ok(decoded) => {
                // Ed25519公開鍵は32バイトである必要がある
                if decoded.len() != 32 {
                    panic!("Invalid public key length: expected 32 bytes, got {} bytes", decoded.len());
                }
            }
            Err(e) => {
                panic!("Invalid public key format (not valid base64): {}", e);
            }
        }
    }

    // 公開鍵をビルド時定数として設定
    if !public_key.is_empty() {
        println!("cargo:rustc-env=PROMPALETTE_UPDATER_PUBKEY={}", public_key);
        // アップデーターを有効化
        println!("cargo:rustc-env=PROMPALETTE_UPDATER_ACTIVE=true");
    } else {
        // アップデーターを無効化
        println!("cargo:rustc-env=PROMPALETTE_UPDATER_ACTIVE=false");
    }
    
    println!("cargo:rerun-if-env-changed={}", public_key_env);
    println!("cargo:rerun-if-env-changed=APP_ENV");
    println!("cargo:rerun-if-env-changed=CI");
}