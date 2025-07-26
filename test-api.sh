#!/bin/bash

# URL da API
API_URL="https://api.profdidatica.com.br/events/send"

# Payload em formato JSON
PAYLOAD='{
  "userId": "53b9ffa0-02ae-4e18-8389-b79268362d6c",
  "contentName": "MISSAOLITERARIA",
  "contentId": "",
  "eventType": "PageView",
  "eventId": "5754ff8b-7af1-4856-9423-4499ace4873d",
  "URL": "http://profdidatica.com.br/missao-literaria?utm_source=facebook&utm_medium=cpc&fbclid=123",
  "price": null,
  "currency": "BRL",
  "fbc": "fb.0.1753569688566.123",
  "fbp": "fb.0.1753569104331.611839643145769310",
  "fn": null,
  "ln": null,
  "em": null,
  "ph": null
}'

# Executar o comando curl
echo "Enviando requisição para $API_URL..."
echo "Payload: $PAYLOAD"
echo "--------------------------------------"

curl -v -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"

echo -e "\n\nComando curl para copiar:"
echo "curl -v -X POST \"$API_URL\" -H \"Content-Type: application/json\" -d '$PAYLOAD'"
