// Stripe Integration for Santoriu Boutique

// Initialize Stripe with your publishable key
const stripePublishableKey = 'pk_test_placeholder';

// DOM Elements
const checkoutButton = document.getElementById('checkout-button');
const paymentForm = document.getElementById('payment-form');

// Initialize Stripe when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Stripe
  if (typeof Stripe !== 'undefined') {
    const stripe = Stripe(stripePublishableKey);
    
    // Handle direct checkout button
    if (checkoutButton) {
      checkoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Show loading state
        checkoutButton.disabled = true;
        checkoutButton.textContent = document.documentElement.lang === 'fr' ? 
          'Traitement en cours...' : 
          'Processing...';
        
        try {
          // Create a checkout session on the server
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              product: 'thousand-sunny-bottle',
              quantity: 1,
              language: document.documentElement.lang || 'en'
            }),
          });
          
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          
          const session = await response.json();
          
          // Redirect to Stripe Checkout
          const result = await stripe.redirectToCheckout({
            sessionId: session.id,
          });
          
          if (result.error) {
            // Display error to the customer
            showError(result.error.message);
          }
        } catch (error) {
          console.error('Error:', error);
          showError(error.message);
        } finally {
          // Reset button state
          checkoutButton.disabled = false;
          checkoutButton.textContent = document.documentElement.lang === 'fr' ? 
            'Commander Maintenant' : 
            'Order Now';
        }
      });
    }
    
    // Handle payment form if it exists (for custom checkout)
    if (paymentForm) {
      const elements = stripe.elements();
      
      // Create card element
      const cardElement = elements.create('card', {
        style: {
          base: {
            color: '#32325d',
            fontFamily: '"Noto Sans JP", sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        }
      });
      
      // Mount the card element
      cardElement.mount('#card-element');
      
      // Handle form submission
      paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Disable the submit button to prevent repeated clicks
        const submitButton = paymentForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        
        try {
          // Create payment method
          const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
          });
          
          if (error) {
            // Show error to customer
            showError(error.message);
            return;
          }
          
          // Send payment method ID to server
          const response = await fetch('/api/process-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              payment_method_id: paymentMethod.id,
              amount: 4999, // $49.99 in cents
              currency: document.documentElement.lang === 'fr' ? 'eur' : 'usd',
              language: document.documentElement.lang || 'en'
            }),
          });
          
          const paymentResult = await response.json();
          
          if (paymentResult.error) {
            // Show error to customer
            showError(paymentResult.error);
          } else {
            // Payment succeeded, redirect to success page
            window.location.href = '/success.html';
          }
        } catch (error) {
          console.error('Error:', error);
          showError(error.message);
        } finally {
          // Re-enable the submit button
          submitButton.disabled = false;
        }
      });
      
      // Handle card element changes
      cardElement.on('change', ({ error }) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
          displayError.textContent = error.message;
        } else {
          displayError.textContent = '';
        }
      });
    }
  } else {
    console.error('Stripe.js is not loaded');
  }
});

// Function to show error messages
function showError(message) {
  const errorElement = document.getElementById('payment-error') || document.createElement('div');
  
  if (!document.getElementById('payment-error')) {
    errorElement.id = 'payment-error';
    errorElement.className = 'payment-error';
    
    // Add error element to the page
    const container = document.querySelector('.payment-container') || document.body;
    container.prepend(errorElement);
  }
  
  // Set error message
  errorElement.textContent = message;
  
  // Scroll to error
  errorElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  // Remove error after 5 seconds
  setTimeout(() => {
    errorElement.textContent = '';
  }, 5000);
}

// Function to handle Apple Pay / Google Pay if available
function initializeWalletPayments() {
  if (typeof Stripe !== 'undefined') {
    const stripe = Stripe(stripePublishableKey);
    
    // Check if wallet payment is available
    const paymentRequest = stripe.paymentRequest({
      country: 'US',
      currency: document.documentElement.lang === 'fr' ? 'eur' : 'usd',
      total: {
        label: 'Thousand Sunny Bottle',
        amount: 4999, // $49.99 in cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });
    
    // Check if the Payment Request API is available
    paymentRequest.canMakePayment().then(result => {
      if (result) {
        // The browser supports wallet payments
        const walletButton = document.getElementById('wallet-button');
        
        if (walletButton) {
          // Show the wallet button
          walletButton.style.display = 'block';
          
          // Create a Payment Request Button
          const prButton = stripe.elements().create('paymentRequestButton', {
            paymentRequest,
          });
          
          // Mount the Payment Request Button
          prButton.mount('#wallet-button');
          
          // Handle payment request completion
          paymentRequest.on('paymentmethod', async (ev) => {
            try {
              // Send payment method ID to server
              const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  payment_method_id: ev.paymentMethod.id,
                  amount: 4999, // $49.99 in cents
                  currency: document.documentElement.lang === 'fr' ? 'eur' : 'usd',
                  language: document.documentElement.lang || 'en'
                }),
              });
              
              const paymentResult = await response.json();
              
              if (paymentResult.error) {
                // Show error and complete the payment with failure
                ev.complete('fail');
                showError(paymentResult.error);
              } else {
                // Complete the payment successfully
                ev.complete('success');
                // Redirect to success page
                window.location.href = '/success.html';
              }
            } catch (error) {
              console.error('Error:', error);
              ev.complete('fail');
              showError(error.message);
            }
          });
        }
      } else {
        // Wallet payments not available, hide the button
        const walletButton = document.getElementById('wallet-button');
        if (walletButton) {
          walletButton.style.display = 'none';
        }
      }
    });
  }
}

// Initialize wallet payments if the element exists
if (document.getElementById('wallet-button')) {
  initializeWalletPayments();
}

// PayPal Integration
function initializePayPal() {
  const paypalButton = document.getElementById('paypal-button');
  
  if (paypalButton && window.paypal) {
    paypal.Buttons({
      createOrder: function(data, actions) {
        // Create a PayPal order
        return actions.order.create({
          purchase_units: [{
            description: 'Thousand Sunny Decorative Bottle',
            amount: {
              currency_code: document.documentElement.lang === 'fr' ? 'EUR' : 'USD',
              value: '49.99'
            }
          }]
        });
      },
      onApprove: function(data, actions) {
        // Capture the funds from the transaction
        return actions.order.capture().then(function(details) {
          // Show a success message
          alert(document.documentElement.lang === 'fr' ? 
            'Transaction complétée par ' + details.payer.name.given_name :
            'Transaction completed by ' + details.payer.name.given_name);
          
          // Redirect to success page
          window.location.href = '/success.html';
        });
      },
      onError: function(err) {
        // Show an error message
        showError(err.message);
      }
    }).render('#paypal-button');
  }
}

// Initialize PayPal if the element exists
if (document.getElementById('paypal-button') && window.paypal) {
  initializePayPal();
}
