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
    search_prompts_fast as db_search_prompts_fast,
    update_prompt as db_update_prompt,
    pin_prompt as db_pin_prompt,
    unpin_prompt as db_unpin_prompt,
    get_pinned_prompts as db_get_pinned_prompts,
    get_pinned_prompt_content as db_get_pinned_prompt_content,
    CreatePromptRequest,
    Prompt,
    UpdatePromptRequest,
};

/// エラーレスポンス構造
#[derive(Debug, serde::Serialize)]
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
            error: format!("Failed to get prompt: {e}"),
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
            error: format!("Failed to get prompts: {e}"),
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
            error: format!("Failed to search prompts: {e}"),
        }),
    }
}

/// 高速プロンプト検索コマンド（ショートカット専用）
/// 
/// パフォーマンス重視の検索実装:
/// - 優先度付きソート（完全一致 > 前方一致 > 部分一致）
/// - 結果数制限（最大20件）
/// - <50ms レスポンス目標
#[tauri::command]
pub async fn search_prompts_fast(query: String) -> Result<SuccessResponse<Vec<Prompt>>, ErrorResponse> {
    // 空クエリは早期リターン
    if query.trim().is_empty() {
        return Ok(SuccessResponse {
            success: true,
            data: vec![],
        });
    }
    
    match db_search_prompts_fast(&query).await {
        Ok(prompts) => Ok(SuccessResponse {
            success: true,
            data: prompts,
        }),
        Err(e) => Err(ErrorResponse {
            error: format!("Failed to search prompts fast: {e}"),
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
            error: format!("Failed to delete prompt: {e}"),
        }),
    }
}

/// データベース初期化コマンド
#[tauri::command]
pub async fn init_database() -> Result<SuccessResponse<String>, ErrorResponse> {
    match crate::database::init_database().await {
        Ok(()) => Ok(SuccessResponse {
            success: true,
            data: "Database initialized successfully".to_string(),
        }),
        Err(e) => Err(ErrorResponse {
            error: format!("Failed to initialize database: {e}"),
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

/// プロンプトをピン留めするコマンド
/// 
/// prompt_id: ピン留めするプロンプトのID
/// position: ピン留め位置（1-10）
#[tauri::command]
pub async fn pin_prompt(prompt_id: String, position: u8) -> Result<SuccessResponse<String>, ErrorResponse> {
    // 入力値検証
    if prompt_id.trim().is_empty() {
        return Err(ErrorResponse {
            error: "Prompt ID cannot be empty".to_string(),
        });
    }
    
    if !(1..=10).contains(&position) {
        return Err(ErrorResponse {
            error: "Pin position must be between 1 and 10".to_string(),
        });
    }
    
    match db_pin_prompt(&prompt_id, position).await {
        Ok(()) => Ok(SuccessResponse {
            success: true,
            data: format!("Prompt pinned to position {position}"),
        }),
        Err(e) => Err(ErrorResponse {
            error: format!("Failed to pin prompt: {e}"),
        }),
    }
}

/// プロンプトのピン留めを解除するコマンド
/// 
/// position: 解除するピン留め位置（1-10）
#[tauri::command]
pub async fn unpin_prompt(position: u8) -> Result<SuccessResponse<String>, ErrorResponse> {
    // 入力値検証
    if !(1..=10).contains(&position) {
        return Err(ErrorResponse {
            error: "Pin position must be between 1 and 10".to_string(),
        });
    }
    
    match db_unpin_prompt(position).await {
        Ok(()) => Ok(SuccessResponse {
            success: true,
            data: format!("Prompt unpinned from position {position}"),
        }),
        Err(e) => Err(ErrorResponse {
            error: format!("Failed to unpin prompt: {e}"),
        }),
    }
}

/// ピン留めされたプロンプトを全て取得するコマンド
#[tauri::command]
pub async fn get_pinned_prompts() -> Result<SuccessResponse<Vec<Prompt>>, ErrorResponse> {
    match db_get_pinned_prompts().await {
        Ok(prompts) => Ok(SuccessResponse {
            success: true,
            data: prompts,
        }),
        Err(e) => Err(ErrorResponse {
            error: format!("Failed to get pinned prompts: {e}"),
        }),
    }
}

/// 指定されたピン留め位置のプロンプトをクリップボードにコピーするコマンド
/// 
/// position: コピーするピン留め位置（1-10）
#[tauri::command]
pub async fn copy_pinned_prompt(position: u8) -> Result<SuccessResponse<String>, ErrorResponse> {
    // 入力値検証
    if !(1..=10).contains(&position) {
        return Err(ErrorResponse {
            error: "Pin position must be between 1 and 10".to_string(),
        });
    }
    
    match db_get_pinned_prompt_content(position).await {
        Ok(Some(content)) => {
            // クリップボードにコピー（プラットフォーム別対応）
            let copy_result = if cfg!(target_os = "macos") {
                // macOS: pbcopy
                std::process::Command::new("pbcopy")
                    .stdin(std::process::Stdio::piped())
                    .spawn()
                    .and_then(|mut child| {
                        if let Some(stdin) = child.stdin.as_mut() {
                            use std::io::Write;
                            stdin.write_all(content.as_bytes())?;
                        }
                        child.wait()
                    })
                    .map(|status| status.success())
                    .unwrap_or(false)
            } else if cfg!(target_os = "windows") {
                // Windows: clip
                std::process::Command::new("cmd")
                    .args(["/C", "echo", &content, "|", "clip"])
                    .output()
                    .map(|output| output.status.success())
                    .unwrap_or(false)
            } else {
                // Linux: xclip または xsel を試行
                std::process::Command::new("xclip")
                    .args(["-selection", "clipboard"])
                    .stdin(std::process::Stdio::piped())
                    .spawn()
                    .and_then(|mut child| {
                        if let Some(stdin) = child.stdin.as_mut() {
                            use std::io::Write;
                            stdin.write_all(content.as_bytes())?;
                        }
                        child.wait()
                    })
                    .map(|status| status.success())
                    .unwrap_or_else(|_| {
                        // xclip が失敗した場合は xsel を試行
                        std::process::Command::new("xsel")
                            .args(["--clipboard", "--input"])
                            .stdin(std::process::Stdio::piped())
                            .spawn()
                            .and_then(|mut child| {
                                if let Some(stdin) = child.stdin.as_mut() {
                                    use std::io::Write;
                                    stdin.write_all(content.as_bytes())?;
                                }
                                child.wait()
                            })
                            .map(|status| status.success())
                            .unwrap_or(false)
                    })
            };
            
            if copy_result {
                Ok(SuccessResponse {
                    success: true,
                    data: format!("Prompt from position {position} copied to clipboard"),
                })
            } else {
                // クリップボード操作に失敗した場合は内容を返す
                Ok(SuccessResponse {
                    success: true,
                    data: format!("Clipboard operation failed. Content length: {} characters", content.len()),
                })
            }
        }
        Ok(None) => Err(ErrorResponse {
            error: format!("No prompt found at pin position {position}"),
        }),
        Err(e) => Err(ErrorResponse {
            error: format!("Failed to get pinned prompt: {e}"),
        }),
    }
}

#[cfg(test)]
mod tests {

    #[tokio::test]
    async fn test_create_prompt_command() {
        // データベース初期化が必要なため、統合テストで実装
        // CI環境でのテスト戦略を検討
    }
}