// Server for Santoriu Boutique
const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const app = express();
const PORT = process.env.PORT || 3000;

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
        allowed_countries: ['US', 'CA', 'FR', 'GB', 'DE', 'IT', 'ES', 'JP'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: currency,
            },
            display_name: language === 'fr' ? 'Livraison gratuite' : 'Free shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 7,
              },
              maximum: {
                unit: 'business_day',
                value: 14,
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
