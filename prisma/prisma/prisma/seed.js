const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding...');

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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });