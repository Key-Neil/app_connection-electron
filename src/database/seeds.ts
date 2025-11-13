import { prisma } from './prisma-client';

async function main(): Promise<void> {
  console.log('🌱 Démarrage du seed de la base de données...');

  try {
    // Créer des rôles par défaut
    const clientRole = await prisma.role.upsert({
      where: { nom_role: 'client' },
      update: {},
      create: { nom_role: 'client' },
    });

    const delivererRole = await prisma.role.upsert({
      where: { nom_role: 'livreur' },
      update: {},
      create: { nom_role: 'livreur' },
    });

    const restaurantRole = await prisma.role.upsert({
      where: { nom_role: 'restaurant' },
      update: {},
      create: { nom_role: 'restaurant' },
    });

    const adminRole = await prisma.role.upsert({
      where: { nom_role: 'admin' },
      update: {},
      create: { nom_role: 'admin' },
    });

    console.log('✅ Rôles créés:', {
      client: clientRole.id_role,
      deliverer: delivererRole.id_role,
      restaurant: restaurantRole.id_role,
      admin: adminRole.id_role,
    });

    console.log('✅ Seed complété avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
