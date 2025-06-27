/**
 * Cmd+V完全互換のペースト実装
 * 標準UXとの差異を最小化
 */

use core_graphics::event::{
    CGEvent, CGEventType, CGKeyCode, CGEventFlags, CGEventTapLocation
};
use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};

/// 標準Cmd+Vと同じUXを実現
pub fn send_cmd_v_native() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let source = CGEventSource::new(CGEventSourceStateID::HIDSystemState)
            .map_err(|_| "Failed to create event source")?;
        
        // V key (keycode 9) + Command modifier
        let key_down = CGEvent::new_keyboard_event(source.clone(), 9, true)
            .map_err(|_| "Failed to create key down event")?;
        let key_up = CGEvent::new_keyboard_event(source, 9, false)
            .map_err(|_| "Failed to create key up event")?;
        
        // Commandフラグ設定
        key_down.set_flags(CGEventFlags::CGEventFlagCommand);
        key_up.set_flags(CGEventFlags::CGEventFlagCommand);
        
        // 即座に送信（遅延なし）
        key_down.post(CGEventTapLocation::HID);
        key_up.post(CGEventTapLocation::HID);
        
        Ok(())
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        // Windows/Linux用
        use enigo::{Enigo, Key, Keyboard, Settings, Direction};
        
        let mut enigo = Enigo::new(&Settings::default())
            .map_err(|e| format!("Failed to create Enigo: {}", e))?;
        
        // 即座に実行
        enigo.key(Key::Control, Direction::Press)?;
        enigo.key(Key::Unicode('v'), Direction::Click)?;
        enigo.key(Key::Control, Direction::Release)?;
        
        Ok(())
    }
}

/// Cmd+V互換の即座ペースト処理
pub async fn handle_instant_paste(
    app_handle: AppHandle, 
    position: u8
) -> Result<(), HotkeyError> {
    
    // 1. プロンプト取得
    let prompt_text = get_prompt_for_position(position).await?;
    
    // 2. クリップボードに即座にコピー
    app_handle.clipboard().write_text(prompt_text)?;
    
    // 3. 遅延なしで即座にペースト
    send_cmd_v_native().map_err(|e| HotkeyError {
        error: format!("ペーストに失敗: {}", e)
    })?;
    
    // 4. 静かに成功（標準Cmd+Vは音なし）
    // ログ出力も最小限に
    
    Ok(())
}

/// より静かなエラーハンドリング
pub async fn handle_silent_paste(
    app_handle: AppHandle,
    position: u8
) -> Result<(), HotkeyError> {
    
    // 再入防止のみ（ログなし）
    if IS_PASTING.load(Ordering::Relaxed) {
        return Ok(());
    }
    
    IS_PASTING.store(true, Ordering::Relaxed);
    
    let result = async {
        let prompt_text = get_prompt_for_position(position).await?;
        app_handle.clipboard().write_text(prompt_text)?;
        send_cmd_v_native()?;
        Ok(())
    }.await;
    
    IS_PASTING.store(false, Ordering::Relaxed);
    
    // 失敗時も静かに処理（標準Cmd+V同様）
    result.or_else(|_| {
        // 最後の手段：ユーザーに手動ペーストを委ねる
        // （クリップボードには既にコピー済み）
        Ok(())
    })
}

/// アプリケーション別の最適化ペースト
pub fn send_optimized_paste(app_name: &str) -> Result<(), String> {
    match app_name {
        // VS Code: コマンドパレット経由の方が確実
        "Code" | "Visual Studio Code" => {
            send_cmd_v_native()
        }
        
        // Terminal: 特殊な処理が必要な場合
        "Terminal" | "iTerm2" => {
            send_cmd_v_native()
        }
        
        // Web ブラウザ: 標準ペースト
        "Safari" | "Chrome" | "Firefox" => {
            send_cmd_v_native()
        }
        
        // その他: 標準処理
        _ => {
            send_cmd_v_native()
        }
    }
}

/// ペースト後の検証（オプション）
pub async fn verify_paste_success(
    expected_text: &str,
    timeout_ms: u64
) -> bool {
    // アクティブアプリケーションでペーストが成功したかチェック
    // これは複雑なので、通常は省略
    // 必要に応じて実装
    false
}