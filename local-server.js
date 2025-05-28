// Serveur local simplifié pour tester la boutique Santoriu
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour servir les fichiers statiques
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Routes simulées pour les API de paiement
app.post('/api/create-checkout-session', (req, res) => {
  // Simulation d'une session Stripe
  console.log('Création d\'une session de paiement Stripe (simulation)');
  console.log('Données reçues:', req.body);
  
  // En mode test, on renvoie un ID de session fictif
  setTimeout(() => {
    res.json({ id: 'cs_test_' + Math.random().toString(36).substr(2, 9) });
  }, 500); // Délai simulé de 500ms
});

app.post('/api/process-payment', (req, res) => {
  // Simulation d'un traitement de paiement
  console.log('Traitement d\'un paiement (simulation)');
  console.log('Données reçues:', req.body);
  
  // En mode test, on renvoie un succès
  setTimeout(() => {
    res.json({ success: true, paymentIntent: { id: 'pi_test_' + Math.random().toString(36).substr(2, 9) } });
  }, 800); // Délai simulé de 800ms
});

// Route pour rediriger vers la page de succès (pour tester)
app.get('/test-success', (req, res) => {
  res.redirect('/success.html');
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`
  🚀 Serveur Santoriu démarré !
  
  📱 Site accessible à l'adresse: http://localhost:${PORT}
  
  ℹ️ Informations:
  - Ce serveur est uniquement pour les tests locaux
  - Les paiements sont simulés (pas de vraie transaction)
  - Pour tester la page de succès: http://localhost:${PORT}/test-success
  
  ⚠️ Pour arrêter le serveur: Ctrl+C
  `);
});
