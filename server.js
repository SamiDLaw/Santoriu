// Server for Santoriu Boutique
const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const app = express();
const PORT = process.env.PORT || 3000;

// Intégration Shippo avec la clé API de test
const Shippo = require('shippo')(process.env.SHIPPO_API_KEY || 'shippo_test_ceda0c25186a3deb9358404a5afa902ce60b3056');

// Stockage temporaire des commandes (à remplacer par une base de données)
let orders = [];

// Middleware
app.use(express.static(path.join(__dirname, '/')));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'success.html'));
});

// Create Stripe checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { product, quantity, language } = req.body;
    
    // Set currency based on language
    const currency = language === 'fr' ? 'eur' : 'usd';
    
    // Set price based on currency
    const unitAmount = currency === 'eur' ? 4999 : 4999; // €49.99 or $49.99
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: language === 'fr' ? 'Bouteille Décorative Thousand Sunny' : 'Thousand Sunny Decorative Bottle',
              description: language === 'fr' ? 
                'Bouteille décorative exclusive inspirée de One Piece' : 
                'Exclusive One Piece inspired decorative bottle',
              images: ['https://santoriu.com/assets/img/product-detail.jpg'],
            },
            unit_amount: unitAmount,
          },
          quantity: quantity || 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success.html`,
      cancel_url: `${req.headers.origin}/`,
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'DE', 'IT', 'ES', 'GB', 'US', 'CA', 'JP'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: language === 'fr' ? 590 : 650, // €5.90 or $6.50
              currency: currency,
            },
            display_name: language === 'fr' ? 'Livraison standard' : 'Standard shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 5,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: language === 'fr' ? 990 : 1090, // €9.90 or $10.90
              currency: currency,
            },
            display_name: language === 'fr' ? 'Livraison express' : 'Express shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 2,
              },
            },
          },
        },
      ],
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Process direct payment
app.post('/api/process-payment', async (req, res) => {
  try {
    const { payment_method_id, amount, currency, language } = req.body;
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: payment_method_id,
      confirm: true,
      description: language === 'fr' ? 
        'Bouteille Décorative Thousand Sunny' : 
        'Thousand Sunny Decorative Bottle',
      return_url: `${req.headers.origin}/success.html`,
    });
    
    res.json({ success: true, paymentIntent });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Routes pour l'administration
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin/index.html'));
});

// API pour récupérer les commandes
app.get('/api/orders', async (req, res) => {
  try {
    // Si nous avons des commandes en mémoire, les renvoyer
    if (orders.length > 0) {
      return res.json(orders);
    }
    
    // Sinon, récupérer les commandes depuis Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
    });
    
    // Transformer les paiements en commandes
    const stripeOrders = await Promise.all(paymentIntents.data
      .filter(pi => pi.status === 'succeeded')
      .map(async pi => {
        // Récupérer les détails du client et de l'expédition si disponibles
        let customer = { name: 'Client', email: 'client@example.com' };
        let shipping = {
          method: 'Standard',
          address: { line1: '', city: '', country: '' }
        };
        
        if (pi.shipping) {
          shipping.address = pi.shipping.address;
          customer.name = pi.shipping.name;
        }
        
        if (pi.receipt_email) {
          customer.email = pi.receipt_email;
        }
        
        // Créer l'objet commande
        return {
          id: pi.id,
          date: new Date(pi.created * 1000).toISOString(),
          customer,
          amount: pi.amount,
          currency: pi.currency,
          subtotal: pi.amount - (pi.shipping ? 590 : 0), // Estimation
          items: [{
            name: 'Bouteille Décorative Thousand Sunny',
            quantity: 1,
            unit_price: pi.amount - (pi.shipping ? 590 : 0)
          }],
          shipping,
          payment_status: 'paid',
          status: 'pending', // Par défaut
          timeline: [{
            date: new Date(pi.created * 1000).toISOString(),
            title: 'Commande créée',
            description: 'La commande a été passée avec succès'
          }, {
            date: new Date(pi.created * 1000).toISOString(),
            title: 'Paiement reçu',
            description: `Paiement par ${pi.payment_method_types[0]}`
          }]
        };
      }));
    
    // Sauvegarder les commandes en mémoire
    orders = stripeOrders;
    res.json(orders);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: error.message });
  }
});

// API pour mettre à jour le statut d'une commande
app.post('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const orderIndex = orders.findIndex(order => order.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Commande non trouvée' });
  }
  
  orders[orderIndex].status = status;
  orders[orderIndex].timeline.push({
    date: new Date().toISOString(),
    title: `Statut mis à jour: ${status}`,
    description: 'Mise à jour manuelle depuis le tableau de bord admin'
  });
  
  res.json(orders[orderIndex]);
});

// API pour créer une étiquette d'expédition avec Shippo
app.post('/api/shipping/create-label', async (req, res) => {
  try {
    const { orderId, fromAddress, toAddress, parcel } = req.body;
    
    // Vérifier que toutes les informations nécessaires sont présentes
    if (!fromAddress || !toAddress || !parcel) {
      return res.status(400).json({ error: 'Informations d\'expédition incomplètes' });
    }
    
    // Créer l'expédition avec Shippo
    const shipment = await Shippo.shipment.create({
      address_from: fromAddress,
      address_to: toAddress,
      parcels: [parcel],
      async: false
    });
    
    // Récupérer les tarifs d'expédition disponibles
    const rates = shipment.rates;
    
    // Si un orderId est fourni, mettre à jour la commande avec les informations d'expédition
    if (orderId) {
      const orderIndex = orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        orders[orderIndex].shipping.shipment_id = shipment.object_id;
        orders[orderIndex].shipping.rates = rates;
        
        // Ajouter un événement à la timeline
        orders[orderIndex].timeline.push({
          date: new Date().toISOString(),
          title: 'Expédition créée',
          description: 'Options d\'expédition générées via Shippo'
        });
      }
    }
    
    res.json({
      shipment_id: shipment.object_id,
      rates: rates
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'expédition:', error);
    res.status(500).json({ error: error.message });
  }
});

// API pour acheter une étiquette d'expédition
app.post('/api/shipping/purchase-label', async (req, res) => {
  try {
    const { orderId, rateId } = req.body;
    
    if (!rateId) {
      return res.status(400).json({ error: 'ID de tarif manquant' });
    }
    
    // Acheter l'étiquette avec le tarif sélectionné
    const transaction = await Shippo.transaction.create({
      rate: rateId,
      label_file_type: 'PDF',
      async: false
    });
    
    // Si un orderId est fourni, mettre à jour la commande avec les informations d'étiquette
    if (orderId) {
      const orderIndex = orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        orders[orderIndex].shipping.label = transaction;
        orders[orderIndex].status = 'shipped';
        
        // Ajouter un événement à la timeline
        orders[orderIndex].timeline.push({
          date: new Date().toISOString(),
          title: 'Commande expédiée',
          description: `Étiquette d'expédition créée, numéro de suivi: ${transaction.tracking_number}`
        });
      }
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Erreur lors de l\'achat de l\'\u00e9tiquette:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
