
const { getPrismaClient } = require('../utilitaires/prisma');
const { userHasAnyRole } = require('../utilitaires/auth');
const prisma = getPrismaClient();
async function createCommande(userId, payload) {
  try {
    const { id_restaurant, produits } = payload;
    if (!userId) return { success: false, error: 'Utilisateur non authentifié' };
    const details = [];
    for (const p of produits || []) {
      const prod = await prisma.produit.findUnique({
        where: { id_produit: Number(p.id) },
      });
      const prix = payload.free ? 0 : prod ? prod.prix : 0;
      details.push({
        id_produit: Number(p.id),
        quantite: Number(p.quantite || 1),
        prix_unitaire: prix,
      });
    }
    const created = await prisma.commande.create({
      data: {
        statut: 'En attente',
        id_client: Number(userId),
        id_restaurant: Number(id_restaurant),
        details_commande: { create: details },
      },
    });
    return { success: true, commandeId: created.id_commande };
  } catch (err) {
    console.error('Erreur lors de la création de la commande:', err);
    return { success: false, error: err.message };
  }
}
async function getCommandes(userId) {
  try {
    const commandes = await prisma.commande.findMany({
      where: { id_client: Number(userId) },
      include: {
        restaurant: true,
        details_commande: { include: { produit: true } },
        livraison: true,
      },
      orderBy: { date_commande: 'desc' },
    });
    return commandes.map(c => ({
      id: c.id_commande,
      date: c.date_commande,
      statut: c.statut,
      restaurant: c.restaurant
        ? { id: c.restaurant.id_restaurant, nom: c.restaurant.nom }
        : null,
      details: (c.details_commande || []).map(d => ({
        produit: d.produit ? { id: d.produit.id_produit, nom: d.produit.nom } : null,
        quantite: d.quantite,
        prix_unitaire: d.prix_unitaire,
      })),
      livraison: c.livraison
        ? { id: c.livraison.id_livraison, statut: c.livraison.statut_livraison }
        : null,
    }));
  } catch (err) {
    console.error('Erreur lors de la récupération des commandes:', err);
    return [];
  }
}
module.exports = {
  createCommande,
  getCommandes,
};
