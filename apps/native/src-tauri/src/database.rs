/**
 * データベース操作モジュール
 * SQLiteを使用したプロンプトデータの永続化
 */
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::sync::OnceLock;
use uuid::Uuid;

/// グローバルデータベース接続プール
static DB_POOL: OnceLock<SqlitePool> = OnceLock::new();

/// プロンプトデータ構造
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Prompt {
    pub id: String,
    pub title: String,
    pub content: String,
    pub tags: Option<String>, // JSON文字列として保存
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

/// プロンプト作成リクエスト
#[derive(Debug, Deserialize)]
pub struct CreatePromptRequest {
    pub title: String,
    pub content: String,
    pub tags: Option<Vec<String>>,
}

/// プロンプト更新リクエスト
#[derive(Debug, Deserialize)]
pub struct UpdatePromptRequest {
    pub title: Option<String>,
    pub content: Option<String>,
    pub tags: Option<Vec<String>>,
}

/// アプリケーションデータディレクトリの取得
/// プラットフォーム固有の適切なディレクトリを返す
fn get_app_data_dir() -> Result<std::path::PathBuf, Box<dyn std::error::Error>> {
    // プラットフォーム別のデータディレクトリ
    let app_dir = if cfg!(target_os = "macos") {
        std::env::var("HOME")
            .map(|home| std::path::PathBuf::from(home).join("Library/Application Support/PromPalette"))
            .map_err(|_| "Cannot find HOME directory on macOS")?
    } else if cfg!(target_os = "windows") {
        std::env::var("APPDATA")
            .map(|appdata| std::path::PathBuf::from(appdata).join("PromPalette"))
            .map_err(|_| "Cannot find APPDATA directory on Windows")?
    } else {
        // Linux/Unix
        std::env::var("HOME")
            .map(|home| std::path::PathBuf::from(home).join(".config/prompalette"))
            .map_err(|_| "Cannot find HOME directory on Linux")?
    };
    
    Ok(app_dir)
}


/// データベース初期化
/// アプリケーション起動時に確実にデータベースを初期化
pub async fn init_database() -> Result<(), Box<dyn std::error::Error>> {
    // データディレクトリの確実な作成
    let app_dir = get_app_data_dir()?;
    std::fs::create_dir_all(&app_dir).map_err(|e| {
        format!("Failed to create app data directory {}: {}", app_dir.display(), e)
    })?;
    
    let db_path = app_dir.join("prompalette.db");
    
    // データベースファイルへの書き込み権限確認
    if db_path.exists() {
        let metadata = std::fs::metadata(&db_path).map_err(|e| {
            format!("Cannot access database file {}: {}", db_path.display(), e)
        })?;
        
        if metadata.permissions().readonly() {
            return Err(format!("Database file {} is read-only", db_path.display()).into());
        }
    }
    
    // SQLite接続プール作成（設定最適化）
    let pool = SqlitePool::connect_with(
        sqlx::sqlite::SqliteConnectOptions::new()
            .filename(&db_path)
            .create_if_missing(true)
            .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
            .synchronous(sqlx::sqlite::SqliteSynchronous::Normal)
    ).await.map_err(|e| {
        format!("Failed to connect to database {}: {}", db_path.display(), e)
    })?;
    
    // データベーススキーマの初期化
    init_database_schema(&pool).await?;
    
    // グローバルプールに設定（一度だけ設定可能）
    DB_POOL.set(pool).map_err(|_| "Database pool already initialized")?;
    
    Ok(())
}

/// データベーススキーマの初期化
/// テーブル作成とインデックス設定を実行
async fn init_database_schema(pool: &SqlitePool) -> Result<(), Box<dyn std::error::Error>> {
    // プロンプトテーブル作成
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS prompts (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            tags TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        "#,
    )
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to create prompts table: {}", e))?;
    
    // インデックス作成（パフォーマンス最適化）
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_prompts_updated ON prompts(updated_at);")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_prompts_title ON prompts(title);")
        .execute(pool)
        .await?;
    
    Ok(())
}

/// データベース接続プール取得
/// データベースが初期化されていない場合はパニック
pub fn get_db_pool() -> &'static SqlitePool {
    DB_POOL.get().expect("Database not initialized. Call init_database() first.")
}

/// プロンプト作成
pub async fn create_prompt(request: CreatePromptRequest) -> Result<Prompt, Box<dyn std::error::Error>> {
    let pool = get_db_pool();
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now();
    
    // タグをJSON文字列に変換
    let tags_json = match request.tags {
        Some(tags) => Some(serde_json::to_string(&tags)?),
        None => None,
    };
    
    let prompt = sqlx::query_as::<_, Prompt>(
        r#"
        INSERT INTO prompts (id, title, content, tags, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        "#,
    )
    .bind(&id)
    .bind(&request.title)
    .bind(&request.content)
    .bind(&tags_json)
    .bind(now)
    .bind(now)
    .fetch_one(pool)
    .await?;
    
    Ok(prompt)
}

/// プロンプト取得（ID指定）
pub async fn get_prompt(id: &str) -> Result<Option<Prompt>, Box<dyn std::error::Error>> {
    let pool = get_db_pool();
    
    let prompt = sqlx::query_as::<_, Prompt>("SELECT * FROM prompts WHERE id = $1")
        .bind(id)
        .fetch_optional(pool)
        .await?;
    
    Ok(prompt)
}

/// 全プロンプト取得
pub async fn get_all_prompts() -> Result<Vec<Prompt>, Box<dyn std::error::Error>> {
    let pool = get_db_pool();
    
    let prompts = sqlx::query_as::<_, Prompt>(
        "SELECT * FROM prompts ORDER BY updated_at DESC"
    )
    .fetch_all(pool)
    .await?;
    
    Ok(prompts)
}

/// プロンプト検索
pub async fn search_prompts(query: &str) -> Result<Vec<Prompt>, Box<dyn std::error::Error>> {
    let pool = get_db_pool();
    let search_term = format!("%{}%", query);
    
    let prompts = sqlx::query_as::<_, Prompt>(
        r#"
        SELECT * FROM prompts 
        WHERE title LIKE $1 OR content LIKE $1 OR tags LIKE $1
        ORDER BY updated_at DESC
        "#,
    )
    .bind(&search_term)
    .fetch_all(pool)
    .await?;
    
    Ok(prompts)
}

/// プロンプト更新
pub async fn update_prompt(
    id: &str,
    request: UpdatePromptRequest,
) -> Result<Option<Prompt>, Box<dyn std::error::Error>> {
    let pool = get_db_pool();
    
    // 既存プロンプトを取得
    let existing = match get_prompt(id).await? {
        Some(prompt) => prompt,
        None => return Ok(None),
    };
    
    // 更新フィールドの決定
    let title = request.title.unwrap_or(existing.title);
    let content = request.content.unwrap_or(existing.content);
    
    // タグの処理
    let tags_json = match request.tags {
        Some(tags) => Some(serde_json::to_string(&tags)?),
        None => existing.tags,
    };
    
    let now = chrono::Utc::now();
    
    let updated_prompt = sqlx::query_as::<_, Prompt>(
        r#"
        UPDATE prompts 
        SET title = $1, content = $2, tags = $3, updated_at = $4
        WHERE id = $5
        RETURNING *
        "#,
    )
    .bind(&title)
    .bind(&content)
    .bind(&tags_json)
    .bind(now)
    .bind(id)
    .fetch_one(pool)
    .await?;
    
    Ok(Some(updated_prompt))
}

/// プロンプト削除
pub async fn delete_prompt(id: &str) -> Result<bool, Box<dyn std::error::Error>> {
    let pool = get_db_pool();
    
    let result = sqlx::query("DELETE FROM prompts WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;
    
    Ok(result.rows_affected() > 0)
}


#[cfg(test)]
mod tests {
    use super::*;
    use tokio;

    #[tokio::test]
    async fn test_prompt_crud_operations() {
        // テスト用のインメモリデータベース
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        
        // テーブル作成
        sqlx::query(
            r#"
            CREATE TABLE prompts (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            "#,
        )
        .execute(&pool)
        .await
        .unwrap();
        
        // テスト用プロンプト
        let create_request = CreatePromptRequest {
            title: "Test Prompt".to_string(),
            content: "This is a test prompt content".to_string(),
            tags: Some(vec!["test".to_string(), "example".to_string()]),
        };
        
        // TODO: 実際のCRUDテストの実装
        // データベースプールの初期化が必要なため、統合テストで実装
    }
}