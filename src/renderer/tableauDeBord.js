document.addEventListener('DOMContentLoaded', async () => {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('welcome').innerText = `Bienvenue, ${user.prenom}`;
  document.getElementById('user-roles').innerText = `Rôles : ${ (user.roles || []).join(', ') }`;

  const commandesContainer = document.getElementById('commandes');
  commandesContainer.innerText = 'Chargement des commandes...';

  try {
    const commandes = await window.api.getCommandes(user.id);
    console.log('Commandes reçues:', commandes);
    
    if (!commandes || commandes.length === 0) {
      commandesContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <p style="color: #666; font-size: 1.1rem;">Aucune commande pour le moment.</p>
          <p style="color: #999;">Commencez à commander pour voir vos commandes ici.</p>
          <a href="restaurants.html" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #007aff; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">Commander maintenant</a>
        </div>
      `;
    } else {
      const ul = document.createElement('div');
      ul.innerHTML = commandes.map(c => {
        const details = (c.details || []).map(d => `${d.produit?.nom || 'produit'} x${d.quantite}`).join(', ');
        return `
          <div style="border:1px solid #eee;padding:0.75rem;margin-bottom:0.5rem;border-radius:6px">
            <strong>Commande #${c.id}</strong> — <em>${new Date(c.date).toLocaleString()}</em><br>
            Restaurant: ${c.restaurant?.nom || '—'}<br>
            Statut: ${c.statut || '—'}<br>
            Produits: ${details}
          </div>`;
      }).join('\n');
      commandesContainer.innerHTML = ul.innerHTML;
    }
  } catch (err) {
    console.error('Erreur getCommandes:', err);
    commandesContainer.innerHTML = `
      <div style="color: #d32f2f; padding: 1.5rem; background: #ffebee; border-radius: 8px; border-left: 4px solid #d32f2f;">
        <strong>Erreur lors du chargement des commandes</strong><br>
        <small>${err.message || 'Une erreur est survenue'}</small><br>
        <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;">Réessayer</button>
      </div>
    `;
  }

  document.getElementById('logout').addEventListener('click', () => {
    try {
      if (typeof clearSession === 'function') { clearSession(); return; }
    } catch (e) { /* fallback */ }
    sessionStorage.removeItem('currentUser');
    document.body.style.pointerEvents = 'auto';
    window.location.href = 'index.html';
  });

  // Affiche liens selon rôles
  const linksDiv = document.getElementById('role-links');
  const roles = user.roles || [];
  const links = [];
  if (roles.includes('Admin')) links.push('<a href="admin.html">Administration</a>');
  if (roles.includes('Cuisinier') || roles.includes('Restaurant')) links.push('<a href="cook.html">Interface Cuisinier</a>');
  if (roles.includes('Livreur')) links.push('<a href="livreur.html">Interface Livreur</a>');
  if (links.length) linksDiv.innerHTML = links.join(' &nbsp; | &nbsp; ');
});
