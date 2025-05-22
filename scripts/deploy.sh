#!/bin/bash
set -uo pipefail
IFS=$'\n\t'

APP_NAME="decifrandocoracoes"
PROJECT_DIR="/var/www/decifrandocoracoes"

echo "==> Entrando no diretório do projeto: $PROJECT_DIR"
cd "$PROJECT_DIR" || { echo "Erro: diretório do projeto não encontrado!"; exit 1; }

echo "==> Removendo build anterior (.next)..."
rm -rf .next

echo "==> Limpando cache do npm..."
npm cache clean --force

echo "==> Atualizando o repositório (git pull)..."
git pull

echo "==> Ajustando permissões do diretório public..."
if [ -d "public" ]; then
  chmod -R 644 public
else
  echo "Aviso: O diretório 'public' não existe. Pulando otimização de imagens."
fi



echo "==> Otimizando imagens no diretório public..."
if [ -d "public" ]; then
  
  # Lista todas as imagens antes da otimização para depuração
  echo "==> Ajustando permissões do diretório public..."
  chown -R www-data:www-data public
  chmod -R 644 public

  echo "==> Arquivos a serem otimizados:"
  find public -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \)

  # Otimiza imagens JPG/JPEG
  find public -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) -exec jpegoptim --strip-all --max=80 --all-progressive --force {} \;

  # Otimiza imagens PNG
  find public -type f -iname "*.png" -exec pngquant --force --verbose --quality=80-90 --skip-if-larger --ext .png {} \;

  echo "==> Otimização concluída!"
else
  echo "Aviso: O diretório 'public' não existe. Pulando otimização de imagens."
fi

echo "==> Executando build do Next.js..."
npm run build

# Verifica se o serviço existe no PM2
if pm2 list | grep -q "$APP_NAME"; then
    echo "==> Serviço encontrado no PM2. Parando e reiniciando..."
    pm2 restart "$APP_NAME"
else
    echo "==> Serviço não encontrado no PM2. Criando nova instância..."
    pm2 start npm --name "$APP_NAME" -- run start
fi

echo "==> Reiniciando o Nginx..."
sudo systemctl restart nginx

echo "==> Deploy concluído com sucesso!"
