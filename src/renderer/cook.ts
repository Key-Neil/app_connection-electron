import { currentUser } from './state.js';
import { getStatusColor } from './navigation.js';

export async function loadCookRestaurants() {
  if (!currentUser) return;
  
  const div = document.getElementById('cook-restaurants');
  if (!div) return;
  
  div.innerHTML = '<p class="loading-message">⏳ Chargement...</p>';
  
  const restos = await (window as any).api.getRestaurantsForCook(currentUser.id);
  
  if (!restos || restos.length === 0) {
    div.innerHTML = '<p class="empty-message">Aucun restaurant attribué. Contactez l\'administrateur.</p>';
    return;
  }
  
  div.innerHTML = restos.map((r: any) => `
    <div class="card card-sm">
      <div class="restaurant-name">${r.nom}</div>
      <div class="restaurant-detail">📍 ${r.adresse || 'N/A'}</div>
      <div class="restaurant-detail">📞 ${r.telephone || 'N/A'}</div>
    </div>
  `).join('');
}

export async function loadCookCommandes() {
  if (!currentUser) return;
  
  const div = document.getElementById('cook-commandes');
  if (!div) return;
  
  div.innerHTML = '<p class="loading-message">⏳ Chargement...</p>';
  
  const commandes = await (window as any).api.getCommandesForCook(currentUser.id);
  
  if (!commandes || commandes.length === 0) {
    div.innerHTML = '<p class="empty-message">Aucune commande trouvée.</p>';
    return;
  }
  
  div.innerHTML = commandes.map((cmd: any) => {
    const detailsHtml = (cmd.details || []).map((d: any) => 
      `<li class="order-item-row">• ${d.produit?.nom || 'Produit'} x${d.quantite}</li>`
    ).join('');
    
    return `
      <div class="card">
        <div class="order-header">
          <h3 class="order-title">Commande #${cmd.id}</h3>
          <span class="status-badge" style="background:${getStatusColor(cmd.statut)}">${cmd.statut}</span>
        </div>
        <div class="order-info-grid">
          <div>
            <span class="info-label">Client:</span>
            <span class="info-value">${cmd.client?.prenom || ''} ${cmd.client?.nom || ''}</span>
          </div>
          <div>
            <span class="info-label">Date:</span>
            <span class="info-value">${new Date(cmd.date).toLocaleString('fr-FR')}</span>
          </div>
        </div>
        <div class="order-items-container">
          <div class="items-label">Articles commandés:</div>
          <ul>${detailsHtml}</ul>
        </div>
        <div class="order-actions">
          <select class="cook-status-select" data-id="${cmd.id}">
            <option value="En attente" ${cmd.statut === 'En attente' ? 'selected' : ''}>En attente</option>
            <option value="En préparation" ${cmd.statut === 'En préparation' ? 'selected' : ''}>En préparation</option>
            <option value="Prête" ${cmd.statut === 'Prête' ? 'selected' : ''}>Prête</option>
          </select>
          <button class="btn btn-sm btn-primary cook-update-status" data-id="${cmd.id}">Mettre à jour</button>
        </div>
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
        loadCookCommandes();
      } else {
        alert('Erreur : ' + (result.error || ''));
      }
    });
  });
}
