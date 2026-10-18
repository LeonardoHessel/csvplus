export interface CsvDocument {
  path: string;
  headers: string[];
  rows: string[][];
  delimiter: string;
  encoding: string;
}
