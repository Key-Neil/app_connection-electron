import { Utilisateur, Restaurant, Commande, Livraison, Produit, Role } from '@prisma/client';

// Types étendus avec relations
export interface UtilisateurComplet extends Utilisateur {
  roles?: EffectuerRole[];
  staff_de?: RestaurantStaff[];
  commandes_passees?: Commande[];
  livraisons_faites?: Livraison[];
}

export interface RestaurantComplet extends Restaurant {
  staff?: RestaurantStaff[];
  produits?: Produit[];
  commandes_recues?: Commande[];
}

export interface CommandeComplete extends Commande {
  client?: Utilisateur;
  restaurant?: Restaurant;
  details?: DetailCommande[];
  livraison?: Livraison;
}

export interface LivraisonComplete extends Livraison {
  commande?: CommandeComplete;
  livreur?: Utilisateur;
}

export interface IpcResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Importer depuis Prisma
export type {
  Role,
  Produit,
  EffectuerRole,
  RestaurantStaff,
  DetailCommande,
} from '@prisma/client';
