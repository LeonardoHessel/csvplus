use crate::csv::{model::CsvDocument, parser::parse_csv_file, writer::write_csv_file};
use crate::file_assoc;

#[tauri::command]
pub fn open_csv(path: String) -> Result<CsvDocument, String> {
    parse_csv_file(&path)
}

#[tauri::command]
pub fn save_csv(mut document: CsvDocument, path: String) -> Result<(), String> {
    document.path = path;
    write_csv_file(&document)
}

#[tauri::command]
pub fn set_default_csv_handler() -> Result<String, String> {
    file_assoc::register_default_handler()
}
