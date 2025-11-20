document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(sessionStorage.getItem('currentUser')||'null');
  if (!user) { window.location.href='index.html'; return; }
  const listDiv = document.getElementById('orders-list');
  listDiv.innerText = 'Chargement...';
  try {
    const commandes = await window.api.getCommandesForCook(user.id);
    if (!commandes || commandes.length === 0) { listDiv.innerText = 'Aucune commande à préparer.'; return; }
    listDiv.innerHTML = commandes.map(c => `
      <div style="border:1px solid #eee;padding:1rem;margin-bottom:1rem;border-radius:8px">
        <strong>Commande #${c.id}</strong> — <em>${new Date(c.date).toLocaleString()}</em><br>
        Client: ${c.client?.prenom||''} ${c.client?.nom||''}<br>
        Statut: <select data-id="${c.id}" class="status-select">
          <option ${c.statut==='En attente'?'selected':''}>En attente</option>
          <option ${c.statut==='En préparation'?'selected':''}>En préparation</option>
          <option ${c.statut==='Prête'?'selected':''}>Prête</option>
        </select>
        <button data-id="${c.id}" class="save-order">Enregistrer</button>
        <div>Produits : ${(c.details||[]).map(d=>`${d.produit?.nom||'produit'} x${d.quantite}`).join(', ')}</div>
      </div>
    `).join('');
    listDiv.querySelectorAll('.save-order').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.dataset.id;
        const statut = listDiv.querySelector(`select.status-select[data-id='${id}']`).value;
        const res = await window.api.updateCommandeStatus(user.id, id, statut);
        if (res && res.success) alert('Statut mis à jour'); else alert('Erreur: '+(res && res.error?res.error:''));
      });
    });
  } catch (err) { listDiv.innerText = 'Erreur.'; }
});
