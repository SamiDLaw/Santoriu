#!/bin/bash

# Script d'installation et de configuration pour Santoriu Boutique

echo "🚀 Installation des dépendances pour Santoriu Boutique..."
npm install

# Vérifier si le fichier .env existe, sinon le créer à partir de .env.example
if [ ! -f .env ]; then
  echo "📝 Création du fichier .env à partir de .env.example..."
  cp .env.example .env
  echo "⚠️ N'oubliez pas de mettre à jour vos clés API dans le fichier .env"
fi

echo "✅ Installation terminée !"
echo "🌐 Pour lancer le serveur de développement, exécutez : npm run dev"
echo "🔍 Votre site sera accessible à l'adresse : http://localhost:3000"
