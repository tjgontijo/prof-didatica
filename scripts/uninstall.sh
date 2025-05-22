#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# ───────────────────────────────────────────────────────────────────────────────
# Cores
RED=$'\e[1;31m'
GREEN=$'\e[1;32m'
YELLOW=$'\e[1;33m'
NC=$'\e[0m'

# Cabeçalho
echo -e "\n${RED}┌────────────────────────────────────────────────┐${NC}"
echo -e "${RED}│         🔴 DESINSTALADOR NEXT.JS & PM2       │${NC}"
echo -e "${RED}└────────────────────────────────────────────────┘${NC}\n"

# 0) Verifica root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}✖ Execute este script como root ou via sudo${NC}"
  exit 1
fi

# 1) Escolha interativa do diretório do projeto em /var/www
WWW_DIRS=(/var/www/*/)
echo -e "${YELLOW}📂 Escolha o diretório de instalação:${NC}"
select PROJECT_DIR in "${WWW_DIRS[@]}"; do
  if [[ -n "$PROJECT_DIR" ]]; then
    echo -e "${GREEN}→ Projeto escolhido: $PROJECT_DIR${NC}"
    break
  else
    echo -e "${RED}❌ Opção inválida. Tente novamente.${NC}"
  fi
done

# 2) Escolha interativa do arquivo de config Nginx
NGINX_FILES=(/etc/nginx/sites-available/*)
echo -e "\n${YELLOW}📄 Escolha o arquivo de configuração do Nginx:${NC}"
select NGINX_CONF in "${NGINX_FILES[@]}"; do
  if [[ -f "$NGINX_CONF" ]]; then
    echo -e "${GREEN}→ Config Nginx: $NGINX_CONF${NC}"
    break
  else
    echo -e "${RED}❌ Opção inválida. Tente novamente.${NC}"
  fi
done

# Extrai domínio a partir do nome do arquivo
DOMAIN="$(basename "$NGINX_CONF")"

# 3) Nome do serviço PM2
echo
read -p "${YELLOW}🔖 Nome do serviço PM2 (ex: $DOMAIN): ${NC}" APP_NAME
[ -z "$APP_NAME" ] && { echo -e "${RED}✖ Nome PM2 é obrigatório${NC}"; exit 1; }

# 4) Confirmação final
echo -e "\n${YELLOW}⚠️  Atenção: isso vai remover:"
echo -e "    • Projeto: $PROJECT_DIR"
echo -e "    • PM2   : $APP_NAME"
echo -e "    • Nginx : $NGINX_CONF"
echo -e "    • SSL   : domínio $DOMAIN${NC}"
read -p "${YELLOW}➤ Confirmar desinstalação [S/N]? ${NC}" CONF
if [[ ! "$CONF" =~ ^[Ss]$ ]]; then
  echo -e "${RED}❌ Desinstalação abortada pelo usuário${NC}"
  exit 0
fi

# 5) Remove serviço PM2
echo -e "\n${YELLOW}▶ Removendo serviço PM2 '$APP_NAME'...${NC}"
if pm2 list | grep -qw "$APP_NAME"; then
  pm2 delete "$APP_NAME"
  pm2 save
  echo -e "${GREEN}✔ Serviço PM2 removido${NC}"
else
  echo -e "${YELLOW}⚠️  Serviço PM2 não encontrado, pulando${NC}"
fi

# 6) Remove diretório do projeto
echo -e "${YELLOW}▶ Removendo pasta do projeto: $PROJECT_DIR...${NC}"
if [ -d "$PROJECT_DIR" ]; then
  rm -rf "$PROJECT_DIR"
  echo -e "${GREEN}✔ Projeto removido${NC}"
else
  echo -e "${YELLOW}⚠️  Diretório não existe, pulando${NC}"
fi

# 7) Remove config Nginx e reinicia
ENABLED="/etc/nginx/sites-enabled/$DOMAIN"
echo -e "${YELLOW}▶ Removendo configurações Nginx...${NC}"
[ -f "$ENABLED" ] && rm -f "$ENABLED"
rm -f "$NGINX_CONF"
nginx -t && systemctl reload nginx
echo -e "${GREEN}✔ Configurações Nginx removidas${NC}"

# 8) Revoga certificado SSL
echo -e "${YELLOW}▶ Revogando certificado SSL para $DOMAIN...${NC}"
if certbot certificates | grep -q "Certificate Name: $DOMAIN"; then
  certbot delete --cert-name "$DOMAIN" --non-interactive
  echo -e "${GREEN}✔ Certificado SSL removido${NC}"
else
  echo -e "${YELLOW}⚠️  Certificado não encontrado, pulando${NC}"
fi

# 9) Limpa logs do PM2
echo -e "${YELLOW}▶ Limpando logs PM2...${NC}"
rm -f ~/.pm2/logs/"$APP_NAME"-*.log
echo -e "${GREEN}✔ Logs limpos${NC}"

# Fim
echo -e "\n${GREEN}🎉 Desinstalação completa!${NC}\n"
