// Main JavaScript for Santoriu Boutique

// DOM Elements
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navList = document.querySelector('.nav-list');
const languageButtons = document.querySelectorAll('.language-selector button');
const faqItems = document.querySelectorAll('.faq-item');
const stockCounter = document.querySelector('.stock-counter');

// Language Detection and Translation
document.addEventListener('DOMContentLoaded', () => {
  // Detect user's language based on browser or IP
  detectUserLanguage();
  
  // Initialize mobile menu
  initMobileMenu();
  
  // Initialize FAQ accordion
  initFaqAccordion();
  
  // Initialize stock counter
  initStockCounter();
  
  // Initialize Stripe
  initStripe();
});

// Detect user's language
function detectUserLanguage() {
  // First try to get language from localStorage (if user has selected before)
  const savedLanguage = localStorage.getItem('language');
  
  if (savedLanguage) {
    setLanguage(savedLanguage);
    return;
  }
  
  // Then try to detect based on browser language
  const browserLanguage = navigator.language || navigator.userLanguage;
  
  if (browserLanguage.startsWith('fr')) {
    setLanguage('fr');
  } else {
    // Default to English
    setLanguage('en');
  }
  
  // For production: You would use a geo-IP service here
  // Example with a hypothetical API:
  /*
  fetch('https://api.example.com/geoip')
    .then(response => response.json())
    .then(data => {
      if (data.country_code === 'FR') {
        setLanguage('fr');
      } else {
        setLanguage('en');
      }
    })
    .catch(error => {
      console.error('Error detecting location:', error);
      setLanguage('en'); // Default to English on error
    });
  */
}

// Set the language
function setLanguage(lang) {
  document.documentElement.lang = lang;
  localStorage.setItem('language', lang);
  
  // Update active state on language buttons
  languageButtons.forEach(button => {
    if (button.dataset.lang === lang) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  // Load translations
  loadTranslations(lang);
}

// Load translations from JSON file
function loadTranslations(lang) {
  fetch(`/locales/${lang}.json`)
    .then(response => response.json())
    .then(translations => {
      // Apply translations to all elements with data-i18n attribute
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        const keys = key.split('.');
        
        // Navigate through the nested translation object
        let translation = translations;
        for (const k of keys) {
          translation = translation[k];
          if (!translation) break;
        }
        
        if (translation) {
          // Special handling for elements that need HTML content
          if (element.dataset.i18nHtml) {
            element.innerHTML = translation;
          } else {
            element.textContent = translation;
          }
        }
      });
      
      // Update meta tags
      document.title = translations.site.title;
      document.querySelector('meta[name="description"]').content = translations.site.description;
      document.querySelector('meta[name="keywords"]').content = translations.site.keywords;
    })
    .catch(error => {
      console.error(`Error loading translations for ${lang}:`, error);
    });
}

// Initialize mobile menu
function initMobileMenu() {
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      navList.classList.toggle('active');
      mobileMenuToggle.classList.toggle('active');
      
      // Toggle aria-expanded for accessibility
      const expanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true' || false;
      mobileMenuToggle.setAttribute('aria-expanded', !expanded);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.nav-list') && !event.target.closest('.mobile-menu-toggle') && navList.classList.contains('active')) {
        navList.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  // Language selector functionality
  languageButtons.forEach(button => {
    button.addEventListener('click', () => {
      const lang = button.dataset.lang;
      setLanguage(lang);
    });
  });
}

// Initialize FAQ accordion
function initFaqAccordion() {
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      // Toggle current item
      item.classList.toggle('active');
      
      // Update aria-expanded for accessibility
      const expanded = item.classList.contains('active');
      question.setAttribute('aria-expanded', expanded);
      
      // Close other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });
    });
  });
}

// Initialize stock counter
function initStockCounter() {
  if (stockCounter) {
    // Set initial stock (for demo purposes)
    let stock = Math.floor(Math.random() * 20) + 10; // Random between 10-30
    updateStockCounter(stock);
    
    // Simulate stock decreasing over time
    setInterval(() => {
      if (stock > 1) {
        stock -= Math.floor(Math.random() * 2); // Randomly decrease by 0 or 1
        updateStockCounter(stock);
      }
    }, 60000); // Every minute
  }
}

// Update stock counter display
function updateStockCounter(stock) {
  if (stockCounter) {
    const currentLang = localStorage.getItem('language') || 'en';
    
    if (currentLang === 'fr') {
      stockCounter.textContent = `Seulement ${stock} en stock !`;
    } else {
      stockCounter.textContent = `Only ${stock} left in stock!`;
    }
  }
}

// Initialize Stripe
function initStripe() {
  // Check if we're on the checkout page
  const checkoutButton = document.querySelector('#checkout-button');
  
  if (checkoutButton) {
    // Replace with your publishable key
    const stripe = Stripe(stripePublishableKey);
    
    checkoutButton.addEventListener('click', () => {
      // Create a checkout session on your server
      fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: 'thousand-sunny-bottle',
          quantity: 1,
        }),
      })
      .then(response => response.json())
      .then(session => {
        // Redirect to Stripe Checkout
        return stripe.redirectToCheckout({ sessionId: session.id });
      })
      .then(result => {
        if (result.error) {
          alert(result.error.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  }
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      // Close mobile menu if open
      if (navList.classList.contains('active')) {
        navList.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
      
      // Scroll to target
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add animation on scroll
const animateOnScroll = () => {
  const elements = document.querySelectorAll('.animate-on-scroll');
  
  elements.forEach(element => {
    const elementPosition = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    if (elementPosition < windowHeight - 100) {
      element.classList.add('animated');
    }
  });
};

// Initialize animations
window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Add to cart functionality (simplified for one-product store)
const addToCartButton = document.querySelector('.add-to-cart');

if (addToCartButton) {
  addToCartButton.addEventListener('click', () => {
    // Show added to cart confirmation
    const confirmationMessage = document.createElement('div');
    confirmationMessage.classList.add('cart-confirmation');
    
    const currentLang = localStorage.getItem('language') || 'en';
    confirmationMessage.textContent = currentLang === 'fr' ? 
      'Produit ajouté au panier !' : 
      'Product added to cart!';
    
    document.body.appendChild(confirmationMessage);
    
    // Remove after 3 seconds
    setTimeout(() => {
      confirmationMessage.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(confirmationMessage);
      }, 500);
    }, 3000);
    
    // Redirect to checkout
    setTimeout(() => {
      window.location.href = '/checkout.html';
    }, 1000);
  });
}
