// ============================================================
// GLOBAL.D.TS - Définitions TypeScript
// ============================================================
// Ce fichier déclare les types pour window.auth et window.api
// utilisés dans le renderer (frontend)
// ============================================================

export interface Window {
  auth: {
    register: (data: { nom: string; prenom: string; email: string; mot_de_passe: string }) => Promise<{ success: boolean; message: string }>;
    login: (data: { email: string; mot_de_passe: string }) => Promise<{ success: boolean; message: string; user?: any }>;
  };
  
  api: {
    // Profil utilisateur
    getProfile: (userId: number) => Promise<any>;
    
    // Restaurants
    getAllRestaurants: () => Promise<any[]>;
    addRestaurant: (userId: number, data: any) => Promise<{ success: boolean; restaurant?: any; error?: string }>;
    deleteRestaurant: (userId: number, id: number) => Promise<{ success: boolean; error?: string }>;
    updateRestaurant: (restaurantId: number, data: any) => Promise<{ success: boolean; restaurant?: any; error?: string }>;
    getRestaurantsForCook: (userId: number) => Promise<any[]>;
    
    // Produits
    addProduit: (userId: number, sectionId: number, produit: any) => Promise<{ success: boolean; produit?: any; error?: string }>;
    updateProduit: (userId: number, produitId: number, data: any) => Promise<{ success: boolean; produit?: any; error?: string }>;
    deleteProduit: (userId: number, produitId: number) => Promise<{ success: boolean; error?: string }>;
    
    // Sections
    addSection: (userId: number, restaurantId: number, data: any) => Promise<{ success: boolean; section?: any; error?: string }>;
    updateSection: (userId: number, sectionId: number, data: any) => Promise<{ success: boolean; section?: any; error?: string }>;
    deleteSection: (userId: number, sectionId: number) => Promise<{ success: boolean; error?: string }>;
    
    // Commandes (client)
    createCommande: (userId: number, payload: any) => Promise<{ success: boolean; commandeId?: number; error?: string }>;
    getCommandesForClient: (userId: number) => Promise<any[]>;
    
    // Commandes (cuisinier)
    getCommandesForCook: (userId: number) => Promise<any[]>;
    updateCommandeStatus: (userId: number, commandeId: number, statut: string) => Promise<{ success: boolean; commande?: any; error?: string }>;
    
    // Livraisons (livreur)
    getLivraisonsForLivreur: (userId: number) => Promise<any[]>;
    getAvailableCommandes: () => Promise<any[]>;
    createLivraison: (userId: number, commandeId: number) => Promise<{ success: boolean; livraisonId?: number; error?: string }>;
    updateLivraisonStatus: (userId: number, livraisonId: number, statut: string) => Promise<{ success: boolean; livraison?: any; error?: string }>;
    
    // Administration
    getRoles: () => Promise<any[]>;
    getUsers: () => Promise<any[]>;
    setRoles: (userId: number, roleNames: string[]) => Promise<{ success: boolean; error?: string }>;
    addStaffToRestaurant: (staffUserId: number, restaurantId: number) => Promise<{ success: boolean; error?: string }>;
    removeStaffFromRestaurant: (staffUserId: number, restaurantId: number) => Promise<{ success: boolean; error?: string }>;
    getAllCommandes: () => Promise<any[]>;
    adminCreateRestaurant: (data: any) => Promise<{ success: boolean; restaurant?: any; error?: string }>;
    adminDeleteRestaurant: (restaurantId: number) => Promise<{ success: boolean; error?: string }>;
    adminUpdateRestaurant: (restaurantId: number, data: any) => Promise<{ success: boolean; restaurant?: any; error?: string }>;
    adminCreateSection: (restaurantId: number, data: any) => Promise<{ success: boolean; section?: any; error?: string }>;
    adminUpdateSection: (sectionId: number, data: any) => Promise<{ success: boolean; section?: any; error?: string }>;
    adminDeleteSection: (sectionId: number) => Promise<{ success: boolean; error?: string }>;
    adminCreateProduit: (sectionId: number, data: any) => Promise<{ success: boolean; produit?: any; error?: string }>;
    adminUpdateProduit: (produitId: number, data: any) => Promise<{ success: boolean; produit?: any; error?: string }>;
    adminDeleteProduit: (produitId: number) => Promise<{ success: boolean; error?: string }>;
  };
}
