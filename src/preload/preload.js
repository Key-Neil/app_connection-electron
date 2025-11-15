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
  // Cook orders
  getCommandesForCook: (userId) => ipcRenderer.invoke('cook:getCommandes', userId),
  updateCommandeStatus: (userId, commandeId, statut) => ipcRenderer.invoke('cook:updateCommandeStatus', userId, commandeId, statut),
  // Livreur
  getDeliveriesForLivreur: (userId) => ipcRenderer.invoke('livreur:getDeliveries', userId),
  updateLivraisonStatus: (userId, livraisonId, statut) => ipcRenderer.invoke('livreur:updateLivraisonStatus', userId, livraisonId, statut),
  // Livreur: available commandes + assign
  getAvailableCommandes: () => ipcRenderer.invoke('livreur:getAvailableCommandes'),
  createLivraison: (userId, commandeId) => ipcRenderer.invoke('livreur:createLivraison', userId, commandeId),
  // Restaurants (client + admin/cuisinier)
  getAllRestaurants: () => ipcRenderer.invoke('restaurant:getAll'),
  addRestaurant: (userId, data) => ipcRenderer.invoke('restaurant:add', userId, data),
  deleteRestaurant: (userId, id) => ipcRenderer.invoke('restaurant:delete', userId, id),
  addProduit: (userId, restaurantId, produit) => ipcRenderer.invoke('restaurant:addProduit', userId, restaurantId, produit),
  updateProduit: (userId, produitId, data) => ipcRenderer.invoke('restaurant:updateProduit', userId, produitId, data),
  deleteProduit: (userId, produitId) => ipcRenderer.invoke('restaurant:deleteProduit', userId, produitId),
  // Commande
  createCommande: (userId, payload) => ipcRenderer.invoke('commande:create', userId, payload),
});
