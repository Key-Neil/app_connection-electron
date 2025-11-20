// ============ CONTROLLER D'AUTHENTIFICATION ============
const { getPrismaClient } = require('../utilitaires/prisma');
const { hashPassword, comparePasswords, buildSafeUser } = require('../utilitaires/auth');

const prisma = getPrismaClient();

/**
 * Enregistre un nouvel utilisateur
 * @param {Object} data - { nom, prenom, email, mot_de_passe }
 * @returns {Promise<{success: boolean, message: string, user?: Object}>}
 */
async function register(data) {
  const { nom, prenom, email, mot_de_passe } = data;

  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, message: 'Cet email est déjà utilisé.' };
    }

    // Hasher le mot de passe
    const mot_de_passe_hash = await hashPassword(mot_de_passe);

    // Créer le nouvel utilisateur
    const newUser = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        mot_de_passe_hash,
      },
    });

    // Assigner le rôle Client par défaut (id_role: 1)
    await prisma.utilisateur.update({
      where: { id_utilisateur: newUser.id_utilisateur },
      data: {
        roles: {
          connect: { id_role: 1 },
        },
      },
    });

    return { success: true, message: 'Compte créé avec succès !' };
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    return { success: false, message: 'Erreur lors de la création du compte.' };
  }
}

/**
 * Authentifie un utilisateur
 * @param {Object} data - { email, mot_de_passe }
 * @returns {Promise<{success: boolean, message: string, user?: Object}>}
 */
async function login(data) {
  const { email, mot_de_passe } = data;

  try {
    // Chercher l'utilisateur par email
    const user = await prisma.utilisateur.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user) {
      return { success: false, message: 'Email ou mot de passe incorrect.' };
    }

    // Vérifier le mot de passe
    const isMatch = await comparePasswords(mot_de_passe, user.mot_de_passe_hash);

    if (!isMatch) {
      return { success: false, message: 'Email ou mot de passe incorrect.' };
    }

    return {
      success: true,
      message: `Bienvenue, ${user.prenom} !`,
      user: buildSafeUser(user),
    };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return { success: false, message: 'Erreur lors de la connexion.' };
  }
}

module.exports = {
  register,
  login,
};
