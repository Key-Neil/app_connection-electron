declare global {
  interface Window {
    api: {
      getAllRestaurants: () => Promise<any>;
      getRestaurantsForCook: (userId: number) => Promise<any[]>;
      getCommandes: (userId: number) => Promise<any[]>;
      getCommandesForCook: (userId: number) => Promise<any[]>;
      getAvailableCommandes: () => Promise<any[]>;
      getDeliveriesForLivreur: (userId: number) => Promise<any[]>;
      createLivraison: (userId: number, commandeId: number) => Promise<any>;
      updateLivraisonStatus: (userId: number, livraisonId: number, statut: string) => Promise<any>;
      createCommande: (userId: number, payload: any) => Promise<any>;
      updateRestaurant: (restaurantId: number, data: any) => Promise<any>;
      addSection: (userId: number, restaurantId: number, data: any) => Promise<any>;
      updateSection: (userId: number, sectionId: number, data: any) => Promise<any>;
      deleteSection: (userId: number, sectionId: number) => Promise<any>;
      addProduit: (userId: number, sectionId: number, data: any) => Promise<any>;
      updateProduit: (userId: number, produitId: number, data: any) => Promise<any>;
      deleteProduit: (userId: number, produitId: number) => Promise<any>;
    };
    auth: {
      register: (data: any) => Promise<any>;
      login: (data: any) => Promise<any>;
    };
  }
}

export {};
