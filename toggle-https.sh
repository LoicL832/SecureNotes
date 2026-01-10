#!/bin/bash

# Script pour basculer entre HTTP et HTTPS
# Usage: ./toggle-https.sh [on|off]

MODE=$1

if [ -z "$MODE" ]; then
    echo "Usage: ./toggle-https.sh [on|off]"
    echo ""
    echo "  on  - Active HTTPS (conformité UMLsec)"
    echo "  off - Désactive HTTPS (tests sans certificat)"
    exit 1
fi

if [ "$MODE" = "on" ]; then
    echo "🔐 Activation HTTPS..."

    # Frontend : HTTPS
    sed -i '' "s|const API_BASE_URL = 'http://localhost:3001/api';|const API_BASE_URL = 'https://localhost:3001/api';|g" frontend/js/api.js

    echo "✅ HTTPS activé"
    echo ""
    echo "📋 Actions requises :"
    echo "  1. Redémarrer le backend : cd backend && npm start"
    echo "  2. Accepter le certificat : https://localhost:3001"
    echo "  3. Rafraîchir le frontend : http://localhost:8080"

elif [ "$MODE" = "off" ]; then
    echo "⚠️  Désactivation HTTPS (tests uniquement)..."

    # Frontend : HTTP
    sed -i '' "s|const API_BASE_URL = 'https://localhost:3001/api';|const API_BASE_URL = 'http://localhost:3001/api';|g" frontend/js/api.js

    echo "✅ HTTP activé"
    echo ""
    echo "📋 Actions requises :"
    echo "  1. Redémarrer le backend : cd backend && HTTPS_ENABLED=false npm start"
    echo "  2. Rafraîchir le frontend : http://localhost:8080"
    echo ""
    echo "⚠️  ATTENTION : La conformité UMLsec <<secure links>> est désactivée !"

else
    echo "❌ Mode invalide. Utilisez 'on' ou 'off'"
    exit 1
fi

