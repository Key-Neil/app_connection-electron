
const { getPrismaClient } = require('../utilitaires/prisma');
const { hashPassword, comparePasswords, buildSafeUser } = require('../utilitaires/auth');
const prisma = getPrismaClient();
async function register(data) {
  const { nom, prenom, email, mot_de_passe } = data;
  try {
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });
    if (existingUser) {
      return { success: false, message: 'Cet email est déjà utilisé.' };
    }
    const mot_de_passe_hash = await hashPassword(mot_de_passe);
    const newUser = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        mot_de_passe_hash,
      },
    });
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
async function login(data) {
  const { email, mot_de_passe } = data;
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email },
      include: { roles: true },
    });
    if (!user) {
      return { success: false, message: 'Email ou mot de passe incorrect.' };
    }
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
