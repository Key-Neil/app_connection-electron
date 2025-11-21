
const { getPrismaClient } = require('../utilitaires/prisma');
const { userHasAnyRole } = require('../utilitaires/auth');
const prisma = getPrismaClient();
async function getAllRestaurants() {
  try {
    const restos = await prisma.restaurant.findMany({
      include: {
        sections: {
          include: { produits: true },
          orderBy: { ordre: 'asc' }
        }
      },
    });
    return restos.map(r => ({
      id: r.id_restaurant,
      nom: r.nom,
      adresse: r.adresse,
      telephone: r.telephone,
      sections: (r.sections || []).map(s => ({
        id: s.id_section,
        nom: s.nom,
        description: s.description,
        ordre: s.ordre,
        produits: (s.produits || []).map(p => ({
          id: p.id_produit,
          nom: p.nom,
          prix: p.prix,
          description: p.description,
          url_photo: p.url_photo,
          prix_promo: p.prix_promo,
        })),
      })),
    }));
  } catch (err) {
    console.error('Erreur lors de la récupération des restaurants:', err);
    return [];
  }
}
async function addRestaurant(userId, data) {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    const resto = await prisma.restaurant.create({ data });
    try {
      const roleName = resto.nom;
      const existing = await prisma.role
        .findUnique({ where: { nom_role: roleName } })
        .catch(() => null);
      if (!existing) {
        await prisma.role.create({ data: { nom_role: roleName } });
      }
    } catch (err) {
      console.error('Erreur lors de la création du rôle du restaurant:', err);
    }
    return { success: true, restaurant: { id: resto.id_restaurant, nom: resto.nom } };
  } catch (err) {
    console.error('Erreur lors de l\'ajout du restaurant:', err);
    return { success: false, error: err.message };
  }
}
async function deleteRestaurant(userId, id) {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    const resto = await prisma.restaurant.findUnique({
      where: { id_restaurant: Number(id) },
    });
    const restoName = resto ? resto.nom : null;
    await prisma.restaurant.delete({ where: { id_restaurant: Number(id) } });
    try {
      if (restoName) await prisma.role.deleteMany({ where: { nom_role: restoName } });
    } catch (err) {
      console.error('Erreur lors de la suppression du rôle du restaurant:', err);
    }
    return { success: true };
  } catch (err) {
    console.error('Erreur lors de la suppression du restaurant:', err);
    return { success: false, error: err.message };
  }
}
async function addProduit(userId, sectionId, produit) {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    const section = await prisma.sectionMenu.findUnique({
      where: { id_section: Number(sectionId) }
    });
    if (!section) {
      return { success: false, error: 'Section non trouvée' };
    }
    const prod = await prisma.produit.create({
      data: {
        ...produit,
        id_restaurant: section.id_restaurant,
        id_section: Number(sectionId),
        prix: parseFloat(produit.prix)
      },
    });
    return { success: true, produit: { id: prod.id_produit, nom: prod.nom } };
  } catch (err) {
    console.error('Erreur lors de l\'ajout du produit:', err);
    return { success: false, error: err.message };
  }
}
async function updateProduit(userId, produitId, data) {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    const prod = await prisma.produit.update({
      where: { id_produit: Number(produitId) },
      data,
    });
    return { success: true, produit: { id: prod.id_produit, nom: prod.nom } };
  } catch (err) {
    console.error('Erreur lors de la mise à jour du produit:', err);
    return { success: false, error: err.message };
  }
}
async function deleteProduit(userId, produitId) {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    await prisma.produit.delete({ where: { id_produit: Number(produitId) } });
    return { success: true };
  } catch (err) {
    console.error('Erreur lors de la suppression du produit:', err);
    return { success: false, error: err.message };
  }
}
module.exports = {
  getAllRestaurants,
  addRestaurant,
  deleteRestaurant,
  addProduit,
  updateProduit,
  deleteProduit,
  addSection,
  updateSection,
  deleteSection,
};
async function addSection(userId, restaurantId, data) {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    const count = await prisma.sectionMenu.count({
      where: { id_restaurant: Number(restaurantId) }
    });
    const section = await prisma.sectionMenu.create({
      data: {
        ...data,
        id_restaurant: Number(restaurantId),
        ordre: count
      },
    });
    return { success: true, section: { id: section.id_section, nom: section.nom } };
  } catch (err) {
    console.error('Erreur lors de l\'ajout de la section:', err);
    return { success: false, error: err.message };
  }
}
async function updateSection(userId, sectionId, data) {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    const section = await prisma.sectionMenu.update({
      where: { id_section: Number(sectionId) },
      data,
    });
    return { success: true, section: { id: section.id_section, nom: section.nom } };
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la section:', err);
    return { success: false, error: err.message };
  }
}
async function deleteSection(userId, sectionId) {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    const count = await prisma.produit.count({
      where: { id_section: Number(sectionId) }
    });
    if (count > 0) {
      return { success: false, error: 'La section contient des produits. Supprimez-les d\'abord.' };
    }
    await prisma.sectionMenu.delete({
      where: { id_section: Number(sectionId) }
    });
    return { success: true };
  } catch (err) {
    console.error('Erreur lors de la suppression de la section:', err);
    return { success: false, error: err.message };
  }
}

export {};
