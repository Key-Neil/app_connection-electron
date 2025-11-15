const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new (require('@prisma/client').PrismaClient)();

// --- Helpers ---
async function userHasAnyRole(userId, allowedRoles) {
  try {
    const u = await prisma.utilisateur.findUnique({ where: { id_utilisateur: Number(userId) }, include: { roles: true } });
    if (!u) return false;
    const names = (u.roles || []).map(r => r.nom_role);
    return allowedRoles.some(ar => names.includes(ar));
  } catch (err) {
    console.error('role check error', err);
    return false;
  }
}

// --- Restaurants (client + admin/cuisinier) ---
// Liste tous les restaurants avec leurs menus
ipcMain.handle('restaurant:getAll', async () => {
  try {
    const restos = await prisma.restaurant.findMany({
      include: { produits: true }
    });
    return restos.map(r => ({
      id: r.id_restaurant,
      nom: r.nom,
      adresse: r.adresse,
      telephone: r.telephone,
      produits: (r.produits||[]).map(p => ({
        id: p.id_produit,
        nom: p.nom,
        prix: p.prix,
        description: p.description
      }))
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
});

// Ajouter un restaurant
ipcMain.handle('restaurant:add', async (event, userId, data) => {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) return { success: false, error: 'Unauthorized' };
    const resto = await prisma.restaurant.create({ data });
    // créer un rôle spécifique pour ce restaurant (nom du rôle = nom du restaurant)
    try {
      const roleName = `${resto.nom}`;
      const existing = await prisma.role.findUnique({ where: { nom_role: roleName } }).catch(()=>null);
      if (!existing) {
        await prisma.role.create({ data: { nom_role: roleName } });
      }
    } catch (err) { console.error('role create error', err); }
    return { success: true, restaurant: { id: resto.id_restaurant, nom: resto.nom } };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});

// Supprimer un restaurant
ipcMain.handle('restaurant:delete', async (event, userId, id) => {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) return { success: false, error: 'Unauthorized' };
    // récupérer le nom du restaurant pour supprimer le rôle associé
    const resto = await prisma.restaurant.findUnique({ where: { id_restaurant: Number(id) } });
    const restoName = resto ? resto.nom : null;
    await prisma.restaurant.delete({ where: { id_restaurant: Number(id) } });
    // supprimer le rôle associé (nom = nom du restaurant) s'il existe
    try {
      if (restoName) await prisma.role.deleteMany({ where: { nom_role: restoName } });
    } catch (err) { console.error('role delete error', err); }
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});

// Ajouter un menu/produit à un restaurant
ipcMain.handle('restaurant:addProduit', async (event, userId, restaurantId, produit) => {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) return { success: false, error: 'Unauthorized' };
    const prod = await prisma.produit.create({ data: { ...produit, id_restaurant: Number(restaurantId) } });
    return { success: true, produit: { id: prod.id_produit, nom: prod.nom } };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});

// Modifier un menu/produit
ipcMain.handle('restaurant:updateProduit', async (event, userId, produitId, data) => {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) return { success: false, error: 'Unauthorized' };
    const prod = await prisma.produit.update({ where: { id_produit: Number(produitId) }, data });
    return { success: true, produit: { id: prod.id_produit, nom: prod.nom } };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});

// Supprimer un menu/produit
ipcMain.handle('restaurant:deleteProduit', async (event, userId, produitId) => {
  try {
    if (!await userHasAnyRole(userId, ['Admin', 'Cuisinier'])) return { success: false, error: 'Unauthorized' };
    await prisma.produit.delete({ where: { id_produit: Number(produitId) } });
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});

// --- Commandes ---
ipcMain.handle('commande:create', async (event, userId, payload) => {
  try {
    const { id_restaurant, produits } = payload;
    if (!userId) return { success: false, error: 'Utilisateur non authentifié' };
    // Construire les détails en récupérant les prix actuels
    const details = [];
    for (const p of (produits || [])) {
      const prod = await prisma.produit.findUnique({ where: { id_produit: Number(p.id) } });
      const prix = (payload.free ? 0 : (prod ? prod.prix : 0));
      details.push({ id_produit: Number(p.id), quantite: Number(p.quantite || 1), prix_unitaire: prix });
    }
    const created = await prisma.commande.create({
      data: {
        statut: 'En attente',
        id_client: Number(userId),
        id_restaurant: Number(id_restaurant),
        details_commande: { create: details }
      }
    });
    return { success: true, commandeId: created.id_commande };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
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

ipcMain.handle('auth:register', async (event, data) => {
  const { nom, prenom, email, mot_de_passe } = data;

  try {
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return { success: false, message: 'Cet email est déjà utilisé.' };
    }

    const salt = await bcrypt.genSalt(10);
    const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, salt);

    const newUser = await prisma.utilisateur.create({
      data: {
        nom: nom,
        prenom: prenom,
        email: email,
        mot_de_passe_hash: mot_de_passe_hash,
      },
    });

    await prisma.utilisateur.update({
      where: { id_utilisateur: newUser.id_utilisateur },
      data: {
        roles: {
          connect: { id_role: 1 },
        },
      },
    });

    return { success: true, message: 'Compte créé avec succès !' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Erreur lors de la création du compte.' };
  }
});

ipcMain.handle('auth:login', async (event, data) => {
  const { email, mot_de_passe } = data;

  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email: email },
      include: { roles: true },
    });

    if (!user) {
      return { success: false, message: 'Email ou mot de passe incorrect.' };
    }

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);

    if (!isMatch) {
      return { success: false, message: 'Email ou mot de passe incorrect.' };
    }

    // Préparer un objet user sûr à renvoyer au renderer (sans mot_de_passe_hash)
    const safeUser = {
      id: user.id_utilisateur,
      prenom: user.prenom,
      email: user.email,
      roles: (user.roles || []).map(r => r.nom_role),
    };

    return { success: true, message: `Bienvenue, ${user.prenom} !`, user: safeUser };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Erreur lors de la connexion.' };
  }
});

// Récupère le profil utilisateur minimal
ipcMain.handle('user:getProfile', async (event, userId) => {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: Number(userId) },
      include: { roles: true },
      select: {
        id_utilisateur: true,
        prenom: true,
        email: true,
        roles: true,
      }
    });
    if (!user) return null;
    return {
      id: user.id_utilisateur,
      prenom: user.prenom,
      email: user.email,
      roles: (user.roles || []).map(r => r.nom_role),
    };
  } catch (err) {
    console.error(err);
    return null;
  }
});

// Récupère les commandes du client
ipcMain.handle('user:getCommandes', async (event, userId) => {
  try {
    const commandes = await prisma.commande.findMany({
      where: { id_client: Number(userId) },
      include: {
        restaurant: true,
        details_commande: { include: { produit: true } },
        livraison: true,
      },
      orderBy: { date_commande: 'desc' }
    });

    // Mapper pour renvoyer une structure simple
    return commandes.map(c => ({
      id: c.id_commande,
      date: c.date_commande,
      statut: c.statut,
      restaurant: c.restaurant ? { id: c.restaurant.id_restaurant, nom: c.restaurant.nom } : null,
      details: (c.details_commande || []).map(d => ({ produit: d.produit ? { id: d.produit.id_produit, nom: d.produit.nom } : null, quantite: d.quantite, prix_unitaire: d.prix_unitaire })),
      livraison: c.livraison ? { id: c.livraison.id_livraison, statut: c.livraison.statut_livraison } : null,
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
});

// --- Admin endpoints ---
ipcMain.handle('admin:getRoles', async () => {
  try {
    const roles = await prisma.role.findMany({ orderBy: { id_role: 'asc' } });
    return roles.map(r => ({ id: r.id_role, nom: r.nom_role }));
  } catch (err) {
    console.error(err);
    return [];
  }
});

ipcMain.handle('admin:getUsers', async () => {
  try {
    const users = await prisma.utilisateur.findMany({ include: { roles: true } });
    return users.map(u => ({ id: u.id_utilisateur, nom: u.nom, prenom: u.prenom, email: u.email, roles: (u.roles||[]).map(r=>r.nom_role)}));
  } catch (err) {
    console.error(err);
    return [];
  }
});

ipcMain.handle('admin:setRoles', async (event, userId, roleNames) => {
  try {
    // roleNames : array of role name strings to assign
    const roles = await prisma.role.findMany({ where: { nom_role: { in: roleNames } } });
    const roleConnect = roles.map(r => ({ id_role: r.id_role }));

    await prisma.utilisateur.update({
      where: { id_utilisateur: Number(userId) },
      data: {
        roles: {
          set: [],
          connect: roleConnect,
        }
      }
    });
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});

// --- Cuisinier (cook) endpoints ---
ipcMain.handle('cook:getRestaurants', async (event, userId) => {
  try {
    // return restaurants where the user is staff
    const restos = await prisma.restaurant.findMany({
      where: { staff: { some: { id_utilisateur: Number(userId) } } }
    });
    return restos.map(r => ({ id: r.id_restaurant, nom: r.nom, adresse: r.adresse, telephone: r.telephone }));
  } catch (err) {
    console.error(err);
    return [];
  }
});

// Récupérer commandes pour le cuisinier (restaurants où il est staff)
ipcMain.handle('cook:getCommandes', async (event, userId) => {
  try {
    // Si l'utilisateur a le rôle global 'Cuisinier', il voit toutes les commandes
    const u = await prisma.utilisateur.findUnique({ where: { id_utilisateur: Number(userId) }, include: { roles: true } });
    const roleNames = (u && u.roles || []).map(r => r.nom_role);
    if (roleNames.includes('Cuisinier')) {
      const commandes = await prisma.commande.findMany({ include: { details_commande: { include: { produit: true } }, client: true }, orderBy: { date_commande: 'desc' } });
      return commandes.map(c => ({
        id: c.id_commande,
        date: c.date_commande,
        statut: c.statut,
        client: c.client ? { id: c.client.id_utilisateur, prenom: c.client.prenom, nom: c.client.nom } : null,
        details: (c.details_commande||[]).map(d=>({ produit: d.produit ? { id: d.produit.id_produit, nom: d.produit.nom } : null, quantite: d.quantite }))
      }));
    }
    // sinon, regarder si l'utilisateur possède des rôles correspondant au nom des restaurants
    // role names may include restaurant names: collect restaurants whose name matches a role
    const allRestos = await prisma.restaurant.findMany();
    const perRestoIds = allRestos.filter(r => roleNames.includes(r.nom)).map(r => r.id_restaurant);
    let restoIds = perRestoIds;
    // si aucun rôle per-restaurant, garder le comportement staff existant
    if (restoIds.length === 0) {
      const restos = await prisma.restaurant.findMany({ where: { staff: { some: { id_utilisateur: Number(userId) } } } });
      restoIds = restos.map(r => r.id_restaurant);
    }
    if (restoIds.length === 0) return [];
    const commandes = await prisma.commande.findMany({
      where: { id_restaurant: { in: restoIds } },
      include: { details_commande: { include: { produit: true } }, client: true },
      orderBy: { date_commande: 'desc' }
    });
    return commandes.map(c => ({
      id: c.id_commande,
      date: c.date_commande,
      statut: c.statut,
      client: c.client ? { id: c.client.id_utilisateur, prenom: c.client.prenom, nom: c.client.nom } : null,
      details: (c.details_commande||[]).map(d=>({ produit: d.produit ? { id: d.produit.id_produit, nom: d.produit.nom } : null, quantite: d.quantite }))
    }));
  } catch (err) { console.error(err); return []; }
});

// Mettre à jour le statut d'une commande (cuisinier) — vérifie que le cuisinier appartient au restaurant
ipcMain.handle('cook:updateCommandeStatus', async (event, userId, commandeId, statut) => {
  try {
    const cmd = await prisma.commande.findUnique({ where: { id_commande: Number(commandeId) }, include: { restaurant: { include: { staff: true } } } });
    if (!cmd) return { success: false, error: 'Commande introuvable' };
    // autoriser si user a rôle global 'Cuisinier' ou rôle per-restaurant (nom du resto) ou fait partie du staff
    const u = await prisma.utilisateur.findUnique({ where: { id_utilisateur: Number(userId) }, include: { roles: true } });
    const roleNames = (u && u.roles || []).map(r => r.nom_role);
    const hasGlobal = roleNames.includes('Cuisinier');
    const inPerRole = cmd.restaurant && roleNames.includes(cmd.restaurant.nom);
    const staffIds = (cmd.restaurant.staff || []).map(s => s.id_utilisateur);
    if (!(hasGlobal || inPerRole || staffIds.includes(Number(userId)))) return { success: false, error: 'Unauthorized' };
    const updated = await prisma.commande.update({ where: { id_commande: Number(commandeId) }, data: { statut } });
    return { success: true, commande: { id: updated.id_commande, statut: updated.statut } };
  } catch (err) { console.error(err); return { success: false, error: err.message }; }
});

ipcMain.handle('cook:updateRestaurant', async (event, restaurantId, data) => {
  try {
    const updated = await prisma.restaurant.update({ where: { id_restaurant: Number(restaurantId) }, data });
    return { success: true, restaurant: { id: updated.id_restaurant, nom: updated.nom } };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});

// --- Livreur endpoints ---
ipcMain.handle('livreur:getDeliveries', async (event, userId) => {
  try {
    const livraisons = await prisma.livraison.findMany({ where: { id_livreur: Number(userId) }, include: { commande: true } });
    return livraisons.map(l => ({ id: l.id_livraison, statut: l.statut_livraison, commandeId: l.id_commande }));
  } catch (err) {
    console.error(err);
    return [];
  }
});

ipcMain.handle('livreur:getAvailableCommandes', async () => {
  try {
    const commandes = await prisma.commande.findMany({ include: { details_commande: { include: { produit: true } }, livraison: true, client: true, restaurant: true }, orderBy: { date_commande: 'desc' } });
    const avail = commandes.filter(c => c.statut === 'Prête' && !c.livraison).map(c => ({ id: c.id_commande, date: c.date_commande, restaurant: c.restaurant ? { id: c.restaurant.id_restaurant, nom: c.restaurant.nom } : null, details: (c.details_commande||[]).map(d=>({ produit: d.produit ? { id: d.produit.id_produit, nom: d.produit.nom } : null, quantite: d.quantite })), client: c.client ? { id: c.client.id_utilisateur, prenom: c.client.prenom } : null }));
    return avail;
  } catch (err) { console.error(err); return []; }
});

ipcMain.handle('livreur:createLivraison', async (event, userId, commandeId) => {
  try {
    const cmd = await prisma.commande.findUnique({ where: { id_commande: Number(commandeId) }, include: { livraison: true } });
    if (!cmd) return { success: false, error: 'Commande introuvable' };
    if (cmd.livraison) return { success: false, error: 'Déjà assignée' };
    if (cmd.statut !== 'Prête') return { success: false, error: 'Commande pas prête' };
    const created = await prisma.livraison.create({ data: { id_commande: Number(commandeId), id_livreur: Number(userId), statut_livraison: 'Acceptée', heure_acceptation: new Date() } });
    // marquer la commande comme en cours
    await prisma.commande.update({ where: { id_commande: Number(commandeId) }, data: { statut: 'En cours' } });
    return { success: true, livraisonId: created.id_livraison };
  } catch (err) { console.error(err); return { success: false, error: err.message }; }
});

ipcMain.handle('livreur:updateLivraisonStatus', async (event, userId, livraisonId, statut) => {
  try {
    // vérifier que le livreur est bien le propriétaire de la livraison
    const liv = await prisma.livraison.findUnique({ where: { id_livraison: Number(livraisonId) } });
    if (!liv) return { success: false, error: 'Livraison introuvable' };
    if (liv.id_livreur !== Number(userId)) return { success: false, error: 'Unauthorized' };
    const updated = await prisma.livraison.update({ where: { id_livraison: Number(livraisonId) }, data: { statut_livraison: statut, heure_livraison_effective: statut === 'Livrée' ? new Date() : undefined } });
    // si livrée, mettre à jour la commande
    if (statut === 'Livrée') {
      await prisma.commande.update({ where: { id_commande: liv.id_commande }, data: { statut: 'Livrée' } });
    }
    return { success: true, livraison: { id: updated.id_livraison, statut: updated.statut_livraison } };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
});
