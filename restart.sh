#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

APP_NAME="profdidatica"
PROJECT_DIR="/var/www/profdidatica"
ENABLE_OPTIMIZATION=true

print_box() {
    local message="$1"
    local length=${#message}
    local padding=3
    local border_length=$((length + padding * 2))
    printf '┌%*s┐\n' "$border_length" | tr ' ' '-'
    printf '│ %*s │\n' "$((length + padding))" "$message"
    printf '└%*s┘\n' "$border_length" | tr ' ' '-'
}

do_reset() {
    print_box "📂 Entrando no diretório: $PROJECT_DIR"
    cd "$PROJECT_DIR" || { print_box "❌ Diretório não encontrado"; exit 1; }

    print_box "🔄 Removendo artefatos de dev"
    rm -rf .next node_modules/@prisma/client node_modules/.cache \
           node_modules/.prisma/client prisma/migrations package-lock.json || true

    print_box "🗑️ Limpando cache do npm"
    npm cache clean --force

    print_box "📦 Instalando dependências (dev)"
    npm install

    print_box "📌 Resetando banco Prisma"
    npx prisma migrate reset --force --skip-seed \
      || { print_box "❌ Falha ao resetar DB"; exit 1; }

    print_box "📌 Migrando Prisma (dev)"
    npx prisma migrate dev --name init \
      || { print_box "❌ Falha nas migrations"; exit 1; }

    print_box "🌱 Rodando seed"
    npx prisma db seed \
      || { print_box "❌ Falha no seed"; exit 1; }

    print_box "⚙️ Gerando cliente Prisma"
    npx prisma generate

    print_box "✅ Reset de desenvolvimento concluído"
}

do_deploy() {
    print_box "📂 Entrando no diretório: $PROJECT_DIR"
    cd "$PROJECT_DIR" || { print_box "❌ Diretório não encontrado"; exit 1; }

    print_box "🧹 Removendo build antigo"
    rm -rf .next

    print_box "🗑️ Limpando cache do npm"
    npm cache clean --force

    print_box "🔄 Atualizando repositório (git fetch)"
    git fetch || { print_box "❌ git fetch falhou"; exit 1; }

    print_box "🔀 Reset para origin/master"
    git reset --hard origin/master || { print_box "❌ git reset falhou"; exit 1; }

    print_box "📦 Instalando deps (CI)"
    npm ci

    print_box "🔐 Ajustando permissões"
    chown -R www-data:www-data "$PROJECT_DIR"
    find public -type f -exec chmod 644 {} \; 2>/dev/null
    find public -type d -exec chmod 755 {} \; 2>/dev/null

    if [ "$ENABLE_OPTIMIZATION" = true ] && [ -d public ]; then
        print_box "🖼️ Otimizando imagens"
        find public -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) |
        while read -r file; do
          mime=$(file --mime-type -b "$file")
          case "$mime" in
            image/jpeg)
              print_box "📷 JPEG: $file"
              jpegoptim --strip-all --max=80 --all-progressive --force "$file"
              ;;
            image/png)
              print_box "🖼️ PNG: $file"
              pngquant --force --verbose --quality=80-90 --skip-if-larger --ext .png "$file"
              ;;
            image/webp)
              print_box "🕸️ WebP: $file"
              cwebp -quiet -mt -q 80 "$file" -o "$file"
              ;;
            *)
              print_box "⚠️ Ignorado: $file ($mime)"
              ;;
          esac
        done
        print_box "✅ Otimização de imagens concluída"
    else
        print_box "ℹ️ Otimização de imagens desativada ou pasta public ausente"
    fi

    print_box "🏗️ Executando build Next.js"
    npm run build || { print_box "❌ Build falhou"; exit 1; }

    if pm2 list | grep -q "$APP_NAME"; then
        print_box "🔄 Reiniciando serviço PM2"
        pm2 restart "$APP_NAME"
    else
        print_box "🚀 Iniciando serviço PM2"
        pm2 start npm --name "$APP_NAME" -- run start
    fi

    print_box "🔁 Reiniciando Nginx"
    sudo systemctl restart nginx

    print_box "✅ Deploy concluído com sucesso"
}

usage() {
    echo "Uso: $0 {reset|deploy|all}"
    exit 1
}

if [ "$#" -ne 1 ]; then
    usage
fi

case "$1" in
    reset)  do_reset   ;;
    deploy) do_deploy  ;;
    all)
        do_reset
        do_deploy
        ;;
    *) usage         ;;
esac
