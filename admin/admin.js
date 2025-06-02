// Script d'administration pour Santoriu Boutique

// Configuration
const ADMIN_USERNAME = 'admin'; // À remplacer par un vrai système d'authentification
const ADMIN_PASSWORD = 'santoriu2025'; // À remplacer par un vrai système d'authentification
const API_URL = '/api';

// État de l'application
let currentTab = 'orders';
let orders = [];
let isLoggedIn = false;
let shippoApiKey = localStorage.getItem('shippoApiKey') || '';

// Éléments DOM
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const ordersList = document.getElementById('orders-list');
const refreshOrdersBtn = document.getElementById('refresh-orders');
const orderSearchInput = document.getElementById('order-search');
const filterButtons = document.querySelectorAll('.filter-btn');
const orderModal = document.getElementById('order-modal');
const closeModal = document.querySelector('.close-modal');
const orderDetails = document.getElementById('order-details');
const printOrderBtn = document.getElementById('print-order');
const createShippingLabelBtn = document.getElementById('create-shipping-label');
const shippoKeyInput = document.getElementById('shippo-api-key');
const saveShippoKeyBtn = document.getElementById('save-shippo-key');
const pendingShipmentsList = document.getElementById('pending-shipments-list');
const storeInfoForm = document.getElementById('store-info-form');
const shippingOptionsForm = document.getElementById('shipping-options-form');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  // Vérifier si l'utilisateur est déjà connecté
  checkLoginStatus();
  
  // Gestionnaires d'événements
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  } else {
    console.error('Login form not found!');
  }
  
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });
  
  if (refreshOrdersBtn) refreshOrdersBtn.addEventListener('click', fetchOrders);
  if (orderSearchInput) orderSearchInput.addEventListener('input', filterOrders);
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => filterOrdersByStatus(button.dataset.filter));
  });
  
  if (closeModal) closeModal.addEventListener('click', () => orderModal.style.display = 'none');
  
  window.addEventListener('click', (e) => {
    if (e.target === orderModal) {
      orderModal.style.display = 'none';
    }
  });
  
  if (printOrderBtn) printOrderBtn.addEventListener('click', printOrder);
  if (createShippingLabelBtn) createShippingLabelBtn.addEventListener('click', createShippingLabel);
  if (saveShippoKeyBtn) saveShippoKeyBtn.addEventListener('click', saveShippoKey);
  if (storeInfoForm) storeInfoForm.addEventListener('submit', saveStoreInfo);
  if (shippingOptionsForm) shippingOptionsForm.addEventListener('submit', saveShippingOptions);
  
  // Charger les valeurs sauvegardées
  loadSavedSettings();
  
  // Si l'utilisateur est connecté, charger les commandes
  if (isLoggedIn) {
    fetchOrders();
  }
});

// Fonctions d'authentification
function checkLoginStatus() {
  const token = localStorage.getItem('adminToken');
  if (token) {
    isLoggedIn = true;
    showDashboard();
  }
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Authentification simple (à remplacer par une vraie API d'authentification)
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    isLoggedIn = true;
    localStorage.setItem('adminToken', 'temp-token-' + Date.now());
    showDashboard();
    fetchOrders();
  } else {
    alert('Identifiants incorrects. Veuillez réessayer.');
  }
}

function handleLogout() {
  isLoggedIn = false;
  localStorage.removeItem('adminToken');
  showLogin();
}

function showLogin() {
  loginSection.style.display = 'block';
  dashboardSection.style.display = 'none';
}

function showDashboard() {
  loginSection.style.display = 'none';
  dashboardSection.style.display = 'block';
}

// Gestion des onglets
function switchTab(tabName) {
  currentTab = tabName;
  
  // Mettre à jour les boutons d'onglet
  tabButtons.forEach(button => {
    if (button.dataset.tab === tabName) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  // Afficher le contenu de l'onglet sélectionné
  tabContents.forEach(content => {
    if (content.id === tabName + '-tab') {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });
  
  // Charger les données spécifiques à l'onglet
  if (tabName === 'orders') {
    fetchOrders();
  } else if (tabName === 'shipping') {
    loadPendingShipments();
  }
}

// Gestion des commandes
async function fetchOrders() {
  try {
    ordersList.innerHTML = '<tr class="order-loading"><td colspan="7">Chargement des commandes...</td></tr>';
    
    // Appel à l'API Stripe pour récupérer les commandes (à implémenter côté serveur)
    const response = await fetch(`${API_URL}/orders`);
    
    // Pour la démo, utiliser des données fictives
    setTimeout(() => {
      orders = getMockOrders();
      renderOrders(orders);
      loadPendingShipments();
    }, 1000);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    ordersList.innerHTML = '<tr class="order-error"><td colspan="7">Erreur lors du chargement des commandes. Veuillez réessayer.</td></tr>';
  }
}

function renderOrders(ordersToRender) {
  if (ordersToRender.length === 0) {
    ordersList.innerHTML = '<tr class="order-empty"><td colspan="7">Aucune commande trouvée.</td></tr>';
    return;
  }
  
  ordersList.innerHTML = ordersToRender.map(order => `
    <tr data-order-id="${order.id}">
      <td>#${order.id.substring(0, 8)}</td>
      <td>${formatDate(order.date)}</td>
      <td>${order.customer.name}</td>
      <td>${formatCurrency(order.amount, order.currency)}</td>
      <td>${order.shipping.method}</td>
      <td><span class="order-status status-${order.status.toLowerCase()}">${getStatusLabel(order.status)}</span></td>
      <td class="order-actions">
        <button class="action-btn view" onclick="viewOrder('${order.id}')"><i class="fas fa-eye"></i></button>
        <button class="action-btn edit" onclick="editOrderStatus('${order.id}')"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete" onclick="confirmDeleteOrder('${order.id}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function filterOrders() {
  const searchTerm = orderSearchInput.value.toLowerCase();
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm) ||
    order.customer.name.toLowerCase().includes(searchTerm) ||
    order.customer.email.toLowerCase().includes(searchTerm)
  );
  renderOrders(filteredOrders);
}

function filterOrdersByStatus(status) {
  // Mettre à jour les boutons de filtre
  filterButtons.forEach(button => {
    if (button.dataset.filter === status) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
  
  // Filtrer les commandes
  if (status === 'all') {
    renderOrders(orders);
  } else {
    const filteredOrders = orders.filter(order => order.status.toLowerCase() === status);
    renderOrders(filteredOrders);
  }
}

// Fonctions pour la modal de commande
function viewOrder(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  // Remplir les détails de la commande
  orderDetails.innerHTML = `
    <div class="order-detail-header">
      <h3>Commande #${order.id.substring(0, 8)}</h3>
      <span class="order-status status-${order.status.toLowerCase()}">${getStatusLabel(order.status)}</span>
    </div>
    
    <div class="order-detail-grid">
      <div class="order-detail-section">
        <h4>Informations client</h4>
        <p><strong>Nom:</strong> ${order.customer.name}</p>
        <p><strong>Email:</strong> ${order.customer.email}</p>
        <p><strong>Téléphone:</strong> ${order.customer.phone || 'Non spécifié'}</p>
      </div>
      
      <div class="order-detail-section">
        <h4>Adresse de livraison</h4>
        <p>${order.shipping.address.line1}</p>
        ${order.shipping.address.line2 ? `<p>${order.shipping.address.line2}</p>` : ''}
        <p>${order.shipping.address.postal_code} ${order.shipping.address.city}</p>
        <p>${order.shipping.address.country}</p>
      </div>
    </div>
    
    <div class="order-detail-section">
      <h4>Produits</h4>
      <table class="order-items-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Quantité</th>
            <th>Prix unitaire</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.unit_price, order.currency)}</td>
              <td>${formatCurrency(item.quantity * item.unit_price, order.currency)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="order-detail-summary">
      <div class="summary-row">
        <span>Sous-total</span>
        <span>${formatCurrency(order.subtotal, order.currency)}</span>
      </div>
      <div class="summary-row">
        <span>Livraison (${order.shipping.method})</span>
        <span>${formatCurrency(order.shipping.cost, order.currency)}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>${formatCurrency(order.amount, order.currency)}</span>
      </div>
    </div>
    
    <div class="order-detail-section">
      <h4>Historique</h4>
      <div class="order-timeline">
        ${order.timeline.map(event => `
          <div class="timeline-item">
            <div class="timeline-date">${formatDate(event.date)}</div>
            <div class="timeline-content">
              <div class="timeline-title">${event.title}</div>
              ${event.description ? `<div class="timeline-description">${event.description}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="order-detail-actions">
      <div class="status-update">
        <label for="order-status-select">Mettre à jour le statut:</label>
        <select id="order-status-select">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>En attente</option>
          <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>En traitement</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Expédiée</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Livrée</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Annulée</option>
        </select>
        <button onclick="updateOrderStatus('${order.id}')" class="btn btn-primary">Mettre à jour</button>
      </div>
    </div>
  `;
  
  // Afficher la modal
  orderModal.style.display = 'block';
}

function printOrder() {
  window.print();
}

// Gestion des expéditions
function loadPendingShipments() {
  // Filtrer les commandes en attente d'expédition
  const pendingShipments = orders.filter(order => 
    order.status === 'processing' || 
    (order.status === 'pending' && order.payment_status === 'paid')
  );
  
  if (pendingShipments.length === 0) {
    pendingShipmentsList.innerHTML = '<p>Aucune commande en attente d\'expédition.</p>';
    return;
  }
  
  pendingShipmentsList.innerHTML = `
    <table class="shipments-table">
      <thead>
        <tr>
          <th>Commande</th>
          <th>Client</th>
          <th>Adresse</th>
          <th>Méthode</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${pendingShipments.map(order => `
          <tr>
            <td>#${order.id.substring(0, 8)}</td>
            <td>${order.customer.name}</td>
            <td>${formatShortAddress(order.shipping.address)}</td>
            <td>${order.shipping.method}</td>
            <td>
              <button onclick="createShippingLabelForOrder('${order.id}')" class="btn btn-sm btn-primary">Créer étiquette</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function createShippingLabel(orderId) {
  if (!shippoApiKey) {
    alert('Veuillez d\'abord configurer votre clé API Shippo dans les paramètres.');
    switchTab('settings');
    return;
  }
  
  // Logique pour créer une étiquette d'expédition via Shippo
  alert('Fonctionnalité de création d\'étiquette en cours de développement.');
  
  // Fermer la modal
  orderModal.style.display = 'none';
}

function createShippingLabelForOrder(orderId) {
  viewOrder(orderId);
  setTimeout(() => {
    createShippingLabel(orderId);
  }, 500);
}

function saveShippoKey() {
  const apiKey = shippoKeyInput.value.trim();
  if (apiKey) {
    localStorage.setItem('shippoApiKey', apiKey);
    shippoApiKey = apiKey;
    alert('Clé API Shippo enregistrée avec succès.');
  } else {
    alert('Veuillez entrer une clé API valide.');
  }
}

// Gestion des paramètres
function loadSavedSettings() {
  // Charger la clé API Shippo
  shippoKeyInput.value = shippoApiKey;
  
  // Charger les informations de la boutique
  const storeInfo = JSON.parse(localStorage.getItem('storeInfo') || '{}');
  if (storeInfo.name) document.getElementById('store-name').value = storeInfo.name;
  if (storeInfo.email) document.getElementById('store-email').value = storeInfo.email;
  if (storeInfo.address) document.getElementById('store-address').value = storeInfo.address;
  
  // Charger les options de livraison
  const shippingOptions = JSON.parse(localStorage.getItem('shippingOptions') || '{}');
  if (shippingOptions.standard) {
    document.getElementById('standard-price-eur').value = shippingOptions.standard.eur;
    document.getElementById('standard-price-usd').value = shippingOptions.standard.usd;
    document.getElementById('standard-min-days').value = shippingOptions.standard.min_days;
    document.getElementById('standard-max-days').value = shippingOptions.standard.max_days;
  }
  if (shippingOptions.express) {
    document.getElementById('express-price-eur').value = shippingOptions.express.eur;
    document.getElementById('express-price-usd').value = shippingOptions.express.usd;
    document.getElementById('express-min-days').value = shippingOptions.express.min_days;
    document.getElementById('express-max-days').value = shippingOptions.express.max_days;
  }
}

function saveStoreInfo(e) {
  e.preventDefault();
  const storeInfo = {
    name: document.getElementById('store-name').value,
    email: document.getElementById('store-email').value,
    address: document.getElementById('store-address').value
  };
  localStorage.setItem('storeInfo', JSON.stringify(storeInfo));
  alert('Informations de la boutique enregistrées avec succès.');
}

function saveShippingOptions(e) {
  e.preventDefault();
  const shippingOptions = {
    standard: {
      eur: parseFloat(document.getElementById('standard-price-eur').value),
      usd: parseFloat(document.getElementById('standard-price-usd').value),
      min_days: parseInt(document.getElementById('standard-min-days').value),
      max_days: parseInt(document.getElementById('standard-max-days').value)
    },
    express: {
      eur: parseFloat(document.getElementById('express-price-eur').value),
      usd: parseFloat(document.getElementById('express-price-usd').value),
      min_days: parseInt(document.getElementById('express-min-days').value),
      max_days: parseInt(document.getElementById('express-max-days').value)
    }
  };
  localStorage.setItem('shippingOptions', JSON.stringify(shippingOptions));
  alert('Options de livraison enregistrées avec succès.');
}

// Fonctions utilitaires
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatCurrency(amount, currency) {
  const formatter = new Intl.NumberFormat(currency === 'eur' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: currency === 'eur' ? 'EUR' : 'USD'
  });
  return formatter.format(amount / 100);
}

function formatShortAddress(address) {
  return `${address.city}, ${address.country}`;
}

function getStatusLabel(status) {
  const statusLabels = {
    'pending': 'En attente',
    'processing': 'En traitement',
    'shipped': 'Expédiée',
    'delivered': 'Livrée',
    'cancelled': 'Annulée'
  };
  return statusLabels[status] || status;
}

// Fonctions globales (appelées depuis le HTML)
window.viewOrder = viewOrder;
window.handleLogin = handleLogin;
window.checkLoginStatus = checkLoginStatus;

window.editOrderStatus = function(orderId) {
  // Ouvrir la modal avec les détails de la commande pour édition
  viewOrder(orderId);
};

window.confirmDeleteOrder = function(orderId) {
  if (confirm('Êtes-vous sûr de vouloir supprimer la commande ' + orderId + ' ?')) {
    // Implémenter la suppression de commande
    alert('Fonctionnalité à implémenter: suppression de la commande ' + orderId);
  }
};

window.updateOrderStatus = function(orderId) {
  const newStatus = document.getElementById('order-status-select').value;
  const order = orders.find(o => o.id === orderId);
  
  if (order) {
    // Mise à jour locale
    order.status = newStatus;
    order.timeline.push({
      date: new Date().toISOString(),
      title: `Statut mis à jour: ${getStatusLabel(newStatus)}`,
      description: 'Mise à jour manuelle depuis le tableau de bord admin'
    });
    
    // Appel à l'API pour mettre à jour le statut
    fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
      // Fermer la modal et rafraîchir la liste
      orderModal.style.display = 'none';
      renderOrders(orders);
      loadPendingShipments();
    })
    .catch(error => {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut. Veuillez réessayer.');
    });
  }
};

window.createShippingLabelForOrder = createShippingLabelForOrder;

// Données fictives pour la démo
function getMockOrders() {
  return [
    {
      id: 'ord_123456789',
      date: '2025-05-25T14:30:00Z',
      customer: {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        phone: '+33612345678'
      },
      amount: 5589,
      currency: 'eur',
      subtotal: 4999,
      items: [
        {
          name: 'Bouteille Décorative Thousand Sunny',
          quantity: 1,
          unit_price: 4999
        }
      ],
      shipping: {
        method: 'Livraison standard',
        cost: 590,
        address: {
          line1: '123 Rue de Paris',
          line2: 'Apt 4B',
          postal_code: '75001',
          city: 'Paris',
          country: 'France'
        }
      },
      payment_status: 'paid',
      status: 'processing',
      timeline: [
        {
          date: '2025-05-25T14:30:00Z',
          title: 'Commande créée',
          description: 'La commande a été passée avec succès'
        },
        {
          date: '2025-05-25T14:31:00Z',
          title: 'Paiement reçu',
          description: 'Paiement par carte bancaire'
        },
        {
          date: '2025-05-26T09:15:00Z',
          title: 'Commande en traitement',
          description: 'Préparation de la commande en cours'
        }
      ]
    },
    {
      id: 'ord_987654321',
      date: '2025-05-24T10:15:00Z',
      customer: {
        name: 'Marie Martin',
        email: 'marie.martin@example.com',
        phone: '+33698765432'
      },
      amount: 6089,
      currency: 'eur',
      subtotal: 4999,
      items: [
        {
          name: 'Bouteille Décorative Thousand Sunny',
          quantity: 1,
          unit_price: 4999
        }
      ],
      shipping: {
        method: 'Livraison express',
        cost: 990,
        address: {
          line1: '45 Avenue Victor Hugo',
          line2: '',
          postal_code: '69002',
          city: 'Lyon',
          country: 'France'
        }
      },
      payment_status: 'paid',
      status: 'shipped',
      timeline: [
        {
          date: '2025-05-24T10:15:00Z',
          title: 'Commande créée',
          description: 'La commande a été passée avec succès'
        },
        {
          date: '2025-05-24T10:16:00Z',
          title: 'Paiement reçu',
          description: 'Paiement par carte bancaire'
        },
        {
          date: '2025-05-24T14:30:00Z',
          title: 'Commande en traitement',
          description: 'Préparation de la commande en cours'
        },
        {
          date: '2025-05-25T11:45:00Z',
          title: 'Commande expédiée',
          description: 'Numéro de suivi: 123456789ABC'
        }
      ]
    },
    {
      id: 'ord_456789123',
      date: '2025-05-23T16:45:00Z',
      customer: {
        name: 'Pierre Durand',
        email: 'pierre.durand@example.com',
        phone: ''
      },
      amount: 5589,
      currency: 'eur',
      subtotal: 4999,
      items: [
        {
          name: 'Bouteille Décorative Thousand Sunny',
          quantity: 1,
          unit_price: 4999
        }
      ],
      shipping: {
        method: 'Livraison standard',
        cost: 590,
        address: {
          line1: '8 Rue de la République',
          line2: '',
          postal_code: '13001',
          city: 'Marseille',
          country: 'France'
        }
      },
      payment_status: 'paid',
      status: 'delivered',
      timeline: [
        {
          date: '2025-05-23T16:45:00Z',
          title: 'Commande créée',
          description: 'La commande a été passée avec succès'
        },
        {
          date: '2025-05-23T16:46:00Z',
          title: 'Paiement reçu',
          description: 'Paiement par carte bancaire'
        },
        {
          date: '2025-05-23T17:30:00Z',
          title: 'Commande en traitement',
          description: 'Préparation de la commande en cours'
        },
        {
          date: '2025-05-24T10:15:00Z',
          title: 'Commande expédiée',
          description: 'Numéro de suivi: 987654321XYZ'
        },
        {
          date: '2025-05-26T14:20:00Z',
          title: 'Commande livrée',
          description: 'Livraison confirmée par le transporteur'
        }
      ]
    },
    {
      id: 'ord_741852963',
      date: '2025-05-27T09:10:00Z',
      customer: {
        name: 'Sophie Bernard',
        email: 'sophie.bernard@example.com',
        phone: '+33678912345'
      },
      amount: 5589,
      currency: 'eur',
      subtotal: 4999,
      items: [
        {
          name: 'Bouteille Décorative Thousand Sunny',
          quantity: 1,
          unit_price: 4999
        }
      ],
      shipping: {
        method: 'Livraison standard',
        cost: 590,
        address: {
          line1: '27 Rue des Fleurs',
          line2: 'Bâtiment C',
          postal_code: '33000',
          city: 'Bordeaux',
          country: 'France'
        }
      },
      payment_status: 'paid',
      status: 'pending',
      timeline: [
        {
          date: '2025-05-27T09:10:00Z',
          title: 'Commande créée',
          description: 'La commande a été passée avec succès'
        },
        {
          date: '2025-05-27T09:11:00Z',
          title: 'Paiement reçu',
          description: 'Paiement par carte bancaire'
        }
      ]
    }
  ];
}
