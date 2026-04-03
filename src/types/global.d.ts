
export interface Window {
  auth: {
    register: (data: { nom: string; prenom: string; email: string; mot_de_passe: string }) => Promise<{ success: boolean; message: string }>;
    login: (data: { email: string; mot_de_passe: string }) => Promise<{ success: boolean; message: string; user?: any }>;
  };
  
  api: {
    getProfile: (userId: number) => Promise<any>;
    
    getAllRestaurants: () => Promise<any[]>;
    addRestaurant: (userId: number, data: any) => Promise<{ success: boolean; restaurant?: any; error?: string }>;
    deleteRestaurant: (userId: number, id: number) => Promise<{ success: boolean; error?: string }>;
    updateRestaurant: (restaurantId: number, data: any) => Promise<{ success: boolean; restaurant?: any; error?: string }>;
    getRestaurantsForCook: (userId: number) => Promise<any[]>;
    
    addProduit: (userId: number, sectionId: number, produit: any) => Promise<{ success: boolean; produit?: any; error?: string }>;
    updateProduit: (userId: number, produitId: number, data: any) => Promise<{ success: boolean; produit?: any; error?: string }>;
    deleteProduit: (userId: number, produitId: number) => Promise<{ success: boolean; error?: string }>;
    
    addSection: (userId: number, restaurantId: number, data: any) => Promise<{ success: boolean; section?: any; error?: string }>;
    updateSection: (userId: number, sectionId: number, data: any) => Promise<{ success: boolean; section?: any; error?: string }>;
    deleteSection: (userId: number, sectionId: number) => Promise<{ success: boolean; error?: string }>;
    
    createCommande: (userId: number, payload: any) => Promise<{ success: boolean; commandeId?: number; error?: string }>;
    getCommandesForClient: (userId: number) => Promise<any[]>;
    
    getCommandesForCook: (userId: number) => Promise<any[]>;
    updateCommandeStatus: (userId: number, commandeId: number, statut: string) => Promise<{ success: boolean; commande?: any; error?: string }>;
    
    getLivraisonsForLivreur: (userId: number) => Promise<any[]>;
    getAvailableCommandes: () => Promise<any[]>;
    createLivraison: (userId: number, commandeId: number) => Promise<{ success: boolean; livraisonId?: number; error?: string }>;
    updateLivraisonStatus: (userId: number, livraisonId: number, statut: string) => Promise<{ success: boolean; livraison?: any; error?: string }>;
    
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

  jarvis: {
    getConfig: () => Promise<{ hasApiKey: boolean; rules: string[] }>;
    saveConfig: (apiKey: string | null, rules: string[]) => Promise<{ success: boolean; error?: string }>;
    chat: (history: Array<{ role: 'user' | 'assistant'; content: string }>, userMessage: string) => Promise<{ success: boolean; reply?: string; error?: string }>;
    search: (query: string) => Promise<{ success: boolean; results?: string; error?: string }>;
  };
}

