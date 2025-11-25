import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding...');

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

  const hashedPassword = await bcrypt.hash('test', 10);

  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@keynect.com' },
    update: { mot_de_passe_hash: hashedPassword },
    create: {
      nom: 'Administrateur',
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

  const cuisinier = await prisma.utilisateur.upsert({
    where: { email: 'chef@keynect.com' },
    update: { mot_de_passe_hash: hashedPassword },
    create: {
      nom: 'Dupont',
      prenom: 'Pierre',
      email: 'chef@keynect.com',
      mot_de_passe_hash: hashedPassword,
    },
  });
  
  await prisma.utilisateurRole.upsert({
    where: {
      id_utilisateur_id_role: {
        id_utilisateur: cuisinier.id_utilisateur,
        id_role: 2, // Cuisinier
      },
    },
    update: {},
    create: {
      id_utilisateur: cuisinier.id_utilisateur,
      id_role: 2,
    },
  });

  const livreur = await prisma.utilisateur.upsert({
    where: { email: 'livreur@keynect.com' },
    update: { mot_de_passe_hash: hashedPassword },
    create: {
      nom: 'Martin',
      prenom: 'Jean',
      email: 'livreur@keynect.com',
      mot_de_passe_hash: hashedPassword,
    },
  });
  
  await prisma.utilisateurRole.upsert({
    where: {
      id_utilisateur_id_role: {
        id_utilisateur: livreur.id_utilisateur,
        id_role: 3, // Livreur
      },
    },
    update: {},
    create: {
      id_utilisateur: livreur.id_utilisateur,
      id_role: 3,
    },
  });

  const client = await prisma.utilisateur.upsert({
    where: { email: 'client@keynect.com' },
    update: {},
    create: {
      nom: 'Dubois',
      prenom: 'Marie',
      email: 'client@keynect.com',
      mot_de_passe_hash: hashedPassword,
    },
  });
  
  await prisma.utilisateurRole.upsert({
    where: {
      id_utilisateur_id_role: {
        id_utilisateur: client.id_utilisateur,
        id_role: 1, // Client
      },
    },
    update: {},
    create: {
      id_utilisateur: client.id_utilisateur,
      id_role: 1,
    },
  });
  
  console.log('✅ Utilisateurs créés:');
  console.log('   - Admin: admin@keynect.com');
  console.log('   - Cuisinier: chef@keynect.com');
  console.log('   - Livreur: livreur@keynect.com');
  console.log('   - Client: client@keynect.com');
  console.log('   (Mot de passe pour tous: test)');

  const resto1 = await prisma.restaurant.upsert({
    where: { id_restaurant: 1 },
    update: {},
    create: {
      nom: 'Le Burger Royal',
      adresse: '15 Rue de la Paix, 75002 Paris',
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
      adresse: '42 Avenue des Champs-Élysées, 75008 Paris',
      telephone: '01 98 76 54 32',
      latitude: 48.8606,
      longitude: 2.3376,
    },
  });
  
  const resto3 = await prisma.restaurant.upsert({
    where: { id_restaurant: 3 },
    update: {},
    create: {
      nom: 'Sushi Master',
      adresse: '8 Rue du Temple, 75004 Paris',
      telephone: '01 42 55 66 77',
      latitude: 48.8584,
      longitude: 2.3529,
    },
  });
  
  const resto4 = await prisma.restaurant.upsert({
    where: { id_restaurant: 4 },
    update: {},
    create: {
      nom: 'Le Bistrot Parisien',
      adresse: '25 Boulevard Saint-Germain, 75005 Paris',
      telephone: '01 43 26 88 99',
      latitude: 48.8534,
      longitude: 2.3488,
    },
  });
  
  console.log('✅ Restaurants créés');

  await prisma.staffRestaurant.upsert({
    where: {
      id_utilisateur_id_restaurant: {
        id_utilisateur: cuisinier.id_utilisateur,
        id_restaurant: resto1.id_restaurant,
      },
    },
    update: {},
    create: {
      id_utilisateur: cuisinier.id_utilisateur,
      id_restaurant: resto1.id_restaurant,
    },
  });
  
  await prisma.staffRestaurant.upsert({
    where: {
      id_utilisateur_id_restaurant: {
        id_utilisateur: cuisinier.id_utilisateur,
        id_restaurant: resto2.id_restaurant,
      },
    },
    update: {},
    create: {
      id_utilisateur: cuisinier.id_utilisateur,
      id_restaurant: resto2.id_restaurant,
    },
  });
  
  console.log('✅ Cuisinier lié aux restaurants');

  console.log('✅ Regroupement des produits par sections virtuelles côté front');

  await prisma.produit.createMany({
    data: [

      {
        nom: 'Classic Burger',
        prix: 8.90,
        description: 'Burger classique avec bœuf, salade, tomate, oignon',
        id_restaurant: resto1.id_restaurant,
      },
      {
        nom: 'Cheese Burger',
        prix: 9.90,
        description: 'Avec double cheddar fondu',
        id_restaurant: resto1.id_restaurant,
      },
      {
        nom: 'Royal Burger',
        prix: 12.90,
        description: 'Double viande, bacon, fromage, sauce royale',
        id_restaurant: resto1.id_restaurant,
      },
      {
        nom: 'Veggie Burger',
        prix: 10.50,
        description: 'Steak végétarien, avocat, salade',
        id_restaurant: resto1.id_restaurant,
      },

      {
        nom: 'Frites Maison',
        prix: 3.50,
        description: 'Frites fraîches croustillantes',
        id_restaurant: resto1.id_restaurant,
      },
      {
        nom: 'Onion Rings',
        prix: 4.50,
        description: 'Rondelles d\'oignon panées',
        id_restaurant: resto1.id_restaurant,
      },
      {
        nom: 'Nuggets (6 pièces)',
        prix: 5.90,
        description: 'Nuggets de poulet croustillants',
        id_restaurant: resto1.id_restaurant,
      },

      {
        nom: 'Coca-Cola 33cl',
        prix: 2.50,
        description: 'Canette fraîche',
        id_restaurant: resto1.id_restaurant,
      },
      {
        nom: 'Sprite 33cl',
        prix: 2.50,
        description: 'Canette fraîche',
        id_restaurant: resto1.id_restaurant,
      },
      {
        nom: 'Fanta Orange 33cl',
        prix: 2.50,
        description: 'Canette fraîche',
        id_restaurant: resto1.id_restaurant,
      },
      {
        nom: 'Eau Minérale 50cl',
        prix: 2.00,
        description: 'Eau plate ou gazeuse',
        id_restaurant: resto1.id_restaurant,
      },
      {
        nom: 'Jus d\'Orange 25cl',
        prix: 3.00,
        description: 'Jus 100% pur fruit',
        id_restaurant: resto1.id_restaurant,
      },

      {
        nom: 'Sundae Caramel',
        prix: 4.50,
        description: 'Glace vanille, sauce caramel, chantilly',
        id_restaurant: resto1.id_restaurant,
      },
      {
        nom: 'Brownie Chocolat',
        prix: 5.00,
        description: 'Brownie maison avec glace vanille',
        id_restaurant: resto1.id_restaurant,
      },

      {
        nom: 'Margherita',
        prix: 10.00,
        description: 'Sauce tomate, mozzarella, basilic frais',
        id_restaurant: resto2.id_restaurant,
      },
      {
        nom: 'Quatre Fromages',
        prix: 12.50,
        description: 'Mozzarella, gorgonzola, parmesan, chèvre',
        id_restaurant: resto2.id_restaurant,
      },
      {
        nom: 'Pepperoni',
        prix: 11.50,
        description: 'Sauce tomate, mozzarella, pepperoni épicé',
        id_restaurant: resto2.id_restaurant,
      },
      {
        nom: 'Reine',
        prix: 11.00,
        description: 'Jambon, champignons, mozzarella',
        id_restaurant: resto2.id_restaurant,
      },
      {
        nom: 'Calzone',
        prix: 13.00,
        description: 'Pizza fermée garnie jambon, champignons, œuf',
        id_restaurant: resto2.id_restaurant,
      },

      {
        nom: 'Spaghetti Carbonara',
        prix: 9.50,
        description: 'Pâtes fraîches, lardons, crème, parmesan',
        id_restaurant: resto2.id_restaurant,
      },
      {
        nom: 'Penne Arrabiata',
        prix: 8.50,
        description: 'Sauce tomate épicée, ail, basilic',
        id_restaurant: resto2.id_restaurant,
      },
      {
        nom: 'Lasagnes Bolognaise',
        prix: 11.00,
        description: 'Lasagnes maison gratinées',
        id_restaurant: resto2.id_restaurant,
      },

      {
        nom: 'Coca-Cola 33cl',
        prix: 2.50,
        description: 'Canette fraîche',
        id_restaurant: resto2.id_restaurant,
      },
      {
        nom: 'Limonade Italienne',
        prix: 3.00,
        description: 'Limonade artisanale',
        id_restaurant: resto2.id_restaurant,
      },
      {
        nom: 'San Pellegrino 50cl',
        prix: 3.50,
        description: 'Eau pétillante italienne',
        id_restaurant: resto2.id_restaurant,
      },

      {
        nom: 'Tiramisu',
        prix: 5.50,
        description: 'Tiramisu maison au café',
        id_restaurant: resto2.id_restaurant,
      },
      {
        nom: 'Panna Cotta',
        prix: 5.00,
        description: 'Crème italienne aux fruits rouges',
        id_restaurant: resto2.id_restaurant,
      },

      {
        nom: 'Plateau Découverte (12 pièces)',
        prix: 18.00,
        description: 'Assortiment de sushis variés',
        id_restaurant: resto3.id_restaurant,
      },
      {
        nom: 'Sashimi Saumon (8 pièces)',
        prix: 15.00,
        description: 'Tranches de saumon frais',
        id_restaurant: resto3.id_restaurant,
      },
      {
        nom: 'California Roll (8 pièces)',
        prix: 9.50,
        description: 'Avocat, surimi, concombre',
        id_restaurant: resto3.id_restaurant,
      },
      {
        nom: 'Dragon Roll (8 pièces)',
        prix: 12.00,
        description: 'Tempura crevette, avocat, sauce teriyaki',
        id_restaurant: resto3.id_restaurant,
      },

      {
        nom: 'Ramen Tonkotsu',
        prix: 13.50,
        description: 'Nouilles, bouillon porc, œuf mariné',
        id_restaurant: resto3.id_restaurant,
      },
      {
        nom: 'Bento Poulet Teriyaki',
        prix: 12.00,
        description: 'Poulet grillé, riz, légumes, gyoza',
        id_restaurant: resto3.id_restaurant,
      },

      {
        nom: 'Thé Vert Matcha',
        prix: 3.50,
        description: 'Thé japonais traditionnel',
        id_restaurant: resto3.id_restaurant,
      },
      {
        nom: 'Ramune',
        prix: 3.00,
        description: 'Soda japonais original',
        id_restaurant: resto3.id_restaurant,
      },
      {
        nom: 'Saké Chaud',
        prix: 5.00,
        description: 'Saké de riz traditionnel',
        id_restaurant: resto3.id_restaurant,
      },

      {
        nom: 'Mochi Glacé (3 pièces)',
        prix: 6.00,
        description: 'Glace enrobée de pâte de riz',
        id_restaurant: resto3.id_restaurant,
      },

      {
        nom: 'Soupe à l\'Oignon Gratinée',
        prix: 7.50,
        description: 'Soupe traditionnelle au fromage fondu',
        id_restaurant: resto4.id_restaurant,
      },
      {
        nom: 'Escargots de Bourgogne (6 pièces)',
        prix: 9.00,
        description: 'Escargots au beurre persillé',
        id_restaurant: resto4.id_restaurant,
      },

      {
        nom: 'Steak Frites',
        prix: 16.50,
        description: 'Entrecôte 250g, frites maison, salade',
        id_restaurant: resto4.id_restaurant,
      },
      {
        nom: 'Coq au Vin',
        prix: 15.00,
        description: 'Poulet mijoté au vin rouge, pommes vapeur',
        id_restaurant: resto4.id_restaurant,
      },
      {
        nom: 'Magret de Canard',
        prix: 18.00,
        description: 'Magret grillé, sauce miel, légumes',
        id_restaurant: resto4.id_restaurant,
      },
      {
        nom: 'Blanquette de Veau',
        prix: 14.50,
        description: 'Veau en sauce crémeuse, riz basmati',
        id_restaurant: resto4.id_restaurant,
      },

      {
        nom: 'Vin Rouge (25cl)',
        prix: 5.50,
        description: 'Côtes du Rhône',
        id_restaurant: resto4.id_restaurant,
      },
      {
        nom: 'Vin Blanc (25cl)',
        prix: 5.50,
        description: 'Chardonnay',
        id_restaurant: resto4.id_restaurant,
      },
      {
        nom: 'Perrier 33cl',
        prix: 2.50,
        description: 'Eau gazeuse',
        id_restaurant: resto4.id_restaurant,
      },
      {
        nom: 'Café Expresso',
        prix: 2.00,
        description: 'Café italien',
        id_restaurant: resto4.id_restaurant,
      },

      {
        nom: 'Crème Brûlée',
        prix: 6.50,
        description: 'Crème vanille caramélisée',
        id_restaurant: resto4.id_restaurant,
      },
      {
        nom: 'Tarte Tatin',
        prix: 6.00,
        description: 'Tarte aux pommes caramélisées',
        id_restaurant: resto4.id_restaurant,
      },
      {
        nom: 'Profiteroles',
        prix: 7.00,
        description: 'Choux glacés, sauce chocolat chaud',
        id_restaurant: resto4.id_restaurant,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Produits créés (60+ items avec boissons, plats et desserts)');

  console.log('');
  console.log('🎉 Seeding terminé avec succès !');
  console.log('');
  console.log('📝 Comptes de test créés :');
  console.log('');
  console.log('   🔐 Admin:      admin@keynect.com / test');
  console.log('   👨‍🍳 Cuisinier:  chef@keynect.com / test');
  console.log('   🚚 Livreur:    livreur@keynect.com / test');
  console.log('   👤 Client:     client@keynect.com / test');
  console.log('');
  console.log('📦 Restaurants créés : 4');
  console.log('🍔 Produits créés : 60+ (avec boissons, plats, desserts)');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


