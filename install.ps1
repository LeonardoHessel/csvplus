# Instalador do CSVPlus para Windows.
# Uso: irm https://raw.githubusercontent.com/LeonardoHessel/csvplus/master/install.ps1 | iex

$ErrorActionPreference = "Stop"
$Repo = "LeonardoHessel/csvplus"

function Write-Step($msg) {
    Write-Host "==> $msg" -ForegroundColor Cyan
}

Write-Step "Buscando a última versão do CSVPlus..."
$release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest" -Headers @{ "User-Agent" = "csvplus-installer" }

$asset = $release.assets | Where-Object { $_.name -like "*_x64-setup.exe" } | Select-Object -First 1
if (-not $asset) {
    throw "Instalador .exe não encontrado na última release."
}

$tempFile = Join-Path $env:TEMP $asset.name
Write-Step "Baixando $($asset.name)..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $tempFile

Write-Step "Executando o instalador..."
Start-Process -FilePath $tempFile -ArgumentList "/S" -Wait

Write-Step "CSVPlus instalado com sucesso!"
Remove-Item $tempFile -ErrorAction SilentlyContinue
