#!/bin/bash

set -e

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

mkdir -p prisma/backup

if [ -f .env ]; then
    DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"')

    if [ -n "$DB_URL" ]; then
        print_box "💾 Testando backup do banco de dados..."

        # Extrair informações da URL, ignorando parâmetros extras
        DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
        DB_PASS=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
        DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo $DB_URL | sed -n 's/.*@[^:]*:\([0-9]*\)\/.*/\1/p')
        DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
        DB_NAME=$(echo $DB_NAME | cut -d'?' -f1) # Remove qualquer parâmetro extra

        export PGPASSWORD="$DB_PASS"

        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c -f "prisma/backup/backup_${TIMESTAMP}.dump" && {
            print_box "✅ Backup salvo em prisma/backup/backup_${TIMESTAMP}.dump"
        } || {
            print_box "❌ Erro ao fazer backup do banco de dados."
            echo "Dicas:"
            echo "- Verifique se o pg_dump está instalado (psql/pg_dump do PostgreSQL)."
            echo "- Confirme que seu IP está permitido no Supabase (Settings > Database > Network Restrictions)."
            echo "- Confira se a DATABASE_URL está correta e sem espaços extras."
            exit 1
        }

        unset PGPASSWORD
    else
        print_box "⚠️ DATABASE_URL não encontrada no arquivo .env."
        exit 1
    fi
else
    print_box "⚠️ Arquivo .env não encontrado."
    exit 1
fi
