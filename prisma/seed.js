const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding roles...');

  const roles = ['Client', 'Livreur', 'Restaurant', 'Cuisinier', 'Admin'];

  for (const nom_role of roles) {
    await prisma.role.upsert({
      where: { nom_role },
      update: {},
      create: { nom_role },
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
