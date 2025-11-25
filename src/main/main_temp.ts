const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const bcrypt = require('bcryptjs');
const { getPrismaClient } = require('./utilitaires/prisma');
const prisma = getPrismaClient();
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
async function userHasAnyRole(userId: number, allowedRoles: string[]): Promise<boolean> {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: Number(userId) },
      include: { utilisateur_roles: { include: { role: true } } },
    });
    if (!user) return false;
    const userRoleNames = (user.utilisateur_roles || []).map((ur: any) => ur.role.nom_role);
    return allowedRoles.some(role => userRoleNames.includes(role));
  } catch (err) {
    console.error('Erreur vérification rôles:', err);
    return false;
  }
}
ipcMain.handle('auth:register', async (event, data) => {
  const { nom, prenom, email, mot_de_passe } = data;
  try {
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });
    if (existingUser) {
      return { success: false, message: 'Cet email est déjà utilisé.' };
    }
    const mot_de_passe_hash = await hashPassword(mot_de_passe);
    const newUser = await prisma.utilisateur.create({
      data: { nom, prenom, email, mot_de_passe_hash },
    });
    await prisma.utilisateurRole.create({
      data: { id_utilisateur: newUser.id_utilisateur, id_role: 1 },
    });
    return { success: true, message: 'Compte créé avec succès !' };
  } catch (error) {
    console.error('Erreur inscription:', error);
    return { success: false, message: 'Erreur lors de la création du compte.' };
  }
});
ipcMain.handle('auth:login', async (event, data) => {
  const { email, mot_de_passe } = data;
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email },
      include: { utilisateur_roles: { include: { role: true } } },
    });
    if (!user) {
      return { success: false, message: 'Email ou mot de passe incorrect.' };
    }
    const isMatch = await comparePasswords(mot_de_passe, user.mot_de_passe_hash);
    if (!isMatch) {
      return { success: false, message: 'Email ou mot de passe incorrect.' };
    }
    return {
      success: true,
      message: `Bienvenue, ${user.prenom} !`,
      user: {
        id: user.id_utilisateur,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        roles: (user.utilisateur_roles || []).map((ur: any) => ur.role.nom_role),
      },
    };
  } catch (error) {
    console.error('Erreur connexion:', error);
    return { success: false, message: 'Erreur lors de la connexion.' };
  }
});
ipcMain.handle('restaurant:getAll', async () => {
  try {
    const restos = await prisma.restaurant.findMany({
      include: {
        sections: {
          include: { produits: true },
          orderBy: { ordre: 'asc' },
        },
      },
    });
    return restos.map((r: any) => ({
      id: r.id_restaurant,
      nom: r.nom,
      adresse: r.adresse,
      telephone: r.telephone,
      sections: (r.sections || []).map((s: any) => ({
        id: s.id_section,
        nom: s.nom,
        description: s.description,
        ordre: s.ordre,
        produits: (s.produits || []).map((p: any) => ({
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
    console.error('Erreur récupération restaurants:', err);
    return [];
  }
});
ipcMain.handle('restaurant:add', async (event, userId, data) => {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    const resto = await prisma.restaurant.create({ data });
    return { 
      success: true, 
      restaurant: { id: resto.id_restaurant, nom: resto.nom } 
    };
  } catch (err) {
    console.error('Erreur ajout restaurant:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('restaurant:delete', async (event, userId, id) => {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    await prisma.restaurant.delete({ 
      where: { id_restaurant: Number(id) } 
    });
    return { success: true };
  } catch (err) {
    console.error('Erreur suppression restaurant:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('restaurant:update', async (event, restaurantId, data) => {
  try {
    const updated = await prisma.restaurant.update({
      where: { id_restaurant: Number(restaurantId) },
      data,
    });
    return { 
      success: true, 
      restaurant: { id: updated.id_restaurant, nom: updated.nom } 
    };
  } catch (err) {
    console.error('Erreur mise à jour restaurant:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('restaurant:addProduit', async (event, userId, sectionId, produit) => {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    const section = await prisma.sectionMenu.findUnique({
      where: { id_section: Number(sectionId) },
    });
    if (!section) {
      return { success: false, error: 'Section non trouvée' };
    }
    const prod = await prisma.produit.create({
      data: {
        ...produit,
        id_restaurant: section.id_restaurant,
        id_section: Number(sectionId),
        prix: parseFloat(produit.prix),
      },
    });
    return { success: true, produit: { id: prod.id_produit, nom: prod.nom } };
  } catch (err) {
    console.error('Erreur ajout produit:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('restaurant:updateProduit', async (event, userId, produitId, data) => {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    const updated = await prisma.produit.update({
      where: { id_produit: Number(produitId) },
      data: { ...data, prix: parseFloat(data.prix) },
    });
    return { success: true, produit: { id: updated.id_produit, nom: updated.nom } };
  } catch (err) {
    console.error('Erreur modification produit:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('restaurant:deleteProduit', async (event, userId, produitId) => {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    await prisma.produit.delete({ 
      where: { id_produit: Number(produitId) } 
    });
    return { success: true };
  } catch (err) {
    console.error('Erreur suppression produit:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('restaurant:addSection', async (event, userId, restaurantId, data) => {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    const section = await prisma.sectionMenu.create({
      data: { ...data, id_restaurant: Number(restaurantId) },
    });
    return { success: true, section: { id: section.id_section, nom: section.nom } };
  } catch (err) {
    console.error('Erreur ajout section:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('restaurant:updateSection', async (event, userId, sectionId, data) => {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    const updated = await prisma.sectionMenu.update({
      where: { id_section: Number(sectionId) },
      data,
    });
    return { success: true, section: { id: updated.id_section, nom: updated.nom } };
  } catch (err) {
    console.error('Erreur modification section:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('restaurant:deleteSection', async (event, userId, sectionId) => {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) {
      return { success: false, error: 'Accès non autorisé' };
    }
    await prisma.sectionMenu.delete({ 
      where: { id_section: Number(sectionId) } 
    });
    return { success: true };
  } catch (err) {
    console.error('Erreur suppression section:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('commande:create', async (event, userId, payload) => {
  try {
    const { id_restaurant, produits } = payload;
    if (!userId) {
      return { success: false, error: 'Utilisateur non authentifié' };
    }
    const details = [];
    for (const p of produits || []) {
      const prod = await prisma.produit.findUnique({
        where: { id_produit: Number(p.id) },
      });
      details.push({
        id_produit: Number(p.id),
        quantite: Number(p.quantite || 1),
        prix_unitaire: prod ? prod.prix : 0,
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
    console.error('Erreur création commande:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('commande:getForClient', async (event, userId) => {
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
    return commandes.map((c: any) => ({
      id: c.id_commande,
      date: c.date_commande,
      statut: c.statut,
      restaurant: c.restaurant ? { 
        id: c.restaurant.id_restaurant, 
        nom: c.restaurant.nom 
      } : null,
      details: (c.details_commande || []).map((d: any) => ({
        produit: d.produit ? { 
          id: d.produit.id_produit, 
          nom: d.produit.nom 
        } : null,
        quantite: d.quantite,
        prix_unitaire: d.prix_unitaire,
      })),
      livraison: c.livraison ? { 
        id: c.livraison.id_livraison, 
        statut: c.livraison.statut_livraison 
      } : null,
    }));
  } catch (err) {
    console.error('Erreur récupération commandes client:', err);
    return [];
  }
});
ipcMain.handle('commande:getForCook', async (event, userId) => {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: Number(userId) },
      include: { utilisateur_roles: { include: { role: true } } },
    });
    const roleNames = (user?.utilisateur_roles || []).map((ur: any) => ur.role.nom_role);
    if (roleNames.includes('Cuisinier')) {
      const commandes = await prisma.commande.findMany({
        include: {
          details_commande: { include: { produit: true } },
          client: true,
        },
        orderBy: { date_commande: 'desc' },
      });
      return commandes.map((c: any) => ({
        id: c.id_commande,
        date: c.date_commande,
        statut: c.statut,
        client: c.client ? { 
          id: c.client.id_utilisateur, 
          prenom: c.client.prenom,
          nom: c.client.nom 
        } : null,
        details: (c.details_commande || []).map((d: any) => ({
          produit: d.produit ? { 
            id: d.produit.id_produit, 
            nom: d.produit.nom 
          } : null,
          quantite: d.quantite,
        })),
      }));
    }
    const restos = await prisma.restaurant.findMany({
      where: { staff_restaurants: { some: { id_utilisateur: Number(userId) } } },
    });
    const restoIds = restos.map(r => r.id_restaurant);
    if (restoIds.length === 0) return [];
    const commandes = await prisma.commande.findMany({
      where: { id_restaurant: { in: restoIds } },
      include: {
        details_commande: { include: { produit: true } },
        client: true,
      },
      orderBy: { date_commande: 'desc' },
    });
    return commandes.map((c: any) => ({
      id: c.id_commande,
      date: c.date_commande,
      statut: c.statut,
      client: c.client ? { 
        id: c.client.id_utilisateur, 
        prenom: c.client.prenom,
        nom: c.client.nom 
      } : null,
      details: (c.details_commande || []).map((d: any) => ({
        produit: d.produit ? { 
          id: d.produit.id_produit, 
          nom: d.produit.nom 
        } : null,
        quantite: d.quantite,
      })),
    }));
  } catch (err) {
    console.error('Erreur récupération commandes cuisinier:', err);
    return [];
  }
});
ipcMain.handle('commande:updateStatus', async (event, userId, commandeId, statut) => {
  try {
    const cmd = await prisma.commande.findUnique({
      where: { id_commande: Number(commandeId) },
      include: { restaurant: true },
    });
    if (!cmd) {
      return { success: false, error: 'Commande introuvable' };
    }
    const user = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: Number(userId) },
      include: { utilisateur_roles: { include: { role: true } } },
    });
    const roleNames = (user?.utilisateur_roles || []).map((ur: any) => ur.role.nom_role);
    const hasGlobal = roleNames.includes('Cuisinier');
    if (!hasGlobal) {
      const userRestos = await prisma.restaurant.findMany({
        where: { staff_restaurants: { some: { id_utilisateur: Number(userId) } } },
      });
      const hasAccess = userRestos.some(r => r.id_restaurant === cmd.id_restaurant);
      if (!hasAccess) {
        return { success: false, error: 'Accès non autorisé' };
      }
    }
    const updated = await prisma.commande.update({
      where: { id_commande: Number(commandeId) },
      data: { statut },
    });
    return { 
      success: true, 
      commande: { id: updated.id_commande, statut: updated.statut } 
    };
  } catch (err) {
    console.error('Erreur mise à jour statut commande:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('livraison:getForLivreur', async (event, userId) => {
  try {
    const livraisons = await prisma.livraison.findMany({
      where: { id_livreur: Number(userId) },
      include: { 
        commande: {
          include: {
            restaurant: true,
            client: true,
          }
        } 
      },
      orderBy: { heure_acceptation: 'desc' },
    });
    return livraisons.map((l: any) => ({
      id: l.id_livraison,
      statut: l.statut_livraison,
      commandeId: l.id_commande,
      commande: l.commande ? {
        id: l.commande.id_commande,
        restaurant: l.commande.restaurant ? {
          nom: l.commande.restaurant.nom,
          adresse: l.commande.restaurant.adresse,
        } : null,
        client: l.commande.client ? {
          prenom: l.commande.client.prenom,
          nom: l.commande.client.nom,
        } : null,
      } : null,
    }));
  } catch (err) {
    console.error('Erreur récupération livraisons:', err);
    return [];
  }
});
ipcMain.handle('livraison:getAvailableCommandes', async () => {
  try {
    const commandes = await prisma.commande.findMany({
      where: {
        statut: 'Prête',
        livraison: null, // Pas encore de livraison assignée
      },
      include: {
        details_commande: { include: { produit: true } },
        restaurant: true,
        client: true,
      },
      orderBy: { date_commande: 'desc' },
    });
    return commandes.map((c: any) => ({
      id: c.id_commande,
      date: c.date_commande,
      restaurant: c.restaurant ? { 
        id: c.restaurant.id_restaurant, 
        nom: c.restaurant.nom,
        adresse: c.restaurant.adresse,
      } : null,
      client: c.client ? { 
        id: c.client.id_utilisateur, 
        prenom: c.client.prenom 
      } : null,
      details: (c.details_commande || []).map((d: any) => ({
        produit: d.produit ? { 
          id: d.produit.id_produit, 
          nom: d.produit.nom 
        } : null,
        quantite: d.quantite,
      })),
    }));
  } catch (err) {
    console.error('Erreur récupération commandes disponibles:', err);
    return [];
  }
});
ipcMain.handle('livraison:create', async (event, userId, commandeId) => {
  try {
    const cmd = await prisma.commande.findUnique({
      where: { id_commande: Number(commandeId) },
      include: { livraison: true },
    });
    if (!cmd) {
      return { success: false, error: 'Commande introuvable' };
    }
    if (cmd.livraison) {
      return { success: false, error: 'Livraison déjà assignée' };
    }
    if (cmd.statut !== 'Prête') {
      return { success: false, error: 'Commande pas prête pour livraison' };
    }
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
    console.error('Erreur création livraison:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('livraison:updateStatus', async (event, userId, livraisonId, statut) => {
  try {
    const liv = await prisma.livraison.findUnique({
      where: { id_livraison: Number(livraisonId) },
    });
    if (!liv) {
      return { success: false, error: 'Livraison introuvable' };
    }
    if (liv.id_livreur !== Number(userId)) {
      return { success: false, error: 'Accès non autorisé' };
    }
    const updated = await prisma.livraison.update({
      where: { id_livraison: Number(livraisonId) },
      data: {
        statut_livraison: statut,
        heure_livraison_effective: statut === 'Livrée' ? new Date() : undefined,
      },
    });
    if (statut === 'Livrée') {
      await prisma.commande.update({
        where: { id_commande: liv.id_commande },
        data: { statut: 'Livrée' },
      });
    }
    return { 
      success: true, 
      livraison: { id: updated.id_livraison, statut: updated.statut_livraison } 
    };
  } catch (err) {
    console.error('Erreur mise à jour livraison:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('admin:getRoles', async () => {
  try {
    const roles = await prisma.role.findMany({ 
      orderBy: { id_role: 'asc' } 
    });
    return roles.map((r: any) => ({ 
      id: r.id_role, 
      nom: r.nom_role 
    }));
  } catch (err) {
    console.error('Erreur récupération rôles:', err);
    return [];
  }
});
ipcMain.handle('admin:getUsers', async () => {
  try {
    const users = await prisma.utilisateur.findMany({
      include: { utilisateur_roles: { include: { role: true } } },
    });
    return users.map((u: any) => ({
      id: u.id_utilisateur,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      roles: (u.utilisateur_roles || []).map((ur: any) => ur.role.nom_role),
    }));
  } catch (err) {
    console.error('Erreur récupération utilisateurs:', err);
    return [];
  }
});
ipcMain.handle('admin:setRoles', async (event, userId, roleNames) => {
  try {
    const roles = await prisma.role.findMany({
      where: { nom_role: { in: roleNames } },
    });
    await prisma.utilisateurRole.deleteMany({
      where: { id_utilisateur: Number(userId) },
    });
    await prisma.utilisateurRole.createMany({
      data: roles.map((r: any) => ({
        id_utilisateur: Number(userId),
        id_role: r.id_role,
      })),
    });
    return { success: true };
  } catch (err) {
    console.error('Erreur attribution rôles:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('admin:addStaffToRestaurant', async (event, staffUserId, restaurantId) => {
  try {
    await prisma.staffRestaurant.create({
      data: {
        id_utilisateur: Number(staffUserId),
        id_restaurant: Number(restaurantId),
      },
    });
    return { success: true };
  } catch (err) {
    console.error('Erreur rattachement staff:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('admin:removeStaffFromRestaurant', async (event, staffUserId, restaurantId) => {
  try {
    await prisma.staffRestaurant.delete({
      where: {
        id_utilisateur_id_restaurant: {
          id_utilisateur: Number(staffUserId),
          id_restaurant: Number(restaurantId),
        },
      },
    });
    return { success: true };
  } catch (err) {
    console.error('Erreur détachement staff:', err);
    return { success: false, error: err.message };
  }
});
ipcMain.handle('user:getProfile', async (event, userId) => {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: Number(userId) },
      include: { utilisateur_roles: { include: { role: true } } },
    });
    if (!user) return null;
    return {
      id: user.id_utilisateur,
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      roles: (user.utilisateur_roles || []).map((ur: any) => ur.role.nom_role),
    };
  } catch (err) {
    console.error('Erreur récupération profil:', err);
    return null;
  }
});
ipcMain.handle('cook:getRestaurants', async (event, userId) => {
  try {
    const restos = await prisma.restaurant.findMany({
      where: { 
        staff_restaurants: { 
          some: { id_utilisateur: Number(userId) } 
        } 
      },
    });
    return restos.map((r: any) => ({
      id: r.id_restaurant,
      nom: r.nom,
      adresse: r.adresse,
      telephone: r.telephone,
    }));
  } catch (err) {
    console.error('Erreur récupération restaurants cuisinier:', err);
    return [];
  }
});
export {};
