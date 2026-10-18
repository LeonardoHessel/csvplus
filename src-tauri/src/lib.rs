mod commands;
mod csv;
mod file_assoc;

fn cli_file_path() -> Option<String> {
    std::env::args().skip(1).find(|arg| !arg.starts_with('-'))
}

#[tauri::command]
fn get_startup_file() -> Option<String> {
    cli_file_path()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            commands::open_csv,
            commands::save_csv,
            commands::set_default_csv_handler,
            get_startup_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
