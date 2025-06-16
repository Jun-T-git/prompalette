/**
 * PromPalette Native App - Tauri Application
 * プロンプト管理のためのデスクトップアプリケーション
 */

mod database;
mod commands;

use commands::*;

/// Legacy greet command (for testing)
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|_app| {
            // アプリケーション起動時にデータベースを同期的に初期化
            // エラー時はアプリケーション起動を停止
            tauri::async_runtime::block_on(async {
                database::init_database().await
            }).map_err(|e| {
                eprintln!("Critical: Failed to initialize database: {}", e);
                eprintln!("Application cannot start without database. Please check permissions and disk space.");
                e.to_string()
            })?;
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            init_database,
            create_prompt,
            get_prompt,
            get_all_prompts,
            search_prompts,
            update_prompt,
            delete_prompt,
            get_app_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
