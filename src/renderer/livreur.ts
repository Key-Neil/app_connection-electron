import { currentUser } from './state.js';
import { getStatusColor } from './navigation.js';

export async function loadLivreurLivraisons() {
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
    <div class="card">
      <h3>Livraison #${liv.id}</h3>
      <p><strong>Commande:</strong> #${liv.commandeId}</p>
      ${isAdmin && liv.livreur ? `<p><strong>Livreur:</strong> ${liv.livreur.prenom} ${liv.livreur.nom} (${liv.livreur.email})</p>` : ''}
      <p><strong>Restaurant:</strong> ${liv.commande?.restaurant?.nom || 'N/A'}</p>
      <p><strong>Adresse livraison:</strong> ${liv.commande?.restaurant?.adresse || 'N/A'}</p>
      <p><strong>Client:</strong> ${liv.commande?.client?.prenom || ''} ${liv.commande?.client?.nom || ''}</p>
      <p><strong>Statut:</strong> <span class="status-badge" style="background:${getStatusColor(liv.statut)}">${liv.statut}</span></p>
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

export async function loadLivreurAvailableCommandes() {
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
      <div class="card">
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
        loadLivreurLivraisons();
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
