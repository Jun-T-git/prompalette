/*!
 * Environment detection commands for Tauri frontend
 */

use crate::environment::Environment;

/// Get current environment as string for frontend
#[tauri::command]
pub fn get_current_environment() -> String {
    let env = Environment::current();
    match env {
        Environment::Development => "development".to_string(),
        Environment::Staging => "staging".to_string(),
        Environment::Production => "production".to_string(),
    }
}

/// Get environment-specific app information
#[tauri::command]
pub fn get_environment_info() -> serde_json::Value {
    let env = Environment::current();
    serde_json::json!({
        "environment": get_current_environment(),
        "app_name": env.app_name(),
        "app_identifier": env.app_identifier(),
        "window_title": env.window_title(),
        "storage_prefix": match env {
            Environment::Development => "prompalette-dev",
            Environment::Staging => "prompalette-staging",
            Environment::Production => "prompalette",
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn test_get_current_environment() {
        // Test development environment
        env::set_var("APP_ENV", "development");
        assert_eq!(get_current_environment(), "development");

        // Test staging environment
        env::set_var("APP_ENV", "staging");
        assert_eq!(get_current_environment(), "staging");

        // Test production environment
        env::set_var("APP_ENV", "production");
        assert_eq!(get_current_environment(), "production");

        // Clean up
        env::remove_var("APP_ENV");
    }

    #[test]
    fn test_get_environment_info() {
        env::set_var("APP_ENV", "development");
        let info = get_environment_info();
        
        assert_eq!(info["environment"], "development");
        assert_eq!(info["app_name"], "PromPalette Dev");
        assert_eq!(info["storage_prefix"], "prompalette-dev");

        env::remove_var("APP_ENV");
    }
}