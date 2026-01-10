#!/bin/bash

# Script de génération de certificats SSL auto-signés
# Pour tests locaux et validation académique UMLsec

echo "🔐 Génération des certificats SSL auto-signés..."

# Crée le répertoire certs s'il n'existe pas
mkdir -p "$(dirname "$0")"

# Génère la clé privée
openssl genrsa -out "$(dirname "$0")/private-key.pem" 2048

# Génère le certificat auto-signé (valide 365 jours)
openssl req -new -x509 -key "$(dirname "$0")/private-key.pem" \
  -out "$(dirname "$0")/certificate.pem" \
  -days 365 \
  -subj "/C=FR/ST=IDF/L=Paris/O=SecureNotes/OU=Tests-Locaux/CN=localhost"

# Permissions restrictives
chmod 600 "$(dirname "$0")/private-key.pem"
chmod 644 "$(dirname "$0")/certificate.pem"

echo "✅ Certificats générés avec succès !"
echo "   - Clé privée : $(dirname "$0")/private-key.pem"
echo "   - Certificat : $(dirname "$0")/certificate.pem"
echo ""
echo "⚠️  ATTENTION : Ces certificats sont auto-signés."
echo "   Le navigateur affichera un avertissement de sécurité."
echo "   Pour accepter : Cliquez sur 'Avancé' puis 'Continuer vers localhost'"
echo ""
echo "✅ Prêt pour les tests locaux et validation UMLsec !"

