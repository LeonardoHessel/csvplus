# CSVPlus — Plano de Desenvolvimento

## Visão geral
Aplicativo desktop multiplataforma (Windows + Linux) para visualizar e editar arquivos CSV. Simples, leve, visual moderno inspirado no Claude Desktop (temas claro/escuro). Pode ser definido manualmente como app padrão para `.csv`, mas nunca impõe isso.

## Decisões de arquitetura

| Tópico | Decisão |
|---|---|
| Framework desktop | **Tauri** (Rust no backend/shell, WebView nativo do SO) |
| Framework UI | **React + TypeScript** |
| Build tool front-end | Vite |
| Grid de dados | TanStack Table + TanStack Virtual (virtualização para performance) |
| Parsing CSV | Rust (crate `csv`) no backend, chamado via comandos Tauri |
| Tamanho de arquivo alvo | Uso típico, até ~50–100MB (tudo em memória, sem streaming/paginação) |
| Edição | Estilo planilha: editar células, add/remover linha e coluna, desfazer/refazer, copiar/colar — sem fórmulas |
| Associação `.csv` | Manual, via botão nas Configurações — nunca perguntado proativamente |
| Temas | Claro/escuro no estilo visual do Claude Desktop |

## Por que Tauri em vez de Electron
- Binário final de poucos MB (usa o WebView do próprio SO — WebView2 no Windows, WebKitGTK no Linux) em vez de empacotar um Chromium inteiro.
- Menor consumo de RAM e startup mais rápido — alinhado ao requisito de "leve".
- Backend em Rust é natural para parsing de CSV performático, mas toda a lógica de UI continua em React/TS, então a curva de aprendizado fica concentrada em poucos comandos Rust (abrir/salvar arquivo, parsing).

## Estrutura do projeto (proposta)

Organização por **feature**, com separação leve de camadas (não é Clean Architecture completa — overhead desproporcional para o tamanho do app): lógica de parsing/edição isolada da apresentação, componentes só consomem hooks/store, nunca manipulam CSV bruto diretamente.

```
CSVPlus/
├── src-tauri/                  # Backend Rust
│   ├── src/
│   │   ├── main.rs
│   │   ├── csv/
│   │   │   ├── model.rs        # estrutura de dados do CSV em memória
│   │   │   ├── parser.rs       # detecção delimitador/encoding, leitura
│   │   │   └── writer.rs       # salvar/exportar
│   │   ├── commands.rs         # comandos Tauri expostos ao front-end (API fina)
│   │   └── file_assoc.rs       # associação de arquivo por SO
│   ├── Cargo.toml
│   └── tauri.conf.json         # ícone, permissões, file associations (Windows/Linux)
├── src/                         # Front-end React
│   ├── features/
│   │   ├── csv-editor/
│   │   │   ├── components/     # Grid, Toolbar, Cell, etc.
│   │   │   ├── hooks/          # useCsvFile, useUndoRedo, useClipboard
│   │   │   ├── store.ts        # estado do CSV aberto
│   │   │   └── types.ts
│   │   └── settings/
│   │       ├── components/
│   │       └── hooks/
│   ├── shared/
│   │   ├── components/         # Button, ThemeToggle, StatusBar
│   │   ├── theme/
│   │   │   ├── theme-light.css
│   │   │   └── theme-dark.css
│   │   └── lib/                # tipos e utilitários genéricos
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── PLANNING.md / FUTURE.md
```

## Funcionalidades do MVP

1. **Abrir CSV**: via diálogo de arquivo, drag-and-drop na janela, ou argumento de linha de comando (duplo clique em `.csv` depois de associado).
2. **Visualizar**: grid virtualizado (suporta milhares de linhas sem travar), cabeçalho fixo.
3. **Editar**: 
   - Editar célula (clique duplo ou Enter)
   - Adicionar/remover linha
   - Adicionar/remover coluna (com rename de header)
   - Desfazer/Refazer (Ctrl+Z / Ctrl+Y)
   - Copiar/colar célula e seleção (compatível com formato de colar do Excel/planilhas)
4. **Salvar**: salvar (sobrescrever) e "salvar como", mantendo delimitador e encoding detectados na abertura.
5. **Detecção automática básica**: delimitador (`,` `;` `\t` `|`) e encoding (UTF-8 / Windows-1252) ao abrir — sem UI de configuração no MVP, é automático.
6. **Temas**: claro e escuro, com toggle manual + respeito à preferência do SO.
7. **Indicador de alterações não salvas** (tipo editor de texto: título com `*`, prompt ao fechar sem salvar).
8. **Associação de arquivo**: botão em Configurações → "Definir CSVPlus como padrão para .csv" (Windows via registro/`ftype`, Linux via `.desktop` + `xdg-mime`).

## Identidade visual (estilo Claude Desktop)

- Paleta neutra (grafite/off-white) com um acento de cor única.
- Tipografia limpa, bastante espaço em branco, cantos arredondados suaves.
- Tema claro e escuro com as mesmas proporções de layout, trocando só tokens de cor (CSS variables).
- Barra lateral/topo minimalista: nome do arquivo, indicador de alterações, toggle de tema.
- Sem skeuomorfismo, sem excesso de bordas/sombras — hierarquia por contraste de cor e espaçamento.

## Distribuição

- **Windows**: instalador `.msi` ou `.exe` (NSIS) gerado pelo próprio Tauri bundler.
- **Linux**: `.AppImage` (portátil, recomendado como alvo principal) e opcionalmente `.deb`.
- Build via `tauri build` com target por plataforma (CI pode gerar os dois em pipelines separados, ex. GitHub Actions com runners Windows e Linux).
- **Importante**: o Tauri não faz cross-compilation entre Windows e Linux — cada instalador precisa ser gerado rodando `tauri build` na própria plataforma alvo (ou via CI com runner daquele SO). O ambiente de desenvolvimento usado aqui é Windows, então o `.AppImage`/`.deb` do Linux precisa ser gerado numa máquina ou runner Linux.

## Fases de implementação sugeridas

1. **Scaffold**: criar projeto Tauri + React + TS, configurar Vite, estrutura de pastas.
2. **Shell visual**: layout base, sistema de temas claro/escuro, toolbar e status bar vazios.
3. **Leitura de CSV**: comando Rust para abrir/parsear arquivo, detecção de delimitador/encoding, exibir no grid (somente leitura).
4. **Grid editável**: edição de célula, add/remove linha e coluna.
5. **Desfazer/Refazer + copiar/colar**.
6. **Salvar/Salvar como**, indicador de alterações não salvas.
7. **Associação de arquivo** (Windows e Linux) + abrir via argumento de CLI/duplo clique.
8. **Polimento visual** e testes manuais em ambas plataformas.
9. **Empacotamento e instaladores**.

Ver [FUTURE.md](FUTURE.md) para funcionalidades fora do escopo do MVP.
