document.addEventListener('DOMContentLoaded', async () => {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    const listDiv = document.getElementById('livraisons-list');
    listDiv.innerText = 'Chargement des livraisons...';
    try {
        console.log('Chargement des livraisons...');
        const [available, livraisons] = await Promise.all([window.api.getAvailableCommandes(), window.api.getDeliveriesForLivreur(user.id)]);
        console.log('Commandes disponibles:', available);
        console.log('Mes livraisons:', livraisons);
        listDiv.innerHTML = '';
        const availDiv = document.createElement('div');
        availDiv.innerHTML = '<h3>Commandes disponibles</h3>';
        if (!available || available.length === 0) {
            availDiv.innerHTML += '<div>Aucune commande prête disponible.</div>';
        }
        else {
            availDiv.innerHTML += available.map(c => `<div style="border:1px solid #eee;padding:0.5rem;margin-bottom:0.5rem;border-radius:6px"><strong>Commande #${c.id}</strong> — ${new Date(c.date).toLocaleString()}<br>Restaurant: ${c.restaurant ? c.restaurant.nom : ''}<br>Produits: ${(c.details || []).map(d => d.produit ? d.produit.nom : '').join(', ')} <br><button data-id='${c.id}' class='claim-btn'>Prendre la livraison</button></div>`).join('');
        }
        const mineDiv = document.createElement('div');
        mineDiv.innerHTML = '<h3>Mes livraisons</h3>';
        if (!livraisons || livraisons.length === 0) {
            mineDiv.innerHTML += '<div>Aucune livraison.</div>';
        }
        else {
            mineDiv.innerHTML += livraisons.map(l => `<div style="border:1px solid #eee;padding:0.5rem;margin-bottom:0.5rem;border-radius:6px"><strong>Livraison #${l.id}</strong><br>Commande: ${l.commandeId || '—'}<br>Statut: <select data-id='${l.id}' class='status-select'><option ${l.statut === 'En attente assignation' ? 'selected' : ''}>En attente assignation</option><option ${l.statut === 'Acceptée' ? 'selected' : ''}>Acceptée</option><option ${l.statut === 'En cours' ? 'selected' : ''}>En cours</option><option ${l.statut === 'Livrée' ? 'selected' : ''}>Livrée</option></select> <button data-id='${l.id}' class='save-liv'>Enregistrer</button></div>`).join('');
        }
        listDiv.appendChild(availDiv);
        listDiv.appendChild(mineDiv);
        listDiv.querySelectorAll('.claim-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                btn.disabled = true;
                const res = await window.api.createLivraison(user.id, btn.dataset.id);
                if (res && res.success) {
                    alert('Livraison assignée.');
                    location.reload();
                }
                else {
                    alert('Erreur: ' + (res && res.error ? res.error : ''));
                    btn.disabled = false;
                }
            });
        });
        listDiv.querySelectorAll('.save-liv').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.dataset.id;
                const statut = listDiv.querySelector(`select.status-select[data-id='${id}']`).value;
                const res = await window.api.updateLivraisonStatus(user.id, id, statut);
                if (res && res.success)
                    alert('Statut mis à jour');
                else
                    alert('Erreur: ' + (res && res.error ? res.error : ''));
            });
        });
    }
    catch (err) {
        console.error('Erreur livraisons:', err);
        listDiv.innerHTML = `
      <div style="color: #d32f2f; padding: 1.5rem; background: #ffebee; border-radius: 8px; border-left: 4px solid #d32f2f;">
        <strong>Erreur lors du chargement des livraisons</strong><br>
        <small>${err.message || 'Une erreur est survenue'}</small><br>
        <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;">Réessayer</button>
      </div>
    `;
    }
});
