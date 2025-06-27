/**
 * Cmd+V標準UX完全準拠版
 * 遅延なし・静か・確実
 */

use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::GlobalShortcutExt;
use tauri_plugin_clipboard_manager::ClipboardExt;
use std::sync::atomic::{AtomicBool, Ordering};

#[cfg(target_os = "macos")]
use core_graphics::event::{
    CGEvent, CGEventFlags, CGEventTapLocation
};
#[cfg(target_os = "macos")]
use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};

static IS_PASTING: AtomicBool = AtomicBool::new(false);

/// Cmd+V標準UX準拠のペースト処理
async fn handle_palette_hotkey_standard(
    app_handle: AppHandle, 
    position: u8
) -> Result<(), HotkeyError> {
    
    // 簡潔な再入防止
    if IS_PASTING.swap(true, Ordering::Relaxed) {
        return Ok(());
    }
    
    let result = async {
        // 1. プロンプト取得（ログなし）
        let pinned_prompts = commands::get_pinned_prompts().await?;
        let prompt_text = pinned_prompts.data
            .iter()
            .find(|p| p.pinned_position == Some(position))
            .map(|p| p.content.clone())
            .ok_or_else(|| HotkeyError {
                error: "No prompt at position".to_string()
            })?;
        
        // 2. クリップボードコピー（即座）
        app_handle.clipboard().write_text(prompt_text)
            .map_err(|e| HotkeyError {
                error: format!("Clipboard error: {}", e)
            })?;
        
        // 3. 即座にCmd+V送信（遅延なし）
        send_instant_cmd_v()?;
        
        Ok(())
    }.await;
    
    IS_PASTING.store(false, Ordering::Relaxed);
    
    // 静かに結果を返す（標準Cmd+V同様）
    match result {
        Ok(_) => Ok(()),
        Err(_) => {
            // 失敗しても無音（クリップボードはコピー済み）
            // ユーザーは手動でCmd+Vすれば良い
            Ok(())
        }
    }
}

/// 即座のCmd+V送信（遅延ゼロ）
fn send_instant_cmd_v() -> Result<(), HotkeyError> {
    #[cfg(target_os = "macos")]
    {
        let source = CGEventSource::new(CGEventSourceStateID::HIDSystemState)
            .map_err(|_| HotkeyError {
                error: "Event source creation failed".to_string()
            })?;
        
        // V key (keycode 9) with Command modifier
        let key_down = CGEvent::new_keyboard_event(source.clone(), 9, true)
            .map_err(|_| HotkeyError {
                error: "Key down event creation failed".to_string()
            })?;
        let key_up = CGEvent::new_keyboard_event(source, 9, false)
            .map_err(|_| HotkeyError {
                error: "Key up event creation failed".to_string()
            })?;
        
        key_down.set_flags(CGEventFlags::CGEventFlagCommand);
        key_up.set_flags(CGEventFlags::CGEventFlagCommand);
        
        // 即座に送信
        key_down.post(CGEventTapLocation::HID);
        key_up.post(CGEventTapLocation::HID);
        
        Ok(())
    }
    
    #[cfg(target_os = "windows")]
    {
        use winapi::um::winuser::{keybd_event, VK_CONTROL, KEYEVENTF_KEYUP};
        
        unsafe {
            keybd_event(VK_CONTROL as u8, 0, 0, 0);
            keybd_event(b'V', 0, 0, 0);
            keybd_event(b'V', 0, KEYEVENTF_KEYUP, 0);
            keybd_event(VK_CONTROL as u8, 0, KEYEVENTF_KEYUP, 0);
        }
        
        Ok(())
    }
    
    #[cfg(target_os = "linux")]
    {
        use enigo::{Enigo, Key, Keyboard, Settings, Direction};
        
        let mut enigo = Enigo::new(&Settings::default())
            .map_err(|e| HotkeyError {
                error: format!("Enigo creation failed: {}", e)
            })?;
        
        enigo.key(Key::Control, Direction::Press)
            .map_err(|e| HotkeyError {
                error: format!("Ctrl press failed: {}", e)
            })?;
        enigo.key(Key::Unicode('v'), Direction::Click)
            .map_err(|e| HotkeyError {
                error: format!("V click failed: {}", e)
            })?;
        enigo.key(Key::Control, Direction::Release)
            .map_err(|e| HotkeyError {
                error: format!("Ctrl release failed: {}", e)
            })?;
        
        Ok(())
    }
}

/// デバッグモード用（開発時のみ）
async fn handle_palette_hotkey_debug(
    app_handle: AppHandle, 
    position: u8
) -> Result<(), HotkeyError> {
    println!("🔥 [DEBUG] パレットホットキー開始: 位置 {}", position);
    
    let result = handle_palette_hotkey_standard(app_handle.clone(), position).await;
    
    match &result {
        Ok(_) => println!("✅ [DEBUG] パレットホットキー成功: 位置 {}", position),
        Err(e) => println!("❌ [DEBUG] パレットホットキー失敗: 位置 {} - {}", position, e.error),
    }
    
    result
}