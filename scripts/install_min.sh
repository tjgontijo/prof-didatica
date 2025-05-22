#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# ───────────────────────────────────────────────────────────────────────────────
# Cores
GREEN=$'\e[1;32m'
YELLOW=$'\e[1;33m'
RED=$'\e[1;31m'
NC=$'\e[0m'

# ┌─────────────────────────────────────────────────┐
# │      🟢   INSTALLER NEXT.JS & PM2   🟢        │
# └─────────────────────────────────────────────────┘
echo -e "\n${GREEN}┌─────────────────────────────────────────────────┐${NC}"
echo -e "${GREEN}│         🚀 NEXT.JS & PM2 AUTOMATIC INSTALLER   │${NC}"
echo -e "${GREEN}└─────────────────────────────────────────────────┘${NC}\n"

# 0) Verifica se está rodando como root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}✖ Execute este script como root (sudo)${NC}"
  exit 1
fi

# 1) Perguntas mínimas
read -p "${YELLOW}🌐 Domínio (ex: app.exemplo.com): ${NC}" DOMAIN
[ -z "$DOMAIN" ] && { echo -e "${RED}Domínio é obrigatório${NC}"; exit 1; }

read -p "${YELLOW}📥 URL do Git (ssh/https): ${NC}" REPO_URL
[ -z "$REPO_URL" ] && { echo -e "${RED}URL do Git é obrigatória${NC}"; exit 1; }
if ! git ls-remote "$REPO_URL" &>/dev/null; then
  echo -e "${RED}Não foi possível acessar: $REPO_URL${NC}"
  exit 1
fi

read -p "${YELLOW}🔒 Deseja configurar HTTPS com Certbot? [S/N]: ${NC}" WANT_SSL
case "$WANT_SSL" in
  [Ss]* )
    read -p "${YELLOW}✉️  E-mail para Let’s Encrypt: ${NC}" SSL_EMAIL
    [ -z "$SSL_EMAIL" ] && { echo -e "${RED}E-mail é obrigatório para SSL${NC}"; exit 1; }
    SSL_FLAG=true
    ;;
  * ) SSL_FLAG=false ;;
esac

# 2) Deduz nomes e caminhos
REPO_NAME="$(basename "$REPO_URL" .git)"
PROJECT_DIR="/var/www/$REPO_NAME"
APP_NAME="$REPO_NAME"

# 3) Escolhe primeira porta livre a partir de 3000
PORT=3000
while ss -tulpn 2>/dev/null | grep -q ":$PORT "; do
  PORT=$((PORT+1))
done

# 4) Resumo
echo -e "\n${GREEN}📋 Resumo${NC}"
echo -e "  • Domínio   : ${GREEN}$DOMAIN${NC}"
echo -e "  • Repo Git  : ${GREEN}$REPO_URL${NC}"
echo -e "  • Projeto   : ${GREEN}$PROJECT_DIR${NC}"
echo -e "  • Serviço PM2: ${GREEN}$APP_NAME${NC}"
echo -e "  • Porta     : ${GREEN}$PORT${NC}"
if [ "$SSL_FLAG" = true ]; then
  echo -e "  • SSL e-mail: ${GREEN}$SSL_EMAIL${NC}"
fi
read -p "${YELLOW}➤ Prosseguir? [S/N]: ${NC}" CONFIRM
if [[ ! "$CONFIRM" =~ ^[Ss]$ ]]; then
  echo -e "${RED}✖ Instalação abortada${NC}"
  exit 0
fi

# 5) Instala via apt-get os pacotes necessários
echo -e "\n${YELLOW}🔄 Atualizando sistema e instalando pacotes essenciais...${NC}"
apt update && apt upgrade -y
apt install -y curl git unzip nginx certbot python3-certbot-nginx nodejs npm

# 6) Garante que pm2 exista
if ! command -v pm2 &>/dev/null; then
  echo -e "${YELLOW}📦 Instalando pm2 globalmente...${NC}"
  npm install -g pm2
fi

# 7) Clona ou atualiza o projeto
echo -e "${YELLOW}📥 Instalando/atualizando em $PROJECT_DIR...${NC}"
mkdir -p "$(dirname "$PROJECT_DIR")"
if [ -d "$PROJECT_DIR/.git" ]; then
  cd "$PROJECT_DIR"
  git fetch --all
  git reset --hard origin/master
else
  cd "$(dirname "$PROJECT_DIR")"
  git clone "$REPO_URL" "$REPO_NAME"
fi
cd "$PROJECT_DIR"
chown -R "$SUDO_USER":"$SUDO_USER" .

# 8) Build e PM2
echo -e "${YELLOW}📦 Executando npm ci e build...${NC}"
npm ci
npm run build

echo -e "${YELLOW}🚀 Registrando no PM2 ($APP_NAME)...${NC}"
if pm2 list | grep -qw "$APP_NAME"; then
  pm2 restart "$APP_NAME"
else
  pm2 start npm --name "$APP_NAME" -- run start -- -p "$PORT"
  pm2 save
  pm2 startup
fi

# 9) Configura Nginx
echo -e "${YELLOW}⚙️  Gerando config Nginx para $DOMAIN...${NC}"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location /_next/static/ {
        alias $PROJECT_DIR/.next/static/;
        access_log off;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
    }

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
    }

    error_log /var/log/nginx/$APP_NAME.error.log;
    access_log /var/log/nginx/$APP_NAME.access.log;
}
EOF
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
echo -e "${YELLOW}🔍 Testando Nginx...${NC}"
nginx -t && systemctl reload nginx

# 10) SSL opcional
if [ "$SSL_FLAG" = true ]; then
  echo -e "${YELLOW}🔒 Emitindo certificado SSL para $DOMAIN...${NC}"
  certbot --nginx -d "$DOMAIN" \
    --non-interactive --agree-tos -m "$SSL_EMAIL" --redirect
fi

# Final
echo -e "\n${GREEN}🎉 Instalação concluída!${NC}"
echo -e "${GREEN}Acesse: http://${DOMAIN}${NC}"
[ "$SSL_FLAG" = true ] && echo -e "${GREEN}Use https://${DOMAIN}${NC}"
