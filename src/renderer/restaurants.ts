import { currentUser, cart, selectedRestaurantId, setSelectedRestaurant, resetCart, addToCart as addToCartState } from './state.js';
import { forceInputInteractivity } from './utils.js';

export async function loadRestaurants() {
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
        <div class="card-sm">
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
        <div class="section-block">
          <h4>${section.nom || 'Menu'}</h4>
          ${section.description ? `<p class="text-muted">${section.description}</p>` : ''}
          ${produitsHtml}
        </div>
      `;
    }).join('');
    
    return `
      <div class="card-success">
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
  
  setSelectedRestaurant(restaurantId);
  addToCartState({ id, nom, prix, quantite: 1, restaurantId });
  updateCartDisplay();
}

function updateCartDisplay() {
  const cartSection = document.getElementById('cart-section');
  const cartItems = document.getElementById('cart-items');
  
  if (!cartSection || !cartItems) return;
  
  if (cart.length === 0) {
    cartSection.classList.add('d-none');
    return;
  }
  
  cartSection.classList.remove('d-none');
  
  const total = cart.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
  
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.nom}</div>
        <div class="cart-item-qty">Quantité: ${item.quantite}</div>
      </div>
      <div class="cart-item-price">${(item.prix * item.quantite).toFixed(2)}€</div>
    </div>
  `).join('') + `
    <div class="cart-total-separator">
      <div class="cart-total-row">
        <span class="cart-total-label">Total</span>
        <span class="cart-total-amount">${total.toFixed(2)}€</span>
      </div>
    </div>
  `;
}

export async function validateCart() {
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
    resetCart();
    updateCartDisplay();
  } else {
    alert('Erreur lors de la commande : ' + (result.error || ''));
  }
}

export function initRestaurantsModule() {
  const validateBtn = document.getElementById('validate-cart');
  if (validateBtn) {
    validateBtn.addEventListener('click', validateCart);
  }
}
