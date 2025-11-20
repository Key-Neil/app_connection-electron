// ============ CONTROLLER DE RESTAURANTS ============
const { getPrismaClient } = require('../utilitaires/prisma');
const { userHasAnyRole } = require('../utilitaires/auth');

const prisma = getPrismaClient();

/**
 * Récupère tous les restaurants avec leurs produits groupés par sections
 * @returns {Promise<Array>}
 */
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

/**
 * Ajoute un nouveau restaurant (Admin/Cuisinier uniquement)
 * @param {number} userId - ID de l'utilisateur
 * @param {Object} data - { nom, adresse, telephone }
 * @returns {Promise<{success: boolean, restaurant?: Object, error?: string}>}
 */
async function addRestaurant(userId, data) {
  try {
    // Vérifier les autorisations
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    
    // Créer le restaurant
    const resto = await prisma.restaurant.create({ data });
    
    // Créer un rôle pour ce restaurant
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

/**
 * Supprime un restaurant (Admin/Cuisinier uniquement)
 * @param {number} userId - ID de l'utilisateur
 * @param {number} id - ID du restaurant
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteRestaurant(userId, id) {
  try {
    // Vérifier les autorisations
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    
    // Récupérer le restaurant avant suppression
    const resto = await prisma.restaurant.findUnique({
      where: { id_restaurant: Number(id) },
    });
    const restoName = resto ? resto.nom : null;
    
    // Supprimer le restaurant
    await prisma.restaurant.delete({ where: { id_restaurant: Number(id) } });
    
    // Supprimer le rôle associé
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

/**
 * Ajoute un produit à une section
 * @param {number} userId - ID de l'utilisateur
 * @param {number} sectionId - ID de la section
 * @param {Object} produit - { nom, description, prix, url_photo }
 * @returns {Promise<{success: boolean, produit?: Object, error?: string}>}
 */
async function addProduit(userId, sectionId, produit) {
  try {
    // Vérifier les autorisations
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    
    // Récupérer la section pour avoir l'ID du restaurant
    const section = await prisma.sectionMenu.findUnique({
      where: { id_section: Number(sectionId) }
    });
    
    if (!section) {
      return { success: false, error: 'Section non trouvée' };
    }
    
    // Créer le produit
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

/**
 * Met à jour un produit
 * @param {number} userId - ID de l'utilisateur
 * @param {number} produitId - ID du produit
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise<{success: boolean, produit?: Object, error?: string}>}
 */
async function updateProduit(userId, produitId, data) {
  try {
    // Vérifier les autorisations
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    
    // Mettre à jour le produit
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

/**
 * Supprime un produit
 * @param {number} userId - ID de l'utilisateur
 * @param {number} produitId - ID du produit
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteProduit(userId, produitId) {
  try {
    // Vérifier les autorisations
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    
    // Supprimer le produit
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

/**
 * Ajoute une nouvelle section de menu à un restaurant
 * @param {number} userId - ID de l'utilisateur
 * @param {number} restaurantId - ID du restaurant
 * @param {Object} data - { nom, description }
 * @returns {Promise<{success: boolean, section?: Object, error?: string}>}
 */
async function addSection(userId, restaurantId, data) {
  try {
    // Vérifier les autorisations
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    
    // Récupérer le nombre de sections existantes pour définir l'ordre
    const count = await prisma.sectionMenu.count({
      where: { id_restaurant: Number(restaurantId) }
    });
    
    // Créer la section
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

/**
 * Met à jour une section de menu
 * @param {number} userId - ID de l'utilisateur
 * @param {number} sectionId - ID de la section
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise<{success: boolean, section?: Object, error?: string}>}
 */
async function updateSection(userId, sectionId, data) {
  try {
    // Vérifier les autorisations
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    
    // Mettre à jour la section
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

/**
 * Supprime une section de menu
 * @param {number} userId - ID de l'utilisateur
 * @param {number} sectionId - ID de la section
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteSection(userId, sectionId) {
  try {
    // Vérifier les autorisations
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    
    // Vérifier s'il y a des produits dans la section
    const count = await prisma.produit.count({
      where: { id_section: Number(sectionId) }
    });
    
    if (count > 0) {
      return { success: false, error: 'La section contient des produits. Supprimez-les d\'abord.' };
    }
    
    // Supprimer la section
    await prisma.sectionMenu.delete({
      where: { id_section: Number(sectionId) }
    });
    
    return { success: true };
  } catch (err) {
    console.error('Erreur lors de la suppression de la section:', err);
    return { success: false, error: err.message };
  }
}
