import { prisma } from '@database/prisma-client';
import { Logger } from '@utils/logger';

export const RestaurantService = {
  async getAllRestaurants() {
    try {
      return await prisma.restaurant.findMany({
        include: {
          produits: true,
          staff: {
            include: {
              utilisateur: true,
            },
          },
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération des restaurants', error);
      throw error;
    }
  },

  async getRestaurantById(id: number) {
    try {
      return await prisma.restaurant.findUnique({
        where: { id_restaurant: id },
        include: {
          produits: true,
          staff: {
            include: {
              utilisateur: true,
            },
          },
          commandes_recues: true,
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération du restaurant', error);
      throw error;
    }
  },

  async createRestaurant(data: {
    nom: string;
    adresse?: string;
    telephone?: string;
    latitude?: number;
    longitude?: number;
  }) {
    try {
      return await prisma.restaurant.create({
        data,
      });
    } catch (error) {
      Logger.error('Erreur lors de la création du restaurant', error);
      throw error;
    }
  },

  async updateRestaurant(
    id: number,
    data: Partial<{
      nom: string;
      adresse: string;
      telephone: string;
      latitude: number;
      longitude: number;
    }>
  ) {
    try {
      return await prisma.restaurant.update({
        where: { id_restaurant: id },
        data,
      });
    } catch (error) {
      Logger.error('Erreur lors de la mise à jour du restaurant', error);
      throw error;
    }
  },

  async deleteRestaurant(id: number) {
    try {
      return await prisma.restaurant.delete({
        where: { id_restaurant: id },
      });
    } catch (error) {
      Logger.error('Erreur lors de la suppression du restaurant', error);
      throw error;
    }
  },

  async addStaffMember(restaurantId: number, userId: number) {
    try {
      return await prisma.restaurantStaff.create({
        data: {
          id_restaurant: restaurantId,
          id_utilisateur: userId,
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de l\'ajout du membre du staff', error);
      throw error;
    }
  },
};
