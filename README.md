# Santoriu - Boutique E-commerce One-Product

![Santoriu Logo](/assets/img/logo.svg)

Site e-commerce minimaliste pour une bouteille flottante Thousand Sunny inspirée de One Piece. Cette boutique est conçue pour être ultra légère, rapide à charger, et optimisée pour les conversions.

## 🌟 Caractéristiques

- **Design minimaliste et élégant** inspiré de One Piece et de la culture otaku/gamer
- **Site one-product** optimisé pour la conversion avec une expérience d'achat fluide
- **Multilingue** (Anglais par défaut, Français pour les IP françaises) avec détection automatique
- **Intégration Stripe** pour les paiements par carte bancaire et Apple Pay
- **Intégration PayPal** pour les paiements alternatifs
- **Responsive et optimisé pour mobile** (80% du trafic attendu via smartphone)
- **Temps de chargement rapide** (<2s) pour une expérience utilisateur optimale
- **SEO-friendly** avec structure HTML propre, balises meta, sitemap et OpenGraph

## 📂 Structure du projet

```
santoriu/
├── index.html              # Page d'accueil / landing page
├── success.html            # Page de confirmation de commande
├── terms.html              # Conditions générales de vente
├── privacy.html            # Politique de confidentialité
├── returns.html            # Politique de retour
├── server.js               # Serveur Node.js pour l'API de paiement
├── package.json            # Configuration du projet et dépendances
├── vercel.json             # Configuration pour déploiement sur Vercel
├── render.yaml             # Configuration pour déploiement sur Render
├── .env.example            # Exemple de variables d'environnement
├── robots.txt              # Instructions pour les robots d'indexation
├── sitemap.xml             # Plan du site pour les moteurs de recherche
├── setup.sh                # Script d'installation et de configuration
├── assets/
│   ├── css/                # Fichiers CSS
│   │   ├── reset.css       # Reset CSS pour normaliser les styles
│   │   └── styles.css      # Styles principaux du site
│   ├── js/                 # Fichiers JavaScript
│   │   ├── scripts.js      # Scripts principaux du site
│   │   └── stripe-integration.js # Intégration Stripe
│   └── img/                # Images et ressources graphiques
│       └── logo.svg        # Logo Santoriu
├── locales/                # Fichiers de traduction
│   ├── en.json             # Anglais (par défaut)
│   └── fr.json             # Français
├── DEPLOYMENT.md           # Guide détaillé de déploiement
└── README.md               # Documentation principale
```

## 🚀 Installation et démarrage rapide

### Prérequis
- [Node.js](https://nodejs.org/) (v14 ou supérieur)
- Compte [Stripe](https://stripe.com) pour les paiements
- Compte [PayPal](https://paypal.com) pour les paiements alternatifs

### Installation locale

1. Clonez ce dépôt sur votre machine locale
2. Exécutez le script d'installation :
   ```bash
   ./setup.sh
   ```
3. Configurez vos clés API dans le fichier `.env`
4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
5. Ouvrez votre navigateur à l'adresse [http://localhost:3000](http://localhost:3000)

## 💳 Intégration des paiements

### Stripe
Le site utilise Stripe Checkout pour les paiements par carte bancaire et Apple Pay. Pour tester les paiements en mode développement, utilisez les cartes de test suivantes :

- **Numéro** : 4242 4242 4242 4242
- **Date** : N'importe quelle date future
- **CVC** : N'importe quels 3 chiffres

Remplacez les clés API de test par vos clés de production avant le lancement.

### PayPal
L'intégration PayPal est également disponible pour offrir une alternative de paiement. Configurez vos identifiants PayPal dans le fichier `.env`.

## 🌐 Déploiement

Plusieurs options de déploiement sont disponibles. Consultez le fichier [DEPLOYMENT.md](DEPLOYMENT.md) pour des instructions détaillées sur :

- Déploiement sur Vercel (recommandé)
- Déploiement sur Render
- Déploiement sur Railway
- Configuration du domaine avec OVH

## 🎨 Personnalisation

### Couleurs et style
Modifiez les variables CSS dans `assets/css/styles.css` pour personnaliser les couleurs, polices et espacements :

```css
:root {
  /* Color Variables */
  --color-black: #000000;
  --color-red-orange: #FF4500;
  --color-white: #FFFFFF;
  /* ... */
}
```

### Contenu
Les textes du site sont stockés dans les fichiers de traduction `locales/en.json` et `locales/fr.json`. Modifiez ces fichiers pour personnaliser le contenu sans toucher au HTML.

### Images
Remplacez les images dans le dossier `assets/img/` par vos propres visuels du produit.

## 📊 Analytique et marketing

Le site est prêt pour l'intégration avec :

- Google Analytics 4
- Meta Pixel (Facebook/Instagram)
- TikTok Pixel

Des commentaires dans le code indiquent où ajouter vos codes de suivi.

## 🔍 Optimisation SEO

Le site est optimisé pour les moteurs de recherche avec :

- Structure HTML sémantique
- Balises meta appropriées
- Sitemap XML
- Fichier robots.txt
- Intégration OpenGraph pour le partage sur les réseaux sociaux

## 🔧 Support et maintenance

Pour toute question ou assistance, contactez-nous à support@santoriu.com.

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
