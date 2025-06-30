fn main() {
    // 環境変数から現在の環境を取得
    let app_env = std::env::var("APP_ENV").unwrap_or_else(|_| "production".to_string());
    
    // 環境に基づいて Tauri のビルド設定を調整
    match app_env.as_str() {
        "development" => {
            println!("cargo:rustc-env=APP_NAME=PromPalette Dev");
            println!("cargo:rustc-env=APP_IDENTIFIER=com.prompalette.app.dev");
        },
        "staging" => {
            println!("cargo:rustc-env=APP_NAME=PromPalette Staging");
            println!("cargo:rustc-env=APP_IDENTIFIER=com.prompalette.app.staging");
        },
        _ => {
            println!("cargo:rustc-env=APP_NAME=PromPalette");
            println!("cargo:rustc-env=APP_IDENTIFIER=com.prompalette.app");
        }
    }
    
    // デフォルトの Tauri ビルド処理
    tauri_build::build()
}