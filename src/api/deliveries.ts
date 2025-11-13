import { prisma } from '@database/prisma-client';
import { Logger } from '@utils/logger';

export const DeliveryService = {
  async getAllDeliveries() {
    try {
      return await prisma.livraison.findMany({
        include: {
          commande: {
            include: {
              client: true,
              restaurant: true,
            },
          },
          livreur: true,
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération des livraisons', error);
      throw error;
    }
  },

  async getDeliveryById(id: number) {
    try {
      return await prisma.livraison.findUnique({
        where: { id_livraison: id },
        include: {
          commande: {
            include: {
              client: true,
              restaurant: true,
            },
          },
          livreur: true,
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération de la livraison', error);
      throw error;
    }
  },

  async createDelivery(commandId: number) {
    try {
      return await prisma.livraison.create({
        data: {
          id_commande: commandId,
          statut_livraison: 'en_attente',
        },
        include: {
          commande: true,
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la création de la livraison', error);
      throw error;
    }
  },

  async assignDeliverer(deliveryId: number, delivererId: number) {
    try {
      return await prisma.livraison.update({
        where: { id_livraison: deliveryId },
        data: {
          id_livreur: delivererId,
          statut_livraison: 'assignee',
          heure_acceptation: new Date(),
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de l\'assignation du livreur', error);
      throw error;
    }
  },

  async updateDeliveryStatus(
    deliveryId: number,
    status: string,
    note?: string
  ) {
    try {
      const updateData: {
        statut_livraison: string;
        note_livraison?: string;
        heure_recuperation?: Date;
        heure_livraison_effective?: Date;
      } = {
        statut_livraison: status,
      };

      if (note) {
        updateData.note_livraison = note;
      }

      if (status === 'en_route') {
        updateData.heure_recuperation = new Date();
      }

      if (status === 'livree') {
        updateData.heure_livraison_effective = new Date();
      }

      return await prisma.livraison.update({
        where: { id_livraison: deliveryId },
        data: updateData,
      });
    } catch (error) {
      Logger.error('Erreur lors de la mise à jour du statut de livraison', error);
      throw error;
    }
  },

  async getDeliveriesByDeliverer(delivererId: number) {
    try {
      return await prisma.livraison.findMany({
        where: { id_livreur: delivererId },
        include: {
          commande: {
            include: {
              client: true,
              restaurant: true,
            },
          },
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération des livraisons du livreur', error);
      throw error;
    }
  },

  async getAvailableDeliveries() {
    try {
      return await prisma.livraison.findMany({
        where: {
          statut_livraison: 'en_attente',
          id_livreur: null,
        },
        include: {
          commande: {
            include: {
              client: true,
              restaurant: true,
            },
          },
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération des livraisons disponibles', error);
      throw error;
    }
  },
};
