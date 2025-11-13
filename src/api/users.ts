import { prisma } from '@database/prisma-client';
import { Logger } from '@utils/logger';

export const UserService = {
  async getAllUsers() {
    try {
      return await prisma.utilisateur.findMany({
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération des utilisateurs', error);
      throw error;
    }
  },

  async getUserById(id: number) {
    try {
      return await prisma.utilisateur.findUnique({
        where: { id_utilisateur: id },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération de l\'utilisateur', error);
      throw error;
    }
  },

  async getUserByEmail(email: string) {
    try {
      return await prisma.utilisateur.findUnique({
        where: { email },
      });
    } catch (error) {
      Logger.error('Erreur lors de la récupération de l\'utilisateur par email', error);
      throw error;
    }
  },

  async createUser(data: {
    nom: string;
    prenom: string;
    email: string;
    mot_de_passe_hash: string;
    telephone?: string;
    adresse_livraison_default?: string;
  }) {
    try {
      return await prisma.utilisateur.create({
        data,
      });
    } catch (error) {
      Logger.error('Erreur lors de la création de l\'utilisateur', error);
      throw error;
    }
  },

  async updateUser(
    id: number,
    data: Partial<{
      nom: string;
      prenom: string;
      email: string;
      telephone: string;
      adresse_livraison_default: string;
      disponibilite: string;
      position_lat: number;
      position_lon: number;
    }>
  ) {
    try {
      return await prisma.utilisateur.update({
        where: { id_utilisateur: id },
        data,
      });
    } catch (error) {
      Logger.error('Erreur lors de la mise à jour de l\'utilisateur', error);
      throw error;
    }
  },

  async deleteUser(id: number) {
    try {
      return await prisma.utilisateur.delete({
        where: { id_utilisateur: id },
      });
    } catch (error) {
      Logger.error('Erreur lors de la suppression de l\'utilisateur', error);
      throw error;
    }
  },

  async assignRole(userId: number, roleId: number) {
    try {
      return await prisma.effectuerRole.create({
        data: {
          id_utilisateur: userId,
          id_role: roleId,
        },
      });
    } catch (error) {
      Logger.error('Erreur lors de l\'assignation du rôle', error);
      throw error;
    }
  },
};
