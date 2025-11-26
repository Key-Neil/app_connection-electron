import { forceInputInteractivity } from './utils.js';
import { getStatusColor } from './navigation.js';

let currentAdminFilter = 'all';
let allUsersData: any[] = [];
let allRolesData: any[] = [];
let allRestaurantsData: any[] = [];
let currentRestaurantId: number | null = null;

// Helper: Clone button to remove old event listeners
function resetButton(buttonId: string, clickHandler: () => void): void {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  const newBtn = btn.cloneNode(true) as HTMLElement;
  btn.parentNode?.replaceChild(newBtn, btn);
  newBtn.addEventListener('click', clickHandler);
}

// Helper: Get cached restaurant or fetch all
async function getRestaurantData(restaurantId: number): Promise<any> {
  if (allRestaurantsData.length > 0) {
    const cached = allRestaurantsData.find(r => r.id === restaurantId);
    if (cached) return cached;
  }
  const restaurants = await (window as any).api.getAllRestaurants();
  allRestaurantsData = restaurants;
  return restaurants.find((r: any) => r.id === restaurantId);
}

export async function loadAdmin() {
  const div = document.getElementById('admin-users');
  if (!div) return;
  
  div.innerHTML = '<p class="loading-message">⏳ Chargement...</p>';
  
  const [users, roles, restaurants] = await Promise.all([
    (window as any).api.getUsers(),
    (window as any).api.getRoles(),
    (window as any).api.getAllRestaurants(),
  ]);
  
  allUsersData = users;
  allRolesData = roles;
  allRestaurantsData = restaurants;

  updateStats(users, restaurants);
  attachRoleFilterEvents();
  renderAdminUsers(currentAdminFilter);
  populateAdminSelects(allUsersData, allRestaurantsData);
}

function updateStats(users: any[], restaurants: any[]) {
  const statUsers = document.getElementById('stat-users');
  const statRestaurants = document.getElementById('stat-restaurants');
  const statCooks = document.getElementById('stat-cooks');
  const statDrivers = document.getElementById('stat-drivers');
  
  if (statUsers) statUsers.textContent = users.length.toString();
  if (statRestaurants) statRestaurants.textContent = restaurants.length.toString();
  if (statCooks) statCooks.textContent = users.filter((u: any) => (u.roles || []).includes('Cuisinier')).length.toString();
  if (statDrivers) statDrivers.textContent = users.filter((u: any) => (u.roles || []).includes('Livreur')).length.toString();
}

function renderAdminUsers(filter: string) {
  const div = document.getElementById('admin-users');
  if (!div) return;
  
  let filteredUsers = allUsersData;
  if (filter !== 'all') {
    filteredUsers = allUsersData.filter((u: any) => (u.roles || []).includes(filter));
  }
  
  if (filteredUsers.length === 0) {
    div.innerHTML = '<p class="empty-message">Aucun utilisateur trouvé pour ce filtre.</p>';
    return;
  }

  div.innerHTML = filteredUsers.map((u: any) => {
    const initiales = (u.prenom[0] || '') + (u.nom ? u.nom[0] : '');
    
    const roleButtons = allRolesData.map((r: any) => {
      const hasRole = (u.roles || []).includes(r.nom);
      const activeClass = hasRole ? 'role-btn-active' : '';
      const roleEmoji = {
        'Client': '🛒', 'Livreur': '🚚', 'Restaurant': '🏪',
        'Cuisinier': '👨‍🍳', 'Admin': '⚙️'
      }[r.nom] || '📋';
      
      return `<button class="role-btn ${activeClass}" data-user="${u.id}" data-role="${r.nom}" data-active="${hasRole}">${roleEmoji} ${r.nom}</button>`;
    }).join('');
    
    return `
      <div class="admin-user-card">
        <div class="admin-user-avatar">${initiales.toUpperCase()}</div>
        <div class="admin-user-info">
          <div class="admin-user-name">${u.prenom} ${u.nom || ''}</div>
          <div class="admin-user-email">${u.email}</div>
          <div class="admin-user-roles">${roleButtons}</div>
        </div>
      </div>
    `;
  }).join('');

  attachAdminRoleEvents();
}

function attachRoleFilterEvents() {
  document.querySelectorAll('.role-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      document.querySelectorAll('.role-filter-btn').forEach(b => b.classList.remove('active'));
      target.classList.add('active');
      currentAdminFilter = target.dataset.filter || 'all';
      renderAdminUsers(currentAdminFilter);
    });
  });
}

function attachAdminRoleEvents() {
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const target = e.target as HTMLButtonElement;
      const userId = Number(target.dataset.user);
      const roleName = target.dataset.role || '';
      const isActive = target.dataset.active === 'true';
      const newActiveState = !isActive;

      // Optimistic UI update
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
        // Revert if error (simplified)
        loadAdmin(); 
      }
    });
  });
}

function populateAdminSelects(users: any[], restaurants: any[]) {
  const attachUserSelect = document.getElementById('admin-attach-user');
  const attachRestoSelect = document.getElementById('admin-attach-restaurant');
  const detachUserSelect = document.getElementById('admin-detach-user');
  const detachRestoSelect = document.getElementById('admin-detach-restaurant');
  
  if (!attachUserSelect || !attachRestoSelect) return;

  const cooks = users.filter((u: any) => (u.roles || []).includes('Cuisinier'));
  const cooksOptions = cooks.map((u: any) => `<option value="${u.id}">${u.prenom} ${u.nom || ''} (${u.email})</option>`).join('');
  const restosOptions = restaurants.map((r: any) => `<option value="${r.id}">${r.nom}</option>`).join('');
  
  attachUserSelect.innerHTML = cooksOptions;
  attachRestoSelect.innerHTML = restosOptions;
  if (detachUserSelect) detachUserSelect.innerHTML = cooksOptions;
  if (detachRestoSelect) detachRestoSelect.innerHTML = restosOptions;
}

async function handleAttachStaff() {
  const userId = Number((document.getElementById('admin-attach-user') as HTMLSelectElement).value);
  const restoId = Number((document.getElementById('admin-attach-restaurant') as HTMLSelectElement).value);
  const result = await (window as any).api.addStaffToRestaurant(userId, restoId);
  alert(result.success ? 'Cuisinier rattaché avec succès !' : 'Erreur : ' + result.error);
}

async function handleDetachStaff() {
  const userId = Number((document.getElementById('admin-detach-user') as HTMLSelectElement).value);
  const restoId = Number((document.getElementById('admin-detach-restaurant') as HTMLSelectElement).value);
  const result = await (window as any).api.removeStaffFromRestaurant(userId, restoId);
  alert(result.success ? 'Cuisinier détaché avec succès !' : 'Erreur : ' + result.error);
}

export async function loadAdminCommandes() {
  const div = document.getElementById('admin-commandes-list');
  if (!div) return;
  div.innerHTML = '<p class="loading-message">⏳ Chargement...</p>';
  
  try {
    const commandes = await (window as any).api.getAllCommandes();
    if (!commandes || commandes.length === 0) {
      div.innerHTML = '<p class="loading-message">Aucune commande trouvée.</p>';
      return;
    }
    
    div.innerHTML = commandes.map((c: any) => {
      const lignesHtml = c.lignes.map((l: any) => 
        `<div class="order-item-row">• ${l.produit} x${l.quantite} - ${l.prix.toFixed(2)}€</div>`
      ).join('');
      
      return `
        <div class="admin-user-card admin-order-card">
          <div>
            <div class="order-header">
              <div>
                <div class="order-title">Commande #${c.id}</div>
                <div class="order-date">${new Date(c.date).toLocaleString('fr-FR')}</div>
              </div>
              <div class="order-status-badge" style="background:${getStatusColor(c.statut)}">
                ${c.statut}
              </div>
            </div>
            
            <div class="order-info-grid">
              <div>
                <div class="info-label">CLIENT</div>
                <div class="info-value">${c.client}</div>
                <div class="info-sub">${c.clientEmail}</div>
              </div>
              <div>
                <div class="info-label">RESTAURANT</div>
                <div class="info-value">${c.restaurant}</div>
              </div>
              <div>
                <div class="info-label">LIVREUR</div>
                <div class="info-value">${c.livreur}</div>
              </div>
            </div>
          
            <div class="order-items-container">
              <div class="items-label">Articles commandés:</div>
              ${lignesHtml}
            </div>
            
            <div class="order-total">Total: ${c.total.toFixed(2)}€</div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Erreur chargement commandes:', err);
    div.innerHTML = '<p class="error-message">❌ Erreur lors du chargement des commandes</p>';
  }
}

export async function loadAdminRestaurants() {
  const div = document.getElementById('admin-restaurants-list');
  if (!div) return;
  
  div.innerHTML = '<p class="loading-message">⏳ Chargement...</p>';
  const restaurants = await (window as any).api.getAllRestaurants();
  allRestaurantsData = restaurants;
  
  if (restaurants.length === 0) {
    div.innerHTML = '<p class="loading-message">Aucun restaurant trouvé.</p>';
    return;
  }
  
  div.innerHTML = restaurants.map((r: any) => {
    const sectionCount = r.sections?.length || 0;
    const produitCount = r.sections?.reduce((sum: number, s: any) => sum + (s.produits?.length || 0), 0) || 0;
    const escapedNom = r.nom.replace(/'/g, "\\'");
    
    return `
      <div class="admin-user-card admin-restaurant-card">
        <div class="restaurant-icon">🏪</div>
        <div>
          <div class="restaurant-title">${r.nom}</div>
          <div class="restaurant-detail">📍 ${r.adresse}</div>
          <div class="restaurant-detail">📞 ${r.telephone}</div>
          <div class="restaurant-stats">📋 ${sectionCount} section(s) • ${produitCount} produit(s)</div>
        </div>
        <div class="restaurant-actions">
          <button class="btn btn-sm btn-primary" onclick="window.manageRestaurantMenu(${r.id}, '${escapedNom}')">📋 Gérer le menu</button>
          <button class="btn btn-sm" onclick="window.editRestaurant(${r.id})">✏️ Modifier</button>
          <button class="btn btn-sm btn-danger" onclick="window.deleteRestaurant(${r.id}, '${escapedNom}')">🗑️ Supprimer</button>
        </div>
      </div>
    `;
  }).join('');
}

// --- MODAL HANDLERS ---

export function showAddRestaurantModal() {
  setupModal('restaurant-modal', 'Nouveau restaurant', async (nom, adresse, telephone) => {
    return await (window as any).api.adminCreateRestaurant({ nom, adresse, telephone });
  }, () => { loadAdminRestaurants(); loadAdmin(); });
}

(window as any).editRestaurant = async function(restaurantId: number) {
  const resto = await getRestaurantData(restaurantId);
  if (!resto) return;

  setupModal('restaurant-modal', 'Modifier le restaurant', async (nom, adresse, telephone) => {
    return await (window as any).api.adminUpdateRestaurant(restaurantId, { 
      nom, adresse, telephone, latitude: resto.latitude, longitude: resto.longitude
    });
  }, () => loadAdminRestaurants(), { nom: resto.nom, adresse: resto.adresse, telephone: resto.telephone });
};

function setupModal(modalId: string, titleText: string, saveAction: Function, successCallback: Function, initialValues?: any) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  const title = document.getElementById(`${modalId}-title`);
  const nomInput = document.getElementById('restaurant-nom') as HTMLInputElement;
  const adresseInput = document.getElementById('restaurant-adresse') as HTMLInputElement;
  const telephoneInput = document.getElementById('restaurant-telephone') as HTMLInputElement;
  
  if(title) title.textContent = titleText;
  nomInput.value = initialValues?.nom || '';
  adresseInput.value = initialValues?.adresse || '';
  telephoneInput.value = initialValues?.telephone || '';
  
  modal.classList.add('active');
  forceInputInteractivity();
  
  resetButton(`${modalId}-save`, async () => {
    const nom = nomInput.value.trim();
    const adresse = adresseInput.value.trim();
    const telephone = telephoneInput.value.trim();
    if (!nom || !adresse || !telephone) return alert('Veuillez remplir tous les champs');
    
    const result = await saveAction(nom, adresse, telephone);
    if (result.success) {
      alert('Opération réussie !');
      modal.classList.remove('active');
      successCallback();
    } else {
      alert('Erreur : ' + (result.error || ''));
    }
  });
  
  resetButton(`${modalId}-cancel`, () => modal.classList.remove('active'));
}

(window as any).deleteRestaurant = async function(restaurantId: number, nom: string) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer "${nom}" ?`)) return;
  const result = await (window as any).api.adminDeleteRestaurant(restaurantId);
  if (result.success) {
    alert('Restaurant supprimé !');
    loadAdminRestaurants();
  } else {
    alert('Erreur : ' + result.error);
  }
};

// --- MENU MANAGEMENT ---

(window as any).manageRestaurantMenu = async function(restaurantId: number, restaurantNom: string) {
  currentRestaurantId = restaurantId;
  const modal = document.getElementById('menu-modal');
  if (!modal) return;
  
  const title = document.getElementById('menu-modal-title');
  if(title) title.textContent = `Gestion du menu - ${restaurantNom}`;
  
  modal.classList.add('active');
  forceInputInteractivity();
  await loadRestaurantSections(restaurantId);

  resetButton('menu-modal-close', () => {
    modal.classList.remove('active');
    currentRestaurantId = null;
  });
  
  resetButton('menu-add-section', showSectionForm);
};

async function loadRestaurantSections(restaurantId: number) {
  const listDiv = document.getElementById('menu-sections-list');
  if (!listDiv) return;
  listDiv.innerHTML = '<p class="loading-message">⏳ Chargement...</p>';
  
  const resto = await getRestaurantData(restaurantId);
  
  if (!resto || !resto.sections || resto.sections.length === 0) {
    listDiv.innerHTML = '<p class="section-empty">Aucune section. Créez-en une pour ajouter des produits.</p>';
    return;
  }
  
  listDiv.innerHTML = resto.sections.map((section: any) => {
    const produitsHtml = (section.produits || []).map((p: any) => `
      <div class="product-row-admin">
        <div class="product-info-block">
          <div class="product-name-text">${p.nom}</div>
          ${p.description ? `<div class="product-desc-text">${p.description}</div>` : ''}
          <div class="product-price-text">${p.prix.toFixed(2)}€</div>
        </div>
        <div class="product-actions-block">
          <button class="btn btn-sm" onclick="window.editProduit(${p.id}, ${section.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="window.deleteProduit(${p.id}, ${section.id})">🗑️</button>
        </div>
      </div>
    `).join('');
    
    return `
      <div class="menu-section-card">
        <div class="menu-section-header" onclick="toggleSection(${section.id})">
          <div class="section-title">
            <h4>📋 ${section.nom}</h4>
            ${section.description ? `<p class="section-desc">${section.description}</p>` : ''}
            <span class="section-badge">${(section.produits || []).length} produit(s)</span>
          </div>
          <div class="section-controls">
            <button class="btn btn-sm btn-success" onclick="event.stopPropagation(); window.showProduitForm(${section.id});">➕ Produit</button>
            <button class="btn btn-sm" onclick="event.stopPropagation(); window.editSection(${section.id});">✏️</button>
            <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); window.deleteSection(${section.id});">🗑️</button>
            <span id="section-arrow-${section.id}" class="section-arrow">▼</span>
          </div>
        </div>
        <div id="section-content-${section.id}" class="menu-section-content">
          ${produitsHtml || '<p class="section-empty">Aucun produit dans cette section.</p>'}
        </div>
      </div>
    `;
  }).join('');
  
  (window as any).toggleSection = function(sectionId: number) {
    const content = document.getElementById(`section-content-${sectionId}`);
    const arrow = document.getElementById(`section-arrow-${sectionId}`);
    if (content && arrow) {
      const isVisible = content.style.display === 'block';
      content.style.display = isVisible ? 'none' : 'block';
      arrow.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  };
}

function showSectionForm() {
  setupSubForm('menu-section-form', 'menu-section-save', 'menu-section-cancel', async () => {
    const nom = (document.getElementById('menu-section-nom') as HTMLInputElement).value.trim();
    const description = (document.getElementById('menu-section-description') as HTMLTextAreaElement).value.trim();
    if (!nom || !currentRestaurantId) return alert('Nom obligatoire');
    
    const result = await (window as any).api.adminCreateSection(currentRestaurantId, { nom, description });
    return result;
  });
}

(window as any).editSection = async function(sectionId: number) {
  const restoId = currentRestaurantId;
  if (!restoId) return;
  const resto = await getRestaurantData(restoId);
  const section = (resto?.sections || []).find((s: any) => s.id === sectionId);
  if (!section) return;

  (document.getElementById('menu-section-nom') as HTMLInputElement).value = section.nom;
  (document.getElementById('menu-section-description') as HTMLTextAreaElement).value = section.description || '';

  setupSubForm('menu-section-form', 'menu-section-save', 'menu-section-cancel', async () => {
    const nom = (document.getElementById('menu-section-nom') as HTMLInputElement).value.trim();
    const description = (document.getElementById('menu-section-description') as HTMLTextAreaElement).value.trim();
    if (!nom) return alert('Nom obligatoire');
    return await (window as any).api.adminUpdateSection(restoId, sectionId, { nom, description });
  });
};

(window as any).showProduitForm = async function(sectionId: number) {
  const sectionSelect = document.getElementById('menu-produit-section') as HTMLSelectElement;
  if (!currentRestaurantId) return;
  const resto = await getRestaurantData(currentRestaurantId);
  
  if (resto && resto.sections) {
    sectionSelect.innerHTML = '<option value="">-- Sélectionner une section --</option>' +
      resto.sections.map((s: any) => `<option value="${s.id}" ${s.id === sectionId ? 'selected' : ''}>${s.nom}</option>`).join('');
  }
  
  (document.getElementById('menu-produit-nom') as HTMLInputElement).value = '';
  (document.getElementById('menu-produit-description') as HTMLTextAreaElement).value = '';
  (document.getElementById('menu-produit-prix') as HTMLInputElement).value = '';

  setupSubForm('menu-produit-form', 'menu-produit-save', 'menu-produit-cancel', async () => {
    const sId = Number(sectionSelect.value);
    const nom = (document.getElementById('menu-produit-nom') as HTMLInputElement).value.trim();
    const description = (document.getElementById('menu-produit-description') as HTMLTextAreaElement).value.trim();
    const prix = parseFloat((document.getElementById('menu-produit-prix') as HTMLInputElement).value);
    
    if (!nom || !sId || isNaN(prix) || prix <= 0) return alert('Champs invalides');
    return await (window as any).api.adminAddProduit(currentRestaurantId, sId, { nom, description, prix });
  });
};

(window as any).editProduit = async function(produitId: number, sectionId: number) {
  const restoId = currentRestaurantId;
  if (!restoId) return;
  const resto = await getRestaurantData(restoId);
  const section = (resto?.sections || []).find((s: any) => s.id === sectionId);
  const produit = (section?.produits || []).find((p: any) => p.id === produitId);
  if (!produit) return;

  const sectionSelect = document.getElementById('menu-produit-section') as HTMLSelectElement;
  // Populate select again if needed, simplified here assuming it's present
  sectionSelect.innerHTML = `<option value="${sectionId}" selected>${section.nom}</option>`;
  
  (document.getElementById('menu-produit-nom') as HTMLInputElement).value = produit.nom;
  (document.getElementById('menu-produit-description') as HTMLTextAreaElement).value = produit.description || '';
  (document.getElementById('menu-produit-prix') as HTMLInputElement).value = String(produit.prix);

  setupSubForm('menu-produit-form', 'menu-produit-save', 'menu-produit-cancel', async () => {
    const nom = (document.getElementById('menu-produit-nom') as HTMLInputElement).value.trim();
    const description = (document.getElementById('menu-produit-description') as HTMLTextAreaElement).value.trim();
    const prix = parseFloat((document.getElementById('menu-produit-prix') as HTMLInputElement).value);
    if (!nom || isNaN(prix) || prix <= 0) return alert('Champs invalides');
    return await (window as any).api.adminEditProduit(restoId, sectionId, produitId, { nom, description, prix });
  });
};

function setupSubForm(formId: string, saveBtnId: string, cancelBtnId: string, action: Function) {
  const form = document.getElementById(formId);
  if (!form) return;
  // Affiche correctement le sous-formulaire même si .d-none est présent
  form.classList.remove('d-none');
  (form as HTMLElement).style.display = 'block';
  forceInputInteractivity();
  
  resetButton(saveBtnId, async () => {
    const result = await action();
    if (result && result.success) {
      // Cache le formulaire et restaure l'état
      (form as HTMLElement).style.display = 'none';
      form.classList.add('d-none');
      if (currentRestaurantId) await loadRestaurantSections(currentRestaurantId);
      await loadAdminRestaurants();
    } else if (result) {
      alert('Erreur : ' + result.error);
    }
  });
  
  resetButton(cancelBtnId, () => {
    (form as HTMLElement).style.display = 'none';
    form.classList.add('d-none');
  });
}

(window as any).deleteSection = async function(sectionId: number) {
  if (!confirm('Supprimer cette section ?')) return;
  const result = await (window as any).api.adminDeleteSection(currentRestaurantId, sectionId);
  if (result.success) {
    if (currentRestaurantId) await loadRestaurantSections(currentRestaurantId);
    await loadAdminRestaurants();
  } else {
    alert('Erreur : ' + result.error);
  }
};

(window as any).deleteProduit = async function(produitId: number, sectionId: number) {
  if (!confirm('Supprimer ce produit ?')) return;
  const result = await (window as any).api.adminDeleteProduit(currentRestaurantId, sectionId, produitId);
  if (result.success) {
    if (currentRestaurantId) await loadRestaurantSections(currentRestaurantId);
    await loadAdminRestaurants();
  } else {
    alert('Erreur : ' + result.error);
  }
};

export function initAdminModule() {
  document.getElementById('admin-attach-btn')?.addEventListener('click', handleAttachStaff);
  document.getElementById('admin-detach-btn')?.addEventListener('click', handleDetachStaff);
  document.getElementById('admin-restaurant-add')?.addEventListener('click', showAddRestaurantModal);
}