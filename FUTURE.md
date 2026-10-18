# CSVPlus — Backlog de Funcionalidades Futuras

Itens discutidos na fase de planejamento, intencionalmente deixados fora do MVP para manter o app simples e leve no primeiro lançamento.

## Parsing e I/O
- UI para escolher/forçar delimitador e encoding manualmente (hoje é só automático na abertura).
- Opções de exportação ao salvar: escolher delimitador, encoding e estilo de quoting diferentes do arquivo original.
- Suporte a arquivos grandes (centenas de MB / milhões de linhas) via streaming/leitura incremental ou paginação em disco — o MVP carrega tudo em memória.

## Navegação e produtividade
- Busca e filtro rápido com destaque de resultados.
- Congelar linha de cabeçalho e/ou primeiras colunas ao rolar.
- Ordenação de colunas (clique no cabeçalho).
- Múltiplas abas (vários CSVs abertos na mesma janela).

## Edição avançada
- Fórmulas simples (tipo planilha básica).
- Formatação condicional.
- Validação de tipo de coluna (texto/número/data) com indicação visual de inconsistências.

## Outros
- Perguntar proativamente (uma vez) se o usuário quer definir o app como padrão para `.csv` — hoje é só manual via Configurações.
