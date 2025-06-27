/**
 * Cmd+V標準UXに準拠したペースト実装
 */

use std::time::Duration;

/// より標準的なペースト実装
fn send_native_paste_improved() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        // CGEvent使用でよりネイティブに近い実装
        use core_graphics::event::{CGEvent, CGEventType, CGKeyCode, CGEventFlags};
        use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};
        
        let source = CGEventSource::new(CGEventSourceStateID::HIDSystemState)
            .map_err(|_| "Failed to create event source")?;
        
        // Cmd+V キーイベントを生成
        let cmd_v_down = CGEvent::new_keyboard_event(
            source.clone(),
            CGKeyCode(9), // V key
            true // key down
        ).map_err(|_| "Failed to create key down event")?;
        
        let cmd_v_up = CGEvent::new_keyboard_event(
            source,
            CGKeyCode(9), // V key  
            false // key up
        ).map_err(|_| "Failed to create key up event")?;
        
        // Commandフラグを設定
        cmd_v_down.set_flags(CGEventFlags::CGEventFlagCommand);
        cmd_v_up.set_flags(CGEventFlags::CGEventFlagCommand);
        
        // イベント送信
        cmd_v_down.post(CGEventTapLocation::HIDEventTap);
        cmd_v_up.post(CGEventTapLocation::HIDEventTap);
        
        Ok(())
    }
    
    #[cfg(target_os = "windows")]
    {
        // Windows用実装（より正確）
        use winapi::um::winuser::{keybd_event, VK_CONTROL, VK_V, KEYEVENTF_KEYUP};
        
        unsafe {
            keybd_event(VK_CONTROL as u8, 0, 0, 0);
            keybd_event('V' as u8, 0, 0, 0);
            keybd_event('V' as u8, 0, KEYEVENTF_KEYUP, 0);
            keybd_event(VK_CONTROL as u8, 0, KEYEVENTF_KEYUP, 0);
        }
        
        Ok(())
    }
    
    #[cfg(target_os = "linux")]
    {
        // X11使用でより正確
        // 実装省略...
        Ok(())
    }
}

/// 待機時間なしの即座ペースト
async fn handle_palette_hotkey_improved(app_handle: AppHandle, position: u8) -> Result<(), HotkeyError> {
    // 既存の処理...
    
    // クリップボードにコピー
    app_handle.clipboard().write_text(prompt_text.clone())?;
    
    // 待機時間を削除 - 即座にペースト
    match send_native_paste_improved() {
        Ok(_) => {
            // 成功時のみ通知
            app_handle.emit("palette-pasted", serde_json::json!({
                "position": position,
                "success": true,
                "timestamp": chrono::Utc::now().to_rfc3339()
            }))?;
        }
        Err(e) => {
            // 失敗時はユーザーに手動ペーストを促す
            app_handle.emit("paste-failed", serde_json::json!({
                "position": position,
                "error": e,
                "action": "manual_paste_required"
            }))?;
            
            return Err(HotkeyError {
                error: format!("ペーストに失敗しました。手動でCmd+Vを実行してください: {}", e)
            });
        }
    }
    
    Ok(())
}

/// フォールバック機能付きペースト
fn send_paste_with_fallback() -> Result<(), String> {
    // 1. 最初にCGEventで試行
    if let Ok(_) = send_native_paste_improved() {
        return Ok(());
    }
    
    // 2. 失敗時はAppleScriptフォールバック
    #[cfg(target_os = "macos")]
    {
        let script = r#"
            tell application "System Events"
                key code 9 using command down
            end tell
        "#;
        
        let output = std::process::Command::new("osascript")
            .arg("-e")
            .arg(script)
            .output()
            .map_err(|e| format!("AppleScript fallback failed: {}", e))?;
        
        if output.status.success() {
            Ok(())
        } else {
            Err("Both CGEvent and AppleScript failed".to_string())
        }
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Err("Native paste failed".to_string())
    }
}