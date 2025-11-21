import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface RestaurantData {
  nom: string;
  adresse: string;
  telephone: string;
  latitude: number;
  longitude: number;
  produits: {
    create: Array<{
      nom: string;
      prix: number;
      description: string;
      url_photo: null;
      prix_promo: null;
    }>;
  };
}

async function main(): Promise<void> {
  console.log('Seeding roles...');

  const roles: string[] = ['Client', 'Livreur', 'Restaurant', 'Cuisinier', 'Admin'];
  for (const nom_role of roles) {
    await prisma.role.upsert({
      where: { nom_role },
      update: {},
      create: { nom_role },
    });
  }

  console.log('Seeding default admin user...');
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'admin';
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const adminRole = await prisma.role.findUnique({ where: { nom_role: 'Admin' } });

  if (!adminRole) {
    throw new Error('Admin role not found');
  }

  await prisma.utilisateur.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nom: 'Admin',
      prenom: 'Principal',
      email: adminEmail,
      mot_de_passe_hash: adminHash,
      telephone: null,
      adresse_livraison_default: null,
      disponibilite: null,
      position_lat: null,
      position_lon: null,
      roles: {
        connect: [{ id_role: adminRole.id_role }],
      },
    },
  });

  console.log('Seeding default restaurants...');
  const restaurantsData: RestaurantData[] = [
    {
      nom: 'Le Gourmet',
      adresse: '123 Rue de Paris',
      telephone: '0102030405',
      latitude: 48.8566,
      longitude: 2.3522,
      produits: {
        create: [
          {
            nom: 'Menu Découverte',
            prix: 25.0,
            description: 'Entrée, plat, dessert. Découvrez la cuisine du chef.',
            url_photo: null,
            prix_promo: null,
          },
          {
            nom: 'Menu Végétarien',
            prix: 22.0,
            description: 'Un menu complet sans viande, plein de saveurs.',
            url_photo: null,
            prix_promo: null,
          },
        ],
      },
    },
    {
      nom: 'Pizza Bella',
      adresse: '45 Avenue d'Italie',
      telephone: '0607080910',
      latitude: 48.8301,
      longitude: 2.3556,
      produits: {
        create: [
          {
            nom: 'Menu Pizza Classique',
            prix: 18.0,
            description: 'Pizza au choix + boisson + dessert.',
            url_photo: null,
            prix_promo: null,
          },
          {
            nom: 'Menu Duo',
            prix: 32.0,
            description: '2 pizzas au choix + 2 boissons.',
            url_photo: null,
            prix_promo: null,
          },
        ],
      },
    },
    {
      nom: 'Sushi Zen',
      adresse: '88 Boulevard du Japon',
      telephone: '0112233445',
      latitude: 48.8700,
      longitude: 2.3700,
      produits: {
        create: [
          {
            nom: 'Menu Sushi Découverte',
            prix: 28.0,
            description: 'Assortiment de sushis, makis et sashimis.',
            url_photo: null,
            prix_promo: null,
          },
          {
            nom: 'Menu Bento',
            prix: 24.0,
            description: 'Bento complet avec riz, poisson, légumes.',
            url_photo: null,
            prix_promo: null,
          },
        ],
      },
    },
  ];

  for (const resto of restaurantsData) {
    const exists = await prisma.restaurant.findFirst({ where: { nom: resto.nom } });
    if (!exists) {
      await prisma.restaurant.create({ data: resto });
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch((e: Error) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
