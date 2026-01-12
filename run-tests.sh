#!/bin/bash

# Script pour arrêter le serveur, le redémarrer et lancer les tests

echo "🛑 Arrêt des serveurs existants..."
pkill -f "node src/server.js" || true
sleep 2

echo "🚀 Démarrage du serveur de test..."
cd backend
NODE_ENV=test node src/server.js --port=3001 --name=server1 > /dev/null 2>&1 &
SERVER_PID=$!
cd ..

echo "⏳ Attente du démarrage du serveur (5 secondes)..."
sleep 5

echo "🧪 Lancement des tests de sécurité..."
npm test

# Arrêt du serveur de test
echo "🛑 Arrêt du serveur de test..."
kill $SERVER_PID 2>/dev/null || true

echo "✅ Terminé!"

