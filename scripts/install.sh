#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# ─── CORES ───────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sem cor

# ─── CABEÇALHO ───────────────────────────────────────────────────────────────────
echo -e "${BLUE}┌────────────────────────────────────────────┐"
echo -e "│      🚀 Instalador Next.js & PM2         │"
echo -e "└────────────────────────────────────────────┘${NC}"

# ─── 0) EXECUTANDO COMO ROOT? ────────────────────────────────────────────────────
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Execute este script como root ou via sudo.${NC}"
  exit 1
fi

# ─── 1) FERRAMENTAS NECESSÁRIAS ───────────────────────────────────────────────────
echo -e "${BLUE}🔍 Verificando ferramentas necessárias...${NC}"
for cmd in git npm pm2 nginx ss certbot; do
  if ! command -v "$cmd" &>/dev/null; then
    echo -e "${RED}❌ '$cmd' não encontrado. Instale antes de continuar.${NC}"
    exit 1
  fi
done

# ─── 2) VERSÃO MÍNIMA DO NODE ────────────────────────────────────────────────────
MIN_NODE="16.8.0"
INSTALLED=$(node -v | sed 's/^v//')
if [ "$(printf '%s\n' "$MIN_NODE" "$INSTALLED" | sort -V | head -n1)" != "$MIN_NODE" ]; then
  echo -e "${RED}❌ Node.js ≥ $MIN_NODE necessário (você tem $INSTALLED).${NC}"
  exit 1
fi

# ─── 3) ESPAÇO EM DISCO EM /var/www ──────────────────────────────────────────────
REQUIRED_KB=512000
AVAILABLE_KB=$(df /var/www 2>/dev/null | tail -1 | awk '{print $4}' || echo 0)
if [ "$AVAILABLE_KB" -lt "$REQUIRED_KB" ]; then
  echo -e "${RED}❌ Espaço insuficiente em /var/www: precisa ≥ ${REQUIRED_KB}KB (disponível ${AVAILABLE_KB}KB).${NC}"
  exit 1
fi

# ─── 4) DETECTAR “REAL_USER” PARA CHOWN ──────────────────────────────────────────
# Se veio via sudo, usa SUDO_USER; senão, usa o usuário atual
if [ -n "${SUDO_USER-}" ]; then
  REAL_USER="$SUDO_USER"
else
  REAL_USER="$(whoami)"
fi

# ─── 5) COLETA DE DADOS INTERATIVOS ──────────────────────────────────────────────
echo
read -p "📥 URL do Git (ssh/https): " REPO_URL
[ -z "$REPO_URL" ] && { echo -e "${RED}❌ URL do repositório é obrigatória.${NC}"; exit 1; }
if ! git ls-remote "$REPO_URL" &>/dev/null; then
  echo -e "${RED}❌ Não foi possível acessar $REPO_URL${NC}"; exit 1
fi

read -p "📂 Diretório de instalação (/var/www/meuapp): " PROJECT_DIR
[ -z "$PROJECT_DIR" ] && { echo -e "${RED}❌ Diretório de instalação é obrigatório.${NC}"; exit 1; }

while true; do
  read -p "🔖 Nome do serviço PM2 (ex: meuapp): " APP_NAME
  [ -z "$APP_NAME" ] && { echo -e "${YELLOW}⚠️ Nome é obrigatório.${NC}"; continue; }
  if pm2 list | grep -qw "$APP_NAME"; then
    echo -e "${YELLOW}⚠️ Serviço '$APP_NAME' já existe no PM2.${NC}"; continue
  fi
  break
done

while true; do
  read -p "🔌 Porta interna Next.js (número): " APP_PORT
  if [[ ! "$APP_PORT" =~ ^[0-9]+$ ]]; then
    echo -e "${YELLOW}⚠️ Porta inválida.${NC}"; continue
  fi
  if ss -tulpn 2>/dev/null | grep -q ":$APP_PORT "; then
    echo -e "${YELLOW}⚠️ Porta $APP_PORT já em uso.${NC}"; continue
  fi
  break
done

while true; do
  read -p "🌐 Domínio principal (app.exemplo.com): " DOMAIN
  [ -z "$DOMAIN" ] && { echo -e "${YELLOW}⚠️ Domínio é obrigatório.${NC}"; continue; }
  if [ -f "/etc/nginx/sites-available/$DOMAIN" ] || [ -f "/etc/nginx/sites-enabled/$DOMAIN" ]; then
    echo -e "${YELLOW}⚠️ Config Nginx para '$DOMAIN' já existe.${NC}"; continue
  fi
  break
done

read -p "✉️  E-mail para Certbot (Let’s Encrypt): " SSL_EMAIL
[ -z "$SSL_EMAIL" ] && { echo -e "${RED}❌ E-mail SSL é obrigatório.${NC}"; exit 1; }

echo
echo -e "${BLUE}📋 Resumo da instalação${NC}"
echo -e "  • Repositório: ${GREEN}$REPO_URL${NC}"
echo -e "  • Diretório : ${GREEN}$PROJECT_DIR${NC}"
echo -e "  • PM2 name  : ${GREEN}$APP_NAME${NC}"
echo -e "  • Porta     : ${GREEN}$APP_PORT${NC}"
echo -e "  • Domínio   : ${GREEN}$DOMAIN${NC}"
echo -e "  • E-mail    : ${GREEN}$SSL_EMAIL${NC}"
read -p "➤ Prosseguir [S/N]? " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Ss]$ ]]; then
  echo -e "${RED}❌ Instalação abortada.${NC}"; exit 0
fi

# ─── 6) ATUALIZAÇÃO E DEPENDÊNCIAS ────────────────────────────────────────────────
echo -e "${BLUE}🔄 Atualizando sistema e instalando pacotes...${NC}"
apt update && apt upgrade -y
apt install -y curl git unzip nginx certbot python3-certbot-nginx

# ─── 7) CLONE OU UPDATE DO PROJETO ───────────────────────────────────────────────
echo -e "${BLUE}📥 Clonando/atualizando projeto em $PROJECT_DIR ...${NC}"
mkdir -p "$(dirname "$PROJECT_DIR")"
if [ -d "$PROJECT_DIR/.git" ]; then
  cd "$PROJECT_DIR"
  git fetch --all
  git reset --hard origin/master
else
  cd "$(dirname "$PROJECT_DIR")"
  git clone "$REPO_URL" "$(basename "$PROJECT_DIR")"
fi
cd "$PROJECT_DIR"
chown -R "$REAL_USER":"$REAL_USER" .

# ─── 8) BUILD E PM2 ─────────────────────────────────────────────────────────────
echo -e "${BLUE}📦 Instalando dependências (npm ci)...${NC}"
npm ci

echo -e "${BLUE}⚙️ Gerando build Next.js...${NC}"
npm run build

echo -e "${BLUE}🚀 Iniciando/reiniciando PM2 ($APP_NAME)...${NC}"
if pm2 list | grep -q "$APP_NAME"; then
  pm2 restart "$APP_NAME"
else
  # Forma 1: via npm
  pm2 start npm \
    --name "$APP_NAME" \
    -- run start -- -p "$APP_PORT"

  pm2 save
  pm2 startup
fi

# ─── 9) NGINX ───────────────────────────────────────────────────────────────────
echo -e "${BLUE}⚙️ Configurando Nginx para $DOMAIN ...${NC}"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /_next/static/ {
        root $PROJECT_DIR/.next/;
        access_log off;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    error_log /var/log/nginx/$APP_NAME.error.log;
    access_log /var/log/nginx/$APP_NAME.access.log;
}
EOF
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
echo -e "${BLUE}🔍 Testando Nginx...${NC}"
nginx -t && systemctl reload nginx

# ─── 10) CERTBOT SSL ────────────────────────────────────────────────────────────
echo -e "${BLUE}🔒 Emitindo certificado SSL para $DOMAIN ...${NC}"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$SSL_EMAIL" --redirect

# ─── FIM ────────────────────────────────────────────────────────────────────────
echo -e "${GREEN}🎉 Instalação completa! Acesse: https://$DOMAIN${NC}"
