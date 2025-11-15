// Barre de menu dynamique selon les rôles
function renderMenu() {
  const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const nav = document.getElementById('main-menu');
  if (!nav) return;
  let links = [];
  if (!user) {
    links = [
      { href: 'index.html', label: 'Connexion' },
      { href: 'register.html', label: 'Inscription' }
    ];
  } else {
    links.push({ href: 'dashboard.html', label: 'Tableau de bord' });
    if ((user.roles||[]).includes('Client'))
      links.push({ href: 'restaurants.html', label: 'Restaurants' });
    if ((user.roles||[]).includes('Admin'))
      links.push({ href: 'admin.html', label: 'Administration' });
    if ((user.roles||[]).includes('Cuisinier') || (user.roles||[]).includes('Restaurant')) {
      links.push({ href: 'cook.html', label: 'Cuisinier' });
      links.push({ href: 'cook-orders.html', label: 'Commandes à préparer' });
    }
    if ((user.roles||[]).includes('Livreur')) {
      links.push({ href: 'livreur.html', label: 'Livreur' });
      links.push({ href: 'livreur-orders.html', label: 'Mes livraisons' });
    }
    links.push({ href: '#', label: 'Déconnexion', id: 'menu-logout' });
  }
  nav.innerHTML = links.map(l => `<a href="${l.href}"${l.id?` id='${l.id}'`:''}>${l.label}</a>`).join(' | ');
  // Déconnexion
  if (user && document.getElementById('menu-logout')) {
    document.getElementById('menu-logout').addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    });
  }
}

document.addEventListener('DOMContentLoaded', renderMenu);
