
const { getPrismaClient } = require('../utilitaires/prisma');
const { userHasAnyRole } = require('../utilitaires/auth');
const prisma = getPrismaClient();
async function getRoles() {
  try {
    const roles = await prisma.role.findMany({ orderBy: { id_role: 'asc' } });
    return roles.map(r => ({ id: r.id_role, nom: r.nom_role }));
  } catch (err) {
    console.error('Erreur lors de la récupération des rôles:', err);
    return [];
  }
}
async function getUsers() {
  try {
    const users = await prisma.utilisateur.findMany({
      include: { roles: true },
    });
    return users.map(u => ({
      id: u.id_utilisateur,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      roles: (u.roles || []).map(r => r.nom_role),
    }));
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err);
    return [];
  }
}
async function setRoles(userId, roleNames) {
  try {
    const roles = await prisma.role.findMany({
      where: { nom_role: { in: roleNames } },
    });
    const roleConnect = roles.map(r => ({ id_role: r.id_role }));
    await prisma.utilisateur.update({
      where: { id_utilisateur: Number(userId) },
      data: {
        roles: {
          set: [],
          connect: roleConnect,
        },
      },
    });
    return { success: true };
  } catch (err) {
    console.error('Erreur lors de l\'assignation des rôles:', err);
    return { success: false, error: err.message };
  }
}
async function getProfile(userId) {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: Number(userId) },
      include: { roles: true },
      select: {
        id_utilisateur: true,
        prenom: true,
        email: true,
        roles: true,
      },
    });
    if (!user) return null;
    return {
      id: user.id_utilisateur,
      prenom: user.prenom,
      email: user.email,
      roles: (user.roles || []).map(r => r.nom_role),
    };
  } catch (err) {
    console.error('Erreur lors de la récupération du profil:', err);
    return null;
  }
}

async function addStaffToRestaurant(staffUserId, restaurantId) {
  try {
    await prisma.restaurant.update({
      where: { id_restaurant: Number(restaurantId) },
      data: { staff: { connect: { id_utilisateur: Number(staffUserId) } } },
    });
    return { success: true };
  } catch (err) {
    console.error('Erreur lors du rattachement du staff au restaurant:', err);
    return { success: false, error: err.message };
  }
}

async function removeStaffFromRestaurant(staffUserId, restaurantId) {
  try {
    await prisma.restaurant.update({
      where: { id_restaurant: Number(restaurantId) },
      data: { staff: { disconnect: { id_utilisateur: Number(staffUserId) } } },
    });
    return { success: true };
  } catch (err) {
    console.error('Erreur lors du détachement du staff du restaurant:', err);
    return { success: false, error: err.message };
  }
}

async function getAllCommandes() {
  try {
    const commandes = await prisma.commande.findMany({
      include: {
        client: { select: { prenom: true, nom: true, email: true } },
        restaurant: { select: { nom: true } },
        livraison: {
          include: {
            livreur: { select: { prenom: true, nom: true } }
          }
        },
        details_commande: {
          include: {
            produit: { select: { nom: true, prix: true } },
          },
        },
      },
      orderBy: { date_commande: 'desc' },
    });
    return commandes.map(c => ({
      id: c.id_commande,
      date: c.date_commande,
      statut: c.statut,
      total: c.details_commande.reduce((sum, d) => sum + (d.prix_unitaire * d.quantite), 0),
      client: c.client ? `${c.client.prenom} ${c.client.nom || ''}` : 'Client inconnu',
      clientEmail: c.client?.email || '',
      restaurant: c.restaurant?.nom || 'Restaurant inconnu',
      livreur: c.livraison && c.livraison.livreur ? `${c.livraison.livreur.prenom} ${c.livraison.livreur.nom || ''}` : 'Aucun',
      lignes: c.details_commande.map(l => ({
        produit: l.produit?.nom || 'Produit inconnu',
        quantite: l.quantite,
        prix: l.prix_unitaire,
      })),
    }));
  } catch (err) {
    console.error('Erreur lors de la récupération de toutes les commandes:', err);
    return [];
  }
}

async function createRestaurant(data) {
  try {
    const restaurant = await prisma.restaurant.create({
      data: {
        nom: data.nom,
        adresse: data.adresse,
        telephone: data.telephone,
        latitude: data.latitude || 48.8566,
        longitude: data.longitude || 2.3522,
      },
    });
    return { success: true, restaurant };
  } catch (err) {
    console.error('Erreur lors de la création du restaurant:', err);
    return { success: false, error: err.message };
  }
}

async function deleteRestaurant(restaurantId) {
  try {
    await prisma.restaurant.delete({
      where: { id_restaurant: Number(restaurantId) },
    });
    return { success: true };
  } catch (err) {
    console.error('Erreur lors de la suppression du restaurant:', err);
    return { success: false, error: err.message };
  }
}

async function updateRestaurant(restaurantId, data) {
  try {
    const restaurant = await prisma.restaurant.update({
      where: { id_restaurant: Number(restaurantId) },
      data: {
        nom: data.nom,
        adresse: data.adresse,
        telephone: data.telephone,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
    return { success: true, restaurant };
  } catch (err) {
    console.error('Erreur lors de la mise à jour du restaurant:', err);
    return { success: false, error: err.message };
  }
}

async function createSection(restaurantId, data) {
  try {
    const section = await prisma.sectionMenu.create({
      data: {
        nom: data.nom,
        description: data.description || null,
        ordre: data.ordre || 0,
        id_restaurant: Number(restaurantId),
      },
    });
    return { success: true, section };
  } catch (err) {
    console.error('Erreur lors de la création de la section:', err);
    return { success: false, error: err.message };
  }
}

async function updateSection(sectionId, data) {
  try {
    const section = await prisma.sectionMenu.update({
      where: { id_section: Number(sectionId) },
      data: {
        nom: data.nom,
        description: data.description,
        ordre: data.ordre,
      },
    });
    return { success: true, section };
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la section:', err);
    return { success: false, error: err.message };
  }
}

async function deleteSection(sectionId) {
  try {
    await prisma.sectionMenu.delete({
      where: { id_section: Number(sectionId) },
    });
    return { success: true };
  } catch (err) {
    console.error('Erreur lors de la suppression de la section:', err);
    return { success: false, error: err.message };
  }
}

async function createProduit(sectionId, data) {
  try {
    // Récupérer la section pour obtenir l'id_restaurant
    const section = await prisma.sectionMenu.findUnique({
      where: { id_section: Number(sectionId) },
      select: { id_restaurant: true },
    });
    
    if (!section) {
      throw new Error('Section non trouvée');
    }
    
    const produit = await prisma.produit.create({
      data: {
        nom: data.nom,
        prix: data.prix,
        description: data.description || null,
        url_photo: data.url_photo || null,
        prix_promo: data.prix_promo || null,
        id_section: Number(sectionId),
        id_restaurant: section.id_restaurant,
      },
    });
    return { success: true, produit };
  } catch (err) {
    console.error('Erreur lors de la création du produit:', err);
    return { success: false, error: err.message };
  }
}

async function updateProduit(produitId, data) {
  try {
    const produit = await prisma.produit.update({
      where: { id_produit: Number(produitId) },
      data: {
        nom: data.nom,
        prix: data.prix,
        description: data.description,
        url_photo: data.url_photo,
        prix_promo: data.prix_promo,
      },
    });
    return { success: true, produit };
  } catch (err) {
    console.error('Erreur lors de la mise à jour du produit:', err);
    return { success: false, error: err.message };
  }
}

async function deleteProduit(produitId) {
  try {
    await prisma.produit.delete({
      where: { id_produit: Number(produitId) },
    });
    return { success: true };
  } catch (err) {
    console.error('Erreur lors de la suppression du produit:', err);
    return { success: false, error: err.message };
  }
}

module.exports = {
  getRoles,
  getUsers,
  setRoles,
  getProfile,
  addStaffToRestaurant,
  removeStaffFromRestaurant,
  getAllCommandes,
  createRestaurant,
  deleteRestaurant,
  updateRestaurant,
  createSection,
  updateSection,
  deleteSection,
  createProduit,
  updateProduit,
  deleteProduit,
};

export {};
