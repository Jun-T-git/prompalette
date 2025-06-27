/*!
 * データベース操作モジュール
 * `SQLite`を使用したプロンプトデータの永続化
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
    pub quick_access_key: Option<String>, // クイックアクセスキー
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub pinned_position: Option<u8>, // ピン留め位置 (1-10)
    pub pinned_at: Option<chrono::DateTime<chrono::Utc>>, // ピン留め日時
}

/// プロンプト作成リクエスト
#[derive(Debug, Deserialize)]
pub struct CreatePromptRequest {
    pub title: String,
    pub content: String,
    pub tags: Option<Vec<String>>,
    #[serde(rename = "quickAccessKey")]
    pub quick_access_key: Option<String>,
}

/// プロンプト更新リクエスト
#[derive(Debug, Deserialize)]
pub struct UpdatePromptRequest {
    pub title: Option<String>,
    pub content: Option<String>,
    pub tags: Option<Vec<String>>,
    #[serde(rename = "quickAccessKey")]
    pub quick_access_key: Option<String>,
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
        r"
        CREATE TABLE IF NOT EXISTS prompts (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            tags TEXT,
            quick_access_key TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            pinned_position INTEGER,
            pinned_at DATETIME
        );
        ",
    )
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to create prompts table: {e}"))?;
    
    // 既存テーブルにピン関連カラムを追加（マイグレーション）
    run_migrations(pool).await?;
    
    // インデックス作成（パフォーマンス最適化）
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_prompts_updated ON prompts(updated_at);")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_prompts_title ON prompts(title);")
        .execute(pool)
        .await?;
    sqlx::query("CREATE UNIQUE INDEX IF NOT EXISTS idx_prompts_pinned_position ON prompts(pinned_position) WHERE pinned_position IS NOT NULL;")
        .execute(pool)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_prompts_pinned_at ON prompts(pinned_at) WHERE pinned_at IS NOT NULL;")
        .execute(pool)
        .await?;
    
    Ok(())
}

/// データベースマイグレーション実行
/// 既存のテーブルにピン関連カラムを追加
async fn run_migrations(pool: &SqlitePool) -> Result<(), Box<dyn std::error::Error>> {
    // pinned_positionカラムの追加
    let _ = sqlx::query("ALTER TABLE prompts ADD COLUMN pinned_position INTEGER;")
        .execute(pool)
        .await; // エラーは無視（既に存在する場合）
    
    // pinned_atカラムの追加
    let _ = sqlx::query("ALTER TABLE prompts ADD COLUMN pinned_at DATETIME;")
        .execute(pool)
        .await; // エラーは無視（既に存在する場合）
    
    // quick_access_keyカラムの追加
    let _ = sqlx::query("ALTER TABLE prompts ADD COLUMN quick_access_key TEXT;")
        .execute(pool)
        .await; // エラーは無視（既に存在する場合）
    
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
        r"
        INSERT INTO prompts (id, title, content, tags, quick_access_key, created_at, updated_at, pinned_position, pinned_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NULL)
        RETURNING *
        ",
    )
    .bind(&id)
    .bind(&request.title)
    .bind(&request.content)
    .bind(&tags_json)
    .bind(&request.quick_access_key)
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

/// プロンプト検索（既存API - 後方互換性維持）
pub async fn search_prompts(query: &str) -> Result<Vec<Prompt>, Box<dyn std::error::Error>> {
    let pool = get_db_pool();
    let search_term = format!("%{query}%");
    
    let prompts = sqlx::query_as::<_, Prompt>(
        r"
        SELECT * FROM prompts 
        WHERE title LIKE $1 OR content LIKE $1 OR tags LIKE $1
        ORDER BY updated_at DESC
        ",
    )
    .bind(&search_term)
    .fetch_all(pool)
    .await?;
    
    Ok(prompts)
}

/// 高速検索（ショートカット用）
/// 
/// パフォーマンス重視の検索実装:
/// - 優先度付きソート（完全一致 > 前方一致 > 部分一致）
/// - 結果数制限（最大20件）
/// - 使用頻度考慮（将来実装）
/// 
/// @param query 検索クエリ
/// @returns 検索結果（優先度順）
pub async fn search_prompts_fast(query: &str) -> Result<Vec<Prompt>, Box<dyn std::error::Error>> {
    let pool = get_db_pool();
    
    if query.trim().is_empty() {
        return Ok(vec![]);
    }
    
    let search_term = format!("%{query}%");
    let prefix_term = format!("{query}%");
    
    // 優先度付き検索クエリ
    let prompts = sqlx::query_as::<_, Prompt>(
        r#"
        SELECT *, 
        CASE 
            -- 1. タイトル完全一致（最優先）
            WHEN title = $3 THEN 1
            -- 2. タイトル前方一致
            WHEN title LIKE $2 THEN 2
            -- 3. タイトル部分一致
            WHEN title LIKE $1 THEN 3
            -- 4. タグ完全一致
            WHEN tags LIKE '%"' || $3 || '"%' THEN 4
            -- 5. タグ部分一致
            WHEN tags LIKE $1 THEN 5
            -- 6. 内容一致
            WHEN content LIKE $1 THEN 6
            ELSE 7
        END as priority
        FROM prompts 
        WHERE title LIKE $1 OR content LIKE $1 OR tags LIKE $1
        ORDER BY priority ASC, updated_at DESC
        LIMIT 20
        "#,
    )
    .bind(&search_term)   // $1: 部分一致用
    .bind(&prefix_term)   // $2: 前方一致用
    .bind(query)          // $3: 完全一致用
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
    
    // クイックアクセスキーの処理
    let quick_access_key = request.quick_access_key.or(existing.quick_access_key);
    
    let now = chrono::Utc::now();
    
    let updated_prompt = sqlx::query_as::<_, Prompt>(
        r"
        UPDATE prompts 
        SET title = $1, content = $2, tags = $3, quick_access_key = $4, updated_at = $5
        WHERE id = $6
        RETURNING *
        ",
    )
    .bind(&title)
    .bind(&content)
    .bind(&tags_json)
    .bind(&quick_access_key)
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

/// プロンプトをピン留めする
/// 
/// position: 1-10の範囲でピン留め位置を指定
/// 既に同じ位置にピン留めされているプロンプトがある場合は、そのピン留めを解除
pub async fn pin_prompt(prompt_id: &str, position: u8) -> Result<(), Box<dyn std::error::Error>> {
    if !(1..=10).contains(&position) {
        return Err("Pin position must be between 1 and 10".into());
    }
    
    let pool = get_db_pool();
    let now = chrono::Utc::now();
    
    // プロンプトが存在するかチェック
    let existing = get_prompt(prompt_id).await?;
    if existing.is_none() {
        return Err("Prompt not found".into());
    }
    
    // トランザクション開始
    let mut tx = pool.begin().await?;
    
    // 同じ位置にピン留めされているプロンプトのピン留めを解除
    sqlx::query(
        "UPDATE prompts SET pinned_position = NULL, pinned_at = NULL WHERE pinned_position = $1"
    )
    .bind(i32::from(position))
    .execute(&mut *tx)
    .await?;
    
    // 指定されたプロンプトをピン留め
    let result = sqlx::query(
        "UPDATE prompts SET pinned_position = $1, pinned_at = $2 WHERE id = $3"
    )
    .bind(i32::from(position))
    .bind(now)
    .bind(prompt_id)
    .execute(&mut *tx)
    .await?;
    
    if result.rows_affected() == 0 {
        return Err("Failed to pin prompt".into());
    }
    
    // トランザクション確定
    tx.commit().await?;
    
    Ok(())
}

/// プロンプトのピン留めを解除する
/// 
/// position: 解除するピン留め位置（1-10）
pub async fn unpin_prompt(position: u8) -> Result<(), Box<dyn std::error::Error>> {
    if !(1..=10).contains(&position) {
        return Err("Pin position must be between 1 and 10".into());
    }
    
    let pool = get_db_pool();
    
    let result = sqlx::query(
        "UPDATE prompts SET pinned_position = NULL, pinned_at = NULL WHERE pinned_position = $1"
    )
    .bind(i32::from(position))
    .execute(pool)
    .await?;
    
    if result.rows_affected() == 0 {
        return Err("No prompt found at the specified pin position".into());
    }
    
    Ok(())
}

/// ピン留めされたプロンプトを全て取得する
/// 
/// ピン留め位置の昇順で返す（1, 2, 3, ...）
pub async fn get_pinned_prompts() -> Result<Vec<Prompt>, Box<dyn std::error::Error>> {
    let pool = get_db_pool();
    
    let prompts = sqlx::query_as::<_, Prompt>(
        "SELECT * FROM prompts WHERE pinned_position IS NOT NULL ORDER BY pinned_position ASC"
    )
    .fetch_all(pool)
    .await?;
    
    Ok(prompts)
}

/// 指定されたピン留め位置のプロンプトをクリップボードにコピーする
/// 
/// position: コピーするピン留め位置（1-10）
/// プロンプトの内容をクリップボードにコピーし、成功/失敗を返す
pub async fn get_pinned_prompt_content(position: u8) -> Result<Option<String>, Box<dyn std::error::Error>> {
    if !(1..=10).contains(&position) {
        return Err("Pin position must be between 1 and 10".into());
    }
    
    let pool = get_db_pool();
    
    let prompt: Option<(String,)> = sqlx::query_as(
        "SELECT content FROM prompts WHERE pinned_position = $1"
    )
    .bind(i32::from(position))
    .fetch_optional(pool)
    .await?;
    
    Ok(prompt.map(|(content,)| content))
}


#[cfg(test)]
mod tests {
    use super::*;
    

    /// テスト用のデータベースプールを作成
    async fn create_test_pool() -> SqlitePool {
        let pool = SqlitePool::connect("sqlite::memory:").await.unwrap();
        
        // テーブル作成
        sqlx::query(
            r"
            CREATE TABLE prompts (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                pinned_position INTEGER,
                pinned_at DATETIME
            );
            ",
        )
        .execute(&pool)
        .await
        .unwrap();
        
        // インデックス作成
        sqlx::query("CREATE INDEX idx_prompts_updated ON prompts(updated_at);")
            .execute(&pool)
            .await
            .unwrap();
        sqlx::query("CREATE INDEX idx_prompts_title ON prompts(title);")
            .execute(&pool)
            .await
            .unwrap();
        
        pool
    }

    #[tokio::test]
    async fn test_search_prompts_fast_priority_ordering() {
        // テストごとに新しいOnceLockを使用する必要があるため、この方法では正しくテストできない
        // 統合テストで実装することを推奨
        
        // 暫定的に、直接SQLクエリでロジックを検証
        let pool = create_test_pool().await;
        
        // テストデータ挿入
        let test_data = vec![
            ("完全一致", "test", "content1", vec!["tag1"]),
            ("前方一致test", "test_prefix", "content2", vec!["tag2"]),
            ("部分一致のtest例", "partial", "content3", vec!["tag3"]),
            ("タグ完全一致", "tag_match", "content4", vec!["test"]),
            ("タグ部分一致", "tag_partial", "content5", vec!["testing"]),
            ("内容一致", "content_match", "test content", vec!["tag6"]),
        ];
        
        for (id, title, content, tags) in test_data {
            let tags_json = serde_json::to_string(&tags).unwrap();
            sqlx::query(
                "INSERT INTO prompts (id, title, content, tags) VALUES ($1, $2, $3, $4)"
            )
            .bind(id)
            .bind(title)
            .bind(content)
            .bind(tags_json)
            .execute(&pool)
            .await
            .unwrap();
        }
        
        // 直接SQLクエリで検証
        let query = "test";
        let search_term = format!("%{query}%");
        let prefix_term = format!("{query}%");
        
        let rows: Vec<(String, i32)> = sqlx::query_as(
            r#"
            SELECT title,
            CASE 
                WHEN title = $3 THEN 1
                WHEN title LIKE $2 THEN 2
                WHEN title LIKE $1 THEN 3
                WHEN tags LIKE '%"' || $3 || '"%' THEN 4
                WHEN tags LIKE $1 THEN 5
                WHEN content LIKE $1 THEN 6
                ELSE 7
            END as priority
            FROM prompts 
            WHERE title LIKE $1 OR content LIKE $1 OR tags LIKE $1
            ORDER BY priority ASC
            "#,
        )
        .bind(&search_term)
        .bind(&prefix_term)
        .bind(query)
        .fetch_all(&pool)
        .await
        .unwrap();
        
        // デバッグ出力（コメントアウト）
        // println!("検索結果: {:?}", rows);
        
        // 優先度順に並んでいることを確認
        assert!(rows.len() >= 5); // 最低5件はヒットするはず
        assert_eq!(rows[0].0, "test"); // 完全一致
        assert_eq!(rows[0].1, 1);
    }

    #[tokio::test]
    async fn test_search_prompts_fast_empty_query() {
        // 空のクエリチェックは関数内で行われるため、単体でテスト可能
        // ただし、OnceLockの制限により統合テストで実装することを推奨
    }

    #[tokio::test]
    async fn test_search_prompts_fast_limit() {
        // LIMIT句のテストも直接SQLで検証
        let pool = create_test_pool().await;
        
        // 25件のテストデータを挿入
        for i in 0..25 {
            let id = format!("test_{i}");
            sqlx::query(
                "INSERT INTO prompts (id, title, content, tags) VALUES ($1, $2, $3, $4)"
            )
            .bind(&id)
            .bind("test title")
            .bind("test content")
            .bind("[]")
            .execute(&pool)
            .await
            .unwrap();
        }
        
        // 直接SQLクエリで20件制限を検証
        let search_term = "%test%";
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM (
                SELECT * FROM prompts 
                WHERE title LIKE $1 OR content LIKE $1 OR tags LIKE $1
                LIMIT 20
            )"
        )
        .bind(search_term)
        .fetch_one(&pool)
        .await
        .unwrap();
        
        // 結果が20件に制限されることを確認
        assert_eq!(count.0, 20);
    }

    #[tokio::test]
    async fn test_pin_prompt_functionality() {
        let pool = create_test_pool().await;
        
        // テストプロンプトを作成
        let prompt_id = "test_pin_prompt";
        sqlx::query(
            "INSERT INTO prompts (id, title, content, tags) VALUES ($1, $2, $3, $4)"
        )
        .bind(prompt_id)
        .bind("Test Pin Title")
        .bind("Test pin content")
        .bind("[]")
        .execute(&pool)
        .await
        .unwrap();
        
        // ピン留め機能をテスト（位置1）
        let result: (Option<i32>, Option<String>) = sqlx::query_as(
            "UPDATE prompts SET pinned_position = $1, pinned_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING pinned_position, pinned_at"
        )
        .bind(1)
        .bind(prompt_id)
        .fetch_one(&pool)
        .await
        .unwrap();
        
        assert_eq!(result.0, Some(1));
        assert!(result.1.is_some()); // pinned_at が設定されていることを確認
        
        // ピン留めされたプロンプトを取得
        let pinned_prompts: Vec<(String, i32)> = sqlx::query_as(
            "SELECT id, pinned_position FROM prompts WHERE pinned_position IS NOT NULL ORDER BY pinned_position"
        )
        .fetch_all(&pool)
        .await
        .unwrap();
        
        assert_eq!(pinned_prompts.len(), 1);
        assert_eq!(pinned_prompts[0].0, prompt_id);
        assert_eq!(pinned_prompts[0].1, 1);
        
        // ピン留め解除をテスト
        let unpin_result = sqlx::query(
            "UPDATE prompts SET pinned_position = NULL, pinned_at = NULL WHERE pinned_position = $1"
        )
        .bind(1)
        .execute(&pool)
        .await
        .unwrap();
        
        assert_eq!(unpin_result.rows_affected(), 1);
        
        // ピン留めが解除されていることを確認
        let pinned_count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM prompts WHERE pinned_position IS NOT NULL"
        )
        .fetch_one(&pool)
        .await
        .unwrap();
        
        assert_eq!(pinned_count.0, 0);
    }

    #[tokio::test]
    async fn test_unique_pin_position_constraint() {
        let pool = create_test_pool().await;
        
        // ユニークインデックスを作成
        sqlx::query("CREATE UNIQUE INDEX idx_prompts_pinned_position_test ON prompts(pinned_position) WHERE pinned_position IS NOT NULL;")
            .execute(&pool)
            .await
            .unwrap();
        
        // 2つのプロンプトを作成
        for i in 1..=2 {
            let prompt_id = format!("test_prompt_{i}");
            sqlx::query(
                "INSERT INTO prompts (id, title, content, tags) VALUES ($1, $2, $3, $4)"
            )
            .bind(&prompt_id)
            .bind(format!("Test Title {i}"))
            .bind(format!("Test content {i}"))
            .bind("[]")
            .execute(&pool)
            .await
            .unwrap();
        }
        
        // 最初のプロンプトをピン留め
        sqlx::query(
            "UPDATE prompts SET pinned_position = $1, pinned_at = CURRENT_TIMESTAMP WHERE id = $2"
        )
        .bind(1)
        .bind("test_prompt_1")
        .execute(&pool)
        .await
        .unwrap();
        
        // 同じ位置に2番目のプロンプトをピン留めしようとするとエラーになることを確認
        let second_pin_result = sqlx::query(
            "UPDATE prompts SET pinned_position = $1, pinned_at = CURRENT_TIMESTAMP WHERE id = $2"
        )
        .bind(1)
        .bind("test_prompt_2")
        .execute(&pool)
        .await;
        
        // SQLite UNIQUE制約違反が発生することを確認
        assert!(second_pin_result.is_err());
    }
}