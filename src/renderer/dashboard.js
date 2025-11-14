document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
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
    if (!commandes || commandes.length === 0) {
      commandesContainer.innerText = 'Aucune commande.';
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
    console.error(err);
    commandesContainer.innerText = 'Erreur lors du chargement des commandes.';
  }

  document.getElementById('logout').addEventListener('click', () => {
    sessionStorage.removeItem('currentUser');
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
