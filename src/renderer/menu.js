// ============ BARRE DE MENU DYNAMIQUE ============

/**
 * Génère la barre de menu en fonction des rôles de l'utilisateur
 */
function renderMenu() {
  const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const nav = document.getElementById('main-menu');
  if (!nav) return;

  // Construire les liens en fonction de l'authentification et des rôles
  let links = [];

  if (!user) {
    // Utilisateur non connecté
    links = [
      { href: 'index.html', label: 'Connexion' },
      { href: 'register.html', label: 'Inscription' }
    ];
  } else {
    // Utilisateur connecté
    links.push({ href: 'tableauDeBord.html', label: 'Tableau de bord' });

    // Lien client
    if ((user.roles || []).includes('Client'))
      links.push({ href: 'restaurants.html', label: 'Restaurants' });

    // Lien admin
    if ((user.roles || []).includes('Admin'))
      links.push({ href: 'admin.html', label: 'Administration' });

    // Liens cuisinier
    if ((user.roles || []).includes('Cuisinier') || (user.roles || []).includes('Restaurant')) {
      links.push({ href: 'cuisinier.html', label: 'Cuisinier' });
      links.push({ href: 'commandes-cuisinier.html', label: 'Commandes à préparer' });
    }

    // Liens livreur
    if ((user.roles || []).includes('Livreur')) {
      links.push({ href: 'livreur.html', label: 'Livreur' });
      links.push({ href: 'livraisons.html', label: 'Mes livraisons' });
    }

    // Bouton déconnexion
    links.push({ href: '#', label: 'Déconnexion', id: 'menu-logout' });
  }

  // Générer le HTML du menu
  nav.innerHTML = links.map(l => `<a href="${l.href}"${l.id ? ` id='${l.id}'` : ''}>${l.label}</a>`).join(' | ');

  // Attacher l'événement de déconnexion
  if (user && document.getElementById('menu-logout')) {
    document.getElementById('menu-logout').addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    });
  }
}

// Rendre le menu lors du chargement de la page
document.addEventListener('DOMContentLoaded', renderMenu);
