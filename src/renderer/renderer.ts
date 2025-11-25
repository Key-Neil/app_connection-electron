let currentUser: any = null;

let cart: Array<{ id: number; nom: string; prix: number; quantite: number; restaurantId: number }> = [];

let selectedRestaurantId: number | null = null;

function ensureInputAccess() {
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach((input: any) => {
    input.style.pointerEvents = 'auto';
    input.style.userSelect = 'text';
    input.style.webkitUserSelect = 'text';
    
    input.style.webkitAppRegion = 'no-drag';
    
    if (!input.dataset.clickAttached) {
      input.addEventListener('click', (e: any) => {
        e.stopPropagation();
        input.focus();
      });
      input.dataset.clickAttached = 'true';
    }
  });
  
  const modals = document.querySelectorAll('#restaurant-modal, #menu-modal, #restaurant-modal > div, #menu-modal > div');
  modals.forEach((modal: any) => {
    modal.style.webkitAppRegion = 'no-drag';
  });
}

const observer = new MutationObserver(() => {
  ensureInputAccess();
});

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

  window.addEventListener('focus', () => {
    ensureInputAccess();
  }, true);
}

function showView(viewId: string) {
  const allViews = document.querySelectorAll('.view');
  allViews.forEach(view => {
    (view as HTMLElement).style.display = 'none';
  });

  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.style.display = 'block';
  }
}

function showNavBar() {
  const navBar = document.getElementById('nav-bar');
  if (!navBar) return;
  
  navBar.style.display = 'block';

  const welcomeSpan = document.getElementById('nav-welcome');
  if (welcomeSpan && currentUser) {
    welcomeSpan.textContent = `Bienvenue, ${currentUser.prenom} !`;
  }

  const roles = currentUser?.roles || [];

  const navCommandes = document.getElementById('nav-commandes');
  if (navCommandes && roles.includes('Client')) {
    navCommandes.style.display = 'inline-block';
  }

  const navCook = document.getElementById('nav-cook');
  if (navCook && roles.includes('Cuisinier')) {
    navCook.style.display = 'inline-block';
  }

  const navLivreur = document.getElementById('nav-livreur');
  if (navLivreur && roles.includes('Livreur')) {
    navLivreur.style.display = 'inline-block';
  }

  const navAdmin = document.getElementById('nav-admin');
  if (navAdmin && roles.includes('Admin')) {
    navAdmin.style.display = 'inline-block';
  }
}

function hideNavBar() {
  const navBar = document.getElementById('nav-bar');
  if (navBar) {
    navBar.style.display = 'none';
  }
}

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

function handleLogout() {
  currentUser = null;
  cart = [];
  selectedRestaurantId = null;
  
  hideNavBar();
  showView('view-login');

  toggleLoginRegister(true);
}

async function loadRestaurants() {
  const listDiv = document.getElementById('restaurants-list');
  if (!listDiv) return;
  
  listDiv.innerHTML = '<p>Chargement des restaurants...</p>';

  const restaurants = await (window as any).api.getAllRestaurants();
  
  if (!restaurants || restaurants.length === 0) {
    listDiv.innerHTML = '<p>Aucun restaurant disponible.</p>';
    return;
  }

  function computeFrontendSections(resto: any) {
    const produits: any[] = resto.produits || [];
    if (!produits || produits.length === 0) {
      return [];
    }

    const groups: { [key: string]: any[] } = {};
    const classifiers: { name: string; match: (n: string) => boolean }[] = [
      { name: 'Burgers', match: (n) => /burger/i.test(n) },
      { name: 'Pizzas', match: (n) => /pizza|margherita|pepperoni/i.test(n) },
      { name: 'Accompagnements', match: (n) => /frites|onion|accompagnement/i.test(n) },
    ];
    produits.forEach(p => {
      const nom = String(p.nom || '').toLowerCase();
      const cls = classifiers.find(c => c.match(nom));
      const key = cls ? cls.name : 'Menu';
      groups[key] = groups[key] || [];
      groups[key].push(p);
    });
    return Object.entries(groups).map(([nom, prods]) => ({ nom, produits: prods }));
  }

  listDiv.innerHTML = restaurants.map((resto: any) => {
    const sourceSections = (resto.sections && resto.sections.length > 0)
      ? resto.sections
      : computeFrontendSections(resto);
    const sectionsHtml = (sourceSections || []).map((section: any) => {
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
          <h4>${section.nom || 'Menu'}</h4>
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

  attachAddToCartEvents();
}

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

function addToCart(id: number, nom: string, prix: number, restaurantId: number) {

  if (selectedRestaurantId !== null && selectedRestaurantId !== restaurantId) {
    alert('Vous ne pouvez commander que dans un seul restaurant à la fois. Videz votre panier d\'abord.');
    return;
  }
  
  selectedRestaurantId = restaurantId;

  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantite += 1;
  } else {
    cart.push({ id, nom, prix, quantite: 1, restaurantId });
  }
  
  updateCartDisplay();
}

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

    cart = [];
    selectedRestaurantId = null;
    updateCartDisplay();
  } else {
    alert('Erreur lors de la commande : ' + (result.error || ''));
  }
}

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

  attachCookStatusEvents();
}

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

async function loadLivreurLivraisons() {
  if (!currentUser) return;
  
  const div = document.getElementById('livreur-livraisons');
  if (!div) return;
  
  div.innerHTML = '<p>Chargement...</p>';

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
      <select class="livreur-status-select" data-id="${liv.id}">
        <option value="Acceptée" ${liv.statut === 'Acceptée' ? 'selected' : ''}>Acceptée</option>
        <option value="En cours" ${liv.statut === 'En cours' ? 'selected' : ''}>En cours</option>
        <option value="Livrée" ${liv.statut === 'Livrée' ? 'selected' : ''}>Livrée</option>
      </select>
      <button class="btn-small livreur-update-status" data-id="${liv.id}">Mettre à jour</button>
    </div>
  `).join('');

  attachLivreurStatusEvents();
}

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

  attachLivreurAcceptEvents();
}

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

let currentAdminFilter = 'all';
let allUsersData: any[] = [];
let allRolesData: any[] = [];
let allRestaurantsData: any[] = [];

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

  const statUsers = document.getElementById('stat-users');
  const statRestaurants = document.getElementById('stat-restaurants');
  const statCooks = document.getElementById('stat-cooks');
  const statDrivers = document.getElementById('stat-drivers');
  
  if (statUsers) statUsers.textContent = users.length.toString();
  if (statRestaurants) statRestaurants.textContent = restaurants.length.toString();
  if (statCooks) statCooks.textContent = users.filter((u: any) => (u.roles || []).includes('Cuisinier')).length.toString();
  if (statDrivers) statDrivers.textContent = users.filter((u: any) => (u.roles || []).includes('Livreur')).length.toString();

  attachRoleFilterEvents();

  renderAdminUsers(currentAdminFilter);

  populateAdminSelects(allUsersData, allRestaurantsData);
}

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

  attachAdminRoleEvents();
}

function attachRoleFilterEvents() {
  const filterButtons = document.querySelectorAll('.role-filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const filter = target.dataset.filter || 'all';

      filterButtons.forEach(b => b.classList.remove('active'));
      target.classList.add('active');

      currentAdminFilter = filter;
      renderAdminUsers(filter);
    });
  });
}

function attachAdminRoleEvents() {
  const buttons = document.querySelectorAll('.role-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.target as HTMLButtonElement;
      const userId = Number(target.dataset.user);
      const roleName = target.dataset.role || '';
      const isActive = target.dataset.active === 'true';

      const newActiveState = !isActive;

      const userButtons = document.querySelectorAll(`.role-btn[data-user="${userId}"]`);
      const selectedRoles: string[] = [];
      
      userButtons.forEach(ub => {
        const ubtn = ub as HTMLButtonElement;
        if (ubtn.dataset.role === roleName) {

          if (newActiveState) {
            selectedRoles.push(roleName);
            ubtn.classList.add('role-btn-active');
            ubtn.dataset.active = 'true';
          } else {
            ubtn.classList.remove('role-btn-active');
            ubtn.dataset.active = 'false';
          }
        } else if (ubtn.dataset.active === 'true') {

          selectedRoles.push(ubtn.dataset.role || '');
        }
      });
      
      const result = await (window as any).api.setRoles(userId, selectedRoles);
      
      if (!result || !result.success) {
        alert('Erreur lors de la mise à jour des rôles');

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

function populateAdminSelects(users: any[], restaurants: any[]) {
  const attachUserSelect = document.getElementById('admin-attach-user') as HTMLSelectElement;
  const attachRestoSelect = document.getElementById('admin-attach-restaurant') as HTMLSelectElement;
  const detachUserSelect = document.getElementById('admin-detach-user') as HTMLSelectElement;
  const detachRestoSelect = document.getElementById('admin-detach-restaurant') as HTMLSelectElement;
  
  if (!attachUserSelect || !attachRestoSelect || !detachUserSelect || !detachRestoSelect) return;

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

let currentRestaurantId: number | null = null;

(window as any).manageRestaurantMenu = async function(restaurantId: number, restaurantNom: string) {
  currentRestaurantId = restaurantId;
  
  const modal = document.getElementById('menu-modal');
  const title = document.getElementById('menu-modal-title');
  
  if (!modal || !title) return;
  
  title.textContent = `Gestion du menu - ${restaurantNom}`;
  modal.style.display = 'flex';
  
  await loadRestaurantSections(restaurantId);

  document.getElementById('menu-modal-close')?.addEventListener('click', () => {
    modal.style.display = 'none';
    currentRestaurantId = null;
  });
  
  document.getElementById('menu-add-section')?.addEventListener('click', showSectionForm);
};

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

  (window as any).editSection = async function(sectionId: number) {
    const restoId = currentRestaurantId;
    const section = ((await (window as any).api.getAllRestaurants())
      .find((r: any) => r.id === restoId)?.sections || []).find((s: any) => s.id === sectionId);
    if (!section) return;
    nomInput.value = section.nom;
    descInput.value = section.description || '';
    form.style.display = 'block';
    nomInput.focus();
    const saveBtn = document.getElementById('menu-section-save');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const nom = nomInput.value.trim();
        const description = descInput.value.trim();
        if (!nom) return alert('Nom obligatoire');
        const result = await (window as any).api.adminUpdateSection(restoId, sectionId, { nom, description });
        if (result.success) {
          form.style.display = 'none';
          await loadRestaurantSections(restoId);
          await loadAdminRestaurants();
        } else {
          alert('Erreur : ' + (result.error || ''));
        }
      };
    }
  };
  
  document.getElementById('menu-section-cancel')?.addEventListener('click', () => {
    form.style.display = 'none';
  });
}

(window as any).showProduitForm = async function(sectionId: number) {
  const form = document.getElementById('menu-produit-form');
  const sectionSelect = document.getElementById('menu-produit-section') as HTMLSelectElement;
  const nomInput = document.getElementById('menu-produit-nom') as HTMLInputElement;
  const descInput = document.getElementById('menu-produit-description') as HTMLTextAreaElement;
  const prixInput = document.getElementById('menu-produit-prix') as HTMLInputElement;
  
  if (!form || !sectionSelect || !nomInput || !descInput || !prixInput || !currentRestaurantId) return;

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
    const result = await (window as any).api.adminAddProduit(currentRestaurantId, selectedSectionId, { nom, description, prix });
    if (result.success) {
      form.style.display = 'none';
      await loadRestaurantSections(currentRestaurantId!);
      await loadAdminRestaurants();
    } else {
      alert('Erreur : ' + (result.error || ''));
    }
  });

  (window as any).editProduit = async function(produitId: number, sectionId: number) {
    const restoId = currentRestaurantId;
    const section = ((await (window as any).api.getAllRestaurants())
      .find((r: any) => r.id === restoId)?.sections || []).find((s: any) => s.id === sectionId);
    if (!section) return;
    const produit = (section.produits || []).find((p: any) => p.id === produitId);
    if (!produit) return;
    sectionSelect.value = String(sectionId);
    nomInput.value = produit.nom;
    descInput.value = produit.description || '';
    prixInput.value = String(produit.prix);
    form.style.display = 'block';
    nomInput.focus();
    const saveBtn = document.getElementById('menu-produit-save');
    if (saveBtn) {
      saveBtn.onclick = async () => {
        const nom = nomInput.value.trim();
        const description = descInput.value.trim();
        const prix = parseFloat(prixInput.value);
        if (!nom || isNaN(prix) || prix <= 0) return alert('Champs obligatoires');
        const result = await (window as any).api.adminEditProduit(restoId, sectionId, produitId, { nom, description, prix });
        if (result.success) {
          form.style.display = 'none';
          await loadRestaurantSections(restoId);
          await loadAdminRestaurants();
        } else {
          alert('Erreur : ' + (result.error || ''));
        }
      };
    }
  };
  
  document.getElementById('menu-produit-cancel')?.addEventListener('click', () => {
    form.style.display = 'none';
  });
};

(window as any).deleteSection = async function(sectionId: number) {
  if (!confirm('Supprimer cette section et tous ses produits ?')) return;
  
  const result = await (window as any).api.adminDeleteSection(currentRestaurantId, sectionId);
  
  if (result.success && currentRestaurantId) {
    await loadRestaurantSections(currentRestaurantId);
    await loadAdminRestaurants();
  } else {
    alert('Erreur : ' + (result.error || ''));
  }
};

(window as any).deleteProduit = async function(produitId: number, sectionId: number) {
  if (!confirm('Supprimer ce produit ?')) return;
  
  const result = await (window as any).api.adminDeleteProduit(currentRestaurantId, sectionId, produitId);
  
  if (result.success && currentRestaurantId) {
    await loadRestaurantSections(currentRestaurantId);
    await loadAdminRestaurants();
  } else {
    alert('Erreur : ' + (result.error || ''));
  }
};

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

  document.getElementById('login-password')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

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

  document.getElementById('cart-validate')?.addEventListener('click', validateCart);

  document.getElementById('cook-refresh')?.addEventListener('click', loadCookCommandes);

  document.getElementById('livreur-refresh')?.addEventListener('click', () => {
    loadLivreurLivraisons();
    loadLivreurAvailableCommandes();
  });

  document.getElementById('admin-attach-btn')?.addEventListener('click', handleAttachStaff);
  document.getElementById('admin-detach-btn')?.addEventListener('click', handleDetachStaff);
  document.getElementById('admin-refresh')?.addEventListener('click', loadAdmin);
  document.getElementById('admin-commandes-refresh')?.addEventListener('click', loadAdminCommandes);
  document.getElementById('admin-restaurant-add')?.addEventListener('click', showAddRestaurantModal);

  const adminTabs = document.querySelectorAll('.admin-tab');
  adminTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const tabName = target.dataset.tab;

      adminTabs.forEach(t => t.classList.remove('active'));
      target.classList.add('active');

      document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(`admin-tab-${tabName}`)?.classList.add('active');

      if (tabName === 'commandes') {
        loadAdminCommandes();
      } else if (tabName === 'restaurants') {
        loadAdminRestaurants();
      }
    });
  });
});


