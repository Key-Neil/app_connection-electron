
const { getPrismaClient } = require('../utilitaires/prisma');
const { userHasAnyRole } = require('../utilitaires/auth');
const prisma = getPrismaClient();
async function getCommandes(userId) {
  try {
    const u = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: Number(userId) },
      include: { roles: true },
    });
    const roleNames = (u && u.roles) || [];
    const roleNameStrings = roleNames.map(r => r.nom_role);
    if (roleNameStrings.includes('Cuisinier')) {
      const commandes = await prisma.commande.findMany({
        include: {
          details_commande: { include: { produit: true } },
          client: true,
        },
        orderBy: { date_commande: 'desc' },
      });
      return commandes.map(c => ({
        id: c.id_commande,
        date: c.date_commande,
        statut: c.statut,
        client: c.client
          ? { id: c.client.id_utilisateur, prenom: c.client.prenom, nom: c.client.nom }
          : null,
        details: (c.details_commande || []).map(d => ({
          produit: d.produit
            ? { id: d.produit.id_produit, nom: d.produit.nom }
            : null,
          quantite: d.quantite,
        })),
      }));
    }
    const allRestos = await prisma.restaurant.findMany();
    const perRestoIds = allRestos
      .filter(r => roleNameStrings.includes(r.nom))
      .map(r => r.id_restaurant);
    let restoIds = perRestoIds;
    if (restoIds.length === 0) {
      const restos = await prisma.restaurant.findMany({
        where: { staff: { some: { id_utilisateur: Number(userId) } } },
      });
      restoIds = restos.map(r => r.id_restaurant);
    }
    if (restoIds.length === 0) return [];
    const commandes = await prisma.commande.findMany({
      where: { id_restaurant: { in: restoIds } },
      include: { details_commande: { include: { produit: true } }, client: true },
      orderBy: { date_commande: 'desc' },
    });
    return commandes.map(c => ({
      id: c.id_commande,
      date: c.date_commande,
      statut: c.statut,
      client: c.client
        ? { id: c.client.id_utilisateur, prenom: c.client.prenom, nom: c.client.nom }
        : null,
      details: (c.details_commande || []).map(d => ({
        produit: d.produit
          ? { id: d.produit.id_produit, nom: d.produit.nom }
          : null,
        quantite: d.quantite,
      })),
    }));
  } catch (err) {
    console.error('Erreur lors de la récupération des commandes du cuisinier:', err);
    return [];
  }
}
async function updateCommandeStatus(userId, commandeId, statut) {
  try {
    const cmd = await prisma.commande.findUnique({
      where: { id_commande: Number(commandeId) },
      include: { restaurant: true },
    });
    if (!cmd) return { success: false, error: 'Commande introuvable' };
    const u = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: Number(userId) },
      include: { roles: true },
    });
    const roleNames = (u && u.roles || []).map(r => r.nom_role);
    const hasGlobal = roleNames.includes('Cuisinier');
    const inPerRole = cmd.restaurant && roleNames.includes(cmd.restaurant.nom);
    if (!(hasGlobal || inPerRole)) {
      return { success: false, error: 'Accès non autorisé' };
    }
    const updated = await prisma.commande.update({
      where: { id_commande: Number(commandeId) },
      data: { statut },
    });
    return { success: true, commande: { id: updated.id_commande, statut: updated.statut } };
  } catch (err) {
    console.error('Erreur lors de la mise à jour du statut de la commande:', err);
    return { success: false, error: err.message };
  }
}
module.exports = {
  getCommandes,
  updateCommandeStatus,
};

export {};
