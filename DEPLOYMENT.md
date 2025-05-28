# Guide de Déploiement - Santoriu Boutique

Ce guide vous explique comment déployer votre boutique Santoriu sur différentes plateformes d'hébergement et configurer les paiements.

## Prérequis

1. Un compte sur l'une des plateformes d'hébergement suivantes :
   - [Vercel](https://vercel.com)
   - [Render](https://render.com)
   - [Railway](https://railway.app)

2. Un compte [Stripe](https://stripe.com) pour les paiements par carte
3. Un compte [PayPal](https://paypal.com) pour les paiements alternatifs
4. Un domaine (santoriu.com) acheté sur [OVH](https://ovh.fr) ou autre registrar

## Configuration de Stripe

1. Créez un compte sur [Stripe](https://stripe.com) si vous n'en avez pas déjà un
2. Dans le tableau de bord Stripe, allez dans "Developers" > "API keys"
3. Notez votre clé publique (publishable key) et votre clé secrète (secret key)
4. Remplacez la clé de test dans `assets/js/stripe-integration.js` par votre clé publique :
   ```javascript
   const stripePublishableKey = 'votre_clé_publique_stripe';
   ```

## Déploiement sur Vercel

1. Créez un compte sur [Vercel](https://vercel.com) si vous n'en avez pas déjà un
2. Installez Git et créez un dépôt pour votre projet
3. Connectez votre dépôt GitHub à Vercel
4. Dans les paramètres du projet sur Vercel, ajoutez la variable d'environnement suivante :
   - `STRIPE_SECRET_KEY` : Votre clé secrète Stripe

5. Déployez votre projet

### Ligne de commande (alternative)

```bash
# Installez Vercel CLI
npm install -g vercel

# Connectez-vous à votre compte Vercel
vercel login

# Déployez depuis le répertoire du projet
cd /Users/samikhelladi/Documents/Santoriu/Boutique
vercel --prod
```

## Déploiement sur Render

1. Créez un compte sur [Render](https://render.com)
2. Créez un nouveau service Web
3. Connectez votre dépôt GitHub ou téléchargez votre code
4. Configurez le service :
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Environment Variables** : Ajoutez `STRIPE_SECRET_KEY` avec votre clé secrète Stripe

## Déploiement sur Railway

1. Créez un compte sur [Railway](https://railway.app)
2. Créez un nouveau projet
3. Connectez votre dépôt GitHub ou téléchargez votre code
4. Ajoutez la variable d'environnement `STRIPE_SECRET_KEY` avec votre clé secrète Stripe

## Configuration du domaine

1. Une fois votre site déployé, récupérez l'URL de votre site (ex: santoriu.vercel.app)
2. Connectez-vous à votre compte OVH
3. Allez dans la section "Domaines" et sélectionnez votre domaine santoriu.com
4. Allez dans "Zone DNS" et ajoutez les enregistrements suivants :
   - Type: A, Nom: @, Valeur: adresse IP fournie par votre hébergeur (si disponible)
   - Type: CNAME, Nom: www, Valeur: URL de votre site déployé (ex: santoriu.vercel.app)

5. Attendez la propagation DNS (peut prendre jusqu'à 24-48 heures)
6. Dans votre plateforme d'hébergement, configurez votre domaine personnalisé

### Configuration du domaine sur Vercel

1. Dans le tableau de bord Vercel, allez dans votre projet
2. Cliquez sur "Settings" > "Domains"
3. Ajoutez votre domaine (santoriu.com) et suivez les instructions

## Configuration HTTPS

Le HTTPS sera automatiquement configuré par Vercel, Render ou Railway lorsque vous ajoutez votre domaine personnalisé. Ils fournissent des certificats SSL gratuits via Let's Encrypt.

## Test du site

1. Visitez votre site à l'adresse temporaire fournie par votre hébergeur
2. Vérifiez que toutes les fonctionnalités fonctionnent correctement
3. Testez les paiements en mode test avec les cartes de test Stripe :
   - Numéro: 4242 4242 4242 4242
   - Date d'expiration: n'importe quelle date future
   - CVC: n'importe quels 3 chiffres

## Passage en production

1. Une fois les tests terminés, remplacez les clés de test Stripe par les clés de production
2. Assurez-vous que votre domaine est correctement configuré
3. Activez le mode production dans Stripe

## Optimisations supplémentaires

1. Configurez Google Analytics pour suivre les visites et conversions
2. Ajoutez le pixel Meta pour les publicités Facebook/Instagram
3. Configurez un compte Google Search Console pour le référencement
4. Optimisez les images pour améliorer la vitesse de chargement

## Support

En cas de problème avec le déploiement, vous pouvez :
- Consulter la documentation de votre hébergeur
- Vérifier les journaux d'erreurs dans le tableau de bord de votre hébergeur
- Contacter le support de votre hébergeur
