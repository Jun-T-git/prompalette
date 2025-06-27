/*!
 * グローバルホットキーによるパレット即時ペースト機能（CGEvent版）
 * 
 * Cmd+Ctrl+数字キー (1-9, 0) でパレット位置のプロンプトを
 * アクティブアプリケーションに直接ペーストする機能を提供
 * 
 * 設計方針:
 * - CGEventを使用してネイティブなCmd+V操作を実現
 * - 複雑なデバウンスやリトライ機構を排除
 * - OS標準のペーストUXと完全に同じ動作
 */
use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::GlobalShortcutExt;
use tauri_plugin_clipboard_manager::ClipboardExt;
use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::time::{Duration, Instant};

use crate::commands;

/// ペースト処理中フラグ（ホットキー再発火防止のみ）
static IS_PASTING: AtomicBool = AtomicBool::new(false);

/// 最後のホットキー実行時間（キーリピート防止）
static LAST_HOTKEY_TIMES: std::sync::OnceLock<Mutex<HashMap<u8, Instant>>> = std::sync::OnceLock::new();

/// ホットキーエラー
#[derive(Debug, serde::Serialize)]
pub struct HotkeyError {
    pub error: String,
}

/// パレット位置とショートカットキーのマッピング
const PALETTE_HOTKEYS: &[(u8, &str)] = &[
    (1, "CommandOrControl+Control+1"),
    (2, "CommandOrControl+Control+2"), 
    (3, "CommandOrControl+Control+3"),
    (4, "CommandOrControl+Control+4"),
    (5, "CommandOrControl+Control+5"),
    (6, "CommandOrControl+Control+6"),
    (7, "CommandOrControl+Control+7"),
    (8, "CommandOrControl+Control+8"),
    (9, "CommandOrControl+Control+9"),
    (10, "CommandOrControl+Control+0"), // 位置10は0キー
];

/**
 * パレット用グローバルホットキーを登録
 */
#[tauri::command]
pub async fn register_palette_hotkeys(app_handle: AppHandle) -> Result<(), HotkeyError> {
    // パレットホットキー登録開始
    
    for &(position, hotkey) in PALETTE_HOTKEYS {
        // ホットキー登録: {} -> 位置 {}
        
        app_handle
            .global_shortcut()
            .on_shortcut(hotkey, move |app_handle, _shortcut, event| {
                // ホットキーイベント受信
                
                // キーダウンイベントのみ処理（キーアップは無視）
                match event.state {
                    tauri_plugin_global_shortcut::ShortcutState::Released => {
                        return; // キーアップ無視
                    }
                    tauri_plugin_global_shortcut::ShortcutState::Pressed => {
                        // キーダウン検知
                    }
                }
                
                // IS_PASTINGフラグもここでチェック
                if IS_PASTING.load(Ordering::Relaxed) {
                    return; // ペースト処理中は無視
                }
                
                // キーリピート防止：300ms以内の同じキーは無視
                let last_times = LAST_HOTKEY_TIMES.get_or_init(|| Mutex::new(HashMap::new()));
                let now = Instant::now();
                
                {
                    let mut times = match last_times.lock() {
                        Ok(times) => times,
                        Err(_) => return, // Mutex汚染時は静かに終了
                    };
                    if let Some(&last_time) = times.get(&position) {
                        let elapsed = now.duration_since(last_time);
                        if elapsed < Duration::from_millis(300) {
                            return; // キーリピート防止
                        }
                    }
                    times.insert(position, now);
                }
                let handle = app_handle.clone();
                tauri::async_runtime::spawn(async move {
                    let _ = handle_palette_hotkey(handle, position).await; // 静かに処理
                });
            })
            .map_err(|e| {
                HotkeyError {
                    error: format!("パレット位置{position}のホットキー '{hotkey}'の登録に失敗しました: {e}")
                }
            })?;
            
        // ホットキー登録成功
    }

    // パレットホットキー登録完了
    Ok(())
}

/**
 * パレットホットキー押下時の処理
 * 
 * シンプルな流れ:
 * 1. 指定位置のピン留めプロンプトを取得
 * 2. クリップボードにコピー  
 * 3. CGEventでネイティブなCmd+Vを送信
 */
async fn handle_palette_hotkey(app_handle: AppHandle, position: u8) -> Result<(), HotkeyError> {
    // 簡単な再入防止のみ
    if IS_PASTING.load(Ordering::Relaxed) {
        return Ok(());
    }
    
    IS_PASTING.store(true, Ordering::Relaxed);
    
    // エラー時に必ずフラグをリセットするためのクリーンアップ
    let cleanup = || {
        IS_PASTING.store(false, Ordering::Relaxed);
    };
    
    // 1. ピン留めプロンプトを取得（静音）
    let pinned_prompts_response = if let Ok(response) = commands::get_pinned_prompts().await { response } else {
        cleanup();
        return Ok(()); // 静かに失敗
    };
    
    // 2. 指定位置のプロンプトを検索（静音）
    let prompt_text = if let Some(text) = pinned_prompts_response.data
        .iter()
        .find(|p| p.pinned_position == Some(position))
        .map(|p| p.content.clone()) { text } else {
        cleanup();
        return Ok(()); // 静かに失敗
    };

    // 3. クリップボードにコピー（静音）
    if app_handle.clipboard().write_text(prompt_text.clone()).is_err() {
        cleanup();
        return Ok(()); // 静かに失敗
    }
    
    // 4. 即座にネイティブなCmd+V送信（遅延なし・静音）
    if send_native_paste().is_err() {
        // 失敗時も静かに処理（標準Cmd+V同様）
        // クリップボードにはコピー済みなので、ユーザーは手動ペースト可能
    }

    // 5. 静かな成功通知（デバッグ情報は含まない）
    let _ = app_handle.emit("palette-pasted", serde_json::json!({
        "position": position,
        "success": true,
        "timestamp": chrono::Utc::now().to_rfc3339()
        // "text" は除外（セキュリティ向上）
    }));
    cleanup();
    Ok(())
}

/**
 * CGEventを使用してネイティブなCmd+Vを送信
 * OS標準のペーストと完全に同じ動作を実現
 */
fn send_native_paste() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        use core_graphics::event::{
            CGEvent, CGEventFlags, CGEventTapLocation
        };
        use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};
        
        // CGEventで直接キーイベントを送信（標準Cmd+Vと同じ）
        let source = CGEventSource::new(CGEventSourceStateID::HIDSystemState)
            .map_err(|()| "Failed to create event source".to_string())?;
        
        // V key (keycode 9) + Command modifier
        let key_down = CGEvent::new_keyboard_event(source.clone(), 9, true)
            .map_err(|()| "Failed to create key down event".to_string())?;
        let key_up = CGEvent::new_keyboard_event(source, 9, false)
            .map_err(|()| "Failed to create key up event".to_string())?;
        
        // Commandフラグ設定
        key_down.set_flags(CGEventFlags::CGEventFlagCommand);
        key_up.set_flags(CGEventFlags::CGEventFlagCommand);
        
        // 即座にキーイベント送信
        key_down.post(CGEventTapLocation::HID);
        key_up.post(CGEventTapLocation::HID);
        
        Ok(())
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        // Windows/Linuxでは従来のenigo使用（即座に実行）
        use enigo::{Enigo, Key, Keyboard, Settings, Direction};
        
        let mut enigo = Enigo::new(&Settings::default())
            .map_err(|e| format!("Failed to create Enigo: {}", e))?;
        
        // Ctrl+V送信（即座）
        enigo.key(Key::Control, Direction::Press)
            .map_err(|e| format!("Failed to press Ctrl: {}", e))?;
        enigo.key(Key::Unicode('v'), Direction::Click)
            .map_err(|e| format!("Failed to click V: {}", e))?;
        enigo.key(Key::Control, Direction::Release)
            .map_err(|e| format!("Failed to release Ctrl: {}", e))?;
        
        Ok(())
    }
}

/**
 * 全てのパレットホットキーを解除
 */
#[tauri::command]
pub async fn unregister_palette_hotkeys(app_handle: AppHandle) -> Result<(), HotkeyError> {
    for &(_, hotkey) in PALETTE_HOTKEYS {
        if let Err(e) = app_handle.global_shortcut().unregister(hotkey) {
            eprintln!("Failed to unregister hotkey '{hotkey}': {e}");
        }
    }
    
    println!("Unregistered all palette hotkeys");
    Ok(())
}

/**
 * パレットホットキーの状態を取得
 */
#[tauri::command]
pub async fn get_palette_hotkey_status(app_handle: AppHandle) -> Result<serde_json::Value, HotkeyError> {
    let mut status = HashMap::new();
    
    for &(position, hotkey) in PALETTE_HOTKEYS {
        let is_registered = app_handle
            .global_shortcut()
            .is_registered(hotkey);
            
        status.insert(position.to_string(), serde_json::json!({
            "hotkey": hotkey,
            "registered": is_registered,
            "position": position
        }));
    }
    
    Ok(serde_json::json!({
        "palette_hotkeys": status,
        "total_hotkeys": PALETTE_HOTKEYS.len()
    }))
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_palette_hotkeys_mapping() {
        assert_eq!(PALETTE_HOTKEYS.len(), 10);
        
        let positions: Vec<u8> = PALETTE_HOTKEYS.iter().map(|(pos, _)| *pos).collect();
        for i in 1..=10 {
            assert!(positions.contains(&i), "Position {i} is missing");
        }
    }
}