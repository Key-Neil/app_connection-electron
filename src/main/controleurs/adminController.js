
const { getPrismaClient } = require('../utilitaires/prisma');
const { userHasAnyRole } = require('../utilitaires/auth');
const prisma = getPrismaClient();
async function getRoles() {
  try {
    const roles = await prisma.role.findMany({ orderBy: { id_role: 'asc' } });
    return roles.map(r => ({ id: r.id_role, nom: r.nom_role }));
  } catch (err) {
    console.error('Erreur lors de la récupération des rôles:', err);
    return [];
  }
}
async function getUsers() {
  try {
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
async function setRoles(userId, roleNames) {
  try {
    const roles = await prisma.role.findMany({
      where: { nom_role: { in: roleNames } },
    });
    const roleConnect = roles.map(r => ({ id_role: r.id_role }));
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
async function getProfile(userId) {
  try {
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
