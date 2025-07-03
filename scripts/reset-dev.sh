#!/bin/bash

set -e  # Para o script imediatamente se qualquer comando falhar

# Obter data e hora atual para o nome do arquivo de backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

print_box() {
    local message="$1"
    local length=${#message}
    local padding=3
    local border_length=$((length + padding * 2))
    
    printf '┌%*s┐\n' "$border_length" | tr ' ' '-'
    printf '│ %*s │\n' "$((length + padding))" "$message"
    printf '└%*s┘\n' "$border_length" | tr ' ' '-'
}

# Função para fazer backup do banco de dados
backup_database() {
    # Criar diretório de backup se não existir
    mkdir -p prisma/backup
    
    # Obter URL do banco de dados do arquivo .env
    if [ -f .env ]; then
        DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"')
        
        if [ -n "$DB_URL" ]; then
            print_box "💾 Fazendo backup do banco de dados..."
            
            # Extrair informações da conexão da URL do banco
            DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
            DB_PASS=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
            DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
            DB_PORT=$(echo $DB_URL | sed -n 's/.*@[^:]*:\([0-9]*\)\/.*/\1/p')
            DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
            
            # Configurar variáveis de ambiente para pg_dump
            export PGPASSWORD="$DB_PASS"
            
            # Fazer o dump do banco de dados
            pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c -f "prisma/backup/backup_${TIMESTAMP}.dump" && {
                print_box "✅ Backup salvo em prisma/backup/backup_${TIMESTAMP}.dump"
            } || {
                print_box "❌ Erro ao fazer backup do banco de dados. Continuando com o reset..."
            }
            
            # Limpar variável de ambiente por segurança
            unset PGPASSWORD
        else
            print_box "⚠️ DATABASE_URL não encontrada no arquivo .env. Pulando backup..."
        fi
    else
        print_box "⚠️ Arquivo .env não encontrado. Pulando backup..."
    fi
}

# Fazer backup antes de resetar
backup_database

print_box "🔄 Removendo diretórios e arquivos de desenvolvimento..."
rm -rf .next node_modules/@prisma/client node_modules/.cache node_modules/.prisma/client prisma/migrations package-lock.json || true

print_box "🗑️ Limpando cache do npm..."
npm cache clean --force

print_box "📦 Instalando dependências..."
npm install

print_box "📌 Resetando banco de dados Prisma..."
npx prisma migrate reset --force --skip-seed || { echo "❌ Erro ao resetar o banco de dados"; exit 1; }

print_box "📌 Executando migrações do Prisma..."
npx prisma migrate dev --name init || { echo "❌ Erro ao rodar as migrações"; exit 1; }

print_box "🌱 Rodando seed do Prisma..."
npx prisma db seed || { echo "❌ Erro ao rodar o seed"; exit 1; }

print_box "⚙️ Gerando cliente do Prisma..."
npx prisma generate

#print_box "🚀 Criando build da Aplicação..."
#npm run build || { echo "❌ Erro ao gerar o build"; exit 1; }

print_box "✅ Processo de reset para desenvolvimento concluído!"
