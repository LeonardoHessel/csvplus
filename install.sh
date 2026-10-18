#!/usr/bin/env sh
# Instalador do CSVPlus para Linux.
# Uso: curl -fsSL https://raw.githubusercontent.com/LeonardoHessel/csvplus/master/install.sh | sh

set -e

REPO="LeonardoHessel/csvplus"
API_URL="https://api.github.com/repos/${REPO}/releases/latest"

log() { printf '\033[1;34m==>\033[0m %s\n' "$1"; }
err() { printf '\033[1;31merro:\033[0m %s\n' "$1" >&2; exit 1; }

ARCH="$(uname -m)"
if [ "$ARCH" != "x86_64" ]; then
  err "Arquitetura não suportada: $ARCH (apenas x86_64/amd64 por enquanto)."
fi

log "Buscando a última versão do CSVPlus..."
RELEASE_JSON="$(curl -fsSL "$API_URL")" || err "Não foi possível consultar o GitHub. Verifique sua conexão."

pick_asset_url() {
  pattern="$1"
  printf '%s' "$RELEASE_JSON" | grep -o "\"browser_download_url\": *\"[^\"]*${pattern}[^\"]*\"" | head -1 | sed 's/.*"\(https[^"]*\)"/\1/'
}

install_with() {
  tool="$1"
  command -v "$tool" >/dev/null 2>&1
}

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

if install_with apt-get || install_with dpkg; then
  URL="$(pick_asset_url '_amd64\.deb')"
  [ -n "$URL" ] || err "Pacote .deb não encontrado na última release."
  log "Baixando pacote .deb..."
  curl -fsSL "$URL" -o "$TMP_DIR/csvplus.deb"
  log "Instalando (pode pedir sua senha sudo)..."
  if install_with apt-get; then
    sudo apt-get install -y "$TMP_DIR/csvplus.deb"
  else
    sudo dpkg -i "$TMP_DIR/csvplus.deb" || sudo apt-get install -f -y
  fi
elif install_with dnf || install_with rpm; then
  URL="$(pick_asset_url '\.x86_64\.rpm')"
  [ -n "$URL" ] || err "Pacote .rpm não encontrado na última release."
  log "Baixando pacote .rpm..."
  curl -fsSL "$URL" -o "$TMP_DIR/csvplus.rpm"
  log "Instalando (pode pedir sua senha sudo)..."
  if install_with dnf; then
    sudo dnf install -y "$TMP_DIR/csvplus.rpm"
  else
    sudo rpm -i "$TMP_DIR/csvplus.rpm"
  fi
else
  log "Gerenciador de pacotes não reconhecido, instalando via AppImage..."
  URL="$(pick_asset_url '\.AppImage')"
  [ -n "$URL" ] || err "AppImage não encontrado na última release."
  INSTALL_DIR="$HOME/.local/bin"
  mkdir -p "$INSTALL_DIR"
  curl -fsSL "$URL" -o "$INSTALL_DIR/csvplus"
  chmod +x "$INSTALL_DIR/csvplus"
  log "AppImage instalado em $INSTALL_DIR/csvplus"
  case ":$PATH:" in
    *":$INSTALL_DIR:"*) ;;
    *) log "Adicione $INSTALL_DIR ao seu PATH para rodar 'csvplus' de qualquer lugar." ;;
  esac
fi

log "CSVPlus instalado com sucesso!"
