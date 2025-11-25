
const bcrypt = require('bcryptjs');
const { getPrismaClient } = require('./prisma');
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
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
async function comparePasswords(password, hash) {
  return bcrypt.compare(password, hash);
}
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

export {};

