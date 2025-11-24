
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('auth', {
  register: (data) => ipcRenderer.invoke('auth:register', data),
  login: (data) => ipcRenderer.invoke('auth:login', data),
});

contextBridge.exposeInMainWorld('api', {
  getProfile: (userId) => ipcRenderer.invoke('user:getProfile', userId),
  getCommandes: (userId) => ipcRenderer.invoke('user:getCommandes', userId),
  getRoles: () => ipcRenderer.invoke('admin:getRoles'),
  getUsers: () => ipcRenderer.invoke('admin:getUsers'),
  setRoles: (userId, roleNames) => ipcRenderer.invoke('admin:setRoles', userId, roleNames),
  getRestaurantsForCook: (userId) => ipcRenderer.invoke('cook:getRestaurants', userId),
  updateRestaurant: (restaurantId, data) => ipcRenderer.invoke('cook:updateRestaurant', restaurantId, data),
  getCommandesForCook: (userId) => ipcRenderer.invoke('cook:getCommandes', userId),
  updateCommandeStatus: (userId, commandeId, statut) => ipcRenderer.invoke('cook:updateCommandeStatus', userId, commandeId, statut),
  getDeliveriesForLivreur: (userId) => ipcRenderer.invoke('livreur:getDeliveries', userId),
  updateLivraisonStatus: (userId, livraisonId, statut) => ipcRenderer.invoke('livreur:updateLivraisonStatus', userId, livraisonId, statut),
  getAvailableCommandes: () => ipcRenderer.invoke('livreur:getAvailableCommandes'),
  createLivraison: (userId, commandeId) => ipcRenderer.invoke('livreur:createLivraison', userId, commandeId),
  getAllRestaurants: () => ipcRenderer.invoke('restaurant:getAll'),
  addRestaurant: (userId, data) => ipcRenderer.invoke('restaurant:add', userId, data),
  deleteRestaurant: (userId, id) => ipcRenderer.invoke('restaurant:delete', userId, id),
  addProduit: (userId, sectionId, produit) => ipcRenderer.invoke('restaurant:addProduit', userId, sectionId, produit),
  updateProduit: (userId, produitId, data) => ipcRenderer.invoke('restaurant:updateProduit', userId, produitId, data),
  deleteProduit: (userId, produitId) => ipcRenderer.invoke('restaurant:deleteProduit', userId, produitId),
  addSection: (userId, restaurantId, data) => ipcRenderer.invoke('restaurant:addSection', userId, restaurantId, data),
  updateSection: (userId, sectionId, data) => ipcRenderer.invoke('restaurant:updateSection', userId, sectionId, data),
  deleteSection: (userId, sectionId) => ipcRenderer.invoke('restaurant:deleteSection', userId, sectionId),
  createCommande: (userId, payload) => ipcRenderer.invoke('commande:create', userId, payload),
  // Admin - attach staff to restaurant
  addStaffToRestaurant: (staffUserId, restaurantId) => ipcRenderer.invoke('admin:addStaffToRestaurant', staffUserId, restaurantId),
  removeStaffFromRestaurant: (staffUserId, restaurantId) => ipcRenderer.invoke('admin:removeStaffFromRestaurant', staffUserId, restaurantId),
 });