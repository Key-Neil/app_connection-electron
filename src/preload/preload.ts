

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('auth', {

  register: (data: any) => ipcRenderer.invoke('auth:register', data),

  login: (data: any) => ipcRenderer.invoke('auth:login', data),
});

contextBridge.exposeInMainWorld('api', {

  getProfile: (userId: number) => 
    ipcRenderer.invoke('user:getProfile', userId),

  getAllRestaurants: () => 
    ipcRenderer.invoke('restaurant:getAll'),

  addRestaurant: (userId: number, data: any) => 
    ipcRenderer.invoke('restaurant:add', userId, data),

  deleteRestaurant: (userId: number, id: number) => 
    ipcRenderer.invoke('restaurant:delete', userId, id),

  updateRestaurant: (restaurantId: number, data: any) => 
    ipcRenderer.invoke('restaurant:update', restaurantId, data),

  getRestaurantsForCook: (userId: number) => 
    ipcRenderer.invoke('cook:getRestaurants', userId),

  addProduit: (userId: number, sectionId: number, produit: any) => 
    ipcRenderer.invoke('restaurant:addProduit', userId, sectionId, produit),

  updateProduit: (userId: number, produitId: number, data: any) => 
    ipcRenderer.invoke('restaurant:updateProduit', userId, produitId, data),

  deleteProduit: (userId: number, produitId: number) => 
    ipcRenderer.invoke('restaurant:deleteProduit', userId, produitId),

  addSection: (userId: number, restaurantId: number, data: any) => 
    ipcRenderer.invoke('admin:createSection', restaurantId, data),

  updateSection: (userId: number, restaurantId: number, sectionId: number, data: any) => 
    ipcRenderer.invoke('admin:updateSection', restaurantId, sectionId, data),

  deleteSection: (userId: number, restaurantId: number, sectionId: number) => 
    ipcRenderer.invoke('admin:deleteSection', restaurantId, sectionId),

  createCommande: (userId: number, payload: any) => 
    ipcRenderer.invoke('commande:create', userId, payload),

  getCommandesForClient: (userId: number) => 
    ipcRenderer.invoke('commande:getForClient', userId),

  getCommandesForCook: (userId: number) => 
    ipcRenderer.invoke('commande:getForCook', userId),

  updateCommandeStatus: (userId: number, commandeId: number, statut: string) => 
    ipcRenderer.invoke('commande:updateStatus', userId, commandeId, statut),

  getLivraisonsForLivreur: (userId: number) => 
    ipcRenderer.invoke('livraison:getForLivreur', userId),

  getAvailableCommandes: () => 
    ipcRenderer.invoke('livraison:getAvailableCommandes'),

  createLivraison: (userId: number, commandeId: number) => 
    ipcRenderer.invoke('livraison:create', userId, commandeId),

  updateLivraisonStatus: (userId: number, livraisonId: number, statut: string) => 
    ipcRenderer.invoke('livraison:updateStatus', userId, livraisonId, statut),

  getRoles: () => 
    ipcRenderer.invoke('admin:getRoles'),

  getUsers: () => 
    ipcRenderer.invoke('admin:getUsers'),

  setRoles: (userId: number, roleNames: string[]) => 
    ipcRenderer.invoke('admin:setRoles', userId, roleNames),

  addStaffToRestaurant: (staffUserId: number, restaurantId: number) => 
    ipcRenderer.invoke('admin:addStaffToRestaurant', staffUserId, restaurantId),

  removeStaffFromRestaurant: (staffUserId: number, restaurantId: number) => 
    ipcRenderer.invoke('admin:removeStaffFromRestaurant', staffUserId, restaurantId),

  getAllCommandes: () => 
    ipcRenderer.invoke('admin:getAllCommandes'),

  adminCreateRestaurant: (data: any) => 
    ipcRenderer.invoke('admin:createRestaurant', data),

  adminDeleteRestaurant: (restaurantId: number) => 
    ipcRenderer.invoke('admin:deleteRestaurant', restaurantId),

  adminUpdateRestaurant: (restaurantId: number, data: any) => 
    ipcRenderer.invoke('admin:updateRestaurant', restaurantId, data),

  adminCreateSection: (restaurantId: number, data: any) => 
    ipcRenderer.invoke('admin:createSection', restaurantId, data),

  adminUpdateSection: (restaurantId: number, sectionId: number, data: any) => 
    ipcRenderer.invoke('admin:updateSection', restaurantId, sectionId, data),

  adminDeleteSection: (restaurantId: number, sectionId: number) => 
    ipcRenderer.invoke('admin:deleteSection', restaurantId, sectionId),

  adminAddProduit: (restaurantId: number, sectionId: number, produit: any) => 
    ipcRenderer.invoke('admin:addProduit', restaurantId, sectionId, produit),

  adminEditProduit: (restaurantId: number, sectionId: number, produitId: number, updates: any) => 
    ipcRenderer.invoke('admin:editProduit', restaurantId, sectionId, produitId, updates),

  adminDeleteProduit: (restaurantId: number, sectionId: number, produitId: number) => 
    ipcRenderer.invoke('admin:deleteProduit', restaurantId, sectionId, produitId),
});


