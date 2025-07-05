/*!
 * アップデート管理モジュール
 * 自動更新機能とデータバックアップを統合管理
 */

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Emitter};
use tauri_plugin_updater::UpdaterExt;
use crate::environment::Environment;
use crate::security::{UpdateSecurity, VersionError};

/// アップデート情報
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub version: String,
    pub notes: Option<String>,
    pub pub_date: Option<String>,
    pub url: String,
    pub signature: Option<String>,
}

/// アップデート状態
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UpdateStatus {
    /// アップデートなし
    NoUpdateAvailable,
    /// アップデート利用可能
    UpdateAvailable(UpdateInfo),
    /// ダウンロード中
    Downloading { progress: f64 },
    /// ダウンロード完了
    Downloaded,
    /// インストール中
    Installing,
    /// エラー発生
    Error(String),
}

/// アップデート関連のエラー型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UpdateError {
    /// ネットワークエラー
    NetworkError(String),
    /// 署名検証エラー  
    SignatureError(String),
    /// バージョン不適合
    VersionMismatch(String),
    /// バックアップ失敗
    BackupFailed(String),
    /// ダウンロード失敗
    DownloadFailed(String),
    /// インストール失敗
    InstallFailed(String),
    /// 設定エラー
    ConfigError(String),
    /// その他のエラー
    Unknown(String),
}

impl std::fmt::Display for UpdateError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            UpdateError::NetworkError(msg) => write!(f, "Network error: {}", msg),
            UpdateError::SignatureError(msg) => write!(f, "Signature verification failed: {}", msg),
            UpdateError::VersionMismatch(msg) => write!(f, "Version mismatch: {}", msg),
            UpdateError::BackupFailed(msg) => write!(f, "Backup failed: {}", msg),
            UpdateError::DownloadFailed(msg) => write!(f, "Download failed: {}", msg),
            UpdateError::InstallFailed(msg) => write!(f, "Installation failed: {}", msg),
            UpdateError::ConfigError(msg) => write!(f, "Configuration error: {}", msg),
            UpdateError::Unknown(msg) => write!(f, "Unknown error: {}", msg),
        }
    }
}

impl std::error::Error for UpdateError {}

// TauriコマンドでStringエラーとして返すための変換
impl From<UpdateError> for String {
    fn from(err: UpdateError) -> Self {
        err.to_string()
    }
}

/// データバックアップ結果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupResult {
    pub success: bool,
    pub backup_path: Option<String>,
    pub timestamp: String,
    pub error: Option<String>,
}

/// アップデート設定
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateConfig {
    pub environment: String,
    pub updates_enabled: bool,
    pub auto_check_enabled: bool,
    pub requires_manual_approval: bool,
    pub backup_enabled: bool,
    pub public_key: Option<String>,
}

impl UpdateConfig {
    /// デフォルト設定を環境に基づいて生成
    pub fn default_for_environment(env: Environment) -> Self {
        Self {
            environment: env.to_string(),
            updates_enabled: true,
            auto_check_enabled: env == Environment::Production,
            requires_manual_approval: true,
            backup_enabled: true,
            public_key: None, // 実際の公開鍵は外部設定から読み込み
        }
    }
}

/// アップデートチェック（Tauriプラグインを活用）
#[tauri::command]
pub async fn check_for_updates(app: AppHandle) -> Result<UpdateStatus, UpdateError> {
    // アップデーターが無効の場合は早期リターン
    if !crate::tauri_config::is_updater_active() {
        return Ok(UpdateStatus::NoUpdateAvailable);
    }
    
    let env = Environment::current();
    
    // Tauriのアップデーターはすでに署名検証を含む
    let updater = app.updater()
        .map_err(|e| UpdateError::Unknown(format!("Failed to get updater: {}", e)))?;
    
    match updater.check().await {
        Ok(Some(update)) => {
            // バージョンが環境に適合するかチェック
            match UpdateSecurity::validate_version_for_environment(&update.version, env) {
                Ok(_) => {
                    let update_info = UpdateInfo {
                        version: update.version.clone(),
                        notes: update.body.clone(),
                        pub_date: update.date.map(|d| d.to_string()),
                        url: update.download_url.to_string(),
                        signature: Some(update.signature.clone()),
                    };
                    Ok(UpdateStatus::UpdateAvailable(update_info))
                }
                Err(VersionError::EnvironmentMismatch) => {
                    // 環境に適合しないバージョンは無視
                    Ok(UpdateStatus::NoUpdateAvailable)
                }
                Err(VersionError::InvalidFormat) => {
                    Err(UpdateError::VersionMismatch(format!("Invalid version format: {}", update.version)))
                }
            }
        }
        Ok(None) => Ok(UpdateStatus::NoUpdateAvailable),
        Err(e) => {
            // エラーの詳細を判別
            let error_msg = e.to_string();
            if error_msg.contains("signature") {
                Err(UpdateError::SignatureError(error_msg))
            } else if error_msg.contains("network") || error_msg.contains("connection") {
                Err(UpdateError::NetworkError(error_msg))
            } else {
                Err(UpdateError::Unknown(error_msg))
            }
        }
    }
}

/// データベースバックアップ作成
#[tauri::command]
pub async fn create_backup(_app: AppHandle) -> Result<BackupResult, UpdateError> {
    let env = Environment::current();
    let data_dir = env.data_dir()
        .map_err(|e| UpdateError::BackupFailed(format!("Failed to get data directory: {}", e)))?;
    let db_path = data_dir.join(env.database_filename());
    
    // バックアップディレクトリの作成
    let backup_dir = data_dir.join("backups");
    std::fs::create_dir_all(&backup_dir)
        .map_err(|e| UpdateError::BackupFailed(format!("Failed to create backup directory: {}", e)))?;
    
    // バックアップファイル名（タイムスタンプ付き）
    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let backup_filename = format!("prompalette_backup_{}.db", timestamp);
    let backup_path = backup_dir.join(&backup_filename);
    
    // データベースファイルをコピー
    match std::fs::copy(&db_path, &backup_path) {
        Ok(_) => Ok(BackupResult {
            success: true,
            backup_path: Some(backup_path.to_string_lossy().to_string()),
            timestamp: chrono::Utc::now().to_rfc3339(),
            error: None,
        }),
        Err(e) => Ok(BackupResult {
            success: false,
            backup_path: None,
            timestamp: chrono::Utc::now().to_rfc3339(),
            error: Some(format!("Failed to copy database: {}", e)),
        }),
    }
}

/// ダウンロードしたアップデートファイルの検証
async fn verify_update_file(
    file_path: &std::path::Path,
    version: &str,
    signature: &str,
    environment: Environment,
) -> Result<(), UpdateError> {
    // ファイルの読み込み
    let file_data = std::fs::read(file_path)
        .map_err(|e| UpdateError::DownloadFailed(format!("Failed to read update file: {}", e)))?;
    
    // 公開鍵の取得
    let public_key = std::env::var(format!("PROMPALETTE_{}_PUBLIC_KEY", environment.name().to_uppercase()))
        .map_err(|_| UpdateError::ConfigError(format!("Public key not configured for {} environment", environment.name())))?;
    
    // 包括的検証（バージョン＋署名）
    UpdateSecurity::validate_update(version, &file_data, signature, &public_key, environment)
        .map_err(|e| UpdateError::SignatureError(format!("Update verification failed: {}", e)))?;
    
    Ok(())
}

/// アップデートのダウンロードと適用
#[tauri::command]
pub async fn download_and_apply_update(app: AppHandle) -> Result<UpdateStatus, String> {
    // 環境設定を取得（全環境でアップデート適用を許可）
    let _env = Environment::current();

    // 事前にバックアップを作成
    let backup_result = create_backup(app.clone()).await
        .map_err(|e| e.to_string())?;
    if !backup_result.success {
        return Ok(UpdateStatus::Error(
            format!("Failed to create backup: {:?}", backup_result.error)
        ));
    }

    // アップデートのダウンロードと適用
    let updater = match app.updater_builder().build() {
        Ok(updater) => updater,
        Err(e) => return Ok(UpdateStatus::Error(e.to_string())),
    };

    match updater.check().await {
        Ok(Some(update)) => {
            // ダウンロード進行状況の監視
            app.emit("update-download-progress", UpdateStatus::Downloading { progress: 0.0 })
                .map_err(|e| e.to_string())?;

            match update.download_and_install(|chunk_length, content_length| {
                if let Some(total) = content_length {
                    let progress = (chunk_length as f64 / total as f64) * 100.0;
                    let _ = app.emit("update-download-progress", UpdateStatus::Downloading { progress });
                }
            }, || {
                // Called when download finishes
            }).await {
                Ok(_) => {
                    // ダウンロード完了
                    app.emit("update-download-complete", UpdateStatus::Downloaded)
                        .map_err(|e| e.to_string())?;
                    
                    // インストール開始
                    app.emit("update-install-start", UpdateStatus::Installing)
                        .map_err(|e| e.to_string())?;
                    
                    Ok(UpdateStatus::Installing)
                }
                Err(e) => Ok(UpdateStatus::Error(e.to_string())),
            }
        }
        Ok(None) => Ok(UpdateStatus::NoUpdateAvailable),
        Err(e) => Ok(UpdateStatus::Error(e.to_string())),
    }
}

/// バックアップからの復元
#[tauri::command]
pub async fn restore_from_backup(backup_path: String) -> Result<bool, String> {
    let env = Environment::current();
    let data_dir = env.data_dir().map_err(|e| e.to_string())?;
    let db_path = data_dir.join(env.database_filename());
    
    let backup_path = PathBuf::from(backup_path);
    
    // バックアップファイルの存在確認
    if !backup_path.exists() {
        return Err("Backup file does not exist".to_string());
    }
    
    // データベースファイルを復元
    match std::fs::copy(&backup_path, &db_path) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("Failed to restore database: {}", e)),
    }
}

/// バックアップ情報の詳細構造
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupInfo {
    pub filename: String,
    pub full_path: String,
    pub created_at: String,
    pub size_bytes: u64,
    pub is_automatic: bool,
}

/// 利用可能なバックアップ一覧を取得（詳細情報付き）
#[tauri::command]
pub async fn list_backups() -> Result<Vec<BackupInfo>, String> {
    let env = Environment::current();
    let data_dir = env.data_dir().map_err(|e| e.to_string())?;
    let backup_dir = data_dir.join("backups");
    
    if !backup_dir.exists() {
        return Ok(vec![]);
    }
    
    let mut backups = Vec::new();
    
    match std::fs::read_dir(&backup_dir) {
        Ok(entries) => {
            for entry in entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    if path.is_file() && path.extension().map_or(false, |ext| ext == "db") {
                        if let Some(file_name) = path.file_name() {
                            let filename = file_name.to_string_lossy().to_string();
                            
                            // ファイルのメタデータを取得
                            if let Ok(metadata) = std::fs::metadata(&path) {
                                let created_at = if let Ok(created) = metadata.created() {
                                    if let Ok(datetime) = created.duration_since(std::time::UNIX_EPOCH) {
                                        chrono::DateTime::from_timestamp(datetime.as_secs() as i64, 0)
                                            .unwrap_or_else(chrono::Utc::now)
                                            .to_rfc3339()
                                    } else {
                                        chrono::Utc::now().to_rfc3339()
                                    }
                                } else {
                                    chrono::Utc::now().to_rfc3339()
                                };
                                
                                let is_automatic = filename.starts_with("prompalette_backup_");
                                
                                backups.push(BackupInfo {
                                    filename: filename.clone(),
                                    full_path: path.to_string_lossy().to_string(),
                                    created_at,
                                    size_bytes: metadata.len(),
                                    is_automatic,
                                });
                            }
                        }
                    }
                }
            }
        }
        Err(e) => return Err(format!("Failed to read backup directory: {}", e)),
    }
    
    // 新しい順にソート
    backups.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(backups)
}

/// 手動バックアップ作成（ユーザーが明示的に作成）
#[tauri::command]
pub async fn create_manual_backup(name: Option<String>) -> Result<BackupResult, String> {
    let env = Environment::current();
    let data_dir = env.data_dir().map_err(|e| e.to_string())?;
    let db_path = data_dir.join(env.database_filename());
    
    // バックアップディレクトリの作成
    let backup_dir = data_dir.join("backups");
    if let Err(e) = std::fs::create_dir_all(&backup_dir) {
        return Ok(BackupResult {
            success: false,
            backup_path: None,
            timestamp: chrono::Utc::now().to_rfc3339(),
            error: Some(format!("Failed to create backup directory: {}", e)),
        });
    }
    
    // バックアップファイル名（手動バックアップ）
    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S").to_string();
    let backup_filename = if let Some(custom_name) = name {
        format!("manual_{}_{}.db", custom_name, timestamp)
    } else {
        format!("manual_backup_{}.db", timestamp)
    };
    let backup_path = backup_dir.join(&backup_filename);
    
    // データベースファイルをコピー
    match std::fs::copy(&db_path, &backup_path) {
        Ok(_) => Ok(BackupResult {
            success: true,
            backup_path: Some(backup_path.to_string_lossy().to_string()),
            timestamp: chrono::Utc::now().to_rfc3339(),
            error: None,
        }),
        Err(e) => Ok(BackupResult {
            success: false,
            backup_path: None,
            timestamp: chrono::Utc::now().to_rfc3339(),
            error: Some(format!("Failed to copy database: {}", e)),
        }),
    }
}

/// 古いバックアップファイルを自動削除
#[tauri::command]
pub async fn cleanup_old_backups(keep_count: Option<u32>) -> Result<u32, String> {
    let keep_count = keep_count.unwrap_or(10); // デフォルトで10個のバックアップを保持
    let env = Environment::current();
    let data_dir = env.data_dir().map_err(|e| e.to_string())?;
    let backup_dir = data_dir.join("backups");
    
    if !backup_dir.exists() {
        return Ok(0);
    }
    
    let backups = list_backups().await?;
    
    if backups.len() <= keep_count as usize {
        return Ok(0); // 削除不要
    }
    
    // 自動バックアップのみを対象に古いものから削除
    let mut automatic_backups: Vec<_> = backups.into_iter()
        .filter(|b| b.is_automatic)
        .collect();
    
    automatic_backups.sort_by(|a, b| a.created_at.cmp(&b.created_at));
    
    let mut deleted_count = 0;
    let delete_count = automatic_backups.len().saturating_sub(keep_count as usize);
    
    for backup in automatic_backups.iter().take(delete_count) {
        match std::fs::remove_file(&backup.full_path) {
            Ok(_) => deleted_count += 1,
            Err(e) => {
                eprintln!("Failed to delete backup {}: {}", backup.filename, e);
            }
        }
    }
    
    Ok(deleted_count)
}

/// 特定のバックアップファイルを削除
#[tauri::command]
pub async fn delete_backup(filename: String) -> Result<bool, String> {
    let env = Environment::current();
    let data_dir = env.data_dir().map_err(|e| e.to_string())?;
    let backup_dir = data_dir.join("backups");
    let backup_path = backup_dir.join(&filename);
    
    // セキュリティチェック: バックアップディレクトリ内のファイルのみ削除可能
    if !backup_path.starts_with(&backup_dir) {
        return Err("Invalid backup file path".to_string());
    }
    
    // ファイルの存在確認
    if !backup_path.exists() {
        return Err("Backup file does not exist".to_string());
    }
    
    match std::fs::remove_file(&backup_path) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("Failed to delete backup: {}", e)),
    }
}

/// アップデート設定の取得
#[tauri::command]
pub async fn get_update_config() -> Result<UpdateConfig, String> {
    let env = Environment::current();
    
    // 公開鍵の読み込み実装は config/update_config.rs を参照
    // 詳細は docs/UPDATE_SECURITY.md に記載
    let mut config = UpdateConfig::default_for_environment(env);
    
    // 開発環境とステージング環境でもアップデートを有効化
    config.updates_enabled = true;
    
    Ok(config)
}