use csv::WriterBuilder;
use encoding_rs::{Encoding, UTF_8};
use std::fs::File;
use std::io::Write;

use super::model::CsvDocument;

pub fn write_csv_file(document: &CsvDocument) -> Result<(), String> {
    let encoding = Encoding::for_label(document.encoding.as_bytes()).unwrap_or(UTF_8);

    let mut writer = WriterBuilder::new()
        .delimiter(document.delimiter as u8)
        .from_writer(Vec::new());

    writer
        .write_record(&document.headers)
        .map_err(|e| format!("Não foi possível escrever o cabeçalho: {e}"))?;
    for row in &document.rows {
        writer
            .write_record(row)
            .map_err(|e| format!("Não foi possível escrever a linha: {e}"))?;
    }

    let bytes = writer
        .into_inner()
        .map_err(|e| format!("Não foi possível finalizar o arquivo: {e}"))?;
    let text = String::from_utf8(bytes).map_err(|e| e.to_string())?;
    let (encoded, _, _) = encoding.encode(&text);

    let mut file =
        File::create(&document.path).map_err(|e| format!("Não foi possível criar o arquivo: {e}"))?;
    file.write_all(&encoded)
        .map_err(|e| format!("Não foi possível gravar o arquivo: {e}"))?;
    Ok(())
}
