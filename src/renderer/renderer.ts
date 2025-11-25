// ============================================================
// RENDERER.TS - FRONTEND UNIFIÉ (SPA)
// ============================================================

// ============================================================
// ÉTAT GLOBAL - Variables partagées dans toute l'application
// ============================================================

let currentUser: any = null;

let cart: Array<{ id: number; nom: string; prix: number; quantite: number; restaurantId: number }> = [];

let selectedRestaurantId: number | null = null;

// ============================================================
// INITIALISATION - Gestion de l'interactivité des inputs
// ============================================================

// Fonction simplifiée pour garantir l'accès aux champs
function ensureInputAccess() {
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach((input: any) => {
    // Ne pas toucher aux inputs qui devraient être désactivés ou lecture seule
    // Sauf si on est sûr qu'ils ne devraient pas l'être (difficile à dire globalement)
    
    // On s'assure juste que le style permet l'interaction
    input.style.pointerEvents = 'auto';
    input.style.userSelect = 'text';
    input.style.webkitUserSelect = 'text';
    
    // Fix pour Electron: parfois le drag empêche la sélection
    input.style.webkitAppRegion = 'no-drag';
    
    // Force le focus au clic si nécessaire
    if (!input.dataset.clickAttached) {
      input.addEventListener('click', (e: any) => {
        e.stopPropagation();
        input.focus();
      });
      input.dataset.clickAttached = 'true';
    }
  });
  
  // S'assurer que les conteneurs de modales ne sont pas draggable
  const modals = document.querySelectorAll('#restaurant-modal, #menu-modal, #restaurant-modal > div, #menu-modal > div');
  modals.forEach((modal: any) => {
    modal.style.webkitAppRegion = 'no-drag';
  });
}

// Observer les changements du DOM pour appliquer le fix aux nouveaux éléments (comme les modales)
const observer = new MutationObserver(() => {
  ensureInputAccess();
});

// Rétrocompatibilité pour les appels existants
(window as any).forceInputInteractivity = ensureInputAccess;
function forceInputInteractivity() {
  ensureInputAccess();
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    ensureInputAccess();
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
  
  // Réappliquer au focus pour être sûr
  window.addEventListener('focus', () => {
    ensureInputAccess();
  }, true);
}

// ============================================================
// NAVIGATION - Gestion de l'affichage des vues (SPA)
// ============================================================

/**
 * Cache toutes les vues et affiche uniquement celle spécifiée
 */
function showView(viewId: string) {
  const allViews = document.querySelectorAll('.view');
  allViews.forEach(view => {
    (view as HTMLElement).style.display = 'none';
  });
  
  // Afficher la vue demandée
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.style.display = 'block';
  }
}

/**
 * Affiche la barre de navigation et configure les boutons selon les rôles
 */
function showNavBar() {
  const navBar = document.getElementById('nav-bar');
  if (!navBar) return;
  
  navBar.style.display = 'block';
  
  // Afficher le message de bienvenue
  const welcomeSpan = document.getElementById('nav-welcome');
  if (welcomeSpan && currentUser) {
    welcomeSpan.textContent = `Bienvenue, ${currentUser.prenom} !`;
  }
  
  // Afficher les boutons selon les rôles
  const roles = currentUser?.roles || [];
  
  // Bouton "Mes Commandes" pour tous les clients
  const navCommandes = document.getElementById('nav-commandes');
  if (navCommandes && roles.includes('Client')) {
    navCommandes.style.display = 'inline-block';
  }
  
  // Bouton "Cuisinier"
  const navCook = document.getElementById('nav-cook');
  if (navCook && roles.includes('Cuisinier')) {
    navCook.style.display = 'inline-block';
  }
  
  // Bouton "Livreur"
  const navLivreur = document.getElementById('nav-livreur');
  if (navLivreur && roles.includes('Livreur')) {
    navLivreur.style.display = 'inline-block';
  }
  
  // Bouton "Admin"
  const navAdmin = document.getElementById('nav-admin');
  if (navAdmin && roles.includes('Admin')) {
    navAdmin.style.display = 'inline-block';
  }
}

/**
 * Cache la barre de navigation
 */
function hideNavBar() {
  const navBar = document.getElementById('nav-bar');
  if (navBar) {
    navBar.style.display = 'none';
  }
}

// ============================================================
// AUTHENTIFICATION - Connexion et Inscription
// ============================================================

/**
 * Gère la connexion d'un utilisateur
 */
async function handleLogin() {
  const emailInput = document.getElementById('login-email') as HTMLInputElement;
  const passwordInput = document.getElementById('login-password') as HTMLInputElement;
  
  if (!emailInput || !passwordInput) return;
  
  forceInputInteractivity();
  
  const email = emailInput.value.trim();
  const mot_de_passe = passwordInput.value.trim();
  
  if (!email || !mot_de_passe) {
    alert('Veuillez remplir tous les champs.');
    setTimeout(() => {
      forceInputInteractivity();
      emailInput.focus();
    }, 50);
    return;
  }
  
  const result = await (window as any).auth.login({ email, mot_de_passe });
  
  if (result.success) {
    currentUser = result.user;
    
    hideNavBar();
    showNavBar();
    showView('view-restaurants');
    loadRestaurants();
  } else {
    alert(result.message || 'Erreur de connexion');
    setTimeout(() => {
      forceInputInteractivity();
      passwordInput.value = '';
      emailInput.select();
      emailInput.focus();
    }, 50);
  }
}

/**
 * Gère l'inscription d'un nouvel utilisateur
 */
async function handleRegister() {
  const prenomInput = document.getElementById('register-prenom') as HTMLInputElement;
  const nomInput = document.getElementById('register-nom') as HTMLInputElement;
  const emailInput = document.getElementById('register-email') as HTMLInputElement;
  const passwordInput = document.getElementById('register-password') as HTMLInputElement;
  
  if (!prenomInput || !nomInput || !emailInput || !passwordInput) return;
  
  forceInputInteractivity();
  
  const prenom = prenomInput.value.trim();
  const nom = nomInput.value.trim();
  const email = emailInput.value.trim();
  const mot_de_passe = passwordInput.value.trim();
  
  if (!prenom || !nom || !email || !mot_de_passe) {
    alert('Veuillez remplir tous les champs.');
    setTimeout(() => {
      forceInputInteractivity();
      if (!prenom) prenomInput.focus();
      else if (!nom) nomInput.focus();
      else if (!email) emailInput.focus();
      else passwordInput.focus();
    }, 50);
    return;
  }
  
  const result = await (window as any).auth.register({ prenom, nom, email, mot_de_passe });
  
  if (result.success) {
    alert('Compte créé ! Vous pouvez maintenant vous connecter.');
    toggleLoginRegister(true);
    setTimeout(() => {
      forceInputInteractivity();
      const loginEmailInput = document.getElementById('login-email') as HTMLInputElement;
      if (loginEmailInput) {
        loginEmailInput.value = email;
        const loginPasswordInput = document.getElementById('login-password') as HTMLInputElement;
        if (loginPasswordInput) loginPasswordInput.focus();
      }
    }, 50);
  } else {
    alert(result.message || 'Erreur lors de l\'inscription');
    setTimeout(() => {
      forceInputInteractivity();
      emailInput.select();
      emailInput.focus();
    }, 50);
  }
}

/**
 * Basculer entre formulaire de connexion et inscription
 */
function toggleLoginRegister(showLogin: boolean) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  if (loginForm && registerForm) {
    loginForm.style.display = showLogin ? 'block' : 'none';
    registerForm.style.display = showLogin ? 'none' : 'block';
    
    const loginEmail = document.getElementById('login-email') as HTMLInputElement;
    const loginPassword = document.getElementById('login-password') as HTMLInputElement;
    const registerPrenom = document.getElementById('register-prenom') as HTMLInputElement;
    const registerNom = document.getElementById('register-nom') as HTMLInputElement;
    const registerEmail = document.getElementById('register-email') as HTMLInputElement;
    const registerPassword = document.getElementById('register-password') as HTMLInputElement;
    
    if (showLogin) {
      if (loginEmail) {
        loginEmail.value = '';
        loginEmail.removeAttribute('readonly');
        loginEmail.removeAttribute('disabled');
      }
      if (loginPassword) {
        loginPassword.value = '';
        loginPassword.removeAttribute('readonly');
        loginPassword.removeAttribute('disabled');
      }
      setTimeout(() => {
        forceInputInteractivity();
        loginEmail?.focus();
      }, 100);
    } else {
      if (registerPrenom) {
        registerPrenom.value = '';
        registerPrenom.removeAttribute('readonly');
        registerPrenom.removeAttribute('disabled');
      }
      if (registerNom) {
        registerNom.value = '';
        registerNom.removeAttribute('readonly');
        registerNom.removeAttribute('disabled');
      }
      if (registerEmail) {
        registerEmail.value = '';
        registerEmail.removeAttribute('readonly');
        registerEmail.removeAttribute('disabled');
      }
      if (registerPassword) {
        registerPassword.value = '';
        registerPassword.removeAttribute('readonly');
        registerPassword.removeAttribute('disabled');
      }
      setTimeout(() => {
        forceInputInteractivity();
        registerPrenom?.focus();
      }, 100);
    }
  }
}

/**
 * Déconnexion de l'utilisateur
 */
function handleLogout() {
  currentUser = null;
  cart = [];
  selectedRestaurantId = null;
  
  hideNavBar();
  showView('view-login');
  
  // Réinitialiser le formulaire de connexion
  toggleLoginRegister(true);
}

// ============================================================
// RESTAURANTS - Affichage et sélection de produits
// ============================================================

/**
 * Charge et affiche tous les restaurants avec leurs menus
 */
async function loadRestaurants() {
  const listDiv = document.getElementById('restaurants-list');
  if (!listDiv) return;
  
  listDiv.innerHTML = '<p>Chargement des restaurants...</p>';
  
  // Récupérer les restaurants depuis le backend
  const restaurants = await (window as any).api.getAllRestaurants();
  
  if (!restaurants || restaurants.length === 0) {
    listDiv.innerHTML = '<p>Aucun restaurant disponible.</p>';
    return;
  }
  
  // Afficher chaque restaurant
  listDiv.innerHTML = restaurants.map((resto: any) => {
    const sectionsHtml = (resto.sections || []).map((section: any) => {
      const produitsHtml = (section.produits || []).map((produit: any) => `
        <div style="border:1px solid #ddd; padding:0.5rem; margin:0.5rem 0; border-radius:4px;">
          <strong>${produit.nom}</strong> - ${produit.prix}€
          ${produit.description ? `<br><small>${produit.description}</small>` : ''}
          <button class="btn-small add-to-cart" 
                  data-id="${produit.id}" 
                  data-nom="${produit.nom}" 
                  data-prix="${produit.prix}"
                  data-restaurant="${resto.id}">
            Ajouter au panier
          </button>
        </div>
      `).join('');
      
      return `
        <div style="margin:1rem 0;">
          <h4>${section.nom}</h4>
          ${section.description ? `<p style="color:#666;">${section.description}</p>` : ''}
          ${produitsHtml}
        </div>
      `;
    }).join('');
    
    return `
      <div style="border:2px solid #4CAF50; padding:1.5rem; margin:1rem 0; border-radius:8px;">
        <h2>${resto.nom}</h2>
        <p>📍 ${resto.adresse || 'Adresse non disponible'}</p>
        <p>📞 ${resto.telephone || 'Téléphone non disponible'}</p>
        ${sectionsHtml}
      </div>
    `;
  }).join('');
  
  // Attacher les événements aux boutons "Ajouter au panier"
  attachAddToCartEvents();
}

/**
 * Attache les événements aux boutons "Ajouter au panier"
 */
function attachAddToCartEvents() {
  const buttons = document.querySelectorAll('.add-to-cart');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const id = Number(target.dataset.id);
      const nom = target.dataset.nom || '';
      const prix = Number(target.dataset.prix);
      const restaurantId = Number(target.dataset.restaurant);
      
      addToCart(id, nom, prix, restaurantId);
    });
  });
}

/**
 * Ajoute un produit au panier
 */
function addToCart(id: number, nom: string, prix: number, restaurantId: number) {
  // Vérifier que tous les produits viennent du même restaurant
  if (selectedRestaurantId !== null && selectedRestaurantId !== restaurantId) {
    alert('Vous ne pouvez commander que dans un seul restaurant à la fois. Videz votre panier d\'abord.');
    return;
  }
  
  selectedRestaurantId = restaurantId;
  
  // Vérifier si le produit est déjà dans le panier
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantite += 1;
  } else {
    cart.push({ id, nom, prix, quantite: 1, restaurantId });
  }
  
  updateCartDisplay();
}

/**
 * Met à jour l'affichage du panier
 */
function updateCartDisplay() {
  const cartSection = document.getElementById('cart-section');
  const cartItems = document.getElementById('cart-items');
  
  if (!cartSection || !cartItems) return;
  
  if (cart.length === 0) {
    cartSection.style.display = 'none';
    return;
  }
  
  cartSection.style.display = 'block';
  
  const total = cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
  
  cartItems.innerHTML = cart.map(item => `
    <div style="display:flex; justify-content:space-between; margin:0.5rem 0;">
      <span>${item.nom} x${item.quantite}</span>
      <span>${(item.prix * item.quantite).toFixed(2)}€</span>
    </div>
  `).join('') + `
    <hr>
    <div style="display:flex; justify-content:space-between; font-weight:bold;">
      <span>Total</span>
      <span>${total.toFixed(2)}€</span>
    </div>
  `;
}

/**
 * Valide la commande
 */
async function validateCart() {
  if (cart.length === 0 || !selectedRestaurantId || !currentUser) {
    alert('Votre panier est vide.');
    return;
  }
  
  const payload = {
    id_restaurant: selectedRestaurantId,
    produits: cart.map(item => ({ id: item.id, quantite: item.quantite })),
  };
  
  const result = await (window as any).api.createCommande(currentUser.id, payload);
  
  if (result.success) {
    alert('Commande passée avec succès !');
    // Vider le panier
    cart = [];
    selectedRestaurantId = null;
    updateCartDisplay();
  } else {
    alert('Erreur lors de la commande : ' + (result.error || ''));
  }
}

// ============================================================
// COMMANDES (CLIENT) - Consultation des commandes
// ============================================================

/**
 * Charge et affiche les commandes du client
 */
async function loadClientCommandes() {
  if (!currentUser) return;
  
  const listDiv = document.getElementById('commandes-list');
  if (!listDiv) return;
  
  listDiv.innerHTML = '<p>Chargement...</p>';
  
  const commandes = await (window as any).api.getCommandesForClient(currentUser.id);
  
  if (!commandes || commandes.length === 0) {
    listDiv.innerHTML = '<p>Aucune commande.</p>';
    return;
  }
  
  listDiv.innerHTML = commandes.map((cmd: any) => {
    const detailsHtml = (cmd.details || []).map((d: any) => 
      `<li>${d.produit?.nom || 'Produit'} x${d.quantite} - ${d.prix_unitaire}€</li>`
    ).join('');
    
    return `
      <div style="border:1px solid #ddd; padding:1rem; margin:1rem 0; border-radius:8px;">
        <h3>Commande #${cmd.id}</h3>
        <p><strong>Restaurant:</strong> ${cmd.restaurant?.nom || 'N/A'}</p>
        <p><strong>Date:</strong> ${new Date(cmd.date).toLocaleString()}</p>
        <p><strong>Statut:</strong> <span style="color:${getStatusColor(cmd.statut)}">${cmd.statut}</span></p>
        <ul>${detailsHtml}</ul>
        ${cmd.livraison ? `<p>📦 Livraison: ${cmd.livraison.statut}</p>` : ''}
      </div>
    `;
  }).join('');
}

// ============================================================
// CUISINIER - Gestion des commandes à préparer
// ============================================================

/**
 * Charge les restaurants du cuisinier
 */
async function loadCookRestaurants() {
  if (!currentUser) return;
  
  const div = document.getElementById('cook-restaurants');
  if (!div) return;
  
  const restos = await (window as any).api.getRestaurantsForCook(currentUser.id);
  
  if (!restos || restos.length === 0) {
    div.innerHTML = '<p>Aucun restaurant attribué. Contactez l\'administrateur.</p>';
    return;
  }
  
  div.innerHTML = restos.map((r: any) => `
    <div style="border:1px solid #ddd; padding:1rem; margin:0.5rem 0; border-radius:4px;">
      <strong>${r.nom}</strong><br>
      📍 ${r.adresse || 'N/A'}<br>
      📞 ${r.telephone || 'N/A'}
    </div>
  `).join('');
}

/**
 * Charge les commandes à préparer (cuisinier)
 */
async function loadCookCommandes() {
  if (!currentUser) return;
  
  const div = document.getElementById('cook-commandes');
  if (!div) return;
  
  div.innerHTML = '<p>Chargement...</p>';
  
  const commandes = await (window as any).api.getCommandesForCook(currentUser.id);
  
  if (!commandes || commandes.length === 0) {
    div.innerHTML = '<p>Aucune commande.</p>';
    return;
  }
  
  div.innerHTML = commandes.map((cmd: any) => {
    const detailsHtml = (cmd.details || []).map((d: any) => 
      `<li>${d.produit?.nom || 'Produit'} x${d.quantite}</li>`
    ).join('');
    
    return `
      <div style="border:1px solid #ddd; padding:1rem; margin:1rem 0; border-radius:8px;">
        <h3>Commande #${cmd.id}</h3>
        <p><strong>Client:</strong> ${cmd.client?.prenom || ''} ${cmd.client?.nom || ''}</p>
        <p><strong>Date:</strong> ${new Date(cmd.date).toLocaleString()}</p>
        <p><strong>Statut:</strong> ${cmd.statut}</p>
        <ul>${detailsHtml}</ul>
        <select class="cook-status-select" data-id="${cmd.id}">
          <option value="En attente" ${cmd.statut === 'En attente' ? 'selected' : ''}>En attente</option>
          <option value="En préparation" ${cmd.statut === 'En préparation' ? 'selected' : ''}>En préparation</option>
          <option value="Prête" ${cmd.statut === 'Prête' ? 'selected' : ''}>Prête</option>
        </select>
        <button class="btn-small cook-update-status" data-id="${cmd.id}">Mettre à jour</button>
      </div>
    `;
  }).join('');
  
  // Attacher les événements
  attachCookStatusEvents();
}

/**
 * Attache les événements aux boutons de mise à jour de statut (cuisinier)
 */
function attachCookStatusEvents() {
  const buttons = document.querySelectorAll('.cook-update-status');
  buttons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.target as HTMLButtonElement;
      const commandeId = Number(target.dataset.id);
      const select = document.querySelector(`.cook-status-select[data-id="${commandeId}"]`) as HTMLSelectElement;
      
      if (!select) return;
      
      const newStatus = select.value;
      
      const result = await (window as any).api.updateCommandeStatus(currentUser.id, commandeId, newStatus);
      
      if (result.success) {
        alert('Statut mis à jour !');
        loadCookCommandes(); // Recharger
      } else {
        alert('Erreur : ' + (result.error || ''));
      }
    });
  });
}

// ============================================================
// LIVREUR - Gestion des livraisons
// ============================================================

/**
 * Charge les livraisons du livreur
 */
async function loadLivreurLivraisons() {
  if (!currentUser) return;
  
  const div = document.getElementById('livreur-livraisons');
  if (!div) return;
  
  div.innerHTML = '<p>Chargement...</p>';
  
  // Si admin, récupérer toutes les livraisons (sans userId), sinon uniquement celles du livreur
  const isAdmin = currentUser.roles && currentUser.roles.includes('Admin');
  const livraisons = await (window as any).api.getLivraisonsForLivreur(isAdmin ? null : currentUser.id);
  
  if (!livraisons || livraisons.length === 0) {
    div.innerHTML = '<p>Aucune livraison.</p>';
    return;
  }
  
  div.innerHTML = livraisons.map((liv: any) => `
    <div style="border:1px solid #ddd; padding:1rem; margin:1rem 0; border-radius:8px;">
      <h3>Livraison #${liv.id}</h3>
      <p><strong>Commande:</strong> #${liv.commandeId}</p>
      ${isAdmin && liv.livreur ? `<p><strong>Livreur:</strong> ${liv.livreur.prenom} ${liv.livreur.nom} (${liv.livreur.email})</p>` : ''}
      <p><strong>Restaurant:</strong> ${liv.commande?.restaurant?.nom || 'N/A'}</p>
      <p><strong>Adresse livraison:</strong> ${liv.commande?.restaurant?.adresse || 'N/A'}</p>
      <p><strong>Client:</strong> ${liv.commande?.client?.prenom || ''} ${liv.commande?.client?.nom || ''}</p>
      <p><strong>Statut:</strong> <span style="background:${getStatusColor(liv.statut)}; color:white; padding:0.3rem 0.8rem; border-radius:15px; font-weight:600;">${liv.statut}</span></p>
      ${!isAdmin ? `
        <select class="livreur-status-select" data-id="${liv.id}">
          <option value="Acceptée" ${liv.statut === 'Acceptée' ? 'selected' : ''}>Acceptée</option>
          <option value="En cours" ${liv.statut === 'En cours' ? 'selected' : ''}>En cours</option>
          <option value="Livrée" ${liv.statut === 'Livrée' ? 'selected' : ''}>Livrée</option>
        </select>
        <button class="btn-small livreur-update-status" data-id="${liv.id}">Mettre à jour</button>
      ` : ''}
    </div>
  `).join('');
  
  // Attacher les événements seulement si pas admin
  if (!isAdmin) {
    attachLivreurStatusEvents();
  }
}

/**
 * Charge les commandes disponibles pour livraison
 */
async function loadLivreurAvailableCommandes() {
  const div = document.getElementById('livreur-available');
  if (!div) return;
  
  div.innerHTML = '<p>Chargement...</p>';
  
  const commandes = await (window as any).api.getAvailableCommandes();
  
  if (!commandes || commandes.length === 0) {
    div.innerHTML = '<p>Aucune commande disponible.</p>';
    return;
  }
  
  div.innerHTML = commandes.map((cmd: any) => {
    const detailsHtml = (cmd.details || []).map((d: any) => 
      `<li>${d.produit?.nom || 'Produit'} x${d.quantite}</li>`
    ).join('');
    
    return `
      <div style="border:1px solid #ddd; padding:1rem; margin:1rem 0; border-radius:8px;">
        <h3>Commande #${cmd.id}</h3>
        <p><strong>Restaurant:</strong> ${cmd.restaurant?.nom || 'N/A'}</p>
        <p><strong>Adresse:</strong> ${cmd.restaurant?.adresse || 'N/A'}</p>
        <p><strong>Client:</strong> ${cmd.client?.prenom || ''}</p>
        <ul>${detailsHtml}</ul>
        <button class="btn livreur-accept" data-id="${cmd.id}">Accepter la livraison</button>
      </div>
    `;
  }).join('');
  
  // Attacher les événements
  attachLivreurAcceptEvents();
}

/**
 * Attache les événements aux boutons de mise à jour de statut (livreur)
 */
function attachLivreurStatusEvents() {
  const buttons = document.querySelectorAll('.livreur-update-status');
  buttons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.target as HTMLButtonElement;
      const livraisonId = Number(target.dataset.id);
      const select = document.querySelector(`.livreur-status-select[data-id="${livraisonId}"]`) as HTMLSelectElement;
      
      if (!select) return;
      
      const newStatus = select.value;
      
      const result = await (window as any).api.updateLivraisonStatus(currentUser.id, livraisonId, newStatus);
      
      if (result.success) {
        alert('Statut mis à jour !');
        loadLivreurLivraisons(); // Recharger
      } else {
        alert('Erreur : ' + (result.error || ''));
      }
    });
  });
}

/**
 * Attache les événements aux boutons "Accepter la livraison"
 */
function attachLivreurAcceptEvents() {
  const buttons = document.querySelectorAll('.livreur-accept');
  buttons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.target as HTMLButtonElement;
      const commandeId = Number(target.dataset.id);
      
      const result = await (window as any).api.createLivraison(currentUser.id, commandeId);
      
      if (result.success) {
        alert('Livraison acceptée !');
        loadLivreurLivraisons();
        loadLivreurAvailableCommandes();
      } else {
        alert('Erreur : ' + (result.error || ''));
      }
    });
  });
}

// ============================================================
// ADMIN - Gestion des utilisateurs et rôles
// ============================================================

let currentAdminFilter = 'all';
let allUsersData: any[] = [];
let allRolesData: any[] = [];
let allRestaurantsData: any[] = [];

/**
 * Charge l'interface admin (utilisateurs, rôles, attachements)
 */
async function loadAdmin() {
  const div = document.getElementById('admin-users');
  if (!div) return;
  
  div.innerHTML = '<p style="text-align:center; padding:2rem; color:#999;">⏳ Chargement...</p>';
  
  const [users, roles, restaurants] = await Promise.all([
    (window as any).api.getUsers(),
    (window as any).api.getRoles(),
    (window as any).api.getAllRestaurants(),
  ]);
  
  allUsersData = users;
  allRolesData = roles;
  allRestaurantsData = restaurants;
  
  // Mise à jour des statistiques
  const statUsers = document.getElementById('stat-users');
  const statRestaurants = document.getElementById('stat-restaurants');
  const statCooks = document.getElementById('stat-cooks');
  const statDrivers = document.getElementById('stat-drivers');
  
  if (statUsers) statUsers.textContent = users.length.toString();
  if (statRestaurants) statRestaurants.textContent = restaurants.length.toString();
  if (statCooks) statCooks.textContent = users.filter((u: any) => (u.roles || []).includes('Cuisinier')).length.toString();
  if (statDrivers) statDrivers.textContent = users.filter((u: any) => (u.roles || []).includes('Livreur')).length.toString();
  
  // Attacher les événements de filtrage
  attachRoleFilterEvents();
  
  // Afficher les utilisateurs
  renderAdminUsers(currentAdminFilter);
  
  // Remplir les selects pour attachement/détachement
  populateAdminSelects(allUsersData, allRestaurantsData);
}

/**
 * Affiche les utilisateurs filtrés par rôle
 */
function renderAdminUsers(filter: string) {
  const div = document.getElementById('admin-users');
  if (!div) return;
  
  let filteredUsers = allUsersData;
  
  if (filter !== 'all') {
    filteredUsers = allUsersData.filter((u: any) => (u.roles || []).includes(filter));
  }
  
  if (filteredUsers.length === 0) {
    div.innerHTML = '<p style="text-align:center; padding:2rem; color:#999;">Aucun utilisateur trouvé pour ce filtre.</p>';
    return;
  }
  
  // Afficher les utilisateurs avec leurs rôles
  div.innerHTML = filteredUsers.map((u: any) => {
    const initiales = (u.prenom[0] || '') + (u.nom ? u.nom[0] : '');
    
    const roleButtons = allRolesData.map((r: any) => {
      const hasRole = (u.roles || []).includes(r.nom);
      const activeClass = hasRole ? 'role-btn-active' : '';
      const roleEmoji = {
        'Client': '🛒',
        'Livreur': '🚚',
        'Restaurant': '🏪',
        'Cuisinier': '👨‍🍳',
        'Admin': '⚙️'
      }[r.nom] || '📋';
      
      return `
        <button class="role-btn ${activeClass}" data-user="${u.id}" data-role="${r.nom}" data-active="${hasRole}">
          ${roleEmoji} ${r.nom}
        </button>
      `;
    }).join('');
    
    return `
      <div class="admin-user-card">
        <div class="admin-user-avatar">${initiales.toUpperCase()}</div>
        <div class="admin-user-info">
          <div class="admin-user-name">${u.prenom} ${u.nom || ''}</div>
          <div class="admin-user-email">${u.email}</div>
          <div class="admin-user-roles">
            ${roleButtons}
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Attacher les événements aux boutons
  attachAdminRoleEvents();
}

/**
 * Attache les événements aux filtres de rôle
 */
function attachRoleFilterEvents() {
  const filterButtons = document.querySelectorAll('.role-filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const filter = target.dataset.filter || 'all';
      
      // Mettre à jour l'état actif
      filterButtons.forEach(b => b.classList.remove('active'));
      target.classList.add('active');
      
      // Mettre à jour le filtre et réafficher
      currentAdminFilter = filter;
      renderAdminUsers(filter);
    });
  });
}

/**
 * Attache les événements aux boutons de rôles
 */
function attachAdminRoleEvents() {
  const buttons = document.querySelectorAll('.role-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.target as HTMLButtonElement;
      const userId = Number(target.dataset.user);
      const roleName = target.dataset.role || '';
      const isActive = target.dataset.active === 'true';
      
      // Toggle le rôle
      const newActiveState = !isActive;
      
      // Récupérer tous les rôles actuels pour cet utilisateur
      const userButtons = document.querySelectorAll(`.role-btn[data-user="${userId}"]`);
      const selectedRoles: string[] = [];
      
      userButtons.forEach(ub => {
        const ubtn = ub as HTMLButtonElement;
        if (ubtn.dataset.role === roleName) {
          // Toggle ce rôle
          if (newActiveState) {
            selectedRoles.push(roleName);
            ubtn.classList.add('role-btn-active');
            ubtn.dataset.active = 'true';
          } else {
            ubtn.classList.remove('role-btn-active');
            ubtn.dataset.active = 'false';
          }
        } else if (ubtn.dataset.active === 'true') {
          // Garder les autres rôles actifs
          selectedRoles.push(ubtn.dataset.role || '');
        }
      });
      
      const result = await (window as any).api.setRoles(userId, selectedRoles);
      
      if (!result || !result.success) {
        alert('Erreur lors de la mise à jour des rôles');
        // Revert l'état visuel
        if (newActiveState) {
          target.classList.remove('role-btn-active');
          target.dataset.active = 'false';
        } else {
          target.classList.add('role-btn-active');
          target.dataset.active = 'true';
        }
      }
    });
  });
}

/**
 * Remplit les selects d'attachement/détachement
 */
function populateAdminSelects(users: any[], restaurants: any[]) {
  const attachUserSelect = document.getElementById('admin-attach-user') as HTMLSelectElement;
  const attachRestoSelect = document.getElementById('admin-attach-restaurant') as HTMLSelectElement;
  const detachUserSelect = document.getElementById('admin-detach-user') as HTMLSelectElement;
  const detachRestoSelect = document.getElementById('admin-detach-restaurant') as HTMLSelectElement;
  
  if (!attachUserSelect || !attachRestoSelect || !detachUserSelect || !detachRestoSelect) return;
  
  // Filtrer les cuisiniers
  const cooks = users.filter((u: any) => (u.roles || []).includes('Cuisinier'));
  
  const cooksOptions = cooks.map((u: any) => 
    `<option value="${u.id}">${u.prenom} ${u.nom || ''} (${u.email})</option>`
  ).join('');
  
  const restosOptions = restaurants.map((r: any) => 
    `<option value="${r.id}">${r.nom}</option>`
  ).join('');
  
  attachUserSelect.innerHTML = cooksOptions;
  attachRestoSelect.innerHTML = restosOptions;
  detachUserSelect.innerHTML = cooksOptions;
  detachRestoSelect.innerHTML = restosOptions;
}

/**
 * Rattacher un cuisinier à un restaurant
 */
async function handleAttachStaff() {
  const userSelect = document.getElementById('admin-attach-user') as HTMLSelectElement;
  const restoSelect = document.getElementById('admin-attach-restaurant') as HTMLSelectElement;
  
  if (!userSelect || !restoSelect) return;
  
  const userId = Number(userSelect.value);
  const restoId = Number(restoSelect.value);
  
  const result = await (window as any).api.addStaffToRestaurant(userId, restoId);
  
  if (result.success) {
    alert('Cuisinier rattaché avec succès !');
  } else {
    alert('Erreur : ' + (result.error || ''));
  }
}

/**
 * Détacher un cuisinier d'un restaurant
 */
async function handleDetachStaff() {
  const userSelect = document.getElementById('admin-detach-user') as HTMLSelectElement;
  const restoSelect = document.getElementById('admin-detach-restaurant') as HTMLSelectElement;
  
  if (!userSelect || !restoSelect) return;
  
  const userId = Number(userSelect.value);
  const restoId = Number(restoSelect.value);
  
  const result = await (window as any).api.removeStaffFromRestaurant(userId, restoId);
  
  if (result.success) {
    alert('Cuisinier détaché avec succès !');
  } else {
    alert('Erreur : ' + (result.error || ''));
  }
}

/**
 * Charger toutes les commandes (admin)
 */
async function loadAdminCommandes() {
  const div = document.getElementById('admin-commandes-list');
  if (!div) {
    console.error('admin-commandes-list non trouvé');
    return;
  }
  
  div.innerHTML = '<p style="text-align:center; padding:2rem; color:#999;">⏳ Chargement...</p>';
  
  try {
    const commandes = await (window as any).api.getAllCommandes();
    console.log('Commandes chargées:', commandes);
    
    if (!commandes || commandes.length === 0) {
      div.innerHTML = '<p style="text-align:center; padding:2rem; color:#999;">Aucune commande trouvée.</p>';
      return;
    }
    
    div.innerHTML = commandes.map((c: any) => {
      const lignesHtml = c.lignes.map((l: any) => 
        `<div style="margin:0.3rem 0;">• ${l.produit} x${l.quantite} - ${l.prix.toFixed(2)}€</div>`
      ).join('');
      
      return `
        <div class="admin-user-card" style="grid-template-columns: 1fr; margin-bottom:1rem;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:1rem;">
              <div>
                <div style="font-weight:700; font-size:1.1rem; color:var(--dark);">Commande #${c.id}</div>
                <div style="color:var(--secondary); font-size:0.9rem;">${new Date(c.date).toLocaleString('fr-FR')}</div>
              </div>
              <div style="background:${getStatusColor(c.statut)}; color:white; padding:0.4rem 0.8rem; border-radius:20px; font-weight:600; font-size:0.85rem;">
                ${c.statut}
              </div>
            </div>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; margin-bottom:1rem;">
              <div>
                <div style="font-weight:600; color:var(--secondary); font-size:0.85rem;">CLIENT</div>
                <div style="font-weight:600;">${c.client}</div>
                <div style="font-size:0.85rem; color:var(--secondary);">${c.clientEmail}</div>
              </div>
              <div>
                <div style="font-weight:600; color:var(--secondary); font-size:0.85rem;">RESTAURANT</div>
                <div style="font-weight:600;">${c.restaurant}</div>
              </div>
              <div>
                <div style="font-weight:600; color:var(--secondary); font-size:0.85rem;">LIVREUR</div>
                <div style="font-weight:600;">${c.livreur}</div>
              </div>
            </div>
          
          <div style="background:var(--light); padding:1rem; border-radius:var(--radius); margin-bottom:1rem;">
            <div style="font-weight:600; margin-bottom:0.5rem;">Articles commandés:</div>
            ${lignesHtml}
          </div>
          
          <div style="text-align:right; font-size:1.2rem; font-weight:700; color:var(--primary);">
            Total: ${c.total.toFixed(2)}€
          </div>
        </div>
      </div>
    `;
    }).join('');
  } catch (err) {
    console.error('Erreur lors du chargement des commandes admin:', err);
    div.innerHTML = '<p style="text-align:center; padding:2rem; color:#dc3545;">❌ Erreur lors du chargement des commandes</p>';
  }
}

/**
 * Charger tous les restaurants (admin)
 */
async function loadAdminRestaurants() {
  const div = document.getElementById('admin-restaurants-list');
  if (!div) return;
  
  div.innerHTML = '<p style="text-align:center; padding:2rem; color:#999;">⏳ Chargement...</p>';
  
  const restaurants = await (window as any).api.getAllRestaurants();
  
  if (restaurants.length === 0) {
    div.innerHTML = '<p style="text-align:center; padding:2rem; color:#999;">Aucun restaurant trouvé.</p>';
    return;
  }
  
  div.innerHTML = restaurants.map((r: any) => {
    const sectionCount = r.sections?.length || 0;
    const produitCount = r.sections?.reduce((sum: number, s: any) => sum + (s.produits?.length || 0), 0) || 0;
    
    return `
      <div class="admin-user-card" style="grid-template-columns: auto 1fr auto;">
        <div style="font-size:3rem;">🏪</div>
        <div>
          <div style="font-weight:700; font-size:1.2rem; color:var(--dark); margin-bottom:0.5rem;">${r.nom}</div>
          <div style="color:var(--secondary); margin-bottom:0.3rem;">📍 ${r.adresse}</div>
          <div style="color:var(--secondary); margin-bottom:0.3rem;">📞 ${r.telephone}</div>
          <div style="color:var(--primary); font-weight:600; font-size:0.9rem;">📋 ${sectionCount} section(s) • ${produitCount} produit(s)</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.5rem; align-items:stretch;">
          <button class="btn btn-sm btn-primary" onclick="manageRestaurantMenu(${r.id}, '${r.nom.replace(/'/g, "\\'")}')">📋 Gérer le menu</button>
          <button class="btn btn-sm" onclick="editRestaurant(${r.id})">✏️ Modifier</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRestaurant(${r.id}, '${r.nom.replace(/'/g, "\\'")}')">🗑️ Supprimer</button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Modal pour ajouter un restaurant
 */
function showAddRestaurantModal() {
  const modal = document.getElementById('restaurant-modal');
  const title = document.getElementById('restaurant-modal-title');
  const nomInput = document.getElementById('restaurant-nom') as HTMLInputElement;
  const adresseInput = document.getElementById('restaurant-adresse') as HTMLInputElement;
  const telephoneInput = document.getElementById('restaurant-telephone') as HTMLInputElement;
  
  if (!modal || !title || !nomInput || !adresseInput || !telephoneInput) return;
  
  title.textContent = 'Nouveau restaurant';
  nomInput.value = '';
  adresseInput.value = '';
  telephoneInput.value = '';
  
  modal.style.display = 'flex';
  
  // Gérer la sauvegarde
  const saveBtn = document.getElementById('restaurant-modal-save');
  const cancelBtn = document.getElementById('restaurant-modal-cancel');
  
  const handleSave = async () => {
    const nom = nomInput.value.trim();
    const adresse = adresseInput.value.trim();
    const telephone = telephoneInput.value.trim();
    
    if (!nom || !adresse || !telephone) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    const result = await (window as any).api.adminCreateRestaurant({ nom, adresse, telephone });
    
    if (result.success) {
      alert('Restaurant créé avec succès !');
      modal.style.display = 'none';
      loadAdminRestaurants();
      loadAdmin();
    } else {
      alert('Erreur : ' + (result.error || ''));
    }
    
    cleanup();
  };
  
  const handleCancel = () => {
    modal.style.display = 'none';
    cleanup();
  };
  
  const cleanup = () => {
    saveBtn?.removeEventListener('click', handleSave);
    cancelBtn?.removeEventListener('click', handleCancel);
  };
  
  saveBtn?.addEventListener('click', handleSave);
  cancelBtn?.addEventListener('click', handleCancel);
}

/**
 * Modifier un restaurant
 */
(window as any).editRestaurant = async function(restaurantId: number) {
  const restaurants = await (window as any).api.getAllRestaurants();
  const resto = restaurants.find((r: any) => r.id === restaurantId);
  if (!resto) return;
  
  const modal = document.getElementById('restaurant-modal');
  const title = document.getElementById('restaurant-modal-title');
  const nomInput = document.getElementById('restaurant-nom') as HTMLInputElement;
  const adresseInput = document.getElementById('restaurant-adresse') as HTMLInputElement;
  const telephoneInput = document.getElementById('restaurant-telephone') as HTMLInputElement;
  
  if (!modal || !title || !nomInput || !adresseInput || !telephoneInput) return;
  
  title.textContent = 'Modifier le restaurant';
  nomInput.value = resto.nom;
  adresseInput.value = resto.adresse;
  telephoneInput.value = resto.telephone;
  
  modal.style.display = 'flex';
  
  const saveBtn = document.getElementById('restaurant-modal-save');
  const cancelBtn = document.getElementById('restaurant-modal-cancel');
  
  const handleSave = async () => {
    const nom = nomInput.value.trim();
    const adresse = adresseInput.value.trim();
    const telephone = telephoneInput.value.trim();
    
    if (!nom || !adresse || !telephone) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    const result = await (window as any).api.adminUpdateRestaurant(restaurantId, { 
      nom, 
      adresse, 
      telephone,
      latitude: resto.latitude,
      longitude: resto.longitude
    });
    
    if (result.success) {
      alert('Restaurant modifié avec succès !');
      modal.style.display = 'none';
      loadAdminRestaurants();
    } else {
      alert('Erreur : ' + (result.error || ''));
    }
    
    cleanup();
  };
  
  const handleCancel = () => {
    modal.style.display = 'none';
    cleanup();
  };
  
  const cleanup = () => {
    saveBtn?.removeEventListener('click', handleSave);
    cancelBtn?.removeEventListener('click', handleCancel);
  };
  
  saveBtn?.addEventListener('click', handleSave);
  cancelBtn?.addEventListener('click', handleCancel);
};

/**
 * Supprimer un restaurant
 */
(window as any).deleteRestaurant = async function(restaurantId: number, nom: string) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le restaurant "${nom}" ?\nCette action est irréversible.`)) {
    return;
  }
  
  const result = await (window as any).api.adminDeleteRestaurant(restaurantId);
  
  if (result.success) {
    alert('Restaurant supprimé avec succès !');
    loadAdminRestaurants();
  } else {
    alert('Erreur : ' + (result.error || ''));
  }
};

/**
 * Gérer le menu d'un restaurant
 */
let currentRestaurantId: number | null = null;

(window as any).manageRestaurantMenu = async function(restaurantId: number, restaurantNom: string) {
  currentRestaurantId = restaurantId;
  
  const modal = document.getElementById('menu-modal');
  const title = document.getElementById('menu-modal-title');
  
  if (!modal || !title) return;
  
  title.textContent = `Gestion du menu - ${restaurantNom}`;
  modal.style.display = 'flex';
  
  await loadRestaurantSections(restaurantId);
  
  // Événements
  document.getElementById('menu-modal-close')?.addEventListener('click', () => {
    modal.style.display = 'none';
    currentRestaurantId = null;
  });
  
  document.getElementById('menu-add-section')?.addEventListener('click', showSectionForm);
};

/**
 * Charger les sections d'un restaurant
 */
async function loadRestaurantSections(restaurantId: number) {
  const listDiv = document.getElementById('menu-sections-list');
  if (!listDiv) return;
  
  listDiv.innerHTML = '<p style="text-align:center; padding:1rem;">⏳ Chargement...</p>';
  
  const restaurants = await (window as any).api.getAllRestaurants();
  const resto = restaurants.find((r: any) => r.id === restaurantId);
  
  if (!resto || !resto.sections || resto.sections.length === 0) {
    listDiv.innerHTML = '<p style="text-align:center; padding:1rem; color:#999;">Aucune section. Créez-en une pour ajouter des produits.</p>';
    return;
  }
  
  listDiv.innerHTML = resto.sections.map((section: any) => {
    const produitsHtml = (section.produits || []).map((p: any) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; background:white; border-radius:4px; margin-bottom:0.5rem;">
        <div style="flex:1;">
          <div style="font-weight:600;">${p.nom}</div>
          ${p.description ? `<div style="font-size:0.85rem; color:#666;">${p.description}</div>` : ''}
          <div style="font-weight:700; color:var(--primary); margin-top:0.3rem;">${p.prix.toFixed(2)}€</div>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-sm" onclick="editProduit(${p.id}, ${section.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduit(${p.id}, ${section.id})">🗑️</button>
        </div>
      </div>
    `).join('');
    
    return `
      <div style="background:#f8f9fa; border:2px solid #dee2e6; border-radius:var(--radius); padding:1.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <div>
            <h4 style="margin:0;">${section.nom}</h4>
            ${section.description ? `<p style="margin:0.3rem 0 0 0; color:#666; font-size:0.9rem;">${section.description}</p>` : ''}
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-sm btn-success" onclick="showProduitForm(${section.id})">➕ Produit</button>
            <button class="btn btn-sm" onclick="editSection(${section.id})">✏️</button>
            <button class="btn btn-sm btn-danger" onclick="deleteSection(${section.id})">🗑️</button>
          </div>
        </div>
        <div>
          ${produitsHtml || '<p style="color:#999; margin:0;">Aucun produit dans cette section.</p>'}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Afficher le formulaire d'ajout de section
 */
function showSectionForm() {
  const form = document.getElementById('menu-section-form');
  const nomInput = document.getElementById('menu-section-nom') as HTMLInputElement;
  const descInput = document.getElementById('menu-section-description') as HTMLTextAreaElement;
  
  if (!form || !nomInput || !descInput) return;
  
  nomInput.value = '';
  descInput.value = '';
  form.style.display = 'block';
  nomInput.focus();
  
  document.getElementById('menu-section-save')?.addEventListener('click', async () => {
    const nom = nomInput.value.trim();
    const description = descInput.value.trim();
    
    if (!nom || !currentRestaurantId) {
      alert('Le nom de la section est obligatoire');
      return;
    }
    
    const result = await (window as any).api.adminCreateSection(currentRestaurantId, { nom, description });
    
    if (result.success) {
      form.style.display = 'none';
      await loadRestaurantSections(currentRestaurantId);
      await loadAdminRestaurants();
    } else {
      alert('Erreur : ' + (result.error || ''));
    }
  });
  
  document.getElementById('menu-section-cancel')?.addEventListener('click', () => {
    form.style.display = 'none';
  });
}

/**
 * Afficher le formulaire d'ajout de produit
 */
(window as any).showProduitForm = async function(sectionId: number) {
  const form = document.getElementById('menu-produit-form');
  const sectionSelect = document.getElementById('menu-produit-section') as HTMLSelectElement;
  const nomInput = document.getElementById('menu-produit-nom') as HTMLInputElement;
  const descInput = document.getElementById('menu-produit-description') as HTMLTextAreaElement;
  const prixInput = document.getElementById('menu-produit-prix') as HTMLInputElement;
  
  if (!form || !sectionSelect || !nomInput || !descInput || !prixInput || !currentRestaurantId) return;
  
  // Charger les sections dans le select
  const restaurants = await (window as any).api.getAllRestaurants();
  const resto = restaurants.find((r: any) => r.id === currentRestaurantId);
  
  if (resto && resto.sections) {
    sectionSelect.innerHTML = '<option value="">-- Sélectionner une section --</option>' +
      resto.sections.map((s: any) => `<option value="${s.id}" ${s.id === sectionId ? 'selected' : ''}>${s.nom}</option>`).join('');
  }
  
  nomInput.value = '';
  descInput.value = '';
  prixInput.value = '';
  form.style.display = 'block';
  nomInput.focus();
  
  document.getElementById('menu-produit-save')?.addEventListener('click', async () => {
    const selectedSectionId = Number(sectionSelect.value);
    const nom = nomInput.value.trim();
    const description = descInput.value.trim();
    const prix = parseFloat(prixInput.value);
    
    if (!nom || !selectedSectionId || isNaN(prix) || prix <= 0) {
      alert('Veuillez remplir tous les champs obligatoires (nom, section, prix > 0)');
      return;
    }
    
    const result = await (window as any).api.adminCreateProduit(selectedSectionId, { nom, description, prix });
    
    if (result.success) {
      form.style.display = 'none';
      await loadRestaurantSections(currentRestaurantId!);
      await loadAdminRestaurants();
    } else {
      alert('Erreur : ' + (result.error || ''));
    }
  });
  
  document.getElementById('menu-produit-cancel')?.addEventListener('click', () => {
    form.style.display = 'none';
  });
};

/**
 * Supprimer une section
 */
(window as any).deleteSection = async function(sectionId: number) {
  if (!confirm('Supprimer cette section et tous ses produits ?')) return;
  
  const result = await (window as any).api.adminDeleteSection(sectionId);
  
  if (result.success && currentRestaurantId) {
    await loadRestaurantSections(currentRestaurantId);
    await loadAdminRestaurants();
  } else {
    alert('Erreur : ' + (result.error || ''));
  }
};

/**
 * Supprimer un produit
 */
(window as any).deleteProduit = async function(produitId: number, sectionId: number) {
  if (!confirm('Supprimer ce produit ?')) return;
  
  const result = await (window as any).api.adminDeleteProduit(produitId);
  
  if (result.success && currentRestaurantId) {
    await loadRestaurantSections(currentRestaurantId);
    await loadAdminRestaurants();
  } else {
    alert('Erreur : ' + (result.error || ''));
  }
};

// ============================================================
// UTILITAIRES - Fonctions helper
// ============================================================

/**
 * Retourne une couleur selon le statut
 */
function getStatusColor(statut: string): string {
  switch (statut) {
    case 'En attente': return '#FF9800';
    case 'En préparation': return '#2196F3';
    case 'Prête': return '#4CAF50';
    case 'En cours': return '#2196F3';
    case 'Livrée': return '#4CAF50';
    default: return '#666';
  }
}

// ============================================================
// INITIALISATION - Événements au chargement de la page
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  forceInputInteractivity();
  
  document.body.addEventListener('mousedown', () => {
    setTimeout(() => forceInputInteractivity(), 10);
  });
  
  document.body.addEventListener('click', (e) => {
    forceInputInteractivity();
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      setTimeout(() => forceInputInteractivity(), 10);
    }
  });
  
  document.body.addEventListener('focus', (e) => {
    forceInputInteractivity();
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      setTimeout(() => forceInputInteractivity(), 10);
    }
  }, true);
  
  document.getElementById('login-submit')?.addEventListener('click', handleLogin);
  document.getElementById('register-submit')?.addEventListener('click', handleRegister);
  document.getElementById('show-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleLoginRegister(false);
  });
  document.getElementById('show-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleLoginRegister(true);
  });
  
  // Permettre connexion avec Enter
  document.getElementById('login-password')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  
  // --- NAVIGATION ---
  document.getElementById('nav-restaurants')?.addEventListener('click', () => {
    showView('view-restaurants');
    loadRestaurants();
  });
  
  document.getElementById('nav-commandes')?.addEventListener('click', () => {
    showView('view-commandes');
    loadClientCommandes();
  });
  
  document.getElementById('nav-cook')?.addEventListener('click', () => {
    showView('view-cook');
    loadCookRestaurants();
    loadCookCommandes();
  });
  
  document.getElementById('nav-livreur')?.addEventListener('click', () => {
    showView('view-livreur');
    loadLivreurLivraisons();
    loadLivreurAvailableCommandes();
  });
  
  document.getElementById('nav-admin')?.addEventListener('click', () => {
    showView('view-admin');
    loadAdmin();
  });
  
  document.getElementById('nav-logout')?.addEventListener('click', handleLogout);
  
  // --- PANIER ---
  document.getElementById('cart-validate')?.addEventListener('click', validateCart);
  
  // --- CUISINIER ---
  document.getElementById('cook-refresh')?.addEventListener('click', loadCookCommandes);
  
  // --- LIVREUR ---
  document.getElementById('livreur-refresh')?.addEventListener('click', () => {
    loadLivreurLivraisons();
    loadLivreurAvailableCommandes();
  });
  
  // --- ADMIN ---
  document.getElementById('admin-attach-btn')?.addEventListener('click', handleAttachStaff);
  document.getElementById('admin-detach-btn')?.addEventListener('click', handleDetachStaff);
  document.getElementById('admin-refresh')?.addEventListener('click', loadAdmin);
  document.getElementById('admin-commandes-refresh')?.addEventListener('click', loadAdminCommandes);
  document.getElementById('admin-restaurant-add')?.addEventListener('click', showAddRestaurantModal);
  
  // Gestion des onglets admin
  const adminTabs = document.querySelectorAll('.admin-tab');
  adminTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const tabName = target.dataset.tab;
      
      // Mettre à jour les onglets actifs
      adminTabs.forEach(t => t.classList.remove('active'));
      target.classList.add('active');
      
      // Afficher le contenu correspondant
      document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`admin-tab-${tabName}`)?.classList.add('active');
      
      // Charger les données si nécessaire
      if (tabName === 'commandes') {
        loadAdminCommandes();
      } else if (tabName === 'restaurants') {
        loadAdminRestaurants();
      }
    });
  });
});
