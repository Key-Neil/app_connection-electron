export {};

declare global {
  interface Window {
    api: {
      getProfile: (userId: number) => Promise<any>;
      getUsers: () => Promise<any[]>;
      getRoles: () => Promise<any[]>;
      setRoles: (userId: number, roles: string[]) => Promise<any>;

      getAllRestaurants: () => Promise<any[]>;
      addRestaurant: (userId: number, data: any) => Promise<any>;
      updateRestaurant: (restaurantId: number, data: any) => Promise<any>;
      deleteRestaurant: (userId: number, restaurantId: number) => Promise<any>;
      
      addSection: (userId: number, restaurantId: number, data: any) => Promise<any>;
      updateSection: (userId: number, sectionId: number, data: any) => Promise<any>;
      deleteSection: (userId: number, sectionId: number) => Promise<any>;

      addProduit: (userId: number, sectionId: number, data: any) => Promise<any>;
      updateProduit: (userId: number, produitId: number, data: any) => Promise<any>;
      deleteProduit: (userId: number, produitId: number) => Promise<any>;

      createCommande: (userId: number, payload: any) => Promise<any>;
      getCommandes: (userId: number) => Promise<any[]>;
      getCommandesForCook: (userId: number) => Promise<any[]>;
      getRestaurantsForCook: (userId: number) => Promise<any[]>;
      updateCommandeStatus: (userId: number, commandeId: number, statut: string) => Promise<any>;

      getAvailableCommandes: () => Promise<any[]>;
      getDeliveriesForLivreur: (userId: number) => Promise<any[]>;
      createLivraison: (userId: number, commandeId: number) => Promise<any>;
      updateLivraisonStatus: (userId: number, livraisonId: number, statut: string) => Promise<any>;

      // Admin
      addStaffToRestaurant: (staffUserId: number, restaurantId: number) => Promise<any>;
      removeStaffFromRestaurant: (staffUserId: number, restaurantId: number) => Promise<any>;
    };
    auth: {
      register: (data: any) => Promise<any>;
      login: (data: any) => Promise<any>;
    };
  }
}