# CSVPlus

Um visualizador e editor de CSV simples, leve e multiplataforma (Windows e Linux), com visual moderno inspirado no Claude Desktop (temas claro/escuro).

![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)

## Instalação

**Windows** (PowerShell):

```powershell
irm https://raw.githubusercontent.com/LeonardoHessel/csvplus/master/install.ps1 | iex
```

**Linux**:

```bash
curl -fsSL https://raw.githubusercontent.com/LeonardoHessel/csvplus/master/install.sh | sh
```

Ou baixe o instalador direto na [página de releases](https://github.com/LeonardoHessel/csvplus/releases/latest) (`.msi`/`.exe` para Windows, `.deb`/`.rpm`/`.AppImage` para Linux).

## Funcionalidades

- Abrir, visualizar e editar arquivos CSV em um grid virtualizado (suporta milhares de linhas)
- Edição de células, linhas e colunas
- Desfazer/Refazer (`Ctrl+Z` / `Ctrl+Shift+Z`)
- Copiar/colar compatível com Excel/planilhas (`Ctrl+C` / `Ctrl+V`)
- Salvar e Salvar como (`Ctrl+S` / `Ctrl+Shift+S`), mantendo o delimitador e encoding originais
- Detecção automática de delimitador (`,` `;` `\t` `|`) e encoding (UTF-8 / Windows-1252)
- Tema claro/escuro, com opção de seguir o tema do sistema
- Associação manual como aplicativo padrão para `.csv` (nunca imposta automaticamente)

## Stack técnica

- [Tauri](https://tauri.app/) (Rust) + [React](https://react.dev/) + TypeScript
- [TanStack Virtual](https://tanstack.com/virtual) para virtualização do grid
- Parsing de CSV em Rust (crate [`csv`](https://docs.rs/csv) + [`encoding_rs`](https://docs.rs/encoding_rs))

## Desenvolvimento

Pré-requisitos: [Node.js](https://nodejs.org/) 20+, [Rust](https://www.rust-lang.org/tools/install), e as [dependências de sistema do Tauri](https://tauri.app/start/prerequisites/) para a sua plataforma.

```bash
npm install
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

Gera os instaladores em `src-tauri/target/release/bundle/` (`.msi`/`.exe` no Windows, `.deb`/`.rpm`/`.AppImage` no Linux).

## Licença

[GPL v3](LICENSE) — © 2026 Leonardo Hessel
