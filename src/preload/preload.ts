// ============================================================
// PRELOAD.TS - PONT ENTRE RENDERER ET MAIN
// ============================================================
// Ce fichier expose les APIs du backend au frontend de manière sécurisée
// grâce à contextBridge (contextIsolation activé dans Electron).
// Structure : window.auth + window.api
// ============================================================

const { contextBridge, ipcRenderer } = require('electron');

// ============================================================
// AUTHENTICATION API - Inscription & Connexion
// ============================================================
contextBridge.exposeInMainWorld('auth', {
  // Inscription d'un nouvel utilisateur
  register: (data: any) => ipcRenderer.invoke('auth:register', data),
  
  // Connexion d'un utilisateur existant
  login: (data: any) => ipcRenderer.invoke('auth:login', data),
});

// ============================================================
// MAIN API - Toutes les autres fonctionnalités
// ============================================================
contextBridge.exposeInMainWorld('api', {
  
  // --- PROFIL UTILISATEUR ---
  getProfile: (userId: number) => 
    ipcRenderer.invoke('user:getProfile', userId),
  
  // --- RESTAURANTS ---
  // Récupérer tous les restaurants avec leurs menus
  getAllRestaurants: () => 
    ipcRenderer.invoke('restaurant:getAll'),
  
  // Ajouter un restaurant (Admin/Cuisinier)
  addRestaurant: (userId: number, data: any) => 
    ipcRenderer.invoke('restaurant:add', userId, data),
  
  // Supprimer un restaurant (Admin/Cuisinier)
  deleteRestaurant: (userId: number, id: number) => 
    ipcRenderer.invoke('restaurant:delete', userId, id),
  
  // Mettre à jour un restaurant (Cuisinier)
  updateRestaurant: (restaurantId: number, data: any) => 
    ipcRenderer.invoke('restaurant:update', restaurantId, data),
  
  // Récupérer les restaurants d'un cuisinier
  getRestaurantsForCook: (userId: number) => 
    ipcRenderer.invoke('cook:getRestaurants', userId),
  
  // --- PRODUITS ---
  // Ajouter un produit à une section
  addProduit: (userId: number, sectionId: number, produit: any) => 
    ipcRenderer.invoke('restaurant:addProduit', userId, sectionId, produit),
  
  // Modifier un produit
  updateProduit: (userId: number, produitId: number, data: any) => 
    ipcRenderer.invoke('restaurant:updateProduit', userId, produitId, data),
  
  // Supprimer un produit
  deleteProduit: (userId: number, produitId: number) => 
    ipcRenderer.invoke('restaurant:deleteProduit', userId, produitId),
  
  // --- SECTIONS ---
  // Ajouter une section à un restaurant
  addSection: (userId: number, restaurantId: number, data: any) => 
    ipcRenderer.invoke('restaurant:addSection', userId, restaurantId, data),
  
  // Modifier une section
  updateSection: (userId: number, sectionId: number, data: any) => 
    ipcRenderer.invoke('restaurant:updateSection', userId, sectionId, data),
  
  // Supprimer une section
  deleteSection: (userId: number, sectionId: number) => 
    ipcRenderer.invoke('restaurant:deleteSection', userId, sectionId),
  
  // --- COMMANDES (CLIENT) ---
  // Créer une nouvelle commande
  createCommande: (userId: number, payload: any) => 
    ipcRenderer.invoke('commande:create', userId, payload),
  
  // Récupérer les commandes d'un client
  getCommandesForClient: (userId: number) => 
    ipcRenderer.invoke('commande:getForClient', userId),
  
  // --- COMMANDES (CUISINIER) ---
  // Récupérer les commandes pour un cuisinier
  getCommandesForCook: (userId: number) => 
    ipcRenderer.invoke('commande:getForCook', userId),
  
  // Mettre à jour le statut d'une commande
  updateCommandeStatus: (userId: number, commandeId: number, statut: string) => 
    ipcRenderer.invoke('commande:updateStatus', userId, commandeId, statut),
  
  // --- LIVRAISONS (LIVREUR) ---
  // Récupérer les livraisons d'un livreur
  getLivraisonsForLivreur: (userId: number) => 
    ipcRenderer.invoke('livraison:getForLivreur', userId),
  
  // Récupérer les commandes disponibles pour livraison
  getAvailableCommandes: () => 
    ipcRenderer.invoke('livraison:getAvailableCommandes'),
  
  // Créer une livraison (accepter une commande)
  createLivraison: (userId: number, commandeId: number) => 
    ipcRenderer.invoke('livraison:create', userId, commandeId),
  
  // Mettre à jour le statut d'une livraison
  updateLivraisonStatus: (userId: number, livraisonId: number, statut: string) => 
    ipcRenderer.invoke('livraison:updateStatus', userId, livraisonId, statut),
  
  // --- ADMINISTRATION ---
  // Récupérer tous les rôles
  getRoles: () => 
    ipcRenderer.invoke('admin:getRoles'),
  
  // Récupérer tous les utilisateurs
  getUsers: () => 
    ipcRenderer.invoke('admin:getUsers'),
  
  // Attribuer des rôles à un utilisateur
  setRoles: (userId: number, roleNames: string[]) => 
    ipcRenderer.invoke('admin:setRoles', userId, roleNames),
  
  // Rattacher un cuisinier à un restaurant
  addStaffToRestaurant: (staffUserId: number, restaurantId: number) => 
    ipcRenderer.invoke('admin:addStaffToRestaurant', staffUserId, restaurantId),
  
  // Détacher un cuisinier d'un restaurant
  removeStaffFromRestaurant: (staffUserId: number, restaurantId: number) => 
    ipcRenderer.invoke('admin:removeStaffFromRestaurant', staffUserId, restaurantId),
  
  // Récupérer toutes les commandes (admin)
  getAllCommandes: () => 
    ipcRenderer.invoke('admin:getAllCommandes'),
  
  // Créer un restaurant (admin)
  adminCreateRestaurant: (data: any) => 
    ipcRenderer.invoke('admin:createRestaurant', data),
  
  // Supprimer un restaurant (admin)
  adminDeleteRestaurant: (restaurantId: number) => 
    ipcRenderer.invoke('admin:deleteRestaurant', restaurantId),
  
  // Modifier un restaurant (admin)
  adminUpdateRestaurant: (restaurantId: number, data: any) => 
    ipcRenderer.invoke('admin:updateRestaurant', restaurantId, data),
  
  // Créer une section (admin/cook)
  adminCreateSection: (restaurantId: number, data: any) => 
    ipcRenderer.invoke('admin:createSection', restaurantId, data),
  
  // Modifier une section (admin/cook)
  adminUpdateSection: (sectionId: number, data: any) => 
    ipcRenderer.invoke('admin:updateSection', sectionId, data),
  
  // Supprimer une section (admin/cook)
  adminDeleteSection: (sectionId: number) => 
    ipcRenderer.invoke('admin:deleteSection', sectionId),
  
  // Créer un produit (admin/cook)
  adminCreateProduit: (sectionId: number, data: any) => 
    ipcRenderer.invoke('admin:createProduit', sectionId, data),
  
  // Modifier un produit (admin/cook)
  adminUpdateProduit: (produitId: number, data: any) => 
    ipcRenderer.invoke('admin:updateProduit', produitId, data),
  
  // Supprimer un produit (admin/cook)
  adminDeleteProduit: (produitId: number) => 
    ipcRenderer.invoke('admin:deleteProduit', produitId),
});
