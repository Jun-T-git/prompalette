/**
 * Tauriコマンド実装
 * フロントエンドからバックエンドへのAPI呼び出し処理
 */
use crate::database::{
    create_prompt as db_create_prompt,
    delete_prompt as db_delete_prompt,
    get_all_prompts as db_get_all_prompts,
    get_prompt as db_get_prompt,
    search_prompts as db_search_prompts,
    update_prompt as db_update_prompt,
    CreatePromptRequest,
    Prompt,
    UpdatePromptRequest,
};

/// エラーレスポンス構造
#[derive(serde::Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

/// 成功レスポンス構造
#[derive(serde::Serialize)]
pub struct SuccessResponse<T> {
    pub success: bool,
    pub data: T,
}

/// プロンプト作成コマンド
#[tauri::command]
pub async fn create_prompt(request: CreatePromptRequest) -> Result<SuccessResponse<Prompt>, ErrorResponse> {
    // 基本的な入力値チェック
    if request.title.trim().is_empty() {
        return Err(ErrorResponse {
            error: "Title cannot be empty".to_string(),
        });
    }
    
    if request.content.trim().is_empty() {
        return Err(ErrorResponse {
            error: "Content cannot be empty".to_string(),
        });
    }
    
    match db_create_prompt(request).await {
        Ok(prompt) => Ok(SuccessResponse {
            success: true,
            data: prompt,
        }),
        Err(_e) => Err(ErrorResponse {
            error: "Failed to create prompt. Please check your input and try again.".to_string(),
        }),
    }
}

/// プロンプト取得コマンド（ID指定）
#[tauri::command]
pub async fn get_prompt(id: String) -> Result<SuccessResponse<Option<Prompt>>, ErrorResponse> {
    match db_get_prompt(&id).await {
        Ok(prompt) => Ok(SuccessResponse {
            success: true,
            data: prompt,
        }),
        Err(e) => Err(ErrorResponse {
            error: format!("Failed to get prompt: {}", e),
        }),
    }
}

/// 全プロンプト取得コマンド
#[tauri::command]
pub async fn get_all_prompts() -> Result<SuccessResponse<Vec<Prompt>>, ErrorResponse> {
    match db_get_all_prompts().await {
        Ok(prompts) => Ok(SuccessResponse {
            success: true,
            data: prompts,
        }),
        Err(e) => Err(ErrorResponse {
            error: format!("Failed to get prompts: {}", e),
        }),
    }
}

/// プロンプト検索コマンド
#[tauri::command]
pub async fn search_prompts(query: String) -> Result<SuccessResponse<Vec<Prompt>>, ErrorResponse> {
    match db_search_prompts(&query).await {
        Ok(prompts) => Ok(SuccessResponse {
            success: true,
            data: prompts,
        }),
        Err(e) => Err(ErrorResponse {
            error: format!("Failed to search prompts: {}", e),
        }),
    }
}

/// プロンプト更新コマンド
#[tauri::command]
pub async fn update_prompt(
    id: String,
    request: UpdatePromptRequest,
) -> Result<SuccessResponse<Option<Prompt>>, ErrorResponse> {
    // 基本的な入力値チェック
    if id.trim().is_empty() {
        return Err(ErrorResponse {
            error: "Prompt ID cannot be empty".to_string(),
        });
    }
    
    match db_update_prompt(&id, request).await {
        Ok(prompt) => Ok(SuccessResponse {
            success: true,
            data: prompt,
        }),
        Err(_e) => Err(ErrorResponse {
            error: "Failed to update prompt. Please check your input and try again.".to_string(),
        }),
    }
}

/// プロンプト削除コマンド
#[tauri::command]
pub async fn delete_prompt(id: String) -> Result<SuccessResponse<bool>, ErrorResponse> {
    match db_delete_prompt(&id).await {
        Ok(deleted) => Ok(SuccessResponse {
            success: true,
            data: deleted,
        }),
        Err(e) => Err(ErrorResponse {
            error: format!("Failed to delete prompt: {}", e),
        }),
    }
}

/// データベース初期化コマンド
#[tauri::command]
pub async fn init_database() -> Result<SuccessResponse<String>, ErrorResponse> {
    match crate::database::init_database().await {
        Ok(_) => Ok(SuccessResponse {
            success: true,
            data: "Database initialized successfully".to_string(),
        }),
        Err(e) => Err(ErrorResponse {
            error: format!("Failed to initialize database: {}", e),
        }),
    }
}

/// アプリケーション情報取得コマンド
#[tauri::command]
pub async fn get_app_info() -> Result<SuccessResponse<serde_json::Value>, ErrorResponse> {
    let info = serde_json::json!({
        "name": "PromPalette",
        "version": env!("CARGO_PKG_VERSION"),
        "description": "Your AI Prompts, Beautifully Organized"
    });
    
    Ok(SuccessResponse {
        success: true,
        data: info,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_prompt_command() {
        // データベース初期化が必要なため、統合テストで実装
        // CI環境でのテスト戦略を検討
    }
}