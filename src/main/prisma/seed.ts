import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding...');

  // 1. Créer les rôles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { id_role: 1 },
      update: {},
      create: { id_role: 1, nom_role: 'Client' },
    }),
    prisma.role.upsert({
      where: { id_role: 2 },
      update: {},
      create: { id_role: 2, nom_role: 'Cuisinier' },
    }),
    prisma.role.upsert({
      where: { id_role: 3 },
      update: {},
      create: { id_role: 3, nom_role: 'Livreur' },
    }),
    prisma.role.upsert({
      where: { id_role: 4 },
      update: {},
      create: { id_role: 4, nom_role: 'Admin' },
    }),
  ]);
  console.log('✅ Rôles créés');

  // 2. Créer un utilisateur admin
  const hashedPassword = await bcrypt.hash('admin', 10);
  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@keynect.com' },
    update: {},
    create: {
      nom: 'Admin',
      prenom: 'Super',
      email: 'admin@keynect.com',
      mot_de_passe_hash: hashedPassword,
    },
  });
  
  await prisma.utilisateurRole.upsert({
    where: {
      id_utilisateur_id_role: {
        id_utilisateur: admin.id_utilisateur,
        id_role: 4, // Admin
      },
    },
    update: {},
    create: {
      id_utilisateur: admin.id_utilisateur,
      id_role: 4,
    },
  });
  console.log('✅ Admin créé (admin@keynect.com / admin)');

  // 3. Créer des restaurants de démonstration
  const resto1 = await prisma.restaurant.upsert({
    where: { id_restaurant: 1 },
    update: {},
    create: {
      nom: 'Le Burger Royal',
      adresse: '15 Rue de la Paix, Paris',
      telephone: '01 23 45 67 89',
      latitude: 48.8566,
      longitude: 2.3522,
    },
  });

  const resto2 = await prisma.restaurant.upsert({
    where: { id_restaurant: 2 },
    update: {},
    create: {
      nom: 'Pizza Paradise',
      adresse: '42 Avenue des Champs, Paris',
      telephone: '01 98 76 54 32',
      latitude: 48.8606,
      longitude: 2.3376,
    },
  });
  console.log('✅ Restaurants créés');

  // 4. Créer des sections de menu pour Le Burger Royal
  const section1 = await prisma.sectionMenu.upsert({
    where: { id_section: 1 },
    update: {},
    create: {
      nom: 'Burgers',
      description: 'Nos délicieux burgers faits maison',
      ordre: 1,
      id_restaurant: resto1.id_restaurant,
    },
  });

  const section2 = await prisma.sectionMenu.upsert({
    where: { id_section: 2 },
    update: {},
    create: {
      nom: 'Accompagnements',
      description: 'Pour compléter votre repas',
      ordre: 2,
      id_restaurant: resto1.id_restaurant,
    },
  });

  const section3 = await prisma.sectionMenu.upsert({
    where: { id_section: 3 },
    update: {},
    create: {
      nom: 'Pizzas',
      description: 'Nos pizzas artisanales',
      ordre: 1,
      id_restaurant: resto2.id_restaurant,
    },
  });
  console.log('✅ Sections de menu créées');

  // 5. Créer des produits
  await prisma.produit.createMany({
    data: [
      // Burgers
      {
        nom: 'Classic Burger',
        prix: 8.90,
        description: 'Burger classique avec bœuf, salade, tomate, oignon',
        id_section: section1.id_section,
        id_restaurant: resto1.id_restaurant,
      },
      {
        nom: 'Cheese Burger',
        prix: 9.90,
        description: 'Avec cheddar fondu',
        id_section: section1.id_section,
        id_restaurant: resto1.id_restaurant,
      },
      {
        nom: 'Royal Burger',
        prix: 12.90,
        description: 'Double viande, bacon, fromage',
        id_section: section1.id_section,
        id_restaurant: resto1.id_restaurant,
      },
      // Accompagnements
      {
        nom: 'Frites',
        prix: 3.50,
        description: 'Frites maison croustillantes',
        id_section: section2.id_section,
        id_restaurant: resto1.id_restaurant,
      },
      {
        nom: 'Onion Rings',
        prix: 4.50,
        description: 'Rondelles d\'oignon panées',
        id_section: section2.id_section,
        id_restaurant: resto1.id_restaurant,
      },
      // Pizzas
      {
        nom: 'Margherita',
        prix: 10.00,
        description: 'Sauce tomate, mozzarella, basilic',
        id_section: section3.id_section,
        id_restaurant: resto2.id_restaurant,
      },
      {
        nom: 'Quatre Fromages',
        prix: 12.50,
        description: 'Mozzarella, gorgonzola, parmesan, chèvre',
        id_section: section3.id_section,
        id_restaurant: resto2.id_restaurant,
      },
      {
        nom: 'Pepperoni',
        prix: 11.50,
        description: 'Sauce tomate, mozzarella, pepperoni',
        id_section: section3.id_section,
        id_restaurant: resto2.id_restaurant,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Produits créés');

  console.log('');
  console.log('🎉 Seeding terminé avec succès !');
  console.log('');
  console.log('📝 Compte admin :');
  console.log('   Email: admin@keynect.com');
  console.log('   Mot de passe: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
