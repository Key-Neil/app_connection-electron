import { prisma } from '@database/prisma-client';
import { Logger } from '@utils/logger';

export const CommandService = {
  async getAllCommands() {
    try {
      return await prisma.commande.findMany({
        include: {
          client: true,
          restaurant: true,
          details: {
            include: {
              produit: true,
            },
          },
          livraison: true,
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération des commandes', error);
      throw error;
    }
  },

  async getCommandById(id: number) {
    try {
      return await prisma.commande.findUnique({
        where: { id_commande: id },
        include: {
          client: true,
          restaurant: true,
          details: {
            include: {
              produit: true,
            },
          },
          livraison: true,
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération de la commande', error);
      throw error;
    }
  },

  async createCommand(data: {
    id_client: number;
    id_restaurant: number;
    statut: string;
    type_livraison?: string;
    temps_preparation_estime_min?: number;
    frais_livraison?: number;
  }) {
    try {
      return await prisma.commande.create({
        data,
        include: {
          client: true,
          restaurant: true,
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la création de la commande', error);
      throw error;
    }
  },

  async updateCommand(
    id: number,
    data: Partial<{
      statut: string;
      type_livraison: string;
      temps_preparation_estime_min: number;
      frais_livraison: number;
    }>
  ) {
    try {
      return await prisma.commande.update({
        where: { id_commande: id },
        data,
      });
    } catch (error) {
      Logger.error('Erreur lors de la mise à jour de la commande', error);
      throw error;
    }
  },

  async addDetailToCommand(
    commandId: number,
    productId: number,
    quantite: number,
    prix_unitaire: number
  ) {
    try {
      return await prisma.detailCommande.create({
        data: {
          id_commande: commandId,
          id_produit: productId,
          quantite,
          prix_unitaire,
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de l\'ajout de détail à la commande', error);
      throw error;
    }
  },

  async getCommandsByClient(clientId: number) {
    try {
      return await prisma.commande.findMany({
        where: { id_client: clientId },
        include: {
          restaurant: true,
          details: {
            include: {
              produit: true,
            },
          },
          livraison: true,
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération des commandes du client', error);
      throw error;
    }
  },

  async getCommandsByRestaurant(restaurantId: number) {
    try {
      return await prisma.commande.findMany({
        where: { id_restaurant: restaurantId },
        include: {
          client: true,
          details: {
            include: {
              produit: true,
            },
          },
          livraison: true,
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération des commandes du restaurant', error);
      throw error;
    }
  },
};
