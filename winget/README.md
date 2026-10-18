# Manifesto winget

Manifestos prontos para submissão ao [microsoft/winget-pkgs](https://github.com/microsoft/winget-pkgs), seguindo o [schema 1.9.0](https://learn.microsoft.com/windows/package-manager/package/manifest).

## Como submeter

1. Instale o [`winget-create`](https://github.com/microsoft/winget-create) (`winget install wingetcreate`).
2. Rode `wingetcreate submit winget/` (ou copie os três arquivos para `manifests/l/LeonardoHessel/CSVPlus/0.1.0/` em um fork de `microsoft/winget-pkgs` e abra um PR).
3. A revisão é automatizada (valida o instalador, checksum, etc.) e geralmente leva algumas horas a poucos dias.

Depois de aprovado, a instalação fica disponível via:

```powershell
winget install LeonardoHessel.CSVPlus
```

## Atualizando para uma nova versão

A cada release, gere um novo conjunto de manifestos (`PackageVersion` atualizado, nova URL/SHA256 do instalador) em uma nova pasta `manifests/l/LeonardoHessel/CSVPlus/<versão>/` e abra um novo PR.
