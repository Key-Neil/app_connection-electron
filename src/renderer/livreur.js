document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(sessionStorage.getItem('currentUser')||'null');
  if (!user) { window.location.href='index.html'; return; }

  const livDiv = document.getElementById('livraisons');
  livDiv.innerText = 'Chargement...';

  try {
    const livraisons = await window.api.getDeliveriesForLivreur(user.id);
    if (!livraisons || livraisons.length === 0) { livDiv.innerText = 'Aucune livraison assignée.'; return; }

    livDiv.innerHTML = livraisons.map(l => `
      <div style="border:1px solid #eee;padding:0.75rem;margin-bottom:0.5rem;border-radius:6px">
        <strong>Livraison #${l.id}</strong><br>
        Commande: ${l.commandeId || '—'}<br>
        Statut: <select data-id="${l.id}" class="status-select">
          <option ${l.statut==='En attente assignation'?'selected':''}>En attente assignation</option>
          <option ${l.statut==='Acceptée'?'selected':''}>Acceptée</option>
          <option ${l.statut==='En cours'?'selected':''}>En cours</option>
          <option ${l.statut==='Livrée'?'selected':''}>Livrée</option>
        </select>
        <button data-id="${l.id}" class="save-liv">Enregistrer</button>
      </div>
    `).join('\n');

    livDiv.querySelectorAll('.save-liv').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const id = e.target.dataset.id;
        const statut = livDiv.querySelector(`select.status-select[data-id="${id}"]`).value;
        const res = await window.api.updateLivraisonStatus(id, statut);
        if (res && res.success) alert('Statut mis à jour'); else alert('Erreur');
      });
    });

  } catch (err) { console.error(err); livDiv.innerText='Erreur.' }
});
