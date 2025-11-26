import { currentUser } from './state.js';

export function userHasRole(role: string): boolean {
  return !!(currentUser && Array.isArray(currentUser.roles) && currentUser.roles.includes(role));
}

export function canAccessView(viewId: string): boolean {
  switch (viewId) {
    case 'view-commandes':
      return userHasRole('Client');
    case 'view-cook':
      return userHasRole('Cuisinier');
    case 'view-livreur':
      return userHasRole('Livreur');
    case 'view-admin':
      return userHasRole('Admin');
    default:
      return true; 
  }
}

export function showView(viewId: string) {
  if (!canAccessView(viewId)) {
    console.warn('Accès refusé à la vue:', viewId);
    viewId = 'view-restaurants';
  }

  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active');
  }
}

export function showNavBar() {
  const navBar = document.getElementById('nav-bar');
  if (!navBar) return;
  
  navBar.classList.remove('d-none');

  const welcomeSpan = document.getElementById('nav-welcome');
  if (welcomeSpan && currentUser) {
    welcomeSpan.textContent = `Bienvenue, ${currentUser.prenom} !`;
  }

  const roles = currentUser?.roles || [];
  const navItems = [
    { id: 'nav-commandes', role: 'Client' },
    { id: 'nav-cook', role: 'Cuisinier' },
    { id: 'nav-livreur', role: 'Livreur' },
    { id: 'nav-admin', role: 'Admin' }
  ];

  navItems.forEach(({ id, role }) => {
    const nav = document.getElementById(id);
    if (nav && roles.includes(role)) {
      nav.classList.remove('d-none');
    }
  });
}

export function hideNavBar() {
  const navBar = document.getElementById('nav-bar');
  if (navBar) {
    navBar.classList.add('d-none');
  }
}

export function getStatusColor(statut: string): string {
  switch (statut.toLowerCase()) {
    case 'en attente':
      return '#ffc107';
    case 'en préparation':
      return '#17a2b8';
    case 'prête':
      return '#28a745';
    case 'en cours':
      return '#007bff';
    case 'livrée':
      return '#28a745';
    default:
      return '#6c757d';
  }
}
