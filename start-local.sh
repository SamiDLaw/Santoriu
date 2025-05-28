#!/bin/bash

# Script pour démarrer le serveur local de test pour Santoriu Boutique

echo "🔍 Vérification des dépendances..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install express
fi

echo "🚀 Démarrage du serveur local Santoriu..."
echo "⏳ Chargement en cours..."
node local-server.js
