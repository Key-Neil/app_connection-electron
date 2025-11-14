const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Fonction principale pour "semer" la base de données
 */
async function main() {
  console.log('Début du seeding...');

  // 1. Créer les Rôles
  // upsert = "update" ou "insert".
  // S'il existe, il ne fait rien. S'il n'existe pas, il le crée.
  // C'est parfait pour éviter les doublons si on lance le seed plusieurs fois.
  
  const roleClient = await prisma.role.upsert({
    where: { nom_role: 'Client' },
    update: {},
    create: {
      nom_role: 'Client',
    },
  });

  const roleLivreur = await prisma.role.upsert({
    where: { nom_role: 'Livreur' },
    update: {},
    create: {
      nom_role: 'Livreur',
    },
  });

  const roleEmploye = await prisma.role.upsert({
    where: { nom_role: 'Employe' },
    update: {},
    create: {
      nom_role: 'Employe',
    },
  });

  const roleAdmin = await prisma.role.upsert({
    where: { nom_role: 'Admin' },
    update: {},
    create: {
      nom_role: 'Admin',
    },
  });

  console.log('Rôles créés ou vérifiés :');
  console.log({ roleClient, roleLivreur, roleEmploye, roleAdmin });
  
  console.log('Seeding terminé.');
}

// Exécuter la fonction principale et gérer les erreurs
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Fermer la connexion à la base de données
    await prisma.$disconnect();
  });