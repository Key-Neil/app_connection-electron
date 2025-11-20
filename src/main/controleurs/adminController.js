// ============ CONTROLLER ADMINISTRATION ============
const { getPrismaClient } = require('../utilitaires/prisma');
const { userHasAnyRole } = require('../utilitaires/auth');

const prisma = getPrismaClient();

/**
 * Récupère tous les rôles disponibles
 * @returns {Promise<Array>}
 */
async function getRoles() {
  try {
    // Récupérer les rôles de la base de données
    const roles = await prisma.role.findMany({ orderBy: { id_role: 'asc' } });
    
    return roles.map(r => ({ id: r.id_role, nom: r.nom_role }));
  } catch (err) {
    console.error('Erreur lors de la récupération des rôles:', err);
    return [];
  }
}

/**
 * Récupère tous les utilisateurs avec leurs rôles
 * @returns {Promise<Array>}
 */
async function getUsers() {
  try {
    // Récupérer tous les utilisateurs avec leurs rôles
    const users = await prisma.utilisateur.findMany({
      include: { roles: true },
    });
    
    return users.map(u => ({
      id: u.id_utilisateur,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      roles: (u.roles || []).map(r => r.nom_role),
    }));
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err);
    return [];
  }
}

/**
 * Assigne des rôles à un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {Array<string>} roleNames - Noms des rôles à assigner
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function setRoles(userId, roleNames) {
  try {
    // Récupérer les rôles par nom
    const roles = await prisma.role.findMany({
      where: { nom_role: { in: roleNames } },
    });
    const roleConnect = roles.map(r => ({ id_role: r.id_role }));

    // Mettre à jour les rôles de l'utilisateur
    await prisma.utilisateur.update({
      where: { id_utilisateur: Number(userId) },
      data: {
        roles: {
          set: [],
          connect: roleConnect,
        },
      },
    });
    
    return { success: true };
  } catch (err) {
    console.error('Erreur lors de l\'assignation des rôles:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Récupère le profil d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>}
 */
async function getProfile(userId) {
  try {
    // Récupérer les informations de l'utilisateur
    const user = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: Number(userId) },
      include: { roles: true },
      select: {
        id_utilisateur: true,
        prenom: true,
        email: true,
        roles: true,
      },
    });
    
    if (!user) return null;
    
    return {
      id: user.id_utilisateur,
      prenom: user.prenom,
      email: user.email,
      roles: (user.roles || []).map(r => r.nom_role),
    };
  } catch (err) {
    console.error('Erreur lors de la récupération du profil:', err);
    return null;
  }
}

module.exports = {
  getRoles,
  getUsers,
  setRoles,
  getProfile,
};
