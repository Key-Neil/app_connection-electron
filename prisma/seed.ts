import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface RestaurantData {
  nom: string;
  adresse: string;
  telephone: string;
  latitude: number;
  longitude: number;
  sections: {
    create: Array<{
      nom: string;
      description?: string | null;
      ordre?: number;
      produits?: {
        create: Array<{
          nom: string;
          prix: number;
          description?: string | null;
          url_photo?: string | null;
          prix_promo?: number | null;
        }>;
      };
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

  const admin = await prisma.utilisateur.upsert({
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
    },
  });

  await prisma.utilisateurRole.upsert({
    where: {
      id_utilisateur_id_role: {
        id_utilisateur: admin.id_utilisateur,
        id_role: adminRole.id_role,
      },
    },
    update: {},
    create: {
      id_utilisateur: admin.id_utilisateur,
      id_role: adminRole.id_role,
    },
  });

  console.log('Seeding default delivery driver...');
  const livreurEmail = 'livreur@gmail.com';
  const livreurPassword = 'livreur';
  const livreurHash = await bcrypt.hash(livreurPassword, 10);

  const livreurRole = await prisma.role.findUnique({ where: { nom_role: 'Livreur' } });

  if (!livreurRole) {
    throw new Error('Livreur role not found');
  }

  const livreur = await prisma.utilisateur.upsert({
    where: { email: livreurEmail },
    update: {},
    create: {
      nom: 'Dupont',
      prenom: 'Jean',
      email: livreurEmail,
      mot_de_passe_hash: livreurHash,
      telephone: '0612345678',
      adresse_livraison_default: null,
      disponibilite: 'disponible',
      position_lat: 48.8566,
      position_lon: 2.3522,
    },
  });

  await prisma.utilisateurRole.upsert({
    where: {
      id_utilisateur_id_role: {
        id_utilisateur: livreur.id_utilisateur,
        id_role: livreurRole.id_role,
      },
    },
    update: {},
    create: {
      id_utilisateur: livreur.id_utilisateur,
      id_role: livreurRole.id_role,
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
      sections: {
        create: [
          {
            nom: 'Menus',
            description: 'Menus du chef',
            ordre: 0,
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
        ],
      },
    },
    {
      nom: 'Pizza Bella',
      adresse: "45 Avenue d'Italie",
      telephone: '0607080910',
      latitude: 48.8301,
      longitude: 2.3556,
      sections: {
        create: [
          {
            nom: 'Pizzas',
            description: 'Nos pizzas maison',
            ordre: 0,
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
        ],
      },
    },
    {
      nom: 'Sushi Zen',
      adresse: '88 Boulevard du Japon',
      telephone: '0112233445',
      latitude: 48.8700,
      longitude: 2.3700,
      sections: {
        create: [
          {
            nom: 'Sushis',
            description: 'Sélection de sushis et makis',
            ordre: 0,
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
        ],
      },
    },
  ];

  for (const resto of restaurantsData) {
    const exists = await prisma.restaurant.findFirst({ where: { nom: resto.nom } });
    if (!exists) {
      // Create restaurant first
      const created = await prisma.restaurant.create({
        data: {
          nom: resto.nom,
          adresse: resto.adresse,
          telephone: resto.telephone,
          latitude: resto.latitude,
          longitude: resto.longitude,
        },
      });

      // Then create sections and products referencing the created restaurant
      if (resto.sections && Array.isArray(resto.sections.create)) {
        for (const sec of resto.sections.create) {
          const createdSection = await prisma.sectionMenu.create({
            data: {
              nom: sec.nom,
              description: sec.description ?? null,
              ordre: sec.ordre ?? 0,
              id_restaurant: created.id_restaurant,
            },
          });

          if (sec.produits && Array.isArray(sec.produits.create)) {
            for (const p of sec.produits.create) {
              await prisma.produit.create({
                data: {
                  nom: p.nom,
                  prix: p.prix,
                  description: p.description ?? null,
                  url_photo: p.url_photo ?? null,
                  prix_promo: p.prix_promo ?? null,
                  id_restaurant: created.id_restaurant,
                  id_section: createdSection.id_section,
                },
              });
            }
          }
        }
      }
    }
  }

  console.log('Seeding complete.');

  // Seed a default cook user and assign to a restaurant for testing
  console.log("Seeding default cook user and assigning to 'Le Gourmet'...");
  const cookEmail = 'cuisinier@gmail.com';
  const cookPassword = 'cuisinier';
  const cookHash = await bcrypt.hash(cookPassword, 10);
  const cookRole = await prisma.role.findUnique({ where: { nom_role: 'Cuisinier' } });
  const restoLeGourmet = await prisma.restaurant.findFirst({ where: { nom: 'Le Gourmet' } });
  if (cookRole) {
    const cookUser = await prisma.utilisateur.upsert({
      where: { email: cookEmail },
      update: {},
      create: {
        nom: 'Cuisinier',
        prenom: 'Chef',
        email: cookEmail,
        mot_de_passe_hash: cookHash,
        telephone: null,
        adresse_livraison_default: null,
        disponibilite: null,
        position_lat: null,
        position_lon: null,
      },
    });
    
    await prisma.utilisateurRole.upsert({
      where: {
        id_utilisateur_id_role: {
          id_utilisateur: cookUser.id_utilisateur,
          id_role: cookRole.id_role,
        },
      },
      update: {},
      create: {
        id_utilisateur: cookUser.id_utilisateur,
        id_role: cookRole.id_role,
      },
    });
    
    if (restoLeGourmet) {
      await prisma.staffRestaurant.upsert({
        where: {
          id_utilisateur_id_restaurant: {
            id_utilisateur: cookUser.id_utilisateur,
            id_restaurant: restoLeGourmet.id_restaurant,
          },
        },
        update: {},
        create: {
          id_utilisateur: cookUser.id_utilisateur,
          id_restaurant: restoLeGourmet.id_restaurant,
        },
      });
    }
  }
}

main()
  .catch((e: Error) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
