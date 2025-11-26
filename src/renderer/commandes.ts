import { currentUser } from './state.js';
import { getStatusColor } from './navigation.js';

export async function loadClientCommandes() {
  if (!currentUser) return;
  
  const listDiv = document.getElementById('commandes-list');
  if (!listDiv) return;
  
  listDiv.innerHTML = '<p class="loading-message">⏳ Chargement...</p>';
  
  const commandes = await (window as any).api.getCommandesForClient(currentUser.id);
  
  if (!commandes || commandes.length === 0) {
    listDiv.innerHTML = '<p class="empty-message">Aucune commande trouvée.</p>';
    return;
  }
  
  listDiv.innerHTML = commandes.map((cmd: any) => {
    const detailsHtml = (cmd.details || []).map((d: any) => 
      `<li class="order-item-row">• ${d.produit?.nom || 'Produit'} x${Number(d.quantite)} - ${Number(d.prix_unitaire).toFixed(2)}€</li>`
    ).join('');
    
    const total = (cmd.details || []).reduce((sum: number, d: any) => 
      sum + (Number(d.prix_unitaire) * Number(d.quantite)), 0
    );
    
    return `
      <div class="card">
        <div class="order-header">
          <h3 class="order-title">Commande #${cmd.id}</h3>
          <span class="status-badge" style="background:${getStatusColor(cmd.statut)}">${cmd.statut}</span>
        </div>
        <div class="order-info-grid">
          <div>
            <span class="info-label">Restaurant:</span>
            <span class="info-value">${cmd.restaurant?.nom || 'N/A'}</span>
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
        ${cmd.livraison ? `<p class="info-sub">📦 Livraison: ${cmd.livraison.statut}</p>` : ''}
        <div class="order-total">Total: ${total.toFixed(2)}€</div>
      </div>
    `;
  }).join('');
}
