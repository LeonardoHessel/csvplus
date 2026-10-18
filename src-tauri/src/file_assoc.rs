#[cfg(target_os = "windows")]
pub fn register_default_handler() -> Result<String, String> {
    use std::env::current_exe;
    use winreg::enums::HKEY_CURRENT_USER;
    use winreg::RegKey;

    let exe_path = current_exe()
        .map_err(|e| e.to_string())?
        .to_string_lossy()
        .to_string();

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);

    let (prog_id_key, _) = hkcu
        .create_subkey("Software\\Classes\\CSVPlus.csv")
        .map_err(|e| e.to_string())?;
    prog_id_key
        .set_value("", &"Documento CSV (CSVPlus)")
        .map_err(|e| e.to_string())?;

    let (command_key, _) = hkcu
        .create_subkey("Software\\Classes\\CSVPlus.csv\\shell\\open\\command")
        .map_err(|e| e.to_string())?;
    command_key
        .set_value("", &format!("\"{exe_path}\" \"%1\""))
        .map_err(|e| e.to_string())?;

    let (open_with_key, _) = hkcu
        .create_subkey("Software\\Classes\\.csv\\OpenWithProgids")
        .map_err(|e| e.to_string())?;
    open_with_key
        .set_value("CSVPlus.csv", &"")
        .map_err(|e| e.to_string())?;

    std::process::Command::new("cmd")
        .args(["/C", "start", "ms-settings:defaultapps"])
        .spawn()
        .ok();

    Ok(
        "CSVPlus foi registrado como opção para abrir arquivos .csv. Nas Configurações do Windows que acabaram de abrir, procure por \".csv\" e selecione CSVPlus como padrão."
            .to_string(),
    )
}

#[cfg(target_os = "linux")]
pub fn register_default_handler() -> Result<String, String> {
    use std::env::current_exe;
    use std::fs;

    let exe_path = current_exe()
        .map_err(|e| e.to_string())?
        .to_string_lossy()
        .to_string();
    let home = std::env::var("HOME").map_err(|_| "Variável de ambiente HOME não definida".to_string())?;
    let apps_dir = format!("{home}/.local/share/applications");
    fs::create_dir_all(&apps_dir).map_err(|e| e.to_string())?;

    let desktop_entry = format!(
        "[Desktop Entry]\nType=Application\nName=CSVPlus\nExec=\"{exe_path}\" %f\nMimeType=text/csv;\nTerminal=false\nCategories=Utility;\n"
    );
    let desktop_path = format!("{apps_dir}/csvplus.desktop");
    fs::write(&desktop_path, desktop_entry).map_err(|e| e.to_string())?;

    std::process::Command::new("update-desktop-database")
        .arg(&apps_dir)
        .status()
        .ok();

    std::process::Command::new("xdg-mime")
        .args(["default", "csvplus.desktop", "text/csv"])
        .status()
        .map_err(|e| format!("Não foi possível executar xdg-mime: {e}"))?;

    Ok("CSVPlus foi definido como aplicativo padrão para arquivos .csv.".to_string())
}

#[cfg(not(any(target_os = "windows", target_os = "linux")))]
pub fn register_default_handler() -> Result<String, String> {
    Err("Associação de arquivo não é suportada nesta plataforma.".to_string())
}
