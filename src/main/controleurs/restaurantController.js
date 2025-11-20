// ============ CONTROLLER DE RESTAURANTS ============
const { getPrismaClient } = require('../utilitaires/prisma');
const { userHasAnyRole } = require('../utilitaires/auth');

const prisma = getPrismaClient();

/**
 * Récupère tous les restaurants avec leurs produits
 * @returns {Promise<Array>}
 */
async function getAllRestaurants() {
  try {
    const restos = await prisma.restaurant.findMany({
      include: { produits: true },
    });
    return restos.map(r => ({
      id: r.id_restaurant,
      nom: r.nom,
      adresse: r.adresse,
      telephone: r.telephone,
      produits: (r.produits || []).map(p => ({
        id: p.id_produit,
        nom: p.nom,
        prix: p.prix,
        description: p.description,
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
 * Ajoute un produit à un restaurant
 * @param {number} userId - ID de l'utilisateur
 * @param {number} restaurantId - ID du restaurant
 * @param {Object} produit - { nom, description, prix, image }
 * @returns {Promise<{success: boolean, produit?: Object, error?: string}>}
 */
async function addProduit(userId, restaurantId, produit) {
  try {
    // Vérifier les autorisations
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    
    // Créer le produit
    const prod = await prisma.produit.create({
      data: { ...produit, id_restaurant: Number(restaurantId) },
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
};
