const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('auth', {
  register: (data) => ipcRenderer.invoke('auth:register', data),
  login: (data) => ipcRenderer.invoke('auth:login', data),
});

contextBridge.exposeInMainWorld('api', {
  getProfile: (userId) => ipcRenderer.invoke('user:getProfile', userId),
  getCommandes: (userId) => ipcRenderer.invoke('user:getCommandes', userId),
  // Admin
  getRoles: () => ipcRenderer.invoke('admin:getRoles'),
  getUsers: () => ipcRenderer.invoke('admin:getUsers'),
  setRoles: (userId, roleNames) => ipcRenderer.invoke('admin:setRoles', userId, roleNames),
  // Cook
  getRestaurantsForCook: (userId) => ipcRenderer.invoke('cook:getRestaurants', userId),
  updateRestaurant: (restaurantId, data) => ipcRenderer.invoke('cook:updateRestaurant', restaurantId, data),
  // Livreur
  getDeliveriesForLivreur: (userId) => ipcRenderer.invoke('livreur:getDeliveries', userId),
  updateLivraisonStatus: (livraisonId, statut) => ipcRenderer.invoke('livreur:updateLivraisonStatus', livraisonId, statut),
});
