// ============ UTILITAIRES D'AUTHENTIFICATION ============
const bcrypt = require('bcryptjs');
const { getPrismaClient } = require('./prisma');

/**
 * Vérifie si un utilisateur possède l'un des rôles spécifiés
 * @param {number} userId - ID de l'utilisateur
 * @param {Array<string>} allowedRoles - Liste des rôles autorisés
 * @returns {Promise<boolean>}
 */
async function userHasAnyRole(userId, allowedRoles) {
  try {
    const prisma = getPrismaClient();
    const u = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: Number(userId) },
      include: { roles: true },
    });
    if (!u) return false;
    const names = (u.roles || []).map(r => r.nom_role);
    return allowedRoles.some(ar => names.includes(ar));
  } catch (err) {
    console.error('Erreur lors de la vérification des rôles:', err);
    return false;
  }
}

/**
 * Hash un mot de passe avec bcryptjs
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare un mot de passe en clair avec son hash
 * @param {string} password - Mot de passe en clair
 * @param {string} hash - Hash du mot de passe stocké
 * @returns {Promise<boolean>}
 */
async function comparePasswords(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Construit un objet utilisateur sûr (sans données sensibles)
 * @param {Object} user - Utilisateur de la base de données
 * @returns {Object}
 */
function buildSafeUser(user) {
  return {
    id: user.id_utilisateur,
    prenom: user.prenom,
    email: user.email,
    roles: (user.roles || []).map(r => r.nom_role),
  };
}

module.exports = {
  userHasAnyRole,
  hashPassword,
  comparePasswords,
  buildSafeUser,
};
