import { currentUser } from './state.js';
import { initInputObserver, forceInputInteractivity } from './utils.js';
import { showView } from './navigation.js';

import { initAuthModule } from './auth.js';
import { initRestaurantsModule, loadRestaurants } from './restaurants.js';
import { loadClientCommandes } from './commandes.js';
import { loadCookRestaurants, loadCookCommandes } from './cook.js';
import { loadLivreurLivraisons, loadLivreurAvailableCommandes } from './livreur.js';
import { initAdminModule, loadAdmin, loadAdminCommandes, loadAdminRestaurants } from './admin.js';

document.addEventListener('DOMContentLoaded', () => {
  initInputObserver();
  forceInputInteractivity();

  initAuthModule();
  initRestaurantsModule();
  initAdminModule();

  document.getElementById('nav-restaurants')?.addEventListener('click', () => {
    showView('view-restaurants');
    loadRestaurants();
  });

  document.getElementById('nav-commandes')?.addEventListener('click', () => {
    showView('view-commandes');
    loadClientCommandes();
  });

  document.getElementById('nav-cook')?.addEventListener('click', () => {
    showView('view-cook');
    loadCookRestaurants();
    loadCookCommandes();
  });

  document.getElementById('nav-livreur')?.addEventListener('click', () => {
    showView('view-livreur');
    loadLivreurLivraisons();
    loadLivreurAvailableCommandes();
  });

  document.getElementById('nav-admin')?.addEventListener('click', () => {
    showView('view-admin');

    const userTab = document.querySelector('.admin-tab[data-tab="users"]');
    const commandesTab = document.querySelector('.admin-tab[data-tab="commandes"]');
    const restaurantsTab = document.querySelector('.admin-tab[data-tab="restaurants"]');

    userTab?.classList.add('active');
    commandesTab?.classList.remove('active');
    restaurantsTab?.classList.remove('active');

    const usersContent = document.getElementById('admin-tab-users');
    const commandesContent = document.getElementById('admin-tab-commandes');
    const restaurantsContent = document.getElementById('admin-tab-restaurants');

    usersContent?.classList.add('active');
    commandesContent?.classList.remove('active');
    restaurantsContent?.classList.remove('active');

    loadAdmin();
  });

  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      const tabName = (tab as HTMLElement).dataset.tab;

      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const usersContent = document.getElementById('admin-tab-users');
      const commandesContent = document.getElementById('admin-tab-commandes');
      const restaurantsContent = document.getElementById('admin-tab-restaurants');

      usersContent?.classList.remove('active');
      commandesContent?.classList.remove('active');
      restaurantsContent?.classList.remove('active');

      if (tabName === 'users') {
        usersContent?.classList.add('active');
        loadAdmin();
      } else if (tabName === 'commandes') {
        commandesContent?.classList.add('active');
        await loadAdminCommandes();
      } else if (tabName === 'restaurants') {
        restaurantsContent?.classList.add('active');
        await loadAdminRestaurants();
      }
    });
  });

  document.getElementById('cook-refresh')?.addEventListener('click', () => {
    loadCookRestaurants();
    loadCookCommandes();
  });

  document.getElementById('livreur-refresh')?.addEventListener('click', () => {
    loadLivreurLivraisons();
    loadLivreurAvailableCommandes();
  });

  document.getElementById('admin-refresh')?.addEventListener('click', () => {
    loadAdmin();
  });

  document.getElementById('admin-commandes-refresh')?.addEventListener('click', () => {
    loadAdminCommandes();
  });

  showView('view-login');
});
