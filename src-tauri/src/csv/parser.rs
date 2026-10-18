use csv::ReaderBuilder;
use encoding_rs::{Encoding, UTF_8, WINDOWS_1252};
use std::fs;

use super::model::CsvDocument;

const DELIMITER_CANDIDATES: [u8; 4] = [b',', b';', b'\t', b'|'];

fn detect_encoding(bytes: &[u8]) -> &'static Encoding {
    if bytes.starts_with(&[0xEF, 0xBB, 0xBF]) {
        return UTF_8;
    }
    match std::str::from_utf8(bytes) {
        Ok(_) => UTF_8,
        Err(_) => WINDOWS_1252,
    }
}

fn detect_delimiter(text: &str) -> u8 {
    let first_line = text.lines().next().unwrap_or("");
    DELIMITER_CANDIDATES
        .iter()
        .copied()
        .max_by_key(|&candidate| first_line.bytes().filter(|&b| b == candidate).count())
        .unwrap_or(b',')
}

pub fn parse_csv_file(path: &str) -> Result<CsvDocument, String> {
    let bytes = fs::read(path).map_err(|e| format!("Não foi possível ler o arquivo: {e}"))?;
    let encoding = detect_encoding(&bytes);
    let (text, _, _) = encoding.decode(&bytes);
    let delimiter = detect_delimiter(&text);

    let mut reader = ReaderBuilder::new()
        .delimiter(delimiter)
        .has_headers(true)
        .flexible(true)
        .from_reader(text.as_bytes());

    let headers = reader
        .headers()
        .map_err(|e| format!("Não foi possível ler o cabeçalho: {e}"))?
        .iter()
        .map(|s| s.to_string())
        .collect::<Vec<_>>();

    let mut rows = Vec::new();
    for result in reader.records() {
        let record = result.map_err(|e| format!("Linha inválida no CSV: {e}"))?;
        rows.push(record.iter().map(|s| s.to_string()).collect());
    }

    Ok(CsvDocument {
        path: path.to_string(),
        headers,
        rows,
        delimiter: delimiter as char,
        encoding: encoding.name().to_string(),
    })
}
