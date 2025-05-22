#!/bin/bash

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BASE_DIR" || exit 1

print_box() {
    local message="$1"
    local length=${#message}
    local padding=2
    local border_length=$((length + padding * 2))

    # Linha superior
    printf '┌%s┐\n' "$(printf '─%.0s' $(seq $border_length))"

    # Mensagem centralizada
    printf '│ %s%s │\n' "$message" "$(printf ' %.0s' $(seq $((border_length - length - 2))))"

    # Linha inferior
    printf '└%s┘\n' "$(printf '─%.0s' $(seq $border_length))"
}

print_box "🔄 Removendo diretórios e arquivos desnecessários..."
rm -rf .next node_modules/@prisma/client node_modules/.cache node_modules/.prisma/client prisma/migrations package-lock.json || true

print_box "🗑️ Limpando cache do npm..."
npm cache clean --force

print_box "📦 Instalando dependências do projeto..."
npm install

print_box "Criando nova migration inicial..."
npx prisma migrate dev --name init || { echo "❌ Erro ao rodar as reset"; exit 1; }

print_box "⚙️ Gerando cliente do Prisma..."
npx prisma generate

print_box "🚀 Criando build da Aplicação..."
npm run build || { echo "❌ Erro ao gerar o build"; exit 1; }

print_box "🔪 Matando processos na porta 3000..."
fuser -k 3000/tcp || true

print_box "🔐 Ajustando Permissões para www-data..."
sudo chown -R www-data:www-data "$BASE_DIR"

print_box "🗑️ Limpando cache do Nginx..."
sudo rm -rf /var/cache/nginx/* || true

print_box "♻️ Reiniciando PM2 apenas para a aplicação..."
pm2 restart decifrandocoracoes || pm2 start npm --name "decifrandocoracoes" -- start

print_box "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx || { echo "❌ Erro ao reiniciar o Nginx"; exit 1; }

print_box "✅ Processo concluído com sucesso!"
