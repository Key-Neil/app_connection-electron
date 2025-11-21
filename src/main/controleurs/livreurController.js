
const { getPrismaClient } = require('../utilitaires/prisma');
const prisma = getPrismaClient();
async function getDeliveries(userId) {
  try {
    const livraisons = await prisma.livraison.findMany({
      where: { id_livreur: Number(userId) },
      include: { commande: true },
    });
    return livraisons.map(l => ({
      id: l.id_livraison,
      statut: l.statut_livraison,
      commandeId: l.id_commande,
    }));
  } catch (err) {
    console.error('Erreur lors de la récupération des livraisons:', err);
    return [];
  }
}
async function getAvailableCommandes() {
  try {
    const commandes = await prisma.commande.findMany({
      include: {
        details_commande: { include: { produit: true } },
        livraison: true,
        client: true,
        restaurant: true,
      },
      orderBy: { date_commande: 'desc' },
    });
    const avail = commandes
      .filter(c => c.statut === 'Prête' && !c.livraison)
      .map(c => ({
        id: c.id_commande,
        date: c.date_commande,
        restaurant: c.restaurant
          ? { id: c.restaurant.id_restaurant, nom: c.restaurant.nom }
          : null,
        details: (c.details_commande || []).map(d => ({
          produit: d.produit
            ? { id: d.produit.id_produit, nom: d.produit.nom }
            : null,
          quantite: d.quantite,
        })),
        client: c.client
          ? { id: c.client.id_utilisateur, prenom: c.client.prenom }
          : null,
      }));
    return avail;
  } catch (err) {
    console.error('Erreur lors de la récupération des commandes disponibles:', err);
    return [];
  }
}
async function createLivraison(userId, commandeId) {
  try {
    const cmd = await prisma.commande.findUnique({
      where: { id_commande: Number(commandeId) },
      include: { livraison: true },
    });
    if (!cmd) return { success: false, error: 'Commande introuvable' };
    if (cmd.livraison) return { success: false, error: 'Livraison déjà assignée' };
    if (cmd.statut !== 'Prête')
      return { success: false, error: 'Commande pas prête pour livraison' };
    const created = await prisma.livraison.create({
      data: {
        id_commande: Number(commandeId),
        id_livreur: Number(userId),
        statut_livraison: 'Acceptée',
        heure_acceptation: new Date(),
      },
    });
    await prisma.commande.update({
      where: { id_commande: Number(commandeId) },
      data: { statut: 'En cours' },
    });
    return { success: true, livraisonId: created.id_livraison };
  } catch (err) {
    console.error('Erreur lors de la création de la livraison:', err);
    return { success: false, error: err.message };
  }
}
async function updateLivraisonStatus(userId, livraisonId, statut) {
  try {
    const liv = await prisma.livraison.findUnique({
      where: { id_livraison: Number(livraisonId) },
    });
    if (!liv) return { success: false, error: 'Livraison introuvable' };
    if (liv.id_livreur !== Number(userId))
      return { success: false, error: 'Accès non autorisé' };
    const updated = await prisma.livraison.update({
      where: { id_livraison: Number(livraisonId) },
      data: {
        statut_livraison: statut,
        heure_livraison_effective:
          statut === 'Livrée' ? new Date() : undefined,
      },
    });
    if (statut === 'Livrée') {
      await prisma.commande.update({
        where: { id_commande: liv.id_commande },
        data: { statut: 'Livrée' },
      });
    }
    return { success: true, livraison: { id: updated.id_livraison, statut: updated.statut_livraison } };
  } catch (err) {
    console.error('Erreur lors de la mise à jour du statut de livraison:', err);
    return { success: false, error: err.message };
  }
}
module.exports = {
  getDeliveries,
  getAvailableCommandes,
  createLivraison,
  updateLivraisonStatus,
};
