/**
 * グローバルホットキー機能のテスト
 * 
 * 単体テストとしてテスト可能な部分（定数、ユーティリティ関数等）をテスト
 * 統合テストは別途 E2E テストで実装
 */

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_palette_hotkeys_mapping() {
        // 正確に10個のホットキーが定義されているか確認
        assert_eq!(PALETTE_HOTKEYS.len(), 10);
        
        // 位置1-10がすべて含まれているか確認
        let positions: Vec<u8> = PALETTE_HOTKEYS.iter().map(|(pos, _)| *pos).collect();
        for i in 1..=10 {
            assert!(positions.contains(&i), "Position {} is missing", i);
        }
    }
    
    #[test]
    fn test_hotkey_formats() {
        // 全てのホットキーが正しい形式か確認
        for &(position, hotkey) in PALETTE_HOTKEYS {
            assert!(hotkey.starts_with("CommandOrControl+Alt+"), 
                   "Invalid hotkey format for position {}: {}", position, hotkey);
            
            // ホットキーの末尾が適切な数字かチェック
            if position == 10 {
                assert!(hotkey.ends_with("0"), "Position 10 should map to key '0'");
            } else {
                let expected_key = position.to_string();
                assert!(hotkey.ends_with(&expected_key), 
                       "Position {} should map to key '{}'", position, expected_key);
            }
        }
    }
    
    #[test]
    fn test_hotkey_uniqueness() {
        // 全てのホットキーが一意であることを確認
        let hotkeys: Vec<&str> = PALETTE_HOTKEYS.iter().map(|(_, hotkey)| *hotkey).collect();
        let mut unique_hotkeys = hotkeys.clone();
        unique_hotkeys.sort();
        unique_hotkeys.dedup();
        
        assert_eq!(hotkeys.len(), unique_hotkeys.len(), "Duplicate hotkeys found");
    }
    
    #[test]
    fn test_position_uniqueness() {
        // 全ての位置が一意であることを確認
        let positions: Vec<u8> = PALETTE_HOTKEYS.iter().map(|(pos, _)| *pos).collect();
        let mut unique_positions = positions.clone();
        unique_positions.sort();
        unique_positions.dedup();
        
        assert_eq!(positions.len(), unique_positions.len(), "Duplicate positions found");
    }

    #[test]
    fn test_error_creation() {
        // HotkeyError の作成テスト
        let error = HotkeyError {
            error: "Test error".to_string()
        };
        
        assert_eq!(error.error, "Test error");
        
        // シリアライズできることを確認
        let serialized = serde_json::to_string(&error);
        assert!(serialized.is_ok());
    }
}