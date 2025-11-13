import { prisma } from '@database/prisma-client';
import { Logger } from '@utils/logger';

export const ProductService = {
  async getAllProducts() {
    try {
      return await prisma.produit.findMany({
        include: {
          restaurant: true,
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération des produits', error);
      throw error;
    }
  },

  async getProductById(id: number) {
    try {
      return await prisma.produit.findUnique({
        where: { id_produit: id },
        include: {
          restaurant: true,
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération du produit', error);
      throw error;
    }
  },

  async getProductsByRestaurant(restaurantId: number) {
    try {
      return await prisma.produit.findMany({
        where: { id_restaurant: restaurantId },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération des produits du restaurant', error);
      throw error;
    }
  },

  async createProduct(data: {
    nom: string;
    prix: number;
    id_restaurant: number;
    description?: string;
    url_photo?: string;
    prix_promo?: number;
  }) {
    try {
      return await prisma.produit.create({
        data,
      });
    } catch (error) {
      Logger.error('Erreur lors de la création du produit', error);
      throw error;
    }
  },

  async updateProduct(
    id: number,
    data: Partial<{
      nom: string;
      prix: number;
      description: string;
      url_photo: string;
      prix_promo: number;
    }>
  ) {
    try {
      return await prisma.produit.update({
        where: { id_produit: id },
        data,
      });
    } catch (error) {
      Logger.error('Erreur lors de la mise à jour du produit', error);
      throw error;
    }
  },

  async deleteProduct(id: number) {
    try {
      return await prisma.produit.delete({
        where: { id_produit: id },
      });
    } catch (error) {
      Logger.error('Erreur lors de la suppression du produit', error);
      throw error;
    }
  },
};
